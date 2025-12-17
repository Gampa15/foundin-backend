const Report = require('../models/Report');
const FraudFlag = require('../models/FraudFlag');
const User = require('../models/User');
const { flagUser } = require('../services/fraud.service');

// REPORT USER OR IDEA
exports.createReport = async (req, res) => {
  try {
    const report = await Report.create({
      reportedUser: req.body.reportedUser || null,
      reportedIdea: req.body.reportedIdea || null,
      reportedBy: req.user.id,
      reason: req.body.reason
    });

    res.status(201).json({ message: 'Report submitted', report });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ADMIN: VIEW REPORTS
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reportedUser', 'email role')
      .populate('reportedIdea', 'title')
      .populate('reportedBy', 'email');

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ADMIN: TAKE ACTION
exports.takeAction = async (req, res) => {
  try {
    const { severity, action } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = 'REVIEWED';
    await report.save();

    if (report.reportedUser) {
      await FraudFlag.create({
        user: report.reportedUser,
        reason: report.reason,
        severity,
        actionTaken: action
      });

      if (severity === 'HIGH') {
        await User.findByIdAndUpdate(
          report.reportedUser,
          { status: 'SUSPENDED' }
        );
      }
    }

    res.json({ message: 'Action taken' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.reportUser = async (req, res) => {
  const { userId, reason } = req.body;

  await flagUser({
    userId,
    reason,
    source: 'USER',
    reportedBy: req.user.id,
    severity: 'MEDIUM'
  });

  res.json({ message: 'Report submitted' });
};