# 🌿 AgriTrace
### Blockchain-Based Agricultural Supply Chain Transparency System
*Smart India Hackathon 2025 — Problem Statement #25045*
*Team: Code Agronauts | Theme: Agriculture, FoodTech & Rural Development*

---

## 📖 Overview

AgriTrace is a full-stack MERN application that brings **end-to-end transparency** to agricultural supply chains using blockchain technology. Every batch of produce — from the moment a farmer harvests it to the moment a consumer buys it — is recorded as an **immutable, tamper-proof chain of checkpoints** anchored to the Ethereum blockchain.

Consumers can scan a **QR code** on any product and instantly verify:
- Where the crop was grown and by whom
- Every handler in the supply chain (processor → distributor → retailer)
- Real-time IoT data (temperature, humidity) at each stage
- An integrity score that degrades if quality checks are flagged or failed

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│  Login/Register · Dashboard · BatchList · QR View   │
└──────────────────────┬──────────────────────────────┘
                       │ REST API (axios)
┌──────────────────────▼──────────────────────────────┐
│              Express.js Backend (Node)               │
│  Auth · Batches · Checkpoints · Track · QR · Dashboard│
└──────┬───────────────────────────┬───────────────────┘
       │ mongoose                  │ blockchain/index.js
┌──────▼──────┐          ┌────────▼───────────────────┐
│  MongoDB    │          │   Ethereum Smart Contract   │
│  (batches,  │          │   AgriTrace.sol (Sepolia)   │
│   users)    │          │   (simulated in dev mode)   │
└─────────────┘          └────────────────────────────┘
```

---

## 🗂 Project Structure

```
agritrace/
├── backend/
│   ├── server.js               # Express entry point
│   ├── seed.js                 # Demo data seeder
│   ├── Dockerfile
│   ├── .env.example
│   ├── blockchain/
│   │   └── index.js            # Blockchain adapter (sim / ethers.js)
│   ├── middleware/
│   │   └── auth.js             # JWT + role-based access
│   ├── models/
│   │   ├── User.js             # 6 roles: farmer/processor/distributor/retailer/consumer/admin
│   │   └── Batch.js            # Core entity with embedded checkpoints
│   └── routes/
│       ├── auth.js             # POST /register, /login, GET /me
│       ├── batches.js          # CRUD for produce batches
│       ├── checkpoints.js      # POST checkpoint per actor role
│       ├── track.js            # Public consumer API (QR scan)
│       ├── qr.js               # QR code generation
│       └── dashboard.js        # Role-specific stats
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── main.jsx
│       ├── App.jsx             # Router setup
│       ├── index.css           # Tailwind + custom components
│       ├── utils/
│       │   └── api.js          # Axios instance with JWT interceptor
│       ├── context/
│       │   └── AuthContext.jsx # Global auth state
│       ├── components/
│       │   ├── Navbar.jsx      # Role badge + links
│       │   ├── StageTimeline.jsx # Visual supply chain journey
│       │   ├── StatCard.jsx
│       │   └── IntegrityBadge.jsx
│       └── pages/
│           ├── Login.jsx
│           ├── Register.jsx    # Role-aware sign-up form
│           ├── Dashboard.jsx   # Role-specific stats + quick actions
│           ├── RegisterBatch.jsx  # Farmer registers produce
│           ├── MyBatches.jsx   # List + search/filter
│           ├── BatchDetail.jsx # Full info + QR code download
│           ├── AddCheckpoint.jsx  # IoT data + quality status
│           ├── TrackBatch.jsx  # Public consumer journey view
│           └── NotFound.jsx
│
├── contracts/
│   └── AgriTrace.sol           # Solidity smart contract (Ethereum)
│
└── docker-compose.yml
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB 7 (local or Atlas)
- npm or yarn

### 1 — Clone & Install

```bash
git clone https://github.com/your-repo/agritrace.git
cd agritrace

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2 — Configure Environment

```bash
cd backend
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET
```

### 3 — Seed Demo Data

```bash
cd backend
node seed.js
```

This creates 5 demo accounts:

| Role        | Email                   | Password   |
|-------------|-------------------------|------------|
| Farmer      | farmer@demo.com         | demo1234   |
| Processor   | processor@demo.com      | demo1234   |
| Distributor | distributor@demo.com    | demo1234   |
| Retailer    | retailer@demo.com       | demo1234   |
| Admin       | admin@demo.com          | demo1234   |

### 4 — Run Dev Servers

```bash
# Terminal 1 — backend
cd backend && npm run dev    # http://localhost:5000

