const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.middleware');
const upload = require('../utils/upload');

const {
  createIdea,
  getMyIdeas,
  getPublicIdeas,
  getIdeasByStartup,
  likeIdea
} = require('../controllers/idea.controller');

router.post(
  '/',
  auth,
  upload.single('media'),
  createIdea
);

router.get('/my', auth, getMyIdeas);
router.get('/public', getPublicIdeas);
router.get('/startup/:startupId', getIdeasByStartup);
router.post('/:id/like', auth, likeIdea);

module.exports = router;
