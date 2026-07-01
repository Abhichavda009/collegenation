(function () {
  const headers = document.querySelectorAll('[data-cn-header]');

  headers.forEach((header) => {
    const trigger = header.querySelector('[data-cn-university-trigger]');
    const menu = header.querySelector('[data-cn-university-menu]');
    const tabs = header.querySelectorAll('[data-cn-conference-tab]');
    const panels = header.querySelectorAll('[data-cn-conference-panel]');

    if (trigger && menu) {
      const closeMenu = () => {
        menu.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
      };

      trigger.addEventListener('click', () => {
        const nextOpen = menu.hidden;
        menu.hidden = !nextOpen;
        trigger.setAttribute('aria-expanded', String(nextOpen));
      });

      document.addEventListener('click', (event) => {
        if (!header.contains(event.target)) closeMenu();
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
      });
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const key = tab.dataset.cnConferenceTab;

        tabs.forEach((item) => {
          const active = item === tab;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-selected', String(active));
        });

        panels.forEach((panel) => {
          panel.classList.toggle('is-hidden', panel.dataset.cnConferencePanel !== key);
        });
      });
    });
  });
})();
