const User = require('../models/User');

exports.getMyScore = async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('authenticityScore trustTier');

  res.json(user);
};
