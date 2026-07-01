const refreshCollegeNationCart = async (sectionId) => {
  const response = await fetch(`${window.location.pathname}?sections=${sectionId}`, {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });
  const sections = await response.json();
  const html = sections[sectionId];
  const wrapper = document.getElementById(`shopify-section-${sectionId}`);

  if (!html || !wrapper) {
    window.location.reload();
    return;
  }

  wrapper.innerHTML = html;
};

const changeCartLine = async (section, line, quantity) => {
  section.classList.add('is-loading');
  const sectionId = section.dataset.sectionId;

  try {
    await fetch('/cart/change.js', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        line,
        quantity,
        sections: sectionId,
        sections_url: window.location.pathname,
      }),
    });

    await refreshCollegeNationCart(sectionId);
  } catch (error) {
    console.error('Cart update failed', error);
    window.location.reload();
  }
};

document.addEventListener('click', (event) => {
  const section = event.target.closest('[data-cn-cart-section]');
  if (!section) return;

  const line = event.target.closest('[data-cn-cart-line]');
  if (!line) return;

  if (event.target.matches('[data-cn-cart-remove]')) {
    changeCartLine(section, Number(line.dataset.cnCartLine), 0);
    return;
  }

  const quantityButton = event.target.closest('[data-cn-cart-qty]');
  if (!quantityButton) return;

  const input = line.querySelector('[data-cn-cart-qty-input]');
  const nextQuantity = Math.max(0, Number(input.value || 0) + Number(quantityButton.dataset.cnCartQty));
  input.value = String(nextQuantity);
  changeCartLine(section, Number(line.dataset.cnCartLine), nextQuantity);
});

document.addEventListener('change', (event) => {
  if (!event.target.matches('[data-cn-cart-qty-input]')) return;

  const section = event.target.closest('[data-cn-cart-section]');
  const line = event.target.closest('[data-cn-cart-line]');
  if (!section || !line) return;

  changeCartLine(section, Number(line.dataset.cnCartLine), Math.max(0, Number(event.target.value || 0)));
});
