const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Upload or update provider image
router.post('/upload-profile', auth(['provider']), upload.single('image'), async (req, res) => {
  try {
    const imagePath = 'uploads/' + req.file.filename;
    console.log("run huwa");
    const user = await User.findByIdAndUpdate(req.user.id, {
        
      profileImage: imagePath
    }, { new: true });

    res.json({ message: 'Profile image uploaded', imageUrl: imagePath, user });
  } catch (err) {
    res.status(500).json({ message: 'Image upload failed' });
  }
});

// Get user profile
router.get('/profile', auth(['admin', 'seeker', 'provider']), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth(['admin', 'seeker', 'provider']), async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    console.log('Profile update request body:', req.body);
    console.log('Extracted values:', { name, phone, address });
    
    // Find the user first
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    
    // Save the updated user
    await user.save();
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    console.log('Updated user:', userResponse);
    res.json(userResponse);
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
