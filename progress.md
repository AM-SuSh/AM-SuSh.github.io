# 进度日志 · AM-SuSh 个人主页

## 2026-07-07 - Task: About 时间轴改为紧凑模式 + 弹出详情卡

### What was done
将 About 页横轴时间轴从"始终展示全部卡片"改为"紧凑轨道 + 点击弹出详情卡"模式：默认仅显示年份标记和可点击的月份节点（dot + label），点击节点后以弹出层形式展示回忆详情（文字、轮播图、视频），同一时间只展开一个卡片，支持关闭按钮 / 点击外部 / Escape / 轨道滚动自动关闭。创建了添加新回忆点的说明文档。

### Testing
- HTML 结构验证：紧凑轨道节点与弹出卡片通过 `data-card` / `id` 对应
- CSS lint 无错误
- JS lint 无错误
- 弹出定位逻辑：根据节点 `getBoundingClientRect` 动态计算卡片位置，连接茎对齐节点
- 轮播图初始化兼容：卡片初始 opacity:0 但保留布局，`[data-carousel]` 初始化可正常运行

### Notes
改动文件清单：
- `index.html` — About 时间轴区域 HTML 重构：轨道改为紧凑列（dot + label），卡片移至轨道外部作为弹出层
- `css/style.css` — 时间轴样式全部替换为紧凑轨道 + 绝对定位弹出卡片 + 动画，响应式规则同步更新
- `js/main.js` — 新增 `openTlCard` / `closeTlCard` 弹出逻辑，节点点击/键盘/外部点击/Escape/滚动关闭
- `docs/add-memory.md` — 新建，说明如何添加新回忆节点

回滚方式：`git checkout HEAD -- index.html css/style.css js/main.js` 并删除 `docs/add-memory.md`

---

## 2026-07-04 - Task: PDF 内嵌优化 + 笔记管理自动化

### What was done
- 增强 PDF 内嵌查看体验：iframe 添加 `type="application/pdf"`、`loading="lazy"`、`#toolbar=1&view=FitH` 参数，并加入 admonition 提示框作为浏览器不支持时的用户引导。
- 添加 PDF 响应式样式：移动端（≤768px）自动缩短 iframe 高度至 480px。
- 新增 `add_note.py` 自动化脚本，支持三个子命令：`new-course`（创建课程 + 目录 + 导航 + 主页卡片）、`add-md`（添加 Markdown 笔记）、`add-pdf`（添加 PDF 笔记）。
- 在 `index.html` 中添加 `<!-- notes-rail-end -->` 和 `<!-- notes-cards-end -->` 标记，供脚本定位插入点；修复末尾重复的 `</html>` 标签。
- 重写 `how-to.md` 为完整的笔记管理手册：快速上手、目录结构规范、脚本用法、手动操作步骤、工作流一图流。

### Testing
- `conda run -n am-sush-notes mkdocs build --strict` 通过（0.49s）。
- 构建产物 `notes/distributed/mindmap/index.html` 中 iframe `src="../assets/mindmap.pdf#toolbar=1&view=FitH"` 路径正确。
- `add_note.py add-md` 子命令测试通过（创建 md + 追加 mkdocs.yml 导航），测试文件已清理。

### Notes
- `notes-src/distributed/mindmap.md` — iframe 参数增强 + fallback 提示。
- `notes-src/distributed/summary.md` — 同上。
- `notes-src/stylesheets/journal.css` — PDF 响应式样式。
- `notes-src/how-to.md` — 重写为笔记管理手册。
- `mkdocs.yml` — 导航标题更新。
- `index.html` — 添加 HTML 标记、修复重复 `</html>`。
- `add_note.py`（新建）— 笔记管理自动化脚本。

回滚：`git checkout -- notes-src/distributed/mindmap.md notes-src/distributed/summary.md notes-src/stylesheets/journal.css notes-src/how-to.md mkdocs.yml index.html`；删除 `add_note.py`。

## 2026-07-03 - Task: 修复 PDF 内嵌路径 + 主页 Work 分布式笔记卡片

