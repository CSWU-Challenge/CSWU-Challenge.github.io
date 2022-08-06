---
template: overrides/main.html
---

## 写在前面
本文主要整合了Windows 10系统下VSCode中配置$\LaTeX$工作环境的内容，有关其他编辑器的配置方案请自行查阅相关资料。

## $\LaTeX$入门教程
[一份（不太）简短的 LaTeX2ε 介绍](https://johng-mit.cn/docs/lshort-zh-cn.pdf)  
Github仓库地址：[CTeX-org/lshort-zh-cn](https://github.com/CTeX-org/lshort-zh-cn)  
对于初次接触$\LaTeX$写作的同学建议花一到两天时间把这份文档浏览一遍，之后可以保留以供随时查阅。

## Texlive安装
只需要一份教程（覆盖全平台）：[install-latex-guide-zh-cn](https://johng-mit.cn/docs/install-latex-guide-zh-cn.pdf)  
教程Github仓库地址（截至2022.08作者仍在持续更新）：[OsbertWang/install-latex-guide-zh-cn](https://github.com/OsbertWang/install-latex-guide-zh-cn)

### 补充：添加Windows系统环境变量
右击“此电脑”，随后“属性”->“高级系统设置”->“环境变量”。找到“系统变量”中的`Path`变量，点击编辑并新建`<TEXDIR>\bin\win32`，例如笔者的配置就是`C:\texlive\2022\bin\win32`。随后可能需要重启电脑。

## VSCode配置
### 插件安装
在VSCode应用商店中搜索 **LaTex Workshop** 并下载。

### 插件设置
#### Tip1: 通过右键菜单新建Tex文件
新建`.txt`文件并粘贴以下代码：

```
Windows Registry Editor Version 5.00
[HKEY_CLASSES_ROOT\.tex]
@="Code.exe"
[HKEY_CLASSES_ROOT\.tex\ShellNew]
"NullFile"=""
[HKEY_CLASSES_ROOT\Code.exe]
@="Tex"
```

修改文件后缀为`.reg`并双击运行。简单解释一下，`@="Code.exe"`指定了打开该后缀文件的程序，`@="Tex"`设置了右键菜单中新建一栏出现的文件名，例如按照上述方式设置，就会出现这样的效果：
![](https://johng-mit.cn/img/20220806131905.png)

这个小脚本可以让你默认使用VSCode打开新建的`.tex`文件。也许你想要仿照这个玩意自己整一些其他的“通过右键菜单新建xxx文件”，笔者在自己试验过程中发现如果不修改启动方式，也就是上述代码中的两处`Code.exe`（相当于你使用VSCode程序打开此类型的文件），会造成新建菜单中重名的现象。举个栗子，比如你还想使用VSCode打开`.ipynb`文件，然后把上面代码中所有的`.tex`改成了`.ipynb`，那么你新建菜单中原有的“Tex”也会变成你新设置的文件名（但是新建之后后缀还是`.tex`）。解决这个问题的办法就是在脚本中指定任意另一个默认程序即可（比如pycharm在笔者的电脑上就是`pycharm64.exe`）。

另附Windows平台下一款开源右键菜单管理软件：[BluePointLilac/ContextMenuManager](https://github.com/BluePointLilac/ContextMenuManager)

#### 真正的第一步
打开VSCode，按下`F1`，输入`setjson`并打开：
![](https://johng-mit.cn/img/20220806134433.png)

也许你会在空荡荡的页面中看到一对孤零零的大括号，也许大括号里面已经有许多让人看不懂的鬼玩意，不要管它们，接下来我们一步一步进行设置。

#### 设置编译链
复制并粘贴以下代码：

```json
"latex-workshop.latex.recipes": [
    {
        "name": "xelatex",
        "tools": [
            "xelatex"
        ]
    }, 
    {
        "name": "latexmk",
        "tools": [
            "latexmk"
        ]
    },
    {
        "name": "pdflatex -> bibtex -> pdflatex*2",
        "tools": [
            "pdflatex",
            "bibtex",
            "pdflatex",
            "pdflatex"
        ]
    },
    {
        "name": "xelatex -> bibtex -> xelatex*2",
        "tools": [
        "xelatex",
        "bibtex",
        "xelatex",
        "xelatex"
        ]
    }],
```

这样，你可以在Tex插件中看到

![](https://johng-mit.cn/img/20220806142616.png)

以上代码用于设置插件中可见的编译链，默认编译链需要放在首位。

#### 设置编译工具

```json
"latex-workshop.latex.tools": [
    {
      "name": "latexmk",
      "command": "latexmk",
      "args": [
        "-synctex=1",
        "-interaction=nonstopmode",
        "-file-line-error",
        "-pdf",
        "%DOCFILE%"
      ]
    }, 
    {
      "name": "xelatex",
      "command": "xelatex",
      "args": [
        "-synctex=1",
        "-interaction=nonstopmode",
        "-file-line-error",
        "%DOCFILE%"
      ]
    }, 
    {
      "name": "pdflatex",
      "command": "pdflatex",
      "args": [
        "-synctex=1",
        "-interaction=nonstopmode",
        "-file-line-error",
        "%DOCFILE%"
      ]
    }, 
    {
      "name": "bibtex",
      "command": "bibtex",
      "args": [
        "%DOCFILE%"
      ]
    }],
```

以上代码可以设置各编译工具所对应的具体命令参数，顺序可以更改。

#### 设置清理文件

```json
"latex-workshop.latex.clean.fileTypes": [
      "*.aux",
      "*.bbl",
      "*.blg",
      "*.idx",
      "*.ind",
      "*.lof",
      "*.lot",
      "*.out",
      "*.toc",
      "*.acn",
      "*.acr",
      "*.alg",
      "*.glg",
      "*.glo",
      "*.gls",
      "*.ist",
      "*.fls",
      "*.log",
      "*.fdb_latexmk"
    ],
```

清理按钮清理的文件。

#### 设置pdf文件默认预览方式

```json
"latex-workshop.view.pdf.viewer": "tab",
```

`tab`为插件内置的预览窗口，笔者目前主要使用这种预览方式。对于长篇文章，更推荐通过外部程序（如SumatraPDF）来预览。

#### 配置SumatraPDF（外部pdf浏览器）及正反向搜索

```json
"latex-workshop.view.pdf.ref.viewer":"external",
    //外部pdf预览器程序路径
    "latex-workshop.view.pdf.external.viewer.command": "C:/texlive/SumatraPDF/SumatraPDF.exe",
    
    "latex-workshop.view.pdf.external.viewer.args": [
        "%PDF%"
    ],
    
    //配置正向搜索
    "latex-workshop.view.pdf.external.synctex.command":"C:/texlive/SumatraPDF/SumatraPDF.exe",
    "latex-workshop.view.pdf.external.synctex.args":[
        "-forward-search",
        "%TEX%",
        "%LINE%",
        "%PDF%"
    ],
```

注意需要将代码中外部浏览器路径改为你自己安装的路径。插件默认的正向搜索快捷键为`Ctrl+Alt+J`，反向搜索快捷键为`Ctrl+鼠标单击`。

对于反向搜索，提供两种方式：

1. （推荐）打开SumatraPDF程序，“设置”->“选项”底部“设置反向搜索命令行”，粘贴：
   ```
    "D:\Apps\Microsoft VS Code\Code.exe" "D:\Apps\Microsoft VS Code\resources\app\out\cli.js"  --ms-enable-electron-run-as-node -r -g "%f:%l"
   ```
   注意修改VSCode路径为你自己安装的路径。
2. 打开SumatraPDF程序，“设置”->“高级选项”，在任意位置粘贴：
   ```
    InverseSearchCmdLine = "D:\Code\VS code\Microsoft VS Code\Code.exe" "D:\Code\VS code\Microsoft VS Code\resources\app\out\cli.js"  --ms-enable-electron-run-as-node -r -g "%f:%l"
    EnableTeXEnhancements = true
   ```
   注意修改VSCode路径为你自己安装的路径。
    
两种方式本质上是一样的，第一种更方便。

#### 其他杂项
```json
    //禁用保存时编译（强烈推荐）
    "latex-workshop.latex.autoBuild.run": "never",
    //取消编译失败时右下角出现的错误信息弹窗（推荐）
    "latex-workshop.message.error.show": false,
    "latex-workshop.message.warning.show": false,
```

#### 完整配置代码
```json
    //LaTex Setting

    //设置插件中可见的编译链，默认编译链需要放在首位
    "latex-workshop.latex.recipes": [
    {
        "name": "xelatex",
        "tools": [
            "xelatex"
        ]
    }, 
    {
        "name": "latexmk",
        "tools": [
            "latexmk"
        ]
    },
    {
        "name": "pdflatex -> bibtex -> pdflatex*2",
        "tools": [
            "pdflatex",
            "bibtex",
            "pdflatex",
            "pdflatex"
        ]
    },
    {
        "name": "xelatex -> bibtex -> xelatex*2",
        "tools": [
        "xelatex",
        "bibtex",
        "xelatex",
        "xelatex"
        ]
    }],
    //设置各编译工具所对应的具体命令参数
    "latex-workshop.latex.tools": [
    {
      "name": "latexmk",
      "command": "latexmk",
      "args": [
        "-synctex=1",
        "-interaction=nonstopmode",
        "-file-line-error",
        "-pdf",
        "%DOCFILE%"
      ]
    }, 
    {
      "name": "xelatex",
      "command": "xelatex",
      "args": [
        "-synctex=1",
        "-interaction=nonstopmode",
        "-file-line-error",
        "%DOCFILE%"
      ]
    }, 
    {
      "name": "pdflatex",
      "command": "pdflatex",
      "args": [
        "-synctex=1",
        "-interaction=nonstopmode",
        "-file-line-error",
        "%DOCFILE%"
      ]
    }, 
    {
      "name": "bibtex",
      "command": "bibtex",
      "args": [
        "%DOCFILE%"
      ]
    }],
    //设置pdf文件默认预览方式，'tab'为插件自带预览
    "latex-workshop.view.pdf.viewer": "tab",
    //设置清理文件
    "latex-workshop.latex.clean.fileTypes": [
      "*.aux",
      "*.bbl",
      "*.blg",
      "*.idx",
      "*.ind",
      "*.lof",
      "*.lot",
      "*.out",
      "*.toc",
      "*.acn",
      "*.acr",
      "*.alg",
      "*.glg",
      "*.glo",
      "*.gls",
      "*.ist",
      "*.fls",
      "*.log",
      "*.fdb_latexmk"
    ],

    //配置外部pdf预览器
    "latex-workshop.view.pdf.ref.viewer":"external",
    //外部pdf预览器程序路径
    "latex-workshop.view.pdf.external.viewer.command": "C:/texlive/SumatraPDF/SumatraPDF.exe",
    
    "latex-workshop.view.pdf.external.viewer.args": [
        "%PDF%"
    ],
    
    //配置正向搜索
    "latex-workshop.view.pdf.external.synctex.command":"C:/texlive/SumatraPDF/SumatraPDF.exe",
    "latex-workshop.view.pdf.external.synctex.args":[
        "-forward-search",
        "%TEX%",
        "%LINE%",
        "%PDF%"
    ],
    //禁用保存时编译（强烈推荐）
    "latex-workshop.latex.autoBuild.run": "never",
    //取消编译失败时右下角出现的错误信息弹窗
    "latex-workshop.message.error.show": false,
    "latex-workshop.message.warning.show": false,
```

### 快捷键设置
打开VSCode，按下`F1`，输入`keyboardjson`。下面列举笔者对几个快捷键的设置。

- 编译
  ```json
  {
        "key": "alt+b",
        "command": "latex-workshop.build",
        "when": "editorTextFocus"
  },
  ```
- 终止编译
  ```json
  {
        "key": "alt+t",
        "command": "latex-workshop.kill",
        "when": "editorTextFocus && !isMac"
  },
  ```
- 使用默认tab窗口预览
  ```json
  {
        "key": "ctrl+r",
        "command": "latex-workshop.view",
        "when": "!config.latex-workshop.bind.altKeymap.enabled && !virtualWorkspace && editorLangId =~ /^latex$|^latex-expl3$|^rsweave$|^jlweave$/"
  },
  ```
- 使用外部程序预览
  ```json
  {
        "key": "ctrl+t",
        "command": "latex-workshop.viewExternal"
  },
  ```
- 正向搜索
  ```json
  {
        "key": "alt+s",
        "command": "latex-workshop.synctex",
        "when": "editorTextFocus && !isMac"
  },
  ```

另一种修改快捷键的方式：按下`F1`，点击任意一项右侧的齿轮图标
![](https://johng-mit.cn/img/20220806153453.png)

在搜索框中搜索`latex`，按需更改即可。
![](https://johng-mit.cn/img/20220806153738.png)

## 编译优化（可选）
经历前面所提到的过程后，你应该已经完成了VSCode的$\LaTeX$工作环境配置，迫不及待地想要开始码字了！但是先别急，Windows的IO设计使得编译过程大大慢于Linux系统。所以我强烈建议跟随微软官方的[安装 WSL](https://docs.microsoft.com/zh-cn/windows/wsl/install)教程安装一个Ubuntu子系统，随后跟随本文开头部分“TexLive安装”中的教程安装好子系统上的TexLive。当然，在使用WSL的过程中可能会遇到一些小挫折，下面我将会列举一些问题的解决办法。
### 将Microsoft Store中下载的Ubuntu子系统迁移至其他位置（强烈推荐）
我经常跟身边的朋友们强调少在C盘安装东西，一定要搞清楚自己的那些软件到底安装在了哪里，对于WSL系统，这是非常必要的，因为你用`apt install`安装的所有东西都会保存在子系统的目录内。长此以往C盘必定会越来越拥挤🤣。

首先下载一个开源工具：[LxRunOffline](https://github.com/DDoSolitary/LxRunOffline/releases)，选择msvc那个版本。

在下载目录用管理员权限打开Powershell，然后
```bash
# 查看现有WSL信息
.\LxRunOffline.exe list
# 迁移到目标地址：-n指定WSL，-d指定目标地址
.\LxRunOffline.exe move -n Ubuntu-20.04 -d D:\Ubuntu

# Waiting...~

# 查看迁移后的地址，观察是否迁移成功
.\LxRunOffline.exe get-dir -n Ubuntu-20.04
```

迁移过程中如果出现报错，可以参考[这篇文章](https://blog.csdn.net/jkirin/article/details/123825586?spm=1001.2101.3001.6661.1&utm_medium=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7Edefault-1-123825586-blog-119619598.pc_relevant_multi_platform_featuressortv2dupreplace&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7Edefault-1-123825586-blog-119619598.pc_relevant_multi_platform_featuressortv2dupreplace&utm_relevant_index=1)。

### “参考的对象类型不支持尝试的操作”
首先下载[NoLSP.exe](https://johng-mit.cn/tool/nolsp.exe)。
把它放到C盘，使用管理员权限打开CMD或Powershell，输入
```
.\nolsp.exe C:\WINDOWS\system32\wsl.exe
```
出现`Success!`说明已解决。

### Tip2：从资源管理器进入WSL文件夹
资源管理器地址栏输入`\\wsl$`，之后转到你的家目录，复制目录路径，在“此电脑”页面右键新建一个网络位置，粘贴路径即可。

### 编译优化策略
首先可以浏览一下[这篇文章](https://zhuanlan.zhihu.com/p/55043560)。
笔者比较推荐的做法是直接将Latex文件夹建立在WSL系统中，通过VSCode的Remote-WSL打开文件夹进行编辑。确定好导言区所使用的宏包之后在bash命令行中输入
```bash
etex -initialize -jobname="<file name>" "&xelatex" "mylatexformat.ltx" "<file name>"
```
注意编译引擎依据需要更改，随后
```bash
# 编译并输出信息
xelatex -shell-escape -synctex=1 "&<file name>" <file name>.tex

# 或

# 静默编译
xelatex -shell-escape -synctex=1 -interaction=batchmode "&xelatex" <file name>.tex
```

可以自己写个简单的sh脚本或者makefile。对于具有参考文献的内容也可以自行使用脚本定制编译。

或者，在Remote-WSL窗口按`F1`搜索`remotejson`打开远程设置，然后粘贴
```json
"latex-workshop.latex.tools": [
        {
            "name": "xelatex-silent",
            "command": "xelatex",
            "args": [
            "-synctex=1",
            "-shell-escape",
            "-interaction=batchmode",
            "&xelatex",
            "%DOCFILE%"
            ]
        },
        {
            "name": "xelatex",
            "command": "xelatex",
            "args": [
            "-synctex=1",
            "-shell-escape",
            "&xelatex",
            "%DOCFILE%"
            ]
        },
        {
            "name": "pdflatex-silent",
            "command": "pdflatex",
            "args": [
            "-synctex=1",
            "-shell-escape",
            "-interaction=batchmode",
            "&pdflatex",
            "%DOCFILE%"
            ]
        },
        {
            "name": "pdflatex",
            "command": "pdflatex",
            "args": [
            "-synctex=1",
            "-shell-escape",
            "&pdflatex",
            "%DOCFILE%"
            ]
        },
        {
            "name": "latexmkpdf",
            "command": "latexmk",
            "args": [
            "-synctex=1",
            "-interaction=nonstopmode",
            "-halt-on-error","-file-line-error",
            "-pdf",
            "%DOCFILE%"
            ]
        },
        {
            "name": "latexmkxe",
            "command": "latexmk",
            "args": [
            "-synctex=1",
            "-interaction=nonstopmode",
            "-halt-on-error",
            "-file-line-error",
            "-xelatex",
            "%DOCFILE%"
            ]
        },
    ],
    "latex-workshop.latex.recipes": [
        {
            "name": "xelatex-silent",
            "tools": [
            "xelatex-silent"
            ]
        },
        {
            "name": "xelatex",
            "tools": [
            "xelatex"
            ]
        },
        {
            "name": "pdflatex-silent",
            "tools": [
            "pdflatex-silent"
            ]
        },
        {
            "name": "pdflatex",
            "tools": [
            "pdflatex"
            ]
        },
        {
            "name": "latexmkxe",
            "tools": [
            "latexmkxe"
            ]
        },
        {
            "name": "latexmkpdf",
            "tools": [
            "latexmkpdf"
            ]
        },
    ],
"latex-workshop.latex.autoBuild.run": "never",
"latex-workshop.view.pdf.viewer": "tab",
// "latex-workshop.view.pdf.ref.viewer": "external",
// "latex-workshop.view.pdf.external.viewer.command": "/mnt/c/texlive/SumatraPDF/SumatraPDF.exe",
// "latex-workshop.view.pdf.external.viewer.args": [
// "-inverse-search",
// "/mnt/d/Apps/Microsoft\ VS\ Code/bin/bin/code.cmd\" -r -g \"%f:%l\"",
// "%PDF%"
// ],
// "latex-workshop.view.pdf.external.synctex.command":"/mnt/c/texlive/SumatraPDF/SumatraPDF.exe",
// "latex-workshop.view.pdf.external.synctex.args":[
// "-forward-search",
// "%TEX%",
// "%LINE%",// "%PDF%",
// ],
```
即可。如果这么干，那么对于新的tex文件只需要在确定好导言区后通过bash利用etex预编译，之后可以直接用快捷键进行编译，不需要再打开命令行了。