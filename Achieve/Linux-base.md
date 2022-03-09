[TOC]
# 导言

&emsp;&emsp;在超算竞赛中，我们主要以Linux为工作环境。原因有三：
- 题目指定的程序往往需要从源码编译安装，这在Linux系统中是基本操作，而在Windows系统中很难做到。
- 我们的程序往往需要大量计算资源和运行时间， 个人电脑一般无法胜任。因此大部分同学会选择自购服务器或者使用学校提供的超算节点。而服务器上的操作系统正常都是Linux。（哪怕可以选择安装Win系统，我们也不会这么做，因为Win系统占用资源远大于Linux的命令行系统）。
- Linux系统配置开发环境相对比较简单（只是相对Win系统，并不代表他真的简单）

&emsp;&emsp;此外，如果以后接触计算机领域较多的话，使用Linux是不可避免的，迟早都要学，不如借助超算竞赛打打基础。

# Linux系统的分类简介

- debian：图形化界面，体积小，稳定性最高，安装包丰富，文档相对较少，但是适用于低配置的vps，128M内存就可以流畅运行debian，使用apt-get命令安装软件。
- ubuntu：与debian有千丝万缕的关系，使用apt-get命令安装软件。学生接触的主要都是Desktop版，即有图形界面的系统，事实上Ubuntu Server 和 Ubuntu Desktop 是两个不一致的发行版，而且Server版的ubuntu非常好用，但个人laptop还是建议Desktop版。
- redhat:命令行界面，有 redhat和redhat enterprise 两个版本，前者免费，后者商用。redhat于2003年停止开发，由Fedora Core代替，使用rpm,yum命令安装软件。
- centos：其实就是redhat enterprise的免费克隆版，但是redhat enterprise是商用的，区别在于因为linux系统本身就是遵守开源协议的，而且redhat enterprise最主要卖的是服务。命令行界面，需要熟悉linux的命令，但是文档丰富，解决问题相对简单。使用yum命令安装软件，可以先安装wget。目前centos没有公司维护已经慢慢落伍。


# 安装Linux

&emsp;&emsp;在个人电脑上安装Linux有这些方案：Win+Linux双系统，Win上安装虚拟机，使用Windows的Linux子系统服务（WSL）。第一个方案最折腾，但是可以获得完整纯正的Linux体验；第二个方案不是很折腾，风险很低，可以获得完整的Linux体验，但是由于同时运行了两个系统，比较吃配置，用起来可能不是很流畅。第三个方案安装最简单，由于是Win自带的子系统，与Win兼容很好，可以在Linux和Win之间无缝切换（Linux以终端窗口的形式运行），但是可能无法获得完整的Linux体验，而且WSL2本质上还是虚拟机。至于在WSL上安装软件与配置环境是否与原生Linux无异，由于笔者没有实际使用过，所以暂时无法告知。

&emsp;&emsp;以上方案在网上皆有大量的傻瓜式教程，这里不再赘述。如果你选择使用服务器，则无需手动安装，服务器上一般会自动装好Linux系统，顶多让你选择发行版。

# 远程连接服务器

&emsp;&emsp;登录服务器在超算竞赛中是不可避免的，比如在服务器上跑程序，比赛结束上传文件到服务器等。如果你暂时用不到服务器，想要直接进行Linux的入门学习，也可以跳过本章和下一章。一般我们有两种方法登录服务器。

## 终端登录
&emsp;&emsp;在Linux终端（或Windows的cmd、powershell）中输入这个命令：

&emsp;&emsp;`ssh Username@IP`

&emsp;&emsp;其中Username用户名和IP地址以及密码在你服务器的控制台页面上都可以查到。如果服务器有提供端口号(Port)，则命令改为`ssh -p ServerPort Username@IP`

