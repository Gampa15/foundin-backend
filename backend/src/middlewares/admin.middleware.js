const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // req.user is set by auth.middleware (JWT)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id).select('role isBanned');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: 'User is banned' });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin access only' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