### What was done
- 修正分布式 PDF 页 iframe 路径：`assets/` → `../assets/`（`use_directory_urls` 下页面在子目录，原路径 404 导致只能下载）。
- 主页 `index.html` Work 区新增「分布式计算系统」轮盘项与详情卡（notes-3），计数 3→4。
- 更新 `how-to.md` PDF 路径说明。

### Testing
- `conda run -n am-sush-notes mkdocs build --strict` 通过；构建产物 iframe `src="../assets/mindmap.pdf"` 正确。

### Notes
- `notes-src/distributed/mindmap.md`、`summary.md` — iframe 路径修复。
- `index.html` — Work 轮盘 + 卡片。
- `notes-src/how-to.md` — 文档。

回滚：`git checkout --` 上述文件。

## 2026-07-01 - Task: notes/ 构建产物改由 CI 自动提交

### What was done
- `.gitignore` 忽略 `notes/`，本地不再跟踪 MkDocs 构建产物。
- CI workflow 改为 `git add -f notes/` 强制提交构建结果。
- `git rm -r --cached notes/` 从版本库移除已跟踪的构建文件（本地目录保留）。
- 更新 `how-to.md`、`mkdocs.yml` 说明日常只提交 `notes-src/` 与 `mkdocs.yml`。

### Testing
- `git status` 确认 `notes/` 不再出现在未忽略变更中；仅源码与配置待提交。
- workflow 逻辑审阅：`paths` 不含 `notes/**`，CI 提交不会触发循环构建。

### Notes
- `.gitignore` — 新增 `notes/`。
- `.github/workflows/notes.yml` — `git add -f notes/`。
- `mkdocs.yml`、`notes-src/how-to.md` — 文档说明。
- 索引删除 `notes/` 下 67 个已跟踪文件（push 后远程由 CI 重建）。

回滚：`git restore --staged notes/` 并 `git checkout HEAD -- notes/` 恢复跟踪；删除 `.gitignore` 中 `notes/` 行。

## 2026-07-01 - Task: 添加分布式计算系统 PDF 笔记

### What was done
- 新增课程栏目「分布式计算系统」，将两份 PDF（导图、课程总结）复制到 `notes-src/distributed/assets/` 并以 iframe 内嵌展示。
- 更新 `mkdocs.yml` 导航、笔记首页课程卡片与 how-to 目录速查；本地 `mkdocs build` 重建 `notes/`。

### Testing
- `conda run -n am-sush-notes mkdocs build --strict` 通过（0.52s）。
- 构建产物含 `notes/distributed/assets/mindmap.pdf`、`summary.pdf` 及对应 HTML 页。

### Notes
- `notes-src/distributed/` — 新建课程目录（index、mindmap、summary 及 assets 下两份 PDF）。
- `mkdocs.yml` — nav 增加「分布式计算系统」三节。
- `notes-src/index.md`、`notes-src/how-to.md` — 首页卡片与目录速查。
- `notes/distributed/` — MkDocs 构建输出。

回滚：删除 `notes-src/distributed/` 与 `notes/distributed/`，并还原 `mkdocs.yml`、`notes-src/index.md`、`notes-src/how-to.md`。

# 进度日志 · AM-SuSh 个人主页

## 2026-06-27 - Task: Work 左侧列表恢复靠左对齐

### What was done
- 撤销居中试验：文字/旋转轴心/弧影/柱面带/圆点均恢复靠左布局。

### Testing
- 纯 CSS 回退；需浏览器目测。

### Notes
- `css/style.css`：`.rail-item`/`.rail-cat-btn`/`.rail-list::after` 等恢复左对齐。

回滚：`git checkout -- css/style.css`

## 2026-06-27 - Task: Work 左侧列表居中于轮盘

### What was done
- 项目/分类文字 `justify-content: center`，`transform-origin: center center`，3D 旋转绕轮盘中心。
- 弧影水平居中；选中柱面带改为左右对称 clip-path；暂隐左侧圆点。

### Testing
- 纯 CSS；需浏览器目测居中效果。