![example1](https://img.zsaqwq.com/images/2022/03/10/ssh_example1.png#pic_center)

&emsp;&emsp;初次登录时会让你保存证书密钥之类的，输入yes即可。
![example2](https://img.zsaqwq.com/images/2022/03/10/ssh_example2.png#pic_center)

&emsp;&emsp;之后会提示你输入密码，注意命令行中的密码都是不回显的，不要以为他坏了。
![example3](https://img.zsaqwq.com/images/2022/03/10/ssh_example3.png#pic_center)
&emsp;&emsp;当‘$’（如果是root用户则是‘#’）前显示你登入的用户时，表明登录成功。
## 第三方SSH软件登录
&emsp;&emsp;使用终端登录最为简洁优雅，但每次登录都需要输入命令、密码，比较麻烦，尤其是IP或者密码比较复杂的时候。实际上我们更常用的是第三方SSH软件，例如Xshell，Putty。我个人推荐Xshell，可以去[官网](https://www.xshell.com/zh/free-for-home-school/)申请使用学生免费版。（申请时勾选同时需要Xshell和Xftp）。

&emsp;&emsp;打开Xshell后会自动弹出会话界面，点击新建。

![xshell1](https://img.zsaqwq.com/images/2022/03/10/Xshell_example1.png#pic_center)

在弹出的窗口中填写信息。名称即你创建的这个会话的名称，自己起一个有标识性的名字就行。主机填IP地址。如果你的服务器没有提供端口号，就默认为22。否则填写对应的端口号。

![xshell2](https://img.zsaqwq.com/images/2022/03/10/Xshell_example2.png#pic_center)

之后点击侧边栏的用户身份验证，填写用户名和密码。

![xshell3](https://img.zsaqwq.com/images/2022/03/10/Xshell_example3.png#pic_center)

点击确定之后，你会发现新建的会话出现在了会话窗口中。
![xshell5](https://img.zsaqwq.com/images/2022/03/10/Xshell_example5.png#pic_center)

双击他即可登录服务器。初次登录同样会提示保存证书，选择接受并永久保存。

![xshell4](https://img.zsaqwq.com/images/2022/03/10/Xshell_example4.png#pic_center)

之后便可在Xshell的终端中操控服务器。以后每次登录服务器只需打开Xshell，双击会话即可自动登录。

**你可以同时打开多个终端进行ssh登录，或者在Xshell中再次双击会话，从而用多个终端操作同一个服务器。**

**若想退出登录，输入命令**`exit`**，或者直接关闭终端。**
### 允许以root ssh登录
在一些情况下，服务器默认不允许用户以root权限ssh方式登录服务器
但是可以修改相关配置
修改 ssh 配置`/etc/ssh/sshd_config`
```sudo vim /etc/ssh/sshd_config```
将 PermitRootLogin 改为 yes
```
#LoginGraceTime 2m
PermitRootLogin yes
#StrictModes yes
```
重启ssh服务
```sudo service ssh restart```

# 与服务器进行文件传输

## 从本地上传文件至服务器
打开一个本地的终端，输入命令：

````scp -P ServerPort LocalFilePath Username@IP:TargetFilePath````

与ssh一样，如果服务器没有使用特定的端口，-P参数可以不填。**（注意scp的-P是大写，ssh的-p是小写）**。LocalFilepath替换为你本地文件的路径，TargetFilePath替换为传到服务器的目标路径。回车后输入密码即可传送。

![scp1](https://img.zsaqwq.com/images/2022/03/09/scp1.png)

## 从服务器下载文件至本地

方法与上面大同小异。输入命令:

````scp -p ServerPort Username@IP:ServerFilePath TargetFilePath````

ServerFilePath为文件在服务器上的路径，TargetFilePath为存到本地的目标路径。

## 用第三方软件进行文件传输

如果你安装Xshell时勾选了同时需要Xshell和Xftp，那么当你使用Xshell连接服务器时，可以很方便的使用Xftp来传输文件。

用Xshell登录服务器后，点击上方工具栏的新建文件传输按钮，即可打开Xftp窗口并自动连接至服务器。

![scp2](https://img.zsaqwq.com/images/2022/03/10/scp2.png)

拖动文件即可进行互相传输。

![scp3](https://img.zsaqwq.com/images/2022/03/10/scp3.png)

当然你也可以选择使用其他的传输工具，如Filezilla。个人觉得Xshell+Xftp的集成化套装更方便使用。

# Linux中的权限
*[@_@]: 待写
# Linux基本命令 
*[^_^]: 这部分内容大家一起补充哈  
## 转移当前位置

## 文件操作

## 下载文件

## 安装软件

## 设置环境变量

## 系统监控

### 查看系统配置

### 查看、杀死进程

### 查看显卡状态

### 后台挂起程序

# 从源码编译安装

# Vim/Vi的基本使用

# Anaconda的基本使用
*[^_^]: Anaconda这块可以独立拎出来，应该不是Linux基础。哪位有缘人把他拎出来？
# 优雅的键入指令

很遗憾优雅的键入指令在任何一门课程上都是学不到的，只有实践或者口耳相传才可以做到

## 自动补全

1、tab键补全

几乎所有terminal都可以通过`tab`键进行默认补全，补全规则为：
- 当候选命令只存在一个或在候选词库中前缀相同的时候，按一下`tab`即可自动补全命令
- 当候选命令存在多个无法选择时，连续按两次`tab`可以显示所有候选词库

2、历史补全

CentOS下，有一个很智能的功能，就是只输入一条历史命令的前几个字母，再按PageUp和PageDown键，就可以在以此字母为前缀的历史命令中上下切换。实现上是linux在终端对键盘的映射而已，和linux的某个发行版无关。只是CentOS下默认打开了这个功能，而ubuntu默认禁止了而已。
- 打开`/etc/inputrc`文件
- 搜索`history-search`
- 删除前面的注释`#`号
- 重新登录终端
