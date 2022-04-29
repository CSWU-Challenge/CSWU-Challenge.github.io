# 输入流水线性能指南

GPU 和 TPU 可以从根本上减少执行单个训练步骤所需的时间。实现最佳性能需要一个高效的输入流水线，在当前步骤完成之前为下一步提供数据。[`tf.data`](https://www.tensorflow.org/api_docs/python/tf/data)API 有助于构建灵活高效的输入流水线。本文档解释了[`tf.data`](https://www.tensorflow.org/api_docs/python/tf/data)API 的功能和最佳实践，用于跨各种模型和加速器构建高性能 TensorFlow 输入流水线。

本指南执行以下操作：

- 说明 TensorFlow 输入流水线本质上是一个[ETL](https://en.wikipedia.org/wiki/Extract,_transform,_load)过程。
- 描述[`tf.data`](https://www.tensorflow.org/api_docs/python/tf/data)API 上下文中的常见性能优化。
- 讨论应用转换的顺序对性能的影响。
- 总结了设计高性能 TensorFlow 输入流水线的最佳实践。

## 输入流水线结构

一个典型的 TensorFlow 训练输入流水线可以构建为一个 ETL 过程：

1. **提取**：从持久存储中读取数据——本地（例如 HDD 或 SSD）或远程（例如[GCS](https://cloud.google.com/storage/)或[HDFS](https://en.wikipedia.org/wiki/Apache_Hadoop#Hadoop_distributed_file_system)）。
2. **变换**：使用 CPU 内核对数据进行解析和预处理操作，例如图像解压缩、数据增强变换（如随机裁剪、翻转和颜色失真）、`shuffle`和批处理。
3. **加载**：将转换后的数据加载到执行机器学习模型的加速器设备（例如 GPU 或 TPU）上。

这种模式有效地利用了 CPU，同时为训练模型的繁重工作保留了加速器。此外，将输入流水线视为 ETL 过程提供了有助于应用性能优化的结构。

使用[`tf.estimator.Estimator`](https://www.tensorflow.org/api_docs/python/tf/estimator/Estimator)API 时，前两个阶段（提取和转换）在`input_fn`传递给[`tf.estimator.Estimator.train`](https://www.tensorflow.org/api_docs/python/tf/estimator/BaselineClassifier#train). 在代码中，这可能看起来像以下（幼稚的、顺序的）实现：

```python
def parse_fn(example):
  "Parse TFExample records and perform simple data augmentation."
  example_fmt = {
    "image": tf.FixedLengthFeature((), tf.string, ""),
    "label": tf.FixedLengthFeature((), tf.int64, -1)
  }
  parsed = tf.parse_single_example(example, example_fmt)
  image = tf.image.decode_image(parsed["image"])
  image = _augment_helper(image)  # augments image using slice, reshape, resize_bilinear
  return image, parsed["label"]

def input_fn():
  files = tf.data.Dataset.list_files("/path/to/dataset/train-*.tfrecord")
  dataset = files.interleave(tf.data.TFRecordDataset)
  dataset = dataset.shuffle(buffer_size=FLAGS.shuffle_buffer_size)
  dataset = dataset.map(map_func=parse_fn)
  dataset = dataset.batch(batch_size=FLAGS.batch_size)
  return dataset
```

下一部分基于此输入流水线，添加性能优化。

## 优化性能

随着新的计算设备（如 GPU 和 TPU）使得以越来越快的速度训练神经网络成为可能，CPU 处理很容易成为瓶颈。API 为用户提供构建块来设计有效利用 CPU的[`tf.data`](https://www.tensorflow.org/api_docs/python/tf/data)输入流水线，优化 ETL 过程的每个步骤。

### 流水线

要执行训练步骤，您必须首先提取和转换训练数据，然后将其提供给在加速器上运行的模型。然而，在一个简单的同步实现中，当 CPU 准备数据时，加速器处于空闲状态。相反，当加速器训练模型时，CPU 处于空闲状态。因此，训练步骤时间是 CPU 预处理时间和加速器训练时间的总和。

**流水线**与训练步骤的预处理和模型执行重叠。当加速器执行训练 step`N`时，CPU 正在为 step 准备数据`N+1`。这样做可以将训练的最大步骤时间（而不是总和）以及提取和转换数据所需的时间减少。

如果没有流水线，CPU 和 GPU/TPU 大部分时间都处于空闲状态：

![without pipelining](https://img.zsaqwq.com/images/2022/04/28/1-1.png)

使用流水线，空闲时间显着减少：

![with pipelining](https://img.zsaqwq.com/images/2022/04/28/1-2.png)

API通过转换[`tf.data`](https://www.tensorflow.org/api_docs/python/tf/data)提供了一种软件流水线机制[`tf.data.Dataset.prefetch`](https://www.tensorflow.org/api_docs/python/tf/data/Dataset#prefetch)，可以用来解耦数据产生的时间和消费的时间。特别是，转换使用后台线程和内部缓冲区在请求元素之前从输入数据集中预取元素。因此，要实现上述流水线效果，您可以将`prefetch(1)`最终转换添加到数据集流水线中（或者`prefetch(n)`如果单个训练步骤消耗 n 个元素）。

要将此更改应用于我们正在运行的示例，请更改：

```python
dataset = dataset.batch(batch_size=FLAGS.batch_size)
return dataset
```

为：

```python
dataset = dataset.batch(batch_size=FLAGS.batch_size)
dataset = dataset.prefetch(buffer_size=FLAGS.prefetch_buffer_size)
return dataset
```

请注意，只要有机会将“生产者”的工作与“消费者”的工作重叠，预取转换就会产生好处。前面的建议只是最常见的应用。

### 并行化数据转换

准备批次时，可能需要对输入元素进行预处理。为此，[`tf.data`](https://www.tensorflow.org/api_docs/python/tf/data)API 提供了[`tf.data.Dataset.map`](https://www.tensorflow.org/api_docs/python/tf/data/Dataset#map)转换，它将用户定义的函数（例如，`parse_fn`来自运行示例）应用于输入数据集的每个元素。由于输入元素彼此独立，因此预处理可以跨多个 CPU 内核并行处理。为了使这成为可能，`map`转换提供了`num_parallel_calls`参数来指定并行度。

例如，下图说明了设置`num_parallel_calls=2`对`map`转换的影响：

![parallel map](https://img.zsaqwq.com/images/2022/04/28/1-3.png)

为参数选择最佳值`num_parallel_calls`取决于您的硬件、训练数据的特征（例如其大小和形状）、地图函数的成本以及同时在 CPU 上发生的其他处理；一个简单的启发式方法是使用可用 CPU 内核的数量。例如，如果执行上述示例的机器有 4 个内核，那么设置`num_parallel_calls=4`. 另一方面，设置`num_parallel_calls`为远大于可用 CPU 数量的值会导致调度效率低下，从而导致速度变慢。

要将此更改应用于我们正在运行的示例，请更改：

```python
dataset = dataset.map(map_func=parse_fn)
```

为：

```python
dataset = dataset.map(map_func=parse_fn, num_parallel_calls=FLAGS.num_parallel_calls)
```

此外，如果您的批处理大小为数百或数千，您的流水线可能还会从并行创建批处理中受益。为此，[`tf.data`](https://www.tensorflow.org/api_docs/python/tf/data)API 提供了[`tf.contrib.data.map_and_batch`](https://www.tensorflow.org/api_docs/python/tf/contrib/data/map_and_batch)转换，它有效地“融合”了地图和批量转换。

要将此更改应用于我们正在运行的示例，请更改：

```python
dataset = dataset.map(map_func=parse_fn, num_parallel_calls=FLAGS.num_parallel_calls)
dataset = dataset.batch(batch_size=FLAGS.batch_size)
```

为：

```python
dataset = dataset.apply(tf.contrib.data.map_and_batch(
    map_func=parse_fn, batch_size=FLAGS.batch_size))
```

### 并行化数据提取

在现实世界中，输入数据可能被远程存储（例如，GCS 或 HDFS），要么是因为输入数据不适合本地，要么是因为训练是分布式的，将输入数据复制到每台机器。在本地读取数据时运行良好的数据集流水线在远程读取数据时可能会成为 I/O 瓶颈，因为本地和远程存储之间存在以下差异：

- **Time-to-first-byte：**从远程存储读取文件的第一个字节可能比从本地存储长几个数量级。
- **读取吞吐量：**虽然远程存储通常提供较大的聚合带宽，但读取单个文件可能只能利用此带宽的一小部分。

此外，一旦将原始字节读入内存，可能还需要对数据进行反序列化或解密（例如[protobuf](https://developers.google.com/protocol-buffers/)），这会增加额外的开销。无论数据是本地存储还是远程存储，这种开销都会存在，但如果数据没有有效地预取，则在远程情况下可能会更糟。

为了减轻各种数据提取开销的影响，[`tf.data`](https://www.tensorflow.org/api_docs/python/tf/data)API 提供了[`tf.contrib.data.parallel_interleave`](https://www.tensorflow.org/api_docs/python/tf/contrib/data/parallel_interleave)转换。使用此转换来并行执行和交错其他数据集（例如数据文件读取器）的内容。要重叠的数据集的数量可以由`cycle_length`参数指定。

下图说明了提供`cycle_length=2`给`parallel_interleave`转换的效果：

![parallel io](https://img.zsaqwq.com/images/2022/04/28/1-4.png)

要将此更改应用于我们正在运行的示例，请更改：

```python
dataset = files.interleave(tf.data.TFRecordDataset)
```

为：

```python
dataset = files.apply(tf.contrib.data.parallel_interleave(
    tf.data.TFRecordDataset, cycle_length=FLAGS.num_parallel_readers))
```

由于负载或网络事件，远程存储系统的吞吐量会随时间变化。为了解决这种差异，`parallel_interleave`转换可以选择使用预取。（详见[`tf.contrib.data.parallel_interleave`](https://www.tensorflow.org/api_docs/python/tf/contrib/data/parallel_interleave)）。

默认情况下，`parallel_interleave`转换提供了元素的确定性排序以帮助重现性。作为预取的替代方案（在某些情况下可能无效），`parallel_interleave`转换还提供了一个选项，可以以牺牲排序保证为代价来提高性能。特别是，如果`sloppy`参数设置为 true，则转换可能会偏离其其他确定性顺序，通过在请求下一个元素时临时跳过其元素不可用的文件。

## 性能注意事项

[`tf.data`](https://www.tensorflow.org/api_docs/python/tf/data)API 是围绕可组合转换设计的，为用户提供灵活性。尽管其中许多转换是可交换的，但某些转换的排序具有性能影响。

### 映射和批处理

调用传递给`map`转换的用户定义函数具有与调度和执行用户定义函数相关的开销。通常，与函数执行的计算量相比，此开销很小。但是，如果`map`做的很少，这种开销可能会主导总成本。在这种情况下，我们建议对用户定义的函数进行向量化（即，让它一次对一批输入进行操作）并在转换`batch`之前应用`map`转换。

### 地图和缓存

[`tf.data.Dataset.cache`](https://www.tensorflow.org/api_docs/python/tf/data/Dataset#cache)转换可以在内存或本地存储中缓存数据集。如果传递给`map`转换的用户定义函数很昂贵，只要结果数据集仍然可以放入内存或本地存储，就在映射转换之后应用缓存转换。如果用户定义的函数增加了存储数据集所需的空间超出缓存容量，请考虑在训练作业之前对数据进行预处理以减少资源使用。

### 映射和交错/预取/随机播放

许多转换，包括`interleave`、`prefetch`和`shuffle`，维护元素的内部缓冲区。如果传递给`map`转换的用户定义函数改变了元素的大小，那么映射转换的顺序和缓冲元素的转换会影响内存使用。通常，我们建议选择导致内存占用较低的顺序，除非不同的顺序对于性能是需要的（例如，启用映射和批量转换的融合）。

### 重复和随机播放

转换将[`tf.data.Dataset.repeat`](https://www.tensorflow.org/api_docs/python/tf/data/Dataset#repeat)输入数据重复有限（或无限）次；数据的每次重复通常称为一个*时期*。转换随机化了数据集示例的[`tf.data.Dataset.shuffle`](https://www.tensorflow.org/api_docs/python/tf/data/Dataset#shuffle)顺序。

如果在`repeat`变换之前应用`shuffle`变换，则纪元边界会模糊。也就是说，某些元素可以在其他元素出现之前重复一次。另一方面，如果在`shuffle`重复变换之前应用变换，则性能可能会在与变换的内部状态初始化相关的每个 epoch 开始时减慢`shuffle`。换句话说，前者（`repeat`之前`shuffle`）提供了更好的性能，而后者（`shuffle`之前`repeat`）提供了更强的排序保证。

如果可能，我们建议使用融合[`tf.contrib.data.shuffle_and_repeat`](https://www.tensorflow.org/api_docs/python/tf/contrib/data/shuffle_and_repeat)转换，它结合了两全其美（良好的性能和强大的排序保证）。否则，我们建议在重复之前`shuffle`。

## 最佳实践总结

以下是设计输入流水线的最佳实践摘要：

- 使用`prefetch`转换来重叠生产者和消费者的工作。特别是，我们建议将 prefetch(n)（其中 n 是训练步骤消耗的元素/批次的数量）添加到输入流水线的末尾，以将在 CPU 上执行的转换与在加速器上完成的训练重叠。
- `map`通过设置`num_parallel_calls`参数并行化转换。我们建议使用可用的 CPU 内核数作为其值。
- 如果您使用转换将预处理元素组合成批处理`batch`，我们建议使用融合`map_and_batch`转换；特别是如果您使用大批量。
- 如果您正在处理远程存储的数据和/或需要反序列化，我们建议使用`parallel_interleave`转换来重叠读取（和反序列化）来自不同文件的数据。
- 向量化传入转换的廉价用户定义函数，`map`以分摊与调度和执行函数相关的开销。
- 如果您的数据可以放入内存，请`cache`在第一个 epoch 期间使用转换将其缓存在内存中，以便后续 epoch 可以避免与读取、解析和转换相关的开销。
- 如果您的预处理增加了数据的大小，我们建议首先应用`interleave`、`prefetch`和`shuffle`（如果可能）以减少内存使用量。
- 我们建议在最好在应用`repeat`转换之前应用转换`shuffle`，理想情况下使用融合的`shuffle_and_repeat`转换。
