# 笔记管理手册

本站用 [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) 构建。
笔记源文件在 `notes-src/`；构建产物 `notes/` **由 GitHub Actions 自动提交**，本地无需、也不应把 `notes/` 加入 git。

!!! info "核心原则"
    **只管往 `notes-src/` 里放文件，push 后一切自动生效。**

---

## 快速上手

### 日常只需三步

1. 把 `.md` 或 PDF 放进 `notes-src/<课程>/`
2. 在 `mkdocs.yml` 里登记导航（或用脚本自动完成）
3. `git add . && git commit && git push`

push 后约 1 分钟，CI 自动重建，笔记站即刻更新。

### 自动化脚本（推荐）

仓库根目录提供了 `add_note.py`，**一条命令搞定文件创建 + 导航注册 + 主页卡片**：

```bash
# 新建课程（自动创建目录、更新 mkdocs.yml 和主页 Work 区）
python add_note.py new-course compiler "编译原理" --en "Compilers" --desc "词法·语法·代码生成" --tags "Compiler,PL"

# 往已有课程里加 Markdown 笔记
python add_note.py add-md distributed consensus "共识算法"

# 往已有课程里加 PDF 笔记（自动复制 PDF + 生成内嵌页）
python add_note.py add-pdf os D:/notes/lab1.pdf "实验一：进程调度"
```

脚本运行完，只需 `git add . && git commit && git push` 即可上线。

---

## 目录结构

```
am-sush.github.io/
├── index.html              ← 个人主页（Work 区展示课程卡片）
├── mkdocs.yml              ← 笔记站导航配置
├── add_note.py             ← 笔记管理脚本
└── notes-src/              ← ★ 所有笔记源文件放这里
    ├── index.md            ← 笔记站首页
    ├── os/                 ← 操作系统
    │   ├── index.md
    │   ├── process-thread.md
    │   └── assets/         ← PDF、图片等资源
    ├── networks/           ← 计算机网络
    ├── dsa/                ← 数据结构与算法
    ├── distributed/        ← 分布式计算系统
    │   ├── index.md
    │   ├── mindmap.md      ← 内嵌 PDF 查看页
    │   ├── summary.md
    │   └── assets/
    │       ├── mindmap.pdf
    │       └── summary.pdf
    └── <新课程>/           ← 按同样结构扩展
        ├── index.md
        └── assets/
```

**规则：**

- 每门课程一个文件夹，文件夹名用**英文小写短横线**（如 `compiler`、`machine-learning`）
- 每门课程必须有 `index.md`（课程概览页）
- PDF、图片等二进制资源放在课程文件夹下的 `assets/` 子目录
- Markdown 笔记直接放在课程文件夹根部

---

## 一、新建一门课程

### 用脚本（推荐）

```bash
python add_note.py new-course <slug> <显示名> [--en <英文名>] [--desc <描述>] [--tags <标签>]
```

脚本会自动完成：

- [x] 创建 `notes-src/<slug>/` 和 `assets/`
- [x] 生成 `index.md` 模板
- [x] 在 `mkdocs.yml` 导航里注册
- [x] 在主页 `index.html` Work 区添加卡片

### 手动操作

如果不用脚本，需依次完成以下 3 处修改：

**1. 创建目录和 index.md**

```
notes-src/
└── compiler/
    ├── index.md
    └── assets/       ← 创建空目录，后续放 PDF/图片
```

**2. 在 `mkdocs.yml` 添加导航**

```yaml
nav:
  # ... 已有课程 ...
  - 编译原理:                          # ← 新增
      - 概览: compiler/index.md        # ← 新增
  - 使用说明:
      - 笔记管理手册: how-to.md
```

**3. 在 `index.html` Work 区添加卡片**

找到 `<!-- notes-rail-end -->` 标记，在它**之前**插入：

```html
<li class="rail-item" data-id="notes-N">
  <span class="rail-node" aria-hidden="true"></span>
  <span class="rail-no">0N</span>
  <span class="rail-name">编译原理</span>
</li>
```

