import React from 'react';

export default function StatCard({ label, value, icon: Icon, color = 'green', sub }) {
  const colors = {
    green:  'bg-green-50  text-green-700  border-green-100',
    blue:   'bg-blue-50   text-blue-700   border-blue-100',
    amber:  'bg-amber-50  text-amber-700  border-amber-100',
    red:    'bg-red-50    text-red-700    border-red-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    gray:   'bg-gray-50   text-gray-700   border-gray-200',
  };
  return (
    <div className={`rounded-xl border p-4 flex items-start gap-3 ${colors[color]}`}>
      {Icon && (
        <div className="p-2 rounded-lg bg-white/60 mt-0.5">
          <Icon size={20} />
        </div>
      )}
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm font-medium opacity-80">{label}</p>
        {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
