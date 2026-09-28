function notFound(req, res) {
  res.status(404).json({ message: 'Ruta no encontrada' });
}

function errorHandler(error, req, res, _next) {
  if (process.env.NODE_ENV !== 'test') {
    const logEntry = {
      method: String(req.method).replace(/[\r\n]/g, ''),
      path: String(req.originalUrl).replace(/[\r\n]/g, ''),
      message: String(error.message).replace(/[\r\n]/g, ' '),
    };
    console.error(JSON.stringify(logEntry));
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Error interno del servidor';
  res.status(statusCode).json({ message });
}

module.exports = { notFound, errorHandler };
