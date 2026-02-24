
import React, { useState } from 'react';
import { Message, MaintenanceRequest, User } from '../types';
import { Send, Hash, MessageSquare, Clock, User as UserIcon } from 'lucide-react';

interface Props {
  messages: Message[];
  requests: MaintenanceRequest[];
  user: User;
}

export function MessagesView({ messages, requests, user }: Props) {
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [inputText, setInputText] = useState('');

  const conversationRequests = Array.from(new Set(messages.map(m => m.requestId)));
  const sidebarRequests = requests.filter(r => conversationRequests.includes(r.id) || r.status !== 'Completed');

  const chatMessages = messages.filter(m => m.requestId === selectedRequestId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const selectedRequest = requests.find(r => r.id === selectedRequestId);

  const handleSend = () => {
    if (!inputText.trim() || !selectedRequestId) return;
    // In real app, this would update state via props
    setInputText('');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6">
      {/* Chats Sidebar */}
      <div className="w-80 flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">Conversations</h3>
          <p className="text-xs text-slate-500 font-medium">Linked to service orders</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {sidebarRequests.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRequestId(r.id)}
              className={`
                w-full p-4 rounded-2xl text-left transition-all group
                ${selectedRequestId === r.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'hover:bg-slate-50'}
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedRequestId === r.id ? 'text-blue-100' : 'text-blue-600'}`}>
                  {r.requestNo}
                </span>
                <span className={`text-[9px] font-medium ${selectedRequestId === r.id ? 'text-blue-200' : 'text-slate-400'}`}>
                  Active
                </span>
              </div>
              <p className={`text-sm font-bold truncate ${selectedRequestId === r.id ? 'text-white' : 'text-slate-800'}`}>
                {r.building} - {r.unit}
              </p>
            </button>
          ))}
          {sidebarRequests.length === 0 && (
            <div className="text-center py-10 text-slate-400 opacity-50">
               <MessageSquare size={32} className="mx-auto mb-2" />
               <p className="text-xs font-medium italic">No active threads</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm relative">
        {selectedRequest ? (
          <>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="bg-slate-100 p-2 rounded-xl text-slate-600">
                    <Hash size={20} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedRequest.requestNo} Channel</h3>
                    <p className="text-xs text-slate-500 font-medium">{selectedRequest.building} · {selectedRequest.unit}</p>
                 </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
               {chatMessages.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-40">
                    <MessageSquare size={64} className="mb-4" />
                    <p className="text-sm font-bold">No messages in this request yet</p>
                    <p className="text-xs font-medium">Send a status update or instruction</p>
                 </div>
               )}
               {chatMessages.map(m => {
                 const isMine = m.fromUserId === user.id;
                 return (
                   <div key={m.id} className={`flex gap-4 ${isMine ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 shrink-0">
                         {isMine ? 'ME' : 'ID'}
                      </div>
                      <div className={`max-w-md ${isMine ? 'text-right' : ''}`}>
                         <div className={`
                            p-4 rounded-2xl text-sm font-medium leading-relaxed inline-block
                            ${isMine ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-700'}
                          `}>
                            {m.text}
                         </div>
                         <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                           {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                         </p>
                      </div>
                   </div>
                 );
               })}
            </div>

            <div className="p-6 border-t border-slate-100">
               <div className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder="Type a message to the team..."
                    className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none font-medium focus:ring-2 focus:ring-blue-500/10 text-slate-800"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                  />
                  <button 
                    onClick={handleSend}
                    className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center"
                  >
                    <Send size={20} />
                  </button>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 text-center">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
               <MessageSquare size={48} className="opacity-20" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Secure Team Messaging</h3>
             <p className="max-w-xs text-sm font-medium">Select a service request from the sidebar to view its dedicated communication channel.</p>
          </div>
        )}
      </div>
    </div>
  );
}
