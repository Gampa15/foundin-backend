const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.middleware');
const {
  createProfile,
  getMyProfile,
  getProfileByUserId,
  updateProfile
} = require('../controllers/profile.controller');

router.post('/', auth, createProfile);
router.get('/me', auth, getMyProfile);
router.get('/:userId', getProfileByUserId);
router.put('/', auth, updateProfile);

module.exports = router;
