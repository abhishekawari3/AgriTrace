/**
 * mockApi.js
 * In-memory mock backend — runs entirely in the browser.
 * Activated automatically when the real backend is unreachable.
 */
// ── In-memory store ───────────────────────────────────────────────────────────
const store = {
  users: [
    { _id: 'u1', name: 'Ramesh Kumar',      email: 'farmer@demo.com',      password: 'demo1234', role: 'farmer',      profile: { farmName: 'Green Valley Farm', farmLocation: 'Nashik, Maharashtra' }, isActive: true, createdAt: new Date() },
    { _id: 'u2', name: 'Aarti Foods',        email: 'processor@demo.com',   password: 'demo1234', role: 'processor',   profile: { licenseNo: 'FSSAI-12345678',    address: 'Pune, Maharashtra'         }, isActive: true, createdAt: new Date() },
    { _id: 'u3', name: 'FastMove Logistics', email: 'distributor@demo.com', password: 'demo1234', role: 'distributor', profile: { licenseNo: 'DL-MH-00123',       address: 'Mumbai, Maharashtra'       }, isActive: true, createdAt: new Date() },
    { _id: 'u4', name: 'FreshMart Retail',   email: 'retailer@demo.com',    password: 'demo1234', role: 'retailer',    profile: { licenseNo: 'GSTIN-27AABCF1234', address: 'Andheri West, Mumbai'      }, isActive: true, createdAt: new Date() },
    { _id: 'u5', name: 'Super Admin',        email: 'admin@demo.com',       password: 'demo1234', role: 'admin',       profile: {},                                                                       isActive: true, createdAt: new Date() },
  ],
  batches: [
    {
      _id: 'b1', batchId: 'demo-batch-basmati-001', productName: 'Basmati Rice', productType: 'grain',
      quantity: 500, unit: 'kg', variety: '1121', harvestDate: new Date('2025-10-15'),
      expiryDate: new Date('2026-10-14'), farmLocation: 'Karnal, Haryana',
      farmer: { _id: 'u1', name: 'Ramesh Kumar', profile: { farmName: 'Green Valley Farm', farmLocation: 'Nashik, Maharashtra' } },
      organicCertified: true, certifications: ['FSSAI', 'India Organic'],
      currentStage: 'distribution', status: 'active', integrityScore: 100,
      genesisHash: '0xa3f8c2d1e9b47603f2e1d8a5c9b3f7e2a1d6c4b8e3f5a9d2c7b1e4f6a8d3c9',
      description: 'Premium long-grain basmati. No pesticides used.',
      createdAt: new Date('2025-10-15'),
      checkpoints: [
        { stage: 'farm',       actorName: 'Ramesh Kumar',      actorRole: 'farmer',      location: 'Karnal, Haryana',       notes: 'Batch registered. Variety: 1121. Organic certified.', status: 'passed', txHash: '0xa3f8c2d1', blockNumber: 4821034, timestamp: new Date('2025-10-15T08:00:00') },
        { stage: 'processing', actorName: 'Aarti Foods',        actorRole: 'processor',   location: 'Pune Processing Unit',  notes: 'Cleaned, milled and packed. Quality check passed.', temperature: 22, humidity: 55, status: 'passed', txHash: '0xb7e2d9c4', blockNumber: 4821156, timestamp: new Date('2025-10-18T10:30:00') },
        { stage: 'distribution',actorName:'FastMove Logistics', actorRole: 'distributor', location: 'Mumbai Cold Storage',   notes: 'Loaded in refrigerated truck. Cold chain maintained.', temperature: 8, humidity: 60, status: 'passed', txHash: '0xc5f1a8b2', blockNumber: 4821289, timestamp: new Date('2025-10-20T14:00:00') },
      ],
    },
    {
      _id: 'b2', batchId: 'demo-batch-tomato-002', productName: 'Tomatoes', productType: 'vegetable',
      quantity: 200, unit: 'kg', variety: 'Hybrid F1', harvestDate: new Date('2025-11-01'),
      farmLocation: 'Nashik, Maharashtra',
      farmer: { _id: 'u1', name: 'Ramesh Kumar', profile: { farmName: 'Green Valley Farm' } },
      organicCertified: false, certifications: [],
      currentStage: 'farm', status: 'active', integrityScore: 100,
      genesisHash: '0xd9e2f4a1b8c5d3e7f2a9b6c4d1e8f5a2b9c7d4e1f6a3b8c5d2e9f4a1b8c5d3',
      createdAt: new Date('2025-11-01'),
      checkpoints: [
        { stage: 'farm', actorName: 'Ramesh Kumar', actorRole: 'farmer', location: 'Nashik, Maharashtra', notes: 'Fresh harvest. Hybrid F1 variety.', status: 'passed', txHash: '0xd9e2f4a1', blockNumber: 4825001, timestamp: new Date('2025-11-01T07:00:00') },
      ],
    }
  ]
};

