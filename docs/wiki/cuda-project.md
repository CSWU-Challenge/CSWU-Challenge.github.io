---
template: overrides/main.html
---

# cuda项目：优化softmax

## 优化策略概览
这个项目需要对 softmax 这一深度学习中常用的函数进行 cuda 层面的
并行优化。
一般来说，softmax 的计算逻辑可以分为下面三个步骤：
1. 对于固定的某行，需要遍历当前行的所有元素获取最大值；
2. 获得最大值以后，需要计算数值和；
3. 指数变换缩放，得到最终的数值结果。
按照 softmax 的计算过程，我尝试了以下几种优化方式，最终性能均优于
baseline，且不同的并行策略在不同数据规模下各有优势 (由于 softmax 的
计算特性，网格和线程块只使用一维的):
1. 使用不同并行规模: 1 个 warp 处理 1 行，1 个 warp 处理 2 行，1 个
warp 处理 4 行
2. 使用 __shfl_down_sync() 和 __shfl_sync() 原语进行向量规约，在
1 个 warp 处理 1 行时可以使数据储存在寄存器内 (之前是存在共享内
存里)，优化访存。
3. 利用 __shfl_down_sync() 和 __shfl_sync()的同步特性, 减少耗时
较多的 syncthreads()
4. 利用 float4 对每一种并行策略进行访存优化
5. 减少 CPU 和 GPU 之间来回搬数据的次数和 malloc 次数，在所有策
略执行之前先 malloc 将数据搬到 GPU 上
## 优化方法实现
下面提供每一种策略的核函数实现,具体代码放在GitHub上了(https://github.com/WenhaoHe02/cuda-learning)，此处仅提供目录
### 每个 warp 处理一行数据
#### 普通版本
#### float4版本

### 每个 warp 处理两行数据
### 普通版本
### float4版本

### 每个 warp 处理四行数据
### 普通版本
### float4版本

## 结果分析
**运行环境：Geforce RTX 4060 8G**  
综合来看，1 个 warp 处理一行的表现最好，但是在行数比列数大得多
的情况下（如 2024，32 1024，32）的情况下,1 个 warp 处理多行的效果更
好，并且在这个项目的数据范围内，一个 warp 处理 4 行优于一个 warp 处
理 2 行。此外，使用 float4 优化后的效果几乎总是优于不使用的情况。根
据所有数据规模，最好的优化效果相比于 baseline 每次都有 2-8 倍的性能
提升 (详细数据见下一部分)
## 数据展示
同样放到GitHub上了(https://github.com/WenhaoHe02/cuda-learning)

