import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar        from './components/Navbar';
import MockBanner    from './components/MockBanner';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Dashboard     from './pages/Dashboard';
import RegisterBatch from './pages/RegisterBatch';
import MyBatches     from './pages/MyBatches';
import BatchDetail   from './pages/BatchDetail';
import AddCheckpoint from './pages/AddCheckpoint';
import TrackBatch    from './pages/TrackBatch';
import NotFound      from './pages/NotFound';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 rounded-full border-4 border-green-500 border-t-transparent"/>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <MockBanner />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/"          element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/register"  element={<Register />} />
          <Route path="/track/:batchId" element={<TrackBatch />} />

          <Route path="/dashboard"       element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/batches"         element={<PrivateRoute><MyBatches /></PrivateRoute>} />
          <Route path="/batches/new"     element={<PrivateRoute><RegisterBatch /></PrivateRoute>} />
          <Route path="/batches/:id"     element={<PrivateRoute><BatchDetail /></PrivateRoute>} />
          <Route path="/checkpoint/:id"  element={<PrivateRoute><AddCheckpoint /></PrivateRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Toaster position="top-right" />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
