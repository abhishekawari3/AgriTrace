const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const Batch = require('../models/Batch');
const { protect, authorize } = require('../middleware/auth');
const { addCheckpointOnChain } = require('../blockchain');

const ROLE_STAGE = {
  processor:   'processing',
  distributor: 'distribution',
  retailer:    'retail',
  farmer:      'farm'
};

const NEXT_STAGE = {
  farm:         'processing',
  processing:   'distribution',
  distribution: 'retail',
  retail:       'sold'
};

// POST /api/checkpoints/:batchId  — add a supply chain checkpoint
router.post('/:batchId', protect,
  authorize('farmer', 'processor', 'distributor', 'retailer', 'admin'), [
  body('location').notEmpty(),
  body('status').optional().isIn(['passed','flagged','rejected'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const batch = await Batch.findOne({ batchId: req.params.batchId });
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    if (batch.status !== 'active')
      return res.status(400).json({ message: `Batch is ${batch.status}` });

    const stage = req.user.role === 'admin'
      ? (req.body.stage || ROLE_STAGE[req.user.role] || 'processing')
      : ROLE_STAGE[req.user.role];

    const { location, notes, temperature, humidity, status = 'passed' } = req.body;

    // Record on blockchain
    const { txHash, blockNumber } = await addCheckpointOnChain(batch.batchId, {
      stage, actor: req.user._id.toString(), location, status
    });

    const checkpoint = {
      stage,
      actor:       req.user._id,
      actorName:   req.user.name,
      actorRole:   req.user.role,
      location,
      notes,
      temperature,
      humidity,
      status,
      txHash,
      blockNumber,
      timestamp:   new Date()
    };

    batch.checkpoints.push(checkpoint);

    // Advance the supply chain stage
    if (status !== 'rejected') {
      batch.currentStage = NEXT_STAGE[batch.currentStage] || batch.currentStage;
    } else {
      batch.status = 'recalled';
    }

    await batch.save();
    res.status(201).json({ checkpoint, batch });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
