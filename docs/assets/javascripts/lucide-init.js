document.addEventListener('DOMContentLoaded', function () {
  // Lucide icons (конвенция potoksite: <i data-lucide="...">)
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }

  // CTA-кнопка в шапке сайта
  var inner = document.querySelector('.md-header__inner');
  if (inner && !inner.querySelector('.header-cta')) {
    var a = document.createElement('a');
    var onIndex = location.pathname.replace(/\/index\.html$/, '/').replace(/\/+$/, '') === '' || /\/$/.test(location.pathname);
    a.href = onIndex ? '#enroll' : '/#enroll';
    a.className = 'header-cta';
    a.textContent = 'Записаться на поток';
    inner.appendChild(a);
  }
});
