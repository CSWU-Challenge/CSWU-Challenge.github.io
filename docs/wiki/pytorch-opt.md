---
template: overrides/main.html
---
# PyTorch模型优化思路

## 前言

&emsp;&emsp;近年来AI模型成为ASC竞赛选题的香饽饽，如2022年的三四两题分别是基于pytorch的大型语言模型，和基于tensorflow的分子动力学模型。AI模型的优化可以从许多方面入手，本文参考Lorenze Kuhn的文章[Here are 17 ways of making PyTorch training faster – what did I miss?](https://www.reddit.com/r/MachineLearning/comments/kvs1ex/d_here_are_17_ways_of_making_pytorch_training/)，对其进行翻译和总结，介绍pytorch框架的通用优化思路。

&emsp;&emsp;**注意：本文所讲方法仅供参考，帮助大家打开思路。你可能会发现这些方法并不会有太大效果，甚至没有效果。如果想有所突破，必须靠自己深度阅读代码，对症下药。**
## 考虑换一种学习率

&emsp;&emsp;学习率对模型收敛速度和泛化能力有很大影响。Cyclical Learning Rates 和oneCycle learning rate 是 Leslie N. Smith提出的两种自适应学习率方法。（参见[这里](https://arxiv.org/pdf/1506.01186.pdf)和[这里](https://arxiv.org/abs/1708.07120)）oneCycle learning rate schedule看起来像这样：

![1cycle](https://img.zsaqwq.com/images/2022/03/16/image.png)

&emsp;&emsp;PyTorch实现了这两种方法:`torch.optim.lr_scheduler.CyclicLR` 和`torch.optim.lr_scheduler.OneCycleLR`。具体用法请见[官方文档](https://pytorch.org/docs/stable/optim.html)。

&emsp;&emsp;注意这两种方法需要给定超参数。关于超参数的选择请看[这条帖子](https://towardsdatascience.com/hyper-parameter-tuning-techniques-in-deep-learning-4dad592c63c8)和[这个仓库](https://github.com/davidtvs/pytorch-lr-finder)

## 在DataLoader里使用多个线程和固定内存

&emsp;&emsp;使用`torch.utils.data.DataLoader`时，设置`num_workers>0`，而不是使用它的默认值0.并且设置`pin_memory=True`，而不是默认的False。具体的解释参见[这里](https://pytorch.org/docs/stable/data.html)。

&emsp;&emsp;经验表明，当num_workers等于GPU数量的四倍时效果最好。注意这种方法会增大CPU负荷。

## 增大batch size

&emsp;&emsp;使用你的GPU所允许的最大的batch size可以提高你的训练速度。调整batch size时需要等比例的调整learning rate。

&emsp;&emsp;OpenAI对此有一篇很漂亮的[论文](https://arxiv.org/pdf/1812.06162.pdf)可供参考。使用大batch size的缺点是，这可能会降低模型的泛化能力。

## 使用混合精度(AMP)

&emsp;&emsp;Pytorch 1.6增加了混合精度训练的官方实现。使用FP16和FP32混合精度可以训练地更快，而且相比单精度(FP32)训练并没有精度损失。下面是一个使用AMP的例子：
````
import torch
# Creates once at the beginning of training
scaler = torch.cuda.amp.GradScaler()

for data, label in data_iter:
   optimizer.zero_grad()
   # Casts operations to mixed precision
   with torch.cuda.amp.autocast():
      loss = model(data)

   # Scales the loss, and calls backward()
   # to create scaled gradients
   scaler.scale(loss).backward()

   # Unscales gradients and calls
   # or skips optimizer.step()
   scaler.step(optimizer)

   # Updates the scale for next iteration
   scaler.update()
   ````
AMP训练的benchmark可以参考这篇[文章](https://pytorch.org/blog/accelerating-training-on-nvidia-gpus-with-pytorch-automatic-mixed-precision/)

## 考虑使用另一种优化器

&emsp;&emsp;AdamW往往比Adam有更好的优化效率。相关文章参见[这篇](https://www.fast.ai/2018/07/02/adam-weight-decay/)。

&emsp;&emsp;此外还可以尝试最近异军突起的LAMB优化器。

&emsp;&emsp;如果使用英伟达的显卡，可以安装英伟达的APEX包，里面提供了针对NVIDA GPU而改良的常见优化器，比如Adam。

## 开启cudNN基准测试

&emsp;&emsp;如果你的模型架构是固定的，并且输入数据的size是常数，那么可以尝试设置`torch.backends.cudnn.benchmark = True`。这会启动cudNN autotuner来测试卷积计算的不同方法，并最终选用最佳方法。
&emsp;&emsp;需要注意的是，如果你把batch size最大化了，那么这个测试将会非常慢。

## 小心CPU和GPU之间频繁的数据转换

&emsp;&emsp;注意你的代码中是否频繁调用了`tensor.cpu()`或者`tensor.cuda()`，这会非常耗时。

&emsp;&emsp;如果你在创建一个新的tensor，你可以通过设置参数`device=torch.device('cuda:0')`来把数据直接创建在GPU上。

## 使用梯度累积

&emsp;&emsp;这种方法变相增加了batch size。如果你的GPU memory不足以容纳较大的batch，你可以把一个batch分几次输入，从而算出总梯度。你可以在调用`optimizaer.step`之前多次调用`.backward`，来实现这个方法。下面是一个例子。
```
model.zero_grad()                                   # Reset gradients tensors
for i, (inputs, labels) in enumerate(training_set):
    predictions = model(inputs)                     # Forward pass
    loss = loss_function(predictions, labels)       # Compute loss function
    loss = loss / accumulation_steps                # Normalize our loss (if averaged)
    loss.backward()                                 # Backward pass
    if (i+1) % accumulation_steps == 0:             # Wait for several backward steps
        optimizer.step()                            # Now we can do an optimizer step
        model.zero_grad()                           # Reset gradients tensors
        if (i+1) % evaluation_steps == 0:           # Evaluate the model when we...
            evaluate_model()                        # ...have no gradients accumulated
```
## 使用Distributed Data Parallel 来进行多卡训练

&emsp;&emsp;使用`torch.nn.DistributedDataParallel`而不是`torch.nn.DataParallel`来开启多卡训练。这样每个GPU都会由一个独立的CPU核来驱动，避免了`DataParallel`的GIL问题。

## 将梯度设置为None而不是0

&emsp;&emsp;使用`.zero_grad(set_to_none=True)`而不是`.zero_grad()`。

&emsp;&emsp;这会让内存分配器处理梯度，而不是主动地将他们设置为0。这只会提供一个微量的加速，就像这篇[文档](https://pytorch.org/docs/stable/optim.html)所说的那样，所以不要期待有任何奇迹。

&emsp;&emsp;注意这么做会有一定副作用。请仔细查看文档。

## 使用`.as_tensor`()而不是`.tensor()`

`torch.tensor()`总是会复制数据。如果你想转化一个numpy数组，使用`torch.as_tensor()`或者`torch.from_numpy()`来避免拷贝数据。

## 使用梯度剪裁(gradient clipping)

&emsp;&emsp;这种方法一开始是用来避免RNN中的梯度爆炸，现在也有实验和理论说明梯度剪裁可以加速收敛。参见这篇[文章](https://openreview.net/forum?id=BJgnXpVYwS)。

&emsp;&emsp;抱抱脸团队实现的[Transformer](https://github.com/huggingface/transformers/blob/7729ef738161a0a182b172fcb7c351f6d2b9c50d/examples/run_squad.py#L156)就是一个非常清晰的使用梯度裁剪的例子，这里面还用了本文提到的其他优化方法，比如AMP。

&emsp;&emsp;现在还不清楚这种方法适用于什么样的模型，不过目前来看它在RNN架构、基于Transformer的架构，以及ResNet架构上表现出很稳定的实用性。

## 在BatchNorm之前关掉bias

&emsp;&emsp;这非常简单：在BatchNormalization层之前关掉每一层的bias，也就是说,对于一个二维卷积层，把bias参数设为False：`torch.nn.Conv2d(...,bias=False,...)`。（原理参见这篇[文档](https://stackoverflow.com/questions/46256747/can-not-use-both-bias-and-batch-normalization-in-convolution-layers)）

## 在做validation的时候关掉梯度计算

&emsp;&emsp;这很简单，在validation时设置`torch.no_grad()`

## 预加载数据

&emsp;&emsp;非常简单，用下面的DataLoaderX替换DataLoader即可：
```
from torch.utils.data import DataLoader
from prefetch_generator import BackgroundGenerator
class DataLoaderX(DataLoader):
    def __iter__(self):
        return BackgroundGenerator(super().__iter__())
```