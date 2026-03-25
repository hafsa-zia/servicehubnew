const express = require('express');
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');
const router = express.Router();

// Test route (no auth required) to check if admin routes are accessible
router.get('/test', (req, res) => {
  console.log('Admin test route accessed');
  res.json({ message: 'Admin routes are working' });
});

// Get admin dashboard stats
router.get('/stats', auth(['admin']), async (req, res) => {
  try {
    console.log('Admin stats route accessed');
    
    // Get counts from database
    const totalUsers = await User.countDocuments();
    const totalSeekers = await User.countDocuments({ role: 'seeker' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const pendingApprovals = await User.countDocuments({ 
      role: 'provider', 
      isApproved: false 
    });
    
    // Return stats
    res.json({
      totalUsers,
      totalSeekers,
      totalProviders,
      pendingApprovals
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recent users
router.get('/recent-users', auth(['admin']), async (req, res) => {
  try {
    console.log('Admin recent-users route accessed');
    
    // Get recent users from database
    const recentUsers = await User.find()
      .sort({ _id: -1 }) // Sort by most recent
      .limit(10)
      .select('name email role isApproved');
    
    res.json(recentUsers);
  } catch (error) {
    console.error('Error fetching recent users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve a provider
router.put('/approve/:id', auth(['admin']), async (req, res) => {
  try {
    console.log(`Admin approve route accessed for user ID: ${req.params.id}`);
    
    // Find and update the provider
    const provider = await User.findByIdAndUpdate(
      req.params.id, 
      { isApproved: true },
      { new: true }
    );
    
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    res.json(provider);
  } catch (error) {
    console.error('Error approving provider:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a new user (admin only)
router.post('/users', auth(['admin']), async (req, res) => {
  try {
    console.log('Admin add user route accessed');
    const { name, email, password, role, phone, address } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      phone,
      address,
      isApproved: role !== 'provider' // Auto-approve non-providers
    });
    
    // Save user
    await user.save();
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users (admin only)
router.get('/users', auth(['admin']), async (req, res) => {
  try {
    console.log('Admin get all users route accessed');
    
    // Get all users from database
    const users = await User.find().select('-password');
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a user (admin only)
router.delete('/users/:id', auth(['admin']), async (req, res) => {
  try {
    console.log(`Admin delete user route accessed for user ID: ${req.params.id}`);
    
    // Find and delete the user
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
