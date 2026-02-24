
import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Bell, 
  LogOut,
  Menu,
  Wrench,
  ChevronLeft
} from 'lucide-react';
import { User, MaintenanceRequest, Notification, Building, RequestStatus, UserRole, HistoryEntry } from './types';
import { BUILDINGS as INITIAL_BUILDINGS, USERS } from './constants';
import { DashboardView } from './components/DashboardView';
import { RequestsView } from './components/RequestsView';
import { LoginView } from './components/LoginView';
import { NotificationCenter } from './components/NotificationCenter';
import { FocusedListView } from './components/FocusedListView';

const generateMockRequests = (): MaintenanceRequest[] => {
  const requests: MaintenanceRequest[] = [];
  const buildings = ['Tower A', 'Tower B', 'Sunset Villa', 'Labor Camp 1'];
  const units = ['101', '102', '201', '305', 'G01', 'PH-1', 'Room 4', 'Villa 5'];
  const statuses: RequestStatus[] = [
    'Pending Assessment', 'Awaiting Approval', 
    'Approved - Awaiting Store', 'Materials Ready', 
    'In Execution', 'Pending Verification', 'Completed', 'Rejected'
  ];
  const priorities: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];
  const descriptions = [
    { text: 'AC is not cooling properly in the master bedroom', cat: 'HVAC' },
    { text: 'Water leakage from the kitchen sink pipe', cat: 'Plumbing' },
    { text: 'Main door lock is jammed and difficult to open', cat: 'Carpentry' },
    { text: 'Flickering lights in the hallway area', cat: 'Electrical' },
    { text: 'Bathroom tiles are cracked and need replacement', cat: 'Masonry' },
    { text: 'Intercom system not working for visitors', cat: 'Electrical' },
    { text: 'WC flush valve is continuously running', cat: 'Plumbing' },
    { text: 'Kitchen cabinet hinges are broken', cat: 'Carpentry' },
    { text: 'Strange noise coming from the water heater', cat: 'Plumbing' },
    { text: 'Exhaust fan in bathroom stopped working', cat: 'Electrical' }
  ];
  const names = ['Khalid', 'Sarah', 'John', 'Fatima', 'Omar', 'Elena', 'Mohammed', 'Zaid', 'Noor'];

  for (let i = 1; i <= 100; i++) {
    const descObj = descriptions[i % descriptions.length];
    const status = statuses[i % statuses.length];
    const priority = priorities[i % priorities.length];
    const building = buildings[i % buildings.length];
    
    const history: HistoryEntry[] = [
      { id: i * 100, text: `Request registered in the system by Qasim`, createdAt: new Date(Date.now() - (i * 3600000 * 5)).toISOString() }
    ];

    if (status !== 'Pending Assessment') {
      history.push({ id: i * 100 + 1, text: `Jaleel assigned for technical assessment`, createdAt: new Date(Date.now() - (i * 3600000 * 4.5)).toISOString() });
    }
    
    if (['Awaiting Approval', 'Approved - Awaiting Store', 'Materials Ready', 'In Execution', 'Pending Verification', 'Completed'].includes(status)) {
      history.push({ id: i * 100 + 2, text: `Assessment completed. Estimated labor: 150 AED, Materials: 240 AED`, createdAt: new Date(Date.now() - (i * 3600000 * 4)).toISOString() });
    }

    if (['Approved - Awaiting Store', 'Materials Ready', 'In Execution', 'Pending Verification', 'Completed'].includes(status)) {
      history.push({ id: i * 100 + 3, text: `Sultan approved the costs and authorized procurement`, createdAt: new Date(Date.now() - (i * 3600000 * 3.5)).toISOString() });
    }

    if (['Materials Ready', 'In Execution', 'Pending Verification', 'Completed'].includes(status)) {
      history.push({ id: i * 100 + 4, text: `Sunish (Store) confirmed materials availability and prepared package`, createdAt: new Date(Date.now() - (i * 3600000 * 3)).toISOString() });
    }

    if (['In Execution', 'Pending Verification', 'Completed'].includes(status)) {
      history.push({ id: i * 100 + 5, text: `Jaleel collected materials and started work on site`, createdAt: new Date(Date.now() - (i * 3600000 * 2)).toISOString() });
    }

    if (['Pending Verification', 'Completed'].includes(status)) {
      history.push({ id: i * 100 + 6, text: `Work finished. Job card submitted for tenant verification`, createdAt: new Date(Date.now() - (i * 3600000 * 1)).toISOString() });
    }

    if (status === 'Completed') {
      history.push({ id: i * 100 + 7, text: `Tenant confirmed satisfaction. Request closed by Qasim`, createdAt: new Date(Date.now() - (i * 3600000 * 0.5)).toISOString() });
    }

    const hasCost = history.length > 3;
    const labor = hasCost ? 150 : 0;
    const matCost = hasCost ? 240 : 0;

    requests.push({
      id: i,
      requestNo: `REQ-${String(i).padStart(4, '0')}`,
      building: building,
      unit: units[i % units.length],
      description: `${descObj.text}`,
      tenantName: names[i % names.length],
      tenantPhone: `+97150${Math.floor(1000000 + Math.random() * 9000000)}`,
      status: status,
      createdAt: history[0].createdAt,
      createdBy: 'Qasim',
      createdById: 1,
      priority: priority,
      materialsRequested: hasCost ? [{ id: Date.now() + i, name: 'Standard Service Kit', cost: matCost }] : [],
      laborCost: labor,
      totalCost: labor + matCost,
      history: history.reverse(),
      assessmentPhotos: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=600'],
      completionPhotos: status === 'Completed' ? ['https://images.unsplash.com/photo-1595844730298-b9f0ff98ffd0?auto=format&fit=crop&q=80&w=600'] : []
    });
  }
  return requests;
};