# Terminal 2 — frontend
cd frontend && npm run dev   # http://localhost:3000
```

---

## 🐳 Docker (Full Stack)

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

---

## 🔗 API Reference

### Auth
| Method | Endpoint            | Description               | Auth |
|--------|---------------------|---------------------------|------|
| POST   | /api/auth/register  | Register new user         | —    |
| POST   | /api/auth/login     | Login, returns JWT        | —    |
| GET    | /api/auth/me        | Get current user profile  | ✅   |
| PUT    | /api/auth/profile   | Update profile            | ✅   |

### Batches
| Method | Endpoint            | Description               | Roles           |
|--------|---------------------|---------------------------|-----------------|
| POST   | /api/batches        | Register new batch        | farmer, admin   |
| GET    | /api/batches        | List batches (role-scoped)| all             |
| GET    | /api/batches/:id    | Get batch details         | all             |
| DELETE | /api/batches/:id    | Delete batch              | admin           |

### Checkpoints
| Method | Endpoint                  | Description            | Roles                              |
|--------|---------------------------|------------------------|------------------------------------|
| POST   | /api/checkpoints/:batchId | Add stage checkpoint   | farmer, processor, distributor, retailer |

### Public Track
| Method | Endpoint          | Description                    | Auth |
|--------|-------------------|--------------------------------|------|
| GET    | /api/track/:id    | Public consumer journey lookup | —    |

### QR & Dashboard
| Method | Endpoint          | Description          | Auth |
|--------|-------------------|----------------------|------|
| GET    | /api/qr/:batchId  | Get QR code PNG      | ✅   |
| GET    | /api/dashboard    | Role-specific stats  | ✅   |

---

## ⛓ Smart Contract

### AgriTrace.sol — Key Functions

```solidity
// Farmer registers a batch (creates genesis block)
registerBatch(batchId, productName, productType, quantity, farmLocation, organicCertified)

// Supply chain actor logs a checkpoint
addCheckpoint(batchId, stage, location, notes, temperature, humidity, checkStatus)

// Read functions
getBatch(batchId)         → Batch struct
getCheckpoints(batchId)   → Checkpoint[]
getTotalBatches()         → uint256
```

### Deploy to Sepolia Testnet

```bash
npm install -g hardhat
cd contracts

# Compile
npx hardhat compile

# Deploy
npx hardhat run scripts/deploy.js --network sepolia
```

After deploying, update your `.env`:
```
CONTRACT_ADDRESS=0xYourDeployedAddress
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
DEPLOYER_PRIVATE_KEY=0xYourWalletKey
```

Then swap `backend/blockchain/index.js` with the `ethers.js` production adapter.

---

## 🌾 Supply Chain Flow

```
1. FARMER registers produce batch
   → Genesis block hash created on blockchain
   → QR code generated

2. PROCESSOR receives batch, adds checkpoint
   → Quality check status: Passed / Flagged / Rejected
   → IoT: temperature, humidity logged

3. DISTRIBUTOR logs transport checkpoint
   → Cold chain compliance recorded

4. RETAILER verifies and stocks produce
   → Final quality check recorded

5. CONSUMER scans QR code
   → Full journey visible at /track/:batchId
   → Blockchain verification shown
   → Integrity score displayed
```

---

## 👥 User Roles

| Role        | Capabilities                                                   |
|-------------|----------------------------------------------------------------|
| Farmer      | Register batches, view own batches, generate QR codes         |
| Processor   | View incoming batches, add processing checkpoints             |
| Distributor | View batches in transit, log distribution checkpoints         |
| Retailer    | View retail-stage batches, add retail checkpoints             |
| Consumer    | Public /track/:id page — no login required (via QR scan)     |
| Admin       | Full access — all batches, users, system stats                |

---

## 🛡 Security Features

- **JWT Authentication** — 7-day expiry, role-encoded
- **Role-Based Access Control** — every route enforces allowed roles
- **Rate Limiting** — 100 req / 15 min per IP on all /api routes
- **Input Validation** — express-validator on all POST routes
- **Password Hashing** — bcrypt with 12 salt rounds
- **Blockchain Immutability** — once written, checkpoints cannot be altered

---

## 🔭 Production Roadmap

- [ ] Swap simulated blockchain with real `ethers.js` contract calls
- [ ] IPFS storage for product images and documents
- [ ] Mobile app (React Native) with camera-based QR scanner
- [ ] AI anomaly detection on IoT sensor streams
- [ ] Multi-language support (Hindi, Marathi, Tamil)
- [ ] Government certification API integration (FSSAI, APEDA)
- [ ] Farmer wallet (gasless meta-transactions via Biconomy)
- [ ] Real-time IoT device SDK (Raspberry Pi / Arduino)

---

## 📚 References

Based on SIH 2025 Problem Statement #25045:

1. Adewusi, A. O. et al. (2023). *Blockchain in agriculture: Enhancing supply chain transparency and traceability.*
2. Kamilaris, A. et al. (2019). *The rise of blockchain technology in agriculture and food supply chains.*
3. Kshetri, N. (2018). *Blockchain's roles in supply chain management objectives.*
4. Nakamoto, S. (2008). *Bitcoin: A peer-to-peer electronic cash system.*
5. Zhao, G. et al. (2019). *Blockchain in agri-food value chain management.*

---

## 📄 License

MIT © Code Agronauts — Smart India Hackathon 2025