let tokenUser = null;

// Simple token encode/decode (not real JWT — mock only)
const fakeToken = uid => btoa(JSON.stringify({ id: uid, exp: Date.now() + 7 * 86400000 }));
const decodeToken = tok => { try { return JSON.parse(atob(tok)); } catch { return null; } };

function safe(u) { const c = { ...u }; delete c.password; return c; }

// ── Route handlers ────────────────────────────────────────────────────────────
const handlers = {

  'POST /auth/register': ({ name, email, password, role, profile }) => {
    if (store.users.find(u => u.email === email))
      return { status: 400, data: { message: 'Email already registered' } };
    const user = { _id: 'u' + Date.now(), name, email, password, role, profile: profile || {}, isActive: true, createdAt: new Date() };
    store.users.push(user);
    tokenUser = user;
    return { status: 201, data: { token: fakeToken(user._id), user: safe(user) } };
  },

  'POST /auth/login': ({ email, password }) => {
    const user = store.users.find(u => u.email === email && u.password === password);
    if (!user) return { status: 401, data: { message: 'Invalid credentials' } };
    tokenUser = user;
    return { status: 200, data: { token: fakeToken(user._id), user: safe(user) } };
  },

  'GET /auth/me': (_, token) => {
    const decoded = decodeToken(token);
    const user = decoded && store.users.find(u => u._id === decoded.id);
    if (!user) return { status: 401, data: { message: 'Unauthorized' } };
    tokenUser = user;
    return { status: 200, data: { user: safe(user) } };
  },

  'PUT /auth/profile': ({ name, profile, walletAddress }, token) => {
    const decoded = decodeToken(token);
    const user = decoded && store.users.find(u => u._id === decoded.id);
    if (!user) return { status: 401, data: { message: 'Unauthorized' } };
    Object.assign(user, { name, profile, walletAddress });
    return { status: 200, data: { user: safe(user) } };
  },

  'GET /batches': (_, token) => {
    const decoded = decodeToken(token);
    const user = decoded && store.users.find(u => u._id === decoded.id);
    if (!user) return { status: 401, data: { message: 'Unauthorized' } };
    let batches = store.batches;
    if (user.role === 'farmer') batches = batches.filter(b => b.farmer._id === user._id);
    return { status: 200, data: { batches } };
  },

  'POST /batches': (body, token) => {
    const decoded = decodeToken(token);
    const user = decoded && store.users.find(u => u._id === decoded.id);
    if (!user) return { status: 401, data: { message: 'Unauthorized' } };
    const txHash = '0x' + Math.random().toString(16).slice(2).padEnd(64, '0').slice(0, 64);
    const batch = {
      _id: 'b' + Date.now(),
      batchId: 'batch-' + Date.now().toString(36),
      ...body,
      quantity: Number(body.quantity),
      farmer: { _id: user._id, name: user.name, profile: user.profile },
      currentStage: 'farm', status: 'active', integrityScore: 100,
      genesisHash: txHash,
      createdAt: new Date(),
      checkpoints: [{
        stage: 'farm', actorName: user.name, actorRole: 'farmer',
        location: body.farmLocation || 'India',
        notes: `Batch registered. ${body.organicCertified ? 'Organic certified.' : ''}`,
        status: 'passed', txHash, blockNumber: Math.floor(4800000 + Math.random() * 100000),
        timestamp: new Date()
      }]
    };
    store.batches.unshift(batch);
    batch.qrCodeData = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="white"/><text x="100" y="100" text-anchor="middle" font-size="12" fill="black">QR: ${batch.batchId.slice(0,12)}</text></svg>`;
    return { status: 201, data: { batch } };
  },

  'GET /batches/:id': (_, token, params) => {
    const batch = store.batches.find(b => b.batchId === params.id);
    if (!batch) return { status: 404, data: { message: 'Batch not found' } };
    return { status: 200, data: { batch } };
  },

  'POST /checkpoints/:batchId': (body, token, params) => {
    const decoded = decodeToken(token);
    const user = decoded && store.users.find(u => u._id === decoded.id);
    if (!user) return { status: 401, data: { message: 'Unauthorized' } };
    const batch = store.batches.find(b => b.batchId === params.batchId);
    if (!batch) return { status: 404, data: { message: 'Batch not found' } };

    const stageMap = { farmer: 'farm', processor: 'processing', distributor: 'distribution', retailer: 'retail' };
    const nextStage = { farm: 'processing', processing: 'distribution', distribution: 'retail', retail: 'sold' };
    const txHash = '0x' + Math.random().toString(16).slice(2).padEnd(64, '0').slice(0, 64);

    const checkpoint = {
      stage: stageMap[user.role] || 'processing',
      actorName: user.name, actorRole: user.role,
      location: body.location, notes: body.notes,
      temperature: body.temperature ? Number(body.temperature) : undefined,
      humidity: body.humidity ? Number(body.humidity) : undefined,
      status: body.status || 'passed',
      txHash, blockNumber: Math.floor(4800000 + Math.random() * 100000),
      timestamp: new Date()
    };

    batch.checkpoints.push(checkpoint);
    if (body.status === 'rejected') { batch.status = 'recalled'; batch.integrityScore = 0; }
    else if (body.status === 'flagged') { batch.integrityScore = Math.max(0, batch.integrityScore - 10); }
    else { batch.currentStage = nextStage[batch.currentStage] || batch.currentStage; }

    return { status: 201, data: { checkpoint, batch } };
  },

  'GET /track/:id': (_, __, params) => {
    const batch = store.batches.find(b => b.batchId === params.id);
    if (!batch) return { status: 404, data: { message: 'Batch not found' } };
    return { status: 200, data: { batch: { ...batch, journey: batch.checkpoints, blockchainVerification: { valid: true, checkpointCount: batch.checkpoints.length } } } };
  },

  'GET /qr/:batchId': (_, token, params) => {
    const batch = store.batches.find(b => b.batchId === params.id || b.batchId === params.batchId);
    const svg = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="white"/><rect x="20" y="20" width="60" height="60" fill="none" stroke="black" stroke-width="4"/><rect x="30" y="30" width="40" height="40" fill="black"/><rect x="120" y="20" width="60" height="60" fill="none" stroke="black" stroke-width="4"/><rect x="130" y="30" width="40" height="40" fill="black"/><rect x="20" y="120" width="60" height="60" fill="none" stroke="black" stroke-width="4"/><rect x="30" y="130" width="40" height="40" fill="black"/><text x="100" y="115" text-anchor="middle" font-size="9" fill="black">AgriTrace QR</text></svg>`)}`;
    return { status: 200, data: { qrCode: svg, batchId: params.id } };
  },

  'GET /dashboard': (_, token) => {
    const decoded = decodeToken(token);
    const user = decoded && store.users.find(u => u._id === decoded.id);
    if (!user) return { status: 401, data: { message: 'Unauthorized' } };
    const myBatches = store.batches.filter(b => user.role === 'farmer' ? b.farmer._id === user._id : true);
    const stats = user.role === 'farmer'
      ? { totalBatches: myBatches.length, activeBatches: myBatches.filter(b=>b.status==='active').length, soldBatches: myBatches.filter(b=>b.currentStage==='sold').length, recalledBatches: 0, avgIntegrity: 98, recentBatches: myBatches.slice(0, 5) }
      : user.role === 'admin'
      ? { totalBatches: store.batches.length, totalUsers: store.users.length - 1, activeBatches: store.batches.filter(b=>b.status==='active').length, recalls: 0, byStage: [] }
      : { myCheckpoints: 3, pending: 2 };
    return { status: 200, data: { stats, role: user.role } };
  },
};

// ── Route matcher ─────────────────────────────────────────────────────────────
function matchRoute(method, path) {
  for (const [pattern, handler] of Object.entries(handlers)) {
    const [pMethod, pPath] = pattern.split(' ');
    if (pMethod !== method) continue;
    const patParts = pPath.split('/');
    const urlParts = path.split('/');
    if (patParts.length !== urlParts.length) continue;
    const params = {};
    const match = patParts.every((p, i) => {
      if (p.startsWith(':')) { params[p.slice(1)] = urlParts[i]; return true; }
      return p === urlParts[i];
    });
    if (match) return { handler, params };
  }
  return null;
}

// ── Main mock request function ────────────────────────────────────────────────
export async function mockRequest(method, url, body) {
  await new Promise(r => setTimeout(r, 120)); // simulate latency
  const path = url.replace(/^\/api/, '');
  const token = localStorage.getItem('agritrace_token');
  const matched = matchRoute(method.toUpperCase(), path);
  if (!matched) return { status: 404, data: { message: `Mock: no handler for ${method} ${path}` } };
  return matched.handler(body || {}, token, matched.params);
}