const MOCK_REQUESTS = generateMockRequests();

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [requests, setRequests] = useState<MaintenanceRequest[]>(MOCK_REQUESTS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);
  const [autoOpenCreateForm, setAutoOpenCreateForm] = useState(false);
  
  const [focusedView, setFocusedView] = useState<{ type: string; title: string } | null>(null);

  const addNotification = (userId: number, title: string, body: string) => {
    const newNotif: Notification = {
      id: Date.now(),
      userId,
      type: 'info',
      title,
      body,
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleDashboardClick = (type: string) => {
    if (type === 'CREATE_NEW') {
      setActiveTab('requests');
      setAutoOpenCreateForm(true);
      setFocusedView(null);
      setSidebarOpen(false); 
      return;
    }

    let title = "Operations View";
    if (type === 'PRIORITY_HIGH') title = "High Priority Emergency Tasks";
    else if (type === 'PRIORITY_MEDIUM') title = "Standard Priority Work Orders";
    else if (type === 'PRIORITY_LOW') title = "Routine Maintenance (Low Priority)";
    else if (type === 'STATUS_COMPLETED' || type === 'COMPLETED') title = "Completed Task History";
    else if (type === 'STATUS_PENDING' || type === 'IN_PROGRESS') title = "Pending & Active Work Orders";
    else if (type === 'STATUS_REJECTED' || type === 'REJECTED') title = "Rejected Service Requests";
    else if (type === 'ALL') title = "Total Maintenance Pipeline";
    
    setFocusedView({ type, title });
    setActiveTab('focused');
    setSidebarOpen(false); 
  };

  if (!currentUser) {
    return <LoginView onLogin={setCurrentUser} />;
  }

  const NavItem = ({ id, icon: Icon, label }: { id: string; icon: any; label: string }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => {
          setActiveTab(id);
          setFocusedView(null);
          setAutoOpenCreateForm(false);
          setSidebarOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive 
            ? 'bg-blue-600 text-white shadow-lg' 
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        <Icon size={20} />
        <span className="font-medium whitespace-nowrap">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40 transition-all duration-300" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 p-6 flex flex-col 
          transform transition-all duration-300 ease-in-out shadow-2xl md:shadow-none
          ${sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}
        `}
      >
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Wrench className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">IntelliMaintain</h1>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem id="requests" icon={ClipboardList} label="Operations Pipeline" />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-2xl mb-4">
            <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
            <p className="text-xs text-slate-500">{currentUser.role}</p>
          </div>
          <button 
            onClick={() => setCurrentUser(null)} 
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div 
        className={`
          flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'blur-[2px] scale-[0.99] origin-left' : 'blur-0 scale-100'}
        `}
      >
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 shrink-0 z-30">
          <button 
            className={`p-2 rounded-xl transition-all mr-4 flex items-center gap-2 group ${
              sidebarOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-100'
            }`} 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={24} className="group-active:scale-90 transition-transform" />
            <span className="hidden sm:block text-xs font-black uppercase tracking-widest">Menu</span>
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button 
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative" 
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            {showNotifications && (
              <NotificationCenter 
                notifications={notifications.filter(n => n.userId === currentUser.id)} 
                onClose={() => setShowNotifications(false)}
                onRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n))}
              />
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'dashboard' && <DashboardView requests={requests} user={currentUser} onStatClick={handleDashboardClick} />}
            {activeTab === 'requests' && (
              <RequestsView 
                requests={requests} 
                setRequests={setRequests} 
                user={currentUser} 
                addNotification={addNotification}
                buildings={buildings}
                setBuildings={setBuildings}
                autoOpenCreate={autoOpenCreateForm}
                onFormClose={() => setAutoOpenCreateForm(false)}
              />
            )}
            {activeTab === 'focused' && focusedView && (
              <FocusedListView 
                type={focusedView.type} 
                title={focusedView.title}
                requests={requests}
                onBack={() => {
                  setActiveTab('dashboard');
                  setFocusedView(null);
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
