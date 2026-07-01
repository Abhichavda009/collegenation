document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-cn-recover-toggle]');
  if (!trigger) return;

  const login = document.querySelector('[data-cn-login-form]');
  const recover = document.querySelector('[data-cn-recover-form]');
  if (!login || !recover) return;

  login.toggleAttribute('hidden');
  recover.toggleAttribute('hidden');
});

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-cn-address-delete]');
  if (!button) return;

  if (!window.confirm(button.dataset.confirmMessage || 'Delete this address?')) return;

  const form = document.createElement('form');
  form.method = 'post';
  form.action = button.dataset.target;
  form.innerHTML = '<input type="hidden" name="_method" value="delete">';
  document.body.appendChild(form);
  form.submit();
});
