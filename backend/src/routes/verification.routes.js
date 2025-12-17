const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');
const upload = require('../utils/upload');

const {
  applyVerification,
  getMyVerifications,
  getPendingVerifications,
  reviewVerification
} = require('../controllers/verification.controller');

router.post(
  '/',
  auth,
  upload.array('documents', 5),
  applyVerification
);

router.get('/me', auth, getMyVerifications);

// ADMIN
router.get('/pending', auth, admin, getPendingVerifications);
router.put('/:id/review', auth, admin, reviewVerification);

module.exports = router;
