---
template: overrides/main.html
author: JohnG-mit
hide:
  - navigation
---

# 致所有可爱的贡献者们

&emsp;&emsp;
你们好！非常感谢你们能够为该网站的建设与完善花费宝贵的时间与精力。我们衷心希望你们的努力与付出能够被更多的人所认可，并为他们带来切实的帮助。希望我们能够共同分享这份喜悦。为了提高开发效率，更好地支持您的工作，本页面将对文档开发细节进行简要的介绍，不仅是为了尽可能消除您在开发过程中遇到的障碍，也是为了统一工作流程，减轻网站维护者的负担。值得注意的是，本页的内容均取自 ***Material for MkDocs*** 官方文档页。如果您想参阅更多细节，请点击[这里](https://squidfunk.github.io/mkdocs-material/getting-started/)。

## 网站框架

&emsp;&emsp;
本站采用[Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)主题，由[MkDocs](https://www.mkdocs.org/)生成静态网页，并托管在[Github仓库](https://github.com/CSWU-Challenge/CSWU-Challenge.github.io)中。

## 撰写新文档

&emsp;&emsp;
为了提高您的工作效率，我们建议您将本站仓库克隆至本地后再进行添改。您可以使用 **Git Bash** 终端或是 **Windows下的WSL2 Ubuntu** 终端，输入以下指令克隆到本地。
```bash
git clone https://github.com/CSWU-Challenge/CSWU-Challenge.github.io
```
**这会在您终端中的当前目录生成 `CSWU-Challenge.github.io` 文件夹作为您项目的根目录。下文中所提及的根目录均指此意。**

!!! warning

    请注意，在您克隆项目时不要使用诸如Fastgit等国内代理，这可能导致您无法正常将所作的修改推送至远程仓库。

### 项目结构
&emsp;&emsp;
您可能已经注意到，在下图所示的页面中，具有这样的结构：

- 头部：导航栏，图中有 **Home, Wiki, High Light, Contributor, How-To, Download** 六个标签。
- 左侧：左侧导航栏，用于提供指向不同主题下各页面的链接。图中仅有Wiki一个主题及其下属的若干页面。
- 右侧：右侧导航栏，用于提供指向本页面各标题的索引。

<figure markdown>
  ![页面结构](https://johng-mit.cn/img/20220808215024.png)
  <!-- <figcaption>Image caption</figcaption> -->
</figure>

当您想要创建一个新文档时，您可能会想要将它添加到该标签下的左侧导航栏中。为此，我们将首先介绍本站的文件结构。

!!! warning

    请尽量不要更改头部导航栏中的内容。如果您确有此需求，请先联系网站管理人员进行协商，并在达成一致意见后再作改动。

&emsp;&emsp;
本站的文档统一存储在根目录下的docs目录中。不同类别的文档使用docs下属不同文件夹进行储存（例如wiki文件夹下存储着本站的用户手册）。如果您正在编写教程或手册文档，我们建议您也将其分类存储在wiki文件夹下。

!!! note

    请您在编写新文档时统一采用main模板。具体设置方法是在您的md文档开头引入如下内容：
    ```yaml
    ---
    template: overrides/main.html
    ---
    ```

### 将新文档添加到导航栏

<figure markdown>
  ![Page tree](https://johng-mit.cn/img/20220808215145.png){ width="203" }
</figure>

&emsp;&emsp;
您现在已经完成一个文档的编写工作，是时候将它添加到导航栏中了！为此，请您注意根目录下的 ***mkdocs.yml*** 文件。在该文件的末尾，您将看到如图所示的“ ***page tree*** ”。在 `nav` 变量下，第一级变量即是头部导航栏中的各个标签，它也将显示为该标签下左侧导航栏中的粗体标题。请您注意 `Wiki` 标签下的 `Linux基础教程` 这一变量，在上文的结构图中，它就是左侧导航栏中Wiki标签下的其中一个页面，变量名即是页面名称。 ***请注意，在 `nav` 中所有文件的路径均以docs作为根目录，因此您在指定文件路径时只需要写出文件在docs中的相对路径即可***。

&emsp;&emsp;
也许您也想在某个标签下的左侧导航栏中创建多个标题以对文档进行分类。我们假设您想在wiki标签下达成该效果，可以这样做：
```yaml
nav:
  - Home: index.md
  - Wiki:
    - Linux基础教程: wiki/Linux-base.md
    - 分类二: 
      - 文章一: ...
      - 文章二: ...
  ...
```

&emsp;&emsp;
一个简短的总结：nav标签下第一级变量为头部导航标签，第二级变量为标签下各子页面。若想在当前标签下创建新的分类标题，就在第二级变量下添加第三级变量。文件的路径是以docs为根目录的相对路径。

### 在本地生成静态页面预览
&emsp;&emsp;
在推送前，建议您先在本地预览添加或修改后的新页面，检查是否出现渲染错误、错别字等需要修正的地方。
```python
# 依赖
pip install mkdocs-material
pip install mkdocs-minify-plugin
pip install mkdocs-redirects

# 生成静态页面并通过本地访问
mkdocs serve
```