const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');

const {
  createReport,
  getReports,
  takeAction
} = require('../controllers/fraud.controller');

const { reportUser } = require('../controllers/fraud.controller');

router.post('/report', auth, createReport);

// ADMIN
router.get('/reports', auth, admin, getReports);
router.put('/reports/:id/action', auth, admin, takeAction);

module.exports = router;
