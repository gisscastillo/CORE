require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/config/database');

async function createAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password || password.length < 8) {
    throw new Error('Define ADMIN_USERNAME y ADMIN_PASSWORD (mínimo 8 caracteres) en tu .env');
  }

  const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS || 12));
  await pool.query(
    `INSERT INTO users (username, password_hash, role)
     VALUES ($1, $2, 'administrador')
     ON CONFLICT (username)
     DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'administrador'`,
    [username.toLowerCase(), hash],
  );
  console.log(`Administrador creado/actualizado: ${username.toLowerCase()}`);
}

createAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
