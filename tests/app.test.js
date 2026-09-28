process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-with-more-than-thirty-two-characters';
process.env.JWT_EXPIRES_IN = '1h';
process.env.BCRYPT_ROUNDS = '4';

jest.mock('../src/config/database', () => ({ query: jest.fn() }));

const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const pool = require('../src/config/database');
const bootstrapDatabase = require('../src/services/bootstrapService');
const { errorHandler } = require('../src/middleware/errorHandler');

const adminToken = jwt.sign({ id: 1, role: 'administrador' }, process.env.JWT_SECRET);
const userToken = jwt.sign({ id: 2, role: 'usuario' }, process.env.JWT_SECRET);
const resource = {
  id: 1,
  nombre: 'Laptop Dell',
  categoria: 'Computadoras',
  estado: 'Disponible',
  ubicacion: 'Oficina central',
};

beforeEach(() => jest.clearAllMocks());

describe('rutas generales', () => {
  test('expone el estado del servicio', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', service: 'CORE', version: 'local' });
  });

  test('responde 404 sin exponer detalles', async () => {
    const response = await request(app).get('/api/inexistente');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Ruta no encontrada');
  });
});

describe('registro seguro de errores', () => {
  test('elimina saltos de línea antes de escribir datos en el log', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    errorHandler(
      new Error('mensaje\r\ninyectado'),
      { method: 'GET\r\n', originalUrl: '/ruta\r\nfalsa' },
      response,
      jest.fn(),
    );

    const logged = consoleSpy.mock.calls[0][0];
    expect(logged).not.toMatch(/[\r\n]/);
    expect(JSON.parse(logged)).toEqual({
      method: 'GET',
      path: '/rutafalsa',
      message: 'mensaje  inyectado',
    });
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Error interno del servidor' });

    consoleSpy.mockRestore();
    process.env.NODE_ENV = originalNodeEnv;
  });
});

describe('autenticación', () => {
  test('login correcto genera un JWT con id y rol', async () => {
    const passwordHash = await bcrypt.hash('ClaveSegura1', 4);
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, username: 'admin@core.local', password_hash: passwordHash, role: 'administrador' }] });

    const response = await request(app).post('/api/auth/login').send({ username: 'admin@core.local', password: 'ClaveSegura1' });

    expect(response.status).toBe(200);
    expect(response.body.user).toEqual({ id: 1, username: 'admin@core.local', role: 'administrador' });
    const payload = jwt.verify(response.body.token, process.env.JWT_SECRET);
    expect(payload).toMatchObject({ id: 1, role: 'administrador' });
    expect(payload.password).toBeUndefined();
  });

  test('rechaza credenciales incorrectas', async () => {
    const passwordHash = await bcrypt.hash('ClaveCorrecta1', 4);
    pool.query.mockResolvedValueOnce({ rows: [{ id: 2, username: 'user@core.local', password_hash: passwordHash, role: 'usuario' }] });
    const response = await request(app).post('/api/auth/login').send({ username: 'user@core.local', password: 'ClaveIncorrecta1' });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Credenciales incorrectas');
  });

  test('rechaza usuario inexistente', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const response = await request(app).post('/api/auth/login').send({ username: 'nobody@core.local', password: 'ClaveSegura1' });
    expect(response.status).toBe(401);
  });

  test('valida el formato de login', async () => {
    const response = await request(app).post('/api/auth/login').send({ username: 'no-es-email', password: 'corta' });
    expect(response.status).toBe(422);
    expect(response.body.errors).toHaveLength(2);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('registra un usuario con hash y rol usuario', async () => {
    pool.query
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 3, username: 'nuevo@core.local', role: 'usuario' }] });
    const response = await request(app).post('/api/auth/register').send({ username: 'NUEVO@core.local', password: 'ClaveSegura1' });
    expect(response.status).toBe(201);
    expect(response.body.user.role).toBe('usuario');
    const insertParameters = pool.query.mock.calls[1][1];
    expect(insertParameters[1]).not.toBe('ClaveSegura1');
    expect(await bcrypt.compare('ClaveSegura1', insertParameters[1])).toBe(true);
  });

  test('no registra un usuario duplicado', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 3 }] });
    const response = await request(app).post('/api/auth/register').send({ username: 'existente@core.local', password: 'ClaveSegura1' });
    expect(response.status).toBe(409);
    expect(pool.query).toHaveBeenCalledTimes(1);
  });
});

