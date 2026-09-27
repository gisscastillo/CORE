const app = require('./app');
const pool = require('./config/database');
const bootstrapDatabase = require('./services/bootstrapService');

const port = Number(process.env.PORT || 3000);

async function start() {
  try {
    await pool.query('SELECT 1');
    await bootstrapDatabase();
    app.listen(port, () => console.log(`CORE disponible en http://localhost:${port}`));
  } catch (error) {
    console.error('No fue posible conectar con PostgreSQL:', error.message);
    process.exit(1);
  }
}

start();
