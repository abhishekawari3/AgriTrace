import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatCard from '../components/StatCard';
import {
  Package, CheckCircle, AlertTriangle, Users, BarChart2,
  Plus, ScanLine, Leaf, ArrowRight, ShieldCheck
} from 'lucide-react';

function RoleBanner({ role }) {
  const msgs = {
    farmer:      { title: 'Register your harvest', sub: 'Create a new batch to start tracking your produce on the blockchain.', action: '/batches/new', label: 'Register Batch' },
    processor:   { title: 'Log processing activity', sub: 'Add a checkpoint for batches entering your processing facility.', action: '/batches', label: 'View Batches' },
    distributor: { title: 'Track distribution', sub: 'Update checkpoint data as produce moves through your network.', action: '/batches', label: 'View Batches' },
    retailer:    { title: 'Verify produce origin', sub: 'Check the full journey of any batch before stocking your shelves.', action: '/batches', label: 'View Batches' },
    admin:       { title: 'System Overview', sub: 'Monitor all supply chain activity across the platform.', action: '/batches', label: 'All Batches' },
    consumer:    { title: 'Verify your food', sub: 'Scan a QR code or enter a batch ID to see the full journey.', action: '#', label: 'Scan QR' }
  };
  const m = msgs[role] || msgs.consumer;
  return (
    <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-green-100 text-sm font-medium mb-1 capitalize">{role} Portal</p>
          <h2 className="text-xl font-bold">{m.title}</h2>
          <p className="text-green-100 text-sm mt-1 max-w-md">{m.sub}</p>
        </div>
        <Link to={m.action} className="flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-green-50 transition-colors">
          {m.label} <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setStats(r.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin h-8 w-8 rounded-full border-4 border-green-500 border-t-transparent" />
    </div>
  );

  return (
    <div>
      <RoleBanner role={user.role} />

      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {user.role === 'farmer' && <>
            <StatCard label="Total Batches"    value={stats.totalBatches}    icon={Package}      color="green" />
            <StatCard label="Active"           value={stats.activeBatches}   icon={CheckCircle}  color="blue" />
            <StatCard label="Sold"             value={stats.soldBatches}     icon={ShieldCheck}  color="purple" />
            <StatCard label="Avg Integrity"    value={`${stats.avgIntegrity}%`} icon={BarChart2} color={stats.avgIntegrity >= 80 ? 'green' : 'amber'} />
          </>}
          {user.role === 'admin' && <>
            <StatCard label="Total Batches"    value={stats.totalBatches}    icon={Package}      color="green" />
            <StatCard label="Registered Users" value={stats.totalUsers}      icon={Users}        color="blue" />
            <StatCard label="Active Batches"   value={stats.activeBatches}   icon={CheckCircle}  color="purple" />
            <StatCard label="Recalls"          value={stats.recalls}         icon={AlertTriangle} color="red" />
          </>}
          {['processor','distributor','retailer'].includes(user.role) && <>
            <StatCard label="My Checkpoints"   value={stats.myCheckpoints ?? '—'} icon={CheckCircle} color="green" />
            <StatCard label="Pending Batches"  value={stats.pending ?? '—'}       icon={Package}     color="blue" />
          </>}
        </div>
      )}

      {/* Quick actions */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {user.role === 'farmer' && (
            <Link to="/batches/new" className="card hover:border-green-300 hover:shadow-md transition-all flex items-center gap-3 group">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Plus size={20} className="text-green-700" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Register Batch</p>
                <p className="text-xs text-gray-500">Add new produce to blockchain</p>
              </div>
            </Link>
          )}
          <Link to="/batches" className="card hover:border-green-300 hover:shadow-md transition-all flex items-center gap-3 group">
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Package size={20} className="text-blue-700" />
            </div>
            <div>
              <p className="font-medium text-gray-800">View Batches</p>
              <p className="text-xs text-gray-500">Browse supply chain records</p>
            </div>
          </Link>
          <Link to="/track/demo" className="card hover:border-green-300 hover:shadow-md transition-all flex items-center gap-3 group">
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <ScanLine size={20} className="text-purple-700" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Track Produce</p>
              <p className="text-xs text-gray-500">Verify journey by batch ID</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent batches (farmer) */}
      {user.role === 'farmer' && stats?.recentBatches?.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-3">Recent Batches</h3>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Product</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Qty</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Stage</th>
                  <th className="text-left py-2 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBatches.map(b => (
                  <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 pr-4 font-medium">
                      <Link to={`/batches/${b.batchId}`} className="text-green-700 hover:underline">{b.productName}</Link>
                    </td>
                    <td className="py-2 pr-4 text-gray-600">{b.quantity} {b.unit}</td>
                    <td className="py-2 pr-4 capitalize text-gray-600">{b.currentStage}</td>
                    <td className="py-2">
                      <span className={`badge-${b.status}`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
