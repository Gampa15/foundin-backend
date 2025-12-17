const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');
const { createAd, getApprovedAds } = require('../controllers/ad.controller');
const { reviewAd } = require('../controllers/adminAd.controller');

router.post('/', auth, createAd);
router.get('/', getApprovedAds);
router.put('/review/:id', auth, admin, reviewAd);

module.exports = router;
