const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  startup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Startup',
    required: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  skillsRequired: [String],
  jobType: {
    type: String,
    enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'COLLAB'],
    default: 'COLLAB'
  },
  location: String,
  isFeatured: {
    type: Boolean,
    default: false
  },
  expiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
