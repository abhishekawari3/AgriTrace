const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = id => jwt.sign({ id }, process.env.JWT_SECRET || 'agritrace_secret_key', { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['farmer', 'processor', 'distributor', 'retailer', 'consumer'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, password, role, profile } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role, profile: profile || {} });
    res.status(201).json({ token: sign(user._id), user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: sign(user._id), user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json({ user: req.user.toSafeJSON() }));

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, profile, walletAddress } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, profile, walletAddress },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
