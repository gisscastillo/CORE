const state = {
  token: localStorage.getItem('core_token'),
  user: null,
  resources: [],
  search: '',
  status: '',
  selectedId: null,
  pendingDeleteId: null,
};

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
  const isAdmin = state.user.role === 'administrador';
  $('loginView').classList.add('hidden');
  $('appView').classList.remove('hidden');
  $('sidebarUser').textContent = state.user.username;
  $('sidebarRole').textContent = isAdmin ? 'Administrador' : 'Usuario';
  $('avatar').textContent = state.user.username[0].toUpperCase();
  $('roleEyebrow').textContent = isAdmin ? 'Panel de administración' : 'Mi espacio de consulta';
  $('pageTitle').textContent = isAdmin ? 'Centro de administración' : 'Explora tus recursos';
  $('pageSubtitle').textContent = isAdmin
    ? 'Controla altas, consultas, cambios y bajas desde una vista completa.'
    : 'Consulta la disponibilidad y abre cualquier tarjeta para conocer sus detalles.';
  $('inventoryTitle').textContent = isAdmin ? 'Vista general de recursos' : 'Recursos de la organización';
  $('sidebarTipTitle').textContent = isAdmin ? 'Control total' : 'Vista personal';
  $('sidebarTipText').textContent = isAdmin
    ? 'Administra el ciclo completo de cada recurso.'
    : 'Selecciona una tarjeta para consultar sus detalles.';
  document.querySelectorAll('.admin-only').forEach((element) => element.classList.toggle('hidden', !isAdmin));
  document.querySelectorAll('.user-only').forEach((element) => element.classList.toggle('hidden', isAdmin));
}

function safe(value) {
  const node = document.createElement('span');
  node.textContent = String(value ?? '');
  return node.innerHTML;
}

function statusSlug(status) {
  return status.toLowerCase().replace(/\s+/g, '-');
}

function resourceIcon(category = '') {
  const value = category.toLowerCase();
  if (/comput|laptop|tecn|electr/.test(value)) return '⌘';
  if (/muebl|silla|mesa|oficina/.test(value)) return '▰';
  if (/vehíc|vehic|transporte/.test(value)) return '◇';
  if (/herram|equipo/.test(value)) return '◆';
  return '▣';
}

