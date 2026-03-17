import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import StageTimeline from '../components/StageTimeline';
import IntegrityBadge from '../components/IntegrityBadge';
import {
  Leaf, ShieldCheck, Calendar, MapPin, Package,
  Search, CheckCircle2, AlertTriangle, ExternalLink
} from 'lucide-react';

export default function TrackBatch() {
  const { batchId: paramId } = useParams();
  const [batchId, setBatchId] = useState(paramId === 'demo' ? '' : paramId || '');
  const [batch, setBatch]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (paramId && paramId !== 'demo') fetchBatch(paramId);
  }, [paramId]);

  const fetchBatch = async id => {
    if (!id) return;
    setLoading(true); setError('');
    try {
      const { data } = await axios.get(`/api/track/${id}`);
      setBatch(data.batch);
    } catch {
      setError('Batch not found. Please check the ID and try again.');
      setBatch(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = e => {
    e.preventDefault();
    fetchBatch(batchId.trim());
  };

  const scoreColor = s => s >= 80 ? 'text-green-600' : s >= 50 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-2xl mb-3">
          <Leaf size={28} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">AgriTrace Verification</h1>
        <p className="text-gray-500 text-sm mt-1">Scan a QR code or enter a Batch ID to trace your food's journey</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          className="input flex-1"
          placeholder="Enter Batch ID (e.g. 3e7a2b1c-…)"
          value={batchId}
          onChange={e => setBatchId(e.target.value)}
        />
        <button type="submit" disabled={loading} className="btn-primary px-5 flex items-center gap-2">
          <Search size={16} /> {loading ? '…' : 'Track'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm mb-4 flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {batch && (
        <div className="space-y-4">
          {/* Summary card */}
          <div className="card">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-green-50 rounded-xl">
                  <Package size={22} className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{batch.productName}</h2>
                  <p className="text-sm text-gray-500 capitalize">
                    {batch.productType} · {batch.quantity} {batch.unit}
                    {batch.variety ? ` · ${batch.variety}` : ''}
                  </p>
                </div>
              </div>
              <IntegrityBadge score={batch.integrityScore} />
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-4 pt-4 border-t border-gray-100 text-sm">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Origin</p>
                  <p className="font-medium text-gray-800">{batch.farmer?.location || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar size={15} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Harvested</p>
                  <p className="font-medium text-gray-800">{new Date(batch.harvestDate).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Leaf size={15} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Farmer</p>
                  <p className="font-medium text-gray-800">{batch.farmer?.name || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck size={15} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Organic</p>
                  <p className="font-medium text-gray-800">{batch.organicCertified ? 'Yes ✅' : 'No'}</p>
                </div>
              </div>
            </div>

            {/* Certifications */}
            {batch.certifications?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {batch.certifications.map(c => (
                  <span key={c} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{c}</span>
                ))}
              </div>
            )}
          </div>

          {/* Blockchain verification */}
          <div className="card border-green-200 bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={18} className="text-green-600" />
              <span className="font-semibold text-green-800 text-sm">Blockchain Verified</span>
            </div>
            <p className="text-xs text-green-700">
              This product's journey has been recorded on an immutable blockchain ledger.
              {batch.journey?.length} checkpoints verified across the supply chain.
            </p>
            <p className="text-xs font-mono text-green-700 mt-2 break-all opacity-70">
              Genesis: {batch.genesisHash}
            </p>
          </div>

          {/* Journey timeline */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Full Journey</h3>
            <StageTimeline checkpoints={batch.journey} currentStage={batch.currentStage} />
          </div>
        </div>
      )}

      {/* Landing state */}
      {!batch && !loading && !error && (
        <div className="text-center py-12 text-gray-400">
          <Search size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Enter a Batch ID above or scan a QR code from your product packaging</p>
        </div>
      )}

      <div className="text-center mt-8">
        <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1">
          <ExternalLink size={12} /> Powered by AgriTrace
        </Link>
      </div>
    </div>
  );
}
