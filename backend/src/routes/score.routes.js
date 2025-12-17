const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { getMyScore } = require('../controllers/score.controller');

router.get('/me', auth, getMyScore);

module.exports = router;
