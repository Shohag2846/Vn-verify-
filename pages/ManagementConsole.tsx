
import React, { useState, useMemo, useEffect } from 'react';
import { useAppConfig } from '../context/ConfigContext';
import { DocType, Application, PaymentMethod, InfoEntry, InfoCategory, DeviceInfo, OfficialRecord } from '../types';
import { 
  LayoutDashboard, Database, CreditCard, Monitor, LogOut, Search, 
  X, CheckCircle2, Eye, Trash2, Pencil, PlusCircle,
  ShieldCheck, Banknote, User, Globe, Briefcase, Calendar, 
  Loader2, Image as ImageIcon, FileText, AlertCircle, Phone, 
  Mail, Save, ShieldAlert, UserCheck, Download, Printer,
  ChevronRight, ExternalLink, Clock, Plus, Zap, Ban, ShieldX,
  History, Laptop, Tablet, Smartphone, HardDrive, Filter, 
  QrCode, Coins, Landmark, Bell, FilePlus, Upload, Paperclip, File as FileIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type AdminTab = 'DASHBOARD' | 'APPLICATIONS' | 'REGISTRY' | 'PAYMENT' | 'INFORMATION' | 'DEVICE';

const ManagementConsole: React.FC = () => {
  const { 
    applications, isLoading, config, infoEntries, devices, records,
    addApplication, updateApplication, deleteApplication,
    addPaymentMethod, updatePaymentMethod, deletePaymentMethod,
    addInfoEntry, updateInfoEntry, deleteInfoEntry,
    addRecord, updateRecord, deleteRecord,
    registerCurrentDevice, checkDeviceStatus, updateDevice, removeDevice, addLog
  } = useAppConfig();
  
  const [isAuth, setIsAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Application/Record View States
  const [appFilter, setAppFilter] = useState<DocType | 'ALL'>('ALL');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [viewingRecord, setViewingRecord] = useState<OfficialRecord | null>(null);
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  // Registry Form State (Official Records)
  const [registryType, setRegistryType] = useState<DocType>(DocType.WORK_PERMIT);
  const [regForm, setRegForm] = useState<Partial<OfficialRecord>>({ 
    status: 'Processing' as any,
    fullName: '',
    passportNumber: '',
    nationality: '',
    email: '',
    phone: '',
    dob: '',
    company_name: '',
    issueDate: '',
    expiryDate: ''
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
    const user = fd.get('user');
    const pass = fd.get('pass');

    if (user === 'shohag055' && pass === '2846Shohag..') {
      let ip = 'Unknown';
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json').catch(() => null);
        if (ipRes && ipRes.ok) {
          const data = await ipRes.json();
          ip = data.ip;
        }
      } catch (err) {
        console.warn("IP fetch failed, security check proceeding with headers...");
      }

      const device = await checkDeviceStatus(ip);
      if (device && device.status === 'Blocked') {
        alert('SECURITY ALERT: This device has been blacklisted. Contact main administration.');
        return;
      }
      if (device && device.status === 'Suspended') {
        alert('ACCESS SUSPENDED: Temporary restriction active for this terminal.');
        return;
      }

      await registerCurrentDevice();
      setIsAuth(true);
      addLog('Admin', 'Login', `Authorized Access from ${ip}`);
    } else {
      alert('Authentication Failure: Invalid Credentials.');
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

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           r.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           r.id.includes(searchTerm);
      return matchesSearch;
    });
  }, [records, searchTerm]);

  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const matchesSearch = d.ip.includes(searchTerm) || d.deviceName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = deviceFilterStatus === 'ALL' || d.status === deviceFilterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [devices, searchTerm, deviceFilterStatus]);

  const startEditApplication = (app: Application) => {
    setRegistryType(app.type);
    setRegForm({
      id: app.id,
      fullName: app.fullName,
      passportNumber: app.passportNumber,
      nationality: app.nationality,
      email: app.email,
      phone: app.phone,
      status: app.status,
      issueDate: app.issueDate,
      expiryDate: app.expiryDate,
      sponsorCompany: app.sponsorCompany,
      jobTitle: app.jobPosition,
      dob: app.dob,
      company_name: app.companyName || app.sponsorCompany || '',
      passport_copy: app.passport_file,
      visa_copy: app.visa_file,
      trc_copy: app.trc_file_front || app.trc_file,
      pdfUrl: app.payment_receipt_file || ''
    });
    setActiveTab('REGISTRY');
    setTimeout(() => document.getElementById('registry-form-anchor')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const startEditRecord = (rec: OfficialRecord) => {
    setRegistryType(rec.type);
    setRegForm({ ...rec });
    setUploadFile(null);
    setActiveTab('REGISTRY');
    setTimeout(() => document.getElementById('registry-form-anchor')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleDeleteRecord = async (rec: OfficialRecord) => {
    if (!confirm('Are you sure you want to permanently delete this official record?')) return;
    
    try {
      if (rec.file_url && rec.file_url.includes('/documents/')) {
        const urlParts = rec.file_url.split('/documents/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1].split('?')[0];
          await supabase.storage.from('documents').remove([filePath]);
        }
      }
      
      await deleteRecord(rec.id);
      addLog('Admin', 'Delete Record', `Deleted record ${rec.id} (${rec.fullName})`);
    } catch (err: any) {
      alert(`Deletion failed: ${err.message || 'System error'}`);
    }
  };

  const handleDownload = (dataUrl: string | undefined, filename: string) => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveRegistryRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;
    
    setIsUploading(true);

    try {
      let finalFileUrl = regForm.file_url || '';

      if (uploadFile) {
        const fileExt = uploadFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, uploadFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);
          
        finalFileUrl = publicUrl;
      }

      const existingId = regForm.id;
      const id = existingId || `REC-${Date.now().toString().slice(-6)}`;
      
      const recordData: OfficialRecord = {
        id,
        fullName: regForm.fullName || '',
        passportNumber: regForm.passportNumber || '',
        nationality: regForm.nationality || '',
        email: regForm.email || '',
        phone: regForm.phone || '',
        dob: regForm.dob || '',
        company_name: regForm.company_name || '',
        status: regForm.status || ('Processing' as any),
        issueDate: regForm.issueDate || '',
        expiryDate: regForm.expiryDate || '',
        type: registryType,
        pdfUrl: regForm.pdfUrl || 'https://link.gov.vn/verify',
        file_url: finalFileUrl,
        sponsorCompany: regForm.sponsorCompany,
        jobTitle: regForm.jobTitle,
        passport_copy: regForm.passport_copy,
        visa_copy: regForm.visa_copy,
        trc_copy: regForm.trc_copy
      };
      
      if (existingId) {
        // Handle Update
        await updateRecord(id, recordData);
        
        // Sync with applications table if ID matches
        const appExists = applications.find(a => a.id === id);
        if (appExists) {
          await updateApplication(id, { 
            fullName: recordData.fullName, 
            status: recordData.status, 
            issueDate: recordData.issueDate, 
            expiryDate: recordData.expiryDate,
            dob: recordData.dob,
            companyName: recordData.company_name // Note the camelCase in applications table
          });
        }
        addLog('Admin', 'Update Record', `Updated record ${id}`);
        alert('Registry Entry Updated Successfully.');
      } else {
        // Handle Create
        await addRecord(recordData);
        addLog('Admin', 'Create Record', `Created new record ${id}`);
        alert('New Registry Entry Committed.');
      }
      
      // Reset and Refresh
      setRegForm({ 
        status: 'Processing' as any,
        fullName: '', passportNumber: '', nationality: '', email: '', phone: '', dob: '', company_name: '', issueDate: '', expiryDate: ''
      });
      setUploadFile(null);
      setActiveTab('REGISTRY');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error("Save Error:", err);
      alert(`Operation Failed: ${err.message || 'Check connection and required fields.'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const isImage = (url?: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('.png') || lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.webp') || url.startsWith('data:image');
  };

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-12 h-12 text-red-600 animate-spin" /></div>;

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md border-t-[14px] border-red-600 animate-in zoom-in duration-500">
          <div className="text-center mb-10">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Vietnam.svg/200px-Emblem_of_Vietnam.svg.png" className="w-20 mx-auto mb-4" alt="Emblem" />
            <h1 className="text-2xl font-black text-slate-900 uppercase">Executive Portal</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">National Administrative Access</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input name="user" required className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl text-slate-900 font-bold outline-none focus:border-red-600 transition-all" placeholder="Username" />
            <input name="pass" type="password" required className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl text-slate-900 font-bold outline-none focus:border-red-600 transition-all" placeholder="Password" />
            <button type="submit" className="w-full bg-red-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-red-700 uppercase transition-all">Authorize Terminal</button>
          </form>
          <button onClick={() => navigate('/')} className="w-full mt-8 text-[10px] text-slate-300 font-black uppercase text-center hover:text-slate-500">Terminate Connection</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 overflow-hidden">
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
              onClick={() => { setActiveTab(t.id as AdminTab); setSelectedApp(null); setViewingRecord(null); }} 
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest ${activeTab === t.id ? 'bg-red-600 text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
               <t.icon className="w-5 h-5" /> {t.label}
            </button>
          ))}
        </nav>
        <div className="p-10 border-t border-white/5">
          <button onClick={() => setIsAuth(false)} className="text-red-500 font-black uppercase text-[10px] flex items-center gap-2 hover:text-red-400 transition-colors"><LogOut className="w-4 h-4" /> Disconnect</button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-12 pb-24">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b pb-8">
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">{activeTab}</h2>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input placeholder="Filter Database..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-full text-[11px] font-bold outline-none focus:border-red-600 shadow-sm" />
            </div>
          </div>

          {activeTab === 'DASHBOARD' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
              {[
                { label: 'Work Permits', val: stats.wp, icon: Briefcase, color: 'bg-red-600', type: DocType.WORK_PERMIT },
                { label: 'Visa Files', val: stats.visa, icon: Globe, color: 'bg-emerald-600', type: DocType.VISA },
                { label: 'TRC Assets', val: stats.trc, icon: ShieldCheck, color: 'bg-blue-600', type: DocType.TRC },
                { label: 'Validated Records', val: stats.active, icon: UserCheck, color: 'bg-slate-900', type: 'ALL' },
                { label: 'Terminated Files', val: stats.expired, icon: AlertCircle, color: 'bg-amber-600', type: 'ALL' }
              ].map((stat, i) => (
                <button 
                  key={i} 
                  onClick={() => { setActiveTab('APPLICATIONS'); setAppFilter(stat.type as any); }}
                  className={`${stat.color} p-10 rounded-[3rem] text-white shadow-xl hover:scale-105 transition-all text-left flex flex-col justify-between aspect-video group`}
                >
                  <div className="p-4 bg-white/20 rounded-2xl w-fit group-hover:bg-white/30 transition-colors"><stat.icon className="w-8 h-8" /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">{stat.label}</p>
                    <p className="text-5xl font-black mt-2 tracking-tighter">{stat.val}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'APPLICATIONS' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
              <div className="flex gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm w-fit">
                {['ALL', DocType.WORK_PERMIT, DocType.VISA, DocType.TRC].map(f => (
                  <button key={f} onClick={() => setAppFilter(f as any)} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase transition-all ${appFilter === f ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{f}</button>
                ))}
              </div>
              
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-400">
                    <tr>
                      <th className="px-8 py-6">Identity ID</th>
                      <th className="px-8 py-6">Subject Name</th>
                      <th className="px-8 py-6">Document Type</th>
                      <th className="px-8 py-6">Dossier Status</th>
                      <th className="px-8 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredApps.length > 0 ? filteredApps.map(app => (
                      <tr key={app.id} className="hover:bg-slate-50 group transition-colors">
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
                        <td className="px-8 py-6 text-right">
                           <div className="flex justify-end gap-3">
                              <button onClick={() => setSelectedApp(app)} className="p-2 text-slate-300 hover:text-red-600 transition-colors" title="View Detail"><Eye className="w-5 h-5" /></button>
                              <button onClick={() => startEditApplication(app)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors" title="Process to Registry"><Pencil className="w-5 h-5" /></button>
                              <button onClick={() => { if(confirm('Permanently delete application?')) deleteApplication(app.id); }} className="p-2 text-slate-300 hover:text-red-600 transition-colors" title="Delete"><Trash2 className="w-5 h-5" /></button>
                           </div>
                        </td>
                      </tr>
                    )) : <tr><td colSpan={5} className="py-20 text-center text-slate-300 italic uppercase font-black tracking-widest">No Applications Located</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'REGISTRY' && (
            <div className="space-y-16 animate-in slide-in-from-right-10 duration-500">
               
               {/* 1. Registered Records List */}
               <section className="space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3"><Database className="text-red-600" /> Registered Records List</h3>
                     <span className="bg-slate-100 px-4 py-1 rounded-full text-[10px] font-black uppercase text-slate-500">{filteredRecords.length} Official Entries</span>
                  </div>
                  <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                      <thead className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-400">
                        <tr>
                          <th className="px-8 py-6">Full Name</th>
                          <th className="px-8 py-6">Passport Number</th>
                          <th className="px-8 py-6">DOB</th>
                          <th className="px-8 py-6">Company Name</th>
                          <th className="px-8 py-6">File Preview</th>
                          <th className="px-8 py-6 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredRecords.length > 0 ? filteredRecords.map(rec => (
                          <tr key={rec.id} className="hover:bg-slate-50 group transition-colors">
                            <td className="px-8 py-6">
                               <p className="font-black text-slate-900 uppercase text-xs leading-none">{rec.fullName}</p>
                               <p className="text-[8px] font-black uppercase text-slate-400 mt-1 tracking-widest">{rec.type}</p>
                            </td>
                            <td className="px-8 py-6">
                               <p className="text-[10px] text-slate-900 font-bold uppercase">{rec.passportNumber}</p>
                            </td>
                            <td className="px-8 py-6">
                               <p className="text-[10px] text-slate-600 font-bold">{rec.dob || '---'}</p>
                            </td>
                            <td className="px-8 py-6">
                               <p className="text-[10px] text-slate-600 font-bold uppercase">{rec.company_name || '---'}</p>
                            </td>
                            <td className="px-8 py-6">
                               {rec.file_url ? (
                                 <div className="flex items-center gap-3">
                                   {isImage(rec.file_url) ? (
                                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:border-red-600" onClick={() => setPreviewFile(rec.file_url!)}>
                                        <img src={rec.file_url} className="w-full h-full object-cover" alt="Thumb" />
                                      </div>
                                   ) : (
                                      <button onClick={() => window.open(rec.file_url, '_blank')} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center gap-2">
                                        <FileIcon className="w-4 h-4" /> <span className="text-[8px] font-black uppercase">View PDF</span>
                                      </button>
                                   )}
                                   <button onClick={() => handleDownload(rec.file_url, `${rec.passportNumber}_doc`)} className="p-2 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-lg"><Download className="w-4 h-4" /></button>
                                 </div>
                               ) : (
                                 <span className="text-[9px] font-black uppercase text-slate-300 italic">No File Uploaded</span>
                               )}
                            </td>
                            <td className="px-8 py-6 text-right">
                               <div className="flex justify-end gap-3">
                                  <button onClick={() => setViewingRecord(rec)} className="p-2 text-slate-300 hover:text-red-600 transition-colors" title="View Dossier"><Eye className="w-5 h-5" /></button>
                                  <button onClick={() => startEditRecord(rec)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors" title="Edit Record"><Pencil className="w-5 h-5" /></button>
                                  <button onClick={() => handleDeleteRecord(rec)} className="p-2 text-slate-300 hover:text-red-600 transition-colors" title="Delete"><Trash2 className="w-5 h-5" /></button>
                               </div>
                            </td>
                          </tr>
                        )) : <tr><td colSpan={6} className="py-20 text-center text-slate-300 italic uppercase font-black tracking-widest">No registered records found.</td></tr>}
                      </tbody>
                    </table>
                  </div>
               </section>

               <div id="registry-form-anchor" className="h-px bg-slate-200" />

               {/* 2. Official Registry Entry Form */}
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1">
                     <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                        {regForm.id ? `Editing Record: ${regForm.id}` : 'Official Intake Engine'}
                     </h3>
                     <p className="text-slate-400 text-[10px] font-bold italic uppercase tracking-widest">Commit verified government documents with automated storage sync</p>
                  </div>
                  <div className="flex gap-2 bg-slate-100 p-2 rounded-2xl w-full md:w-fit">
                    {[DocType.WORK_PERMIT, DocType.VISA, DocType.TRC].map(type => (
                      <button 
                        key={type}
                        onClick={() => { setRegistryType(type); setRegForm({ status: 'Processing' as any }); setUploadFile(null); }}
                        className={`flex-1 md:px-6 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${registryType === type ? 'bg-white shadow-md text-red-600' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {type.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
               </div>

               <form onSubmit={saveRegistryRecord} className="bg-white p-12 md:p-16 rounded-[4rem] border border-slate-100 shadow-xl space-y-12">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Full Legal Name *</label><input required value={regForm.fullName || ''} onChange={e => setRegForm({...regForm, fullName: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase focus:border-red-600 outline-none" /></div>
                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Passport Identity *</label><input required value={regForm.passportNumber || ''} onChange={e => setRegForm({...regForm, passportNumber: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase focus:border-red-600 outline-none" /></div>
                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Date of Birth (DOB) *</label><input required type="date" value={regForm.dob || ''} onChange={e => setRegForm({...regForm, dob: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-red-600" /></div>
                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Company Name *</label><input required value={regForm.company_name || ''} onChange={e => setRegForm({...regForm, company_name: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase focus:border-red-600 outline-none" /></div>
                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">National Origin *</label><input required value={regForm.nationality || ''} onChange={e => setRegForm({...regForm, nationality: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase focus:border-red-600 outline-none" /></div>
                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Contact Email *</label><input required value={regForm.email || ''} onChange={e => setRegForm({...regForm, email: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-red-600 outline-none" /></div>
                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Contact Phone *</label><input required value={regForm.phone || ''} onChange={e => setRegForm({...regForm, phone: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-red-600 outline-none" /></div>
                     
                     {registryType === DocType.WORK_PERMIT && (
                       <>
                         <div className="space-y-2 animate-in fade-in"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">WP Certificate #</label><input value={regForm.id?.startsWith('REC-') ? '' : regForm.id || ''} onChange={e => setRegForm({...regForm, id: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase focus:border-red-600 outline-none" placeholder="WP-000000" /></div>
                         <div className="space-y-2 animate-in fade-in"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Occupational Title</label><input value={regForm.jobTitle || ''} onChange={e => setRegForm({...regForm, jobTitle: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase focus:border-red-600 outline-none" /></div>
                       </>
                     )}

                     {registryType === DocType.VISA && (
                       <>
                         <div className="space-y-2 animate-in fade-in"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Visa Control Number</label><input value={regForm.id?.startsWith('REC-') ? '' : regForm.id || ''} onChange={e => setRegForm({...regForm, id: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase focus:border-red-600 outline-none" placeholder="V-000000" /></div>
                         <div className="space-y-2 animate-in fade-in"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Visa Index (DL/DN/LD)</label><input value={regForm.visa_copy || ''} onChange={e => setRegForm({...regForm, visa_copy: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase focus:border-red-600 outline-none" /></div>
                         <div className="space-y-2 animate-in fade-in"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Entry Multiplicity</label><select className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase"><option>Single Entry</option><option>Multiple Entry</option></select></div>
                       </>
                     )}

                     {registryType === DocType.TRC && (
                       <>
                         <div className="space-y-2 animate-in fade-in"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Card Identification #</label><input value={regForm.id?.startsWith('REC-') ? '' : regForm.id || ''} onChange={e => setRegForm({...regForm, id: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase focus:border-red-600 outline-none" placeholder="T-000000" /></div>
                         <div className="space-y-2 animate-in fade-in"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Residency Type</label><input className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase focus:border-red-600 outline-none" placeholder="LD / DT / TT" /></div>
                       </>
                     )}

                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Administrative Issue</label><input type="date" value={regForm.issueDate || ''} onChange={e => setRegForm({...regForm, issueDate: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-red-600" /></div>
                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Final Expiry Date</label><input type="date" value={regForm.expiryDate || ''} onChange={e => setRegForm({...regForm, expiryDate: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-red-600" /></div>
                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Authentication Status</label><select value={regForm.status} onChange={e => setRegForm({...regForm, status: e.target.value as any})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase outline-none focus:border-red-600"><option value="Verified">Verified</option><option value="Processing">Processing</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option><option value="Expired">Expired</option></select></div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-red-600 tracking-widest border-b pb-2 flex items-center gap-2"><Upload className="w-3 h-3" /> Digital Dossier Asset</h4>
                    <div className="max-w-md">
                      <div className="relative aspect-video bg-slate-50 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-center group hover:border-red-600 transition-all cursor-pointer overflow-hidden shadow-inner">
                        <input 
                          type="file" 
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)} 
                          className="absolute inset-0 opacity-0 cursor-pointer z-[40]" 
                          title="Click to select file"
                        />
                        
                        {uploadFile ? (
                           <div className="flex flex-col items-center gap-2 pointer-events-none">
                             <FileIcon className="w-12 h-12 text-red-600" />
                             <p className="text-[10px] font-black uppercase text-slate-900 truncate px-4 max-w-full">{uploadFile.name}</p>
                             <p className="text-[8px] font-bold text-slate-400 uppercase">File Staged for Upload</p>
                           </div>
                        ) : regForm.file_url ? (
                           <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-100/80 pointer-events-none">
                             {isImage(regForm.file_url) ? <img src={regForm.file_url} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="Asset Preview" /> : <FileIcon className="w-12 h-12 text-slate-300" />}
                             <div className="relative z-10 text-center bg-white/60 p-4 rounded-2xl backdrop-blur-sm border border-white/40">
                                <p className="text-[10px] font-black uppercase text-red-600">Existing Asset Connected</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase">Click area to Replace</p>
                             </div>
                           </div>
                        ) : (
                          <div className="pointer-events-none">
                            <FilePlus className="w-10 h-10 text-slate-300 mb-2 group-hover:text-red-600 transition-colors" />
                            <p className="text-[10px] font-black uppercase text-slate-400 group-hover:text-red-600 transition-colors">Select Official Document (PDF/JPG)</p>
                          </div>
                        )}
                      </div>
                      {(uploadFile || regForm.file_url) && (
                        <button type="button" onClick={() => { setUploadFile(null); setRegForm({...regForm, file_url: ''}); }} className="mt-4 text-[8px] font-black uppercase text-red-400 hover:text-red-600 flex items-center gap-2 transition-colors"><Trash2 className="w-3 h-3" /> Clear Active Asset Selection</button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-10 border-t">
                     <button 
                       type="submit" 
                       disabled={isUploading} 
                       className="flex-1 py-6 bg-red-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 active:scale-95"
                     >
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {regForm.id ? 'Update Final Record' : 'Commit to archives'}
                     </button>
                     <button type="button" onClick={() => { 
                       if(confirm('Are you sure you want to reset the form? Unsaved changes will be lost.')) {
                         setRegForm({ 
                           status: 'Processing' as any,
                           fullName: '', passportNumber: '', nationality: '', email: '', phone: '', dob: '', company_name: '', issueDate: '', expiryDate: ''
                         }); 
                         setUploadFile(null); 
                       }
                     }} className="px-12 py-6 bg-slate-100 text-slate-400 rounded-3xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Reset Intake</button>
                  </div>
               </form>
            </div>
          )}

          {activeTab === 'PAYMENT' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-500">
               <div className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm gap-8">
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Fiscal Channels</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">Management of administrative settlement methods & Binance configuration</p>
                  </div>
                  <button onClick={() => { setMethodForm({ type: 'Bank', enabled: true }); setIsEditingMethod(true); }} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-3 hover:bg-red-600 transition-all">
                    <PlusCircle className="w-5 h-5" /> New Endpoint
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
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

        </div>
      </main>

      {/* VIEW MODAL: Detailed Official Record Dossier */}
      {viewingRecord && (
         <div className="fixed inset-0 z-[1000] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
            <div className="bg-white w-full max-w-5xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col my-10 border-t-[14px] border-red-600 animate-in zoom-in duration-300">
               <div className="p-12 border-b bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                     <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-xl"><Database className="w-8 h-8" /></div>
                     <div>
                       <h3 className="text-3xl font-black uppercase tracking-tighter">Registry Dossier</h3>
                       <p className="text-red-600 font-mono text-sm font-black tracking-widest">{viewingRecord.id}</p>
                     </div>
                  </div>
                  <button onClick={() => setViewingRecord(null)} className="p-4 bg-white border border-slate-100 rounded-full hover:text-red-600 shadow-sm transition-all"><X /></button>
               </div>
               
               <div className="p-12 space-y-12 overflow-y-auto max-h-[70vh]">
                  <div className="grid md:grid-cols-2 gap-12">
                     <section className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase text-red-600 tracking-widest border-b pb-2 flex items-center gap-2"><User className="w-3 h-3" /> Identity Extraction</h4>
                        <div className="space-y-4">
                           {[
                             { label: 'Subject Full Name', val: viewingRecord.fullName },
                             { label: 'Passport Identity', val: viewingRecord.passportNumber },
                             { label: 'Date of Birth', val: viewingRecord.dob },
                             { label: 'Nationality', val: viewingRecord.nationality },
                             { label: 'Contact Email', val: viewingRecord.email },
                             { label: 'Liaison Phone', val: viewingRecord.phone }
                           ].map(f => (
                             <div key={f.label}><p className="text-[8px] font-black uppercase text-slate-400">{f.label}</p><p className="font-bold text-slate-900 uppercase text-base">{f.val || '---'}</p></div>
                           ))}
                        </div>
                     </section>
                     <section className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase text-red-600 tracking-widest border-b pb-2 flex items-center gap-2"><Globe className="w-3 h-3" /> Administrative Context</h4>
                        <div className="space-y-4">
                           {[
                             { label: 'Record Category', val: viewingRecord.type },
                             { label: 'Authentication Status', val: viewingRecord.status },
                             { label: 'Issuance Timeline', val: viewingRecord.issueDate },
                             { label: 'Expiry Deadline', val: viewingRecord.expiryDate },
                             { label: 'Associated Company', val: viewingRecord.company_name || viewingRecord.sponsorCompany || '---' }
                           ].map(f => (
                             <div key={f.label}><p className="text-[8px] font-black uppercase text-slate-400">{f.label}</p><p className="font-bold text-slate-900 uppercase text-base">{f.val || '---'}</p></div>
                           ))}
                        </div>
                     </section>
                  </div>

                  <section className="space-y-6">
                     <h4 className="text-[10px] font-black uppercase text-red-600 tracking-widest border-b pb-2 flex items-center gap-2"><ImageIcon className="w-3 h-3" /> Official Credentials Upload</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {viewingRecord.file_url ? (
                           <div className="group relative aspect-video bg-slate-50 border-2 border-slate-100 rounded-3xl overflow-hidden hover:border-red-600 transition-all">
                             {isImage(viewingRecord.file_url) ? (
                                <img src={viewingRecord.file_url!} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="Artifact" />
                             ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                                  <FileIcon className="w-16 h-16 text-slate-200" />
                                  <p className="text-[10px] font-black uppercase text-slate-400">PDF Documentation</p>
                                </div>
                             )}
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                                <div className="flex gap-2 mt-2">
                                   <button onClick={() => isImage(viewingRecord.file_url) ? setPreviewFile(viewingRecord.file_url!) : window.open(viewingRecord.file_url, '_blank')} className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-[8px] font-black uppercase">
                                     <Eye className="w-3 h-3" /> {isImage(viewingRecord.file_url) ? 'Preview' : 'Open PDF'}
                                   </button>
                                   <button onClick={() => handleDownload(viewingRecord.file_url!, `${viewingRecord.id}_artifact`)} className="p-2 bg-white/20 text-white rounded-lg hover:bg-emerald-600 transition-colors"><Download className="w-3 h-3" /></button>
                                </div>
                             </div>
                          </div>
                        ) : (
                          <div className="p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                            <AlertCircle className="w-8 h-8 text-slate-200 mb-2" />
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">No Digital Assets Attached</p>
                          </div>
                        )}
                     </div>
                  </section>
               </div>
               <div className="p-12 bg-slate-50 border-t flex justify-end gap-4">
                  <button onClick={() => startEditRecord(viewingRecord)} className="px-10 py-4 bg-white border-2 border-blue-50 text-blue-600 rounded-2xl font-black uppercase text-[10px] hover:bg-blue-600 hover:text-white transition-all">Modify Record</button>
                  <button onClick={() => setViewingRecord(null)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl hover:bg-red-600 transition-all">Dismiss</button>
               </div>
            </div>
         </div>
      )}

      {/* ARTIFACT FULLSCREEN PREVIEW */}
      {previewFile && (
        <div className="fixed inset-0 z-[2000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-8 animate-in zoom-in duration-500">
           <button onClick={() => setPreviewFile(null)} className="absolute top-10 right-10 p-6 bg-white/10 text-white rounded-full hover:bg-red-600 transition-all shadow-2xl active:scale-90"><X className="w-10 h-10" /></button>
           <div className="max-w-6xl w-full max-h-[85vh] bg-white rounded-[4rem] p-3 shadow-2xl overflow-hidden relative border-4 border-white/20">
              <img src={previewFile} className="w-full h-full object-contain rounded-[3.5rem]" alt="Registry Artifact" />
           </div>
        </div>
      )}
    </div>
  );
};

export default ManagementConsole;
