const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/batches',      require('./routes/batches'));
app.use('/api/checkpoints',  require('./routes/checkpoints'));
app.use('/api/track',        require('./routes/track'));
app.use('/api/qr',           require('./routes/qr'));
app.use('/api/dashboard',    require('./routes/dashboard'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date() }));

// ── DB + Server ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/agritrace';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    app.listen(PORT, () => console.log(`🚀  Server running on port ${PORT}`));
  })
  .catch(err => { console.error('❌  MongoDB error:', err); process.exit(1); });
