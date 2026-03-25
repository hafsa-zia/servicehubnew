const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);  // Google Client ID

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    console.log('Registration attempt with data:', { name, email, role, passwordLength: password?.length });
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Validate required fields
    if (!name || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    
    // Hash password directly in the route instead of relying on middleware
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Password hashed successfully');
    
    // Create new user with hashed password
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: role || 'seeker'
    });
    
    console.log('Attempting to save user to database...');
    
    // Save user to database
    const savedUser = await newUser.save();
    
    console.log('User created successfully:', savedUser.email, 'with ID:', savedUser._id);
    console.log('Hashed password stored:', savedUser.password.substring(0, 10) + '...');
    
    // Return user without password
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Registration error details:', error);
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.log('Validation errors:', validationErrors);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validationErrors 
      });
    }
    
    // Check for duplicate key error
    if (error.code === 11000) {
      console.log('Duplicate key error:', error.keyValue);
      return res.status(400).json({ 
        message: 'User with this email already exists',
        field: Object.keys(error.keyValue)[0]
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during registration', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body.email);
    
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('User found:', user.email);
    console.log('Password in DB:', user.password ? `${user.password.substring(0, 10)}...` : 'missing');
    console.log('Password from request length:', password.length);
    
    // Check password using bcrypt.compare
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match result:', isMatch);
      
      if (!isMatch) {
        console.log('Password mismatch for user:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (bcryptError) {
      console.error('bcrypt.compare error:', bcryptError);
      return res.status(500).json({ message: 'Error comparing passwords', error: bcryptError.message });
    }
    
    // Create token with user info
    const token = jwt.sign(
      { 
        id: user._id, 
        name: user.name,
        email: user.email,
        role: user.role
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    console.log('Login successful for:', email, 'with role:', user.role);
    
    // Send token
    res.json({ 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Google Login
router.post('/google-login', async (req, res) => {
  const { token } = req.body;

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload; // sub is Google user ID

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        role: 'seeker', // default role
      });
    }

    const jwtToken = jwt.sign({ 
      id: user._id, 
      name: user.name,
      email: user.email,
      role: user.role
    }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ token: jwtToken });

  } catch (error) {
    console.error(error);
    console.log('Google login error:', error);
    return res.status(400).send('Google login failed');
  }
});

// Test route to check database connection and user retrieval
router.get('/test', async (req, res) => {
  try {
    // Check if we can query users
    const users = await User.find().select('-password').limit(5);
    
    // Return success with user count
    res.json({ 
      message: 'Database connection successful', 
      userCount: users.length,
      sampleUsers: users.map(u => ({ 
        id: u._id, 
        email: u.email, 
        role: u.role 
      }))
    });
  } catch (error) {
    console.error('Test route error:', error);
    res.status(500).json({ 
      message: 'Database connection failed', 
      error: error.message 
    });
  }
});

// Test route to verify user credentials
router.post('/verify-credentials', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.json({ 
        exists: false, 
        message: 'User not found' 
      });
    }
    
    // Check if password exists
    if (!user.password) {
      return res.json({ 
        exists: true, 
        hasPassword: false,
        message: 'User exists but has no password (Google account?)' 
      });
    }
    
    // Try to match password
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      
      return res.json({
        exists: true,
        hasPassword: true,
        passwordMatch: isMatch,
        passwordFromDB: user.password.substring(0, 10) + '...',
        message: isMatch ? 'Credentials valid' : 'Password does not match'
      });
    } catch (bcryptError) {
      return res.status(500).json({ 
        message: 'Error comparing passwords', 
        error: bcryptError.message 
      });
    }
  } catch (error) {
    console.error('Verify credentials error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
