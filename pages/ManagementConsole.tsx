
import React, { useState, useEffect, useMemo } from 'react';
import { useAppConfig } from '../context/ConfigContext';
import { DocType, Application, DeviceInfo, OfficialRecord, InfoEntry, InfoCategory } from '../types';
import { 
  LayoutDashboard, Database, CreditCard, Monitor, LogOut, Search, 
  X, CheckCircle2, Eye, Trash2, Pencil,
  ShieldCheck, Banknote, Globe, Briefcase, Calendar, 
  Loader2, Image as ImageIcon, FileText, AlertCircle, Phone, 
  Mail, ShieldAlert, Download, Printer,
  ChevronRight, Clock, Plus, Zap, Ban, ShieldX,
  Laptop, Smartphone, QrCode, Coins, Landmark, Bell, FilePlus, 
  MapPin, ListChecks, FileCheck, DollarSign, TrendingUp, Lock, Camera, Tablet,
  Activity, UserCheck, User, Upload, Map as MapIcon, PlusCircle, Trash
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type AdminTab = 'DASHBOARD' | 'RECORD' | 'PAYMENT' | 'INFORMATION' | 'DEVICE';
type RecordAppType = 'Passport' | 'Work Permit' | 'Visa' | 'TRC' | 'Contact';

const ManagementConsole: React.FC = () => {
  const navigate = useNavigate();
  const { 
    applications, isLoading, config, infoEntries, devices, records,
    updateApplication, deleteApplication,
    addInfoEntry, updateInfoEntry, deleteInfoEntry,
    refreshAllData, updateDevice, removeDevice, addLog,
    deleteRecord
  } = useAppConfig();
  
  const [isAuth, setIsAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showInfoForm, setShowInfoForm] = useState(false);
  const [editingInfo, setEditingInfo] = useState<InfoEntry | null>(null);

  const [showRecordForm, setShowRecordForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<OfficialRecord | null>(null);
  const [recordAppType, setRecordAppType] = useState<RecordAppType>('Work Permit');
  const [recordFile, setRecordFile] = useState<File | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [recordForm, setRecordForm] = useState<Partial<OfficialRecord>>({
    fullName: '', passportNumber: '', nationality: '', dob: '', 
    company_name: '', jobTitle: '', vietnamAddress: '', status: 'Verified',
    issueDate: '', expiryDate: '', email: '', phone: '', type: DocType.WORK_PERMIT
  });

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get('user') === 'shohag055' && fd.get('pass') === '2846Shohag..') {
      setIsAuth(true);
      addLog('Admin', 'Authorization', 'Executive session established');
    } else {
      alert('Security Protocol: Invalid credentials.');
    }
  };

  const resetRecordForm = () => {
    setRecordForm({
      fullName: '', passportNumber: '', nationality: '', dob: '', 
      company_name: '', jobTitle: '', vietnamAddress: '', status: 'Verified',
      issueDate: '', expiryDate: '', email: '', phone: '', type: DocType.WORK_PERMIT
    });
    setRecordFile(null);
    setEditingRecord(null);
  };

  const handleOpenRecordForm = (record?: OfficialRecord) => {
    if (record) {
      setEditingRecord(record);
      setRecordForm(record);
      const mappedType: RecordAppType = 
        record.type === DocType.VISA ? 'Visa' : 
        record.type === DocType.TRC ? 'TRC' : 
        record.type === DocType.PASSPORT ? 'Passport' :
        record.type === DocType.CONTACT ? 'Contact' : 'Work Permit';
      setRecordAppType(mappedType);
    } else {
      resetRecordForm();
    }
    setShowRecordForm(true);
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    
    let finalFileUrl = recordForm.file_url || '';

    try {
      if (recordFile) {
        const fileExt = recordFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, recordFile, { upsert: false });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(fileName);
          finalFileUrl = publicUrl;
        }
      }

      // "Dual-Key" Payload: ডাটাবেস টেবিলে কলামের নাম যেভাবেই থাকুক, এটি কাজ করবে।
      const payload: any = {
        // Full Name handling
        fullName: recordForm.fullName,
        full_name: recordForm.fullName,
        
        // Passport handling
        passportNumber: recordForm.passportNumber?.toUpperCase(),
        passport_number: recordForm.passportNumber?.toUpperCase(),
        
        // Address handling
        vietnamAddress: recordForm.vietnamAddress || '',
        vietnam_address: recordForm.vietnamAddress || '',
        
        // Job Title handling
        jobTitle: recordForm.jobTitle || '',
        job_title: recordForm.jobTitle || '',
        
        // Dates
        dob: recordForm.dob || null,
        issueDate: recordForm.issueDate || new Date().toISOString().split('T')[0],
        issue_date: recordForm.issueDate || new Date().toISOString().split('T')[0],
        expiryDate: recordForm.expiryDate || null,
        expiry_date: recordForm.expiryDate || null,
        
        // Company
        company_name: recordForm.company_name || 'N/A',
        sponsorCompany: recordForm.company_name || 'N/A',
        
        // Others
        status: recordForm.status || 'Verified',
        file_url: finalFileUrl,
        fileUrl: finalFileUrl,
        nationality: recordForm.nationality || '',
        email: recordForm.email || '',
        phone: recordForm.phone || '',
        type: recordAppType === 'Visa' ? DocType.VISA : 
              recordAppType === 'TRC' ? DocType.TRC : 
              recordAppType === 'Passport' ? DocType.PASSPORT : 
              recordAppType === 'Contact' ? DocType.CONTACT : DocType.WORK_PERMIT
      };

      if (editingRecord) {
        const { error: updateError } = await supabase.from('records').update(payload).eq('id', editingRecord.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('records').insert([{
          ...payload,
          id: `REC-${Date.now().toString().slice(-6)}`
        }]);
        if (insertError) throw insertError;
      }

      alert('রেজিস্ট্রি আপডেট সফল হয়েছে!');
      setShowRecordForm(false);
      resetRecordForm();
      await refreshAllData();

    } catch (err: any) {
      console.error("Database Save Error:", err);
      alert(`ডাটাবেস এরর: ${err.message}\n\nআপনার ডাটাবেস টেবিলে 'fullName' কলামটি NULL রাখা সম্ভব নয়। দয়া করে সব তথ্য পূরণ করুন।`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteRecord = async (id: string, fileUrl?: string) => {
    if (!window.confirm('Delete this record permanently?')) return;
    try {
      if (fileUrl) {
        const filePath = fileUrl.split('/').pop();
        if (filePath) await supabase.storage.from('documents').remove([filePath]).catch(() => null);
      }
      const { error } = await supabase.from('records').delete().eq('id', id);
      if (error) throw error;
      alert('রেকর্ড মুছে ফেলা হয়েছে।');
      await refreshAllData();
    } catch (err: any) {
      alert(`Delete Error: ${err.message}`);
    }
  };

  const handleInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: InfoEntry = {
      id: editingInfo?.id || `inf_${Date.now()}`,
      appType: fd.get('appType') as DocType,
      category: fd.get('category') as InfoCategory,
      title: fd.get('title') as string,
      description: fd.get('description') as string,
      amount: fd.get('amount') as string,
      status: fd.get('status') as any,
      date: new Date().toLocaleDateString()
    };
    if (editingInfo) await updateInfoEntry(payload.id, payload);
    else await addInfoEntry(payload);
    setShowInfoForm(false);
    setEditingInfo(null);
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => 
      (r.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (r.passportNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [records, searchTerm]);

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6 text-white font-black uppercase tracking-[0.4em]"><Loader2 className="w-16 h-16 text-red-600 animate-spin" />Syncing National Command...</div>;

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-white rounded-[3rem] shadow-2xl p-12 w-full max-md border-t-[16px] border-red-600">
          <div className="text-center mb-10">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Vietnam.svg/200px-Emblem_of_Vietnam.svg.png" className="w-20 mx-auto mb-6" alt="Emblem" />
            <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Command Node</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input name="user" required className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl text-slate-900 font-bold outline-none focus:border-red-600" placeholder="Identity UID" />
            <input name="pass" type="password" required className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl text-slate-900 font-bold outline-none focus:border-red-600" placeholder="Security Passkey" />
            <button type="submit" className="w-full bg-red-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-3 active:scale-95"><Lock size={18} /> Authorize Session</button>
          </form>
          <button onClick={() => navigate('/')} className="w-full mt-8 text-[10px] text-slate-300 font-black uppercase text-center">Return to Portal</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      <aside className="w-72 bg-slate-950 text-white flex flex-col shrink-0 shadow-2xl relative z-50">
        <div className="p-8 bg-black/20 border-b border-white/5 flex items-center gap-4">
          <div className="p-3 bg-red-600 rounded-xl"><ShieldCheck className="w-6 h-6 text-white" /></div>
          <div className="font-black text-xs uppercase tracking-widest text-white leading-tight">National<br/>Command Center</div>
        </div>
        <nav className="p-6 flex-1 space-y-3">
          {[
            { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Control Hub' },
            { id: 'RECORD', icon: Database, label: 'Record Desk' },
            { id: 'PAYMENT', icon: CreditCard, label: 'Financial Desk' },
            { id: 'INFORMATION', icon: Bell, label: 'Portal CMS' },
            { id: 'DEVICE', icon: Monitor, label: 'Security Node' },
          ].map(t => (
            <button 
              key={t.id} 
              onClick={() => { setActiveTab(t.id as AdminTab); setSelectedApp(null); }} 
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest ${activeTab === t.id ? 'bg-red-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
            >
               <t.icon size={20} /> {t.label}
            </button>
          ))}
        </nav>
        <div className="p-10 border-t border-white/5">
          <button onClick={() => setIsAuth(false)} className="text-red-500 font-black uppercase text-[10px] flex items-center gap-3 hover:text-red-400"><LogOut size={16} /> Terminate Access</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10 relative">
        <div className="max-w-7xl mx-auto pb-32">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-200 pb-8 mb-10">
            <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic flex items-center gap-4"><span className="text-red-600">/</span> {activeTab}</h2>
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                placeholder="Query database..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-full text-[11px] font-bold outline-none focus:border-red-600 shadow-sm transition-all" 
              />
            </div>
          </div>

          {activeTab === 'DASHBOARD' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Work Permits', count: records.filter(a => a.type === DocType.WORK_PERMIT).length, icon: Briefcase, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Visas', count: records.filter(a => a.type === DocType.VISA).length, icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'TRC Cards', count: records.filter(a => a.type === DocType.TRC).length, icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Total Records', count: records.length, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                  ].map((s, i) => (
                    <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm group">
                      <div className={`p-4 rounded-2xl w-fit mb-6 transition-transform group-hover:scale-110 ${s.bg} ${s.color}`}><s.icon size={32} /></div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{s.label}</p>
                      <p className="text-5xl font-black mt-2 tracking-tighter">{s.count}</p>
                    </div>
                  ))}
               </div>
               <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden">
                  <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3"><ListChecks className="text-red-600" /> Registry Queue</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                        <tr>
                          <th className="p-6">Applicant</th>
                          <th className="p-6">Type</th>
                          <th className="p-6">Status</th>
                          <th className="p-6 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {records.slice(0, 10).map(rec => (
                          <tr key={rec.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="p-6">
                               <p className="font-black text-sm uppercase text-slate-900 group-hover:text-red-600 transition-colors">{rec.fullName}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase">{rec.passportNumber}</p>
                            </td>
                            <td className="p-6">
                               <span className="text-[10px] font-black uppercase text-slate-400">{rec.type}</span>
                            </td>
                            <td className="p-6">
                               <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                 rec.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                               }`}>{rec.status}</span>
                            </td>
                            <td className="p-6 text-right"><ChevronRight size={16} className="text-slate-200 group-hover:text-red-600 ml-auto" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'RECORD' && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
               <div className="flex items-center justify-between">
                 <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight italic">National Registry Repository</h3>
                 <button onClick={() => handleOpenRecordForm()} className="bg-red-600 text-white px-10 py-5 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 transition-transform"><PlusCircle size={18} /> Add Record</button>
               </div>
               <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                       <tr>
                         <th className="p-8">Type</th>
                         <th className="p-8">Identity</th>
                         <th className="p-8">ID / Company</th>
                         <th className="p-8">Status</th>
                         <th className="p-8">Artifact</th>
                         <th className="p-8 text-right">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                       {filteredRecords.length > 0 ? filteredRecords.map(rec => (
                         <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="p-8">
                             <div className="flex items-center gap-3">
                               <div className="p-2.5 bg-slate-100 rounded-xl text-slate-400 group-hover:text-red-600 group-hover:bg-red-50 transition-all">
                                 {rec.type === DocType.WORK_PERMIT ? <Briefcase size={18} /> : rec.type === DocType.VISA ? <Globe size={18} /> : <UserCheck size={18} />}
                               </div>
                               <span className="text-[10px] font-black uppercase text-slate-600">{(rec.type || '').replace('_', ' ')}</span>
                             </div>
                           </td>
                           <td className="p-8">
                             <p className="font-black text-slate-900 uppercase text-sm">{rec.fullName}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">{rec.nationality || 'Unspecified'}</p>
                           </td>
                           <td className="p-8">
                             <p className="font-mono text-xs font-black text-slate-600 uppercase tracking-tighter">{rec.passportNumber}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase max-w-[150px] truncate">{rec.company_name || 'N/A'}</p>
                           </td>
                           <td className="p-8">
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                               rec.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                             }`}>{rec.status}</span>
                           </td>
                           <td className="p-8">
                             {rec.file_url ? (
                               <a href={rec.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-red-600 hover:text-red-700">
                                 <FileText size={16} />
                                 <span className="text-[10px] font-black uppercase tracking-widest border-b border-red-200">View Scan</span>
                               </a>
                             ) : <span className="text-[10px] font-black uppercase text-slate-300">No Asset</span>}
                           </td>
                           <td className="p-8 text-right">
                             <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => handleOpenRecordForm(rec)} className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"><Pencil size={14} /></button>
                               <button onClick={() => handleDeleteRecord(rec.id, rec.file_url)} className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm"><Trash2 size={14} /></button>
                             </div>
                           </td>
                         </tr>
                       )) : (
                         <tr><td colSpan={6} className="p-32 text-center text-slate-200"><Database size={64} className="mx-auto mb-4" /><p className="text-xl font-black uppercase tracking-[0.3em]">No Records Located</p></td></tr>
                       )}
                     </tbody>
                   </table>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'PAYMENT' && (
             <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-right-8 duration-500">
               <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                 <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3"><Coins className="text-red-600" /> Financial Desk</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                     <tr>
                       <th className="p-6">Applicant Reference</th>
                       <th className="p-6">Amount / Fee</th>
                       <th className="p-6">Settlement Status</th>
                       <th className="p-6 text-right">Verification</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {applications.map(app => (
                       <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                         <td className="p-6">
                            <p className="font-black text-slate-900 uppercase text-sm">{app.fullName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">APP: {app.id}</p>
                         </td>
                         <td className="p-6"><p className="font-black text-slate-900">{app.amount || '---'} {app.currency}</p></td>
                         <td className="p-6">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              app.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>{app.paymentStatus}</span>
                         </td>
                         <td className="p-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                               {app.paymentStatus === 'Pending' && (
                                 <button onClick={() => updateApplication(app.id, { paymentStatus: 'Paid' })} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><CheckCircle2 size={16} /></button>
                               )}
                               <button onClick={() => setSelectedApp(app)} className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><Eye size={16} /></button>
                            </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
          )}

          {activeTab === 'INFORMATION' && (
             <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
               <div className="flex items-center justify-between">
                 <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight italic">Registry Information Desk</h3>
                 <button onClick={() => { setEditingInfo(null); setShowInfoForm(true); }} className="bg-red-600 text-white px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 transition-transform"><Plus size={16} /> New Entry Dispatch</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {infoEntries.map(info => (
                   <div key={info.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6 group">
                     <div className="flex items-center justify-between">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                         info.category === 'Rules' ? 'bg-red-50 text-red-600' : 
                         info.category === 'Cost' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                       }`}>{info.category}</span>
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => { setEditingInfo(info); setShowInfoForm(true); }} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:text-blue-600 transition-colors"><Pencil size={14} /></button>
                         <button onClick={() => deleteInfoEntry(info.id)} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                       </div>
                     </div>
                     <div className="space-y-2">
                       <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{info.title}</h4>
                       <p className="text-xs text-slate-400 font-bold uppercase">{info.appType}</p>
                       <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{info.description}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          )}

          {activeTab === 'DEVICE' && (
            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden animate-in slide-in-from-right-8 duration-500">
               <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3"><Monitor className="text-red-600" /> Watchtower Nodes</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                      <tr>
                        <th className="p-6">Terminal</th>
                        <th className="p-6">Location</th>
                        <th className="p-6">Status</th>
                        <th className="p-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {devices.map(device => (
                        <tr key={device.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-xl ${device.deviceType === 'Mobile' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                                {device.deviceType === 'Mobile' ? <Smartphone size={20} /> : device.deviceType === 'Tablet' ? <Tablet size={20} /> : <Laptop size={20} />}
                              </div>
                              <div>
                                <p className="font-black text-slate-900 uppercase text-xs">{device.deviceName}</p>
                                <p className="text-[10px] text-slate-400 font-bold">{device.os}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{device.city}, {device.country}</td>
                          <td className="p-6">
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                               device.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                             }`}>{device.status}</span>
                          </td>
                          <td className="p-6 text-right">
                             <div className="flex items-center justify-end gap-2">
                               <button onClick={() => updateDevice(device.id, device.status === 'Active' ? 'Suspended' : 'Active')} className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all"><Ban size={16} /></button>
                               <button onClick={() => removeDevice(device.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><ShieldX size={16} /></button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </div>
          )}
        </div>
      </main>

      {showRecordForm && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="max-w-4xl w-full bg-white rounded-[4rem] p-12 md:p-16 shadow-2xl space-y-12 relative overflow-hidden flex flex-col max-h-[90vh]">
            <button onClick={() => setShowRecordForm(false)} className="absolute top-10 right-10 p-4 bg-slate-100 text-slate-400 rounded-full hover:text-red-600 transition-all active:scale-95"><X size={24} /></button>
            <div className="text-center space-y-4 shrink-0">
              <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">{editingRecord ? 'Update Record' : 'Registry Intake'}</h3>
              <div className="flex flex-wrap justify-center gap-2 p-2 bg-slate-100 rounded-3xl max-w-2xl mx-auto border border-slate-200">
                {(['Passport', 'Work Permit', 'Visa', 'TRC', 'Contact'] as RecordAppType[]).map(t => (
                  <button key={t} onClick={() => setRecordAppType(t)} className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${recordAppType === t ? 'bg-white text-red-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
                ))}
              </div>
            </div>
            <form onSubmit={handleRecordSubmit} className="flex-1 overflow-y-auto pr-2 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4">Full Identity Name *</label><input required value={recordForm.fullName} onChange={e => setRecordForm({...recordForm, fullName: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold uppercase focus:border-red-600 outline-none" placeholder="FULL NAME" /></div>
                {recordAppType !== 'Contact' ? (
                  <>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4">Passport ID *</label><input required value={recordForm.passportNumber} onChange={e => setRecordForm({...recordForm, passportNumber: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold uppercase focus:border-red-600 outline-none" placeholder="PASSPORT NUMBER" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4">Nationality</label><input value={recordForm.nationality} onChange={e => setRecordForm({...recordForm, nationality: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold uppercase focus:border-red-600 outline-none" placeholder="COUNTRY" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4">Date of Birth</label><input type="date" value={recordForm.dob} onChange={e => setRecordForm({...recordForm, dob: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold outline-none focus:border-red-600" /></div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4">Phone Number</label><input value={recordForm.phone} onChange={e => setRecordForm({...recordForm, phone: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold focus:border-red-600 outline-none" placeholder="+84 ..." /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4">Email Address</label><input value={recordForm.email} onChange={e => setRecordForm({...recordForm, email: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold focus:border-red-600 outline-none" placeholder="email@domain.com" /></div>
                  </>
                )}
                {(recordAppType === 'Work Permit' || recordAppType === 'TRC' || recordAppType === 'Passport') && (
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4">Employer / Sponsoring Entity</label><input value={recordForm.company_name} onChange={e => setRecordForm({...recordForm, company_name: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold uppercase focus:border-red-600 outline-none" placeholder="COMPANY NAME" /></div>
                )}
                {recordAppType === 'Visa' && (
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4">Visa Category / Type</label><input value={recordForm.jobTitle} onChange={e => setRecordForm({...recordForm, jobTitle: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold uppercase focus:border-red-600 outline-none" placeholder="e.g. DN, LD, DL" /></div>
                )}
                {recordAppType !== 'Contact' && (
                  <>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4">Date of Issuance</label><input type="date" value={recordForm.issueDate} onChange={e => setRecordForm({...recordForm, issueDate: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold outline-none focus:border-red-600" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4">Expiration Date</label><input type="date" value={recordForm.expiryDate} onChange={e => setRecordForm({...recordForm, expiryDate: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold outline-none focus:border-red-600" /></div>
                  </>
                )}
                <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-4">Residential Address (Vietnam)</label><input value={recordForm.vietnamAddress} onChange={e => setRecordForm({...recordForm, vietnamAddress: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold focus:border-red-600 outline-none" placeholder="FULL REGISTERED ADDRESS" /></div>
                <div className="md:col-span-2 border-4 border-dashed border-slate-100 p-12 rounded-[3.5rem] text-center relative group bg-slate-50 hover:border-red-600 transition-all cursor-pointer">
                  <input type="file" onChange={e => setRecordFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="space-y-4">
                    {recordFile ? (
                      <div className="flex flex-col items-center"><FileCheck size={48} className="text-emerald-500 mb-2" /><p className="text-sm font-black uppercase text-slate-900">{recordFile.name}</p></div>
                    ) : recordForm.file_url ? (
                      <div className="flex flex-col items-center"><CheckCircle2 size={48} className="text-red-600 mb-2" /><p className="text-sm font-black uppercase text-slate-900">Artifact linked</p></div>
                    ) : (
                      <>
                        <div className="p-4 bg-red-100 text-red-600 rounded-2xl w-fit mx-auto group-hover:scale-110 transition-transform"><Upload size={32} /></div>
                        <p className="text-red-600 font-black uppercase text-xs tracking-widest">Attach Identity Scan / Document</p>
                      </>
                    )}
                  </div>
                </div>
                <button type="submit" disabled={isSyncing} className="md:col-span-2 bg-red-600 text-white py-7 rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50">
                  {isSyncing ? <Loader2 className="animate-spin" /> : <ShieldCheck />} {editingRecord ? 'UPDATE REGISTRY' : 'SYNCHRONIZE TO REGISTRY'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInfoForm && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="max-w-2xl w-full bg-white rounded-[3.5rem] p-12 shadow-2xl space-y-8 relative overflow-hidden">
            <button onClick={() => setShowInfoForm(false)} className="absolute top-8 right-8 p-3 bg-slate-100 text-slate-400 rounded-full hover:text-red-600 transition-all"><X size={24} /></button>
            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic border-b pb-6">{editingInfo ? 'Refine Entry' : 'New Portal Dispatch'}</h3>
            <form onSubmit={handleInfoSubmit} className="grid grid-cols-2 gap-6">
               <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">App Category</label><select name="appType" defaultValue={editingInfo?.appType || DocType.WORK_PERMIT} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black uppercase text-xs focus:border-red-600 outline-none"><option value={DocType.WORK_PERMIT}>Work Permit</option><option value={DocType.VISA}>Visa</option><option value={DocType.TRC}>TRC</option></select></div>
               <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">CMS Section</label><select name="category" defaultValue={editingInfo?.category || 'Rules'} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black uppercase text-xs focus:border-red-600 outline-none"><option value="Rules">Rules & Logic</option><option value="Cost">Financial Schedule</option><option value="Update">Policy Dispatch</option></select></div>
               <div className="col-span-2 space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Entry Title</label><input name="title" required defaultValue={editingInfo?.title} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black uppercase text-xs focus:border-red-600 outline-none" /></div>
               <div className="col-span-2 space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Detailed Content</label><textarea name="description" required defaultValue={editingInfo?.description} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm focus:border-red-600 outline-none h-32" /></div>
               <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Fee / Amount</label><input name="amount" defaultValue={editingInfo?.amount} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-xs focus:border-red-600 outline-none" /></div>
               <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Publish Status</label><select name="status" defaultValue={editingInfo?.status || 'Active'} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black uppercase text-xs focus:border-red-600 outline-none"><option value="Active">Published</option><option value="Inactive">Draft</option><option value="Pinned">Pinned</option></select></div>
               <button type="submit" className="col-span-2 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-all mt-6 shadow-xl active:scale-95">Synchronize Entry</button>
            </form>
          </div>
        </div>
      )}

      {selectedApp && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in zoom-in duration-300">
           <div className="max-w-4xl w-full max-h-[90vh] bg-white rounded-[4rem] shadow-2xl overflow-hidden relative border-t-[16px] border-red-600 flex flex-col">
              <button onClick={() => setSelectedApp(null)} className="absolute top-8 right-8 p-4 bg-slate-100 text-slate-400 rounded-full hover:text-red-600 z-50"><X size={32} /></button>
              <div className="p-12 overflow-y-auto">
                <div className="mb-10 space-y-2"><div className="flex items-center gap-3"><span className="bg-red-50 text-red-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">{selectedApp.type}</span><span className="text-slate-300 font-black text-xs uppercase tracking-tighter">ID: {selectedApp.id}</span></div><h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">{selectedApp.fullName}</h2></div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                   <div className="space-y-1"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Passport ID</p><p className="font-mono font-black text-lg text-slate-900 uppercase">{selectedApp.passportNumber}</p></div>
                   <div className="space-y-1"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nationality</p><p className="font-black text-lg text-slate-900 uppercase">{selectedApp.nationality}</p></div>
                   <div className="space-y-1"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Status</p><p className={`font-black text-lg uppercase ${selectedApp.status === 'Verified' ? 'text-emerald-600' : 'text-orange-500'}`}>{selectedApp.status}</p></div>
                   <div className="space-y-1"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fiscal Status</p><p className={`font-black text-lg uppercase ${selectedApp.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-red-600'}`}>{selectedApp.paymentStatus}</p></div>
                </div>
                <div className="mt-12 flex justify-between gap-6">
                   <button onClick={() => { updateApplication(selectedApp.id, { status: 'Verified' }); setSelectedApp(null); }} className="flex-1 py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"><CheckCircle2 /> Authorize Record</button>
                   <button onClick={() => { deleteApplication(selectedApp.id); setSelectedApp(null); }} className="px-8 py-6 bg-slate-100 text-slate-400 rounded-3xl font-black uppercase text-xs tracking-[0.2em] hover:bg-red-50 hover:text-red-600 transition-all">Purge</button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ManagementConsole;
