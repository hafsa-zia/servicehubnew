const mongoose = require('mongoose');

const EmergencySchema = new mongoose.Schema({
  seeker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: String,
  location: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Emergency', EmergencySchema);
