require('dotenv').config();
const pool = require('../src/config/database');
const bootstrapDatabase = require('../src/services/bootstrapService');

async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en el archivo .env');
  }

  await bootstrapDatabase();
  console.log('Perfiles configurados en .env creados o actualizados correctamente.');
}

initializeDatabase()
  .catch((error) => {
    console.error(`No fue posible inicializar la base de datos: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
