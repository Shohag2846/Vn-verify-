
import React, { useState, useMemo, useEffect } from 'react';
import { useAppConfig } from '../context/ConfigContext';
import { DocType, AppStatus, Application, OfficialRecord, AppConfig, PaymentMethod, ServiceConfig } from '../types';
import { 
  LayoutDashboard, Users, ShieldCheck, Settings, CreditCard, 
  LogOut, Search, Plus, Trash2, Eye, FileText, 
  CheckCircle2, Download, Clock, BarChart3, ChevronRight, X, ExternalLink, ShieldAlert, Key,
  Bell, AlertTriangle, Zap, FileSearch, Globe, History, Camera, Save, Edit3, Landmark,
  Upload, FilePlus, Scale, Info, Check, Ban, Briefcase, FileBadge, Mail, Smartphone, Calendar, Building2,
  Wallet, Banknote, Image as ImageIcon, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type AdminTab = 'OVERVIEW' | 'QUEUE' | 'REGISTRY' | 'FINANCE' | 'POLICY' | 'TREASURY' | 'AUDIT';

const ManagementConsole: React.FC = () => {
  const { 
    config, applications, records, logs, isLoading,
    updateServiceConfig, updatePaymentMethod, updateApplication, deleteApplication, 
    addRecord, deleteRecord, addLog 
  } = useAppConfig();
  
  const [isAuth, setIsAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  
  // Registry Creation State
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<OfficialRecord>>({
    type: DocType.VISA, fullName: '', passportNumber: '', nationality: '', email: '', phone: '',
    dob: '', employer: '', issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '', status: 'Verified', pdfUrl: ''
  });

  // Policy State
  const [managedPolicyType, setManagedPolicyType] = useState<DocType>(DocType.VISA);
  const [policyForm, setPolicyForm] = useState<ServiceConfig | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // File Preview Modal
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  useEffect(() => {
    if (config.services[managedPolicyType]) {
      setPolicyForm(config.services[managedPolicyType]);
    }
  }, [managedPolicyType, config.services]);

  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get('user') === 'admin' && fd.get('pass') === 'vn-gov-2024') {
      setIsAuth(true);
      addLog('Admin', 'Login', 'Administrator session started.');
    } else {
      alert('Security violation: Incorrect credentials.');
    }
  };

  const handleRecordFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewRecord(prev => ({ ...prev, pdfUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApprove = (app: Application) => {
    const recordId = `AUTH-${app.type.slice(0,2)}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    addRecord({
      id: recordId, type: app.type, fullName: app.fullName, passportNumber: app.passportNumber,
      nationality: app.nationality, email: app.email, phone: app.phone, dob: app.dob,
      issueDate: new Date().toLocaleDateString(),
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString(),
      status: 'Verified', pdfUrl: app.passport_file || '#',
      authorityReference: 'CENTRAL_CMD_HQ', employer: app.details?.employer || 'N/A', jobTitle: app.details?.jobTitle || 'N/A'
    });
    updateApplication(app.id, { status: 'Approved' });
    alert('Application Approved and Archive Sync Complete.');
    setSelectedAppId(null);
  };

  const handleManualRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.pdfUrl) { alert("Error: Evidence required."); return; }
    const recordId = `MANUAL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    addRecord({ ...newRecord as OfficialRecord, id: recordId });
    setShowAddRecord(false);
    setNewRecord({ 
      type: DocType.VISA, fullName: '', passportNumber: '', nationality: '', email: '', phone: '',
      dob: '', employer: '', issueDate: new Date().toISOString().split('T')[0], status: 'Verified', pdfUrl: ''
    });
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
      pending: applications.filter(a => ['Submitted', 'Under Review', 'Payment Pending'].includes(a.status)).length,
      records: records.length,
      revenue: rev.toLocaleString() + ' VND'
    };
  }, [applications, records]);

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || app.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'ALL' || app.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [applications, searchTerm, typeFilter, statusFilter]);

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-12 h-12 text-red-600 animate-spin" /></div>;

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md border-t-[12px] border-red-600 animate-in zoom-in duration-300">
          <div className="text-center mb-10">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Vietnam.svg/200px-Emblem_of_Vietnam.svg.png" className="w-20 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Command Control</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Classified Administrative Access</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input name="user" defaultValue="admin" required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-red-600" placeholder="Admin ID" />
            <input name="pass" type="password" defaultValue="vn-gov-2024" required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-red-600" placeholder="Security Token" />
            <button type="submit" className="w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-red-700 transition-all uppercase tracking-widest text-sm">Verify & Connect</button>
          </form>
          <button onClick={() => navigate('/')} className="w-full mt-6 text-[10px] text-slate-300 hover:text-red-500 font-black uppercase text-center">Abort Access</button>
        </div>
      </div>
    );
  }

  const selectedApp = applications.find(a => a.id === selectedAppId);

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-900">
      {/* Artifact Viewer Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
          <button onClick={() => setPreviewFile(null)} className="absolute top-8 right-8 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white"><X className="w-8 h-8" /></button>
          <div className="w-full max-w-5xl h-[80vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
             <img src={previewFile} className="max-w-full max-h-full object-contain" alt="Artifact" />
          </div>
          <p className="mt-6 text-white/50 font-black uppercase text-xs tracking-widest">Sovereign Artifact Registry Viewer</p>
        </div>
      )}

      {/* App Detail Overlay */}
      {selectedApp && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 lg:p-12 overflow-y-auto">
          <div className="bg-white w-full max-w-6xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300 my-auto">
            <div className="p-8 border-b bg-slate-50 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-600 rounded-2xl text-white"><FileSearch className="w-6 h-6" /></div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Dossier: {selectedApp.id}</h2>
              </div>
              <button onClick={() => setSelectedAppId(null)} className="p-3 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-600 transition-all"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 lg:p-12 grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-10">
                <section className="space-y-6">
                  <h3 className="text-xs font-black uppercase text-red-600 tracking-widest border-b pb-2">I. Citizen Profile</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="col-span-2"><p className="text-[10px] font-black text-slate-400 uppercase">Full Name</p><p className="font-black text-lg uppercase">{selectedApp.fullName}</p></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase">Passport ID</p><p className="font-bold text-lg font-mono">{selectedApp.passportNumber}</p></div>
                    <div className="col-span-full"><p className="text-[10px] font-black text-slate-400 uppercase">Current Domicile</p><p className="text-slate-600 italic">{selectedApp.currentAddress}</p></div>
                  </div>
                </section>
                <section className="space-y-6">
                  <h3 className="text-xs font-black uppercase text-red-600 tracking-widest border-b pb-2">II. Visual Evidence Inspection</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
                      <div className="flex justify-between items-center"><p className="text-xs font-black uppercase">Passport Image</p><button onClick={() => setPreviewFile(selectedApp.passport_file || null)} className="text-red-600"><Eye className="w-4 h-4" /></button></div>
                      <div className="h-48 bg-slate-200 rounded-2xl overflow-hidden cursor-pointer shadow-inner" onClick={() => setPreviewFile(selectedApp.passport_file || null)}>
                        <img src={selectedApp.passport_file} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
                      <div className="flex justify-between items-center"><p className="text-xs font-black uppercase">Settlement Receipt</p><button onClick={() => setPreviewFile(selectedApp.paymentProof?.imageUrl || null)} className="text-red-600"><ImageIcon className="w-4 h-4" /></button></div>
                      <div className="h-48 bg-slate-200 rounded-2xl overflow-hidden cursor-pointer shadow-inner" onClick={() => setPreviewFile(selectedApp.paymentProof?.imageUrl || null)}>
                        <img src={selectedApp.paymentProof?.imageUrl} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
              <div className="space-y-8">
                <div className="bg-slate-900 p-8 rounded-[2rem] text-white space-y-8 shadow-xl relative overflow-hidden">
                  <h3 className="text-xs font-black uppercase tracking-widest text-red-500 border-b border-white/10 pb-4">Decision Hub</h3>
                  <div className="space-y-6">
                    <div className="space-y-2"><p className="text-[10px] text-slate-400 font-black uppercase">Status</p><p className="text-3xl font-black uppercase">{selectedApp.status}</p></div>
                    <div className="space-y-2"><p className="text-[10px] text-slate-400 font-black uppercase">Fiscal Status</p><p className="text-xl font-bold text-emerald-500">{selectedApp.paymentStatus}</p></div>
                    <div className="grid gap-3 pt-4">
                      <button onClick={() => handleApprove(selectedApp)} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-lg transition-all active:scale-95"><Check className="w-4 h-4 inline mr-2" /> Approve & Sync</button>
                      <button className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 shadow-lg transition-all active:scale-95"><Ban className="w-4 h-4 inline mr-2" /> Reject Application</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Nav */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shrink-0 h-screen sticky top-0 overflow-y-auto z-50">
        <div className="p-8 border-b border-white/5 flex items-center gap-4 bg-slate-950">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Vietnam.svg/200px-Emblem_of_Vietnam.svg.png" className="w-12 brightness-0 invert" />
          <div className="font-black text-[10px] uppercase tracking-widest"><span className="text-red-500">National</span><br/>Authority Hub</div>
        </div>
        <nav className="p-6 flex-1 space-y-2">
          {[
            { id: 'OVERVIEW', icon: LayoutDashboard, label: 'Control Center' },
            { id: 'QUEUE', icon: Users, label: 'Inspect Queue' },
            { id: 'REGISTRY', icon: ShieldCheck, label: 'National Registry' },
            { id: 'FINANCE', icon: Banknote, label: 'Payment Hub' },
            { id: 'POLICY', icon: Edit3, label: 'Legal Policies' },
            { id: 'TREASURY', icon: CreditCard, label: 'Fiscal Audit' },
            { id: 'AUDIT', icon: Clock, label: 'System Logs' },
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id as AdminTab); setSearchTerm(''); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest ${activeTab === tab.id ? 'bg-red-600 text-white shadow-xl translate-x-2' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-8 border-t border-white/5">
          <button onClick={() => setIsAuth(false)} className="w-full flex items-center gap-3 text-red-500 font-black uppercase text-[10px] tracking-widest hover:text-red-400"><LogOut className="w-4 h-4" /> Exit Console</button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">{activeTab} MODULE</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Live Database Connection: Shohag2846's Project</p>
            </div>
            <div className="relative w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input placeholder="Search records..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-red-600 shadow-sm" />
            </div>
          </div>

          {activeTab === 'OVERVIEW' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-in fade-in duration-500">
                <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] space-y-4 shadow-xl"><p className="text-[10px] font-black text-red-500 uppercase">Total Files</p><p className="text-5xl font-black">{stats.total}</p></div>
                <div className="p-8 bg-white border rounded-[2.5rem] space-y-4 shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase">Archives</p><p className="text-5xl font-black text-slate-900">{stats.records}</p></div>
                <div className="p-8 bg-white border rounded-[2.5rem] space-y-4 shadow-sm"><p className="text-[10px] font-black text-amber-500 uppercase">In-Queue</p><p className="text-5xl font-black text-slate-900">{stats.pending}</p></div>
                <div className="p-8 bg-emerald-50 border rounded-[2.5rem] space-y-4 shadow-inner"><p className="text-[10px] font-black text-emerald-600 uppercase">Net Revenue</p><p className="text-2xl font-black text-emerald-900">{stats.revenue}</p></div>
            </div>
          )}

          {activeTab === 'FINANCE' && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div className="bg-white p-12 rounded-[4rem] border shadow-sm space-y-10">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1"><h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Payment Gateway Control</h3><p className="text-slate-400 text-sm italic">Manage official Bank and Binance settlement channels.</p></div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-12">
                    {config.paymentMethods.map((method) => (
                      <div key={method.id} className="p-10 bg-slate-50 border border-slate-200 rounded-[3.5rem] space-y-8 group hover:border-red-600 transition-all">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="p-4 bg-white rounded-3xl text-red-600 shadow-sm">{method.id === 'bank_vn' ? <Landmark className="w-8 h-8" /> : <Wallet className="w-8 h-8" />}</div>
                              <h4 className="text-lg font-black uppercase text-slate-900">{method.name}</h4>
                           </div>
                           <button onClick={() => updatePaymentMethod(method.id, { enabled: !method.enabled })} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${method.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{method.enabled ? 'Active' : 'Disabled'}</button>
                        </div>
                        <div className="space-y-4">
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Channel Name</label>
                              <input value={method.name} onChange={e => updatePaymentMethod(method.id, { name: e.target.value })} className="w-full bg-white border p-4 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-red-600" />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Wallet Address / Bank Details</label>
                              <textarea rows={3} value={method.details} onChange={e => updatePaymentMethod(method.id, { details: e.target.value })} className="w-full bg-white border p-4 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-red-600" placeholder="Details..." />
                           </div>
                        </div>
                      </div>
                    ))}
                    <div className="p-10 border-4 border-dashed border-slate-100 rounded-[3.5rem] flex flex-col items-center justify-center space-y-4 text-slate-300 hover:text-red-600 hover:border-red-600 transition-all cursor-pointer">
                       <Plus className="w-12 h-12" /><p className="font-black uppercase text-xs tracking-widest">Add New Financial Channel</p>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'TREASURY' && (
             <div className="space-y-12 animate-in slide-in-from-right-10 duration-500">
                <div className="bg-white rounded-[3rem] border shadow-sm overflow-hidden">
                  <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center"><h3 className="text-sm font-black uppercase text-slate-900">Payment Artifact Registry</h3></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 p-8 gap-8">
                    {applications.filter(a => a.paymentProof).map(app => (
                      <div key={app.id} className="space-y-4 group cursor-pointer" onClick={() => setSelectedAppId(app.id)}>
                         <div className="aspect-[3/4] bg-slate-100 rounded-3xl overflow-hidden border-2 border-slate-100 shadow-sm group-hover:shadow-2xl transition-all relative">
                           <img src={app.paymentProof?.imageUrl} className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Eye className="text-white w-10 h-10" /></div>
                         </div>
                         <div className="px-2">
                           <p className="text-[10px] font-black text-slate-900 uppercase truncate leading-none">{app.fullName}</p>
                           <p className="text-[9px] font-bold text-emerald-600 mt-2 uppercase tracking-tighter bg-emerald-50 inline-block px-2 py-1 rounded-md">{app.paymentStatus}</p>
                         </div>
                      </div>
                    ))}
                    {applications.filter(a => a.paymentProof).length === 0 && <div className="col-span-full py-20 text-center text-slate-300 font-black uppercase text-xs">No settlements found in cloud registry</div>}
                  </div>
                </div>
             </div>
          )}

          {activeTab === 'QUEUE' && (
             <div className="bg-white rounded-[3.5rem] border shadow-sm overflow-hidden animate-in slide-in-from-right-5 duration-500">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b text-[10px] font-black uppercase tracking-widest text-slate-400"><tr><th className="px-10 py-6">ID</th><th className="px-10 py-6">Name</th><th className="px-10 py-6">Status</th><th className="px-10 py-6 text-right">View</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">{filteredApps.map(app => (<tr key={app.id} className="hover:bg-slate-50/80 transition-all"><td className="px-10 py-6 font-mono text-xs font-bold text-slate-400">{app.id}</td><td className="px-10 py-6 font-black text-sm uppercase">{app.fullName}</td><td className="px-10 py-6"><span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${app.status === 'Approved' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-200 text-slate-700'}`}>{app.status}</span></td><td className="px-10 py-6 text-right"><button onClick={() => setSelectedAppId(app.id)} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-red-600 transition-all shadow-sm"><Eye className="w-5 h-5" /></button></td></tr>))}</tbody>
                </table>
             </div>
          )}

          {activeTab === 'AUDIT' && (
             <div className="bg-white rounded-[3rem] border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-400"><tr><th className="px-10 py-6">Timestamp</th><th className="px-10 py-6">Officer</th><th className="px-10 py-6">Action</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">{logs.map(log => (<tr key={log.id} className="hover:bg-slate-50"><td className="px-10 py-6 text-[11px] font-black text-slate-400">{log.timestamp}</td><td className="px-10 py-6 font-black text-red-600 uppercase text-xs">{log.user}</td><td className="px-10 py-6 text-xs font-bold">{log.action} - <span className="text-slate-400 italic font-medium">{log.details}</span></td></tr>))}</tbody>
                </table>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManagementConsole;
