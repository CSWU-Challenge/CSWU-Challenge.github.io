---
template: overrides/main.html
---

## 导言

&emsp;&emsp;在超算竞赛中，我们主要以Linux为工作环境。原因有三：
- 题目指定的程序往往需要从源码编译安装，这在Linux系统中是基本操作，而在Windows系统中很难做到。
- 我们的程序往往需要大量计算资源和运行时间， 个人电脑一般无法胜任。因此大部分同学会选择自购服务器或者使用学校提供的超算节点。而服务器上的操作系统正常都是Linux。（哪怕可以选择安装Win系统，我们也不会这么做，因为Win系统占用资源远大于Linux的命令行系统）。
- Linux系统配置开发环境相对比较简单（只是相对Win系统，并不代表他真的简单）

&emsp;&emsp;此外，如果以后接触计算机领域较多的话，使用Linux是不可避免的，迟早都要学，不如借助超算竞赛打打基础。

## Linux系统的分类简介

- debian：图形化界面，体积小，稳定性最高，安装包丰富，文档相对较少，但是适用于低配置的vps，128M内存就可以流畅运行debian，使用apt-get命令安装软件。
- ubuntu：与debian有千丝万缕的关系，使用apt-get命令安装软件。学生接触的主要都是Desktop版，即有图形界面的系统，事实上Ubuntu Server 和 Ubuntu Desktop 是两个不一致的发行版，而且Server版的ubuntu非常好用，但个人laptop还是建议Desktop版。
- redhat:命令行界面，有 redhat和redhat enterprise 两个版本，前者免费，后者商用。redhat于2003年停止开发，由Fedora Core代替，使用rpm,yum命令安装软件。
- centos：其实就是redhat enterprise的免费克隆版，但是redhat enterprise是商用的，区别在于因为linux系统本身就是遵守开源协议的，而且redhat enterprise最主要卖的是服务。命令行界面，需要熟悉linux的命令，但是文档丰富，解决问题相对简单。使用yum命令安装软件，可以先安装wget。目前centos没有公司维护已经慢慢落伍。

## 安装Linux

&emsp;&emsp;在个人电脑上安装Linux有这些方案：Win+Linux双系统，Win上安装虚拟机，使用Windows的Linux子系统服务（WSL）。第一个方案最折腾，但是可以获得完整纯正的Linux体验；第二个方案不是很折腾，风险很低，可以获得完整的Linux体验，但是由于同时运行了两个系统，比较吃配置，用起来可能不是很流畅。第三个方案安装最简单，由于是Win自带的子系统，与Win兼容很好，可以在Linux和Win之间无缝切换（Linux以终端窗口的形式运行），但是可能无法获得完整的Linux体验，而且WSL2本质上还是虚拟机。至于在WSL上安装软件与配置环境是否与原生Linux无异，由于笔者没有实际使用过，所以暂时无法告知。

&emsp;&emsp;以上方案在网上皆有大量的傻瓜式教程，这里不再赘述。如果你选择使用服务器，则无需手动安装，服务器上一般会自动装好Linux系统，顶多让你选择发行版。

## 远程连接服务器

&emsp;&emsp;登录服务器在超算竞赛中是不可避免的，比如在服务器上跑程序，比赛结束上传文件到服务器等。如果你暂时用不到服务器，想要直接进行Linux的入门学习，也可以跳过本章和下一章。一般我们有两种方法登录服务器。

### 终端登录
&emsp;&emsp;在Linux终端（或Windows的cmd、powershell）中输入这个命令：

&emsp;&emsp;`ssh Username@IP`

&emsp;&emsp;其中Username用户名和IP地址以及密码在你服务器的控制台页面上都可以查到。如果服务器有提供端口号(Port)，则命令改为`ssh -p ServerPort Username@IP`

