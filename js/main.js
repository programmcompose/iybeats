/* IY BEATS landing — main.js */
(function () {
  'use strict';

  document.documentElement.classList.add('js');
  var noAnim = /[?&]noanim/.test(location.search);
  if (noAnim) document.documentElement.classList.add('noanim');

  // Header: тень/граница при скролле
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal-on-scroll (отключается через ?noanim — для скриншотов/тестов)
  var revealEls = document.querySelectorAll('.reveal');
  if (noAnim) {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  } else if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // Typewriter в hero
  var tw = document.getElementById('typewriter');
  if (tw) {
    var words = [
      'битмейкинг',
      'сведение и мастеринг',
      'EDM-продакшн',
      'запись вокала',
      'теорию музыки'
    ];
    var wi = 0, ci = 0, deleting = false;

    function tick() {
      var word = words[wi];
      if (!deleting) {
        ci++;
        tw.textContent = word.slice(0, ci);
        if (ci === word.length) {
          deleting = true;
          return setTimeout(tick, 2100);
        }
        setTimeout(tick, 65 + Math.random() * 45);
      } else {
        ci--;
        tw.textContent = word.slice(0, ci);
        if (ci === 0) {
          deleting = false;
          wi = (wi + 1) % words.length;
          return setTimeout(tick, 380);
        }
        setTimeout(tick, 32);
      }
    }
    tick();
  }

  // FAQ: закрывать соседние при открытии (аккордеон)
  var faqItems = document.querySelectorAll('details.faq-item');
  faqItems.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) {
        faqItems.forEach(function (o) { if (o !== d && o.open) o.removeAttribute('open'); });
      }
    });
  });

  // Год в футере
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // ---------- Видео: ленивая загрузка embed при появлении на экране ----------
  // На мобильных VK не даёт встраивать видео в iframe (страница отдаётся без фрейм-разрешения),
  // поэтому показываем кнопку, открывающую видео во вкладке/приложении.
  var isMobile = /Android|iPhone|iPod|iPad/i.test(navigator.userAgent) ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  var videoFrames = document.querySelectorAll('.video-frame[data-video]');
  videoFrames.forEach(function (frame) {
    var src = frame.getAttribute('data-video').trim();
    if (!src) return; // пусто — показываем плейсхолдер
    if (isMobile) {
      var mobileUrl = frame.getAttribute('data-mobile-url') || 'https://vkvideo.ru/';
      var ph = frame.querySelector('.video-placeholder');
      if (ph) {
        ph.classList.add('vp-link');
        var txt = ph.querySelector('.vp-text');
        if (txt) txt.textContent = 'Смотреть видео на VK';
        frame.addEventListener('click', function () { window.open(mobileUrl, '_blank', 'noopener'); });
      }
      return;
    }
    var iframe = frame.querySelector('.video-embed');
    function load() {
      iframe.src = src;
      frame.classList.add('loaded');
    }
    if ('IntersectionObserver' in window && !noAnim) {
      var vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { load(); vio.disconnect(); }
        });
      }, { rootMargin: '300px 0px' });
      vio.observe(frame);
    } else {
      load();
    }
  });

  // ---------- Lightbox: клик по фото → полный размер + zoom/pan ----------
  var lbTriggers = document.querySelectorAll('img[data-lightbox]');
  if (lbTriggers.length) {
    var overlay, viewport, imgEl, closeBtn;
    var iw = 0, ih = 0, vw = 0, vh = 0, fitS = 1;
    var s = 1, tx = 0, ty = 0;
    var pointers = new Map();
    var pinchD0 = 0, pinchS0 = 1;
    var movedDist = 0;

    overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.innerHTML =
      '<button class="lb-close" aria-label="Закрыть">✕</button>' +
      '<div class="lb-viewport"><img class="lb-img" alt=""></div>' +
      '<div class="lb-hint">колесо / пинч — масштаб · перетаскивание — сдвиг · двойной клик — сброс</div>';
    document.body.appendChild(overlay);

    viewport = overlay.querySelector('.lb-viewport');
    imgEl = overlay.querySelector('.lb-img');
    closeBtn = overlay.querySelector('.lb-close');

    function apply() {
      imgEl.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')';
    }
    function clampPan() {
      var w = iw * s, h = ih * s;
      if (w <= vw) { tx = (vw - w) / 2; } else { tx = Math.min(0, Math.max(vw - w, tx)); }
      if (h <= vh) { ty = (vh - h) / 2; } else { ty = Math.min(0, Math.max(vh - h, ty)); }
    }
    function reset() {
      fitS = Math.min(vw / iw, vh / ih);
      s = fitS;
      tx = (vw - iw * s) / 2;
      ty = (vh - ih * s) / 2;
      apply();
    }
    function zoomAt(px, py, ns) {
      var maxS = fitS * 8;
      ns = Math.max(fitS, Math.min(maxS, ns));
      if (ns === s) return;
      var cx = (px - tx) / s, cy = (py - ty) / s; // точка под курсором
      tx = px - cx * ns;
      ty = py - cy * ns;
      s = ns;
      clampPan();
      apply();
    }
    function localPoint(e) {
      var r = viewport.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    }

    viewport.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      viewport.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, localPoint(e));
      movedDist = 0;
      viewport.classList.add('grabbing');
      if (pointers.size === 2) {
        var pts = Array.from(pointers.values());
        pinchD0 = Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]);
        pinchS0 = s;
      }
    });

    viewport.addEventListener('pointermove', function (e) {
      if (!pointers.has(e.pointerId)) return;
      var p = localPoint(e);
      if (pointers.size === 1) {
        var prev = pointers.get(e.pointerId);
        movedDist += Math.abs(p[0] - prev[0]) + Math.abs(p[1] - prev[1]);
        tx += p[0] - prev[0];
        ty += p[1] - prev[1];
        pointers.set(e.pointerId, p);
        clampPan();
        apply();
      } else if (pointers.size === 2) {
        pointers.set(e.pointerId, p);
        var pts = Array.from(pointers.values());
        var d = Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]);
        if (pinchD0 > 0) {
          zoomAt((pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2, pinchS0 * d / pinchD0);
        }
      }
    });

    function endPointer(e) {
      pointers.delete(e.pointerId);
      if (!pointers.size) { pinchD0 = 0; viewport.classList.remove('grabbing'); }
    }
    viewport.addEventListener('pointerup', endPointer);
    viewport.addEventListener('pointercancel', endPointer);

    // Колесо мыши / трекпад: зум к точке под курсором
    viewport.addEventListener('wheel', function (e) {
      e.preventDefault();
      var dy = e.deltaY * (e.deltaMode === 1 ? 32 : 1);
      var p = localPoint(e);
      zoomAt(p[0], p[1], s * Math.exp(-dy * 0.0022));
    }, { passive: false });

    // Двойной клик / тап: зум ×2.6 или сброс
    viewport.addEventListener('dblclick', function (e) {
      var p = localPoint(e);
      if (s > fitS * 1.15) { reset(); } else { zoomAt(p[0], p[1], fitS * 2.6); }
    });

    // Клик по пустому месту закрывает (но не после перетаскивания)
    viewport.addEventListener('click', function (e) {
      if (movedDist < 8 && e.target === viewport) close();
    });

    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') close();
    });

    window.addEventListener('resize', function () {
      if (!overlay.classList.contains('open') || !iw) return;
      vw = viewport.clientWidth;
      vh = viewport.clientHeight;
      fitS = Math.min(vw / iw, vh / ih);
      s = Math.max(s, fitS);
      clampPan();
      apply();
    });

    function open(src, alt) {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      imgEl.onload = function () {
        iw = imgEl.naturalWidth;
        ih = imgEl.naturalHeight;
        vw = viewport.clientWidth;
        vh = viewport.clientHeight;
        reset();
      };
      imgEl.alt = alt || '';
      imgEl.src = src; // картинка уже кэширована со страницы — откроется мгновенно
    }
    function close() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      pointers.clear();
    }

    lbTriggers.forEach(function (t) {
      t.setAttribute('tabindex', '0');
      t.setAttribute('role', 'button');
      if (!t.getAttribute('aria-label')) {
        t.setAttribute('aria-label', 'Открыть изображение в полном размере');
      }
      function go() { open(t.currentSrc || t.src, t.alt); }
      t.addEventListener('click', go);
      t.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
      });
    });
  }

  // ---------- Таймер до открытия набора (15 декабря 2026, локальное время) ----------
  (function () {
    var cd = document.getElementById('countdown');
    if (!cd) return;
    var dEl = document.getElementById('cd-d'),
        hEl = document.getElementById('cd-h'),
        mEl = document.getElementById('cd-m'),
        sEl = document.getElementById('cd-s');
    if (!dEl || !hEl || !mEl || !sEl) return;
    var target = new Date(2026, 11, 15, 0, 0, 0).getTime(); // 15.12.2026 00:00
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    var timer = null;
    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        cd.innerHTML = '<span class="cd-open">Набор открыт!</span>';
        if (timer) clearInterval(timer);
        return;
      }
      dEl.textContent = String(Math.floor(diff / 86400000));
      hEl.textContent = pad(Math.floor(diff / 3600000) % 24);
      mEl.textContent = pad(Math.floor(diff / 60000) % 60);
      sEl.textContent = pad(Math.floor(diff / 1000) % 60);
    }
    tick();
    timer = setInterval(tick, 1000);
  })();
})();
