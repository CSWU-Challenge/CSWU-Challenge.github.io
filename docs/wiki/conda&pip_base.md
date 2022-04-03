---
template: overrides/main.html
---

# conda 和 pip 基础

在超算竞赛中有些赛题是基于python环境的，这时候需要我们安装配置环境，而赛题要求的软件有很多包的依赖版本的要求，往往系统自带的python2，python3 的版本不能够有很好的支持。

这时候我们可以创建虚拟环境，在虚拟环境中安装软件、package以及其他的配置，而不需要改动系统默认的环境，这样改动比较灵活方便。

**虚拟环境是一个隔离的环境，你在虚拟环境中安装、卸载包不会影响到系统环境以及其他虚拟环境。**

**注意，这里的隔离一般指隔离python环境，而HPL，HPCG这些独立软件的安装与环境配置还是需要更改系统文件与环境的。**

conda就是一个创建和管理虚拟环境的工具。除了conda外还有其他的软件工具比如virtualenv。

Anaconda是一个包管理工具，他不仅集成了conda，还可以安装和管理python包。因此我们建议使用anaconda来管理虚拟环境。

除了Anaconda，Intel OneAPI 中也有Intel 提供的conda 工具，我们可以从官网上下载通过离线包安装，或者在线安装。

第一次使用的时候 需要激活 conda base环境

```bash
conda activate
```

然后你的命令行开头用户名前面就有一个`(base)` 表明当前的是base 环境，也是默认环境

## 查看环境列表

## 创建/删除环境

```bash
conda create -n envname python=version # -n 表示 name
#整体删除envname
conda remove envname --all 
#clone 拷贝迁移环境 假设已有环境名为A，需要生成的环境名为B
clone create -n B --clone A
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
#### pip 
```bash
pip install -r PathtoRequirementFile/requirements.txt
```
#### conda 
```bash
conda install --yes--file requirements.txt
```

### 导出环境配置
批量导出包含环境中所有组件的requirements.txt文件
#### pip 
```bash
pip freeze > requrirements.txt
```
#### conda
```bash
conda list -e >requirements.txt
```
