require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/database');

async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en el archivo .env');
  }

  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(schema);
  console.log('Base de datos CORE inicializada correctamente.');
  console.log('Tablas disponibles: users y resources.');
}

initializeDatabase()
  .catch((error) => {
    console.error(`No fue posible inicializar la base de datos: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
