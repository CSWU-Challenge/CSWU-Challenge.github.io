---
template: overrides/main.html
---
# 前言

&emsp;&emsp;《超算竞赛导引》是由赛事官方编写的指导书。本文就书中的一些有用、重点的内容作摘要整理，并根据笔者自身经验加以补充，以助刚入门的同学快速了解、上手超算竞赛。欲见详细内容请自行购买、借阅书籍。

# ASC竞赛规则介绍

# 你需要配置的基础环境
## CPU并行系统应用环境
&emsp;&emsp;高性能计算并行应用的操作系统一般选用Linux操作系统，其中RedHat Linux发行版以其稳定而著称，因此在商业集群中得到广泛应用。但是，RedHat Linux由于需要一定的授权费用以进行维护和售后服务，导致一些对成本极其敏感的客户，放弃了RedHat Linux发行版。RedHat Linux的一个再发行版是CentOS,使用CentOS可以在免费的情况下，获得与RedHat Linux类似的体验。但CentOS并不是官方支持的，因此可能在补丁升级等方面与官方的RedHat有一定差距。另外，CentOS显然也不能获得RedHat官方的售后服务。

&emsp;&emsp;**学校在校赛阶段会提供搭载RedHat的超算节点（2022年是如此）。如果你选择自装Linux或者自购服务器，建议选择Ubuntu。**

### 并行运行环境
#### MPI
&emsp;&emsp;高性能计算并行应用环境的硬件环境构建设计一般采用的是分布式内存结构，因此并行软件环境需要采用消息传递的网络通信方式。MPI是使用最普遍的并行编程环境，其优点在于编程简易、可移植性强。MPICH是MPI标准的一种最重要的实现，该实现可以免费从网上下载。MPICH并行编程环境的安装步骤简述如下。

1. 解压、安装。首先从网上下载安装包，根据后缀名，使用相应的命令解压，一般解压命令是tar。进入MPI的解压目录下，使用./configure;make命令安装。
2. 放权。为了能够在多个不同的机器上运行MPI程序，首先需要其他机器对启动MPI程序的机器放权，即允许启动MPI程序的机器能够访问其他的机器。为了简单起见，最好在整个集群的每一个节点机上都建立相同的账户名，使得MPI程序在相同的账户下运行，在放权设置完成以后，可以在任何一个节点，使用同样的账户名，不需要输入密码，这样可以在任何一个节点启动MPI程序，并且在不需要输入密码的情况下可以自动运行程序。
3. 运行。程序在不同节点可以放置在不同目录下，但为了方便管理，建议放置在同样的目录下，放置在共享存储时最佳。使用哪些节点、每个节点内开启几个MPI进程，是由配置文件决定的，每个应用可以采用不同的节点配置文件，以便根据不同的应用选择不同的方案，避免闲置计算资源或达不到最好的利用效果。在节点内，由于是共享内存模式的并行系统，一方面仍然可以选择MPI软件环境进行并行，另一方面也可以选择OpenMP或PThread方式进行并行。PThread是一种多线程库，也是Linux下的基础多线程库，在其他操作系统中也有PThread库的移植。OpenMP基于PThread，底层由PThread库实现。OpenMP以在源代码中插入编译制导语句的方式，屏蔽了并行程序开发的底层细节，能够以最简便的方式将程序并行化。但是OpenMP不像PThread库能够控制一些底层的细节，因此在某些情况下，性能可能会略逊于PThread。

&emsp;&emsp;**校赛阶段一般都是单节点，用不到多机并行。因此只要在本机上安装好MPI，然后在程序的配置文件中给出MPI库文件地址即可单机运行。**

&emsp;&emsp;**MPI有很多种实现，上面提到的MPICH只是一种比较常用的实现。我们可以比较不同MPI的性能，选出最佳的实现。如果使用Intel处理器，一般使用Intel自家开发的MPI性能最佳。**

### 开发环境

&emsp;&emsp;传统高性能计算并行应用的软硬件构建应该基于应用环境，即采用与应用环境相同的架构、软硬件环境和规模。理想情况下，开发平台即应用平台，但在实际应用中，往往需要在一个平台上开发，并应用于多个不同的平台。所以在开发环境的选择上，一般选择架构、软硬件环境与应用环境尽量相同，但规模上可能小于应用环境。但是由于规模不同，性能上的表现也可能出现不同，所以在开发测试时，应尽量模拟应用平台的情况进行测试，以免出现开发时性能很好，但是在实际部署中效果不佳的情况。

&emsp;&emsp;开发环境中，包含与应用环境相同的软件环境，并且包括编译器、调试器等软件开发工具和高性能数学库、调优工具等软件优化工具。

#### 编译器
   
