(function () {
  document.querySelectorAll('[data-cn-hero]').forEach((hero) => {
    if (hero.dataset.cnInitialized === 'true') return;
    hero.dataset.cnInitialized = 'true';

    const track = hero.querySelector('[data-cn-hero-track]');
    const slides = hero.querySelectorAll('[data-cn-hero-slide]');
    const dots = hero.querySelectorAll('[data-cn-hero-dot]');
    const prev = hero.querySelector('[data-cn-hero-prev]');
    const next = hero.querySelector('[data-cn-hero-next]');
    let current = 0;
    let timer;

    const setSlide = (index) => {
      if (!track || !slides.length) return;
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((dot, dotIndex) => {
        const active = dotIndex === current;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-current', active ? 'true' : 'false');
      });
    };

    const start = () => {
      if (slides.length < 2) return;
      window.clearInterval(timer);
      timer = window.setInterval(() => setSlide(current + 1), 6000);
    };

    prev?.addEventListener('click', () => {
      setSlide(current - 1);
      start();
    });

    next?.addEventListener('click', () => {
      setSlide(current + 1);
      start();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        setSlide(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', () => window.clearInterval(timer));
    hero.addEventListener('mouseleave', start);
    setSlide(0);
    start();
  });

  document.querySelectorAll('[data-cn-carousel]').forEach((carousel) => {
    if (carousel.dataset.cnInitialized === 'true') return;
    carousel.dataset.cnInitialized = 'true';

    const track = carousel.querySelector('[data-cn-carousel-track]');
    const bar = carousel.querySelector('[data-cn-carousel-bar]');
    const prev = carousel.querySelector('[data-cn-carousel-prev]');
    const next = carousel.querySelector('[data-cn-carousel-next]');

    const update = () => {
      if (!track || !bar) return;
      const ratio = track.clientWidth / track.scrollWidth;
      const max = track.scrollWidth - track.clientWidth;
      const progress = max > 0 ? track.scrollLeft / max : 0;
      const width = Math.min(ratio * 100, 100);
      bar.style.width = `${width}%`;
      bar.style.left = `${progress * (100 - width)}%`;
    };

    const scroll = (direction) => {
      if (!track) return;
      track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' });
    };

    prev?.addEventListener('click', () => scroll(-1));
    next?.addEventListener('click', () => scroll(1));
    track?.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  document.querySelectorAll('[data-cn-sbc]').forEach((section) => {
    if (section.dataset.cnInitialized === 'true') return;
    section.dataset.cnInitialized = 'true';

    const tabs = section.querySelectorAll('[data-cn-sbc-tab]');
    const panels = section.querySelectorAll('[data-cn-sbc-panel]');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const key = tab.dataset.cnSbcTab;
        tabs.forEach((item) => item.classList.toggle('is-active', item === tab));
        panels.forEach((panel) => {
          panel.hidden = panel.dataset.cnSbcPanel !== key;
        });
      });
    });
  });
})();
