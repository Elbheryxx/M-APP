
import React, { useState, useEffect } from 'react';
import { Material } from '../types';
import { 
  Package, Search, AlertTriangle, TrendingDown, TrendingUp, 
  ArrowRightLeft, Filter, MoreVertical, Plus
} from 'lucide-react';

interface Props {
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
}

export function InventoryView({ materials, setMaterials }: Props) {
  const [search, setSearch] = useState('');

  const filtered = materials.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Inventory & WMS</h2>
          <p className="text-slate-500 font-medium">Monitor stock levels and warehouse operations</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <ArrowRightLeft size={18} />
            Stock Movement
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            <Plus size={18} />
            Add Stock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="relative flex-1 max-w-md">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                  type="text" 
                  placeholder="Filter materials by SKU or name..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                 />
               </div>
               <div className="flex items-center gap-2">
                 <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                   <Filter size={18} />
                 </button>
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Material & Category</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU Number</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Stock</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {filtered.map(m => (
                     <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-800">{m.name}</p>
                          <p className="text-xs font-medium text-slate-400">{m.category}</p>
                       </td>
                       <td className="px-6 py-4">
                          <code className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">{m.sku}</code>
                       </td>
                       <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-800">{m.stock} Units</span>
                       </td>
                       <td className="px-6 py-4">
                          {m.stock <= m.minLevel ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-full w-fit border border-red-100">
                              <AlertTriangle size={12} /> Low Stock
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full w-fit border border-emerald-100">
                              <TrendingUp size={12} /> Normal
                            </span>
                          )}
                       </td>
                       <td className="px-6 py-4 text-right">
                          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <MoreVertical size={18} />
                          </button>
                       </td>
                     </tr>
                   ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Stock Health</h3>
              <div className="space-y-6">
                 <div>
                   <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                     <span className="text-slate-400">Inventory Capacity</span>
                     <span className="text-blue-600">68%</span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 rounded-full" style={{width: '68%'}} />
                   </div>
                 </div>
                 <div>
                   <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                     <span className="text-slate-400">Reorder Velocity</span>
                     <span className="text-emerald-600">High</span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 rounded-full" style={{width: '85%'}} />
                   </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
