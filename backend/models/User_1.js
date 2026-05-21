const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  password: {
    type: String,
    required: function() {
      // Only require password if googleId is not provided
      return !this.googleId;
    },
    minlength: [6, 'Password must be at least 6 characters']
  },
  googleId: {
    type: String
  },
  role: {
    type: String,
    enum: ['admin', 'seeker', 'provider'],
    default: 'seeker'
  },
  isApproved: {
    type: Boolean,
    default: function() {
      return this.role !== 'provider'; // Only providers need approval
    }
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  bio: String,
  skills: [String],
  profileImage: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving - DISABLE THIS FOR NOW
// We're handling password hashing directly in the routes
/*
UserSchema.pre('save', async function(next) {
  try {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    // Skip hashing if using Google authentication
    if (this.googleId && !this.password) return next();
    
    console.log('Hashing password for user:', this.email);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});
*/

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
};

module.exports = mongoose.model('User', UserSchema);
