
import React, { useState, useMemo, useEffect } from 'react';
import { MaintenanceRequest, User, UserRole, RequestMaterial, Building, RequestStatus } from '../types';
import { 
  Plus, Building as BuildingIcon, MapPin, 
  Sparkles, X, Clock, Phone, User as UserIcon,
  Camera, Image as ImageIcon, CheckCircle, Ban, Archive,
  AlignLeft, Hash, Send, ChevronRight, AlertCircle, Eye, 
  Wrench, ShieldCheck, Box, ClipboardCheck, MessageCircle, ExternalLink,
  DollarSign, Tag, Receipt, Truck, Search
} from 'lucide-react';
import { analyzeMaintenanceRequest } from '../services/geminiService';

const WhatsAppLogo = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface Props {
  requests: MaintenanceRequest[];
  setRequests: React.Dispatch<React.SetStateAction<MaintenanceRequest[]>>;
  user: User;
  addNotification: (userId: number, title: string, body: string) => void;
  buildings: Building[];
  setBuildings: React.Dispatch<React.SetStateAction<Building[]>>;
  initialFilter?: string | null;
  autoOpenCreate?: boolean;
  onFormClose?: () => void;
}

export function RequestsView({ 
  requests, setRequests, user, addNotification, buildings, setBuildings, 
  initialFilter, autoOpenCreate, onFormClose 
}: Props) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('default');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  // Assessment form state
  const [assessmentForm, setAssessmentForm] = useState<{
    materials: { name: string; cost: number }[];
    laborCost: number;
    photos: string[];
    newMaterialName: string;
    newMaterialCost: string;
  }>({
    materials: [],
    laborCost: 0,
    photos: [],
    newMaterialName: '',
    newMaterialCost: ''
  });

  useEffect(() => {
    if (autoOpenCreate) setShowCreateForm(true);
  }, [autoOpenCreate]);

  useEffect(() => {
    if (user.role === UserRole.TECH) setActiveTab('assessment');
    else if (user.role === UserRole.RECEIVER) setActiveTab('active');
    else if (user.role === UserRole.MANAGER) setActiveTab('approval');
    else if (user.role === UserRole.STORE) setActiveTab('store');
    else if (user.role === UserRole.QA) setActiveTab('verification');
    else setActiveTab('all');
  }, [user.role]);

  const [formData, setFormData] = useState({
    building: '', unit: '', description: '',
    tenantName: '', tenantPhone: '',
    newBuildingName: '', newUnitNumber: ''
  });

  const filteredRequests = useMemo(() => {
    if (activeTab === 'completed') return requests.filter(r => r.status === 'Completed');
    if (activeTab === 'rejected') return requests.filter(r => r.status === 'Rejected');
    if (activeTab === 'all') return requests;

    switch(user.role) {
      case UserRole.TECH:
        if (activeTab === 'assessment') return requests.filter(r => ['Pending Assessment', 'Returned to Tech'].includes(r.status));
        if (activeTab === 'pickup') return requests.filter(r => r.status === 'Materials Ready');
        if (activeTab === 'execution') return requests.filter(r => r.status === 'In Execution');
        break;
      case UserRole.RECEIVER:
        if (activeTab === 'active') return requests.filter(r => !['Completed', 'Rejected'].includes(r.status));
        break;
      case UserRole.MANAGER:
        if (activeTab === 'approval') return requests.filter(r => r.status === 'Awaiting Approval');
        break;
      case UserRole.STORE:
        if (activeTab === 'store') return requests.filter(r => r.status === 'Approved - Awaiting Store');
        break;
      case UserRole.QA:
        if (activeTab === 'verification') return requests.filter(r => r.status === 'Pending Verification');
        break;
    }
    return requests;
  }, [requests, user.role, activeTab]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.building || !formData.unit || !formData.description) return alert("Fill all fields");

    setIsAnalyzing(true);
    let aiResult = "{}";
    try { 
      aiResult = await analyzeMaintenanceRequest(formData.description); 
    } catch (e) {}
    setIsAnalyzing(false);

    const newRequest: MaintenanceRequest = {
      id: Date.now(),
      requestNo: `REQ-${String(requests.length + 1).padStart(4, '0')}`,
      building: formData.building,
      unit: formData.unit,
      description: formData.description,
      tenantName: formData.tenantName || 'N/A',
      tenantPhone: formData.tenantPhone || 'N/A',
      status: 'Pending Assessment', // Direct transition to assessment
      createdAt: new Date().toISOString(),
      createdBy: user.name,
      createdById: user.id,
      priority: 'Medium',
      materialsRequested: [],
      laborCost: 0,
      totalCost: 0,
      history: [{ id: Date.now(), text: `New request created by ${user.name}. Needs assessment.`, createdAt: new Date().toISOString() }],
      aiAnalysis: aiResult,
      assessmentPhotos: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=600'],
      completionPhotos: []
    };

    setRequests([newRequest, ...requests]);
    addNotification(2, 'Job Assigned', `Action Required: Technical survey for unit ${formData.unit} in ${formData.building}`);
    handleCloseForm();
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setFormData({ building: '', unit: '', description: '', tenantName: '', tenantPhone: '', newBuildingName: '', newUnitNumber: '' });
    if (onFormClose) onFormClose();
  };

  useEffect(() => {
    // Reset assessment form when selected request changes
    setAssessmentForm({
      materials: [],
      laborCost: 0,
      photos: [],
      newMaterialName: '',
      newMaterialCost: ''
    });
  }, [selectedRequestId]);

  const handleAddMaterial = () => {
    if (!assessmentForm.newMaterialName || !assessmentForm.newMaterialCost) return;
    const cost = parseFloat(assessmentForm.newMaterialCost);
    if (isNaN(cost)) return;
    
    setAssessmentForm(prev => ({
      ...prev,
      materials: [...prev.materials, { name: prev.newMaterialName, cost }],
      newMaterialName: '',
      newMaterialCost: ''
    }));
  };

  const handleRemoveMaterial = (index: number) => {
    setAssessmentForm(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const handleAddPhoto = () => {
    // Simulate photo upload with a random unsplash image
    const randomPhotos = [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600'
    ];
    const photo = randomPhotos[Math.floor(Math.random() * randomPhotos.length)];
    setAssessmentForm(prev => ({
      ...prev,
      photos: [...prev.photos, photo]
    }));
  };

  const handleFinalizeAssessment = (id: number) => {
    const totalMatCost = assessmentForm.materials.reduce((sum, m) => sum + m.cost, 0);
    const totalCost = totalMatCost + assessmentForm.laborCost;
    
    updateStatus(id, 'Awaiting Approval', `Jaleel: Assessment submitted. Labor: ${assessmentForm.laborCost} AED, Materials: ${totalMatCost} AED.`, {
      laborCost: assessmentForm.laborCost,
      totalCost: totalCost,
      materialsRequested: assessmentForm.materials.map((m, i) => ({ id: Date.now() + i, name: m.name, cost: m.cost })),
      assessmentPhotos: [...(requests.find(r => r.id === id)?.assessmentPhotos || []), ...assessmentForm.photos]
    });
    
    // Reset form
    setAssessmentForm({
      materials: [],
      laborCost: 0,
      photos: [],
      newMaterialName: '',
      newMaterialCost: ''
    });
  };

  const updateStatus = (id: number, newStatus: RequestStatus, historyText: string, extra = {}) => {
    setRequests(prev => prev.map(r => r.id === id ? {
      ...r, 
      status: newStatus, 
      ...extra,
      history: [{ id: Date.now(), text: historyText, createdAt: new Date().toISOString() }, ...r.history]
    } : r));
    addNotification(1, 'Status Update', historyText);
  };

  const selectedReq = requests.find(r => r.id === selectedRequestId);
  
  const aiData = useMemo(() => {
    if (!selectedReq?.aiAnalysis) return null;
    try { return JSON.parse(selectedReq.aiAnalysis); } catch { return null; }
  }, [selectedReq]);

  const StatusTab = ({ active, label, onClick, count, icon: Icon }: any) => (
    <button onClick={onClick} className={`flex-1 py-4 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${active ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
      {Icon && <Icon size={14} />} {label} {count !== undefined && count > 0 && <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full text-[10px]">{count}</span>}
    </button>
  );

  return (
    <div className="space-y-6">
      {lightboxImage && (
        <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in" onClick={() => setLightboxImage(null)}>
           <button className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full transition-colors"><X size={32} /></button>
           <img src={lightboxImage} className="max-w-full max-h-full rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Operations Pipeline</h2>
          <p className="text-slate-500 font-medium italic">Integrated Facility Maintenance Workflow</p>
        </div>
        {user.role === UserRole.RECEIVER && (
          <button onClick={() => setShowCreateForm(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl hover:bg-blue-700 transition-all">
            <Plus size={20} /> New Request
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex shadow-sm">
        {user.role === UserRole.TECH && (
          <>
            <StatusTab active={activeTab === 'assessment'} label="Needs Assessment" onClick={() => setActiveTab('assessment')} icon={Search} />
            <StatusTab active={activeTab === 'pickup'} label="Material Pickup" onClick={() => setActiveTab('pickup')} icon={Truck} />
            <StatusTab active={activeTab === 'execution'} label="Execution Phase" onClick={() => setActiveTab('execution')} icon={Wrench} />
          </>
        )}
        {user.role === UserRole.RECEIVER && (
          <StatusTab active={activeTab === 'active'} label="Live Pipeline" onClick={() => setActiveTab('active')} icon={Send} />
        )}
        {user.role === UserRole.MANAGER && (
          <StatusTab active={activeTab === 'approval'} label="Approval Queue" onClick={() => setActiveTab('approval')} icon={ShieldCheck} />
        )}
        {user.role === UserRole.STORE && (
          <StatusTab active={activeTab === 'store'} label="Fulfillment" onClick={() => setActiveTab('store')} icon={Box} />
        )}
        {user.role === UserRole.QA && (
          <StatusTab active={activeTab === 'verification'} label="Quality Audit" onClick={() => setActiveTab('verification')} icon={ClipboardCheck} />
        )}
        <StatusTab active={activeTab === 'completed'} label="Archived History" onClick={() => setActiveTab('completed')} icon={Archive} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3 h-[calc(100vh-320px)] overflow-y-auto pr-2">
          {filteredRequests.map(r => (
            <div key={r.id} onClick={() => setSelectedRequestId(r.id)} className={`p-5 bg-white border rounded-[1.5rem] cursor-pointer transition-all ${selectedRequestId === r.id ? 'border-blue-500 ring-4 ring-blue-500/5 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 w-fit">{r.requestNo}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                    {user.role === UserRole.TECH && r.status === 'Pending Assessment' ? "URGENT ACTION: SURVEY" : `Stage: ${r.status}`}
                  </span>
                </div>
                <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${
                  r.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 
                  (r.status === 'Pending Assessment') ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-slate-50 text-slate-600'
                }`}>
                  {r.status === 'Pending Assessment' ? 'SURVEY REQ' : r.status}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800 mb-3 leading-tight line-clamp-2">{r.description}</p>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span className="flex items-center gap-1.5"><BuildingIcon size={12} /> {r.building}</span>
                <span className="flex items-center gap-1.5"><MapPin size={12} /> {r.unit}</span>
              </div>
            </div>
          ))}
          {filteredRequests.length === 0 && (
             <div className="py-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400">
               <Archive size={48} className="mx-auto mb-2 opacity-10" />
               <p className="italic font-medium text-xs">Queue is empty for this phase</p>
             </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedReq ? (
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm h-full overflow-y-auto relative animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{selectedReq.requestNo}</h3>
                  <p className="text-slate-400 font-bold text-xs mt-1">Operational ID · Created {new Date(selectedReq.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={`px-4 py-2 rounded-2xl border font-black text-[10px] flex items-center gap-2 uppercase tracking-widest ${
                  selectedReq.status === 'Completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-blue-50 border-blue-100 text-blue-600'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${selectedReq.status === 'Completed' ? 'bg-emerald-600' : 'bg-blue-600 animate-pulse'}`} />
                  {selectedReq.status}
                </div>
              </div>

              <div className="mb-10 p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                   <h4 className="font-black text-blue-400 uppercase tracking-[0.2em] text-[10px] mb-4 flex items-center gap-2">
                      <Sparkles size={14} /> Mission Control
                   </h4>
                   
                   {user.role === UserRole.TECH && (
                     <>
                        {['Pending Assessment', 'Returned to Tech'].includes(selectedReq.status) && (
                          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div className="bg-blue-600/20 border border-blue-500/30 p-6 rounded-[2rem] mb-4">
                               <p className="text-blue-100 font-bold text-lg leading-tight">
                                 <Sparkles className="inline-block mr-2 mb-1" size={20} />
                                 Technical Survey Required
                               </p>
                               <p className="text-blue-200/70 text-sm mt-1">
                                 Please document the site condition, list required materials, and provide a labor estimate to proceed.
                               </p>
                             </div>

                             <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-8 shadow-inner">
                               <div className="flex items-center justify-between">
                                 <h5 className="text-white font-black text-sm uppercase tracking-[0.2em] flex items-center gap-2">
                                   <ClipboardCheck size={18} className="text-blue-400" /> 
                                   Survey Documentation
                                 </h5>
                                 <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
                                   STEP 1: ASSESSMENT
                                 </span>
                               </div>
                               
                               <div className="space-y-6">
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                   <div className="space-y-3">
                                     <label className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2">
                                       <DollarSign size={12} /> Labor Estimate (AED)
                                     </label>
                                     <div className="relative">
                                       <input 
                                         type="number" 
                                         value={assessmentForm.laborCost || ''} 
                                         onChange={e => setAssessmentForm({...assessmentForm, laborCost: parseFloat(e.target.value) || 0})}
                                         className="w-full bg-white/10 border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-lg focus:ring-4 ring-blue-500/20 outline-none transition-all placeholder:text-white/20"
                                         placeholder="0.00"
                                       />
                                       <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30 font-bold">AED</span>
                                     </div>
                                   </div>
                                   <div className="space-y-3">
                                     <label className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2">
                                       <Camera size={12} /> Visual Evidence
                                     </label>
                                     <button 
                                       onClick={handleAddPhoto}
                                       className="w-full bg-blue-600/10 border-2 border-dashed border-blue-500/30 rounded-2xl px-6 py-4 text-blue-400 font-black hover:bg-blue-600/20 transition-all flex items-center justify-center gap-3 group"
                                     >
                                       <Camera size={20} className="group-hover:scale-110 transition-transform" /> 
                                       <span>Capture Site Photo</span>
                                     </button>
                                   </div>
                                 </div>

                                 {assessmentForm.photos.length > 0 && (
                                   <div className="flex gap-3 overflow-x-auto pb-4 pt-2 scrollbar-hide">
                                     {assessmentForm.photos.map((p, i) => (
                                       <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-white/10 shadow-xl group">
                                         <img src={p} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                         <button 
                                           onClick={() => setAssessmentForm(prev => ({...prev, photos: prev.photos.filter((_, idx) => idx !== i)}))}
                                           className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-xl shadow-lg hover:bg-red-600 transition-colors"
                                         >
                                           <X size={12} />
                                         </button>
                                       </div>
                                     ))}
                                   </div>
                                 )}

                                 <div className="space-y-4 pt-4 border-t border-white/5">
                                   <label className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2">
                                     <Box size={12} /> Material Requirements & Procurement
                                   </label>
                                   <div className="flex gap-3">
                                     <div className="flex-1 relative">
                                       <input 
                                         type="text" 
                                         placeholder="Item name (e.g. 10A Circuit Breaker)"
                                         value={assessmentForm.newMaterialName}
                                         onChange={e => setAssessmentForm({...assessmentForm, newMaterialName: e.target.value})}
                                         className="w-full bg-white/10 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-bold outline-none focus:ring-4 ring-blue-500/20 transition-all"
                                       />
                                     </div>
                                     <div className="w-32 relative">
                                       <input 
                                         type="number" 
                                         placeholder="Cost"
                                         value={assessmentForm.newMaterialCost}
                                         onChange={e => setAssessmentForm({...assessmentForm, newMaterialCost: e.target.value})}
                                         className="w-full bg-white/10 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-bold outline-none focus:ring-4 ring-blue-500/20 transition-all"
                                       />
                                     </div>
                                     <button 
                                       onClick={handleAddMaterial}
                                       className="bg-blue-600 text-white px-6 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/40 active:scale-95"
                                     >
                                       <Plus size={24} />
                                     </button>
                                   </div>

                                   <div className="space-y-3 mt-4">
                                     {assessmentForm.materials.map((m, i) => (
                                       <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10 animate-in slide-in-from-left-2 duration-300">
                                         <div className="flex items-center gap-3">
                                           <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                             <Tag size={14} className="text-blue-400" />
                                           </div>
                                           <span className="text-sm font-bold text-white/90">{m.name}</span>
                                         </div>
                                         <div className="flex items-center gap-4">
                                           <span className="text-sm font-black text-blue-400">{m.cost} AED</span>
                                           <button 
                                             onClick={() => handleRemoveMaterial(i)} 
                                             className="text-white/20 hover:text-red-400 transition-colors p-1"
                                           >
                                             <X size={18}/>
                                           </button>
                                         </div>
                                       </div>
                                     ))}
                                     {assessmentForm.materials.length === 0 && (
                                       <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                                         <p className="text-white/20 text-xs font-bold italic">No materials listed yet</p>
                                       </div>
                                     )}
                                   </div>
                                 </div>
                               </div>
                             </div>

                             <button 
                               onClick={() => handleFinalizeAssessment(selectedReq.id)} 
                               disabled={assessmentForm.laborCost <= 0 && assessmentForm.materials.length === 0}
                               className="w-full bg-blue-600 text-white px-8 py-6 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/60 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
                             >
                               <span>Submit Complete Assessment</span>
                               <ChevronRight size={24} />
                             </button>
                          </div>
                        )}
                        {selectedReq.status === 'Materials Ready' && (
                           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2rem]">
                                <p className="text-emerald-200 font-bold text-lg leading-tight">
                                  <Box className="inline-block mr-2 mb-1" size={20} />
                                  Materials Ready for Collection
                                </p>
                                <p className="text-emerald-200/60 text-sm mt-1">
                                  The warehouse team has prepared your requested items. Please verify and collect them to proceed.
                                </p>
                              </div>

                              <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-4 shadow-inner text-center">
                                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                                  <Truck size={32} className="text-emerald-400" />
                                </div>
                                <p className="text-white/90 font-bold">Warehouse Kit #WK-{String(selectedReq.id).slice(-4).toUpperCase()}</p>
                                <p className="text-white/40 text-xs">Location: Main Storage - Zone B</p>
                              </div>

                              <button 
                                onClick={() => updateStatus(selectedReq.id, 'In Execution', 'Jaleel: Collected materials from Sunish. Work is now active on site.')} 
                                className="w-full bg-emerald-600 text-white px-8 py-6 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-900/60 active:scale-[0.98]"
                              >
                                <span>Confirm Collection & Start Work</span>
                                <ChevronRight size={24} />
                              </button>
                           </div>
                        )}
                        {selectedReq.status === 'In Execution' && (
                           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-[2rem]">
                                <p className="text-amber-200 font-bold text-lg leading-tight">
                                  <Truck className="inline-block mr-2 mb-1" size={20} />
                                  Work in Progress
                                </p>
                                <p className="text-amber-200/60 text-sm mt-1">
                                  Maintenance is active. Once the repair is complete, capture visual proof of the finished work.
                                </p>
                              </div>

                              <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-6 shadow-inner">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-white font-black text-sm uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Camera size={18} className="text-blue-400" /> 
                                    Completion Evidence
                                  </h5>
                                  <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
                                    FINAL STEP
                                  </span>
                                </div>

                                <button 
                                  onClick={handleAddPhoto}
                                  className="w-full bg-blue-600/10 border-2 border-dashed border-blue-500/30 rounded-2xl px-6 py-8 text-blue-400 font-black hover:bg-blue-600/20 transition-all flex flex-col items-center justify-center gap-3 group"
                                >
                                  <Camera size={32} className="group-hover:scale-110 transition-transform" /> 
                                  <span>Capture Completion Photo</span>
                                  <p className="text-[10px] text-blue-400/50 font-bold uppercase tracking-widest">Required for quality audit</p>
                                </button>

                                {assessmentForm.photos.length > 0 && (
                                  <div className="flex gap-3 overflow-x-auto pb-2 pt-2 scrollbar-hide">
                                    {assessmentForm.photos.map((p, i) => (
                                      <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-white/10 shadow-xl group">
                                        <img src={p} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        <button 
                                          onClick={() => setAssessmentForm(prev => ({...prev, photos: prev.photos.filter((_, idx) => idx !== i)}))}
                                          className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-xl shadow-lg hover:bg-red-600 transition-colors"
                                        >
                                          <X size={12} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <button 
                                onClick={() => {
                                  updateStatus(selectedReq.id, 'Pending Verification', 'Jaleel: Repair finished. Quality audit requested.', { completionPhotos: assessmentForm.photos });
                                  setAssessmentForm(prev => ({ ...prev, photos: [] }));
                                }} 
                                disabled={assessmentForm.photos.length === 0}
                                className="w-full bg-white text-slate-900 px-8 py-6 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
                              >
                                <span>Request Quality Audit</span>
                                <CheckCircle size={24} />
                              </button>
                           </div>
                        )}
                     </>
                   )}

                   {user.role === UserRole.MANAGER && selectedReq.status === 'Awaiting Approval' && (
                      <div className="space-y-4">
                         <p className="font-bold text-lg">Cost review needed for unit {selectedReq.unit}: {selectedReq.totalCost} AED.</p>
                         <div className="flex gap-4">
                            <button onClick={() => updateStatus(selectedReq.id, 'Approved - Awaiting Store', 'Sultan: Authorized. Procurement initiated.')} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-900">
                               Authorize Budget <CheckCircle size={18} />
                            </button>
                            <button onClick={() => updateStatus(selectedReq.id, 'Rejected', 'Sultan: Cost exceeds limits. Request rejected.')} className="bg-red-600/50 text-white border border-red-500/30 px-8 py-4 rounded-2xl font-black hover:bg-red-600/70 transition-all">
                               Reject Order
                            </button>
                         </div>
                      </div>
                   )}

                   {user.role === UserRole.STORE && selectedReq.status === 'Approved - Awaiting Store' && (
                      <div className="space-y-4">
                         <p className="font-bold text-lg">Pick the required items and set status to 'Ready' for the technician.</p>
                         <button onClick={() => updateStatus(selectedReq.id, 'Materials Ready', 'Sunish: Order fulfillment complete. Materials ready for Jaleel.')} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-900">
                            Issue Warehouse Kit <Box size={18} />
                         </button>
                      </div>
                   )}

                   {user.role === UserRole.QA && selectedReq.status === 'Pending Verification' && (
                      <div className="space-y-4">
                         <p className="font-bold text-lg">Review visual evidence and close the order if standards are met.</p>
                         <div className="flex flex-wrap gap-3">
                           <button onClick={() => updateStatus(selectedReq.id, 'Completed', 'Mariam: Standards verified. Order officially closed.')} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900">
                              Approve & Close <Archive size={18} />
                           </button>
                           <button onClick={() => updateStatus(selectedReq.id, 'In Execution', 'Mariam: Quality audit failed. Returned for rework.')} className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-white/20 transition-all">
                              Rework Required <AlertCircle size={18} />
                           </button>
                         </div>
                      </div>
                   )}
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <section className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem]">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <UserIcon size={14} /> Stakeholder Information
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <div>
                            <p className="text-lg font-black text-slate-900">{selectedReq.tenantName}</p>
                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-1">
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
                    </div>
                  </section>

                  <section className="bg-white border-2 border-slate-100 p-6 rounded-[2rem] shadow-sm">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Receipt size={14} /> Cost Control Center
                    </h4>
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Itemized Materials</p>
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
                            <p className="text-xs font-bold text-slate-400 italic bg-slate-50 p-3 rounded-xl">No costs recorded yet.</p>
                          )}
                       </div>
                       
                       <div className="flex justify-between items-center py-3 border-t border-slate-100">
                          <span className="text-sm font-bold text-slate-500">Professional Labor</span>
                          <span className="text-sm font-black text-slate-900">{selectedReq.laborCost} AED</span>
                       </div>

                       <div className="flex justify-between items-center p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
                          <span className="text-sm font-black uppercase tracking-wider">Net Order Total</span>
                          <span className="text-xl font-black">{selectedReq.totalCost} AED</span>
                       </div>
                    </div>
                  </section>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <section>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                         <ImageIcon size={14} /> Survey (Before)
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
                         <CheckCircle size={14} /> Proof (After)
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
                               <Camera size={24} className="mb-1 opacity-20" />
                               <p className="text-[10px] font-bold uppercase tracking-wider">Awaiting Fix</p>
                            </div>
                         )}
                      </div>
                    </section>
                  </div>
                </div>

                <div className="space-y-6">
                   {aiData && (
                    <section className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100">
                       <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Sparkles size={14} /> AI Diagnostics Report
                       </h4>
                       <div className="space-y-4">
                          <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Root Cause Analysis</p>
                             <p className="text-sm font-bold text-slate-800 leading-tight">{aiData.potentialCause}</p>
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Recommended Deployment Kit</p>
                             <div className="flex flex-wrap gap-2 mt-1">
                                {aiData.requiredTools?.map((t: string) => (
                                  <span key={t} className="bg-white border border-blue-100 text-[10px] font-bold px-2 py-1 rounded-md text-blue-600">{t}</span>
                                ))}
                             </div>
                          </div>
                       </div>
                    </section>
                  )}

                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={14} /> Lifecycle Ledger
                   </h4>
                   <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-px before:bg-slate-100">
                      {selectedReq.history.map((h, i) => (
                        <div key={h.id} className="relative pl-10">
                           <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${i === 0 ? 'bg-blue-600' : 'bg-slate-200'}`} />
                           <p className={`text-sm font-bold leading-tight ${i === 0 ? 'text-slate-900' : 'text-slate-500'}`}>{h.text}</p>
                           <p className="text-[10px] font-bold text-slate-400 mt-1">{new Date(h.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} · {new Date(h.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-slate-300 p-20 text-center">
               <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                  <Wrench size={64} className="opacity-10" />
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-2">Facility Intelligence</h3>
               <p className="max-w-xs font-medium text-slate-400 text-sm">Select an active operational order to view diagnostics, financial breakdown, and site history.</p>
            </div>
          )}
        </div>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h3 className="text-2xl font-black text-slate-900">New Work Order</h3>
                 <button onClick={handleCloseForm} className="p-3 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={24}/></button>
              </div>
              <form onSubmit={handleCreate} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><BuildingIcon size={12}/> Building</label>
                       <select className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none font-bold" value={formData.building} onChange={e => setFormData({...formData, building: e.target.value})}>
                          <option value="">Select Asset</option>
                          {buildings.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Hash size={12}/> Unit</label>
                       <input type="text" placeholder="Unit #" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none font-bold" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><AlignLeft size={12}/> Issue Diagnostics</label>
                    <textarea placeholder="Describe the problem reported by the tenant..." className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none font-medium min-h-[120px] resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Person</label>
                       <input type="text" placeholder="Full Name" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none font-bold" value={formData.tenantName} onChange={e => setFormData({...formData, tenantName: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</label>
                       <input type="text" placeholder="+971 50..." className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none font-bold" value={formData.tenantPhone} onChange={e => setFormData({...formData, tenantPhone: e.target.value})} />
                    </div>
                 </div>
                 <button type="submit" disabled={isAnalyzing} className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black shadow-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50">
                    {isAnalyzing ? <><Clock className="animate-spin" size={24} /> Analyzing with Gemini...</> : <><Sparkles size={24} /> Deploy to Assessment</>}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
