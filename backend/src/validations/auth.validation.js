const { body } = require('express-validator');

exports.registerValidation = [
  body('email').isEmail(),
  body('phone').isLength({ min: 10 }),
  body('password').isLength({ min: 6 }),
  body('startupName')
    .custom((value, { req }) => {
      if (req.body.role === 'FOUNDER') {
        return Boolean(value && value.trim());
      }
      return true;
    })
    .withMessage('Startup name is required for founders'),
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
