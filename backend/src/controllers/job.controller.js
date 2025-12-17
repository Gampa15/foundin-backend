const Job = require('../models/Job');
const Startup = require('../models/Startup');

// CREATE JOB
exports.createJob = async (req, res) => {
  try {
    const startup = await Startup.findOne({
      _id: req.body.startupId,
      owner: req.user.id
    });

    if (!startup) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const job = await Job.create({
      startup: req.body.startupId,
      postedBy: req.user.id,
      title: req.body.title,
      description: req.body.description,
      skillsRequired: req.body.skillsRequired,
      jobType: req.body.jobType,
      location: req.body.location,
      expiresAt: req.body.expiresAt
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET ALL PUBLIC JOBS
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ expiresAt: { $gte: new Date() } })
      .populate('startup', 'name stage')
      .sort({ isFeatured: -1, createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET JOBS BY STARTUP
exports.getJobsByStartup = async (req, res) => {
  try {
    const jobs = await Job.find({ startup: req.params.startupId });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE JOB (OWNER ONLY)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user.id },
      req.body,
      { new: true }
    );

    if (!job) {
      return res.status(403).json({ message: 'Not authorized or not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE JOB
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      postedBy: req.user.id
    });

    if (!job) {
      return res.status(403).json({ message: 'Not authorized or not found' });
    }

    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
