---
template: overrides/main.html
---

## 从 INT 10H 跟 VRAM 讲起

让我们把时间拨回上世纪80年代。彼时的主流操作系统当属 MS-DOS。在 Windows 95 以前，DOS 是 IBM PC 以及兼容机中最基本的配备，而 MS-DOS 则算是个人电脑中最普遍使用的 DOS 操作系统。

<div align="center">
<img src="/assets/wiki/how-gui-work/Msdos-icon.png" width="10%">
    <br>
    <div style="border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">MS-DOS 的 Logo</div>
	<!-- <img src="" >
    msdos -->
</div>

彼时的 MS-DOS 的界面大多是黑底白字的命令提示符。为了在屏幕上显示字符，x86提供了一个中断，也就是 INT 10H. 这里的 INT 是 Interrupt 的意思。就像调用其他的中断一样，程序在调用这个中断时向寄存器里面写入参数，然后调用中断指令。对应的，BIOS会建立相应的中断处理程序来将字符打印到屏幕上。

<div align="center">
<img src="/assets/wiki/how-gui-work/MS-DOS_Deutsch.png" width="80%">
    <br>
    <div style="border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">MS-DOS 的界面，这些字符基本就是通过调用 INT 10H 中断绘制（图源自维基百科）</div>
	<!-- <img src="" >
    msdos -->
</div>

INT 10H 除了可以绘制字符，也可以绘制图像，只需要改变中断的参数即可实现。
INT 10H的执行速度是相当缓慢的。除了使用 INT 10H 这个中断来绘制，还有其他的方式。

以前的计算机一般需要额外安装一张图形卡，从而支持图形输出。图形卡上一般会带有一些内存，也就是VRAM。图形卡的任务就是不断的读取VRAM中的数据，并将读到的数据解析成电信号，通过VGA等显示接口传送给显示器。那么，直接修改VRAM的数据，也可以达到绘制图像的目的，而且这个方法来的更快。

<div align="center">
<img src="/assets/wiki/how-gui-work/IBM_VGA_graphics_card.jpg" width="80%">
    <br>
    <div style="border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">IBM生产的一张图形卡，提供了VGA输出。可以看到上面有很多长方形的存储芯片，也就是VRAM. 它的任务是把VRAM中的数据转换为视频输出信号。（图源自维基百科）</div>
	<!-- <img src="" >
    msdos -->
</div>

但无论如何，对于当时的程序员，都是需要接触系统的最底层，直接跟硬件打交道。不同硬件厂商的图形卡标准页不尽相同，绘制一个窗口都要费劲。

<div align="center">
<img src="/assets/wiki/how-gui-work/Windows1.0.png" width="60%">
    <br>
    <div style="border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">Windows 1.0x 的界面。这同样是通过写VRAM与INT 10H制作的GUI. 值得一提的是Windows 1.0x的GUI并不支持窗口重叠，而是只能平铺在桌面上，但对话框会显示在所有窗口的上面。此时的Windows的内核仍然为MS-DOS。（图源自维基百科）</div>
	<!-- <img src="" >
    msdos -->
</div>

当然，这种情况不会一直持续下去。1995年8月，Windows 95诞生了.

## GDI: 不再重复造轮子

可能提到Windows 95，大多数人都会想到开始菜单。确实，开始菜单的出现奠定了此后20多年Windows系统的操作逻辑。但这里讨论的主角既不是Windows 95, 也不是开始菜单。除了开始菜单以外，Windows 95还有一个不太广为人知的核心部件：GDI。

<div align="center">
<img src="/assets/wiki/how-gui-work/Windows_95_desktop.png" width="80%">
    <br>
    <div style="border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">Windows 95的界面，估计比较发达的城市的同学应该没见过。当年我家所在的小县城的小学微机室里面就是这个系统。（图源自维基百科）</div>
</div>

GDI，全称叫做图形设备接口(Graphics Device Interface). 微软在其中封装了将图形能输出到显示器，打印机以及其他外部输出设备的功能。也就是说，__程序员不用再关心图形卡的厂商标准是什么样子，只需要使用微软提供的接口就可以绘制图形与字符。__ 同时，微软在这套体系的基础上提供了Windows的组件库，应用程序开发者不用再思考怎么绘制窗口，而是简单的调用提供的API就可以绘制窗口、菜单、按钮等部件。举一个不太恰当的比喻，GDI比起来直接修改VRAM，就像是写Python与写C的区别。

