# AM-SuSh · A Personal Journal

> 留白衬线杂志风个人主页 · 中英混排 · 部署于 GitHub Pages

一个摆脱 GitHub Profile README 限制的、真正的静态个人网站。
纯 HTML / CSS / JS，无构建步骤，无依赖。

---

## ✨ 设计

| 维度 | 选择 |
|------|------|
| 气质 | 留白衬线杂志风（editorial / magazine） |
| 配色 | 暖米白纸张 + 深棕墨 + 旧书印章红点缀 |
| 字体 | Playfair Display · EB Garamond · Noto Serif SC |
| 语言 | 中英混排，英文做版式骨架，中文做释义 |
| 动效 | 克制：字母逐个入场、滚动渐入、阅读进度、章节高亮 |

## 📂 结构

```
am-sush.github.io/
├── index.html          # 语义化结构 + 文案
├── css/
│   └── style.css       # 全部样式（杂志排版灵魂）
├── js/
│   └── main.js         # 克制动效
├── assets/
│   └── favicon.svg     # 衬线 AM 印章
└── README.md
```

## 🚀 部署到 GitHub Pages

1. **在 GitHub 新建仓库，名字必须叫 `AM-SuSh.github.io`**（= 你的用户名 + `.github.io`）
2. 本地：
   ```bash
   git init
   git add .
   git commit -m "feat: 个人主页 Vol.01"
   git branch -M main
   git remote add origin git@github.com:AM-SuSh/AM-SuSh.github.io.git
   git push -u origin main
   ```
3. 仓库 **Settings → Pages → Source = `Deploy from a branch` → `main` / `/ (root)`**
4. 等约 1 分钟，访问 **https://am-sush.github.io**

## ✏️ 自定义

- **文案**：改 `index.html` 内的文字即可，结构清晰有注释分区。
- **配色**：改 `css/style.css` 顶部 `:root` 变量（`--accent` 是那抹红）。
- **项目**：`#work` 区每个 `<a class="work-row">` 就是一个项目卡片，复制/删除即可。
- **邮箱**：搜索 `your@email.com` 全部替换成你的真实邮箱。

## 🔗 与 Profile README 联动

在 `AM-SuSh/AM-SuSh` 仓库的 `README.md` 顶部加一行，把访客导到这里：

```html
<p align="center">
  <a href="https://am-sush.github.io"><b>↗ 访问我的个人主页 / Visit my homepage</b></a>
</p>
```
