# Markdown 笔记编写与发布指南

这份指南说明 Markdown 文件放在哪里、如何编写课程笔记、如何在本地查看渲染效果，以及如何发布到 GitHub Pages。

本站继续使用 **MkDocs Material**：你编辑的是 `notes-src/` 中的 Markdown 源文件，浏览器看到的是 MkDocs 生成的网页，线上地址为 <https://am-sush.github.io/notes/>。

!!! info "最短工作流"
    1. 在 `notes-src/<课程>/` 新建或修改 `.md` 文件。
    2. 在 `mkdocs.yml` 的 `nav` 中登记新页面。
    3. 本地运行 `mkdocs serve`，打开 <http://127.0.0.1:8000> 检查。
    4. `git add`、`git commit`、`git push`；GitHub Actions 会自动构建并更新线上站点。

## 先记住这张地图

| 想修改的内容 | 修改位置 | 是否需要编辑器 |
| --- | --- | --- |
| Work 区项目名称、简介、标签、链接 | 根目录 `index.html` | 普通代码编辑器即可 |
| 课程笔记正文 | `notes-src/<课程>/xxx.md` | 普通文本编辑器即可，推荐 VS Code |
| 课程名称、章节顺序 | 根目录 `mkdocs.yml` | 普通代码编辑器即可 |
| 笔记站首页课程卡片 | `notes-src/index.md` | 普通代码编辑器即可 |
| 笔记站整体颜色和排版 | `notes-src/stylesheets/journal.css` | 普通代码编辑器即可 |

## 文件应该放在哪里

课程笔记只放在 `notes-src/`，不要直接编辑构建产物 `notes/`。`notes/` 已加入 `.gitignore`，由 GitHub Actions 自动生成。

```text
notes-src/
├── index.md                 # 笔记站首页
├── editing-guide.md         # 本指南
├── os/                       # 一门课程一个目录
│   ├── index.md              # 课程概览
│   ├── process-thread.md     # 普通 Markdown 笔记
│   └── assets/               # 图片、PDF 等资源
├── networks/
├── dsa/
└── distributed/
```

文件夹名和文件名建议使用英文小写加短横线，例如 `machine-learning/attention.md`。图片、PDF 等资源放在对应课程的 `assets/` 下；在 Markdown 中用相对路径引用，例如 `![架构图](assets/architecture.png)`。

每个新增页面都要在 `mkdocs.yml` 的 `nav` 中登记，否则不会出现在左侧导航中。课程首页通常命名为 `index.md`。

## 编辑器与本地环境

推荐使用 VS Code，安装 **Markdown All in One**；普通文本编辑器也可以，Markdown 本质上是 UTF-8 纯文本。

在 Windows PowerShell 中，首次使用可以在仓库外创建虚拟环境：

```powershell
python -m venv ..\am-sush-notes-venv
..\am-sush-notes-venv\Scripts\Activate.ps1
python -m pip install -r requirements-notes.txt
```

如果你使用已有的 Conda 环境，则运行：

```powershell
conda activate am-sush-notes
python -m pip install -r requirements-notes.txt  # 首次或依赖变更时执行
```

## 本地查看渲染后的样子

在仓库根目录执行：

```powershell
mkdocs serve
```

然后打开 <http://127.0.0.1:8000>。保存 `notes-src/` 下的 Markdown 后，页面会自动重新构建并刷新；终端按 `Ctrl+C` 停止服务。发布前建议再执行一次严格检查：

```powershell
mkdocs build --strict
```

该命令会检查导航、页面链接等问题；出现 warning 时先修复再提交。

## 修改主页 Work 项目

打开根目录的 `index.html`，搜索项目名称（例如 `PPTAS`）。每个项目对应一个 `.work-card`：

```html
<div class="work-card" data-cat="ai" data-id="ai-0">
  <h3 class="card-title">PPTAS</h3>
  <p class="card-sub">演示内容扩展智能体</p>
  <p class="card-desc-zh">自动解析结构 · 语义检索 · 知识扩展。</p>
  <ul class="card-tags"><li>Agent</li><li>RAG</li></ul>
  <a class="card-link" href="https://github.com/...">View on GitHub ↗</a>
</div>
```

直接替换文字即可：`card-title` 是项目名，`card-sub` 是一句话定位，`card-desc-zh` 是中文简介，`card-tags` 是技术标签，`card-link` 是项目地址。`data-id` 必须保持唯一；删除项目时同时删除对应的时间轴 `rail-item` 和详情卡，并把同一分类的数量与 `/ 总数` 更新。

如果要新增项目，复制同分类的一组 `rail-item` 与 `.work-card`，修改 `data-id`、序号、文字和链接。项目较多时可运行：

```bash
python add_note.py new-course compiler "编译原理" --en "Compilers" --desc "词法·语法·代码生成" --tags "Compiler,PL"
```

它会自动创建课程目录、注册导航并把课程加入 Work 区。

## 编写一篇课程笔记

可以直接修改 `.md` 文件，不需要专门的图形化编辑器。推荐 VS Code；想即时预览时运行上面的 `mkdocs serve`，浏览器会在保存后自动刷新。

### 推荐的文章骨架

```markdown
# 进程调度：从目标到实现

> 一句话说明本篇解决什么问题，以及读完能带走什么。

## 问题与背景
先说场景：为什么需要调度？输入、约束和目标分别是什么？

## 核心概念
用短段落解释术语。第一次出现时给出英文名或缩写。

## 工作流程
1. 收集就绪队列
2. 按策略选择进程
3. 保存与恢复上下文

## 一个最小例子
用具体数字、伪代码或抓包结果验证概念。

```python
ready = sorted(processes, key=lambda p: p.arrival)
```

!!! tip "记忆点"
    用两三句话写出最容易混淆的结论。

## 易错点与复盘
- 把响应时间和周转时间混为一谈
- 忽略时间片耗尽后的上下文切换

## 延伸阅读
- [官方文档](https://example.com)
```