![example1](https://img.zsaqwq.com/images/2022/03/10/ssh_example1.png#pic_center)

&emsp;&emsp;初次登录时会让你保存证书密钥之类的，输入yes即可。
![example2](https://img.zsaqwq.com/images/2022/03/10/ssh_example2.png#pic_center)

&emsp;&emsp;之后会提示你输入密码，注意命令行中的密码都是不回显的，不要以为他坏了。
![example3](https://img.zsaqwq.com/images/2022/03/10/ssh_example3.png#pic_center)
&emsp;&emsp;当‘$’（如果是root用户则是‘#’）前显示你登入的用户时，表明登录成功。

### 第三方SSH软件登录
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
```bash
#LoginGraceTime 2m
PermitRootLogin yes
#StrictModes yes
```
重启ssh服务
```sudo service ssh restart```

## 与服务器进行文件传输

### 从本地上传文件至服务器
打开一个本地的终端，输入命令：

````scp -P ServerPort LocalFilePath Username@IP:TargetFilePath````

与ssh一样，如果服务器没有使用特定的端口，-P参数可以不填。**（注意scp的-P是大写，ssh的-p是小写）**。LocalFilepath替换为你本地文件的路径，TargetFilePath替换为传到服务器的目标路径。回车后输入密码即可传送。

![scp1](https://img.zsaqwq.com/images/2022/03/09/scp1.png)

### 从服务器下载文件至本地

方法与上面大同小异。输入命令:

````scp -p ServerPort Username@IP:ServerFilePath TargetFilePath````

ServerFilePath为文件在服务器上的路径，TargetFilePath为存到本地的目标路径。

### 用第三方软件进行文件传输

如果你安装Xshell时勾选了同时需要Xshell和Xftp，那么当你使用Xshell连接服务器时，可以很方便的使用Xftp来传输文件。

用Xshell登录服务器后，点击上方工具栏的新建文件传输按钮，即可打开Xftp窗口并自动连接至服务器。

![scp2](https://img.zsaqwq.com/images/2022/03/10/scp2.png)

拖动文件即可进行互相传输。

![scp3](https://img.zsaqwq.com/images/2022/03/10/scp3.png)

当然你也可以选择使用其他的传输工具，如Filezilla。个人觉得Xshell+Xftp的集成化套装更方便使用。

## Linux中的权限
&emsp;&emsp;上文提到了root这个字眼，所谓root，就是Linux系统中享有最高权限的用户（类似于Windows里的管理员）。Linux是一个权限意识很强的系统，许多需要修改系统文件、配置之类的操作，如果没有root权限，往往会抛出`Permission denied`的error，然后强行中断。比如下面这个`apt-get update`

![permission_denied](https://img.zsaqwq.com/images/2022/03/11/permission1.png)

&emsp;&emsp;Windows是一个很好的反面教材，相信绝大多数人都无时无刻不为莫名其妙爆满的C盘、以及神不知鬼不觉自动安装的流氓软件而烦恼。这种事情在Linux上基本不会发生，因为这些有"风险"的操作都需要先获得root权限才能进行。

&emsp;&emsp;如果你的命令行前有"#"符号，那么你已经是root用户（一般自购的服务器默认是root用户），任何命令都会以最高权限执行。如果是“$”符号，则不是root用户。那么对于后者，怎样才能以root权限执行指令呢？首先，你要知道root密码。如果是自己安装Linux，安装时会让你设置密码；其他情况请向系统管理员要密码。获得密码后，只要在指令前加上`sudo`一词，回车后输入密码即可。

![permission_ok](https://img.zsaqwq.com/images/2022/03/11/permission2.png)

&emsp;&emsp;可以看到指令成功执行。

&emsp;&emsp;有的同学可能觉得这比较麻烦，动不动就要输密码。那么我们可以选择直接切换到root用户。输入指令`su`，然后输入密码即可。当看到提示符由`$`变为下图中的`#`时（笔者的终端比较有个性，这里没有显示"$"），就说明已经成功切换到root用户了。

![su](https://img.zsaqwq.com/images/2022/03/11/permission3.png)

&emsp;&emsp;这里可能遇到`su: Authentication Failed`的error，这是因为切换root用户的密码不一定与用户密码一致。执行指令`su passwd root`，输入用户密码，然后重置root密码即可。

&emsp;&emsp;
**使用root用户进行操作一定程度上破坏了Linux系统的安全性，因为你的一切命令都会被执行，哪怕是修改系统文件这样的高风险行为。如果你不清楚你的行为将产生的后果的话，有时这将是非常致命的。因此不建议初学者使用这种方式，还是老老实实的用sudo吧。**

&emsp;&emsp;然而，在初赛中，为了避免污染集群原有环境致使影响其他用户的使用，我们只能以普通用户的身份进行各种操作。因此，如何在无root/无sudo权限的条件下达成我们的目标同样非常重要。盲目地使用sudo或者切换为root用户实际上是一种非常不负责任的行为，因为你可能并不知道问题究竟出在哪里。你只是看到了`Permission denied`，或其他引起你想要使用root权限的原因。使用sudo或是切换为root用户可能确实解决了你目前遇到的问题，但如果你对root权限下采取的行为并不充分了解，往往会为你未来的某些操作带来极大的隐患。***我们需要对root怀有敬畏之心，能力越大，责任越大。***当你在学校集群上尝试使用sudo或是切换为su用户时，会弹出以下提示：
> We trust you have received the usual lecture from the local System
> Administrator. It usually boils down to these three things:  
>    &emsp;&emsp;#1) Respect the privacy of others.  
>    &emsp;&emsp;#2) Think before you type.  
>    &emsp;&emsp;#3) With great power comes great responsibility.  

希望你能够牢记在心。

## 常用命令汇总 
在初赛服务器上使用

```bash
history | awk '{print $2}' | sort | uniq -c | sort -k1,1nr | head -15
```

### 从命令历史说起

上条指令显示了初赛阶段最常用的15行命令：
```bash
(base) [asc02@login01 ~]$ history | awk '{print $2}' | sort | uniq -c | sort -k1,1nr | head -15
    208 ls
    155 cd
    122 vi
     84 vim
     62 top
     47 cat
     39 watch
     38 bash
     31 nohup
     31 tail
     28 deact
     23 nvidia-smi
     19 ps
     15 kill
     14 rm
```
以上命令都可以通过 -h的方法快速查看参数。

其中特别推荐先敲个

```bash
vimtutor
```
查看如何使用地表最强编辑器vim。

下面展开介绍每个常用命令

#### 管线

在查询的时候经常要连续的处理数据，这个时候就需要管线
```bash
|
```
指的是把左边的指令结果输入到右边。

#### ls

查看文件夹内容，一般笔者习惯敲

```bash
ls -lt
```
这样可以显示文件的数学并按修改时间排列。在一些高级系统里该指令被

```bash
ll
```
默认集成

#### cd

进入指定文件夹

#### vi 和 vim

文本编辑器，vim是带上色功能的的vi,非常推荐使用
```
vimtutor
```
查看官方教程

####  top

排序地查看哪些进程正在运行

#### cat

显示文件内容

#### watch

监视器，一般用来替代手工刷新，如

```bash
watch -n 0.5 nvidia-smi
```

#### bash
以bash语言执行某个文件

#### nohup

以后台挂起的形式运行某行指令，不会因为ssh terminal关闭而杀死进程, 如

```bash
nohup python3 xxx.py > xxx.out &
```

#### tail

也是查看文件但是是查看“最晚写入的若干行”


#### deact

关闭当前的虚拟环境

#### nvidia-smi
查看显卡状态

#### ps
也是查看进程运行情况，但是以PID排序，一般加上grep以查看想看的进程，如
```bash
ps -ef | grep xhpl
```
就是只看xhpl跑的怎么样

#### kill
杀死某个进程

#### rm
删除某个文件

### alias：偷懒小妙招
&emsp;&emsp;
`alias`指令可以将冗长的指令字符串替换为自定义的任意字符串。它的常规用法是在`~/.bashrc`文件中声明以起到永久修改的效果。具体用法请看一个栗子。假如下图是你家目录下bashrc文件原有的模样（实际可能会有所区别）。

![bashrc_origin](https://img.zsaqwq.com/images/2022/03/11/bashrc.png#pic_center)

当你在使用普通的grep指令时，查找到的对应字符串颜色并不会改变，比如这样（先别管指令的具体含义）：

![grep_origin](https://img.zsaqwq.com/images/2022/03/11/grep_origin.png#pic_center)

现在我们通过`vim ~/.bashrc`添加一条指令：

![](https://img.zsaqwq.com/images/2022/03/11/bashrc_after.png#pic_center)

执行`source ~/.bashrc`或`. ~/.bashrc`后再次查找：

![](https://img.zsaqwq.com/images/2022/03/11/grep_after.png#pic_center)

是不是效果很显著！上文中提到的`deact`, `ll`指令实际上也是通过这种方法设置的。
`deact`实际上是将conda中的`conda deactivate`作了简化，而`ll`实际上是将`ls -l`做了简化，当然也可能是集成在高级系统中啦。

## Linux基本命令详解 

### 写在前面

&emsp;&emsp;Linux中的命令非常多，不要死记硬背。记住，绝大部分命令都是英文缩写，例如`rm`就是remove的缩写，`mv`就是move的缩写。只要知道英文意思，记住命令不是难事。知道了命令的名字，我们就可以在名字后面加上参数`--help`来查看帮助文档，从而了解命令的具体用法。

![help](https://img.zsaqwq.com/images/2022/03/11/help.png)

&emsp;&emsp;总之，只要英语过四级，你就已经成功了一大半（

&emsp;&emsp;重要的事情说三遍：**多看文档！多看文档！多看文档！**

### 切换当前目录

&emsp;&emsp;用过Windows的cmd的同学应该知道`cd`这个命令，当我们使用cmd终端时，常常需要cd到某个目录进行操作。在日常使用中，我们也经常会打开一个又一个目录来查找某个文件。然而在一个终端中，我们并不能同时打开多个目录，它更像是从一个目录"走"到另一个目录。如果在命令中直接输入一个文件的名字，而没有指明路径，那就默认指当前所在目录下的这个文件（如果该文件存在的话）。那么如何转移当前所在目录呢？和cmd一样，使用命令`cd path`即可，path即是你要去的目录的路径。如图，我从目录`~/d1`转移到了`~/d2`，"$"前面会显示当前位置。

![cd1](https://img.zsaqwq.com/images/2022/03/11/cd1.png)

#### 几个特殊位置

&emsp;&emsp;下面列出了几个特殊目录的缩写：
- 当前目录：`.`
- 上一级目录：`..`
- 上一次所在的目录：`-`
- 家目录：`~`
- 根目录: `/`

&emsp;&emsp;例如，当我们想去家目录时，只需`cd ~`即可。想回退到上一级目录，则`cd ..`。

&emsp;&emsp;这里所谓的家目录(home)，就是用户目录，存放我们平时用的文件，类似于D盘。根目录主要存放系统文件，类似于C盘。
### 文件操作

下面列出了几个常用的文件操作命令。
- 查看当前目录文件：`ls`

![ls](https://img.zsaqwq.com/images/2022/03/11/ls.png)

- 拷贝文件/目录：`cp RawFilePath TargetFilePath` 如果拷贝目录，则在`cp`后加上参数`-rf`。另外TargetFilePath可以直接指定新文件的名字。

![cp](https://img.zsaqwq.com/images/2022/03/11/cp.png)

- 移动/重命名文件(目录)：`mv RawFilePath TargetFilePath` 如果移动目录，在`mv`后加参数`-rf`。同样，TargetFilePath可以直接指定移动后文件的名字，如果你不移动位置，那么就相当于只是单纯的重命名。

![mv](https://img.zsaqwq.com/images/2022/03/11/mv.png)

- 删除文件/目录：`rm FilePath`。如果是目录，在`rm`后加上参数`-rf`。

![rm](https://img.zsaqwq.com/images/2022/03/11/rm.png)

- 查看文件内容：`cat FilePath`将文件所有内容打印到屏幕。`tail FilePath`打印文件尾部内容。当然也可以使用编辑器打开文件来查看。一般linux系统自带vi或vim，可以用`vi FilePath`或`vim FilePath`打开文件。关于vi/vim的具体用法请见后文。

- 打包文件/目录为tar：`tar -cf ArchiveName.tar FileName`,其中`ArchiveName.tar`是打包后的文件名，FileName是要打包的文件或目录。FileName可以是多个，用空格隔开就行。

![tar1](https://img.zsaqwq.com/images/2022/03/11/tar1.png)

&emsp;&emsp;解释一下命令中的参数。`-c`代表create一个新的归档（Linux中的（压缩）包称为归档），`-f`表示后面接的是打包后或者要解压的file名。一般使用tar命令时，`-f`是必须有的，并且要写在最右边。同时使用多个参数只需把他们写在一起，就像上面示例那样。

- 解包：`tar -xf ArchiveName`，此命令将`ArchiveName`解包至当前目录。参数x表示extract。

![tar2](https://img.zsaqwq.com/images/2022/03/11/tar2.png)

- 打包并压缩：`tar -acvf ArchiveName FileName`。参数`-a`表示系统根据ArchiveName的后缀自动决定压缩包的类型。你也可以自己指定压缩类型，例如你要压缩为一个tat.gz的包，只需将`-a`换为`-z`，那么即使ArchiveName不是以tar.gz为后缀，系统也会将其压缩为tar.gz包。因为在Linux系统中，后缀往往起一个标识作用，并不能决定文件真正的类型。参数`-v`表示将包里的文件打印到屏幕上。在上面提到的tar命令中，你都可以加入`-v`来让屏幕输出包里的文件。

![tar3](https://img.zsaqwq.com/images/2022/03/11/tar3.png)
- 查看包内文件：`tar -tvf ArchiveName`

![tar4](https://img.zsaqwq.com/images/2022/03/11/tar4.png)

**关于tar命令的具体使用，请输入`tar --help`来查看帮助文档**

### 下载文件

&emsp;&emsp;在Linux中有两个常用的下载工具：wget和curl

&emsp;&emsp;若使用wget，输入命令`wget -O FileName URL`，URL是下载链接，FileName是下载后的文件名。可以在FileName中指定保存路径。如果不写`-O FileName`，则以默认文件名下载到当前目录。

![wget](https://img.zsaqwq.com/images/2022/03/11/wget.png)

&emsp;&emsp;curl用法类似：`curl -o FileName URL`，注意这里是小写o。

![wget](https://img.zsaqwq.com/images/2022/03/11/curl.png)


### 软件管理

&emsp;&emsp;Linux使用包管理器来管理软件（类似于360应用中心？hhh）。在Ubuntu中我们主要使用apt和apt-get来管理软件。apt是apt-get的升级版，两者共存于Ubuntu中，都可以管理系统中的软件。其他的包管理器还有yum、dpkg等。下面简单介绍apt/apt-get和yum的用法，其余包管理器在基础操作上大同小异，请自行百度。

#### 安装软件

`sudo apt install AppName`或`sudo yum install AppName`

#### 卸载软件
````
sudo apt purge AppName \\卸载软件及其配置文件和依赖软件包
sudo apt clean \\清理所有软件的安装包
````
<!--
## 设置环境变量

## 系统监控

### 查看系统配置

### 查看、杀死进程

### 查看显卡状态

### 后台挂起程序

# 从源码编译安装

# 软链接与硬链接
-->

## Vim/Vi的基本使用
### 什么是vim?
>Vim是从vi发展出来的一个文本编辑器。其代码补完、编译及错误跳转等方便编程的功能特别丰富，在程序员中被广泛使用。和Emacs并列成为类Unix系统用户最喜欢的编辑器。

简而言之，vim是一个常用且好用的文本编辑器，在服务器上你常常会使用它来编辑代码等一切文本相关的工作，在这节中我们会简单介绍一下vim的使用入门以及一些常用的操作指令。

特别推荐先敲个

```
vimtutor
```
从官方文档查看如何使用地表最强编辑器vim


### 从这里开始
基本上 vi/vim 共分为三种模式，分别是命令模式（Command mode），输入模式（Insert mode）和底线命令模式（Last line mode）。进入vim时首先会进入命令模式，此状态下敲击键盘动作会被Vim识别为命令，而非输入字符。可以按下i进入输入模式（最底部显示--insert--），或是:进入底线命令模式，以在最底一行输入命令。在输入模式中，我们可以通过ESC来推出输入模式，如果想要保存输入模式的更改，在推出输入模式之后按:切换到底线命令模式，并按wq即可保存，完整的流程即为vim打开->i进入输入->ESC推出->输入:->输入wq回车保存并退出vim。

<!--
## 具体操作解释以及常用操作汇总

# 编写Shell脚本

# Anaconda的基本使用

// TODO Anaconda这块可以独立拎出来，应该不是Linux基础。哪位有缘人把他拎出来?
-->

## 优雅的键入指令

很遗憾优雅的键入指令在任何一门课程上都是学不到的，只有实践或者口耳相传才可以做到

### 自动补全

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