在Windows XP, 微软又对GDI进行了加强，称为GDI+。GDI+提供二维的矢量图形，改进旧有的GDI，加强的可视化属性，例如边界，渐变和透明。通过GDI+，能够直接将BMP转成JPG或其它格式的图片，还能够生成SVG、Flash等。GDI+ 使用ARGB的值来表示颜色。

看起来似乎很完美，我们可以显示几乎任何东西了，字符、图形、甚至有透明地方的图片。但是，有一个根本的缺陷一直没变，目前一切的一切都是在CPU上运行的。随着人们对图形界面的要求越来越高（比如绘制三维图形），绘制图像所需要的资源也越来越多。这是个严重的问题：

>绘制GUI所占用的资源正在阻碍计算机的本职工作：计算。

## GPU 与 DirectX: 外观与效率，我全都要

当然，没有人愿意倒退回那个敲命令行的苦日子。但是，也没有人愿意浪费大量资源在绘制GUI上。有没有什么办法，能让我们既拥有华丽的GUI，又可以不妨碍CPU的计算呢？答案是再加一个处理器专门用来画GUI。


<div align="center">
<img src="/assets/wiki/how-gui-work/jensen_huang.jpg" width="50%">
    <br>
    <div style="border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">提起GPU绕不开的那个男人：黄仁勋。1999年8月，当时还是一家小作坊的NVIDIA发布了GeForce 256并首次提出了图形处理器的概念。但谁也没想到，20年后这家公司的市值会比Intel跟AMD加起来都要高。（图源自NVIDIA）</div>
</div>

在GPU出现之前，CPU要亲历亲为的绘制GUI，而在GPU出现之后，CPU只需要告诉GPU要在哪里画什么，GPU就会自己计算出对应像素值塞进显存。图形处理器使显卡减少对CPU的依赖，并分担部分原本是由CPU所担当的工作，将CPU从绘制GUI的任务中解放出来。

这种加速程度在2D上可能不是那么明显，但如果需要渲染3D图像，比如三维建模，CAD图纸绘制这种工作，GPU能带来的加速就远超CPU了。对于光栅渲染与光线追踪这种工作，GPU天生的高并行与异构所带来的加成足以碾压CPU。

在硬件上革命的同时，软件也在不断进化。1995年，微软也推出了另一个影响深远的接口：DirectX. 这套系统可以充分的利用GPU所带来的性能提升，以更快的速度绘制更精美的图像。

除了绘制图像，DirectX旗下包含DirectCompute等等多个不同用途的子部分，因为这一系列API皆以Direct字样开头，所以DirectX（只要把X字母替换为任何一个特定API的名字）就成为这一巨大的API系列的统称。

实际上，DirectX已经超出了GUI的范围。它不仅仅包括图像的渲染，还包括音频，控制器等等组件。但如果谈到GUI，这又是一个绕不开的话题。__因为相较于它的前辈GDI，它实在是快得多。__ DirectX相较于GDI，可以充分的利用GPU的加速，从而以较快的速度绘制美观准确的图像。除了GUI，游戏行业对于这种能力的需求是远超其他任务的。

<div align="center">
<img src="/assets/wiki/how-gui-work/dx_logo.png" width="50%">
    <br>
    <div style="border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">DirectX的Logo. 也正是这套系统，奠定了Windows在PC游戏行业无法撼动的地位。（图源自维基百科）</div>
</div>

除了游戏行业，DirectX在渲染GUI上也大放异彩。最典型的例子莫过于Windows Vista与Windows 7的Aero特效。通过利用DirectX 9带来的绘图能力，Windows的GUI得以在不牺牲太多速度的同时全面进化。用个不太恰当的比喻，采用了DirectX渲染的Windows的桌面相当于一个大游戏，所有渲染都是GPU完成的。

