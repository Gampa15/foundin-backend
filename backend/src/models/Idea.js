const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema(
  {
    /* =====================
       CORE RELATIONS
    ====================== */
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: true
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    /* =====================
       IDEA BASICS
    ====================== */
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000
    },

    visibility: {
      type: String,
      enum: ['PUBLIC', 'PRIVATE'],
      default: 'PUBLIC'
    },

    isDraft: {
      type: Boolean,
      default: false
    },

    /* =====================
       STARTUP CONTEXT
       (AUTO-FILLED FROM STARTUP)
    ====================== */
    sector: {
      type: String,
      required: true,
      enum: [
        'FINTECH',
        'HEALTHTECH',
        'EDTECH',
        'SAAS',
        'AI',
        'ECOMMERCE',
        'AGRI',
        'OTHER'
      ]
    },


    stage: {
      type: String,
      enum: ['IDEA', 'PROTOTYPE', 'MARKET', 'MVP', 'EARLY_USERS', 'REVENUE'],
      default: 'IDEA'
    },

    /* =====================
       PROBLEM & MARKET
    ====================== */
    problem: {
      type: String,
      trim: true,
      maxlength: 1500
    },

    solution: {
      type: String,
      trim: true,
      maxlength: 2000
    },

    targetAudience: {
      type: String,
      trim: true
    },

    marketSize: {
      type: String,
      enum: ['SMALL', 'MEDIUM', 'LARGE', 'UNKNOWN'],
      default: 'UNKNOWN'
    },

    differentiation: {
      type: String,
      trim: true
    },

    /* =====================
       TRACTION
    ====================== */
    traction: {
      type: String,
      trim: true,
      default: ''
    },

    /* =====================
       TEAM
    ====================== */
    teamSize: {
      type: Number,
      min: 1,
      default: 1
    },

    missingSkills: [
      {
        type: String,
        trim: true
      }
    ],

    /* =====================
       ASK / INTENT
    ====================== */
    ask: [
      {
        type: String,
        enum: ['INVESTMENT', 'MENTORSHIP', 'CO_FOUNDER', 'HIRING', 'FEEDBACK']
      }
    ],

    /* =====================
       MEDIA
    ====================== */
    mediaUrl: String,

    mediaType: {
      type: String,
      enum: ['IMAGE', 'VIDEO', 'DOC']
    },

    /* =====================
       ENGAGEMENT
    ====================== */
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Idea', ideaSchema);
