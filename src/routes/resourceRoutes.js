const express = require('express');
const { body, param } = require('express-validator');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const { RESOURCE_STATES } = require('../utils/constants');
const controller = require('../controllers/resourceController');

const router = express.Router();
router.use(authenticate);

const idRule = param('id').isInt({ min: 1 }).withMessage('El ID debe ser un entero positivo').toInt();
const resourceRules = [
  body('nombre').trim().isLength({ min: 2, max: 120 }).withMessage('Nombre: 2 a 120 caracteres').escape(),
  body('categoria').trim().isLength({ min: 2, max: 80 }).withMessage('Categoría: 2 a 80 caracteres').escape(),
  body('estado').isIn(RESOURCE_STATES).withMessage('Estado no permitido'),
  body('ubicacion').trim().isLength({ min: 2, max: 120 }).withMessage('Ubicación: 2 a 120 caracteres').escape(),
];

router.get('/', asyncHandler(controller.listResources));
router.get('/:id', idRule, validate, asyncHandler(controller.getResource));
router.post('/', authorize('administrador'), resourceRules, validate, asyncHandler(controller.createResource));
router.put('/:id', authorize('administrador'), [idRule, ...resourceRules], validate, asyncHandler(controller.updateResource));

module.exports = router;
