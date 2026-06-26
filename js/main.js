/* =========================================================================
   AM-SuSh · 克制动效
   - 顶部阅读进度条
   - 滚动渐入 (IntersectionObserver)
   - 导航刊头滚动收敛 + 当前章节高亮
   ========================================================================= */
(function () {
  "use strict";

  /* ---------- 阅读进度条 ---------- */
  var progress = document.getElementById("progress");
  function updateProgress() {
    var h = document.documentElement;
    var scrolled = h.scrollTop;
    var total = h.scrollHeight - h.clientHeight;
    var pct = total > 0 ? (scrolled / total) * 100 : 0;
    if (progress) progress.style.width = pct + "%";
  }

  /* ---------- 刊头滚动收敛 ---------- */
  var masthead = document.getElementById("masthead");
  function updateMasthead() {
    if (!masthead) return;
    if (window.scrollY > 40) masthead.classList.add("scrolled");
    else masthead.classList.remove("scrolled");
  }

  function onScroll() {
    updateProgress();
    updateMasthead();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 滚动渐入 ---------- */
  var revealEls = document.querySelectorAll("[data-reveal], .reveal-up");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    // 降级：直接显示
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- 导航当前章节高亮 ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var sections = navLinks
    .map(function (l) { return document.querySelector(l.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (l) {
          l.classList.toggle("active", l.getAttribute("href") === "#" + id);
        });
      });
    }, { threshold: 0, rootMargin: "-45% 0px -50% 0px" });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 平滑滚动偏移（刊头高度）---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 30;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });
})();
