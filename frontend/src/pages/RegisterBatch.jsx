import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Leaf, Link2 } from 'lucide-react';

const TYPES = ['grain','vegetable','fruit','dairy','spice','oilseed','pulse','other'];
const UNITS = ['kg','quintal','tonne','litre','dozen'];

export default function RegisterBatch() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    productName: '', productType: 'grain', quantity: '', unit: 'kg',
    variety: '', harvestDate: '', expiryDate: '',
    farmLocation: '', description: '', organicCertified: false,
    certifications: ''
  });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        certifications: form.certifications ? form.certifications.split(',').map(s => s.trim()) : []
      };
      const { data } = await api.post('/batches', payload);
      toast.success('Batch registered on blockchain!');
      navigate(`/batches/${data.batch.batchId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to register batch');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Leaf size={22} className="text-green-600" /> Register New Batch
        </h1>
        <p className="text-gray-500 text-sm mt-1">This will create an immutable record on the blockchain.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* Product Info */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Product Information</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Product Name *</label>
              <input className="input" required value={form.productName} onChange={set('productName')} placeholder="e.g. Basmati Rice" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Product Type *</label>
              <select className="input" value={form.productType} onChange={set('productType')}>
                {TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Quantity *</label>
              <input className="input" type="number" required min="0.1" step="0.1" value={form.quantity} onChange={set('quantity')} placeholder="e.g. 500" />
            </div>
            <div>
              <label className="label">Unit</label>
              <select className="input" value={form.unit} onChange={set('unit')}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Variety / Grade</label>
              <input className="input" value={form.variety} onChange={set('variety')} placeholder="e.g. 1121, Grade A" />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Dates</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Harvest Date *</label>
              <input className="input" type="date" required value={form.harvestDate} onChange={set('harvestDate')} />
            </div>
            <div>
              <label className="label">Expiry / Best Before</label>
              <input className="input" type="date" value={form.expiryDate} onChange={set('expiryDate')} />
            </div>
          </div>
        </div>

        {/* Farm */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Origin</p>
          <div className="space-y-3">
            <div>
              <label className="label">Farm Location *</label>
              <input className="input" value={form.farmLocation} onChange={set('farmLocation')} placeholder="e.g. Nashik, Maharashtra" />
            </div>
            <div>
              <label className="label">Description / Notes</label>
              <textarea className="input resize-none" rows={3} value={form.description} onChange={set('description')} placeholder="Irrigation type, soil conditions, pesticide usage…" />
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Certifications</p>
          <div className="flex items-center gap-2 mb-3">
            <input id="organic" type="checkbox" checked={form.organicCertified} onChange={set('organicCertified')} className="h-4 w-4 text-green-600 rounded" />
            <label htmlFor="organic" className="text-sm text-gray-700">Organic Certified</label>
          </div>
          <div>
            <label className="label">Other Certifications (comma-separated)</label>
            <input className="input" value={form.certifications} onChange={set('certifications')} placeholder="e.g. FSSAI, ISO 22000, GlobalGAP" />
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={busy} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Link2 size={16} /> {busy ? 'Registering on chain…' : 'Register Batch'}
          </button>
        </div>
      </form>
    </div>
  );
}
