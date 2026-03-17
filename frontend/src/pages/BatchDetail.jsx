import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StageTimeline from '../components/StageTimeline';
import IntegrityBadge from '../components/IntegrityBadge';
import toast from 'react-hot-toast';
import { QrCode, Plus, Download, Share2, ArrowLeft, Leaf, ShieldCheck } from 'lucide-react';

export default function BatchDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [qr, setQr]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/batches/${id}`)
      .then(r => setBatch(r.data.batch))
      .catch(() => toast.error('Batch not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const loadQR = async () => {
    if (qr) return;
    try {
      const { data } = await api.get(`/qr/${id}`);
      setQr(data.qrCode);
    } catch {
      toast.error('Could not generate QR');
    }
  };

  const downloadQR = () => {
    const a = document.createElement('a');
    a.href = qr;
    a.download = `agritrace-${id}.png`;
    a.click();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin h-8 w-8 rounded-full border-4 border-green-500 border-t-transparent" />
    </div>
  );
  if (!batch) return <div className="text-center py-16 text-gray-400">Batch not found.</div>;

  const canAddCheckpoint = ['farmer','processor','distributor','retailer'].includes(user.role)
    && batch.status === 'active';

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={15} /> Back
      </button>

      {/* Header */}
      <div className="card mb-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-green-50 rounded-xl">
              <Leaf size={24} className="text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{batch.productName}</h1>
              <p className="text-sm text-gray-500 capitalize">{batch.productType} · {batch.quantity} {batch.unit}
                {batch.variety ? ` · ${batch.variety}` : ''}
              </p>
              <p className="text-xs text-gray-400 font-mono mt-1 break-all">ID: {batch.batchId}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`badge-${batch.status} text-sm`}>{batch.status}</span>
            <IntegrityBadge score={batch.integrityScore} />
          </div>
        </div>

        {/* Key facts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
          {[
            { label: 'Farmer',       value: batch.farmer?.name },
            { label: 'Location',     value: batch.farmLocation },
            { label: 'Harvest Date', value: new Date(batch.harvestDate).toLocaleDateString('en-IN') },
            { label: 'Current Stage',value: batch.currentStage, capitalize: true },
          ].map(({ label, value, capitalize }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className={`text-sm font-semibold text-gray-800 ${capitalize ? 'capitalize' : ''}`}>{value || '—'}</p>
            </div>
          ))}
        </div>

        {/* Certifications */}
        {(batch.organicCertified || batch.certifications?.length > 0) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {batch.organicCertified && (
              <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                <ShieldCheck size={12} /> Organic Certified
              </span>
            )}
            {batch.certifications?.map(c => (
              <span key={c} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{c}</span>
            ))}
          </div>
        )}

        {/* Blockchain hash */}
        {batch.genesisHash && (
          <div className="mt-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-400 font-medium mb-0.5">Genesis Block Hash</p>
            <p className="text-xs font-mono text-gray-600 break-all">{batch.genesisHash}</p>
          </div>
        )}
      </div>

      {/* Journey Timeline */}
      <div className="card mb-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Supply Chain Journey</h2>
        <StageTimeline checkpoints={batch.checkpoints} currentStage={batch.currentStage} />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {canAddCheckpoint && (
          <Link to={`/checkpoint/${batch.batchId}`} className="btn-primary flex items-center justify-center gap-2 flex-1">
            <Plus size={16} /> Add Checkpoint
          </Link>
        )}
        <button onClick={loadQR} className="btn-secondary flex items-center justify-center gap-2 flex-1">
          <QrCode size={16} /> {qr ? 'Hide QR' : 'Show QR Code'}
        </button>
        <Link to={`/track/${batch.batchId}`} target="_blank"
          className="btn-secondary flex items-center justify-center gap-2 flex-1">
          <Share2 size={16} /> Public View
        </Link>
      </div>

      {/* QR Code panel */}
      {qr && (
        <div className="card mt-4 flex flex-col items-center gap-3">
          <p className="text-sm font-medium text-gray-700">Scan to verify journey</p>
          <img src={qr} alt="QR Code" className="w-48 h-48 rounded-lg border border-gray-200" />
          <button onClick={downloadQR} className="btn-secondary flex items-center gap-2 text-sm">
            <Download size={15} /> Download QR
          </button>
        </div>
      )}
    </div>
  );
}