### 让笔记更好读的具体做法

- **一节只回答一个问题**：标题写成“为什么需要三次握手？”比“TCP”更容易检索。
- **先结论，后推导**：复杂公式先给变量含义，再给推导过程；长推导放进 `??? note` 折叠块。
- **概念配证据**：网络章节放抓包截图或命令输出，算法章节放输入、输出和复杂度。
- **保持可复现**：代码块标明语言；实验写清环境、命令和预期结果。
- **控制段落长度**：每段 2–4 句；使用列表拆分并列信息。
- **链接写清目的**：使用“查看 RFC 793”这类描述，避免单独放一串 URL。

## 常用 Markdown 写法（可直接复制）

```markdown
**重点**、*强调*、`变量名`

| 项目 | 含义 |
| --- | --- |
| O(1) | 常数时间 |

![架构图](assets/architecture.png)

!!! warning "注意"
    说明一个边界条件或常见误区。

???+ example "展开查看推导"
    默认展开的折叠块。

## 特殊强调与版式组件

### 提示框：边框、底色和图标

Material 主题内置多种提示框。它们会自动带有左侧色条、浅色背景和图标：

```markdown
!!! note "概念"
    用来解释一个定义或背景。

!!! tip "技巧"
    给出一个实用技巧或记忆方法。

!!! success "结论"
    表示已经验证的结论。

!!! warning "注意"
    提醒边界条件或常见误区。

!!! danger "危险操作"
    提醒可能造成数据丢失或系统故障的操作。

!!! abstract "摘要"
    快速概括本节内容。

!!! quote "原文"
    引用教材、论文或 RFC 中的关键句子。
```

常用类型包括 `note`、`info`、`tip`、`success`、`warning`、`danger`、`bug`、`example`、`abstract` 和 `quote`。标题可以换成任何中文文字。

### 可折叠强调

使用 `???` 创建默认收起的内容，使用 `???+` 创建默认展开的内容：

```markdown
??? note "点击查看详细推导"
    这里放较长的证明、推导或补充说明。

???+ example "默认展开的示例"
    这里的内容会直接显示，但仍然可以收起。
```

### 自定义底色面板

如果需要更像“卡片”的纯色面板，可以使用项目自定义的 `note-panel`：

```markdown
<div class="note-panel note-panel--blue" markdown>

**核心结论**

进程是资源分配的基本单位，线程是调度和执行的基本单位。

</div>
```

可用样式：

```markdown
<div class="note-panel note-panel--red" markdown>红色重点或警告</div>
<div class="note-panel note-panel--blue" markdown>蓝色概念或补充</div>
<div class="note-panel note-panel--gray" markdown>灰色背景的旁注</div>
```

### 选项卡

适合并列展示不同语言、不同平台或不同方案：

```markdown
=== "Python"
    ```python
    print("hello")
    ```

=== "Go"
    ```go
    fmt.Println("hello")
    ```
```

### 卡片网格

适合在课程首页或章节开头展示多个主题：

```markdown
<div class="grid cards" markdown>

-   **进程**

    ---

    资源分配和隔离的基本单位。

-   **线程**

    ---

    CPU 调度和执行的基本单位。

</div>
```

### 其他常用强调

```markdown
<!-- 键盘按键 -->
按下 ++ctrl+c++ 停止本地服务。

<!-- 高亮文本 -->
==这是需要特别注意的句子==

<!-- 上标和下标 -->
水的化学式是 H~2~O，面积单位是 m^2^。

<!-- 带目标的链接按钮 -->
[查看 RFC 793](https://www.rfc-editor.org/rfc/rfc793){ .md-button .md-button--primary }
```

=== "Python"
    ```python
    print("hello")
    ```

=== "Go"
    ```go
    fmt.Println("hello")
    ```

行内公式：`$O(n \log n)$`

$$
T(n)=2T(n/2)+n
$$
```

### 嵌套列表层级

无序列表通过缩进表示子级。建议每一级使用 **4 个空格**，这样在不同 Markdown 编辑器中都能稳定识别：

```markdown
- 一级：OS 角色
    - 二级：管理
        - 三级：CPU
        - 三级：内存
    - 二级：隔离
```

本站样式将三级列表显示为：

- 一级：实心圆（`disc`）
    - 二级：空心圆（`circle`）
        - 三级：方块（`square`）

如果页面只显示两层，先检查每个子列表是否相对父列表多缩进 4 个空格，并确认父级项目和子列表之间没有被空行或其他段落打断。

## 发布前检查

1. 文件放在正确的 `notes-src/<课程>/` 目录，文件名使用小写短横线。
2. 图片/PDF 放在对应课程的 `assets/`，并检查相对路径。
3. 在 `mkdocs.yml` 的 `nav` 中登记新页面。
4. 本地运行 `mkdocs serve`，检查目录、图片、代码、公式和移动端显示。
5. 运行 `mkdocs build --strict`，确认没有 warning。
6. 提交并推送：

```bash
git add notes-src/ mkdocs.yml index.html
git commit -m "notes: update course notes"
git push
```

GitHub Actions 会自动构建 `notes/`。通常等待约一分钟即可在线查看；可在 GitHub 仓库的 **Actions → Rebuild Notes Site** 查看构建日志。若构建失败，先阅读日志中具体的文件名和行号，在本地修复后再次 push。
