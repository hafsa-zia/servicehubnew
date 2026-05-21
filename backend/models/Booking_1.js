const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  seeker: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  service: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Service',
    required: true
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  package: {
    name: String,
    price: Number,
    description: String
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema);
