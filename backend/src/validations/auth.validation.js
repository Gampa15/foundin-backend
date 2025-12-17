const { body } = require('express-validator');

exports.registerValidation = [
  body('email').isEmail(),
  body('phone').isLength({ min: 10 }),
  body('password').isLength({ min: 6 }),
  body('role').isIn([
    'FOUNDER',
    'INVESTOR',
    'MENTOR',
    'PROFESSIONAL'
  ])
];

exports.loginValidation = [
  body('email').isEmail(),
  body('password').notEmpty()
];