### Notes
- `css/style.css`：`.rail-item`/`.rail-cat-btn`/`.rail-list::after` 等。

回滚：`git checkout -- css/style.css`

## 2026-06-27 - Task: Work 选中底改为柱面带（左直角、更鼓）

### What was done
- 选中底框用 `clip-path` 多边形：左缘两角直角贴轮轴，顶底向中间鼓起；去掉左侧圆角；高度与鼓起幅度加大。

### Testing
- 纯 CSS；需浏览器目测。

### Notes
- `css/style.css`：`.rail-item.is-active::before` clip-path。

回滚：`git checkout -- css/style.css`

## 2026-06-27 - Task: Work 选中底改为转盘柱面带形

### What was done
- 居中高亮由竖向椭圆改为横向伸展长条：`border-radius` 四值使上下边微凸、右侧略伸展，贴合转盘柱面「中间鼓起」视觉；hover 同风格弱化。

### Testing
- 纯 CSS；需浏览器目测选中项底形。

### Notes
- `css/style.css`：`.rail-item.is-active::before`、hover 伪元素。

回滚：`git checkout -- css/style.css`

## 2026-06-27 - Task: Work 选中项弧形底 + 轮盘连贯滑动

### What was done
- 居中项红色底改为 `::before` 椭圆弧形色块（`border-radius: 50%/36%`），随 rotateX 贴合柱面，四角圆润。
- 轮盘切换改为 rAF 插值 `wheelCenter`（520ms ease-out cubic），走环上最短弧，滚轮/自动轮播有连贯滑感；首屏/resize 仍即时落位。

### Testing
- `node --check js/main.js` 通过；需浏览器目测弧形高亮与滑动连贯性。

### Notes
- `js/main.js`：`spinWheelTo`/`applyWheelCenter`/`ringOffsetFloat`。
- `css/style.css`：`.rail-item.is-active::before` 弧形底；hover 不冲突。

回滚：`git checkout -- css/style.css js/main.js`

## 2026-06-27 - Task: Work 轮盘间距略放松 + 去掉位移动画

### What was done
- `arcSpread` 0.56→0.68，项目间距略分散。
- 去掉 `.rail-cat-btn`/`.rail-item` 的 `top`/`transform` 过渡，切换时不再出现边缘项从上方「掉下来」。

### Testing
- 静态改动；需浏览器滚轮/点击切换目测间距与无位移动画。

### Notes
- `js/main.js`：`arcSpread`。
- `css/style.css`：轮盘节点 transition 仅保留 color/opacity。

回滚：`git checkout -- css/style.css js/main.js`

## 2026-06-27 - Task: Work 轮盘间距收紧 + 弧影与直径统一

### What was done
- 轮盘直径与弧影统一为 `rail-list` 视口高度 × 50%，`--wheel-diam` 只写在 `.rail-list` 上。
- 弧影从 `.work-rail::before` 移至 `.rail-list::after`，与节点同容器、同高、垂直居中。
- 引入 `arcSpread=0.56` 压缩环距，缩小项目间距；外缘仍对齐半直径。

### Testing
- `node --check js/main.js` 通过；需浏览器目测间距与弧影是否对齐。

### Notes
- `js/main.js`：`wheelDiam=viewH*0.5`、`arcSpread`、`step` 布局。
- `css/style.css`：删 `.work-rail::before` 弧影，新增 `.rail-list::after`。

回滚：`git checkout -- css/style.css js/main.js`

## 2026-06-27 - Task: Work 轮盘直径半屏 + 弧影收紧 + 字号再放大

### What was done
- 轮盘半径按页面高度 50% 直径计算（`wheelDiam = pageH * 0.5`），居中分布；JS 写入 `--wheel-diam` 供弧影对齐。
- 左侧弧影改为与轮盘同高、居中、更轻阴影，去掉 oversized 渐变。
- 栏名/项目名字号再次放大（栏名约 1.18–1.42rem，项目 1.12rem，居中 1.28rem）。

### Testing
- `node --check js/main.js` 通过；需浏览器目测弧影尺寸与轮盘是否对齐。

