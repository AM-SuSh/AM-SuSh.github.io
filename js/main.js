/* =========================================================================
   AM-SuSh · 非连续阅读引擎 + Work 轮换 + skill 入场
   ========================================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ====================== 翻页引擎 ====================== */
  var pages = Array.prototype.slice.call(document.querySelectorAll(".page"));
  var N = pages.length;
  var current = 0;
  var locked = false;        // 翻页动画期间锁定
  var lockTimer = null;
  var wheelAccum = 0;        // 触控板累积抑制
  var lastWheel = 0;

  function lock(ms) {
    locked = true;
    clearTimeout(lockTimer);
    lockTimer = setTimeout(function () { locked = false; }, ms || 650);
  }

  /* hero 字母入场：每次进入封面时重放 */
  function replayHero() {
    var letters = document.querySelectorAll(".hero-name .letters > span");
    letters.forEach(function (s) { s.style.animation = "none"; });
    void document.body.offsetWidth;
    letters.forEach(function (s) { s.style.animation = ""; });
  }

  function goTo(index, dir) {
    index = Math.max(0, Math.min(N - 1, index));
    if (index === current || locked) return;
    dir = dir || (index > current ? "down" : "up");

    var from = pages[current];
    var to = pages[index];

    from.classList.remove("is-active", "is-enter-down", "is-enter-up");

    to.classList.add("is-active");
    to.classList.remove("is-enter-down", "is-enter-up");
    void to.offsetWidth; // 强制 reflow 重启动画
    to.classList.add(dir === "down" ? "is-enter-down" : "is-enter-up");
    to.scrollTop = 0;

    current = index;
    syncNav();
    updateProgress();
    lock(reduceMotion ? 120 : 680);

    // 进入 hero 页时重放字母入场动画
    if (index === 0) setTimeout(replayHero, 60);
  }

  function next() { goTo(current + 1, "down"); }
  function prev() { goTo(current - 1, "up"); }

  /* 某页是否需要内部滚动（内容比视口高） */
  function pageScrollable(p) {
    if (p.id === "work") return false;
    return p.scrollHeight - p.clientHeight > 4;
  }
  /* 当前页是否已滚动到顶/底，可允许翻页 */
  function atTop(p) { return p.scrollTop <= 2; }
  function atBottom(p) { return p.scrollTop + p.clientHeight >= p.scrollHeight - 2; }

  /* ---- 滚轮：智能判断“先内滚，再翻页” ---- */
  window.addEventListener("wheel", function (e) {
    if (locked) { e.preventDefault(); return; }
    var p = pages[current];

    /* Work 页：鼠标悬停在左侧 rail 时 → 翻项目（不翻页），
       其余位置 → 正常翻页 */
    if (current === 1) {
      if (hoveringRail) {
        e.preventDefault();
        var now1 = Date.now();
        if (now1 - railLock < 150) return;   /* 节流：滚动驱动的弯曲会补足中间帧 */
        railLock = now1;
        advance(e.deltaY > 0 ? "next" : "prev");
        return;
      }
      /* 非 rail 区域：继续向下走翻页流程 */
    }

    var now = Date.now();
    // 触控板连续小事件节流
    if (now - lastWheel < 350 && Math.abs(e.deltaY) < 40) {
      wheelAccum += e.deltaY;
      lastWheel = now;
      if (Math.abs(wheelAccum) < 30) return;
    }
    wheelAccum = 0;
    lastWheel = now;

    if (e.deltaY > 0) {
      // 向下：内容可滚且未到底 → 不翻页
      if (pageScrollable(p) && !atBottom(p)) return;
      e.preventDefault();
      next();
    } else if (e.deltaY < 0) {
      if (pageScrollable(p) && !atTop(p)) return;
      e.preventDefault();
      prev();
    }
  }, { passive: false });

  /* ---- 键盘 ---- */
  window.addEventListener("keydown", function (e) {
    var p = pages[current];
    if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
      if (pageScrollable(p) && !atBottom(p)) return;
      e.preventDefault(); next();
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      if (pageScrollable(p) && !atTop(p)) return;
      e.preventDefault(); prev();
    } else if (e.key === "Home") { e.preventDefault(); goTo(0, "up"); }
    else if (e.key === "End") { e.preventDefault(); goTo(N - 1, "down"); }
  });

  /* ---- 触屏滑动 ---- */
  var touchStartY = null;
  window.addEventListener("touchstart", function (e) {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener("touchend", function (e) {
    if (touchStartY === null) return;
    var dy = touchStartY - e.changedTouches[0].clientY;
    var p = pages[current];
    if (Math.abs(dy) < 50) { touchStartY = null; return; }
    if (dy > 0) {
      if (pageScrollable(p) && !atBottom(p)) { touchStartY = null; return; }
      next();
    } else {
      if (pageScrollable(p) && !atTop(p)) { touchStartY = null; return; }
      prev();
    }
    touchStartY = null;
  }, { passive: true });

  /* ---- 点导航 / 顶部链接 ---- */
  document.querySelectorAll("[data-page-link]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      var i = parseInt(el.getAttribute("data-page-link"), 10);
      if (!isNaN(i)) goTo(i);
    });
  });

  /* ====================== 导航同步 ====================== */
  var navLinks = document.querySelectorAll(".nav-link");
  var dotBtns = document.querySelectorAll(".dot-btn");
  function syncNav() {
    navLinks.forEach(function (l) {
      var i = parseInt(l.getAttribute("data-page-link"), 10);
      l.classList.toggle("active", i === current);
    });
    dotBtns.forEach(function (d) {
      var i = parseInt(d.getAttribute("data-page-link"), 10);
      d.classList.toggle("active", i === current);
    });
    // 刊头滚动收敛
    var mh = document.getElementById("masthead");
    if (current === 0) mh.classList.remove("scrolled");
    else mh.classList.add("scrolled");
  }

  /* ====================== 阅读进度 ====================== */
  var progressBar = document.getElementById("progress");
  function updateProgress() {
    var p = pages[current];
    var total = p.scrollHeight - p.clientHeight;
    var pct = total > 0 ? (p.scrollTop / total) * 100 : 100;
    if (progressBar) progressBar.style.width = pct + "%";
  }
  // 页内滚动也更新进度
  pages.forEach(function (p) {
    p.addEventListener("scroll", function () {
      if (pages[current] === p) updateProgress();
    }, { passive: true });
  });

  /* ====================== Work 衔尾蛇环 + 详情卡联动 ====================== */
  var railCats = Array.prototype.slice.call(document.querySelectorAll(".rail-cat"));
  var railItems = Array.prototype.slice.call(document.querySelectorAll(".rail-item"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".work-card"));
  var railList = document.querySelector(".rail-list");
  var stage = document.getElementById("workStage");
  var autoTimer = null;

  /* 把所有分类与项目拍成一条扁平的全局序列（衔尾蛇环）。
     节点 = rail-items 里的每个项目；分类栏标题作为分段标记。 */
  var seq = [];
  railCats.forEach(function (rc) {
    var cat = rc.getAttribute("data-cat");
    seq.push({ type: "cat", cat: cat, el: rc });
    railItems.forEach(function (r) {
      var id = r.getAttribute("data-id") || "";
      if (id.indexOf(cat + "-") === 0) {
        seq.push({ type: "item", cat: cat, id: id, el: r });
      }
    });
  });
  /* 仅项目节点可被选中（分类标题点击 → 选中该栏首个项目） */
  var itemSeq = seq.filter(function (s) { return s.type === "item"; });
  var curIndex = 0;   /* 当前处于环中心的项目序号 */

  function cardById(id) {
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].getAttribute("data-id") === id) return cards[i];
    }
    return null;
  }
  function catOf(id) { return id.split("-")[0]; }

  /* 把项目序号 idx 滚动到环中心。
     立体感与渐隐由实际的滚动像素位置驱动（连续、丝滑），
     而非离散台阶；scroll 监听里实时重算。 */
  function focusItem(idx, dir) {
    idx = (idx + itemSeq.length) % itemSeq.length;   /* 衔尾蛇：首尾相接 */
    curIndex = idx;
    var node = itemSeq[idx].el;
    var target = itemSeq[idx].id;
    var activeCat = catOf(target);

    /* —— 高亮（基于序号，确定性强） —— */
    railItems.forEach(function (r) {
      var id = r.getAttribute("data-id") || "";
      var inSeq = -1, k;
      for (k = 0; k < itemSeq.length; k++) {
        if (itemSeq[k].id === id) { inSeq = k; break; }
      }
      r.classList.toggle("is-active", inSeq === idx);
    });
    railCats.forEach(function (rc) {
      rc.classList.toggle("is-cat-active", rc.getAttribute("data-cat") === activeCat);
    });

    /* —— 滚动：把目标节点居中（smooth 由 CSS / 浏览器接管） —— */
    if (railList && node) {
      var railRect = railList.getBoundingClientRect();
      var nodeRect = node.getBoundingClientRect();
      var targetTop = railList.scrollTop + (nodeRect.top - railRect.top) - (railRect.height - nodeRect.height) / 2;
      if (reduceMotion) railList.scrollTop = targetTop;
      else railList.scrollTo({ top: targetTop, behavior: "smooth" });
    }

    /* —— 右侧详情卡联动 —— */
    cards.forEach(function (c) { c.classList.remove("is-on", "flip-next", "flip-prev"); });
    var card = cardById(target);
    if (card) {
      card.classList.add("is-on");
      card.classList.add(dir === "prev" ? "flip-prev" : "flip-next");
    }
    updateCardNav(idx);
  }

  /* 滚动驱动：按每个节点到视口中心的像素距离，连续地设置
     缩放 / 透明度 / 倾斜，让整列像卷在弧面上流动。
     中心 = 最突出（大、不倾斜、不透明），越往两端的节点越往
     弧面后方倾斜、越缩小越淡。 */
  var ringTick = null;
  function scheduleRing() {
    if (ringTick) return;
    ringTick = requestAnimationFrame(function () {
      ringTick = null;
      applyRing();
    });
  }
  function applyRing() {
    if (!railList) return;
    var viewH = railList.clientHeight;
    var center = viewH / 2;
    /* 弧面半径（px）：决定从中心到边缘的弯曲强度 */
    var R = viewH * 0.52;
    var half = R;   /* 超过此距离视为转到环背面，渐隐 */

    /* 项目节点 */
    railItems.forEach(function (r) {
      var rect = r.getBoundingClientRect();
      var elCenter = rect.top + rect.height / 2 - railList.getBoundingClientRect().top;
      var d = elCenter - center;                 /* 到中心的像素偏移（带方向） */
      applyArcStyle(r, d, half);
    });
    /* 分类栏标题 */
    railCats.forEach(function (rc) {
      var btn = rc.querySelector(".rail-cat-btn");
      if (!btn) return;
      var rect = btn.getBoundingClientRect();
      var elCenter = rect.top + rect.height / 2 - railList.getBoundingClientRect().top;
      var d = elCenter - center;
      applyArcStyle(btn, d, half);
    });
  }
  /* 连续映射：t = 归一化距离 [0,1]，离中心越远越淡越倾斜 */
  function applyArcStyle(el, d, half) {
    if (!el) return;
    var ad = Math.abs(d);
    var t = Math.min(ad / half, 1);              /* 0 中心 → 1 边缘/背面 */
    /* 用正弦曲线让弯曲更自然：中心变化平缓、边缘加速卷入 */
    var e = Math.sin(t * Math.PI / 2);
    var scale = 1 - 0.34 * e;                    /* 1 → 0.66 */
    var opacity = 1 - 0.88 * Math.pow(t, 1.15);  /* 1 → ~0.12 */
    var dir = d < 0 ? -1 : 1;                    /* 上方节点向后倾，下方向前 */
    var rotate = dir * 62 * e;                   /* 0 → ±62deg */
    el.style.setProperty("--node-scale", scale.toFixed(3));
    el.style.setProperty("--node-opacity", opacity.toFixed(3));
    el.style.setProperty("--node-rotate", rotate.toFixed(1) + "deg");
  }

  /* 滚动时实时重排立体感（rAF 节流） */
  if (railList) {
    railList.addEventListener("scroll", function () {
      if (current === 1) scheduleRing();
    }, { passive: true });
  }

  /* 更新详情卡右下角的位置计数 */
  function updateCardNav(idx) {
    var pos = document.getElementById("cardPos");
    if (!pos) return;
    pos.textContent = String(idx + 1).padStart(2, "0") + " / " + itemSeq.length;
  }

  function advance(dir) {
    focusItem(curIndex + (dir === "prev" ? -1 : 1), dir);
    restartAuto();
  }

  /* 用户滚动 rail 时不打断（仅点击 / 自动轮换驱动中心位） */
  function restartAuto() {
    clearInterval(autoTimer);
    if (reduceMotion) return;
    autoTimer = setInterval(function () {
      if (current === 1) advance("next");   /* 在 Work 页才推进 */
    }, 3000);
  }

  /* 事件：分类标题点击 → 该栏首项居中 */
  railCats.forEach(function (rc) {
    var btn = rc.querySelector(".rail-cat-btn");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var cat = rc.getAttribute("data-cat");
      var firstIdx = -1, i;
      for (i = 0; i < itemSeq.length; i++) {
        if (itemSeq[i].cat === cat) { firstIdx = i; break; }
      }
      if (firstIdx >= 0) { focusItem(firstIdx, "next"); restartAuto(); }
    });
  });

  /* 事件：项目节点点击 → 该项居中 */
  railItems.forEach(function (r) {
    r.addEventListener("click", function (e) {
      e.stopPropagation();
      var id = r.getAttribute("data-id");
      var i;
      for (i = 0; i < itemSeq.length; i++) {
        if (itemSeq[i].id === id) { focusItem(i, "next"); break; }
      }
      restartAuto();
    });
  });

  /* 悬停在舞台上：暂停自动轮换 */
  if (stage) {
    stage.addEventListener("mouseenter", function () { clearInterval(autoTimer); });
    stage.addEventListener("mouseleave", function () {
      if (current === 1) restartAuto();
    });
  }

  /* 详情卡导航按钮 */
  var cardPrev = document.getElementById("cardPrev");
  var cardNext = document.getElementById("cardNext");
  if (cardPrev) cardPrev.addEventListener("click", function (e) { e.stopPropagation(); advance("prev"); });
  if (cardNext) cardNext.addEventListener("click", function (e) { e.stopPropagation(); advance("next"); });

  /* 滚轮：鼠标悬停在左侧 rail 时 → 翻项目（在全局 wheel 处理中接管）。
     这里只负责记录悬停状态。 */
  var rail = document.querySelector(".work-rail");
  var railLock = 0;
  var hoveringRail = false;
  if (rail) {
    rail.addEventListener("mouseenter", function () { hoveringRail = true; });
    rail.addEventListener("mouseleave", function () { hoveringRail = false; });
  }

  /* ====================== 初始化 ====================== */
  function init() {
    pages.forEach(function (p, i) {
      if (i === 0) p.classList.add("is-active");
      else p.classList.remove("is-active");
    });
    syncNav();
    updateProgress();
    // Work 默认：首个项目居中
    focusItem(0, "next");
    // 首屏立体感（无动画，直接落位）
    requestAnimationFrame(function () { applyRing(); });
  }
  init();
  restartAuto();

  // Work 页激活后稍延迟重排一次立体感（翻页进入时布局刚稳定）
  var workPage = document.getElementById("work");
  if (workPage) {
    var mo = new MutationObserver(function () {
      if (workPage.classList.contains("is-active")) {
        setTimeout(function () { applyRing(); }, 60);
      }
    });
    mo.observe(workPage, { attributes: true, attributeFilter: ["class"] });
  }

})();
