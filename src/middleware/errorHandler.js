function notFound(req, res) {
  res.status(404).json({ message: 'Ruta no encontrada' });
}

function errorHandler(error, req, res, _next) {
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[${req.method} ${req.originalUrl}]`, error.message);
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Error interno del servidor';
  res.status(statusCode).json({ message });
}

module.exports = { notFound, errorHandler };