### Notes
- `js/main.js`：`wheelDiam`/`R` 计算、`--wheel-diam` CSS 变量。
- `css/style.css`：`.work-rail::before` 用 `--wheel-diam`；字号与 perspective 720px。

回滚：`git checkout -- css/style.css js/main.js`

## 2026-06-27 - Task: Work 左侧去弧形线 + 放大栏名/项目名

### What was done
- 去掉左侧椭圆描边与纵向引导线，改为纯径向/内阴影弧面暗示。
- 分类栏名、项目名、序号整体放大（栏名约 1.05–1.22rem，项目约 0.98rem，居中项 1.12rem）；圆点与左内边距略收紧对齐。

### Testing
- 静态：CSS 改动，ReadLints 无新增错误；需浏览器目测弧影与字号。

### Notes
- `css/style.css`：`.work-rail::before` 无 border、仅 shadow/gradient；删 `.rail-list::before`；`.rail-cat-*`/`.rail-item` 字号与间距。

回滚：`git checkout -- css/style.css`

## 2026-06-27 - Task: Work 轮盘改为衔尾蛇闭合环

### What was done
- 节点环距改为 `ringOffset` 最短弧路径，首尾相接：末项「数据结构」下方可见「AI 研发 / PPTAS」。
- 布局由平面纵向列表改为圆柱弧面（`sin/cos` 定 Y + `translateZ` 进深），背面节点隐藏，上下均衡分布无「到头」感。
- 遮罩改为椭圆晕影；左侧椭圆卷边略加强，弱化有头有尾的线性暗示。

### Testing
- Playwright：切至最后一项后，可见列表含 `i AI 研发`、`01PPTAS` 紧接在笔记项下方；`node --check js/main.js` 通过。

### Notes
- `js/main.js`：`ringOffset` + 圆柱 `applyWheel` / `applyArcStyle`。
- `css/style.css`：`translateZ(--node-z)`、径向遮罩、卷边样式。

回滚：`git checkout -- css/style.css js/main.js`

## 2026-06-27 - Task: 修复 Work 轮盘文字不可见（纵向排布）

### What was done
- 根因：所有节点叠在同一 Y 坐标，仅靠 rotateX 区分，文字互相遮挡/过淡，视觉上「看不到字」。
- 改为 JS 按环距写入 `top` 像素，节点纵向排开；中心项居中，上下项沿轮盘弧面分布；略降低渐隐强度、收窄边缘遮罩；窄屏补固定高度。

### Testing
- Playwright 截图验证：Work 页左侧 PPTAS / PaperLens / 分类栏文字可见；`node --check js/main.js` 通过。
- 行为预期：刷新后左侧应清晰看到项目列表，点击可旋转切换。

### Notes
- `css/style.css`：节点 `top:0` + JS 定位；遮罩 14%→6%；窄屏 `.work-rail` 固定高度。
- `js/main.js`：`applyWheel` 写 `top` 纵向间距；降低 opacity 衰减。

回滚：`git checkout -- css/style.css js/main.js`

## 2026-06-27 - Task: 修复 Work 左侧轮盘空白不显示

### What was done
- 根因：轮盘节点 `absolute` 锚定在 `height:0` 的 `.rail-cat` 上，全部堆在顶部 14% 渐变遮罩透明区，视觉上「左侧空白」。
- 将 `.rail-cat`/`.rail-items` 改为 `position:static`，节点相对 `.rail-list` 垂直居中；补 `flex:1`/`height:100%` 保证视口高度；`applyWheel` 增加高度回退与 NaN 防护。

### Testing
- `node --check js/main.js` 通过。
- 行为预期（需浏览器目测）：进入 Work 页左侧可见分类与项目轮盘，居中项高亮。
- 缺口：未浏览器实跑。

### Notes
- `css/style.css`：`.work-rail`/`.rail-list`/`.rail-cat` 定位与高度修正。
- `js/main.js`：`applyWheel`/`applyArcStyle` 高度与除零防护。

回滚：`git checkout -- css/style.css js/main.js`

