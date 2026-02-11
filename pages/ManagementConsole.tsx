
import React, { useState, useMemo, useEffect } from 'react';
import { useAppConfig } from '../context/ConfigContext';
import { DocType, Application, OfficialRecord } from '../types';
import { 
  LayoutDashboard, Database, CreditCard, Info, Cpu, LogOut, Search, 
  SearchX, Eye, FileText, CheckCircle2, ChevronRight, X, FileSearch, 
  Camera, Check, Ban, Banknote, Loader2, Copy, History, Download, ShieldCheck, 
  Settings, Zap, AlertTriangle, BarChart3, User, Briefcase, Globe, Landmark, Filter,
  PlusCircle, Trash2, ExternalLink, Upload, RefreshCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type AdminTab = 'DASHBOARD' | 'RECORD' | 'PAYMENT' | 'INFORMATION' | 'DEVICE';

const ManagementConsole: React.FC = () => {
  const { 
    applications, records, logs, isLoading,
    updateApplication, addRecord, deleteRecord, addLog 
  } = useAppConfig();
  
  const [isAuth, setIsAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{url: string, label: string} | null>(null);
  const [typeFilter, setTypeFilter] = useState<DocType | 'ALL'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Manual Form State
  const [manualData, setManualData] = useState<Partial<OfficialRecord>>({
    type: DocType.WORK_PERMIT,
    fullName: '',
    passportNumber: '',
    nationality: '',
    dob: '',
    email: '',
    phone: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    status: 'Verified',
    pdfUrl: '',
    employer: '',
    jobTitle: ''
  });

  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get('user') === 'shohag055' && fd.get('pass') === '2846Shohag..') {
      setIsAuth(true);
      addLog('Admin', 'Secure Login', 'Session initiated by shohag055.');
    } else {
      alert('Security violation: Incorrect credentials.');
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      addLog('Admin', 'Manual Sync', 'Dossier registry synchronized with master database.');
    }, 1000);
  };

  const handleApprove = (app: Application) => {
    const recordId = `AUTH-${app.type.slice(0,2)}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const newRecord: OfficialRecord = {
      id: recordId, 
      type: app.type, 
      fullName: app.fullName, 
      passportNumber: app.passportNumber,
      nationality: app.nationality, 
      dob: app.dob,
      email: app.email,
      phone: app.phone,
      issueDate: new Date().toLocaleDateString(),
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString(),
      status: 'Verified', 
      pdfUrl: app.passport_file || '',
      authorityReference: 'NAT_ARCHIVE_SEC_ALPHA', 
      employer: app.details?.employer || 'Govt Verified',
      jobTitle: app.details?.jobTitle || 'Expert'
    };
    addRecord(newRecord);
    updateApplication(app.id, { status: 'Approved' });
    alert(`Success: Dossier ${app.id} verified. New Record ID: ${recordId}`);
    setSelectedAppId(null);
  };

  const handleManualRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualData.fullName || !manualData.passportNumber) {
      alert('Please fill mandatory fields.');
      return;
    }
    const recordId = `MAN-${manualData.type?.slice(0,2)}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const finalRecord: OfficialRecord = {
      ...manualData as OfficialRecord,
      id: recordId,
      authorityReference: 'ADMIN_MANUAL_ENTRY'
    };
    addRecord(finalRecord);
    alert('Manual Registry Entry Created Successfully.');
    setIsManualModalOpen(false);
    setManualData({
      type: DocType.WORK_PERMIT, fullName: '', passportNumber: '', nationality: '',
      dob: '', email: '', phone: '', issueDate: new Date().toISOString().split('T')[0],
      expiryDate: '', status: 'Verified', pdfUrl: '', employer: '', jobTitle: ''
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setManualData(prev => ({ ...prev, pdfUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this official record? This cannot be undone.')) {
      deleteRecord(id);
      addLog('Admin', 'Delete Record', `Registry ID ${id} removed from archives.`);
    }
  };

  const stats = useMemo(() => {
    const rev = applications
      .filter(a => a.paymentStatus === 'Paid')
      .reduce((acc, a) => acc + parseInt(a.amount?.replace(/\D/g, '') || '0'), 0);
    return {
      total: applications.length,
      wp: applications.filter(a => a.type === DocType.WORK_PERMIT).length,
      visa: applications.filter(a => a.type === DocType.VISA).length,
      trc: applications.filter(a => a.type === DocType.TRC).length,
      pending: applications.filter(a => ['Submitted', 'Under Review'].includes(a.status)).length,
      revenue: rev.toLocaleString() + ' VND'
    };
  }, [applications]);

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.passportNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === 'ALL' || app.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [applications, searchTerm, typeFilter]);

  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      const matchSearch = rec.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          rec.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.passportNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === 'ALL' || rec.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [records, searchTerm, typeFilter]);

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-12 h-12 text-red-600 animate-spin" /></div>;

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md border-t-[14px] border-red-600 animate-in zoom-in duration-500">
          <div className="text-center mb-10">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Vietnam.svg/200px-Emblem_of_Vietnam.svg.png" className="w-20 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Command Terminal</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Ministry of Public Security</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input name="user" required className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl text-slate-900 font-bold outline-none focus:border-red-600 transition-all" placeholder="Admin ID" />
            <input name="pass" type="password" required className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl text-slate-900 font-bold outline-none focus:border-red-600 transition-all" placeholder="Security Token" />
            <button type="submit" className="w-full bg-red-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-red-700 transition-all uppercase tracking-widest text-sm active:scale-95">Access Terminal</button>
          </form>
          <button onClick={() => navigate('/')} className="w-full mt-8 text-[10px] text-slate-300 hover:text-red-500 font-black uppercase text-center transition-colors">Terminate Session</button>
        </div>
      </div>
    );
  }

  const selectedApp = applications.find(a => a.id === selectedAppId);
  const selectedRecord = records.find(r => r.id === selectedRecordId);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      
      {/* Universal HD File Previewer */}
      {previewFile && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
          <button onClick={() => setPreviewFile(null)} className="absolute top-8 right-8 p-4 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all"><X className="w-8 h-8" /></button>
          <div className="w-full max-w-5xl h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center p-2 border border-white/10 relative">
             <img 
               src={previewFile.url} 
               className="max-w-full max-h-full object-contain rounded-2xl shadow-inner" 
               alt="Secure File"
               onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x1200?text=File+Not+Found+or+Inaccessible'; }}
             />
             <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md px-6 py-2 rounded-full text-white font-black uppercase text-xs tracking-widest">
               {previewFile.label}
             </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-[250] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 lg:p-10 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300 my-auto max-h-[95vh] border-t-[10px] border-emerald-500">
            <div className="p-8 border-b bg-slate-50 flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-6">
                <div className="p-5 bg-emerald-600 rounded-2xl text-white shadow-xl"><PlusCircle className="w-7 h-7" /></div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Manual Registry Creation</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Authorized Administrative Input</p>
                </div>
              </div>
              <button onClick={() => setIsManualModalOpen(false)} className="p-4 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-600 transition-all"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleManualRecordSubmit} className="flex-1 overflow-y-auto p-12 lg:p-16 grid lg:grid-cols-2 gap-10">
              <div className="space-y-8">
                <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest border-b pb-4 flex items-center gap-2"><User className="w-4 h-4" /> Personal Information</h3>
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Full Legal Name</label>
                    <input required value={manualData.fullName} onChange={e => setManualData({...manualData, fullName: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-900 font-bold outline-none focus:border-emerald-500 uppercase" placeholder="NAME AS PER PASSPORT" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Passport Number</label>
                      <input required value={manualData.passportNumber} onChange={e => setManualData({...manualData, passportNumber: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-900 font-bold outline-none focus:border-emerald-500 uppercase" placeholder="B1234567" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Email Address</label>
                      <input required type="email" value={manualData.email} onChange={e => setManualData({...manualData, email: e.target.value.toLowerCase()})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-900 font-bold outline-none focus:border-emerald-500" placeholder="user@domain.com" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Rest of the form... */}
              <div className="pt-8 col-span-full">
                  <button type="submit" className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-emerald-500 shadow-2xl shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-3">
                    <ShieldCheck className="w-6 h-6" /> Commit Record to Registry
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shrink-0 h-screen sticky top-0 z-[100]">
        <div className="p-10 border-b border-white/5 bg-slate-950 flex items-center gap-4">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Vietnam.svg/200px-Emblem_of_Vietnam.svg.png" className="w-12 brightness-0 invert" />
          <div className="font-black text-[11px] uppercase tracking-widest leading-none">Command<br/><span className="text-red-500">Control Hub</span></div>
        </div>
        <nav className="p-6 flex-1 space-y-2">
          {[
            { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'RECORD', icon: Database, label: 'Record' },
            { id: 'PAYMENT', icon: Banknote, label: 'Payment' },
            { id: 'INFORMATION', icon: Info, label: 'Information' },
            { id: 'DEVICE', icon: Cpu, label: 'Device' },
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => { setActiveTab(tab.id as AdminTab); setSearchTerm(''); setTypeFilter('ALL'); }} 
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest ${activeTab === tab.id ? 'bg-red-600 text-white shadow-xl' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <tab.icon className="w-5 h-5" /> {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-10 border-t border-white/5">
          <button onClick={() => setIsAuth(false)} className="w-full flex items-center gap-3 text-red-500 font-black uppercase text-[10px] tracking-widest hover:text-red-400 transition-colors"><LogOut className="w-4 h-4" /> Disconnect</button>
        </div>
      </aside>

      {/* Viewport Content */}
      <main className="flex-1 p-10 lg:p-14 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-200 pb-10">
            <div className="space-y-1">
              <div className="flex items-center gap-4">
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">{activeTab}</h2>
                {activeTab === 'DASHBOARD' && (
                  <button 
                    onClick={handleRefresh} 
                    className={`p-2 rounded-full transition-all ${isRefreshing ? 'animate-spin text-red-600' : 'text-slate-300 hover:text-red-600'}`}
                  >
                    <RefreshCcw className="w-5 h-5" />
                  </button>
                )}
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">ADMIN TERMINAL: VN_CORE_SVR_HQ</p>
            </div>
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-red-600 transition-colors" />
              <input 
                placeholder="Search dossiers, records or passports..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[2rem] text-[11px] font-bold text-slate-900 outline-none focus:border-red-600 shadow-sm transition-all" 
              />
            </div>
          </div>

          {/* DASHBOARD TAB */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-16 animate-in fade-in duration-500">
               {/* Clickable Stat Cards for Filtering */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  <button 
                    onClick={() => { setTypeFilter('ALL'); setSearchTerm(''); }}
                    className={`p-10 rounded-[3.5rem] space-y-4 shadow-2xl relative overflow-hidden group transition-all text-left ${typeFilter === 'ALL' ? 'bg-slate-900 text-white ring-4 ring-red-600/20' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                  >
                    <p className={`text-[10px] font-black uppercase tracking-widest relative z-10 ${typeFilter === 'ALL' ? 'text-red-500' : 'text-slate-500'}`}>Total Dossiers</p>
                    <p className="text-7xl font-black relative z-10 tracking-tighter">{stats.total}</p>
                    <BarChart3 className={`absolute -bottom-6 -right-6 w-40 h-40 opacity-5 rotate-12 group-hover:scale-110 transition-transform ${typeFilter === 'ALL' ? 'text-white' : 'text-slate-900'}`} />
                  </button>

                  <button 
                    onClick={() => { setTypeFilter(DocType.WORK_PERMIT); setSearchTerm(''); }}
                    className={`p-10 rounded-[3.5rem] space-y-4 shadow-xl relative overflow-hidden group transition-all text-left ${typeFilter === DocType.WORK_PERMIT ? 'bg-red-600 text-white ring-4 ring-red-600/20' : 'bg-white border-2 border-slate-100 text-slate-900 hover:border-red-600'}`}
                  >
                    <p className={`text-[10px] font-black uppercase tracking-widest relative z-10 ${typeFilter === DocType.WORK_PERMIT ? 'text-white' : 'text-slate-400'}`}>Work Permits</p>
                    <p className="text-7xl font-black relative z-10 tracking-tighter">{stats.wp}</p>
                    <Briefcase className="absolute -bottom-6 -right-6 w-40 h-40 opacity-5 rotate-12 group-hover:scale-110 transition-transform" />
                  </button>

                  <button 
                    onClick={() => { setTypeFilter(DocType.VISA); setSearchTerm(''); }}
                    className={`p-10 rounded-[3.5rem] space-y-4 shadow-xl relative overflow-hidden group transition-all text-left ${typeFilter === DocType.VISA ? 'bg-blue-600 text-white ring-4 ring-blue-600/20' : 'bg-white border-2 border-slate-100 text-slate-900 hover:border-blue-600'}`}
                  >
                    <p className={`text-[10px] font-black uppercase tracking-widest relative z-10 ${typeFilter === DocType.VISA ? 'text-white' : 'text-slate-400'}`}>Visas (VISA)</p>
                    <p className="text-7xl font-black relative z-10 tracking-tighter">{stats.visa}</p>
                    <Globe className="absolute -bottom-6 -right-6 w-40 h-40 opacity-5 rotate-12 group-hover:scale-110 transition-transform" />
                  </button>

                  <button 
                    onClick={() => { setTypeFilter(DocType.TRC); setSearchTerm(''); }}
                    className={`p-10 rounded-[3.5rem] space-y-4 shadow-xl relative overflow-hidden group transition-all text-left ${typeFilter === DocType.TRC ? 'bg-emerald-600 text-white ring-4 ring-emerald-600/20' : 'bg-white border-2 border-slate-100 text-slate-900 hover:border-emerald-600'}`}
                  >
                    <p className={`text-[10px] font-black uppercase tracking-widest relative z-10 ${typeFilter === DocType.TRC ? 'text-white' : 'text-slate-400'}`}>Residency (TRC)</p>
                    <p className="text-7xl font-black relative z-10 tracking-tighter">{stats.trc}</p>
                    <ShieldCheck className="absolute -bottom-6 -right-6 w-40 h-40 opacity-5 rotate-12 group-hover:scale-110 transition-transform" />
                  </button>
               </div>

               <div className="grid lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 bg-white rounded-[4rem] p-12 border-2 border-slate-100 shadow-sm space-y-10">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                       <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                         <Filter className="w-6 h-6 text-red-600" /> 
                         Filtered Dossier Traffic 
                         {typeFilter !== 'ALL' && <span className="ml-2 text-xs font-black text-slate-300">[{typeFilter}]</span>}
                       </h3>
                       {/* Reset View functionality now clears all filters */}
                       <button 
                         onClick={() => { setTypeFilter('ALL'); setSearchTerm(''); }} 
                         className="text-red-600 text-[10px] font-black uppercase hover:underline tracking-widest transition-all"
                       >
                         Reset View
                       </button>
                    </div>
                    <div className="space-y-4">
                       {filteredApps.length > 0 ? filteredApps.map(app => (
                         <div 
                           key={app.id} 
                           onClick={() => setSelectedAppId(app.id)} 
                           className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] hover:bg-white hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer"
                         >
                            <div className="flex items-center gap-6">
                               <div className={`p-5 rounded-2xl text-white shadow-xl ${
                                 app.type === DocType.WORK_PERMIT ? 'bg-red-500' : 
                                 app.type === DocType.VISA ? 'bg-blue-500' : 'bg-emerald-500'
                               }`}>
                                  <FileText className="w-6 h-6" />
                               </div>
                               <div>
                                  <p className="font-black uppercase text-base tracking-tight text-slate-900">{app.fullName}</p>
                                  <div className="flex items-center gap-4 mt-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{app.type}</p>
                                    <span className="text-[10px] text-slate-200">|</span>
                                    <p className="text-[10px] font-mono font-bold text-red-600 tracking-wider">{app.passportNumber}</p>
                                  </div>
                               </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${app.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                 {app.paymentStatus}
                               </span>
                               <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-red-600 transition-all" />
                            </div>
                         </div>
                       )) : (
                         <div className="py-20 text-center space-y-6">
                            <SearchX className="w-16 h-16 text-slate-100 mx-auto" />
                            <p className="text-slate-400 font-bold italic">Registry empty for current filters.</p>
                            <button onClick={() => { setTypeFilter('ALL'); setSearchTerm(''); }} className="px-6 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Clear All Filters</button>
                         </div>
                       )}
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                     {/* Revenue Card now acts as a link to Payment Tab */}
                     <button 
                        onClick={() => setActiveTab('PAYMENT')}
                        className="w-full bg-slate-900 rounded-[4rem] p-12 text-white space-y-10 shadow-xl cursor-pointer hover:bg-slate-800 transition-all group text-left relative overflow-hidden"
                     >
                        <div className="relative z-10 space-y-10">
                           <h3 className="text-xl font-black uppercase tracking-tight text-red-500 text-center group-hover:scale-105 transition-transform">National Revenue</h3>
                           <div className="text-center space-y-2">
                              <Banknote className="w-16 h-16 text-emerald-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                              <p className="text-3xl font-black tracking-tighter">{stats.revenue}</p>
                              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Settled via Treasury</p>
                           </div>
                           <div className="pt-6 border-t border-white/5 text-center">
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">View Payment Registry <ExternalLink className="w-3 h-3" /></p>
                           </div>
                        </div>
                        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />
                     </button>

                     <div className="p-10 bg-white border-2 border-slate-100 rounded-[3.5rem] shadow-sm space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-4">Audit Snippet</h4>
                        <div className="space-y-4">
                           {logs.slice(0, 3).map(log => (
                             <div key={log.id} className="space-y-1">
                                <p className="text-[9px] font-black text-red-600 uppercase">{log.action}</p>
                                <p className="text-[10px] text-slate-500 line-clamp-1">{log.details}</p>
                             </div>
                           ))}
                           <button onClick={() => setActiveTab('DEVICE')} className="w-full py-3 bg-slate-50 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all">Full System Logs</button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* RECORD TAB */}
          {activeTab === 'RECORD' && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200">
                     {['ALL', DocType.WORK_PERMIT, DocType.VISA, DocType.TRC].map(type => (
                       <button key={type} onClick={() => setTypeFilter(type as any)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${typeFilter === type ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{type === 'ALL' ? 'Everything' : type}</button>
                     ))}
                  </div>
                  <button onClick={() => setIsManualModalOpen(true)} className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-emerald-500 active:scale-95 transition-all">
                    <PlusCircle className="w-4 h-4" /> Create Manual Entry
                  </button>
               </div>
               {/* Record table similarly interactive... */}
            </div>
          )}

          {/* PAYMENT TAB */}
          {activeTab === 'PAYMENT' && (
            <div className="grid md:grid-cols-2 gap-10 animate-in fade-in duration-300">
               {applications.filter(a => a.payment_receipt_file).map(app => (
                 <div key={app.id} className="bg-white p-10 rounded-[4rem] border-2 border-slate-100 shadow-sm space-y-8">
                    <div className="flex justify-between items-center"><p className="text-[10px] font-black text-slate-400 uppercase">TXN REF: {app.details?.paymentRef || 'MANUAL'}</p><span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase">PAID</span></div>
                    <div className="aspect-video rounded-[2.5rem] border-2 border-slate-100 overflow-hidden bg-slate-50 group cursor-zoom-in" onClick={() => setPreviewFile({url: app.payment_receipt_file!, label: 'Payment Receipt'})}>
                       <img src={app.payment_receipt_file} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Acknowledge Settlement</button>
                 </div>
               ))}
            </div>
          )}
          
        </div>
      </main>

      {/* Shared Inspector Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-[400] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 lg:p-10 overflow-y-auto">
          <div className="bg-white w-full max-w-6xl rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300 border-t-[10px] border-red-600">
            <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-6"><div className="p-5 bg-red-600 rounded-2xl text-white shadow-xl shadow-red-100"><FileSearch className="w-7 h-7" /></div><div><h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Dossier: {selectedApp.id}</h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{selectedApp.type} • Application Review</p></div></div>
              <button onClick={() => setSelectedAppId(null)} className="p-4 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-600 transition-all"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 lg:p-16 grid lg:grid-cols-3 gap-16">
              <div className="lg:col-span-2 space-y-12">
                 <div className="grid md:grid-cols-2 gap-10">
                    {[{l: 'Name', v: selectedApp.fullName}, {l: 'Passport', v: selectedApp.passportNumber}, {l: 'Citizenship', v: selectedApp.nationality}, {l: 'Email', v: selectedApp.email}].map((f, i) => (
                      <div key={i}><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.l}</p><p className="font-black text-xl uppercase tracking-tight text-slate-900">{f.v || 'EMPTY'}</p></div>
                    ))}
                 </div>
                 <div className="border-t pt-10"><h3 className="text-xs font-black uppercase text-red-600 mb-6 tracking-widest">Document Evidence</h3><div className="grid grid-cols-2 gap-6">{[{l: 'ID Photo', u: selectedApp.photo_file}, {l: 'Passport Scan', u: selectedApp.passport_file}, {l: 'Visa/TRC Reference', u: selectedApp.visa_file || selectedApp.trc_file}].filter(x => x.u).map((file, idx) => (
                    <div key={idx} className="space-y-2"><p className="text-[9px] font-black text-slate-500 uppercase text-center">{file.l}</p><div onClick={() => setPreviewFile({url: file.u!, label: file.l})} className="aspect-[3/4] bg-slate-50 rounded-3xl border-2 border-slate-100 overflow-hidden cursor-zoom-in relative group"><img src={file.u} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /></div></div>
                 ))}</div></div>
              </div>
              <div className="space-y-8">
                 <div className="bg-slate-950 rounded-[3rem] p-10 text-white space-y-8">
                    <p className="text-[10px] font-black uppercase text-red-500 tracking-[0.3em]">Decision Console</p>
                    <button onClick={() => handleApprove(selectedApp)} className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3"><CheckCircle2 className="w-6 h-6" /> Seal & Verify</button>
                    <button className="w-full py-6 bg-white/5 text-white/40 hover:bg-red-600 hover:text-white rounded-3xl font-black uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-3"><Ban className="w-6 h-6" /> Reject File</button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementConsole;
