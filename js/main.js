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
})();
