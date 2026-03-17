import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Leaf, LogIn } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  // Demo credentials helper
  const fill = (email, pw) => setForm({ email, password: pw });

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-2xl mb-3">
            <Leaf size={28} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sign in to AgriTrace</h1>
          <p className="text-gray-500 text-sm mt-1">Track your agricultural supply chain</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" required
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={busy} className="btn-primary w-full flex items-center justify-center gap-2">
              <LogIn size={16} /> {busy ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-600 font-medium hover:underline">Register</Link>
          </p>
        </div>

        {/* Demo quick-fill */}
        <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
          <p className="text-xs font-semibold text-amber-700 mb-2">Demo Accounts (click to fill)</p>
          <div className="flex flex-wrap gap-2">
            {[
              { role: 'Farmer',      email: 'farmer@demo.com',      pw: 'demo1234' },
              { role: 'Processor',   email: 'processor@demo.com',   pw: 'demo1234' },
              { role: 'Distributor', email: 'distributor@demo.com', pw: 'demo1234' },
              { role: 'Retailer',    email: 'retailer@demo.com',    pw: 'demo1234' },
              { role: 'Admin',       email: 'admin@demo.com',       pw: 'demo1234' },
            ].map(({ role, email, pw }) => (
              <button key={role} onClick={() => fill(email, pw)}
                className="text-xs bg-white border border-amber-200 text-amber-700 px-2 py-1 rounded-md hover:bg-amber-100 transition-colors">
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
