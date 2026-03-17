const router = require('express').Router();
const Batch = require('../models/Batch');
const { verifyBatchIntegrity } = require('../blockchain');

// GET /api/track/:batchId  — public, no auth needed (consumer QR scan)
router.get('/:batchId', async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchId: req.params.batchId })
      .populate('farmer', 'name profile')
      .populate('checkpoints.actor', 'name role profile');

    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    // Verify on-chain integrity
    const integrity = verifyBatchIntegrity(batch);

    // Strip sensitive QR data, keep public info only
    const publicData = {
      batchId:       batch.batchId,
      productName:   batch.productName,
      productType:   batch.productType,
      quantity:      batch.quantity,
      unit:          batch.unit,
      variety:       batch.variety,
      harvestDate:   batch.harvestDate,
      expiryDate:    batch.expiryDate,
      farmer:        { name: batch.farmer?.name, location: batch.farmLocation },
      organicCertified: batch.organicCertified,
      certifications:   batch.certifications,
      currentStage:  batch.currentStage,
      status:        batch.status,
      integrityScore: batch.integrityScore,
      genesisHash:   batch.genesisHash,
      journey: batch.checkpoints.map(cp => ({
        stage:       cp.stage,
        actor:       cp.actorName || cp.actor?.name,
        actorRole:   cp.actorRole || cp.actor?.role,
        location:    cp.location,
        notes:       cp.notes,
        temperature: cp.temperature,
        humidity:    cp.humidity,
        status:      cp.status,
        txHash:      cp.txHash,
        blockNumber: cp.blockNumber,
        timestamp:   cp.timestamp
      })),
      blockchainVerification: integrity,
      createdAt: batch.createdAt
    };

    res.json({ batch: publicData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