function formatDate(value) {
  if (!value) return 'Sin registro';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin registro';
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function getVisibleResources() {
  const term = state.search.trim().toLowerCase();
  return state.resources.filter((item) => {
    const matchesStatus = !state.status || item.estado === state.status;
    const matchesTerm = !term || [item.nombre, item.categoria, item.estado, item.ubicacion]
      .some((value) => String(value).toLowerCase().includes(term));
    return matchesStatus && matchesTerm;
  });
}

function findResource(id) {
  return state.resources.find((item) => String(item.id) === String(id));
}

function afterDialogClose(dialog, callback) {
  if (!dialog.open) {
    callback();
    return;
  }
  dialog.addEventListener('close', () => window.setTimeout(callback, 0), { once: true });
  dialog.close();
}

function renderSummary() {
  const groups = [
    { label: 'Todos', count: state.resources.length, icon: '▦', status: '', tone: 'blue' },
    { label: 'Disponibles', count: state.resources.filter((item) => item.estado === 'Disponible').length, icon: '✓', status: 'Disponible', tone: 'green' },
    { label: 'Asignados', count: state.resources.filter((item) => item.estado === 'Asignado').length, icon: '→', status: 'Asignado', tone: 'purple' },
    { label: 'Requieren atención', count: state.resources.filter((item) => ['Mantenimiento', 'Baja'].includes(item.estado)).length, icon: '!', status: 'Mantenimiento', tone: 'orange' },
  ];
  const summary = $('summary');
  summary.replaceChildren();

  groups.forEach((item) => {
    const button = document.createElement('button');
    button.className = `stat stat-${item.tone}${state.status === item.status ? ' selected' : ''}`;
    button.type = 'button';
    button.dataset.status = item.status;

    const icon = document.createElement('span');
    icon.className = 'stat-icon';
    icon.textContent = item.icon;

    const copy = document.createElement('span');
    copy.className = 'stat-copy';
    const label = document.createElement('small');
    label.textContent = item.label;
    const count = document.createElement('strong');
    count.textContent = String(item.count);
    copy.append(label, count);

    const arrow = document.createElement('span');
    arrow.className = 'stat-arrow';
    arrow.textContent = '↗';

    button.append(icon, copy, arrow);
    summary.append(button);
  });
}

function renderResources() {
  const items = getVisibleResources();
  const isAdmin = state.user.role === 'administrador';
  $('resourceCount').textContent = `${items.length} de ${state.resources.length} recurso${state.resources.length === 1 ? '' : 's'}`;
  $('navResourceCount').textContent = state.resources.length;
  $('emptyState').classList.toggle('hidden', items.length > 0);

  $('resourceGrid').innerHTML = items.map((item) => `
    <article class="resource-card" data-status="${statusSlug(item.estado)}">
      <button class="resource-open" type="button" data-action="view" data-id="${item.id}" aria-label="Ver detalles de ${safe(item.nombre)}">
        <span class="resource-card-top"><span class="resource-icon">${resourceIcon(item.categoria)}</span><span class="badge badge-${statusSlug(item.estado)}">${safe(item.estado)}</span></span>
        <span class="resource-card-body"><small>${safe(item.categoria)}</small><strong>${safe(item.nombre)}</strong><span class="resource-location"><i>⌖</i>${safe(item.ubicacion)}</span></span>
        <span class="resource-card-footer"><span>#${item.id}</span><span>Ver detalles <b>→</b></span></span>
      </button>
      ${isAdmin ? `<div class="card-admin-actions"><button type="button" data-action="edit" data-id="${item.id}">✎ Editar</button><button type="button" class="danger-link" data-action="delete" data-id="${item.id}">⌫ Eliminar</button></div>` : ''}
    </article>`).join('');

  $('resourceRows').innerHTML = items.map((item) => `
    <tr>
      <td><button class="table-resource" type="button" data-action="view" data-id="${item.id}"><span>${resourceIcon(item.categoria)}</span><strong>${safe(item.nombre)}</strong><small>#${item.id}</small></button></td>
      <td>${safe(item.categoria)}</td>
      <td><span class="badge badge-${statusSlug(item.estado)}">${safe(item.estado)}</span></td>
      <td>${safe(item.ubicacion)}</td>
      <td><div class="row-actions"><button class="action-button view" type="button" data-action="view" data-id="${item.id}" title="Ver detalles">⌕</button><button class="action-button edit" type="button" data-action="edit" data-id="${item.id}" title="Editar">✎</button><button class="action-button delete" type="button" data-action="delete" data-id="${item.id}" title="Eliminar">⌫</button></div></td>
    </tr>`).join('');
}

function renderAll() {
  renderSummary();
  renderResources();
}

async function loadResources() {
  try {
    const data = await api('/resources');
    state.resources = data.resources;
    renderAll();
  } catch (error) {
    if (/token|autenticación/i.test(error.message)) {
      clearSession();
      showLogin();
    } else showMessage(error.message, true);
  }
}

function showMessage(text, isError = false) {
  const element = $('globalMessage');
  element.textContent = text;
  element.classList.toggle('message-error', isError);
  element.classList.remove('hidden');
  window.setTimeout(() => element.classList.add('hidden'), 4000);
}

function openResourceDialog(id) {
  const resource = findResource(id);
  $('dialogTitle').textContent = resource ? 'Editar recurso' : 'Registrar nuevo recurso';
  $('saveResourceButton').textContent = resource ? 'Guardar cambios' : 'Registrar recurso';
  $('resourceId').value = resource?.id || '';
  $('resourceName').value = resource?.nombre || '';
  $('resourceCategory').value = resource?.categoria || '';
  $('resourceStatus').value = resource?.estado || 'Disponible';
  $('resourceLocation').value = resource?.ubicacion || '';
  $('resourceError').textContent = '';
  $('resourceDialog').showModal();
}

function openDetailDialog(id) {
  const resource = findResource(id);
  if (!resource) return;
  state.selectedId = id;
  $('detailIcon').textContent = resourceIcon(resource.categoria);
  $('detailName').textContent = resource.nombre;
  $('detailCategory').textContent = resource.categoria;
  $('detailId').textContent = `#${resource.id}`;
  $('detailLocation').textContent = resource.ubicacion;
  $('detailCreated').textContent = formatDate(resource.created_at);
  $('detailUpdated').textContent = formatDate(resource.updated_at);
  $('detailStatus').textContent = resource.estado;
  $('detailStatus').className = `badge badge-${statusSlug(resource.estado)}`;
  $('detailHero').dataset.status = statusSlug(resource.estado);
  $('detailNote').textContent = resource.estado === 'Disponible'
    ? 'Este recurso se encuentra disponible para su uso o asignación.'
    : resource.estado === 'Asignado'
      ? 'Este recurso se encuentra asignado actualmente.'
      : 'Este recurso requiere seguimiento por parte del administrador.';
  $('detailDialog').showModal();
}

function requestDelete(id) {
  const resource = findResource(id);
  if (!resource) return;
  state.pendingDeleteId = id;
  $('deleteResourceName').textContent = resource.nombre;
  if ($('detailDialog').open) $('detailDialog').close();
  $('confirmDialog').classList.remove('hidden');
  $('confirmDeleteButton').focus();
}

async function deleteResource() {
  const id = state.pendingDeleteId;
  if (!id) return;
  $('confirmDeleteButton').disabled = true;
  $('confirmDeleteButton').textContent = 'Eliminando…';
  try {
    await api(`/resources/${id}`, { method: 'DELETE' });
    $('confirmDialog').classList.add('hidden');
    if ($('detailDialog').open) $('detailDialog').close();
    state.pendingDeleteId = null;
    await loadResources();
    showMessage('Recurso eliminado correctamente.');
  } catch (error) {
    $('confirmDialog').classList.add('hidden');
    showMessage(error.message, true);
  } finally {
    $('confirmDeleteButton').disabled = false;
    $('confirmDeleteButton').textContent = 'Sí, eliminar';
  }
}

function handleResourceAction(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const id = Number(button.dataset.id);
  if (button.dataset.action === 'view') openDetailDialog(id);
  if (button.dataset.action === 'edit') openResourceDialog(id);
  if (button.dataset.action === 'delete') requestDelete(id);
}

$('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  $('loginError').textContent = '';
  const submit = event.currentTarget.querySelector('[type="submit"]');
  submit.disabled = true;
  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: $('username').value, password: $('password').value }),
    });
    setSession(data.token, data.user);
    showApp();
    await loadResources();
  } catch (error) {
    $('loginError').textContent = error.message;
  } finally {
    submit.disabled = false;
  }
});