<div align="center">
<img src="/assets/wiki/how-gui-work/Aero_Example.png" width="70%">
    <br>
    <div style="border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">Windows 7上的Aero特效。注意看标题栏的高斯模糊效果。实际上GDI在Windows 7之后就被更为强大的DirectX取代了，只保留了兼容的接口，功能全部由DirectX实现。（图源自维基百科）</div>
</div>

## 说回 Windows: 它是怎么渲染GUI的

让我们把目光再次聚焦回Windows. 实际上，Windows内部是怎么实现渲染GUI的，恐怕除了微软没人知道。毕竟Windows是一个闭源商业系统。但借助相关资料，我们还是可以对渲染的流程略知一二。整个渲染流程大概如下：

- 对于每个显示的应用程序，它们自己都会保存自己的缓冲区。我们可以理解为一个像素矩阵，每个点都对应屏幕上的一个点。这样，每个应用都可以操作自己窗口显示的内容。

- 在这之后，Windows会通过DWM，也就是桌面窗口管理器，将所有应用程序的窗口合并成为显示的图像。Aero的半透明特效就是借助这个方式实现的，通过生成底层窗口的模糊图像营造出毛玻璃效果。

当然，实际上Windows的渲染系统还要复杂的多，除此以外还有消息系统用来响应鼠标与键盘的操作，但如果在这里详细的展开讲，我恐怕是没有这个能力的。有兴趣的同学可以自行搜索了解。

另外有一个地方要提一句，__现代Windows的GUI实际上是不包括在内核里面的。__ 在NT 4.0时代，GUI是在Windows内核中的，但在NT 6.0的时代，GUI就被彻底移除出了内核，而是运行在用户态。至于原因，我引用知乎@韩朴宇的一段话：

>@韩朴宇: 事实上，当初Windows NT 4.0将GUI移入内核的原因在当前已经不存在了。一方面GDI已经不再使用，程序普遍自绘GUI，另一方面，在用户态实现窗口管理完全不存在性能瓶颈，况且DWM已经将绘制这一主要的窗口管理功能在用户态实现了。唯一能解释的就是微软本来打算使用UWP完全代替过去的生态, 但失败了, 因此不再追求在桌面版Windows上破坏原有的win32兼容性。

## Linux: 真的有人用GUI吗？

最后，我们再看下Linux是怎么渲染GUI的。

值得一提的是，Linux的GUI也是完完全全在用户态运行的。现代Linux渲染GUI有两种途径：X Window System与Wayland. 其中X Window System是比较早期的途径，现在已经被逐渐淘汰了，取而代之的是Wayland，一个更简单高效的窗口管理系统。

先说X Window System. 它主要包括三部分：服务器，客户端与窗口管理器。至于它的工作流程，我这里直接复制知乎@silaoA的文字与配图：

<div align="center">
<img src="/assets/wiki/how-gui-work/xserver.jpg" width="100%">
    <br>
    <div style="border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">X Window System 架构，图源自知乎@silaoA</div>
</div>


>假定多个X客户端程序及窗口管理器在主机A上，某个X Server（如下文X.Org Server）运行在主机B上，程序运行过程可简化如下过程。
>
>1. 某个X客户端进程启动，向主机B发送连接请求，目标地址可通过命令行或配置文件指定，如果给定的地址已有X Server正在监听端口，则进行下一步；
>2. 主机B上的X Server返回一个连接正确响应，X Server也可以配置接受或拒绝某些地址的请求；
>3. X客户端向X Server发送渲染请求及窗口界面数据； X Server一方面将窗口界面数据交给显示驱动计算渲染缓冲，另一方面综合各个X客户端的渲染请求，计算更新区域，但它并不知道如何将多个窗口“合成到一起”，于是将更新区域事件发给窗口管理器
>4. 窗口管理器了解到需要在屏幕上重新合成一块区域，再向X Server发送整个屏幕的绘制请求和数据
>5. X Server将绘图数据交给显示驱动计算所有渲染缓冲，并最终绘制图形
>6. 运行过程中，X Server可能收到主机B上的鼠标、键盘事件，经计算后，X Server决定发给哪个X客户端（即获得焦点）
>7. X客户端收到鼠标、键盘事件后，回调事件处理，并计算界面该如何更新
>8. 循环第3~8，直至X客户端收到关闭事件，进程终止、连接断开。

