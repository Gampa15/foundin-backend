const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.middleware');
const {
  createStartup,
  getMyStartups,
  getStartupById,
  updateStartup
} = require('../controllers/startup.controller');

router.post('/', auth, createStartup);
router.get('/me', auth, getMyStartups);   // used in Create Idea dropdown
router.get('/:id', getStartupById);
router.put('/:id', auth, updateStartup);

module.exports = router;
