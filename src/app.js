require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (_req, res) => res.json({
  status: 'ok',
  service: 'CORE',
  version: process.env.RENDER_GIT_COMMIT || 'local',
}));
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
