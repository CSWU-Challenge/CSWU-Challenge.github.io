# conda 和 pip 基础

在超算竞赛中有些赛题是基于python环境的，这是候需要我们安装配置环境，而赛题要求的软件有很多包的依赖版本的要求，往往系统自带的python2，python3 的版本不能够有很好的支持。

这时候我们可以通过创建虚拟环境，在虚拟环境中进行相关的配置，而不需要改动系统默认的环境，这样改动比较灵活方便。

除了conda外还有其他的软件工具比如virtualenv

conda 常用的有anaconda，Intel OneAPI 中也有Intel 提供的conda 工具，我们可以从官网上下载通过离线包安装，或者在线安装。

第一次使用的时候 需要激活 conda base环境

```bash
conda activate
```

然后你的命令行开头用户名前面就有一个`(base)` 表明当前的是base 环境，也是默认环境

查看环境列表

## 创建/删除环境

```bash
conda create -n envname python=version
```

进入环境

```bash
conda activate envname
```

退出环境

```bash
conda deactivate
```

## 为环境添加/删除包

```bash
conda install package

conda install package=version
```



### 依据requirements.txt批量安装包

## 导出环境配置

