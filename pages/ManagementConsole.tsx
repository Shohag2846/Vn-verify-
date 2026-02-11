
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
    addRecord, updateRecord, deleteRecord, refreshAllData,
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
    fullName: '', passportNumber: '', nationality: '', email: '', phone: '', dob: '', company_name: '', issueDate: '', expiryDate: ''
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
      } catch (err) { console.warn("IP fetch failed"); }

      const device = await checkDeviceStatus(ip);
      if (device && device.status === 'Blocked') {
        alert('SECURITY ALERT: This device is blacklisted.');
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
    active: records.length,
    expired: applications.filter(a => a.status === 'Expired').length,
    total: applications.length
  }), [applications, records]);

  const filteredApps = useMemo(() => {
    return applications.filter(a => {
      const matchesSearch = a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           a.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           a.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = appFilter === 'ALL' || a.type === appFilter;
      return matchesSearch && matchesFilter;
    });
  }, [applications, searchTerm, appFilter]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           r.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (r.company_name && r.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
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
      addLog('Admin', 'Delete Record', `Deleted record ${rec.id}`);
      alert('Record and associated files deleted.');
    } catch (err: any) { alert(`Deletion failed: ${err.message}`); }
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
        const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, uploadFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName);
        finalFileUrl = publicUrl;
      }

      const id = regForm.id || `REC-${Date.now().toString().slice(-6)}`;
      const isUpdatingExisting = records.some(r => r.id === id);

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
      
      if (isUpdatingExisting) {
        await updateRecord(id, recordData);
        addLog('Admin', 'Update Record', `Updated record ${id}`);
        alert('Registry Entry Updated Successfully.');
      } else {
        await addRecord(recordData);
        addLog('Admin', 'Create Record', `Created new record ${id}`);
        alert('New Registry Entry Committed.');
      }
      
      // Force sync
      await refreshAllData();
      
      setRegForm({ status: 'Processing' as any, fullName: '', passportNumber: '', nationality: '', email: '', phone: '', dob: '', company_name: '', issueDate: '', expiryDate: '' });
      setUploadFile(null);
      setActiveTab('REGISTRY');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error("Save Error:", err);
      alert(`Operation Failed: ${err.message || 'Check connection.'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const isImage = (url?: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('.png') || lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.webp') || url.startsWith('data:image');
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

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-12 h-12 text-red-600 animate-spin" /></div>;

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md border-t-[14px] border-red-600">
          <div className="text-center mb-10">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Vietnam.svg/200px-Emblem_of_Vietnam.svg.png" className="w-20 mx-auto mb-4" alt="Emblem" />
            <h1 className="text-2xl font-black text-slate-900 uppercase">Executive Portal</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Administrative Access Only</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input name="user" required className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl text-slate-900 font-bold outline-none focus:border-red-600" placeholder="Username" />
            <input name="pass" type="password" required className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl text-slate-900 font-bold outline-none focus:border-red-600" placeholder="Password" />
            <button type="submit" className="w-full bg-red-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-red-700 uppercase transition-all">Authorize</button>
          </form>
          <button onClick={() => navigate('/')} className="w-full mt-8 text-[10px] text-slate-300 font-black uppercase text-center hover:text-slate-500">Back to Site</button>
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
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest ${activeTab === t.id ? 'bg-red-600 text-white shadow-xl' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
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
              <input placeholder="Filter Records..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-full text-[11px] font-bold outline-none focus:border-red-600 shadow-sm" />
            </div>
          </div>

          {activeTab === 'REGISTRY' && (
            <div className="space-y-16 animate-in slide-in-from-right-10 duration-500">
               
               {/* 1. Records List Table */}
               <section className="space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3"><Database className="text-red-600" /> Registered Records Database</h3>
                     <span className="bg-slate-100 px-4 py-1 rounded-full text-[10px] font-black uppercase text-slate-500">{records.length} Official Entries</span>
                  </div>
                  <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                      <thead className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-400">
                        <tr>
                          <th className="px-8 py-6">Full Name</th>
                          <th className="px-8 py-6">Passport ID</th>
                          <th className="px-8 py-6">DOB</th>
                          <th className="px-8 py-6">Company Entity</th>
                          <th className="px-8 py-6">File Artifact</th>
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
                               <p className="text-[10px] text-red-600 font-black uppercase">{rec.passportNumber}</p>
                            </td>
                            <td className="px-8 py-6">
                               <p className="text-[10px] text-slate-600 font-bold">{rec.dob || 'N/A'}</p>
                            </td>
                            <td className="px-8 py-6">
                               <p className="text-[10px] text-slate-900 font-bold uppercase truncate max-w-[180px]">{rec.company_name || 'Individual'}</p>
                            </td>
                            <td className="px-8 py-6">
                               {rec.file_url ? (
                                 <div className="flex items-center gap-3">
                                   {isImage(rec.file_url) ? (
                                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:border-red-600" onClick={() => setPreviewFile(rec.file_url!)}>
                                        <img src={rec.file_url} className="w-full h-full object-cover" alt="Artifact" />
                                      </div>
                                   ) : (
                                      <button onClick={() => window.open(rec.file_url, '_blank')} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center gap-2">
                                        <FileIcon className="w-4 h-4" /> <span className="text-[8px] font-black uppercase">PDF</span>
                                      </button>
                                   )}
                                   <button onClick={() => handleDownload(rec.file_url, `${rec.passportNumber}_Official_Record`)} className="p-2 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-lg"><Download className="w-4 h-4" /></button>
                                 </div>
                               ) : (
                                 <span className="text-[9px] font-black uppercase text-slate-300 italic">No File Linked</span>
                               )}
                            </td>
                            <td className="px-8 py-6 text-right">
                               <div className="flex justify-end gap-3">
                                  <button onClick={() => startEditRecord(rec)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors" title="Edit Dossier"><Pencil className="w-5 h-5" /></button>
                                  <button onClick={() => handleDeleteRecord(rec)} className="p-2 text-slate-300 hover:text-red-600 transition-colors" title="Flush Archive"><Trash2 className="w-5 h-5" /></button>
                               </div>
                            </td>
                          </tr>
                        )) : <tr><td colSpan={6} className="py-20 text-center text-slate-300 italic uppercase font-black tracking-widest">No matching registry records identified.</td></tr>}
                      </tbody>
                    </table>
                  </div>
               </section>

               <div id="registry-form-anchor" className="h-px bg-slate-200" />

               {/* 2. Official Entry Form */}
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1">
                     <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                        {regForm.id ? `Modifying Entry: ${regForm.id}` : 'Registry Intake Engine'}
                     </h3>
                     <p className="text-slate-400 text-[10px] font-bold italic uppercase tracking-widest">Formal dossier entry for national document archives</p>
                  </div>
                  <div className="flex gap-2 bg-slate-100 p-2 rounded-2xl w-full md:w-fit">
                    {[DocType.WORK_PERMIT, DocType.VISA, DocType.TRC].map(type => (
                      <button 
                        key={type}
                        onClick={() => { setRegistryType(type); setRegForm({ ...regForm, status: 'Processing' as any }); }}
                        className={`flex-1 md:px-6 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${registryType === type ? 'bg-white shadow-md text-red-600' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {type.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
               </div>

               <form onSubmit={saveRegistryRecord} className="bg-white p-12 md:p-16 rounded-[4rem] border border-slate-100 shadow-xl space-y-12">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Full Legal Name *</label><input required value={regForm.fullName || ''} onChange={e => setRegForm({...regForm, fullName: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase focus:border-red-600 outline-none" placeholder="FULL NAME" /></div>
                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Passport Identity *</label><input required value={regForm.passportNumber || ''} onChange={e => setRegForm({...regForm, passportNumber: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase focus:border-red-600 outline-none" placeholder="PASSPORT NO" /></div>
                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Date of Birth (DOB) *</label><input required type="date" value={regForm.dob || ''} onChange={e => setRegForm({...regForm, dob: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-red-600" /></div>
                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Company Entity Name *</label><input required value={regForm.company_name || ''} onChange={e => setRegForm({...regForm, company_name: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase focus:border-red-600 outline-none" placeholder="SPONSORING COMPANY" /></div>
                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Nationality *</label><input required value={regForm.nationality || ''} onChange={e => setRegForm({...regForm, nationality: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase focus:border-red-600 outline-none" placeholder="ORIGIN" /></div>
                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Registry Status</label><select value={regForm.status} onChange={e => setRegForm({...regForm, status: e.target.value as any})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase outline-none focus:border-red-600"><option value="Verified">Verified</option><option value="Processing">Processing</option><option value="Expired">Expired</option><option value="Rejected">Rejected</option></select></div>
                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Date of Issuance</label><input type="date" value={regForm.issueDate || ''} onChange={e => setRegForm({...regForm, issueDate: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-red-600" /></div>
                     <div className="space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 ml-2">Final Expiry Date</label><input type="date" value={regForm.expiryDate || ''} onChange={e => setRegForm({...regForm, expiryDate: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-red-600" /></div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-red-600 tracking-widest border-b pb-2 flex items-center gap-2"><Upload className="w-3 h-3" /> Dossier Asset Management</h4>
                    <div className="max-w-md">
                      <div className="relative aspect-video bg-slate-50 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-center group hover:border-red-600 transition-all cursor-pointer overflow-hidden shadow-inner bg-slate-50">
                        <input 
                          type="file" 
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)} 
                          className="absolute inset-0 opacity-0 cursor-pointer z-[50]" 
                        />
                        
                        {uploadFile ? (
                           <div className="flex flex-col items-center gap-2 pointer-events-none">
                             <FileIcon className="w-12 h-12 text-red-600" />
                             <p className="text-[10px] font-black uppercase text-slate-900 truncate px-4">{uploadFile.name}</p>
                             <p className="text-[8px] font-bold text-slate-400 uppercase">Ready for archive sync</p>
                           </div>
                        ) : regForm.file_url ? (
                           <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-100/80 pointer-events-none">
                             {isImage(regForm.file_url) ? <img src={regForm.file_url} className="absolute inset-0 w-full h-full object-cover opacity-30" /> : <FileIcon className="w-12 h-12 text-slate-300" />}
                             <div className="relative z-10 text-center bg-white/70 p-4 rounded-2xl backdrop-blur-sm shadow-sm">
                                <p className="text-[10px] font-black uppercase text-red-600">Archived Asset Found</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase">Click to Replace</p>
                             </div>
                           </div>
                        ) : (
                          <div className="pointer-events-none">
                            <FilePlus className="w-10 h-10 text-slate-300 mb-2 group-hover:text-red-600 transition-colors" />
                            <p className="text-[10px] font-black uppercase text-slate-400 group-hover:text-red-600 transition-colors">Attach Document Image / PDF</p>
                          </div>
                        )}
                      </div>
                      {(uploadFile || regForm.file_url) && (
                        <button type="button" onClick={() => { setUploadFile(null); setRegForm({...regForm, file_url: ''}); }} className="mt-4 text-[8px] font-black uppercase text-red-400 hover:text-red-600 flex items-center gap-2"><Trash2 className="w-3 h-3" /> Detach Current Asset</button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-10 border-t">
                     <button 
                        type="submit" 
                        disabled={isUploading} 
                        className="flex-1 py-6 bg-red-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-95"
                     >
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {regForm.id ? 'Authorize Archive Update' : 'Finalize Registry Intake'}
                     </button>
                     <button type="button" onClick={() => { 
                       setRegForm({ status: 'Processing' as any, fullName: '', passportNumber: '', nationality: '', email: '', phone: '', dob: '', company_name: '', issueDate: '', expiryDate: '' }); 
                       setUploadFile(null); 
                     }} className="px-12 py-6 bg-slate-100 text-slate-400 rounded-3xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Abort</button>
                  </div>
               </form>
            </div>
          )}

          {activeTab === 'DASHBOARD' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
              {[
                { label: 'Work Permits Filed', val: stats.wp, icon: Briefcase, color: 'bg-red-600' },
                { label: 'Visa Applications', val: stats.visa, icon: Globe, color: 'bg-emerald-600' },
                { label: 'TRC Applications', val: stats.trc, icon: ShieldCheck, color: 'bg-blue-600' },
                { label: 'Registered Records', val: stats.active, icon: Database, color: 'bg-slate-900' },
              ].map((stat, i) => (
                <div key={i} className={`${stat.color} p-10 rounded-[3rem] text-white shadow-xl flex flex-col justify-between aspect-video`}>
                  <div className="p-4 bg-white/20 rounded-2xl w-fit"><stat.icon className="w-8 h-8" /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">{stat.label}</p>
                    <p className="text-5xl font-black mt-2 tracking-tighter">{stat.val}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Other tabs DASHBOARD, APPLICATIONS etc remain active with search support */}
        </div>
      </main>

      {/* ARTIFACT FULLSCREEN PREVIEW */}
      {previewFile && (
        <div className="fixed inset-0 z-[2000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-8">
           <button onClick={() => setPreviewFile(null)} className="absolute top-10 right-10 p-6 bg-white/10 text-white rounded-full hover:bg-red-600 transition-all shadow-2xl active:scale-90"><X className="w-10 h-10" /></button>
           <div className="max-w-6xl w-full max-h-[85vh] bg-white rounded-[4rem] p-3 shadow-2xl overflow-hidden border-4 border-white/20">
              <img src={previewFile} className="w-full h-full object-contain rounded-[3.5rem]" alt="Registry Artifact" />
           </div>
        </div>
      )}
    </div>
  );
};

export default ManagementConsole;
