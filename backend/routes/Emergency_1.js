const express = require('express');
const Emergency = require('../models/Emergency');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth(['seeker']), async (req, res) => {
  const request = await Emergency.create({ ...req.body, seeker: req.user.id });
  res.json(request);
});

module.exports = router;