找到 `<!-- notes-cards-end -->` 标记，在它**之前**插入详情卡。同时把 `rail-cat-count` 和所有 notes 卡片的 `tot` 数字加 1。

---

## 二、添加 Markdown 笔记

### 用脚本

```bash
python add_note.py add-md os process-thread "进程与线程"
```

### 手动操作

**1. 放文件**

```
notes-src/os/
└── process-thread.md      ← 新增
```

文件开头写一级标题：

```markdown
# 进程与线程

正文从这里开始。
```

**2. 在 `mkdocs.yml` 登记**

```yaml
  - 操作系统:
      - 概览: os/index.md
      - 进程与线程: os/process-thread.md   # ← 新增
```

**3. 推送**

```bash
git add notes-src/ mkdocs.yml
git commit -m "notes(os): 进程与线程"
git push
```

---

## 三、添加 PDF 笔记（内嵌阅读）

### 用脚本（推荐）

```bash
python add_note.py add-pdf distributed D:/notes/mindmap.pdf "思维导图"
```

脚本自动完成：复制 PDF → 生成带 iframe 内嵌的 `.md` → 注册导航。

### 手动操作

**1. 放 PDF**

```
notes-src/distributed/
└── assets/
    └── mindmap.pdf      ← 新增
```

**2. 创建内嵌查看页**

新建 `notes-src/distributed/mindmap.md`：

```markdown
# 思维导图

<iframe
  src="../assets/mindmap.pdf#toolbar=1&view=FitH"
  type="application/pdf"
  width="100%"
  height="800"
  loading="lazy"
  style="border:1px solid var(--md-default-fg-color--lightest); border-radius:6px;">
</iframe>

!!! tip "如未正常显示"
    部分浏览器不支持内嵌 PDF，请点击下方「新标签页查看」。

[:material-open-in-new: 新标签页查看](assets/mindmap.pdf){:target="_blank"} &emsp;
[:material-download: 下载 PDF](assets/mindmap.pdf){:download}
```

!!! warning "路径要点"
    - `<iframe src="...">` 里用 `../assets/xxx.pdf`（相对于构建后的 HTML）
    - Markdown 链接 `[text](...)` 里用 `assets/xxx.pdf`（相对于 `.md` 源文件，MkDocs 自动调整）

**3. 在 `mkdocs.yml` 登记 + 推送**

---

## 四、数学公式

已配置 MathJax，直接用 `$$ ... $$` 写行间公式，`$ ... $` 写行内：

```markdown
$$
E = mc^2
$$

行内：当 $a \ne 0$ 时，方程 $ax^2 + bx + c = 0$ 有解。
```

---

## 五、常用 Markdown 元素

!!! note "提示框"
    `!!! note "标题"`

??? example "可折叠块（点击展开）"
    `??? example "标题"` 默认收起。

=== "Tab A"

    ```python
    print("tabbed content")
    ```

=== "Tab B"

    用 `=== "标签名"` 做选项卡。

---

## 六、本地预览

```bash
conda activate am-sush-notes
mkdocs serve
```

打开 `http://127.0.0.1:8000`，保存文件即时刷新。

---

## 目录速查

| 课程           | 源码目录                     | 线上路径               |
| -------------- | ---------------------------- | ---------------------- |
| 操作系统       | `notes-src/os/`              | `/notes/os/`           |
| 计算机网络     | `notes-src/networks/`        | `/notes/networks/`     |
| 数据结构与算法 | `notes-src/dsa/`             | `/notes/dsa/`          |
| 分布式计算系统 | `notes-src/distributed/`     | `/notes/distributed/`  |

## 完整工作流一图流

```
你的 PDF/Markdown
       │
       ▼
  notes-src/<课程>/         ← 放文件
       │
       ▼
  mkdocs.yml nav            ← 登记导航（脚本自动）
       │
       ▼
  index.html Work 区        ← 添加卡片（脚本自动，仅新课程需要）
       │
       ▼
  git add + commit + push   ← 推送
       │
       ▼
  GitHub Actions             自动 mkdocs build
       │
       ▼
  am-sush.github.io/notes/  线上即时可见
```