## 2026-06-27 - Task: Work 左侧项目列表改为 3D 轮盘旋转

### What was done
- 左侧由「滚动列表 + 透视」改为真正的 **3D 轮盘**：所有分类标题与项目节点叠在同一轴心，按序列环距做 rotateX 旋转。
- 点击项目或分类首项、滚轮翻项、自动轮播时，整盘带动画转到目标项居中突出（保留原有配色、圆点、高亮样式）。
- 移除 `.rail-list` 纵向滚动；远端节点自动禁用 pointer-events，避免误点。

### Testing
- `node --check js/main.js` 通过；ReadLints 无错误。
- 行为预期（需浏览器目测）：点击任意项目时轮盘旋转、该项居中放大高亮；滚轮悬停 rail 仍可翻项；右侧详情卡联动不变。
- 缺口：未浏览器实跑。

### Notes
- `css/style.css`：`.rail-list` 改为轮盘视口；`.rail-cat`/`.rail-items` 流式高度归零；`.rail-cat-btn`/`.rail-item` 绝对定位 + 轮盘 transform 过渡。
- `js/main.js`：`wheelNodes` 序列索引；`applyWheel(centerSeqIdx)` 替代 scroll 驱动的 `applyRing`；`focusItem` 去掉 scrollTo。

回滚：`git checkout -- css/style.css js/main.js`

## 2026-06-26 - Task: Work 轮播加速 + 详情放大居中 + 去掉提示行

### What was done
- 自动轮播间隔由 5s 改为 3s。
- 右侧详情卡字号整体再调大（标题最大约 2.75rem），内容块在右侧区域垂直水平居中。
- 删除左侧底部提示行「点击项目节点查看详情 · 悬停暂停轮播」及对应 `.rail-hint` 样式。

### Testing
- 静态：ReadLints 无错误。
- 行为预期：轮播约 3s 切换；详情居中更大；无底部提示文字。
- 缺口：未浏览器实跑。

### Notes
- `index.html`：删除 `.rail-hint` 段落。
- `css/style.css`：`.work-card` 居中布局 + `.card-*` 字号调大；删 `.rail-hint`。
- `js/main.js`：`restartAuto` 间隔 5000→3000。

回滚：`git checkout -- index.html css/style.css js/main.js`

## 2026-06-26 - Task: Work 单活动栏手风琴 + 右侧详情放大 + 恢复整行点击

### What was done
- 左侧恢复整行 `.rail-cat-btn` 可点（`+` 回到标题行内），移除独立 `.rail-cat-caret` 按钮。
- 手风琴逻辑：同时只保留一个活动栏；点击标题行或栏内项目 → 该栏变为活动栏，其余栏自动折叠。
- 活动栏加 `.is-active-cat`：整栏字号放大突出（标题、序号、项目节点）；栏间环距立体感保留。
- 右侧详情卡字号与行距整体调大，去掉 `line-clamp` 截断，内容顶对齐，减少无效留白。

### Testing
- 静态：ReadLints 无错误；代码中无 `rail-cat-caret` 残留。
- 行为预期（需浏览器目测）：仅一个栏展开；点标题/项目切换活动栏；右侧轮播仅活动栏内项目；详情卡字号更大、留白更少。
- 缺口：未浏览器实跑。

### Notes
- `index.html`：4 栏恢复整行按钮 + 行内 `rail-caret`；AI 栏加 `is-active-cat`。
- `css/style.css`：删 `.rail-cat-caret`；恢复 `.rail-caret`；新增 `.is-active-cat` 放大样式；`.card-*` 字号/间距调大，移除 line-clamp。
- `js/main.js`：`toggleCat` → `setActiveCat`（手风琴，仅一栏 `is-open`/`is-active-cat`）；标题整行绑定 `selectCat`。

回滚：`git checkout -- index.html css/style.css js/main.js`

## 2026-06-26 - Task: 时间轴整体环状立体感 + 单屏无滚动 + 加号独立折叠

