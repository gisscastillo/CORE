const { validationResult, matchedData } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Datos inválidos',
      errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg })),
    });
  }

  req.validated = matchedData(req, { locations: ['body', 'params'] });
  return next();
}

module.exports = validate;
