
import React from 'react';
import { User, UserRole } from '../types';
import { USERS } from '../constants';
import { Sparkles, ShieldCheck, ChevronRight } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
}

export function LoginView({ onLogin }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 p-10 relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">IntelliMaintain Pro</h1>
          <p className="text-slate-500 font-medium">Smart Infrastructure Lifecycle Management</p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Authentication Required</p>
          {USERS.map(u => (
            <button
              key={u.id}
              onClick={() => onLogin(u)}
              className="w-full group flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl transition-all hover:bg-blue-600 hover:border-blue-600 hover:shadow-xl hover:shadow-blue-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-600 group-hover:text-blue-600 shadow-sm">
                   <ShieldCheck size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800 group-hover:text-white transition-colors">{u.name}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter group-hover:text-blue-100 transition-colors">{u.role}</p>
                </div>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all" size={20} />
            </button>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Enterprise Secure Access v2.5</p>
        </div>
      </div>
    </div>
  );
}
