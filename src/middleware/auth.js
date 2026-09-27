const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authorization = req.get('authorization');

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Autenticación requerida' });
  }

  try {
    const token = authorization.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    if (!payload.id || !['administrador', 'usuario'].includes(payload.role)) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

module.exports = authenticate;
