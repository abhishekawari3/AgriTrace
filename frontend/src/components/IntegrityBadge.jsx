import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

export default function IntegrityBadge({ score = 100, showLabel = true }) {
  const good = score >= 80;
  const warn = score >= 50 && score < 80;
  const Icon = good ? ShieldCheck : warn ? ShieldAlert : ShieldX;
  const cls  = good ? 'text-green-600 bg-green-50' : warn ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${cls}`}>
      <Icon size={13} />
      {showLabel && 'Integrity'} {score}/100
    </span>
  );
}