describe('protección JWT', () => {
  test('rechaza cuando falta el JWT', async () => {
    const response = await request(app).get('/api/resources');
    expect(response.status).toBe(401);
  });

  test('rechaza JWT inválido', async () => {
    const response = await request(app).get('/api/resources').set('Authorization', 'Bearer token-invalido');
    expect(response.status).toBe(401);
  });

  test('rechaza JWT sin claims requeridos', async () => {
    const token = jwt.sign({ id: 9, role: 'otro' }, process.env.JWT_SECRET);
    const response = await request(app).get('/api/resources').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(401);
  });

  test('permite acceso con JWT válido', async () => {
    pool.query.mockResolvedValueOnce({ rows: [resource] });
    const response = await request(app).get('/api/resources').set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(200);
  });
});

describe('gestión de recursos y roles', () => {
  test('consulta todos los recursos', async () => {
    pool.query.mockResolvedValueOnce({ rows: [resource] });
    const response = await request(app).get('/api/resources').set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(200);
    expect(response.body.resources).toEqual([resource]);
  });

  test('consulta un recurso individual', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [resource] });
    const response = await request(app).get('/api/resources/1').set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(200);
    expect(response.body.resource.nombre).toBe('Laptop Dell');
    expect(pool.query.mock.calls[0][1]).toEqual([1]);
  });

  test('responde 404 si el recurso no existe', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const response = await request(app).get('/api/resources/999').set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(404);
  });

  test('valida el ID individual', async () => {
    const response = await request(app).get('/api/resources/no').set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(422);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('administrador puede registrar recurso', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [resource] });
    const response = await request(app).post('/api/resources').set('Authorization', `Bearer ${adminToken}`).send(resource);
    expect(response.status).toBe(201);
    expect(response.body.resource).toEqual(resource);
    expect(pool.query.mock.calls[0][1]).toEqual(['Laptop Dell', 'Computadoras', 'Disponible', 'Oficina central']);
  });

  test('usuario normal no puede registrar recurso', async () => {
    const response = await request(app).post('/api/resources').set('Authorization', `Bearer ${userToken}`).send(resource);
    expect(response.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('administrador puede actualizar recurso', async () => {
    const updated = { ...resource, estado: 'Asignado' };
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [updated] });
    const response = await request(app).put('/api/resources/1').set('Authorization', `Bearer ${adminToken}`).send(updated);
    expect(response.status).toBe(200);
    expect(response.body.resource.estado).toBe('Asignado');
    expect(pool.query.mock.calls[0][1]).toEqual(['Laptop Dell', 'Computadoras', 'Asignado', 'Oficina central', 1]);
  });

  test('usuario normal no puede actualizar recurso', async () => {
    const response = await request(app).put('/api/resources/1').set('Authorization', `Bearer ${userToken}`).send(resource);
    expect(response.status).toBe(403);
  });

  test('administrador puede eliminar un recurso', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [resource] });
    const response = await request(app).delete('/api/resources/1').set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Recurso eliminado correctamente');
    expect(pool.query.mock.calls[0][1]).toEqual([1]);
  });

  test('usuario normal no puede eliminar un recurso', async () => {
    const response = await request(app).delete('/api/resources/1').set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('eliminación responde 404 si el recurso no existe', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const response = await request(app).delete('/api/resources/55').set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(404);
  });

  test('actualización responde 404 si no existe', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const response = await request(app).put('/api/resources/55').set('Authorization', `Bearer ${adminToken}`).send(resource);
    expect(response.status).toBe(404);
  });

  test('rechaza datos incorrectos y estado fuera del catálogo', async () => {
    const response = await request(app).post('/api/resources').set('Authorization', `Bearer ${adminToken}`).send({ nombre: 'x', categoria: '', estado: 'Perdido', ubicacion: 'x' });
    expect(response.status).toBe(422);
    expect(response.body.errors).toHaveLength(4);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('sanitiza texto antes de enviarlo a PostgreSQL', async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [resource] });
    await request(app).post('/api/resources').set('Authorization', `Bearer ${adminToken}`).send({ ...resource, nombre: '<script>alert(1)</script>' });
    expect(pool.query.mock.calls[0][1][0]).toBe('&lt;script&gt;alert(1)&lt;&#x2F;script&gt;');
  });

  test('centraliza errores inesperados sin exponer el stack', async () => {
    pool.query.mockRejectedValueOnce(new Error('password secreto de DB'));
    const response = await request(app).get('/api/resources').set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Error interno del servidor' });
  });
});

