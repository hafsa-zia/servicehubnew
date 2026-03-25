const express = require('express');
const auth = require('../middleware/auth');
const Service = require('../models/Service');
const router = express.Router();

// Add Service
router.post('/', auth(['provider']), async (req, res) => {
  const service = await Service.create({ ...req.body, provider: req.user.id });
  res.json(service);
});

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().populate('provider', 'name email _id');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get services for a specific provider
router.get('/provider', auth(['provider']), async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user.id });
    res.json(services);
  } catch (error) {
    console.error('Error fetching provider services:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single service by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`Fetching service with ID: ${req.params.id}`);
    const service = await Service.findById(req.params.id).populate('provider', 'name email');
    
    if (!service) {
      console.log(`Service with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Service not found' });
    }
    
    console.log(`Service found:`, service);
    res.json(service);
  } catch (error) {
    console.error(`Error fetching service with ID ${req.params.id}:`, error);
    
    // Check if error is due to invalid ID format
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid service ID format' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Add package to service (Admin only)
router.post('/:serviceId/package', auth(['admin']), async (req, res) => {
  try {
    const { name, duration, visitsIncluded, discountPercent, finalPrice } = req.body;
    const service = await Service.findById(req.params.serviceId);

    if (!service) return res.status(404).json({ message: 'Service not found' });

    service.packages.push({
      name,
      duration,
      visitsIncluded,
      discountPercent,
      finalPrice
    });

    await service.save();
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete service (Admin only)
router.delete('/:serviceId/admin', auth(['admin']), async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    res.json({ message: 'Service deleted by admin', service });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete provider's own service
router.delete('/:serviceId', auth(['provider']), async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Check if the service belongs to the provider
    if (service.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this service' });
    }
    
    await service.deleteOne();
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve service (Admin only)
router.put('/admin/services/approve/:serviceId', auth(['admin']), async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.serviceId,
      { isApproved: true },
      { new: true }
    );
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(service);
  } catch (error) {
    console.error('Error approving service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject service (Admin only)
router.put('/admin/services/reject/:serviceId', auth(['admin']), async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.serviceId,
      { isApproved: false },
      { new: true }
    );
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(service);
  } catch (error) {
    console.error('Error rejecting service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
