import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import IntegrityBadge from '../components/IntegrityBadge';
import { Plus, Search, Package, ChevronRight } from 'lucide-react';

const STAGE_LABEL = {
  farm: 'Farm', processing: 'Processing', distribution: 'Distribution', retail: 'Retail', sold: 'Sold'
};

export default function MyBatches() {
  const { user } = useAuth();
  const [batches, setBatches]   = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  useEffect(() => {
    api.get('/batches')
      .then(r => { setBatches(r.data.batches); setFiltered(r.data.batches); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let res = batches;
    if (search) res = res.filter(b =>
      b.productName.toLowerCase().includes(search.toLowerCase()) ||
      b.batchId.toLowerCase().includes(search.toLowerCase())
    );
    if (stageFilter !== 'all') res = res.filter(b => b.currentStage === stageFilter);
    setFiltered(res);
  }, [search, stageFilter, batches]);

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin h-8 w-8 rounded-full border-4 border-green-500 border-t-transparent" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
        {user.role === 'farmer' && (
          <Link to="/batches/new" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Batch
          </Link>
        )}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search by product name or batch ID…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input sm:w-48" value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
          <option value="all">All Stages</option>
          {Object.entries(STAGE_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No batches found</p>
          {user.role === 'farmer' && (
            <Link to="/batches/new" className="mt-3 inline-block text-green-600 hover:underline text-sm">Register your first batch →</Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <Link key={b._id} to={`/batches/${b.batchId}`}
              className="card hover:shadow-md hover:border-green-200 transition-all flex items-center gap-4 group">
              <div className="p-2.5 bg-green-50 rounded-xl">
                <Package size={22} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">{b.productName}</span>
                  {b.organicCertified && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Organic</span>}
                  <span className={`badge-${b.status}`}>{b.status}</span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {b.quantity} {b.unit} · {b.farmLocation} · Batch {b.batchId.slice(0,8)}…
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {b.checkpoints?.length || 0} checkpoints · Harvested {new Date(b.harvestDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                  {STAGE_LABEL[b.currentStage] || b.currentStage}
                </span>
                <IntegrityBadge score={b.integrityScore} showLabel={false} />
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-green-500 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
