
import React from 'react';
import { Notification } from '../types';
import { Bell, Clock, X, Check } from 'lucide-react';

interface Props {
  notifications: Notification[];
  onClose: () => void;
  onRead: (id: number) => void;
}

export function NotificationCenter({ notifications, onClose, onRead }: Props) {
  return (
    <div className="absolute right-0 top-14 w-96 bg-white border border-slate-200 rounded-[2rem] shadow-2xl z-50 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Bell size={18} className="text-blue-500" /> Notifications
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
             <Bell size={48} className="mx-auto mb-4 opacity-10" />
             <p className="text-sm font-medium italic">No new alerts</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map(n => (
              <div 
                key={n.id} 
                className={`p-5 flex gap-4 transition-colors hover:bg-slate-50 ${!n.read ? 'bg-blue-50/30' : ''}`}
                onClick={() => onRead(n.id)}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${!n.read ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-400'}`}>
                   {n.read ? <Check size={20} /> : <Bell size={20} />}
                </div>
                <div className="flex-1">
                   <div className="flex justify-between items-start mb-1">
                      <p className={`text-sm font-bold ${!n.read ? 'text-slate-900' : 'text-slate-500'}`}>{n.title}</p>
                      <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                         <Clock size={10} /> Just now
                      </span>
                   </div>
                   <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{n.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-4 border-t border-slate-100 text-center">
         <button className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest">Clear All Data</button>
      </div>
    </div>
  );
}
