const router = require('express').Router();
const Batch = require('../models/Batch');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const role = req.user.role;
    let stats = {};

    if (role === 'farmer') {
      const batches = await Batch.find({ farmer: req.user._id });
      stats = {
        totalBatches:   batches.length,
        activeBatches:  batches.filter(b => b.status === 'active').length,
        soldBatches:    batches.filter(b => b.currentStage === 'sold').length,
        recalledBatches:batches.filter(b => b.status === 'recalled').length,
        avgIntegrity:   batches.length
          ? Math.round(batches.reduce((s, b) => s + b.integrityScore, 0) / batches.length)
          : 100,
        recentBatches:  batches.sort((a,b) => b.createdAt - a.createdAt).slice(0, 5)
      };
    } else if (role === 'admin') {
      const [totalBatches, totalUsers, activeBatches, recalls] = await Promise.all([
        Batch.countDocuments(),
        User.countDocuments({ role: { $ne: 'admin' } }),
        Batch.countDocuments({ status: 'active' }),
        Batch.countDocuments({ status: 'recalled' })
      ]);
      const byStage = await Batch.aggregate([
        { $group: { _id: '$currentStage', count: { $sum: 1 } } }
      ]);
      stats = { totalBatches, totalUsers, activeBatches, recalls, byStage };
    } else {
      // processor / distributor / retailer
      const stageMap = { processor:'processing', distributor:'distribution', retailer:'retail' };
      const stage = stageMap[role];
      const myCheckpoints = await Batch.countDocuments({
        'checkpoints.actorRole': role
      });
      const pending = await Batch.countDocuments({ currentStage: stage });
      stats = { myCheckpoints, pending };
    }

    res.json({ stats, role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
