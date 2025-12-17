const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['DIRECT', 'GROUP'],
    default: 'DIRECT'
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  name: String // for groups
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
