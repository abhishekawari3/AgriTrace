const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const Batch = require('../models/Batch');
const { protect, authorize } = require('../middleware/auth');
const { registerBatchOnChain } = require('../blockchain');
const QRCode = require('qrcode');

// POST /api/batches  — farmer registers a new produce batch
router.post('/', protect, authorize('farmer', 'admin'), [
  body('productName').notEmpty(),
  body('productType').isIn(['grain','vegetable','fruit','dairy','spice','oilseed','pulse','other']),
  body('quantity').isNumeric(),
  body('harvestDate').isISO8601()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { productName, productType, quantity, unit, variety,
            harvestDate, expiryDate, description, farmLocation,
            farmCoords, organicCertified, certifications } = req.body;

    // Register on blockchain (simulated)
    const { txHash, blockNumber } = await registerBatchOnChain({
      productName, farmerId: req.user._id.toString(), harvestDate
    });

    // First checkpoint: farm origin
    const genesisCheckpoint = {
      stage:      'farm',
      actor:      req.user._id,
      actorName:  req.user.name,
      actorRole:  'farmer',
      location:   farmLocation || req.user.profile?.farmLocation || 'India',
      notes:      `Batch registered. Variety: ${variety || 'N/A'}. ${organicCertified ? 'Organic certified.' : ''}`,
      status:     'passed',
      txHash,
      blockNumber,
      timestamp:  new Date()
    };

    const batch = await Batch.create({
      productName, productType, quantity, unit: unit || 'kg',
      variety, harvestDate, expiryDate, description,
      farmer: req.user._id,
      farmLocation: farmLocation || req.user.profile?.farmLocation || 'India',
      farmCoords, organicCertified, certifications,
      genesisHash: txHash,
      checkpoints: [genesisCheckpoint]
    });

    // Generate QR code pointing to public track URL
    const qrUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/track/${batch.batchId}`;
    batch.qrCodeData = await QRCode.toDataURL(qrUrl);
    await batch.save();

    res.status(201).json({ batch });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/batches  — list batches visible to the current role
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'farmer') query.farmer = req.user._id;
    // Other roles see batches at or past their stage
    const stageMap = { processor:'processing', distributor:'distribution', retailer:'retail' };
    if (stageMap[req.user.role]) {
      query.currentStage = { $in: [stageMap[req.user.role], 'distribution', 'retail', 'sold'] };
    }

    const batches = await Batch.find(query)
      .populate('farmer', 'name profile')
      .sort('-createdAt')
      .limit(50);
    res.json({ batches });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/batches/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchId: req.params.id })
      .populate('farmer', 'name profile')
      .populate('checkpoints.actor', 'name role profile');
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json({ batch });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/batches/:id  — admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Batch.findOneAndDelete({ batchId: req.params.id });
    res.json({ message: 'Batch deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
