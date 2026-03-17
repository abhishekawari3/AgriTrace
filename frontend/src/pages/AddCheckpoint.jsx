import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Link2, Thermometer, Droplets, MapPin, ArrowLeft } from 'lucide-react';

const STAGE_LABELS = {
  farmer: 'Farm', processor: 'Processing', distributor: 'Distribution', retailer: 'Retail'
};

export default function AddCheckpoint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [batch, setBatch] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    location: '', notes: '', temperature: '', humidity: '', status: 'passed'
  });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    api.get(`/batches/${id}`)
      .then(r => setBatch(r.data.batch))
      .catch(() => toast.error('Batch not found'));
  }, [id]);

  const handleSubmit = async e => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        location: form.location,
        notes: form.notes,
        status: form.status,
        temperature: form.temperature ? Number(form.temperature) : undefined,
        humidity:    form.humidity    ? Number(form.humidity)    : undefined
      };
      await api.post(`/checkpoints/${id}`, payload);
      toast.success('Checkpoint recorded on blockchain!');
      navigate(`/batches/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add checkpoint');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Link2 size={20} className="text-green-600" />
          Add {STAGE_LABELS[user.role] || 'Supply Chain'} Checkpoint
        </h1>
        {batch && (
          <p className="text-sm text-gray-500 mt-1">
            {batch.productName} · {batch.quantity} {batch.unit} · Batch {id.slice(0,8)}…
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* Location */}
        <div>
          <label className="label flex items-center gap-1"><MapPin size={13} className="text-gray-400" /> Location *</label>
          <input className="input" required value={form.location} onChange={set('location')}
            placeholder={user.role === 'processor' ? 'e.g. Pune Processing Unit' : user.role === 'distributor' ? 'e.g. Mumbai Cold Storage' : 'e.g. BigMart, Andheri West'} />
        </div>

        {/* IoT Sensor Data */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">IoT Sensor Data (optional)</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-1"><Thermometer size={13} className="text-gray-400" /> Temperature (°C)</label>
              <input className="input" type="number" step="0.1" value={form.temperature} onChange={set('temperature')} placeholder="e.g. 4.5" />
            </div>
            <div>
              <label className="label flex items-center gap-1"><Droplets size={13} className="text-gray-400" /> Humidity (%)</label>
              <input className="input" type="number" step="0.1" min="0" max="100" value={form.humidity} onChange={set('humidity')} placeholder="e.g. 65" />
            </div>
          </div>
        </div>

        {/* Quality Status */}
        <div>
          <label className="label">Quality Status *</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: 'passed',  label: '✅ Passed',  cls: 'border-green-400 bg-green-50 text-green-700' },
              { v: 'flagged', label: '⚠️ Flagged', cls: 'border-yellow-400 bg-yellow-50 text-yellow-700' },
              { v: 'rejected',label: '❌ Rejected', cls: 'border-red-400 bg-red-50 text-red-700' },
            ].map(({ v, label, cls }) => (
              <button key={v} type="button"
                onClick={() => setForm(f => ({ ...f, status: v }))}
                className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all
                  ${form.status === v ? cls : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {label}
              </button>
            ))}
          </div>
          {form.status === 'rejected' && (
            <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded-lg">
              ⚠️ Marking as Rejected will recall this batch from the supply chain.
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes / Observations</label>
          <textarea className="input resize-none" rows={3} value={form.notes} onChange={set('notes')}
            placeholder="Quality observations, storage conditions, vehicle no., etc." />
        </div>

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={busy} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Link2 size={16} /> {busy ? 'Recording on chain…' : 'Record Checkpoint'}
          </button>
        </div>
      </form>
    </div>
  );
}
