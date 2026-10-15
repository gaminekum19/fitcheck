const User = require('../models/User');

// Only the account whose email matches ADMIN_EMAIL passes. Use after the login check.
module.exports = async (req, res, next) => {
  try {
    const admin = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    if (!admin) return res.status(403).json({ message: 'Admin access is not configured.' });
    const user = await User.findById(req.userId).select('email');
    if (!user || user.email !== admin) return res.status(403).json({ message: 'Admin only.' });
    next();
  } catch (e) {
    res.status(500).json({ message: 'Could not verify admin access.' });
  }
};
