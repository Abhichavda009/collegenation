(function () {
  document.querySelectorAll('[data-cn-faq]').forEach((faq) => {
    if (faq.dataset.cnInitialized === 'true') return;
    faq.dataset.cnInitialized = 'true';

    faq.querySelectorAll('[data-cn-faq-question]').forEach((button) => {
      button.addEventListener('click', () => {
        const item = button.closest('[data-cn-faq-item]');
        const open = item.classList.toggle('is-open');
        button.setAttribute('aria-expanded', String(open));
        const icon = button.querySelector('[data-cn-faq-icon]');
        if (icon) icon.textContent = open ? '-' : '+';
      });
    });
  });
})();
