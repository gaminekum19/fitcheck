const User = require('../models/User');

const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('role');
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }
    next();
  } catch (error) {
    console.error('Admin authorization failed:', error.message);
    res.status(500).json({ message: 'Unable to verify permissions.' });
  }
};

module.exports = requireAdmin;