$('resourceForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = $('resourceId').value;
  const payload = {
    nombre: $('resourceName').value,
    categoria: $('resourceCategory').value,
    estado: $('resourceStatus').value,
    ubicacion: $('resourceLocation').value,
  };
  $('saveResourceButton').disabled = true;
  try {
    await api(id ? `/resources/${id}` : '/resources', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    });
    $('resourceDialog').close();
    if ($('detailDialog').open) $('detailDialog').close();
    await loadResources();
    showMessage(id ? 'Cambios guardados correctamente.' : 'Nuevo recurso registrado.');
  } catch (error) {
    $('resourceError').textContent = error.message;
  } finally {
    $('saveResourceButton').disabled = false;
  }
});

$('searchInput').addEventListener('input', (event) => {
  state.search = event.target.value;
  renderResources();
});

$('statusFilter').addEventListener('change', (event) => {
  state.status = event.target.value;
  renderAll();
});

$('summary').addEventListener('click', (event) => {
  const card = event.target.closest('[data-status]');
  if (!card) return;
  state.status = card.dataset.status;
  $('statusFilter').value = state.status;
  renderAll();
  $('inventorySection').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

$('resourceGrid').addEventListener('click', handleResourceAction);
$('resourceRows').addEventListener('click', handleResourceAction);
$('newResourceButton').addEventListener('click', () => openResourceDialog());
$('clearFiltersButton').addEventListener('click', () => {
  state.search = '';
  state.status = '';
  $('searchInput').value = '';
  $('statusFilter').value = '';
  renderAll();
});

$('togglePassword').addEventListener('click', () => {
  const input = $('password');
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  $('togglePassword').textContent = show ? 'Ocultar' : 'Ver';
  $('togglePassword').setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
});

$('detailEditButton').addEventListener('click', () => {
  afterDialogClose($('detailDialog'), () => openResourceDialog(state.selectedId));
});
$('detailDeleteButton').addEventListener('click', () => requestDelete(state.selectedId));
$('confirmDeleteButton').addEventListener('click', deleteResource);
$('cancelDeleteButton').addEventListener('click', () => $('confirmDialog').classList.add('hidden'));
$('closeDetailDialog').addEventListener('click', () => $('detailDialog').close());
$('detailCloseButton').addEventListener('click', () => $('detailDialog').close());
$('closeDialog').addEventListener('click', () => $('resourceDialog').close());
$('cancelDialog').addEventListener('click', () => $('resourceDialog').close());
$('logoutButton').addEventListener('click', () => { clearSession(); showLogin(); });
document.querySelector('[data-focus="inventory"]').addEventListener('click', () => $('inventorySection').scrollIntoView({ behavior: 'smooth' }));

if (state.token) {
  try { state.user = JSON.parse(localStorage.getItem('core_user')); } catch (_error) { clearSession(); }
}
if (state.token && state.user) { showApp(); loadResources(); } else { showLogin(); }
