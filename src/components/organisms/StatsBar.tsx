import React from 'react';
import type { Stats } from '../../types/catalog';

const items = (stats: Stats) => [
  { label: 'Products', value: String(stats.total_products) },
  { label: 'Categories', value: String(stats.total_categories) },
  { label: 'Average price', value: `$${Number(stats.average_price).toFixed(2)}` },
  { label: 'Inventory value', value: `$${Number(stats.inventory_value).toFixed(2)}` },
];

export const StatsBar: React.FC<{ stats: Stats | null }> = ({ stats }) => (
  <section aria-label="Catalog statistics" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    {(stats ? items(stats) : items({ total_products: 0, total_categories: 0, average_price: 0, inventory_value: 0 })).map((item) => (
      <div key={item.label} className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-left shadow-sm">
        <p className="text-xs font-semibold text-[#4E878C] uppercase tracking-wide">{item.label}</p>
        <p className="text-2xl font-bold text-[#00241B] mt-1">{stats ? item.value : '—'}</p>
      </div>
    ))}
  </section>
);
