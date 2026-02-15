const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.middleware');
const upload = require('../utils/upload');

const {
  createIdea,
  getIdeaById,
  getMyIdeas,
  getSavedIdeas,
  getPublicIdeas,
  getIdeasByStartup,
  likeIdea,
  toggleSaveIdea,
  addIdeaView,
  getIdeaComments,
  addComment,
  toggleCommentLike,
  replyToComment,
  updateIdea,
  deleteIdea
} = require('../controllers/idea.controller');

router.post(
  '/',
  auth,
  upload.single('media'),
  createIdea
);

router.get('/my', auth, getMyIdeas);
router.get('/saved', auth, getSavedIdeas);
router.get('/public', getPublicIdeas);
router.get('/startup/:startupId', getIdeasByStartup);
router.post('/:id/like', auth, likeIdea);
router.post('/:id/save', auth, toggleSaveIdea);
router.post('/:id/view', addIdeaView);
router.get('/:id/comments', auth, getIdeaComments);
router.post('/:id/comments', auth, addComment);
router.post('/:id/comments/:commentId/like', auth, toggleCommentLike);
router.post('/:id/comments/:commentId/reply', auth, replyToComment);
router.get('/:id', auth, getIdeaById);
router.put('/:id', auth, upload.single('media'), updateIdea);
router.delete('/:id', auth, deleteIdea);

module.exports = router;
