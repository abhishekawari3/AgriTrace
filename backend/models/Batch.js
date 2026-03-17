const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Each step in the supply chain journey
const checkpointSchema = new mongoose.Schema(
  {
    stage: {
      type: String,
      enum: ['farm', 'processing', 'distribution', 'retail', 'consumer'],
      required: true
    },
    actor:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actorName:    String,
    actorRole:    String,
    location:     { type: String, required: true },
    notes:        String,
    temperature:  Number,   // °C  (IoT sensor data)
    humidity:     Number,   // %
    status: {
      type: String,
      enum: ['passed', 'flagged', 'rejected'],
      default: 'passed'
    },
    // Blockchain fields
    txHash:       { type: String, default: '' },
    blockNumber:  { type: Number, default: 0 },
    timestamp:    { type: Date, default: Date.now }
  },
  { _id: true }
);

const batchSchema = new mongoose.Schema(
  {
    batchId:     { type: String, default: () => uuidv4(), unique: true },
    productName: { type: String, required: true },
    productType: {
      type: String,
      enum: ['grain', 'vegetable', 'fruit', 'dairy', 'spice', 'oilseed', 'pulse', 'other'],
      required: true
    },
    quantity:    { type: Number, required: true },
    unit:        { type: String, enum: ['kg', 'quintal', 'tonne', 'litre', 'dozen'], default: 'kg' },
    variety:     String,
    harvestDate: { type: Date, required: true },
    expiryDate:  Date,
    description: String,

    // Origin
    farmer:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farmLocation:  { type: String, required: true },
    farmCoords:    { lat: Number, lng: Number },
    organicCertified: { type: Boolean, default: false },
    certifications: [String],

    // Supply chain journey
    currentStage: {
      type: String,
      enum: ['farm', 'processing', 'distribution', 'retail', 'sold'],
      default: 'farm'
    },
    checkpoints: [checkpointSchema],

    // Blockchain anchor
    genesisHash:  { type: String, default: '' },  // hash of initial registration
    contractAddr: { type: String, default: '' },  // smart contract address

    // QR
    qrCodeData:   String,

    status: {
      type: String,
      enum: ['active', 'recalled', 'expired', 'sold'],
      default: 'active'
    },

    // Computed integrity score (0-100)
    integrityScore: { type: Number, default: 100 }
  },
  { timestamps: true }
);

// Compute integrity score before save
batchSchema.pre('save', function (next) {
  const flagged  = this.checkpoints.filter(c => c.status === 'flagged').length;
  const rejected = this.checkpoints.filter(c => c.status === 'rejected').length;
  this.integrityScore = Math.max(0, 100 - flagged * 10 - rejected * 30);
  next();
});

module.exports = mongoose.model('Batch', batchSchema);
