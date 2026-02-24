
import React, { useMemo, useState } from 'react';
import { MaintenanceRequest, RequestStatus } from '../types';
import { 
  ArrowLeft, Search, Filter, Calendar, 
  Building as BuildingIcon, MapPin, 
  MoreHorizontal, Download, CheckCircle2, Clock, AlertCircle,
  ChevronUp, ChevronDown, ChevronRight, X, DollarSign, Tag, Phone, Eye, 
  ImageIcon, Sparkles, User as UserIcon, CheckCircle, Receipt
} from 'lucide-react';

const WhatsAppLogo = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface Props {
  type: string;
  title: string;
  requests: MaintenanceRequest[];
  onBack: () => void;
}

type SortKey = 'requestNo' | 'createdAt' | 'totalCost' | 'status';

export function FocusedListView({ type, title, requests, onBack }: Props) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJobId, setFilterJobId] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterMinBudget, setFilterMinBudget] = useState('');
  const [filterMaxBudget, setFilterMaxBudget] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: 'asc' | 'desc' }>({
    key: 'createdAt',
    direction: 'desc'
  });

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const filteredAndSortedData = useMemo(() => {
    let base = [...requests];

    if (type === 'STATUS_COMPLETED' || type === 'COMPLETED') {
      base = base.filter(r => r.status === 'Completed');
    } else if (type === 'STATUS_PENDING' || type === 'IN_PROGRESS') {
      base = base.filter(r => r.status !== 'Completed' && r.status !== 'Rejected');
    } else if (type === 'STATUS_REJECTED' || type === 'REJECTED') {
      base = base.filter(r => r.status === 'Rejected');
    }
    else if (type === 'PRIORITY_HIGH') base = base.filter(r => r.priority === 'High');
    else if (type === 'PRIORITY_MEDIUM') base = base.filter(r => r.priority === 'Medium');
    else if (type === 'PRIORITY_LOW') base = base.filter(r => r.priority === 'Low');

    return base.filter(r => {
      const matchSearch = searchTerm === '' || 
        r.requestNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.building.toLowerCase().includes(searchTerm.toLowerCase());

      const matchJobId = filterJobId === '' || r.requestNo.toLowerCase().includes(filterJobId.toLowerCase());
      const matchLocation = filterLocation === '' || 
        r.building.toLowerCase().includes(filterLocation.toLowerCase()) || 
        r.unit.toLowerCase().includes(filterLocation.toLowerCase());
      
      const matchStatus = filterStatus === 'All' || r.status === filterStatus;
      
      const budget = r.totalCost;
      const matchMinBudget = filterMinBudget === '' || budget >= parseFloat(filterMinBudget);
      const matchMaxBudget = filterMaxBudget === '' || budget <= parseFloat(filterMaxBudget);

      const date = new Date(r.createdAt).getTime();
      const matchStartDate = filterStartDate === '' || date >= new Date(filterStartDate).getTime();
      const matchEndDate = filterEndDate === '' || date <= new Date(filterEndDate).getTime();

      return matchSearch && matchJobId && matchLocation && matchStatus && matchMinBudget && matchMaxBudget && matchStartDate && matchEndDate;
    }).sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      if (sortConfig.key === 'totalCost') {
        return (a.totalCost - b.totalCost) * direction;
      }
      if (sortConfig.key === 'createdAt') {
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction;
      }
      return a[sortConfig.key].localeCompare(b[sortConfig.key]) * direction;
    });
  }, [type, requests, searchTerm, filterJobId, filterLocation, filterStatus, filterMinBudget, filterMaxBudget, filterStartDate, filterEndDate, sortConfig]);

  const selectedReq = useMemo(() => 
    requests.find(r => r.id === selectedRequestId), 
    [selectedRequestId, requests]
  );

  const aiData = useMemo(() => {
    if (!selectedReq?.aiAnalysis) return null;
    try { return JSON.parse(selectedReq.aiAnalysis); } catch { return null; }
  }, [selectedReq]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterJobId('');
    setFilterLocation('');
    setFilterStatus('All');
    setFilterMinBudget('');
    setFilterMaxBudget('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const SortIndicator = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <ChevronUp size={12} className="opacity-20" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={12} className="text-blue-600" /> : <ChevronDown size={12} className="text-blue-600" />;
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in" onClick={() => setLightboxImage(null)}>
           <button className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full transition-colors"><X size={32} /></button>
           <img src={lightboxImage} className="max-w-full max-h-full rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Detail Overlay Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 md:p-10 animate-in fade-in">
           <div className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-500">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900">{selectedReq.requestNo}</h3>
                    <p className="text-xs font-bold text-slate-400">Operational Detail View</p>
                 </div>
                 <button onClick={() => setSelectedRequestId(null)} className="p-3 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                    <X size={24} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-8">
                       {/* Project Financials */}
                       <section className="bg-white border-2 border-slate-100 p-6 rounded-[2rem] shadow-sm">
                          <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <Receipt size={14} /> Comprehensive Financial Breakdown
                          </h4>
                          <div className="space-y-4">
                             <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Deployed Assets (Materials)</p>
                                {selectedReq.materialsRequested.length > 0 ? (
                                  <div className="space-y-1.5">
                                    {selectedReq.materialsRequested.map((m, idx) => (
                                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2">
                                          <Tag size={12} className="text-slate-400" />
                                          <span className="text-sm font-bold text-slate-700">{m.name}</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{m.cost} AED</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs font-bold text-slate-400 italic bg-slate-50 p-3 rounded-xl">No materials registered for this job.</p>
                                )}
                             </div>
                             
                             <div className="flex justify-between items-center py-3 border-t border-slate-100">
                                <span className="text-sm font-bold text-slate-500">Labor / Service Fee</span>
                                <span className="text-sm font-black text-slate-900">{selectedReq.laborCost} AED</span>
                             </div>

                             <div className="flex justify-between items-center p-4 bg-slate-900 rounded-2xl text-white shadow-lg shadow-slate-200">
                                <span className="text-sm font-black uppercase tracking-wider">Final Invoice Amount</span>
                                <span className="text-xl font-black">{selectedReq.totalCost} AED</span>
                             </div>
                          </div>
                       </section>

                       {/* Contact & Location */}
                       <section className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <UserIcon size={14} /> Tenant Contact Details
                          </h4>
                          <div className="flex items-center justify-between">
                             <div>
                                <p className="text-lg font-black text-slate-900">{selectedReq.tenantName}</p>
                                <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                                   <BuildingIcon size={12}/> {selectedReq.building} · Unit {selectedReq.unit}
                                </p>
                             </div>
                             <div className="flex gap-2">
                                <a href={`tel:${selectedReq.tenantPhone}`} className="p-3 bg-white border border-slate-200 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors shadow-sm">
                                   <Phone size={18} />
                                </a>
                                <a href={`https://wa.me/${selectedReq.tenantPhone.replace(/\D/g,'')}`} target="_blank" className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-sm">
                                   <WhatsAppLogo size={18} />
                                </a>
                             </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-slate-200/50">
                             <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Original Issue Report</p>
                             <p className="text-sm font-medium text-slate-600 italic">"{selectedReq.description}"</p>
                          </div>
                       </section>

                       {/* Photos Before/After */}
                       <div className="grid grid-cols-2 gap-4">
                          <section>
                             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <ImageIcon size={14} /> Assessment (Before)
                             </h4>
                             <div className="grid grid-cols-1 gap-3">
                                {selectedReq.assessmentPhotos.map((p, i) => (
                                   <div key={i} className="group relative rounded-2xl overflow-hidden aspect-video border border-slate-100 cursor-zoom-in" onClick={() => setLightboxImage(p)}>
                                      <img src={p} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                         <Eye className="text-white" />
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </section>
                          <section>
                             <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <CheckCircle size={14} /> Verification (After)
                             </h4>
                             <div className="grid grid-cols-1 gap-3">
                                {selectedReq.completionPhotos.length > 0 ? (
                                   selectedReq.completionPhotos.map((p, i) => (
                                      <div key={i} className="group relative rounded-2xl overflow-hidden aspect-video border border-emerald-100 cursor-zoom-in" onClick={() => setLightboxImage(p)}>
                                         <img src={p} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                         <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Eye className="text-white" />
                                         </div>
                                      </div>
                                   ))
                                ) : (
                                   <div className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                                      <Clock size={24} className="mb-1 opacity-20" />
                                      <p className="text-[10px] font-bold uppercase tracking-wider">No Final Proof</p>
                                   </div>
                                )}
                             </div>
                          </section>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Clock size={14} /> Service Lifecycle Log
                       </h4>
                       <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-px before:bg-slate-100">
                          {selectedReq.history.map((h, i) => (
                             <div key={h.id} className="relative pl-10">
                                <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`} />
                                <p className={`text-sm font-bold leading-tight ${i === 0 ? 'text-slate-900' : 'text-slate-500'}`}>{h.text}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">{new Date(h.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} · {new Date(h.createdAt).toLocaleDateString()}</p>
                             </div>
                          ))}
                       </div>
                       
                       <div className="pt-6 border-t border-slate-100">
                          <div className={`p-5 rounded-2xl flex justify-between items-center ${selectedReq.status === 'Completed' ? 'bg-emerald-50 text-emerald-900' : 'bg-blue-50 text-blue-900'}`}>
                             <div>
                                <p className="text-[10px] font-black uppercase opacity-60">Operational Status</p>
                                <p className="text-lg font-black flex items-center gap-2 uppercase">
                                   {selectedReq.status === 'Completed' ? <CheckCircle size={18}/> : <Clock size={18}/>}
                                   {selectedReq.status}
                                </p>
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] font-black uppercase opacity-60">Verified By</p>
                                <p className="text-sm font-bold">QA Section</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              Showing {filteredAndSortedData.length} records · <span className="text-blue-600 font-bold">Pipeline View</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button className="bg-white border border-slate-200 px-5 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 font-bold text-sm shadow-sm">
              <Download size={18} /> Export Data
           </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
         <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Search across all operational metrics..." 
                 className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/10"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="flex items-center gap-2 shrink-0">
               <button 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all border ${showAdvancedFilters ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
               >
                  <Filter size={18}/> {showAdvancedFilters ? 'Close Filters' : 'Filter Options'}
               </button>
            </div>
         </div>

         {showAdvancedFilters && (
           <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Order Number</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14}/>
                  <input value={filterJobId} onChange={e => setFilterJobId(e.target.value)} placeholder="REQ-XXXX" className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-blue-500/10"/>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Asset Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14}/>
                  <input value={filterLocation} onChange={e => setFilterLocation(e.target.value)} placeholder="Tower/Room/Unit..." className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-blue-500/10"/>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Lifecycle Stage</label>
                <select 
                  value={filterStatus} 
                  onChange={e => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
                >
                  <option value="All">All Stages</option>
                  <option value="New">New</option>
                  <option value="In Execution">In Execution</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cost Sensitivity (AED)</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={filterMinBudget} onChange={e => setFilterMinBudget(e.target.value)} placeholder="Min" className="w-1/2 px-3 py-2 bg-slate-50 rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-blue-500/10"/>
                  <input type="number" value={filterMaxBudget} onChange={e => setFilterMaxBudget(e.target.value)} placeholder="Max" className="w-1/2 px-3 py-2 bg-slate-50 rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-blue-500/10"/>
                </div>
              </div>
           </div>
         )}
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm flex flex-col">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr>
                     <th onClick={() => handleSort('requestNo')} className="px-6 py-5 cursor-pointer hover:bg-slate-100 transition-colors group">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Reference <SortIndicator column="requestNo" />
                        </div>
                     </th>
                     <th onClick={() => handleSort('createdAt')} className="px-6 py-5 cursor-pointer hover:bg-slate-100 transition-colors group">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Registration <SortIndicator column="createdAt" />
                        </div>
                     </th>
                     <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset Details</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operational Status</th>
                     <th onClick={() => handleSort('totalCost')} className="px-6 py-5 cursor-pointer hover:bg-slate-100 transition-colors group text-right">
                        <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Finance <SortIndicator column="totalCost" />
                        </div>
                     </th>
                     <th className="px-6 py-5"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredAndSortedData.map((r) => (
                    <tr 
                      key={r.id} 
                      onClick={() => setSelectedRequestId(r.id)}
                      className="group cursor-pointer hover:bg-blue-50/30 transition-colors border-l-4 border-l-transparent hover:border-l-blue-500"
                    >
                       <td className="px-6 py-4">
                          <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100">{r.requestNo}</span>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                             <Calendar size={12} className="text-slate-400" />
                             {new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex flex-col">
                             <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><BuildingIcon size={14} className="text-slate-400"/> {r.building}</span>
                             <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 ml-0.5"><MapPin size={12} className="text-slate-400"/> {r.unit}</span>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className={`text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 w-fit border uppercase tracking-wider ${
                             r.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                             r.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                             'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                             {r.status === 'Completed' ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                             {r.status}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-slate-900">{r.totalCost.toLocaleString()} <span className="text-[9px] text-slate-400 font-bold">AED</span></span>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <button className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                             <ChevronRight size={18} />
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
