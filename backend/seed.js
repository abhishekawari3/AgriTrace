/**
 * seed.js — Run once to create demo accounts
 * Usage: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/agritrace';

const DEMO_USERS = [
  {
    name: 'Ramesh Kumar',
    email: 'farmer@demo.com',
    password: 'demo1234',
    role: 'farmer',
    profile: { farmName: 'Green Valley Farm', farmLocation: 'Nashik, Maharashtra', farmSize: '12' }
  },
  {
    name: 'Aarti Foods Pvt Ltd',
    email: 'processor@demo.com',
    password: 'demo1234',
    role: 'processor',
    profile: { licenseNo: 'FSSAI-12345678', address: 'Pune, Maharashtra', phone: '+91 98765 43210' }
  },
  {
    name: 'FastMove Logistics',
    email: 'distributor@demo.com',
    password: 'demo1234',
    role: 'distributor',
    profile: { licenseNo: 'DL-MH-00123', address: 'Mumbai, Maharashtra', phone: '+91 98765 43211' }
  },
  {
    name: 'FreshMart Retail',
    email: 'retailer@demo.com',
    password: 'demo1234',
    role: 'retailer',
    profile: { licenseNo: 'GSTIN-27AABCF1234', address: 'Andheri West, Mumbai', phone: '+91 98765 43212' }
  },
  {
    name: 'Super Admin',
    email: 'admin@demo.com',
    password: 'demo1234',
    role: 'admin',
    profile: {}
  }
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected to MongoDB');

  for (const userData of DEMO_USERS) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      console.log(`⏭   Skipping ${userData.email} (already exists)`);
      continue;
    }
    await User.create(userData);
    console.log(`✅  Created: ${userData.email} (${userData.role})`);
  }

  console.log('\n🌱  Seed complete. Demo credentials:\n');
  DEMO_USERS.forEach(u => console.log(`   ${u.role.padEnd(12)} ${u.email}  /  ${u.password}`));
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
