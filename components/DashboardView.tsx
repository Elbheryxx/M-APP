
import React, { useMemo } from 'react';
import { MaintenanceRequest, User, UserRole } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { 
  ClipboardCheck, Clock, AlertTriangle, CheckCircle, TrendingUp, BarChart3, Plus
} from 'lucide-react';

interface Props {
  requests: MaintenanceRequest[];
  user: User;
  onStatClick: (filter: string) => void;
}

export function DashboardView({ requests, user, onStatClick }: Props) {
  const stats = useMemo(() => {
    const total = requests.length;
    const completed = requests.filter(r => r.status === 'Completed').length;
    const pending = requests.filter(r => r.status !== 'Completed' && r.status !== 'Rejected').length;
    const rejected = requests.filter(r => r.status === 'Rejected').length;

    const dataByStatus = [
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'Completed', value: completed, color: '#10b981' },
      { name: 'Rejected', value: rejected, color: '#ef4444' },
    ];

    const dataByPriority = [
      { name: 'Low', count: requests.filter(r => r.priority === 'Low').length },
      { name: 'Medium', count: requests.filter(r => r.priority === 'Medium').length },
      { name: 'High', count: requests.filter(r => r.priority === 'High').length },
    ];

    return { total, completed, pending, dataByStatus, dataByPriority };
  }, [requests]);

  const StatCard = ({ label, value, icon: Icon, colorClass, filterType }: any) => (
    <button 
      onClick={() => onStatClick(filterType)}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 text-left transition-all hover:border-blue-300 hover:shadow-md active:scale-[0.98] group"
    >
      <div className={`p-3 rounded-xl transition-colors ${colorClass} group-hover:scale-110 duration-200`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Operational Overview</h2>
          <p className="text-slate-500 font-medium">Click on any card or chart bar to view detailed records</p>
        </div>
        <div className="flex items-center gap-3">
          {user.role === UserRole.RECEIVER && (
            <button 
              onClick={() => onStatClick('CREATE_NEW')}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus size={20} /> New Maintenance Request
            </button>
          )}
          <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 shadow-sm">
            <Clock size={16} />
            Last update: Just now
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Work Orders" value={stats.total} icon={ClipboardCheck} colorClass="bg-blue-100 text-blue-600" filterType="ALL" />
        <StatCard label="In Progress" value={stats.pending} icon={Clock} colorClass="bg-amber-100 text-amber-600" filterType="IN_PROGRESS" />
        <StatCard label="Completed Tasks" value={stats.completed} icon={CheckCircle} colorClass="bg-emerald-100 text-emerald-600" filterType="COMPLETED" />
        <StatCard label="SLA Compliance" value="94%" icon={TrendingUp} colorClass="bg-purple-100 text-purple-600" filterType="SLA" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-500" />
            Priority Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dataByPriority}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[6, 6, 0, 0]}
                  onClick={(data) => {
                    if (data && data.name) {
                      onStatClick(`PRIORITY_${data.name.toUpperCase()}`);
                    }
                  }}
                >
                  {stats.dataByPriority.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      cursor="pointer"
                      fill={entry.name === 'High' ? '#ef4444' : entry.name === 'Medium' ? '#f59e0b' : '#3b82f6'} 
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" />
            Request Lifecycle
          </h3>
          <div className="h-64 flex flex-col items-center">
             {requests.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <AlertTriangle size={48} className="mb-2 opacity-20" />
                  <p className="text-sm">No data to display</p>
               </div>
             ) : (
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.dataByStatus}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    onClick={(data) => {
                      if (data && data.name) {
                        onStatClick(`STATUS_${data.name.toUpperCase()}`);
                      }
                    }}
                  >
                    {stats.dataByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} cursor="pointer" className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
             )}
             <div className="grid grid-cols-3 gap-2 w-full mt-4">
               {stats.dataByStatus.map(item => (
                 <button 
                  key={item.name} 
                  onClick={() => onStatClick(`STATUS_${item.name.toUpperCase()}`)}
                  className="text-center hover:bg-slate-50 p-2 rounded-xl transition-colors group"
                 >
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter group-hover:text-slate-600">{item.name}</p>
                   <p className="text-lg font-bold" style={{color: item.color}}>{item.value}</p>
                 </button>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
