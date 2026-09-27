const express = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');

const router = express.Router();
const usernameRule = body('username')
  .trim()
  .isEmail().withMessage('Ingresa un correo válido')
  .normalizeEmail();
const passwordRule = body('password')
  .isString()
  .isLength({ min: 8, max: 72 }).withMessage('La contraseña debe tener entre 8 y 72 caracteres');

router.post('/register', [usernameRule, passwordRule], validate, asyncHandler(register));
router.post('/login', [usernameRule, passwordRule], validate, asyncHandler(login));

module.exports = router;
