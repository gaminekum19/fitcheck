const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const signup = async (req, res) => {
  try {
    const name = String((req.body && req.body.name) || '').trim();
    const email = String((req.body && req.body.email) || '').trim().toLowerCase();
    const password = String((req.body && req.body.password) || '');
    const gender = req.body && req.body.gender;

    if (!name || name.length > 60) return res.status(400).json({ message: 'Please enter your name.' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
    if (password.length < 8 || password.length > 100) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    if (gender && !['male', 'female', 'other'].includes(gender)) return res.status(400).json({ message: 'Invalid gender value.' });

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, gender });
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error('signup error:', error.message);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

const login = async (req, res) => {
  try {
    const email = String((req.body && req.body.email) || '').trim().toLowerCase();
    const password = String((req.body && req.body.password) || '');
    if (!email || !password) return res.status(400).json({ message: 'Enter your email and password.' });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({
      message: 'Logged in successfully!',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('login error:', error.message);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

module.exports = { signup, login };
