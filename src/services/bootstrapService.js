const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function bootstrapDatabase() {
  const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(schema);
  console.log('Base de datos CORE inicializada.');

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username && !password) {
    console.log('Administrador automático omitido: variables ADMIN no configuradas.');
    return;
  }

  if (!username || !password || password.length < 8) {
    throw new Error('ADMIN_USERNAME y ADMIN_PASSWORD (mínimo 8 caracteres) deben configurarse juntos');
  }

  const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS || 12));
  await pool.query(
    `INSERT INTO users (username, password_hash, role)
     VALUES ($1, $2, 'administrador')
     ON CONFLICT (username)
     DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'administrador'`,
    [username.toLowerCase(), passwordHash],
  );
  console.log(`Administrador CORE preparado: ${username.toLowerCase()}`);
}

module.exports = bootstrapDatabase;
