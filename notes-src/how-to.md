# 如何添加笔记

本站用 [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) 构建。
笔记源文件在仓库的 `notes-src/` 目录，构建产物输出到 `notes/`（GitHub Pages 直接发布）。

---

## 一、添加 Markdown 笔记

最简单的方式——把 `.md` 文件放进对应课程目录，再在导航里登记。

**1. 放文件**

例如加一篇「进程与线程」笔记：

```
notes-src/
└── os/
    └── process-thread.md      ← 新增
```

文件开头写一级标题即可：

```markdown
# 进程与线程

这里是正文……
```

**2. 登记到导航**

打开仓库根目录的 `mkdocs.yml`，在 `nav` 里加一行：

```yaml
nav:
  - 操作系统:
      - os/index.md
      - 概览: os/process-thread.md   # ← 新增
```

**3. 推送**

```bash
git add notes-src/ mkdocs.yml
git commit -m "notes: 新增 进程与线程"
git push
```

push 之后，GitHub Action 会自动重建 `notes/` 站点，约 1 分钟后生效。

!!! tip "本地预览"
    ```bash
    conda activate am-sush-notes
    mkdocs serve
    ```
    打开 `http://127.0.0.1:8000`，改完即时刷新。

---

## 二、内嵌 PDF（在线阅读，不用下载）

把 PDF 放进课程目录，例如 `notes-src/os/assets/lab1.pdf`，
然后用 `iframe` 内嵌——浏览器自带的 PDF 阅读器会直接显示，访客无需下载。

复制下面这段到任意 `.md` 文件（路径按需替换）：

```markdown
<iframe
  src="../assets/lab1.pdf"
  width="100%"
  height="720"
  style="border:1px solid var(--md-default-fg-color--lightest); border-radius:6px;">
</iframe>
```

要点：

- `src` 用**相对路径**。从 `notes-src/os/some-note.md` 引用同目录 `assets/` 下的 PDF，
  写 `assets/lab1.pdf`；从子目录引用则如上写 `../assets/...`。
- 构建后 PDF 会被复制到 `notes/.../assets/`，链接自动正确。
- `height` 可按需调大；移动端会自适应滚动。

!!! info "同时提供下载链接"
    ```markdown
    [:material-download: 下载 PDF](../assets/lab1.pdf){:download}
    ```

---

## 三、数学公式

已配置 MathJax，直接用 `$$ ... $$` 写行间公式，`$ ... $` 写行内：

```markdown
$$
E = mc^2
$$

行内：当 $a \ne 0$ 时，方程 $ax^2 + bx + c = 0$ 有解。
```

---

## 四、常用 Markdown 元素

!!! note "提示框"
    admonition 语法：`!!! note "标题"`

??? example "可折叠块"
    `??? example "标题"` 默认收起，点击展开。

=== "Tab A"

    ```python
    print("tabbed content")
    ```

=== "Tab B"

    用 `=== "标签名"` 做选项卡。

---

## 目录速查

| 课程           | 目录                | 路径前缀         |
| -------------- | ------------------- | ---------------- |
| 操作系统       | `notes-src/os/`     | `/notes/os/`     |
| 计算机网络     | `notes-src/networks/` | `/notes/networks/` |
| 数据结构与算法 | `notes-src/dsa/`    | `/notes/dsa/`    |
| 分布式计算系统 | `notes-src/distributed/` | `/notes/distributed/` |
