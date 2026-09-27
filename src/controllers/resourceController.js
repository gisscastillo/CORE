const pool = require('../config/database');
const AppError = require('../utils/AppError');

const columns = 'id, nombre, categoria, estado, ubicacion, created_at, updated_at';

async function listResources(_req, res) {
  const result = await pool.query(`SELECT ${columns} FROM resources ORDER BY id ASC`);
  res.json({ resources: result.rows });
}

async function getResource(req, res) {
  const result = await pool.query(
    `SELECT ${columns} FROM resources WHERE id = $1`,
    [req.validated.id],
  );

  if (result.rowCount === 0) {
    throw new AppError('Recurso no encontrado', 404);
  }

  res.json({ resource: result.rows[0] });
}

async function createResource(req, res) {
  const { nombre, categoria, estado, ubicacion } = req.validated;
  const result = await pool.query(
    `INSERT INTO resources (nombre, categoria, estado, ubicacion)
     VALUES ($1, $2, $3, $4)
     RETURNING ${columns}`,
    [nombre, categoria, estado, ubicacion],
  );
  res.status(201).json({ resource: result.rows[0] });
}

async function updateResource(req, res) {
  const { id, nombre, categoria, estado, ubicacion } = req.validated;
  const result = await pool.query(
    `UPDATE resources
     SET nombre = $1, categoria = $2, estado = $3, ubicacion = $4, updated_at = NOW()
     WHERE id = $5
     RETURNING ${columns}`,
    [nombre, categoria, estado, ubicacion, id],
  );

  if (result.rowCount === 0) {
    throw new AppError('Recurso no encontrado', 404);
  }

  res.json({ resource: result.rows[0] });
}

module.exports = { listResources, getResource, createResource, updateResource };
