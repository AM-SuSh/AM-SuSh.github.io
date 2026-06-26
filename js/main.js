/* =========================================================================
   AM-SuSh · 非连续阅读引擎 + Work 轮换 + Craft 入场
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
    return p.scrollHeight - p.clientHeight > 4;
  }
  /* 当前页是否已滚动到顶/底，可允许翻页 */
  function atTop(p) { return p.scrollTop <= 2; }
  function atBottom(p) { return p.scrollTop + p.clientHeight >= p.scrollHeight - 2; }

  /* ---- 滚轮：智能判断“先内滚，再翻页” ---- */
  window.addEventListener("wheel", function (e) {
    if (locked) { e.preventDefault(); return; }
    var p = pages[current];

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

  /* ====================== Work 时间轴 + 详情卡联动 ====================== */
  var railCats = Array.prototype.slice.call(document.querySelectorAll(".rail-cat"));
  var railItems = Array.prototype.slice.call(document.querySelectorAll(".rail-item"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".work-card"));
  var stage = document.getElementById("workStage");
  var autoTimer = null;
  var catIndex = {};   // { ai: 当前显示序号, tools: ..., ... }
  var activeCat = "ai";

  function cardsOf(cat) {
    return cards.filter(function (c) { return c.getAttribute("data-cat") === cat; });
  }

  function itemsOf(cat) {
    return railItems.filter(function (r) {
      return r.getAttribute("data-id") && r.getAttribute("data-id").indexOf(cat + "-") === 0;
    });
  }

  /* 同步时间轴项目节点的高亮 */
  function syncRailActive(cat, idx) {
    var id = cat + "-" + idx;
    railItems.forEach(function (r) {
      r.classList.toggle("is-active", r.getAttribute("data-id") === id);
    });
  }

  /* 更新详情卡右下角的 位置计数（01 / N） */
  function updateCardNav(cat, idx) {
    var pos = document.getElementById("cardPos");
    if (!pos) return;
    var list = cardsOf(cat);
    var n = list.length;
    pos.textContent = String(idx + 1).padStart(2, "0") + " / " + n;
  }

  function showCard(cat, dir, manual) {
    var list = cardsOf(cat);
    if (!list.length) return;
    if (catIndex[cat] === undefined) catIndex[cat] = 0;
    var idx = catIndex[cat];

    cards.forEach(function (c) { c.classList.remove("is-on", "flip-next", "flip-prev"); });
    var card = list[idx];
    card.classList.add("is-on");
    card.classList.add(dir === "prev" ? "flip-prev" : "flip-next");

    syncRailActive(cat, idx);
    updateCardNav(cat, idx);
  }

  function advanceCard(dir) {
    var list = cardsOf(activeCat);
    if (!list.length) return;
    var idx = catIndex[activeCat] || 0;
    idx = (idx + (dir === "prev" ? -1 : 1) + list.length) % list.length;
    catIndex[activeCat] = idx;
    showCard(activeCat, dir, true);
    restartAuto();
  }

  /* 折叠/展开分类；展开时切换为当前活动分类 */
  function toggleCat(cat, open) {
    railCats.forEach(function (rc) {
      var c = rc.getAttribute("data-cat");
      if (c === cat) {
        var willOpen = open === undefined ? !rc.classList.contains("is-open") : open;
        rc.classList.toggle("is-open", willOpen);
        var btn = rc.querySelector(".rail-cat-btn");
        if (btn) btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
      }
    });
  }

  function selectCat(cat) {
    activeCat = cat;
    catIndex[cat] = catIndex[cat] || 0;
    toggleCat(cat, true);     // 展开目标分类（不强制收起其他分类，允许多开）
    showCard(cat, "next", true);
    restartAuto();
  }

  /* 点击项目节点 → 直接定位该详情卡 */
  function jumpToItem(id) {
    var parts = id.split("-");
    var cat = parts[0];
    var idx = parseInt(parts[1], 10);
    if (isNaN(idx)) return;
    activeCat = cat;
    catIndex[cat] = idx;
    showCard(cat, "next", true);
    restartAuto();
  }

  function restartAuto() {
    clearInterval(autoTimer);
    if (reduceMotion) return;
    autoTimer = setInterval(function () {
      if (current === 2) advanceCard("next");
    }, 5000);
  }

  /* 事件绑定：分类折叠按钮 */
  railCats.forEach(function (rc) {
    var btn = rc.querySelector(".rail-cat-btn");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var cat = rc.getAttribute("data-cat");
      var willOpen = !rc.classList.contains("is-open");
      toggleCat(cat, willOpen);
      if (willOpen) selectCat(cat);
    });
  });

  /* 事件绑定：项目节点点击 */
  railItems.forEach(function (r) {
    r.addEventListener("click", function (e) {
      e.stopPropagation();
      var id = r.getAttribute("data-id");
      if (id) jumpToItem(id);
    });
  });

  /* 悬停在舞台上：暂停自动轮换 */
  if (stage) {
    stage.addEventListener("mouseenter", function () { clearInterval(autoTimer); });
    stage.addEventListener("mouseleave", function () {
      if (current === 2) restartAuto();
    });
  }

  /* 详情卡导航按钮 */
  var cardPrev = document.getElementById("cardPrev");
  var cardNext = document.getElementById("cardNext");
  if (cardPrev) cardPrev.addEventListener("click", function (e) { e.stopPropagation(); advanceCard("prev"); });
  if (cardNext) cardNext.addEventListener("click", function (e) { e.stopPropagation(); advanceCard("next"); });

  /* ====================== 初始化 ====================== */
  function init() {
    pages.forEach(function (p, i) {
      if (i === 0) p.classList.add("is-active");
      else p.classList.remove("is-active");
    });
    syncNav();
    updateProgress();
    // Work 默认：展开 AI 分类，显示第 1 项
    catIndex.ai = 0;
    showCard("ai", "next", false);
  }
  init();
  restartAuto();

})();
