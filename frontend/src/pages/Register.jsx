import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Leaf, UserPlus } from 'lucide-react';

const ROLES = ['farmer','processor','distributor','retailer','consumer'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'farmer',
    farmName: '', farmLocation: '', phone: '', licenseNo: ''
  });
  const [busy, setBusy] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword)
      return toast.error('Passwords do not match');
    setBusy(true);
    try {
      await register({
        name: form.name, email: form.email, password: form.password, role: form.role,
        profile: {
          farmName:     form.farmName,
          farmLocation: form.farmLocation,
          phone:        form.phone,
          licenseNo:    form.licenseNo
        }
      });
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-2xl mb-3">
            <Leaf size={28} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Create your AgriTrace account</h1>
          <p className="text-gray-500 text-sm mt-1">Join the transparent supply chain network</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="label">Full Name</label>
                <input className="input" required value={form.name} onChange={set('name')} placeholder="Ramesh Kumar" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="label">Role</label>
                <select className="input" value={form.role} onChange={set('role')}>
                  {ROLES.map(r => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" required minLength={6} value={form.password} onChange={set('password')} placeholder="Min. 6 characters" />
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input className="input" type="password" required value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat password" />
              </div>
            </div>

            {/* Farmer-specific fields */}
            {form.role === 'farmer' && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Farm Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Farm Name</label>
                    <input className="input" value={form.farmName} onChange={set('farmName')} placeholder="e.g. Green Valley Farm" />
                  </div>
                  <div>
                    <label className="label">Farm Location</label>
                    <input className="input" value={form.farmLocation} onChange={set('farmLocation')} placeholder="e.g. Nashik, Maharashtra" />
                  </div>
                </div>
              </div>
            )}

            {['processor','distributor','retailer'].includes(form.role) && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Business Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">License / Reg. No.</label>
                    <input className="input" value={form.licenseNo} onChange={set('licenseNo')} placeholder="FSSAI / GST no." />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input className="input" value={form.phone} onChange={set('phone')} placeholder="+91 99999 99999" />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={busy} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              <UserPlus size={16} /> {busy ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
