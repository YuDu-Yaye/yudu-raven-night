/* ============================================================
   羽渡鸦夜 · 冰山之下
   交互脚本 · 原生 JS，零依赖
   冷是外壳，「融冰」是内核
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };


  /* ----------------------------------------------------------
     1. 冰晶粒子
     ---------------------------------------------------------- */
  function initFrost() {
    var cv = $('#frost');
    if (!cv || reduce) return;

    var ctx = cv.getContext('2d');
    if (!ctx) return;

    var dpr = 1, w = 0, h = 0, bits = [], raf = null;
    var mouse = { x: -9999, y: -9999 };
    var HUE = ['238,240,255', '169,196,255', '201,182,255', '177,140,255'];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth || window.innerWidth;
      h = cv.clientHeight || window.innerHeight;
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function build() {
      var n = Math.round(Math.min(110, Math.max(40, (w * h) / 24000)));
      bits = [];
      for (var i = 0; i < n; i++) {
        bits.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.5 + 0.5,
          vx: (Math.random() - 0.5) * 0.14,
          vy: Math.random() * 0.26 + 0.05,       /* 缓缓下沉，像落雪 */
          a: Math.random() * 0.4 + 0.22,
          tw: Math.random() * Math.PI * 2,
          tws: Math.random() * 0.018 + 0.004,
          c: HUE[(Math.random() * HUE.length) | 0],
          crystal: Math.random() < 0.3            /* 一部分画成冰晶 */
        });
      }
    }

    /* 六角冰晶 */
    function crystal(x, y, r, color, alpha) {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = 'rgba(' + color + ',' + alpha + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var k = 0; k < 6; k++) {
        var ang = (Math.PI / 3) * k;
        var ex = Math.cos(ang) * r, ey = Math.sin(ang) * r;
        ctx.moveTo(0, 0);
        ctx.lineTo(ex, ey);
        /* 侧枝 */
        var bx = Math.cos(ang) * r * 0.6, by = Math.sin(ang) * r * 0.6;
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(ang + 1.05) * r * 0.32, by + Math.sin(ang + 1.05) * r * 0.32);
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(ang - 1.05) * r * 0.32, by + Math.sin(ang - 1.05) * r * 0.32);
      }
      ctx.stroke();
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < bits.length; i++) {
        var b = bits[i];
        b.x += b.vx;
        b.y += b.vy;
        b.tw += b.tws;

        if (b.y > h + 24) { b.y = -24; b.x = Math.random() * w; }
        if (b.x < -24) b.x = w + 24;
        if (b.x > w + 24) b.x = -24;

        var alpha = b.a + Math.sin(b.tw) * 0.22;
        if (alpha < 0.05) alpha = 0.05;
        if (alpha > 1) alpha = 1;

        var dx = b.x - mouse.x, dy = b.y - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var boost = dist < 150 ? (1 - dist / 150) : 0;

        if (b.crystal) {
          crystal(b.x, b.y, b.r * 3.2 + boost * 3, b.c, Math.min(1, alpha + boost * 0.5));
        } else {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r + boost * 1.6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + b.c + ',' + Math.min(1, alpha + boost * 0.5) + ')';
          ctx.fill();
        }
      }

      if (mouse.x > -1000) {
        var g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 150);
        g.addColorStop(0,   'rgba(169,196,255,0.09)');
        g.addColorStop(0.5, 'rgba(157,123,255,0.04)');
        g.addColorStop(1,   'rgba(157,123,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(mouse.x - 150, mouse.y - 150, 300, 300);
      }

      raf = requestAnimationFrame(draw);
    }

    var pending = null;
    window.addEventListener('pointermove', function (e) {
      pending = { x: e.clientX, y: e.clientY };
    }, { passive: true });

    (function flush() {
      if (pending) { mouse.x = pending.x; mouse.y = pending.y; pending = null; }
      requestAnimationFrame(flush);
    })();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
      } else if (!raf) {
        raf = requestAnimationFrame(draw);
      }
    });

    var rt = null;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(resize, 180);
    });

    resize();
    raf = requestAnimationFrame(draw);
  }


  /* ----------------------------------------------------------
     2. 打字机：冷句式
     ---------------------------------------------------------- */
  function initTyper() {
    var el = $('#typer');
    if (!el) return;

    var LINES = [
      '后端架构。',
      'Java / 高并发。',
      'C++ / 系统层。',
      '全栈，也能做。',
      '以及——安静地写代码。'
    ];

    if (reduce) { el.textContent = LINES[0]; return; }

    var chars = LINES.map(function (t) { return t.split(''); });
    var li = 0, ci = 0, del = false;

    function tick() {
      var cur = chars[li];
      el.textContent = cur.slice(0, ci).join('');

      var wait;
      if (!del) {
        if (ci < cur.length) { ci++; wait = 92 + Math.random() * 76; }
        else { del = true; wait = 1900; }
      } else {
        if (ci > 0) { ci--; wait = 40; }
        else { del = false; li = (li + 1) % chars.length; wait = 360; }
      }
      setTimeout(tick, wait);
    }

    setTimeout(tick, 800);
  }


  /* ----------------------------------------------------------
     3. 吉祥物台词：冷 → 慢慢漏出软
     ---------------------------------------------------------- */
  function initMascotLines() {
    var el = $('#mascotLine');
    if (!el || reduce) return;

    var LINES = [
      '……别盯着看。',
      '有事说事。',
      '我不太会聊天，先说好。',
      '（……其实你可以多待一会儿。）',
      '哼，随你。'
    ];

    var i = 0;
    el.style.transition = 'opacity .3s ease';

    setInterval(function () {
      i = (i + 1) % LINES.length;
      el.style.opacity = '0';
      setTimeout(function () {
        el.textContent = LINES[i];
        el.style.opacity = '1';
      }, 300);
    }, 5600);
  }


  /* ----------------------------------------------------------
     4. 融冰
     ---------------------------------------------------------- */
  function initMelt() {
    var melt = $('#melt');
    var btn = $('#meltBtn');
    if (!melt || !btn) return;

    var txt = $('.melt__btn-txt', btn);

    function set(open) {
      melt.classList.toggle('is-open', open);
      btn.setAttribute('aria-pressed', open ? 'true' : 'false');
      if (txt) txt.textContent = open ? '把手放回去' : '敲开冰面';

      if (open) {
        /* 冰化开的时候，星星也软一下 */
        sparkle(btn);
      }
    }

    btn.addEventListener('click', function () {
      set(!melt.classList.contains('is-open'));
    });

    /* 第一次滚到视野里，冰面自己裂一下，提示可以点 */
    if (!reduce && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          melt.classList.add('is-teasing');
          setTimeout(function () { melt.classList.remove('is-teasing'); }, 2400);
          io.disconnect();
        });
      }, { threshold: 0.35 });
      io.observe(melt);
    }
  }

  /* 在元素位置撒一把光点 */
  function sparkle(el) {
    if (reduce) return;
    var r = el.getBoundingClientRect();
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height / 2;

    for (var i = 0; i < 10; i++) {
      (function (k) {
        var s = document.createElement('span');
        s.textContent = '✦';
        s.setAttribute('aria-hidden', 'true');
        s.style.cssText =
          'position:fixed;left:' + (cx + (Math.random() - 0.5) * r.width) + 'px;' +
          'top:' + cy + 'px;' +
          'font-size:' + (9 + Math.random() * 11) + 'px;' +
          'color:' + (Math.random() < 0.5 ? '#a9c4ff' : '#ff9ed4') + ';' +
          'pointer-events:none;z-index:9999;opacity:1;' +
          'transition:transform 1.2s cubic-bezier(.16,1,.3,1),opacity 1.2s ease;';
        document.body.appendChild(s);

        requestAnimationFrame(function () {
          s.style.transform =
            'translate(' + ((Math.random() - 0.5) * 160) + 'px,' +
            (-50 - Math.random() * 90) + 'px) scale(1.5) rotate(' + ((Math.random() - 0.5) * 180) + 'deg)';
          s.style.opacity = '0';
        });

        setTimeout(function () {
          if (s.parentNode) s.parentNode.removeChild(s);
        }, 1300 + k * 60);
      })(i);
    }
  }


  /* ----------------------------------------------------------
     5. 入场
     ---------------------------------------------------------- */
  function initReveal() {
    var items = $$('[data-in]');
    if (!items.length) return;

    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var sibs = el.parentElement ? $$('[data-in]', el.parentElement) : [];
        var i = sibs.indexOf(el);
        var delay = i > 0 ? Math.min(i * 60, 300) : 0;

        setTimeout(function () { el.classList.add('is-in'); }, delay);
        io.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

    items.forEach(function (el) { io.observe(el); });
  }


  /* ----------------------------------------------------------
     6. 数值
     ---------------------------------------------------------- */
  function initCounters() {
    var list = $$('.count');
    if (!list.length) return;

    function run(el) {
      var target = parseFloat(el.getAttribute('data-to')) || 0;
      if (reduce) { el.textContent = String(target); return; }

      var dur = 1500, start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = String(target);
      }
      requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) { list.forEach(run); return; }

    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        run(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.6 });

    list.forEach(function (c) { io.observe(c); });
  }

  function initBars() {
    var targets = $$('.stat').map(function (s) {
      return { el: s, v: parseFloat(s.getAttribute('data-val')) || 0, bar: $('.stat__bar i', s) };
    }).concat($$('.skill').map(function (s) {
      return { el: s, v: parseFloat(s.getAttribute('data-lv')) || 0, bar: $('.skill__track i', s) };
    })).filter(function (o) { return o.bar; });

    if (!targets.length) return;

    function fill(o) {
      o.bar.style.setProperty('--w', o.v + '%');
      requestAnimationFrame(function () {
        setTimeout(function () { o.bar.style.width = o.v + '%'; }, 70);
      });
    }

    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach(fill);
      return;
    }

    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        var o = targets.filter(function (t) { return t.el === e.target; })[0];
        if (!o) return;
        setTimeout(function () { fill(o); }, i * 85);
        io.unobserve(e.target);
      });
    }, { threshold: 0.4 });

    targets.forEach(function (o) { io.observe(o.el); });
  }


  /* ----------------------------------------------------------
     7. 导航
     ---------------------------------------------------------- */
  function initNav() {
    var nav = $('#nav');
    var burger = $('#navBurger');
    var drawer = $('#drawer');
    var links = $$('.nav__links a');

    function onScroll() {
      if (nav) nav.classList.toggle('is-stuck', window.scrollY > 24);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    function setDrawer(open) {
      if (!drawer || !burger) return;
      drawer.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
      burger.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    }

    if (burger) {
      burger.addEventListener('click', function () {
        setDrawer(!drawer.classList.contains('is-open'));
      });
    }
    if (drawer) {
      $$('a', drawer).forEach(function (a) {
        a.addEventListener('click', function () { setDrawer(false); });
      });
    }
    document.addEventListener('click', function (e) {
      if (!drawer || !drawer.classList.contains('is-open')) return;
      if (drawer.contains(e.target) || (burger && burger.contains(e.target))) return;
      setDrawer(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setDrawer(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1000) setDrawer(false);
    });

    var secs = $$('main section[id]');
    if (!secs.length || !links.length || !('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.getAttribute('id');
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    secs.forEach(function (s) { io.observe(s); });
  }


  /* ----------------------------------------------------------
     8. 指针
     ---------------------------------------------------------- */
  function initPointer() {
    if (reduce || window.matchMedia('(hover: none)').matches) return;

    var ice = $('#pointerIce');
    var tx = 0, ty = 0, cx = 0, cy = 0, running = false;

    if (ice) {
      window.addEventListener('pointermove', function (e) {
        tx = e.clientX; ty = e.clientY;
        ice.classList.add('is-on');
        if (!running) { running = true; requestAnimationFrame(loop); }
      }, { passive: true });

      document.addEventListener('mouseleave', function () { ice.classList.remove('is-on'); });

      (function loop() {
        cx += (tx - cx) * 0.11;
        cy += (ty - cy) * 0.11;
        ice.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
        if (Math.abs(tx - cx) > 0.4 || Math.abs(ty - cy) > 0.4) requestAnimationFrame(loop);
        else running = false;
      })();
    }

    /* 作品卡：很轻微的倾斜，冷得不动声色 */
    $$('[data-tilt]').forEach(function (card) {
      var MAX = 4;

      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;

        card.style.transform =
          'perspective(1000px) rotateX(' + ((0.5 - py) * MAX * 2).toFixed(2) + 'deg)' +
          ' rotateY(' + ((px - 0.5) * MAX * 2).toFixed(2) + 'deg)' +
          ' translateY(-4px)';
        card.style.transition = 'transform .14s linear, border-color .45s, box-shadow .45s';
      }, { passive: true });

      card.addEventListener('pointerleave', function () {
        card.style.transition = 'transform .7s cubic-bezier(.22,.61,.36,1), border-color .45s, box-shadow .45s';
        card.style.transform = '';
      });
    });
  }


  /* ----------------------------------------------------------
     9. 进度 + 回顶
     ---------------------------------------------------------- */
  function initWidgets() {
    var bar = $('#progress');
    var top = $('#toTop');
    var ticking = false;

    function update() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (bar) bar.style.width = Math.min(100, Math.max(0, p)) + '%';
      if (top) top.classList.toggle('is-on', window.scrollY > 460);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });

    update();
  }


  /* ----------------------------------------------------------
     10. 复制
     ---------------------------------------------------------- */
  function initCopy() {
    $$('[data-copy]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();

        var val = el.getAttribute('data-copy');
        var label = $('[data-copy-label]', el);
        var orig = label ? label.textContent : '';

        function done() {
          if (!label) return;
          label.textContent = '已复制';
          label.classList.add('is-done');
          setTimeout(function () {
            label.textContent = orig;
            label.classList.remove('is-done');
          }, 1800);
        }

        function fallback() {
          try {
            var ta = document.createElement('textarea');
            ta.value = val;
            ta.setAttribute('readonly', '');
            ta.style.cssText = 'position:fixed;left:-9999px;opacity:0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            done();
          } catch (err) {
            if (label) label.textContent = '请手动复制';
          }
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(val).then(done).catch(fallback);
        } else {
          fallback();
        }
      });
    });
  }


  /* ----------------------------------------------------------
     11. 双击彩蛋：冰面下的粉
     ---------------------------------------------------------- */
  function initEasterEgg() {
    if (reduce) return;

    document.addEventListener('dblclick', function (e) {
      if (e.target.closest('a, button, input, textarea')) return;

      for (var i = 0; i < 6; i++) {
        (function (k) {
          var s = document.createElement('span');
          s.textContent = Math.random() < 0.5 ? '♥' : '✦';
          s.setAttribute('aria-hidden', 'true');
          s.style.cssText =
            'position:fixed;left:' + (e.clientX + (Math.random() - 0.5) * 40) + 'px;' +
            'top:' + e.clientY + 'px;' +
            'font-size:' + (11 + Math.random() * 13) + 'px;' +
            'color:' + (Math.random() < 0.6 ? '#ff9ed4' : '#a9c4ff') + ';' +
            'pointer-events:none;z-index:9999;' +
            'transition:transform 1.3s cubic-bezier(.16,1,.3,1),opacity 1.3s ease;';
          document.body.appendChild(s);

          requestAnimationFrame(function () {
            s.style.transform =
              'translate(' + ((Math.random() - 0.5) * 110) + 'px,' +
              (-80 - Math.random() * 80) + 'px) rotate(' + ((Math.random() - 0.5) * 120) + 'deg) scale(1.4)';
            s.style.opacity = '0';
          });

          setTimeout(function () {
            if (s.parentNode) s.parentNode.removeChild(s);
          }, 1400 + k * 70);
        })(i);
      }
    });
  }


  /* ----------------------------------------------------------
     12. 年份
     ---------------------------------------------------------- */
  function initYear() {
    var y = $('#year');
    if (y) y.textContent = String(new Date().getFullYear());
  }


  /* ----------------------------------------------------------
     启动
     ---------------------------------------------------------- */
  function boot() {
    initFrost();
    initTyper();
    initMascotLines();
    initMelt();
    initReveal();
    initCounters();
    initBars();
    initNav();
    initPointer();
    initWidgets();
    initCopy();
    initEasterEgg();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
