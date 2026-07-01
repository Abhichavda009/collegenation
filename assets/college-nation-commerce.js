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
    section.querySelectorAll('[data-cn-thumb]').forEach((thumb) => {
      thumb.addEventListener('click', () => {
        if (!mainImage) return;
        mainImage.src = thumb.dataset.cnImageSrc;
        mainImage.srcset = thumb.dataset.cnImageSrcset || '';
        section.querySelectorAll('[data-cn-thumb]').forEach((item) => item.classList.remove('is-active'));
        thumb.classList.add('is-active');
      });
    });

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
  });
})();
