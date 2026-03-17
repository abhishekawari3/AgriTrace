import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function MockBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if mock mode is active every second
    const interval = setInterval(() => {
      if (typeof window.__isMockMode === 'function' && window.__isMockMode()) {
        setShow(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!show) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-amber-800 text-sm">
        <AlertTriangle size={15} className="shrink-0 text-amber-500" />
        <span>
          <strong>Demo mode</strong> — backend not detected. Running with mock data.
          To use real data: <code className="bg-amber-100 px-1 rounded text-xs">cd backend && npm install && npm run dev</code>
        </span>
      </div>
      <button onClick={() => setShow(false)} className="shrink-0 text-amber-500 hover:text-amber-700">
        <X size={15} />
      </button>
    </div>
  );
}