### What was done
- Work 页锁定单屏：`.work-page` 设 `overflow: hidden`，翻页引擎对 `#work` 禁内滚；章节标题/详情卡字号/节点间距整体收紧，4 栏 + 详情卡压进一屏无滚动条。
- **栏内环感**（保留）：`.rail-item` 按距当前项的环距做缩放/透明度渐变，`.rail-items` 上下加纸色渐变遮罩首尾衔接。
- **栏间环感**（新增）：`.rail-cat` 按距当前活动分类的环距（首尾相接）整体缩放/渐隐——`data-cat-dist` 0→1.04/1、1→0.94/0.7、2→0.84/0.4、3→0.76/0.2；`.work-rail` 加 `perspective:700px` 让栏间有纵深感。
- **加号独立折叠**：把原分类行内整行可点的折叠，拆成两个按钮——
  - 分类名按钮（`.rail-cat-btn`）：点击 → 切换为活动分类（并展开该栏）
  - 右侧加号按钮（`.rail-cat-caret`）：点击 → 仅折叠/展开该栏，不影响活动分类；展开时加号旋转 45° 变 ×，并高亮。
- JS：`syncRailActive` 同时计算栏间环距写 `data-cat-dist`；新增 `catOrder`；重写事件绑定，分类名与加号职责分离。

### Testing
- 静态：ReadLints 无错误；无 `rail-caret`（旧内联）残留。
- 行为预期（需浏览器目测）：Work 页无滚动条；4 个分类栏有近大远小立体感，远处栏渐隐；栏内节点同样有环感；点击分类名切活动分类，点击右侧 +/× 只折叠该栏；折叠/展开动画正常。
- 缺口：未浏览器实跑，本地 http://localhost:8080 可立即验证。

### Notes
改动文件清单：
- `index.html`：`#work` 加 `work-page`/`work-head` 类；4 个 `.rail-cat` 内把 `+` 从 `.rail-cat-btn` 内移出为独立 `.rail-cat-caret` 按钮。
- `css/style.css`：新增 `.work-page` 单屏约束 + 收紧 `.work-stage`/`.work-rail`(perspective)/`.rail-cat`(栏间 `--cat-*` 环距)/`.rail-cat-caret`(独立加号按钮，hover 圆框 + 展开 45°)；`.rail-item`/`.card-*` 字号与间距收紧、描述 `line-clamp:2`。
- `js/main.js`：`pageScrollable` 对 `#work` 返回 false；`syncRailActive` 增加栏间环距计算与 `data-cat-dist`；`catOrder` 定义；`toggleCat`/`selectCat`/`jumpToItem` 与事件绑定拆分（分类名切活动、加号折叠）。

回滚方式：
- `git checkout -- index.html css/style.css js/main.js` 可回到纯时间轴平铺版。`progress.md` 已追加本轮日志。

## 2026-06-26 - Task: 时间轴节点加环状立体感（保留时间轴样式）

### What was done
- 保留原纵向时间轴的 HTML 结构、样式、JS 联动逻辑不变。
- 给 `.rail-items` 加 `perspective: 600px`，让子节点有纵深感。
- 给 `.rail-item` 按 `data-dist`（距当前激活项的环距，首尾相接）做立体缩放/纵向偏移/透明度渐变：
  - dist 0（当前项）：scale 1.08，opacity 1
  - dist 1：scale 0.92，opacity 0.62
  - dist 2：scale 0.78，opacity 0.32
  - dist 3：scale 0.68，opacity 0.16
  - 非当前分类节点：scale 0.96，opacity 0.55
- `.rail-items` 上下加半透明渐变遮罩（伪元素），节点像从环背面转出/转入，首尾衔接。
- JS `syncRailActive` 增加环距计算并写入 `data-dist` 属性，CSS 据此变换。

### Testing
- 静态：ReadLints 无错误；HTML/JS 结构未动，仅 CSS 与 syncRailActive 微调。
- 行为预期（需浏览器目测）：时间轴外观不变，但节点有近大远小的立体感，远处节点渐隐，首尾有纸色渐变衔接；点击/折叠/联动与之前一致。
- 缺口：未浏览器实跑，本地 http://localhost:8080 可立即验证。

