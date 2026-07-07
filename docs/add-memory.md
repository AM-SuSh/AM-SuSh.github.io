# 添加新回忆点

本文档说明如何在 About 页面的时间轴中添加新的回忆节点。

---

## 整体结构

时间轴由两部分组成：

1. **紧凑轨道**（`#tlTrack`）—— 只显示年份标记和可点击的月份节点
2. **弹出卡片**（`.tl-card`）—— 点击节点后显示的详情卡片，放在轨道外部

轨道中的 `data-card` 属性与卡片的 `id` 一一对应。

---

## 步骤

### 1. 确定编号

找到当前最大的 `data-card` 编号（如 `5`），新编号 = 最大值 + 1（如 `6`）。

### 2. 在轨道中添加节点

在 `<div class="tl-track">` 里合适的时间位置，插入一个紧凑列：

```html
<div class="tl-col tl-reveal" data-pos="up" data-card="6">
  <div class="tl-node-h tl-node-mem" role="button" tabindex="0"></div>
  <span class="tl-label">MM</span>
</div>
```

**参数说明：**

| 属性 | 值 | 含义 |
|---|---|---|
| `data-pos` | `"up"` 或 `"down"` | 卡片弹出方向，建议与相邻节点交替使用 |
| `data-card` | 数字字符串 | 与对应卡片 id 后缀一致 |
| `.tl-label` 文本 | 月份数字或自由文本 | 紧凑状态下显示在节点旁的标签 |

如果需要新增年份标记，在节点之前插入：

```html
<div class="tl-col tl-col--year tl-reveal">
  <span class="tl-year-h">2027</span>
  <div class="tl-node-h tl-node-h--yr"></div>
</div>
```

### 3. 添加弹出卡片

在 `</div><!-- tl-track -->` 之后、`</div><!-- timeline -->` 之前，添加对应的卡片：

```html
<article class="tl-card" id="tl-c-6" data-pos="up">
  <button class="tl-card-close" aria-label="关闭">&times;</button>
  <time class="tl-time">YYYY · MM</time>
  <h3 class="tl-title">标题</h3>
  <p class="tl-desc">描述文字</p>
</article>
```

**注意：** `data-pos` 必须与轨道节点中的 `data-pos` 一致。

### 4. 可选：添加轮播图

在 `<p class="tl-desc">` 之后插入：

```html
<div class="tl-media" data-carousel>
  <div class="tl-slides">
    <div class="tl-slide"><img src="图片路径" alt="说明" loading="lazy" /></div>
    <div class="tl-slide"><img src="图片路径" alt="说明" loading="lazy" /></div>
  </div>
  <button class="tl-arrow tl-arrow--prev" aria-label="上一张">&#8249;</button>
  <button class="tl-arrow tl-arrow--next" aria-label="下一张">&#8250;</button>
  <div class="tl-indicators"></div>
</div>
```

轮播指示器（dots）由 JS 自动生成，无需手动添加。

### 5. 可选：添加视频

在 `<p class="tl-desc">` 之后插入：

```html
<div class="tl-media tl-media--video">
  <video controls preload="metadata" poster="封面图路径">
    <source src="视频路径.mp4" type="video/mp4" />
  </video>
</div>
```

---

## 排布建议

- 相邻记忆节点交替使用 `data-pos="up"` 和 `data-pos="down"`
- 同一年可添加多个节点
- `data-card` 编号按时间顺序递增即可，不要求连续
- 图片推荐比例 16:10，宽度 640px 以上
