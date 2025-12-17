const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.middleware');
const {
  createJob,
  getJobs,
  getJobsByStartup,
  updateJob,
  deleteJob
} = require('../controllers/job.controller');

router.post('/', auth, createJob);
router.get('/', getJobs);
router.get('/startup/:startupId', getJobsByStartup);
router.put('/:id', auth, updateJob);
router.delete('/:id', auth, deleteJob);

module.exports = router;
