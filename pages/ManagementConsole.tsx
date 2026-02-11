
import React, { useState, useMemo, useEffect } from 'react';
import { useAppConfig } from '../context/ConfigContext';
import { DocType, Application, PaymentMethod, InfoEntry, InfoCategory, DeviceInfo } from '../types';
import { 
  LayoutDashboard, Database, CreditCard, Monitor, LogOut, Search, 
  X, CheckCircle2, Eye, Trash2, Pencil, PlusCircle,
  ShieldCheck, Banknote, User, Globe, Briefcase, Calendar, 
  Loader2, Image as ImageIcon, FileText, AlertCircle, Phone, 
  Mail, Save, ShieldAlert, UserCheck, Download, Printer,
  ChevronRight, ExternalLink, Clock, Plus, Zap, Ban, ShieldX,
  History, Laptop, Tablet, Smartphone, HardDrive, Filter, 
  QrCode, Coins, Landmark, Bell, FilePlus, Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type AdminTab = 'DASHBOARD' | 'APPLICATIONS' | 'REGISTRY' | 'PAYMENT' | 'INFORMATION' | 'DEVICE';

const ManagementConsole: React.FC = () => {
  const { 
    applications, isLoading, config, infoEntries, devices,
    addApplication, updateApplication, deleteApplication,
    addPaymentMethod, updatePaymentMethod, deletePaymentMethod,
    addInfoEntry, updateInfoEntry, deleteInfoEntry,
    registerCurrentDevice, checkDeviceStatus, updateDevice, removeDevice, addLog
  } = useAppConfig();
  
  const [isAuth, setIsAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Application View States
  const [appFilter, setAppFilter] = useState<DocType | 'ALL'>('ALL');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  // Registry Form State
  const [registryType, setRegistryType] = useState<DocType>(DocType.WORK_PERMIT);
  const [regForm, setRegForm] = useState<Partial<Application>>({ status: 'Processing', additional_files: [] });

  // Payment State
  const [isEditingMethod, setIsEditingMethod] = useState(false);
  const [methodForm, setMethodForm] = useState<Partial<PaymentMethod>>({ type: 'Bank', enabled: true });

  // Info State
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState<Partial<InfoEntry>>({ appType: DocType.WORK_PERMIT, category: 'Rules', status: 'Active' });

  // Device Filters
  const [deviceFilterStatus, setDeviceFilterStatus] = useState<string>('ALL');

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get('user') === 'shohag055' && fd.get('pass') === '2846Shohag..') {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      const device = await checkDeviceStatus(ipData.ip);

      if (device && device.status === 'Blocked') {
        alert('Your device has been blocked. Contact Admin.');
        return;
      }
      if (device && device.status === 'Suspended') {
        alert('Access suspended temporarily.');
        return;
      }

      await registerCurrentDevice();
      setIsAuth(true);
      addLog('Admin', 'Login', `Authorized Access from IP: ${ipData.ip}`);
    } else {
      alert('Unauthorized access attempt.');
    }
  };

  const stats = useMemo(() => ({
    wp: applications.filter(a => a.type === DocType.WORK_PERMIT).length,
    visa: applications.filter(a => a.type === DocType.VISA).length,
    trc: applications.filter(a => a.type === DocType.TRC).length,
    active: applications.filter(a => ['Approved', 'Verified', 'Processing'].includes(a.status)).length,
    expired: applications.filter(a => a.status === 'Expired').length,
    total: applications.length
  }), [applications]);

  const filteredApps = useMemo(() => {
    return applications.filter(a => {
      const matchesSearch = a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           a.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           a.id.includes(searchTerm);
      const matchesFilter = appFilter === 'ALL' || a.type === appFilter;
      return matchesSearch && matchesFilter;
    });
  }, [applications, searchTerm, appFilter]);

  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const matchesSearch = d.ip.includes(searchTerm) || d.deviceName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = deviceFilterStatus === 'ALL' || d.status === deviceFilterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [devices, searchTerm, deviceFilterStatus]);

  const handleFileUpload = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === 'additional') {
          setRegForm(prev => ({ ...prev, additional_files: [...(prev.additional_files || []), reader.result as string] }));
        } else {
          setRegForm(prev => ({ ...prev, [field]: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveRegistryRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = regForm.id || `REG-${Date.now().toString().slice(-6)}`;
    const record: Application = {
      ...regForm as Application,
      id,
      type: registryType,
      submissionDate: regForm.submissionDate || new Date().toLocaleDateString(),
      history: [{ date: new Date().toLocaleString(), action: regForm.id ? 'Record Updated' : 'Record Created', by: 'Admin' }]
    };
    if (regForm.id) await updateApplication(id, record);
    else await addApplication(record);
    alert('Registry record saved successfully.');
    setRegForm({ status: 'Processing', additional_files: [] });
  };

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-12 h-12 text-red-600 animate-spin" /></div>;

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md border-t-[14px] border-red-600">
          <div className="text-center mb-10">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Vietnam.svg/200px-Emblem_of_Vietnam.svg.png" className="w-20 mx-auto mb-4" alt="Emblem" />
            <h1 className="text-2xl font-black text-slate-900 uppercase">Executive Portal</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Ministry Access Only</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input name="user" required className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl text-slate-900 font-bold outline-none" placeholder="Username" />
            <input name="pass" type="password" required className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl text-slate-900 font-bold outline-none" placeholder="Password" />
            <button type="submit" className="w-full bg-red-600 text-white font-black py-5 rounded-2xl shadow-xl uppercase transition-all">Authorize Access</button>
          </form>
          <button onClick={() => navigate('/')} className="w-full mt-8 text-[10px] text-slate-300 font-black uppercase text-center hover:text-slate-500">Terminate Session</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-8 bg-slate-950 border-b border-white/5 flex items-center gap-4">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Vietnam.svg/200px-Emblem_of_Vietnam.svg.png" className="w-12 brightness-0 invert" alt="Emblem" />
          <div className="font-black text-xs uppercase tracking-widest text-red-500 leading-tight">National<br/>Admin Console</div>
        </div>
        <nav className="p-6 flex-1 space-y-2">
          {[
            { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'APPLICATIONS', icon: Globe, label: 'Applications' },
            { id: 'REGISTRY', icon: Database, label: 'Registry Record' },
            { id: 'PAYMENT', icon: Banknote, label: 'Payment Desk' },
            { id: 'INFORMATION', icon: Bell, label: 'Public Info' },
            { id: 'DEVICE', icon: ShieldCheck, label: 'Device Guard' },
          ].map(t => (
            <button 
              key={t.id} 
              onClick={() => setActiveTab(t.id as AdminTab)} 
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest ${activeTab === t.id ? 'bg-red-600 text-white shadow-xl' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
               <t.icon className="w-5 h-5" /> {t.label}
            </button>
          ))}
        </nav>
        <div className="p-10 border-t border-white/5">
          <button onClick={() => setIsAuth(false)} className="text-red-500 font-black uppercase text-[10px] flex items-center gap-2 hover:text-red-400"><LogOut className="w-4 h-4" /> Disconnect</button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b pb-8">
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">{activeTab.replace('_', ' ')}</h2>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input placeholder="Search Database..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-full text-[11px] font-bold outline-none focus:border-red-600 shadow-sm" />
            </div>
          </div>

          {activeTab === 'DASHBOARD' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { label: 'Work Permit Applications', val: stats.wp, icon: Briefcase, color: 'bg-red-600', type: DocType.WORK_PERMIT },
                { label: 'Visa Applications', val: stats.visa, icon: Globe, color: 'bg-emerald-600', type: DocType.VISA },
                { label: 'TRC Applications', val: stats.trc, icon: ShieldCheck, color: 'bg-blue-600', type: DocType.TRC },
                { label: 'Active Records', val: stats.active, icon: UserCheck, color: 'bg-slate-900', type: 'ALL' },
                { label: 'Expired Records', val: stats.expired, icon: AlertCircle, color: 'bg-amber-600', type: 'ALL' }
              ].map((stat, i) => (
                <button 
                  key={i} 
                  onClick={() => { setActiveTab('APPLICATIONS'); setAppFilter(stat.type as any); }}
                  className={`${stat.color} p-10 rounded-[3rem] text-white shadow-xl hover:scale-105 transition-all text-left flex flex-col justify-between aspect-video`}
                >
                  <div className="p-4 bg-white/20 rounded-2xl w-fit"><stat.icon className="w-8 h-8" /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">{stat.label}</p>
                    <p className="text-5xl font-black mt-2 tracking-tighter">{stat.val}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'APPLICATIONS' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8">
              <div className="flex gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm w-fit">
                {['ALL', DocType.WORK_PERMIT, DocType.VISA, DocType.TRC].map(f => (
                  <button key={f} onClick={() => setAppFilter(f as any)} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase transition-all ${appFilter === f ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}>{f}</button>
                ))}
              </div>
              
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-400">
                    <tr>
                      <th className="px-8 py-6">App Number</th>
                      <th className="px-8 py-6">Full Name</th>
                      <th className="px-8 py-6">Type</th>
                      <th className="px-8 py-6">Status</th>
                      <th className="px-8 py-6">Expiry</th>
                      <th className="px-8 py-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredApps.map(app => (
                      <tr key={app.id} onClick={() => setSelectedApp(app)} className="hover:bg-slate-50 cursor-pointer group transition-colors">
                        <td className="px-8 py-6 font-mono text-xs font-bold text-red-600">{app.id}</td>
                        <td className="px-8 py-6">
                          <p className="font-black text-slate-900 uppercase text-xs">{app.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{app.passportNumber}</p>
                        </td>
                        <td className="px-8 py-6"><span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black uppercase">{app.type}</span></td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${
                            app.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' :
                            app.status === 'Processing' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                          }`}>{app.status}</span>
                        </td>
                        <td className="px-8 py-6 text-[10px] font-black uppercase text-slate-500">{app.expiryDate || 'N/A'}</td>
                        <td className="px-8 py-6 text-right"><Eye className="inline w-5 h-5 text-slate-300 group-hover:text-red-600" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedApp && (
            <div className="fixed inset-0 z-[1000] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
               <div className="bg-white w-full max-w-6xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col my-10 border-t-[12px] border-red-600">
                  <div className="p-12 border-b bg-slate-50 flex items-center justify-between">
                     <div>
                       <h3 className="text-3xl font-black uppercase tracking-tighter">Application Docket</h3>
                       <p className="text-red-600 font-mono text-sm font-black">{selectedApp.id}</p>
                     </div>
                     <button onClick={() => setSelectedApp(null)} className="p-4 bg-white border border-slate-100 rounded-full hover:text-red-600"><X /></button>
                  </div>
                  
                  <div className="p-12 space-y-12 overflow-y-auto">
                     <div className="grid md:grid-cols-3 gap-12">
                        <section className="space-y-6">
                           <h4 className="text-[10px] font-black uppercase text-red-600 tracking-widest border-b pb-2">Personal Information</h4>
                           <div className="space-y-4">
                              {[
                                { label: 'Full Legal Name', val: selectedApp.fullName },
                                { label: 'Passport Identity', val: selectedApp.passportNumber },
                                { label: 'Nationality', val: selectedApp.nationality },
                                { label: 'Date of Birth', val: selectedApp.dob },
                                { label: 'Gender', val: selectedApp.gender }
                              ].map(f => (
                                <div key={f.label}><p className="text-[8px] font-black uppercase text-slate-400">{f.label}</p><p className="font-bold text-slate-900 uppercase">{f.val}</p></div>
                              ))}
                           </div>
                        </section>
                        <section className="space-y-6">
                           <h4 className="text-[10px] font-black uppercase text-red-600 tracking-widest border-b pb-2">Professional & Sponsor</h4>
                           <div className="space-y-4">
                              {[
                                { label: 'Sponsor Name', val: selectedApp.sponsorName },
                                { label: 'Sponsor Entity', val: selectedApp.sponsorCompany },
                                { label: 'Professional Role', val: selectedApp.jobPosition },
                                { label: 'Vietnam Address', val: selectedApp.vietnamAddress }
                              ].map(f => (
                                <div key={f.label}><p className="text-[8px] font-black uppercase text-slate-400">{f.label}</p><p className="font-bold text-slate-900 uppercase">{f.val || 'Not Registered'}</p></div>
                              ))}
                           </div>
                        </section>
                        <section className="space-y-6">
                           <h4 className="text-[10px] font-black uppercase text-red-600 tracking-widest border-b pb-2">Registry Details</h4>
                           <div className="space-y-4">
                              {[
                                { label: 'Administrative Status', val: selectedApp.status },
                                { label: 'Document Issuance', val: selectedApp.issueDate },
                                { label: 'Registry Expiry', val: selectedApp.expiryDate },
                                { label: 'Payment Status', val: selectedApp.paymentStatus }
                              ].map(f => (
                                <div key={f.label}><p className="text-[8px] font-black uppercase text-slate-400">{f.label}</p><p className="font-bold text-slate-900 uppercase">{f.val}</p></div>
                              ))}
                           </div>
                        </section>
                     </div>

                     <section className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase text-red-600 tracking-widest border-b pb-2">Verification Assets</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
                           {[
                             { label: 'Passport', file: selectedApp.passport_file },
                             { label: 'Identity Photo', file: selectedApp.photo_file },
                             { label: 'Visa Asset', file: selectedApp.visa_file },
                             { label: 'TRC Front', file: selectedApp.trc_file_front },
                             { label: 'TRC Back', file: selectedApp.trc_file_back },
                             { label: 'WP Document', file: selectedApp.wp_file },
                             { label: 'Contract', file: selectedApp.contract_file },
                             { label: 'Payment Receipt', file: selectedApp.payment_receipt_file }
                           ].filter(f => f.file).map(f => (
                             <div key={f.label} className="group relative aspect-[3/4] bg-slate-50 border-2 border-slate-100 rounded-3xl overflow-hidden hover:border-red-600 transition-all cursor-pointer">
                                <img src={f.file} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt={f.label} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                                   <p className="text-[8px] font-black uppercase text-white tracking-widest">{f.label}</p>
                                   <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => setPreviewFile(f.file!)} className="p-2 bg-white/20 text-white rounded-lg"><Eye className="w-3 h-3" /></button>
                                      <a href={f.file} download={`${selectedApp.id}_${f.label}.png`} className="p-2 bg-white/20 text-white rounded-lg"><Download className="w-3 h-3" /></a>
                                   </div>
                                </div>
                             </div>
                           ))}
                        </div>
                     </section>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'REGISTRY' && (
            <div className="space-y-10 animate-in slide-in-from-right-10">
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1">
                     <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Administrative Registry</h3>
                     <p className="text-slate-400 text-xs font-bold italic uppercase tracking-widest">Select category and commit official records to database</p>
                  </div>
                  <select 
                    value={registryType} 
                    onChange={e => { setRegistryType(e.target.value as DocType); setRegForm({ status: 'Processing', additional_files: [] }); }} 
                    className="p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black uppercase text-xs outline-none focus:border-red-600 w-full md:w-80 shadow-inner"
                  >
                    <option value={DocType.WORK_PERMIT}>Work Permit (LD)</option>
                    <option value={DocType.VISA}>Entry Visa (DL/DN)</option>
                    <option value={DocType.TRC}>Residence Card (TRC)</option>
                  </select>
               </div>

               <form onSubmit={saveRegistryRecord} className="bg-white p-12 md:p-16 rounded-[4rem] border border-slate-100 shadow-xl space-y-12">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Full Legal Name *</label><input required value={regForm.fullName} onChange={e => setRegForm({...regForm, fullName: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase" /></div>
                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Passport Number *</label><input required value={regForm.passportNumber} onChange={e => setRegForm({...regForm, passportNumber: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase" /></div>
                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Nationality *</label><input required value={regForm.nationality} onChange={e => setRegForm({...regForm, nationality: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase" /></div>
                     
                     {registryType === DocType.WORK_PERMIT && (
                       <>
                         <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Work Permit #</label><input value={regForm.wpNumber} onChange={e => setRegForm({...regForm, wpNumber: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase" /></div>
                         <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Employer Name</label><input value={regForm.companyName} onChange={e => setRegForm({...regForm, companyName: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase" /></div>
                         <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Job Position</label><input value={regForm.jobPosition} onChange={e => setRegForm({...regForm, jobPosition: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase" /></div>
                       </>
                     )}

                     {registryType === DocType.VISA && (
                       <>
                         <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Visa Type (e.g. DL, DN)</label><input value={regForm.visaType} onChange={e => setRegForm({...regForm, visaType: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase" /></div>
                         <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Entry Format</label><select value={regForm.visaEntryType} onChange={e => setRegForm({...regForm, visaEntryType: e.target.value as any})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase"><option value="Single">Single Entry</option><option value="Multiple">Multiple Entry</option></select></div>
                         <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Visa Number</label><input value={regForm.visaNumber} onChange={e => setRegForm({...regForm, visaNumber: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase" /></div>
                       </>
                     )}

                     {registryType === DocType.TRC && (
                       <>
                         <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">TRC Number</label><input value={regForm.trcNumber} onChange={e => setRegForm({...regForm, trcNumber: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase" /></div>
                         <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Sponsor Name</label><input value={regForm.sponsorName} onChange={e => setRegForm({...regForm, sponsorName: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase" /></div>
                         <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Sponsor Entity</label><input value={regForm.sponsorCompany} onChange={e => setRegForm({...regForm, sponsorCompany: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase" /></div>
                       </>
                     )}

                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Issue Date</label><input type="date" value={regForm.issueDate} onChange={e => setRegForm({...regForm, issueDate: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none" /></div>
                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Expiry Date</label><input type="date" value={regForm.expiryDate} onChange={e => setRegForm({...regForm, expiryDate: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none" /></div>
                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Registry Status</label><select value={regForm.status} onChange={e => setRegForm({...regForm, status: e.target.value as any})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase"><option value="Processing">Processing</option><option value="Approved">Approved</option><option value="Verified">Verified</option><option value="Rejected">Rejected</option><option value="Expired">Expired</option></select></div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-red-600 tracking-widest border-b pb-2">Mandatory Artifacts (File Uploads)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                       {[
                         { field: 'passport_file', label: 'Passport Scan' },
                         { field: 'photo_file', label: 'Identity Photo' },
                         ...(registryType === DocType.WORK_PERMIT ? [
                           { field: 'wp_file', label: 'Work Permit' },
                           { field: 'contract_file', label: 'Contract Paper' }
                         ] : []),
                         ...(registryType === DocType.VISA ? [
                           { field: 'visa_file', label: 'Visa Asset' },
                           { field: 'entry_stamp_file', label: 'Entry Stamp' }
                         ] : []),
                         ...(registryType === DocType.TRC ? [
                           { field: 'trc_file_front', label: 'TRC Front' },
                           { field: 'trc_file_back', label: 'TRC Back' }
                         ] : []),
                         { field: 'additional', label: 'Additional Docs' }
                       ].map(f => (
                         <div key={f.field} className="relative aspect-square bg-slate-50 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-center group hover:border-red-600 transition-all cursor-pointer overflow-hidden">
                            <input type="file" onChange={(e) => handleFileUpload(f.field, e)} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                            {f.field === 'additional' ? <FilePlus className="w-8 h-8 text-slate-300 mb-2 group-hover:text-red-600" /> : <Upload className="w-8 h-8 text-slate-300 mb-2 group-hover:text-red-600" />}
                            <p className="text-[9px] font-black uppercase text-slate-400 group-hover:text-red-600">{f.label}</p>
                            {(regForm as any)[f.field] && f.field !== 'additional' && <div className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-white z-10 font-black uppercase text-[8px] tracking-widest">Attached <CheckCircle2 className="mt-1 w-4 h-4" /></div>}
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-10 border-t">
                     <button type="submit" className="flex-1 py-6 bg-red-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-3 active:scale-95"><Save className="w-5 h-5" /> Commit Record</button>
                     <button type="button" onClick={() => setRegForm({ status: 'Processing', additional_files: [] })} className="px-12 py-6 bg-slate-100 text-slate-400 rounded-3xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Clear Form</button>
                  </div>
               </form>
            </div>
          )}

          {activeTab === 'PAYMENT' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-8">
               <div className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm gap-8">
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Fiscal Configuration</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">Manage administrative settlement channels & Binance Integration</p>
                  </div>
                  <button onClick={() => { setMethodForm({ type: 'Bank', enabled: true }); setIsEditingMethod(true); }} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-3 hover:bg-red-600 transition-all">
                    <PlusCircle className="w-5 h-5" /> New Channel
                  </button>
               </div>

               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {config.paymentMethods.map(m => (
                    <div key={m.id} className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm space-y-8 group relative overflow-hidden">
                       <div className="flex justify-between items-start relative z-10">
                          <div className={`p-5 rounded-3xl ${m.type === 'Binance' ? 'bg-yellow-50 text-yellow-600' : 'bg-emerald-50 text-emerald-600'}`}>
                             {m.type === 'Binance' ? <Coins className="w-10 h-10" /> : <Landmark className="w-10 h-10" />}
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => { setMethodForm(m); setIsEditingMethod(true); }} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-full transition-colors"><Pencil className="w-4 h-4" /></button>
                             <button onClick={() => deletePaymentMethod(m.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-600 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                       </div>
                       <div className="relative z-10 space-y-4">
                          <h4 className="text-2xl font-black uppercase tracking-tight">{m.name}</h4>
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${m.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                             {m.enabled ? 'Operational' : 'Suspended'}
                          </span>
                          <div className="p-4 bg-slate-50 rounded-2xl text-[10px] font-mono font-bold text-slate-500 whitespace-pre-wrap">{m.details}</div>
                          {m.qrCode && <img src={m.qrCode} className="w-24 h-24 mx-auto rounded-xl border border-slate-100 shadow-inner" alt="Payment QR" />}
                       </div>
                    </div>
                  ))}
               </div>

               {isEditingMethod && (
                 <div className="fixed inset-0 z-[1000] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col border-t-[12px] border-slate-900">
                       <div className="p-10 border-b flex items-center justify-between">
                          <h3 className="text-2xl font-black uppercase">Payment Channel Settings</h3>
                          <button onClick={() => setIsEditingMethod(false)} className="p-4 hover:text-red-600"><X /></button>
                       </div>
                       <form className="p-10 space-y-8" onSubmit={async (e) => {
                          e.preventDefault();
                          if (methodForm.id) await updatePaymentMethod(methodForm.id, methodForm);
                          else await addPaymentMethod({ ...methodForm as any, id: `meth_${Date.now()}` });
                          setIsEditingMethod(false);
                       }}>
                          <div className="grid md:grid-cols-2 gap-6">
                             <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Method Name</label><input required value={methodForm.name} onChange={e => setMethodForm({...methodForm, name: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase" /></div>
                             <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Channel Type</label><select value={methodForm.type} onChange={e => setMethodForm({...methodForm, type: e.target.value as any})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase"><option value="Bank">Bank Transfer</option><option value="Binance">Binance Exchange</option><option value="Cash">Physical Cash</option><option value="Online">E-Gateway</option></select></div>
                          </div>
                          
                          <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Account Details / Instructions</label><textarea required rows={4} value={methodForm.details} onChange={e => setMethodForm({...methodForm, details: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none" placeholder="Acc Number, Name, Branch etc..." /></div>
                          
                          {methodForm.type === 'Binance' && (
                             <div className="grid grid-cols-2 gap-6 p-6 bg-yellow-50 rounded-[2.5rem] border border-yellow-100">
                                <div className="space-y-2"><label className="text-[8px] font-black uppercase text-yellow-600">Binance UID</label><input value={methodForm.binanceUid} onChange={e => setMethodForm({...methodForm, binanceUid: e.target.value})} className="w-full p-4 bg-white border-2 border-yellow-100 rounded-xl font-mono text-[10px] font-bold" /></div>
                                <div className="space-y-2"><label className="text-[8px] font-black uppercase text-yellow-600">Network Type</label><input value={methodForm.networkType} onChange={e => setMethodForm({...methodForm, networkType: e.target.value})} className="w-full p-4 bg-white border-2 border-yellow-100 rounded-xl font-bold text-[10px]" placeholder="USDT TRC20" /></div>
                                <div className="col-span-full space-y-2"><label className="text-[8px] font-black uppercase text-yellow-600">Binance Email</label><input value={methodForm.binanceEmail} onChange={e => setMethodForm({...methodForm, binanceEmail: e.target.value})} className="w-full p-4 bg-white border-2 border-yellow-100 rounded-xl font-bold text-[10px]" /></div>
                             </div>
                          )}

                          <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">QR Code / Logo Asset</label><div className="relative p-10 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-center hover:border-red-600 transition-all bg-slate-50 cursor-pointer overflow-hidden"><input type="file" onChange={(e) => {
                             const file = e.target.files?.[0];
                             if (file) {
                               const r = new FileReader();
                               r.onloadend = () => setMethodForm({...methodForm, qrCode: r.result as string});
                               r.readAsDataURL(file);
                             }
                          }} className="absolute inset-0 opacity-0 cursor-pointer z-10" /><QrCode className="mx-auto w-10 h-10 text-slate-300 mb-2" /><p className="text-[10px] font-black uppercase text-slate-400">Upload Image</p>{methodForm.qrCode && <div className="absolute inset-0 bg-emerald-500 flex items-center justify-center text-white text-[10px] font-black uppercase">Asset Ready <CheckCircle2 className="ml-2 w-4 h-4" /></div>}</div></div>

                          <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-red-600 transition-all flex items-center justify-center gap-3"><Save className="w-5 h-5" /> Commit Channel</button>
                       </form>
                    </div>
                 </div>
               )}
            </div>
          )}

          {activeTab === 'INFORMATION' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-8">
               <div className="flex justify-between items-center bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Information Desk</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">Manage Rules, Cost Summaries, and Dispatch Updates</p>
                  </div>
                  <button onClick={() => { setInfoForm({ appType: DocType.WORK_PERMIT, category: 'Rules', status: 'Active' }); setIsEditingInfo(true); }} className="px-10 py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-3 hover:bg-red-700 transition-all">
                    <PlusCircle className="w-5 h-5" /> Dispatch Info
                  </button>
               </div>

               <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-400">
                        <tr>
                           <th className="px-8 py-6">App Category</th>
                           <th className="px-8 py-6">Type</th>
                           <th className="px-8 py-6">Headline</th>
                           <th className="px-8 py-6">Status</th>
                           <th className="px-8 py-6 text-right">Control</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {infoEntries.map(entry => (
                          <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                             <td className="px-8 py-6"><span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black uppercase">{entry.appType}</span></td>
                             <td className="px-8 py-6"><span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${entry.category === 'Cost' ? 'text-emerald-600' : entry.category === 'Update' ? 'text-blue-600' : 'text-slate-400'}`}>{entry.category}</span></td>
                             <td className="px-8 py-6 text-xs font-bold uppercase truncate max-w-md">{entry.title}</td>
                             <td className="px-8 py-6">
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${entry.status === 'Pinned' ? 'bg-red-100 text-red-600 animate-pulse' : entry.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{entry.status}</span>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <div className="flex justify-end gap-2">
                                   <button onClick={() => { setInfoForm(entry); setIsEditingInfo(true); }} className="p-2 text-slate-300 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                                   <button onClick={() => deleteInfoEntry(entry.id)} className="p-2 text-slate-300 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                </div>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               {isEditingInfo && (
                 <div className="fixed inset-0 z-[1000] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col border-t-[12px] border-red-600">
                       <div className="p-10 border-b flex items-center justify-between">
                          <h3 className="text-2xl font-black uppercase">Information Dispatch</h3>
                          <button onClick={() => setIsEditingInfo(false)} className="p-4 hover:text-red-600"><X /></button>
                       </div>
                       <form className="p-10 space-y-8" onSubmit={async (e) => {
                          e.preventDefault();
                          if (infoForm.id) await updateInfoEntry(infoForm.id, infoForm);
                          else await addInfoEntry({ ...infoForm as any, id: `info_${Date.now()}`, date: new Date().toLocaleDateString() });
                          setIsEditingInfo(false);
                       }}>
                          <div className="grid md:grid-cols-2 gap-6">
                             <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Application Area</label><select value={infoForm.appType} onChange={e => setInfoForm({...infoForm, appType: e.target.value as any})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase"><option value={DocType.WORK_PERMIT}>Work Permit</option><option value={DocType.VISA}>Visa</option><option value={DocType.TRC}>Residence Card</option></select></div>
                             <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Topic Category</label><select value={infoForm.category} onChange={e => setInfoForm({...infoForm, category: e.target.value as any})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase"><option value="Rules">Rules & Req</option><option value="Cost">Fees & Costs</option><option value="Update">Policy Updates</option></select></div>
                          </div>
                          <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Dispatch Headline</label><input required value={infoForm.title} onChange={e => setInfoForm({...infoForm, title: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase" /></div>
                          {infoForm.category === 'Cost' && (
                             <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Cost Summary (e.g. 2.5M VND)</label><input required value={infoForm.amount} onChange={e => setInfoForm({...infoForm, amount: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-mono text-emerald-600 font-bold" /></div>
                          )}
                          <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Dossier Content</label><textarea required rows={5} value={infoForm.description} onChange={e => setInfoForm({...infoForm, description: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-medium outline-none" /></div>
                          
                          <div className="flex gap-4">
                             {['Active', 'Inactive', 'Pinned'].map(s => (
                               <button key={s} type="button" onClick={() => setInfoForm({...infoForm, status: s as any})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${infoForm.status === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>{s}</button>
                             ))}
                          </div>

                          <button type="submit" className="w-full py-6 bg-red-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-red-700 flex items-center justify-center gap-3"><Save className="w-5 h-5" /> Commit Dispatch</button>
                       </form>
                    </div>
                 </div>
               )}
            </div>
          )}

          {activeTab === 'DEVICE' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-8">
               <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-4 shadow-xl relative overflow-hidden">
                     <div className="flex justify-between items-start relative z-10"><Monitor className="w-10 h-10 text-red-600" /><ShieldAlert className="w-6 h-6 text-red-600 animate-pulse" /></div>
                     <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase text-white/50 tracking-widest">Total Monitored Nodes</p>
                        <p className="text-5xl font-black tracking-tighter">{devices.length}</p>
                     </div>
                  </div>
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-4">
                     <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl w-fit"><UserCheck className="w-10 h-10" /></div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active & Validated</p>
                        <p className="text-5xl font-black text-slate-900 tracking-tighter">{devices.filter(d => d.status === 'Active').length}</p>
                     </div>
                  </div>
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-4">
                     <div className="p-4 bg-red-50 text-red-600 rounded-2xl w-fit"><ShieldX className="w-10 h-10" /></div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Compromised / Blocked</p>
                        <p className="text-5xl font-black text-slate-900 tracking-tighter">{devices.filter(d => d.status === 'Blocked').length}</p>
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-10 border-b flex flex-wrap items-center gap-6 justify-between bg-slate-50">
                     <div className="flex items-center gap-4"><Monitor className="w-6 h-6 text-red-600" /><h3 className="text-xl font-black uppercase text-slate-900">Device Integrity List</h3></div>
                     <div className="flex gap-2">
                        {['ALL', 'Active', 'Blocked', 'Suspended'].map(s => (
                          <button key={s} onClick={() => setDeviceFilterStatus(s)} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase transition-all ${deviceFilterStatus === s ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 hover:text-slate-600'}`}>{s}</button>
                        ))}
                     </div>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-400">
                           <tr>
                              <th className="px-8 py-6">Hardware / Node</th>
                              <th className="px-8 py-6">Origin (IP)</th>
                              <th className="px-8 py-6">Geo-Location</th>
                              <th className="px-8 py-6">Integrity</th>
                              <th className="px-8 py-6">Timeline</th>
                              <th className="px-8 py-6 text-right">Perimeter Control</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {filteredDevices.map(device => (
                             <tr key={device.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-8 py-6">
                                   <div className="flex items-center gap-4">
                                      <div className="p-3 bg-slate-100 text-slate-500 rounded-xl">
                                         {device.deviceType === 'Mobile' ? <Smartphone className="w-5 h-5" /> : device.deviceType === 'Tablet' ? <Tablet className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                                      </div>
                                      <div>
                                         <p className="font-black text-xs uppercase text-slate-900">{device.deviceName}</p>
                                         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{device.browser} / {device.os}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-8 py-6 font-mono text-xs font-bold text-slate-400"><div className="flex items-center gap-2"><HardDrive className="w-3.5 h-3.5" /> {device.ip}</div></td>
                                <td className="px-8 py-6">
                                   <div className="text-[9px] font-black uppercase">
                                      <p className="text-slate-900">{device.country}</p>
                                      <p className="text-slate-400 italic">{device.city}, {device.region}</p>
                                   </div>
                                </td>
                                <td className="px-8 py-6">
                                   <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${
                                      device.status === 'Active' ? 'bg-emerald-100 text-emerald-600' :
                                      device.status === 'Blocked' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                   }`}>{device.status}</span>
                                </td>
                                <td className="px-8 py-6 text-[9px] font-black uppercase text-slate-400">
                                   <p>Last: {new Date(device.lastActive).toLocaleTimeString()}</p>
                                   <p className="italic">Login: {new Date(device.loginTime).toLocaleDateString()}</p>
                                </td>
                                <td className="px-8 py-6 text-right">
                                   <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {device.status === 'Active' ? (
                                        <>
                                           <button onClick={() => updateDevice(device.id, 'Suspended')} className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-lg transition-all" title="Suspend"><Ban className="w-4 h-4" /></button>
                                           <button onClick={() => updateDevice(device.id, 'Blocked')} className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all" title="Block"><ShieldX className="w-4 h-4" /></button>
                                        </>
                                      ) : (
                                        <button onClick={() => updateDevice(device.id, 'Active')} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all" title="Trust"><UserCheck className="w-4 h-4" /></button>
                                      )}
                                      <button onClick={() => removeDevice(device.id)} className="p-2 bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white rounded-lg transition-all" title="Flush"><Trash2 className="w-4 h-4" /></button>
                                   </div>
                                </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
          )}

        </div>
      </main>

      {/* Media Previews */}
      {previewFile && (
        <div className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-8 animate-in zoom-in duration-500">
           <button onClick={() => setPreviewFile(null)} className="absolute top-10 right-10 p-6 bg-white/10 text-white rounded-full hover:bg-red-600 transition-all shadow-2xl"><X className="w-10 h-10" /></button>
           <div className="max-w-6xl w-full max-h-[85vh] bg-white rounded-[4rem] p-3 shadow-2xl overflow-hidden relative border-4 border-white/20">
              <img src={previewFile} className="w-full h-full object-contain rounded-[3.5rem]" alt="Secure Artifact" />
           </div>
        </div>
      )}
    </div>
  );
};

export default ManagementConsole;
