const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function bootstrapDatabase() {
  const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(schema);
  console.log('Base de datos CORE inicializada.');

  const profiles = [
    {
      label: 'Administrador',
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
      role: 'administrador',
      prefix: 'ADMIN',
    },
    {
      label: 'Usuario',
      username: process.env.USER_USERNAME,
      password: process.env.USER_PASSWORD,
      role: 'usuario',
      prefix: 'USER',
    },
  ];

  for (const profile of profiles) {
    const { label, username, password, role, prefix } = profile;
    if (!username && !password) {
      console.log(`${label} automático omitido: variables ${prefix} no configuradas.`);
      continue;
    }

    if (!username || !password || password.length < 8) {
      throw new Error(`${prefix}_USERNAME y ${prefix}_PASSWORD (mínimo 8 caracteres) deben configurarse juntos`);
    }

    const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS || 12));
    await pool.query(
      `INSERT INTO users (username, password_hash, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (username)
       DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role`,
      [username.toLowerCase(), passwordHash, role],
    );
    console.log(`${label} CORE preparado: ${username.toLowerCase()}`);
  }
}

module.exports = bootstrapDatabase;
