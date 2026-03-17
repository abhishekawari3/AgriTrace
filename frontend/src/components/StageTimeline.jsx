import React from 'react';
import { Sprout, Factory, Truck, Store, ShoppingBag, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';

const STAGES = [
  { key: 'farm',         label: 'Farm',         Icon: Sprout  },
  { key: 'processing',   label: 'Processing',   Icon: Factory },
  { key: 'distribution', label: 'Distribution', Icon: Truck   },
  { key: 'retail',       label: 'Retail',       Icon: Store   },
  { key: 'sold',         label: 'Consumer',     Icon: ShoppingBag }
];

const ORDER = ['farm','processing','distribution','retail','sold'];

function StatusIcon({ status }) {
  if (status === 'passed')   return <CheckCircle2 size={14} className="text-green-600" />;
  if (status === 'flagged')  return <AlertTriangle size={14} className="text-yellow-500" />;
  if (status === 'rejected') return <XCircle size={14} className="text-red-500" />;
  return null;
}

export default function StageTimeline({ checkpoints = [], currentStage }) {
  const completedStages = new Set(checkpoints.map(c => c.stage));
  const currentIdx = ORDER.indexOf(currentStage);

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-6 relative">
        <div className="absolute left-0 right-0 top-5 h-1 bg-gray-200 z-0" />
        <div
          className="absolute left-0 top-5 h-1 bg-green-500 z-0 transition-all duration-500"
          style={{ width: `${Math.min(100, (currentIdx / (ORDER.length - 1)) * 100)}%` }}
        />
        {STAGES.map(({ key, label, Icon }, i) => {
          const done    = completedStages.has(key);
          const current = key === currentStage;
          return (
            <div key={key} className="flex flex-col items-center z-10" style={{ width: '20%' }}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                ${done    ? 'bg-green-500 border-green-500 text-white'
                  : current ? 'bg-white border-green-500 text-green-600'
                  : 'bg-white border-gray-300 text-gray-400'}`}>
                <Icon size={18} />
              </div>
              <span className={`mt-1 text-xs font-medium text-center leading-tight
                ${done || current ? 'text-green-700' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Checkpoint cards */}
      {checkpoints.length > 0 && (
        <div className="space-y-3 mt-4">
          <h4 className="text-sm font-semibold text-gray-700">Journey Log</h4>
          {checkpoints.map((cp, i) => (
            <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
              <div className="flex-shrink-0 mt-0.5">
                <StatusIcon status={cp.status} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-medium capitalize text-gray-800">{cp.stage}</span>
                  <span className="text-xs text-gray-400">{new Date(cp.timestamp).toLocaleString('en-IN')}</span>
                </div>
                <div className="text-gray-600 mt-0.5">
                  <span className="capitalize">{cp.actorRole || cp.actor?.role}</span>
                  {cp.actorName || cp.actor?.name ? ` · ${cp.actorName || cp.actor?.name}` : ''}
                  {cp.location ? ` · ${cp.location}` : ''}
                </div>
                {cp.notes && <p className="text-gray-500 text-xs mt-1 italic">{cp.notes}</p>}
                {(cp.temperature != null || cp.humidity != null) && (
                  <div className="flex gap-3 mt-1 text-xs text-blue-600">
                    {cp.temperature != null && <span>🌡 {cp.temperature}°C</span>}
                    {cp.humidity    != null && <span>💧 {cp.humidity}% RH</span>}
                  </div>
                )}
                {cp.txHash && (
                  <p className="text-xs text-gray-400 font-mono mt-1 truncate" title={cp.txHash}>
                    Tx: {cp.txHash.slice(0, 20)}…
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