describe('inicio automático de la base de datos', () => {
  const originalUsername = process.env.ADMIN_USERNAME;
  const originalPassword = process.env.ADMIN_PASSWORD;
  const originalUserUsername = process.env.USER_USERNAME;
  const originalUserPassword = process.env.USER_PASSWORD;

  afterEach(() => {
    if (originalUsername === undefined) delete process.env.ADMIN_USERNAME;
    else process.env.ADMIN_USERNAME = originalUsername;
    if (originalPassword === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = originalPassword;
    if (originalUserUsername === undefined) delete process.env.USER_USERNAME;
    else process.env.USER_USERNAME = originalUserUsername;
    if (originalUserPassword === undefined) delete process.env.USER_PASSWORD;
    else process.env.USER_PASSWORD = originalUserPassword;
  });

  test('crea las tablas aunque no se configure administrador', async () => {
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
    delete process.env.USER_USERNAME;
    delete process.env.USER_PASSWORD;
    pool.query.mockResolvedValue({});

    await bootstrapDatabase();

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query.mock.calls[0][0]).toContain('CREATE TABLE IF NOT EXISTS users');
  });

  test('crea o actualiza el administrador configurado', async () => {
    process.env.ADMIN_USERNAME = 'ADMIN@core.local';
    process.env.ADMIN_PASSWORD = 'ClaveSegura1';
    delete process.env.USER_USERNAME;
    delete process.env.USER_PASSWORD;
    pool.query.mockResolvedValue({});

    await bootstrapDatabase();

    expect(pool.query).toHaveBeenCalledTimes(2);
    const parameters = pool.query.mock.calls[1][1];
    expect(parameters[0]).toBe('admin@core.local');
    expect(await bcrypt.compare('ClaveSegura1', parameters[1])).toBe(true);
    expect(parameters[2]).toBe('administrador');
  });

  test('crea o actualiza el usuario configurado', async () => {
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
    process.env.USER_USERNAME = 'USUARIO@core.local';
    process.env.USER_PASSWORD = 'UsuarioCore2026!';
    pool.query.mockResolvedValue({});

    await bootstrapDatabase();

    expect(pool.query).toHaveBeenCalledTimes(2);
    const parameters = pool.query.mock.calls[1][1];
    expect(parameters[0]).toBe('usuario@core.local');
    expect(await bcrypt.compare('UsuarioCore2026!', parameters[1])).toBe(true);
    expect(parameters[2]).toBe('usuario');
  });

  test('rechaza configuración incompleta del administrador', async () => {
    process.env.ADMIN_USERNAME = 'admin@core.local';
    delete process.env.ADMIN_PASSWORD;
    delete process.env.USER_USERNAME;
    delete process.env.USER_PASSWORD;
    pool.query.mockResolvedValue({});

    await expect(bootstrapDatabase()).rejects.toThrow('deben configurarse juntos');
  });
});
