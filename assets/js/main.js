

(function () {
  'use strict';

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

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
          vy: Math.random() * 0.26 + 0.05,
          a: Math.random() * 0.4 + 0.22,
          tw: Math.random() * Math.PI * 2,
          tws: Math.random() * 0.018 + 0.004,
          c: HUE[(Math.random() * HUE.length) | 0],
          crystal: Math.random() < 0.3
        });
      }
    }

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

  function initTyper() {
    var el = $('#typer');
    if (!el) return;

    var LINES = [
      '后端架构 / Java 生态',
      '前端 / 全栈 Web',
      '数据库设计与优化',
      '服务器 / 运维部署',
      'AI / LLM 工程',
      '逆向工程 / 网络通信',
      'Inventor 建模 / CAD',
      '视频剪辑 / 后期'
    ];

    if (reduce) { el.textContent = LINES[0]; return; }

    var chars = LINES.map(function (t) { return t.split(''); });
    var li = 0, ci = 0, del = false;

    function tick() {
      var cur = chars[li];
      el.textContent = cur.slice(0, ci).join('');

      var wait;
      if (!del) {
        if (ci < cur.length) { ci++; wait = 88 + Math.random() * 74; }
        else { del = true; wait = 2000; }
      } else {
        if (ci > 0) { ci--; wait = 38; }
        else { del = false; li = (li + 1) % chars.length; wait = 340; }
      }
      setTimeout(tick, wait);
    }

    setTimeout(tick, 700);
  }

  function initMascotLines() {
    var el = $('#mascotLine');
    if (!el || reduce) return;

    var LINES = [
      '在写代码。',
      '在看日志。',
      '在改配置。',
      '在查协议。',
      '在跑测试。'
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
    }, 6200);
  }

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
        var delay = i > 0 ? Math.min(i * 70, 340) : 0;

        setTimeout(function () { el.classList.add('is-in'); }, delay);
        io.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

    items.forEach(function (el) { io.observe(el); });
  }

  function initTierCounts() {
    var list = $$('.tier__count');
    if (!list.length) return;

    function run(el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      if (reduce) { el.textContent = String(target); return; }

      var dur = 1100, start = null;
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
      es.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        var el = e.target;
        setTimeout(function () { run(el); }, i * 110);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });

    list.forEach(function (c) { io.observe(c); });
  }

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

  function initYear() {
    var y = $('#year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function boot() {
    initFrost();
    initTyper();
    initMascotLines();
    initReveal();
    initTierCounts();
    initNav();
    initPointer();
    initWidgets();
    initCopy();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
