const router = require('express').Router();
const Batch = require('../models/Batch');
const { protect } = require('../middleware/auth');
const QRCode = require('qrcode');

// GET /api/qr/:batchId  — returns QR code PNG as data URL
router.get('/:batchId', protect, async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchId: req.params.batchId, farmer: req.user._id });
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    if (!batch.qrCodeData) {
      const qrUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/track/${batch.batchId}`;
      batch.qrCodeData = await QRCode.toDataURL(qrUrl);
      await batch.save();
    }

    res.json({ qrCode: batch.qrCodeData, batchId: batch.batchId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
