const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, username, password, role } = req.body;
    
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      username,
      password,
      role: role || 'User',
      resumeUrl: req.file ? `/${req.file.path.replace(/\\/g, '/')}` : undefined,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        approvalStatus: user.approvalStatus,
        resumeUrl: user.resumeUrl,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const user = await User.findOne({ username });

    if (user && user.isBlocked) {
      return res.status(403).json({ message: 'User account has been blocked by the admin' });
    }

    if (user && (await user.matchPassword(password))) {
      // Access control limit: prevent roles logging into wrong portals
      if (role && user.role !== role) {
        return res.status(401).json({ message: `Access denied. Please login from the ${user.role} portal.` });
      }

      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        approvalStatus: user.approvalStatus,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile securely
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile seamlessly
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      
      // Update explicitly ensuring optional sparse compatibility
      if (req.body.email !== undefined) {
         user.email = req.body.email;
      }
      
      if (req.body.password) {
        user.password = req.body.password; // hook triggers correctly safely natively mapping hashes globally cleanly.
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        approvalStatus: updatedUser.approvalStatus,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found natively' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
