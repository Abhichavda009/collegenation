(function () {
  document.querySelectorAll('[data-cn-view-grid]').forEach((button) => {
    if (button.dataset.cnInitialized === 'true') return;
    button.dataset.cnInitialized = 'true';
    const wrapper = button.closest('[data-cn-collection]');
    const grid = wrapper?.querySelector('[data-cn-product-grid]');
    const listButton = wrapper?.querySelector('[data-cn-view-list]');

    button.addEventListener('click', () => {
      grid?.classList.remove('is-list');
      button.classList.add('is-active');
      listButton?.classList.remove('is-active');
    });
  });

  document.querySelectorAll('[data-cn-view-list]').forEach((button) => {
    if (button.dataset.cnInitialized === 'true') return;
    button.dataset.cnInitialized = 'true';
    const wrapper = button.closest('[data-cn-collection]');
    const grid = wrapper?.querySelector('[data-cn-product-grid]');
    const gridButton = wrapper?.querySelector('[data-cn-view-grid]');

    button.addEventListener('click', () => {
      grid?.classList.add('is-list');
      button.classList.add('is-active');
      gridButton?.classList.remove('is-active');
    });
  });

  document.querySelectorAll('[data-cn-product]').forEach((section) => {
    if (section.dataset.cnInitialized === 'true') return;
    section.dataset.cnInitialized = 'true';

    const mainImage = section.querySelector('[data-cn-main-image]');
    const thumbs = Array.from(section.querySelectorAll('[data-cn-thumb]'));
    let galleryIndex = Math.max(0, thumbs.findIndex((t) => t.classList.contains('is-active')));

    const activateThumb = (thumb, index) => {
      if (!mainImage || !thumb) return;
      mainImage.src = thumb.dataset.cnImageSrc;
      mainImage.srcset = thumb.dataset.cnImageSrcset || '';
      thumbs.forEach((item) => item.classList.remove('is-active'));
      thumb.classList.add('is-active');
      if (typeof index === 'number') galleryIndex = index;
    };

    thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => activateThumb(thumb, index));
    });

    if (section.dataset.cnGalleryAutoplay === 'true' && thumbs.length > 1) {
      const galleryInterval = Number(section.dataset.cnGalleryInterval || 4) * 1000;
      let galleryTimer;
      const startGallery = () => {
        window.clearInterval(galleryTimer);
        galleryTimer = window.setInterval(() => {
          const next = (galleryIndex + 1) % thumbs.length;
          activateThumb(thumbs[next], next);
        }, galleryInterval);
      };
      const stopGallery = () => window.clearInterval(galleryTimer);
      const gallery = mainImage ? mainImage.closest('.cn-product-gallery') : section;
      if (gallery) {
        gallery.addEventListener('mouseenter', stopGallery);
        gallery.addEventListener('mouseleave', startGallery);
      }
      startGallery();
    }

    const variantSelect = section.querySelector('[data-cn-variant-select]');
    const addButton = section.querySelector('[data-cn-add-button]');
    const price = section.querySelector('[data-cn-product-price]');
    const variants = JSON.parse(section.querySelector('[data-cn-variants-json]')?.textContent || '[]');
    const optionButtons = section.querySelectorAll('[data-cn-option-value]');
    const selected = {};

    optionButtons.forEach((button) => {
      if (button.classList.contains('is-active')) {
        selected[button.dataset.cnOptionPosition] = button.dataset.cnOptionValue;
      }

      button.addEventListener('click', () => {
        const position = button.dataset.cnOptionPosition;
        selected[position] = button.dataset.cnOptionValue;
        section.querySelectorAll(`[data-cn-option-position="${position}"]`).forEach((item) => item.classList.remove('is-active'));
        button.classList.add('is-active');

        const optionLabel = section.querySelector(`[data-cn-option-selected="${position}"]`);
        if (optionLabel) optionLabel.textContent = button.dataset.cnOptionValue;

        const match = variants.find((variant) =>
          variant.options.every((value, index) => selected[String(index + 1)] === value)
        );

        if (!match) return;
        if (variantSelect) variantSelect.value = match.id;
        if (addButton) {
          addButton.disabled = !match.available;
          addButton.textContent = match.available ? addButton.dataset.availableText : addButton.dataset.soldOutText;
        }
        if (price) {
          price.textContent = match.priceFormatted;
        }
      });
    });

    section.querySelectorAll('[data-cn-qty-minus], [data-cn-qty-plus]').forEach((button) => {
      button.addEventListener('click', () => {
        const input = section.querySelector('[data-cn-quantity]');
        if (!input) return;
        const delta = button.hasAttribute('data-cn-qty-plus') ? 1 : -1;
        input.value = Math.max(1, Number(input.value || 1) + delta);
      });
    });

    const sizechart = section.querySelector('[data-cn-sizechart]');
    if (sizechart) {
      const closeSizechart = () => {
        sizechart.hidden = true;
      };
      section.querySelectorAll('[data-cn-sizechart-open]').forEach((btn) =>
        btn.addEventListener('click', () => {
          sizechart.hidden = false;
        })
      );
      sizechart.querySelectorAll('[data-cn-sizechart-close]').forEach((btn) =>
        btn.addEventListener('click', closeSizechart)
      );
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeSizechart();
      });
    }
  });
})();