X Window System 只是一个规范，有很多项目在此之上继续开发，将自己的主题，组件，图标等打包在一起。例如Gnome等等。

与X Window System相对的就是Wayland. 相对于X Window System, 它只有两个部件：客户端与合成器。工作流程这里同样引用知乎@silaoA的文字与配图：

<div align="center">
<img src="/assets/wiki/how-gui-work/wayland.jpg" width="100%">
    <br>
    <div style="border-bottom: 1px solid #d9d9d9;
    display: inline-block;
    color: #999;
    padding: 2px;">Wayland 架构，图源自知乎@silaoA</div>
</div>

>假定多个Wayland客户端程序在主机A上，某个Wayland Compositor（如Weston）运行在主机B上。
>  
>1. 某个客户端进程启动，向主机B发送连接请求，目标地址可通过命令行或配置文件指定，如果给定的地址已有Compositor正在监听端口，则进行下一步；
>2. 主机B上的Compositor返回一个连接正确响应，Compositor也可以配置接受或拒绝某些地址的请求；
>3. 客户端自行生成UI界面和渲染缓冲，不需要向Compositor发送绘制请求，但需要发送更新区域事件，告知渲染缓冲中更新了哪些内容；
>4.  Compositor综合各客户端的区域更新事件，重新合成整个屏幕，并交给显示驱动绘制图形；
>5. 运行过程中，Compositor可能收到主机B上的鼠标、键盘事件，经计算后，Compositor决定发给哪个客户端（即获得焦点）；
>6. 客户端收到鼠标、键盘事件后，回调事件处理；
>7. 循环第3~6，直至客户端收到关闭事件，进程终止、连接断开。

>尽管有这样那样的问题，X仍然是GNU/Linux、UNIX上的主力，Wayland作为强有力的竞争对手，在远程桌面方面亦存在问题，重度依赖Linux内核技术不易移植到其他系统平台。在微软的WSL崛起之时，X的优势倒可以尽情发挥出来。

## 结语：试想没有GUI的世界

>人类是最典型的视觉动物。

计算机从上世纪50年代诞生到现在已经过了大半个世纪，试想没有GUI的世界，恐怕计算机到现在还是被束之高阁，常人无法使用的高门槛工具。GUI造就了Window与macOS以及形形色色的易用方便的操作系统。虽然很少有系统将GUI写进内核，但对很多系统来说，GUI的重要性并不比内核低多少。相信在未来，随着人机交互的发展，能够诞生出比GUI更加先进的交互方式。

## 参考资料

- MS-DOS 维基百科 https://zh.wikipedia.org/wiki/MS-DOS
- INT 10H 维基百科 https://zh.wikipedia.org/wiki/INT_10H
- 显卡 维基百科 https://zh.wikipedia.org/wiki/%E6%98%BE%E7%A4%BA%E5%8D%A1
- Windows 1.0x 维基百科 https://zh.wikipedia.org/wiki/Windows_1.0
- Windows 95 维基百科 https://zh.wikipedia.org/wiki/Windows_95
- GDI+ 维基百科 https://zh.wikipedia.org/wiki/GDI%2B
- Windows API 维基百科 https://zh.wikipedia.org/wiki/Windows_API
- 图形用户界面 维基百科 https://zh.wikipedia.org/wiki/%E5%9B%BE%E5%BD%A2%E7%94%A8%E6%88%B7%E7%95%8C%E9%9D%A2
- Windows Presentation Foundation 维基百科 https://zh.wikipedia.org/wiki/Windows_Presentation_Foundation
- Windows Aero 维基百科 https://zh.wikipedia.org/wiki/Windows_Aero
- Linux 为何不把图形用户界面写入内核？知乎 https://www.zhihu.com/question/20667741
- Linux 图形界面的显示原理是什么？知乎 https://www.zhihu.com/question/321725817
- GDI、DirectX、WPF、Winform等绘图相关关系梳理 博客园 https://www.cnblogs.com/wantoo/p/3898592.html