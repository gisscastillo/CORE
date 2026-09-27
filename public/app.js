const state = { token: localStorage.getItem('core_token'), user: null, resources: [] };
const $ = (id) => document.getElementById(id);

async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'No fue posible completar la solicitud');
  return data;
}

function setSession(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem('core_token', token);
  localStorage.setItem('core_user', JSON.stringify(user));
}

function clearSession() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('core_token');
  localStorage.removeItem('core_user');
}

function showLogin() {
  $('appView').classList.add('hidden');
  $('loginView').classList.remove('hidden');
}

function showApp() {
  $('loginView').classList.add('hidden');
  $('appView').classList.remove('hidden');
  $('sidebarUser').textContent = state.user.username;
  $('sidebarRole').textContent = state.user.role;
  $('avatar').textContent = state.user.username[0].toUpperCase();
  document.querySelectorAll('.admin-only').forEach((element) => {
    element.classList.toggle('hidden', state.user.role !== 'administrador');
  });
}

function safe(value) {
  const node = document.createElement('span');
  node.textContent = String(value);
  return node.innerHTML;
}

function renderSummary() {
  const groups = [
    ['Total', state.resources.length, '▦'],
    ['Disponibles', state.resources.filter((item) => item.estado === 'Disponible').length, '✓'],
    ['Asignados', state.resources.filter((item) => item.estado === 'Asignado').length, '→'],
    ['Atención', state.resources.filter((item) => ['Mantenimiento', 'Baja'].includes(item.estado)).length, '!'],
  ];
  $('summary').innerHTML = groups.map(([label, count, icon]) => `<article class="stat"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><strong>${count}</strong></article>`).join('');
}

function renderResources(items = state.resources) {
  const isAdmin = state.user.role === 'administrador';
  $('resourceCount').textContent = `${state.resources.length} recurso${state.resources.length === 1 ? '' : 's'} registrado${state.resources.length === 1 ? '' : 's'}`;
  $('emptyState').classList.toggle('hidden', items.length > 0);
  $('resourceRows').innerHTML = items.map((item) => `
    <tr><td>#${item.id}</td><td><strong>${safe(item.nombre)}</strong></td><td>${safe(item.categoria)}</td>
    <td><span class="badge badge-${item.estado.toLowerCase()}">${safe(item.estado)}</span></td><td>${safe(item.ubicacion)}</td>
    ${isAdmin ? `<td><button class="edit-button" data-id="${item.id}">Editar</button></td>` : ''}</tr>`).join('');
  document.querySelectorAll('.edit-button').forEach((button) => button.addEventListener('click', () => openResourceDialog(Number(button.dataset.id))));
}

async function loadResources() {
  try {
    const data = await api('/resources');
    state.resources = data.resources;
    renderSummary();
    renderResources();
  } catch (error) {
    if (/token|autenticación/i.test(error.message)) { clearSession(); showLogin(); }
    else showMessage(error.message, true);
  }
}

function showMessage(text, isError = false) {
  const element = $('globalMessage');
  element.textContent = text;
  element.style.background = isError ? '#fae9ec' : '';
  element.style.color = isError ? '#c73f4d' : '';
  element.classList.remove('hidden');
  setTimeout(() => element.classList.add('hidden'), 4000);
}

function openResourceDialog(id) {
  const resource = state.resources.find((item) => item.id === id);
  $('dialogTitle').textContent = resource ? 'Editar recurso' : 'Registrar recurso';
  $('resourceId').value = resource?.id || '';
  $('resourceName').value = resource?.nombre || '';
  $('resourceCategory').value = resource?.categoria || '';
  $('resourceStatus').value = resource?.estado || 'Disponible';
  $('resourceLocation').value = resource?.ubicacion || '';
  $('resourceError').textContent = '';
  $('resourceDialog').showModal();
}

$('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  $('loginError').textContent = '';
  try {
    const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ username: $('username').value, password: $('password').value }) });
    setSession(data.token, data.user); showApp(); await loadResources();
  } catch (error) { $('loginError').textContent = error.message; }
});

$('resourceForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = $('resourceId').value;
  const payload = { nombre: $('resourceName').value, categoria: $('resourceCategory').value, estado: $('resourceStatus').value, ubicacion: $('resourceLocation').value };
  try {
    await api(id ? `/resources/${id}` : '/resources', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
    $('resourceDialog').close(); await loadResources(); showMessage(id ? 'Recurso actualizado correctamente.' : 'Recurso registrado correctamente.');
  } catch (error) { $('resourceError').textContent = error.message; }
});

$('searchInput').addEventListener('input', (event) => {
  const term = event.target.value.toLowerCase();
  renderResources(state.resources.filter((item) => [item.nombre, item.categoria, item.estado, item.ubicacion].some((value) => value.toLowerCase().includes(term))));
});
$('newResourceButton').addEventListener('click', () => openResourceDialog());
$('togglePassword').addEventListener('click', () => {
  const input = $('password');
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  $('togglePassword').textContent = show ? 'Ocultar' : 'Ver';
  $('togglePassword').setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
  $('togglePassword').title = show ? 'Ocultar contraseña' : 'Mostrar contraseña';
});
$('closeDialog').addEventListener('click', () => $('resourceDialog').close());
$('cancelDialog').addEventListener('click', () => $('resourceDialog').close());
$('logoutButton').addEventListener('click', () => { clearSession(); showLogin(); });

if (state.token) {
  try { state.user = JSON.parse(localStorage.getItem('core_user')); } catch (_error) { clearSession(); }
}
if (state.token && state.user) { showApp(); loadResources(); } else { showLogin(); }