&emsp;&emsp;GNU/GCC是属于GNU的免费编译器套装，包含C/C+、Fortran和其他语言的编译器。GNU编译器在各个操作系统和平台上都有相应的实现，适用范围较广，尤其在Liux系统中，已成为默认的编译器。在Linux系统中，默认都安装有GNU编译器。Linux系统中，包含对PThread库的运行环境支持。各个常用的编译器，都支持OpenMP的语法和PThread的函数声明，并且自带OpenMP和PThread的运行库。因此在安装编译器以后，即可支持OpenMP和PThread库。

&emsp;&emsp;如果使用Intel处理器，我们推荐使用Intel OneAPI套件中的C/C++编译器和Fortran编译器。这往往能取得最佳的性能。

#### 高性能数学函数库

&emsp;&emsp;现有的数学函数库可以简化应用程序开发，避免“重复造车轮”的过程，并且使程序简洁，对绝大多数情况来说，使用现成的数学库的性能比程序员自己编写源代码的性能高，因为现成的数学库经过了大量的开发、深度优化和测试，比自己手工写的程序性能好，且可靠性高。因此，如果在程序中用到一些经典算法，一般使用现有的高性能数学库，可以提高代码的工程性，且提高程序性能。

&emsp;&emsp;Intel公司有一套核心数学库，即Math Kemel Library,简称MKL数学库。Intel数学核心函数库(Intel MKL)提供经过高度优化和大量线程化处理的数学例程，面向性能要求极高的科学、工程和金融等领域的应用。Intel MKL为Intel C++和Fortran编译器专业版和Intel集群工具套件的组件，也可作为单独产品使用。Intel MKL针对当前多核x86平台进行了深入而全面的优化，如充分利用了CPU的向量化指令。MKL数学库支持C语言和Fortran的
接口，面向多核CPU,包含线程安全的特性和在多核上的优秀扩展性，MKL的函数会自动执行处理器检测，并选择调用最适合该处理器的二进制代码。Intel的MKL数学库包含线性代数数学库，即BLAS和LAPACK、ScaLAPACK、稀疏矩阵解算器，快速傅里叶变换(FFT),矢量数学库，即幂函数、三角函数、指数函数、双曲函数、对数函数等，随机数生成器等。

&emsp;&emsp;**针对运行HPL/HPCG安装的数学库，除了MKL，我们还可以选择ATLAS、GOTOblas、OpenBLAS等。尽管MKL总能有最出色的表现，但是对不同数学库做实验可以扩充你Proposal的内容。**

&emsp;&emsp;**以上环境依赖均可通过下载[Intel OneAPI套件](https://www.intel.com/content/www/us/en/developer/tools/oneapi/toolkits.html#gs.t4fhh1)一键安装（如果你的处理器是Intel的话），也可以每个组件单独安装。当然后续的环境变量配置还需自己解决。注意使用OneAPI套件时，需先运行脚本`/opt/intel/oneapi/setvars.sh`设置环境变量。自定义安装目录的话请自行查找这个脚本。**

## CPU+GPU异构并行环境

&emsp;&emsp;如果想利用Nvidia GPU加速程序，必须安装CUDA。CUDA安装教程网上有很多，这里不再赘述。下面给出Nvidia开发的几个库，在做软件优化时我们可以尝试使用它们来提高性能。

(1)AmgX:提供了对核心求解器加速的简单方案，对于计算密集的线性求解器有着10x的加速，非常适合隐式非结构方法。

(2)cuDNN:专为深度神经网络设计的GPU加速函数库，可以被快速地加入高层机器学习框架中。

(3)cuFFT:实现了基于GPU的快速傅里叶变换，并提供简单接口供开发者使用。

(4)cuBLAS-XT:基于cuBLAS为Level 3 BLAS提供了多GPU加速支持，不需要开
发者自己配置并调度多GPU资源。

(5)NPP:包括了上千个图像处理和信号处理函数，功能强大。

(6)CULA Tools:EM Photonics提供的线性代数库，为复杂的数学计算提供GPU加速。

(7)MAGMA:支持最新LAPACK和BLAS标准的线性代数库，为异构计算进行特殊
优化。

(8)IMSL Fortran Numerical Library:RogueWave开发的基于GPU的数学和统计函数库，涵盖广泛的内容。

(9)cuRAND:提供高速的GPU加速的随机数生成器。

(10)ArrayFire:包罗万象的GPU函数库，通盖数学信号处理、图像处理、统计学等领域，支持C/C+、Java、R和Fortran.

(1I)cuBLAS:GPU加速的BLAS函数库，提供了相比MKL BLAS6x~17x的加速。

(12)cuSPARSE:对应cuBLAS提供了对稀疏矩阵计算的加速。

(13)Thrust:提供了高速的并行算法的开源库，用于计算GPU加速的排序、扫描、变换和规约等常用算法。

(14)NVBIO:生物领域，提供了GPU加速的高吞吐序列分析，同时支持长短读校准(long and short read alignment).

**以上环境配置是超算竞赛中不可避免的，当然对于具体的题目、软件，可能还有其他环境需要配置。只有自己熟悉Linux基本操作与概念、熟悉环境配置流程才能随机应变。**