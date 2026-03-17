import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, LayoutDashboard, Package, LogOut, Menu, X, ScanLine } from 'lucide-react';

const ROLE_COLOR = {
  farmer:      'bg-green-100 text-green-800',
  processor:   'bg-blue-100 text-blue-800',
  distributor: 'bg-purple-100 text-purple-800',
  retailer:    'bg-orange-100 text-orange-800',
  consumer:    'bg-gray-100 text-gray-700',
  admin:       'bg-red-100 text-red-800'
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLink = (to, label, Icon) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${location.pathname.startsWith(to)
          ? 'bg-green-50 text-green-700'
          : 'text-gray-600 hover:bg-gray-100'}`}
    >
      <Icon size={16} />{label}
    </Link>
  );

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-green-700 text-lg">
            <Leaf size={22} className="text-green-600" />
            AgriTrace
          </Link>

          {/* Desktop nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLink('/dashboard', 'Dashboard', LayoutDashboard)}
              {navLink('/batches', 'Batches', Package)}
            </div>
          )}

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${ROLE_COLOR[user.role]}`}>
                  {user.role}
                </span>
                <span className="text-sm text-gray-700 font-medium">{user.name}</span>
                <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login"    className="btn-secondary text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Register</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setOpen(o => !o)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 space-y-1">
          {user ? (
            <>
              {navLink('/dashboard', 'Dashboard', LayoutDashboard)}
              {navLink('/batches',   'Batches',   Package)}
              <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 w-full">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="block px-3 py-2 text-sm" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" className="block px-3 py-2 text-sm" onClick={() => setOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