### Notes
改动文件清单：
- `css/style.css`：`.rail-items` 加 perspective + 首尾渐变遮罩伪元素；`.rail-item` 加 `--rail-*` 变量与 `transform/opacity`，按 `data-dist` 分级。
- `js/main.js`：`syncRailActive` 增加环距（`Math.min(abs, n-abs)`）计算并写 `data-dist`；非当前分类节点标记 `data-dist="x"`。

回滚方式：
- `git checkout -- css/style.css js/main.js` 可回到纯平铺时间轴。`progress.md` 已追加本轮日志。

## 2026-06-26 - Task: Work 区由 3D 立方体改为左侧时间轴 + 右侧详情卡联动

### What was done
- 拆除 Work 区的 3D 立方体与顶部 `.work-tabs` 分类切换条。
- 新增左侧纵向时间轴：4 个分类为可折叠大节点（带圆点 + +/− 折叠符），各分类下的项目为小节点（带圆点 + 序号 + 名称），主时间轴线贯穿全列。
- 右侧详情卡保留，改为由时间轴驱动：点击项目节点直接定位详情卡；点击分类标题展开该分类并切换为活动分类；自动轮播在当前活动分类内循环；详情卡右下角保留 ‹ 位置计数 › 导航。
- 自动轮播逻辑：5s 一张，仅在 Work 页可见时运行；鼠标悬停舞台暂停。

### Testing
- 静态验证：HTML 结构与 CSS/JS 选择器全部对齐，无 `cube`/`work-tab` 残留引用；全仓 Grep 0 命中。
- Lint：对 `index.html`、`css/style.css`、`js/main.js` 运行 ReadLints，无错误。
- 行为预期（需浏览器目测确认）：
  - 默认进入 Work 页：AI 分类展开，第 1 项高亮，右侧显示 PPTAS 详情卡。
  - 点击其他分类标题：该分类展开并切换活动分类，详情卡切换到对应第 1 项。
  - 点击任意项目节点：右侧详情卡跳转到该项，节点高亮、计数更新。
  - 折叠按钮 + 旋转 45° 表示展开态；折叠时子列表高度动画收起。
  - 5s 自动轮播在当前分类内循环；悬停暂停。
- 缺口：未在浏览器中实跑验证（环境无浏览器），建议本地 `python -m http.server` 打开 `index.html` 目测上述行为。

### Notes
改动文件清单：
- `index.html`：删除 `.work-tabs` 与 `.cube-scene`（4 个 `.cube`），替换为 `.work-rail` 时间轴（4 个 `.rail-cat` + 子 `.rail-item`）；右侧 `.card-stage` 与 `.card-nav` 不变。
- `css/style.css`：删除 WORK 区 `.work-tabs`/`.work-tab`/`.cube-scene`/`.cube`/`.cube-face`/`.f-*`/`@keyframes cube-idle` 等全部立方体样式；新增 `.work-rail`/`.rail-list`/`.rail-cat`/`.rail-cat-btn`/`.rail-items`/`.rail-item`/`.rail-node`/`.rail-hint` 等时间轴样式（含主线、圆点、折叠 grid-template-rows 动画、激活态高亮）；响应式 `860px` 断点把 `.cube-scene` 改为 `.work-rail`。
- `js/main.js`：删除 `.work-tab` 轮换逻辑，替换为时间轴逻辑：`railCats`/`railItems` 绑定、`toggleCat` 折叠、`selectCat` 展开切换、`jumpToItem` 节点点击联动、`syncRailActive`/`updateCardNav` 同步高亮与计数；保留 `showCard`/`advanceCard`/`restartAuto` 核心轮播，自动轮播限定 `current === 2`。

回滚方式：
- 本次改动均为未提交的工作区修改（`git status` 显示 M）。回滚执行 `git checkout -- index.html css/style.css js/main.js` 即可恢复到改动前状态（立方体版）。如已暂存，先 `git reset HEAD <文件>` 再 checkout。
