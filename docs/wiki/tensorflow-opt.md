---
template: overrides/main.html
---
# Tensorflow模型优化思路

## 前言

&emsp;&emsp;近年来AI模型成为ASC竞赛选题的香饽饽，如2022年的三四两题分别是基于pytorch的大型语言模型，和基于tensorflow的分子动力学模型。AI模型的优化可以从许多方面入手，本文参考w3cub的文档[Tensorflow Guide](https://docs.w3cub.com/tensorflow~guide/performance/performance_guide.html#:~:text=Inference%20InceptionV3%20%20%20%20Optimization%20%20,%20%202.8%20%28361ms%29%20%20%200%20?msclkid=00c39d61a53711eca0957ae5f013dd6a)，对其翻译与总结，介绍Tensorflow框架的通用优化思路。

&emsp;&emsp;**注意：本文所讲方法仅供参考，帮助大家打开思路。你可能会发现这些方法并不会有太大效果，甚至没有效果。如果想有所突破，必须靠自己深度阅读代码，对症下药。**

## 输入流水线优化
&emsp;&emsp;典型的模型从磁盘检索数据并在通过网络发送数据之前对其进行预处理。例如，处理JPEG图像的模型将遵循以下流程：从磁盘加载图像，将JPEG解码为张量，裁剪和填充，可能会翻转和扭曲，然后批量处理。这个流程被称为输入流水线。随着GPU和其他硬件加速器变得更快，数据预处理可能成为瓶颈。

&emsp;&emsp;确定流水线是否是瓶颈可能很复杂。最简单的方法之一是在流水线之后将模型简化为单个操作（平凡模型）并每秒测量示例。如果整个模型和平凡模型的每秒示例差异最小，则流水线可能是瓶颈。以下是一些确定问题的其他方法：
- 通过运行`nvidia-smi`检查GPU是否未充分利用。如果GPU利用率未达到80-100％，则流水线可能是瓶颈。
- 生成一个时间表并查找大块空白（等待）。在XLA JIT教程中，存在一个生成时间线的例子。
- 检查CPU使用情况。很有可能存在着可优化的流水线，并且缺乏CPU周期来处理流水线。
- 估计所需的吞吐量并验证使用的磁盘是否具有该吞吐量。一些云服务器的网络连接磁盘的启动速度低于50 MB /秒，比机械磁盘（150 MB /秒），SATA SSD（500 MB /秒）和PCIe SSD（2,000 MB /秒）慢。
### 在CPU上预处理
在CPU上放置输入管道操作可显着提高性能。利用输入管道的CPU，GPU可以将精力集中在训练上。为确保预处理在CPU上，请按如下所示包装预处理操作：

```
with tf.device('/cpu:0'):
  # function to get and process images or data.
  distorted_inputs = load_and_distort_images()
```
如果使用`tf.estimator.Estimator`，则输入功能自动放置在CPU上。
### 使用tf.data API

&emsp;&emsp;tf.data API将替代`queue_runner`，作为推荐的构建流水线的API。 tf.data API利用了C++的多线程，并且比基于python的且受限于python多线程性能的`queue_runner`有更低的开销。

&emsp;&emsp;虽然使用`feed_dict`来feed data有很高的灵活性，但一般而言`feed_dict`不适用于大规模的模型。如果只用一个GPU，那么tf.data API和`feed_dict`之间的性能差距可以被忽略。我们建议避免使用`feed_dict`，除非你的模型规模很小。尤其避免在输入数据量很大的情况下使用`feed_dict`。
```
# feed_dict often results in suboptimal performance when using large inputs.
sess.run(train_step, feed_dict={x: batch_xs, y_: batch_ys})
```
### 融合解码与裁剪

&emsp;&emsp;如果输入数据是需要裁剪的jpeg图像，使用融合的 [`tf.image.decode_and_crop_jpeg`](https://www.tensorflow.org/api_docs/python/tf/image/decode_and_crop_jpeg)来加速预处理。[`tf.image.decode_and_crop_jpeg`](https://www.tensorflow.org/api_docs/python/tf/image/decode_and_crop_jpeg)只会解码剪裁后剩余的图片。如果剪裁窗口远远小于整张图片，这将会有很大程度的加速效果。
使用样例：
```
def _image_preprocess_fn(image_buffer):
    # image_buffer 1-D string Tensor representing the raw JPEG image buffer.

    # Extract image shape from raw JPEG image buffer.
    image_shape = tf.image.extract_jpeg_shape(image_buffer)

    # Get a crop window with distorted bounding box.
    sample_distorted_bounding_box = tf.image.sample_distorted_bounding_box(
      image_shape, ...)
    bbox_begin, bbox_size, distort_bbox = sample_distorted_bounding_box

    # Decode and crop image.
    offset_y, offset_x, _ = tf.unstack(bbox_begin)
    target_height, target_width, _ = tf.unstack(bbox_size)
    crop_window = tf.stack([offset_y, offset_x, target_height, target_width])
    cropped_image = tf.image.decode_and_crop_jpeg(image, crop_window)
```
### 使用大文件

&emsp;&emsp;从小文件中读取大量数据非常影响I/O性能。一种增大I/O吞吐量的方法是将输入数据预处理到更大(~100MB)的`TRFRecord`文件中。对于更小的数据集(200MB-1GB)，最好的方法是将整个数据集加载到内存。这个[文档](https://github.com/tensorflow/models/tree/master/research/slim#downloading-and-converting-to-tfrecord-format)介绍了`TFRecords`的相关内容。

## 数据格式
&emsp;&emsp;数据格式指传递给优化器的张量的结构。下面的讨论只针对表示图像的4D张量。在Tensorflow中，4D张量经常被以下字母指代：
- N 指一个batch里的图片数量
- H 指在垂直维度里的像素数量
- W 指在水平维度里的像素数量
- C 指channel数。比如说灰度图的channel为1，RGB图的channel为3

在tensorflow中有两种传统的命名来表示两个最常见的数据格式
- `NCHW` or `channels_first`
- `NHWC` or `channels_last`
  
`NHWC`是Tensorflow的默认格式，然而如果使用cuDNN在NVIDIA GPU上训练，那么`NCHW`是最优格式。

&emsp;&emsp;最好的行为是用这两种格式同时构建模型。这简化了在GPU上的训练以及在CPU上的推理。如果tensorflow使用Intel MKL的优化来编译，那么许多操作，尤其是那些与基于CNN的模型有关的操作，将会被优化并且支持`NCHW`。如果不适用MKL，有些操作在使用`NCHW`时将不被CPU支持。

## 常见的融合操作

&emsp;&emsp;融合操作是指为了取得更好的性能而把多个操作组合进一个单独的计算核中。在Tensorflow中有许多融合操作，并且[XLA](https://docs.w3cub.com/tensorflow~guide/performance/xla/index)也会创建融合操作，如果有可能自动提高性能的话。下面这个融合操作可以极大的提升性能并且可能会被忽略。
#### Fused batch norm
&emsp;&emsp;Fused batch norm将多个batch normalization的操作组合为一个计算核。Batch norm对于一些需要大量操作时间的模型而言是一个昂贵的过程。使用fused batch norm可以有12%~30%的提速。

&emsp;&emsp;有两个常用的batch norm，他们都支持融合。
```
bn = tf.layers.batch_normalization(
    input_layer, fused=True, data_format='NCHW')
```
```
bn = tf.contrib.layers.batch_norm(input_layer, fused=True, data_format='NCHW')
```
## 从源码编译安装

&emsp;&emsp;Tensorflow默认的二进制安装包为了使每个人都能安装tensorflow，适配了各种各样的硬件配置。如果使用CPU来训练或者推理，建议使用当前CPU可用的所有优化选项来编译Tensorflow。

&emsp;&emsp;为了安装最优版本的tensorflow，请从源码编译安装。如果需要在一个与tensorflow预设配置不同的平台上编译tensorflow，那么使用你平台上最高的优化选项来交叉编译(cross-compile)。下面的命令就是一个使用`bazel`在一个特定的平台上编译的例子。
```
# This command optimizes for Intel’s Broadwell processor
bazel build -c opt --copt=-march="broadwell" --config=cuda //tensorflow/tools/pip_package:build_pip_package
```
## 针对GPU进行优化
&emsp;&emsp;本节包含一般最佳实践中未涉及的GPU特定提示。在多GPU上获得最佳性能是一项挑战。常用的方法是使用数据并行。通过使用数据并行性进行扩展包括制作模型的多个副本（称为“塔”），然后在每个GPU上放置一个塔。每个塔都运行在不同的小批量数据上，然后更新需要在每个塔之间共享的变量（也称为参数）。每个塔如何获得更新的变量以及梯度如何应用都会影响模型的性能，缩放和收敛性。本节的其余部分概述了多个GPU上的变量放置和模型高耸。

处理变量更新的最佳方法取决于模型，硬件以及硬件的配置方式。一个例子是，两个系统可以使用NVIDIA Tesla P100构建，但可能使用PCIe和另一个NVLink。在这种情况下，每个系统的最佳解决方案可能会有所不同。有关真实的示例，请阅读基准页面，其中详细介绍了适用于各种平台的最佳设置。以下是对各种平台和配置进行基准测试所得到的总结：

- Tesla K80：如果GPU处于同一个PCI Express根联合体上，并且能够使用`NVIDIA GPUDirect Peer to Peer`，那么将这些变量平均放置在用于训练的GPU上是最好的方法。如果GPU不能使用GPUDirect，那么将变量放在CPU上是最好的选择。
- Titan X（Maxwell和Pascal），M40，P100等类似：对于像ResNet和InceptionV3这样的模型，将变量放置在CPU上是最佳设置，但对于像AlexNet和VGG等很多变量的模型，使用GPU `NCCL`更好。

&emsp;&emsp;管理变量放置位置的常用方法是创建一个方法来确定每个Op的放置位置，并在调用时使用该方法代替特定的设备名称`with tf.device()`:。考虑在2个GPU上训练模型并将变量放置在CPU上的场景。将会有一个循环用于在两个GPU的每一个上创建和放置“塔”。自定义设备放置方法将被创建，用来监视Variable，VariableV2以及VarHandleOp和表明它们将被放置在CPU上。所有其他操作将被放置在目标GPU上。该图的构建过程如下：

- 在第一个循环中，模型的“tower”将被创建在`gpu:0`。在放置操作期间，自定义设备放置方法将指示变量将被放置在`cpu:0`，所有其他操作放在`gpu:0`。
- 在第二个循环中，`reuse`设置为`True`指示变量将被重用，然后在 `gpu:1`上创建塔。在放置与“塔”相关联的操作期间，`cpu:0`重复使用放置的变量，并创建、放置所有其他操作在`gpu:1`。

&emsp;&emsp;最终的结果是所有的变量都放在CPU上，每个GPU都有与模型相关的所有计算操作的副本。

&emsp;&emsp;下面的代码片段展示了两种不同的变量放置方式：一种是在CPU上放置变量; 另一个是在GPU上平均放置变量。
```
class GpuParamServerDeviceSetter(object):
  """Used with tf.device() to place variables on the least loaded GPU.

    A common use for this class is to pass a list of GPU devices, e.g. ['gpu:0',
    'gpu:1','gpu:2'], as ps_devices.  When each variable is placed, it will be
    placed on the least loaded gpu. All other Ops, which will be the computation
    Ops, will be placed on the worker_device.
  """

  def __init__(self, worker_device, ps_devices):
    """Initializer for GpuParamServerDeviceSetter.
    Args:
      worker_device: the device to use for computation Ops.
      ps_devices: a list of devices to use for Variable Ops. Each variable is
      assigned to the least loaded device.
    """
    self.ps_devices = ps_devices
    self.worker_device = worker_device
    self.ps_sizes = [0] * len(self.ps_devices)

  def __call__(self, op):
    if op.device:
      return op.device
    if op.type not in ['Variable', 'VariableV2', 'VarHandleOp']:
      return self.worker_device

    # Gets the least loaded ps_device
    device_index, _ = min(enumerate(self.ps_sizes), key=operator.itemgetter(1))
    device_name = self.ps_devices[device_index]
    var_size = op.outputs[0].get_shape().num_elements()
    self.ps_sizes[device_index] += var_size

    return device_name

def _create_device_setter(is_cpu_ps, worker, num_gpus):
  """Create device setter object."""
  if is_cpu_ps:
    # tf.train.replica_device_setter supports placing variables on the CPU, all
    # on one GPU, or on ps_servers defined in a cluster_spec.
    return tf.train.replica_device_setter(
        worker_device=worker, ps_device='/cpu:0', ps_tasks=1)
  else:
    gpus = ['/gpu:%d' % i for i in range(num_gpus)]
    return ParamServerDeviceSetter(worker, gpus)

# The method below is a modified snippet from the full example.
def _resnet_model_fn():
    # When set to False, variables are placed on the least loaded GPU. If set
    # to True, the variables will be placed on the CPU.
    is_cpu_ps = False

    # Loops over the number of GPUs and creates a copy ("tower") of the model on
    # each GPU.
    for i in range(num_gpus):
      worker = '/gpu:%d' % i
      # Creates a device setter used to determine where Ops are to be placed.
      device_setter = _create_device_setter(is_cpu_ps, worker, FLAGS.num_gpus)
      # Creates variables on the first loop.  On subsequent loops reuse is set
      # to True, which results in the "towers" sharing variables.
      with tf.variable_scope('resnet', reuse=bool(i != 0)):
        with tf.name_scope('tower_%d' % i) as name_scope:
          # tf.device calls the device_setter for each Op that is created.
          # device_setter returns the device the Op is to be placed on.
          with tf.device(device_setter):
            # Creates the "tower".
            _tower_fn(is_training, weight_decay, tower_features[i],
                      tower_labels[i], tower_losses, tower_gradvars,
                      tower_preds, False
```
## 针对CPU进行优化
下面列出的两种配置用于通过调整线程池来优化CPU性能。
- `intra_op_parallelism_threads`：可以使用多个线程来并行执行的节点会将各个部分安排到该池中。
- `inter_op_parallelism_threads`：所有就绪节点都安排在此池中。

&emsp;&emsp;这些配置通过tf.ConfigProto设置，并在config属性中传递给tf.Session，如下面的片段所示。对于这两个配置选项，如果不设置或设置为0，将默认为逻辑CPU核心的数量。测试表明，默认值对从一个4核的CPU到多个CPU的70多个组合逻辑核的系统都是有效的。一个常见的替代优化是将两个池中的线程数设置为等于物理核心数而不是逻辑核心数。
```
config = tf.ConfigProto()
config.intra_op_parallelism_threads = 44
config.inter_op_parallelism_threads = 44
tf.session(config=config)
```
## 使用Intel® MKL DNN的Tensorflow
### 调整MKL以获得最佳性能
&emsp;&emsp;本节详细介绍了不同的配置和环境变量，可用于调整MKL以获得最佳性能。在调整各种环境变量之前，请确保模型使用的是NCHW(channel_first)数据格式。MKL已经针对NCHW进行了优化，英特尔正在努力使使用NHWC时的性能接近平价。
- KMP_BLOCKTIME - 设置线程在完成一个并行区域的执行后，在睡眠前应该等待的时间，单位是毫秒。
- KMP_AFFINITY - 启用运行时库，将线程与物理处理单元绑定。
- KMP_SETTINGS - 在程序执行过程中启用（true）或禁用（false）打印OpenMP*运行时库的环境变量。
- OMP_NUM_THREADS - 指定要使用的线程数量。

关于KMP详见[intel](https://software.intel.com/en-us/node/522775)，关于OMP详见[gnu.org](https://gcc.gnu.org/onlinedocs/libgomp/Environment-Variables.html)

&emsp;&emsp;虽然调整环境变量可以有很大的收益，这将在下面讨论，简单的建议是将inter_op_parallelism_threads设置为等于物理CPU的数量，并设置以下环境变量。
- KMP_BLOCKTIME=0
- KMP_AFFINITY=granularity=fine,verbose,compact,1,0

&emsp;&emsp;有一些模型和硬件平台从不同的设置中受益。下面将讨论影响性能的每个变量。
- KMP_BLOCKTIME。MKL的默认值是200ms，这在我们的测试中并不理想。对于测试的基于CNN的模型，0（0ms）是一个很好的默认值。AlexNex的最佳性能是30ms，GoogleNet和VGG11的最佳性能是1ms。

- KMP_AFFINITY：推荐设置为granularity=fine,verbose,compact,1,0。

- omp_num_threads。这个参数的默认值是物理核心的数量。当使用Intel® Xeon Phi™ (Knights Landing)的某些型号时，调整此参数超过匹配的核心数会产生影响。有关最佳设置，请参阅[现代英特尔®架构上的TensorFlow*](https://software.intel.com/en-us/articles/tensorflow-optimizations-on-modern-intel-architecture)优化。

- intra_op_parallelism_threads。建议将其设置为等于物理核心的数量。将该值设置为0，这是默认值，将导致该值被设置为逻辑核心的数量，对于某些架构来说是一个可以尝试的选项。这个值和OMP_NUM_THREADS应该相等。

- inter_op_parallelism_threads: 建议将其设置为等于套接字的数量。将该值设置为0，也就是默认值，会导致该值被设置为逻辑核心的数量。