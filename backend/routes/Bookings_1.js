const express = require('express');
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const router = express.Router();

// ========================
// Seeker: View Own Bookings
// ========================
router.get('/', auth(['seeker']), async (req, res) => {
  try {
    const bookings = await Booking.find({ seeker: req.user.id })
      .populate({
        path: 'service',
        populate: { path: 'provider', select: 'name email _id' }
      });

    // Remove empty package if not booked
    const sanitized = bookings.map(b => {
      const plain = b.toObject();
      if (!plain.package?.name) delete plain.package;
      return plain;
    });

    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// ========================
// Admin: View All Bookings
// ========================
router.get('/admin', auth(['admin']), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: 'seeker',
        select: 'name email _id'
      })
      .populate({
        path: 'service',
        populate: { path: 'provider', select: 'name email _id' }
      });

    // Remove empty packages from response
    const sanitized = bookings.map(b => {
      const plain = b.toObject();

      // Remove package if it wasn't booked
      if (!plain.package?.name) {
        delete plain.package;
      }

      return plain;
    });

    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// ========================
// Provider: View Bookings for Their Services
// ========================
router.get('/provider', auth(['provider']), async (req, res) => {
  try {
    // First find all services by this provider
    const services = await Service.find({ provider: req.user.id });
    const serviceIds = services.map(service => service._id);
    
    // Then find bookings for these services with full service data
    const bookings = await Booking.find({ service: { $in: serviceIds } })
      .populate({
        path: 'service',
        select: 'title price category description provider'
      })
      .populate({
        path: 'seeker',
        select: 'name email phone address _id'
      });
    
    console.log('Provider bookings:', bookings.map(b => ({
      id: b._id,
      service: b.service ? { id: b.service._id, title: b.service.title } : null,
      seeker: b.seeker ? { id: b.seeker._id, name: b.seeker.name } : null
    })));
    
    // Sanitize: remove empty package
    const sanitized = bookings.map(b => {
      const plain = b.toObject();
      
      // Remove package if not booked
      if (!plain.package?.name) delete plain.package;
      
      return plain;
    });
    
    res.json(sanitized);
  } catch (err) {
    console.error('Error fetching provider bookings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ========================
// Create a Booking
// ========================
router.post('/', auth(['seeker']), async (req, res) => {
  try {
    const { service: serviceId, date, time, packageIndex } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    let selectedPackage = null;

    // Only attach package if seeker selected one
    if (typeof packageIndex === 'number' && service.packages[packageIndex]) {
      selectedPackage = service.packages[packageIndex];
    }

    const booking = await Booking.create({
      seeker: req.user.id,
      service: serviceId,
      package: selectedPackage,
      date,
      time
    });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Failed to book service' });
  }
});



router.delete('/:bookingId/seeker', auth(['seeker']), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Only allow deletion if booking belongs to this seeker
    if (booking.seeker.toString() !== req.user.id)
      return res.status(403).json({ message: 'Access denied' });

    if (booking.status === 'completed')
      return res.status(400).json({ message: 'Cannot delete completed service' });

    await booking.deleteOne();
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status (Admin only)
router.put('/:bookingId/status', auth(['admin']), async (req, res) => {
  try {
    console.log(`Updating booking status for ID: ${req.params.bookingId} to ${req.body.status}`);
    
    const { status } = req.body;
    
    // Validate status
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      { status },
      { new: true }
    )
    .populate({
      path: 'seeker',
      select: 'name email _id'
    })
    .populate({
      path: 'service',
      populate: { path: 'provider', select: 'name email _id' }
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
