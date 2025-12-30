const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.middleware');
const profileController = require('../controllers/profile.controller');
console.log('PROFILE ROUTES LOADED');

// CREATE profile
router.post('/', auth, profileController.createProfile);

// GET my profile
router.get('/', auth, profileController.getMyProfile);

// UPDATE my profile
router.put('/', auth, profileController.updateProfile);

// GET profile by user ID
router.get('/:userId', auth, profileController.getProfileByUserId);

module.exports = router;
