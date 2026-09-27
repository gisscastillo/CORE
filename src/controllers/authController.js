const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const AppError = require('../utils/AppError');

async function register(req, res) {
  const { username, password } = req.validated;
  const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);

  if (existing.rowCount > 0) {
    throw new AppError('El usuario ya existe', 409);
  }

  const rounds = Number(process.env.BCRYPT_ROUNDS || 12);
  const passwordHash = await bcrypt.hash(password, rounds);
  const result = await pool.query(
    `INSERT INTO users (username, password_hash, role)
     VALUES ($1, $2, 'usuario')
     RETURNING id, username, role`,
    [username, passwordHash],
  );

  res.status(201).json({ user: result.rows[0] });
}

async function login(req, res) {
  const { username, password } = req.validated;
  const result = await pool.query(
    'SELECT id, username, password_hash, role FROM users WHERE username = $1',
    [username],
  );
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new AppError('Credenciales incorrectas', 401);
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '2h' },
  );

  res.json({
    token,
    user: { id: user.id, username: user.username, role: user.role },
  });
}

module.exports = { register, login };
