import React, { useState } from 'react';
import { Language, DocType, Application } from '../types';
import VerificationForm from '../components/VerificationForm';
import { useAppConfig } from '../context/ConfigContext';
import { translations } from '../i18n';
import { 
  FileText, ShieldCheck, User, MapPin, Globe, CreditCard, 
  ChevronRight, ChevronLeft, Upload, Loader2, CheckCircle2,
  AlertCircle, Briefcase, Camera, Send, Landmark, Info, 
  Scale, FileBadge, History, HelpCircle, Copy, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props { language: Language; }

const WorkPermit: React.FC<Props> = ({ language }) => {
  const navigate = useNavigate();
  const t = translations;
  const { config, addApplication } = useAppConfig();
  const svc = config.services[DocType.WORK_PERMIT];
  
  const [showApply, setShowApply] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Application>>({
    fullName: '', passportNumber: '', 
    nationality: '', dob: '', email: '', phone: '',
    details: { 
      visaNumber: '',
      trcNumber: '',
      employer: '', 
      jobTitle: '',
      paymentRef: ''
    },
    passport_file: '', photo_file: '', visa_file: '', trc_file: '', payment_receipt_file: ''
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const nextStep = () => {
    window.scrollTo({ top: 400, behavior: 'smooth' });
    setStep(prev => prev + 1);
  };
  const prevStep = () => {
    window.scrollTo({ top: 400, behavior: 'smooth' });
    setStep(prev => prev - 1);
  };

  const handleFileUpload = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, [field]: url }));
    }
  };

  const handleApplyFinal = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const appId = `VN-WP-${Date.now().toString().slice(-6)}`;
      const newApp: Application = {
        ...formData as Application,
        id: appId,
        type: DocType.WORK_PERMIT,
        status: 'Submitted',
        paymentStatus: 'Paid',
        submissionDate: new Date().toLocaleDateString(),
        history: [{ date: new Date().toLocaleString(), action: 'Dossier Filed', by: 'Applicant' }],
        amount: svc.fees[language],
        currency: 'VND',
        support_files: [formData.visa_file || '', formData.trc_file || ''].filter(f => f !== '')
      };
      addApplication(newApp);
      setActiveAppId(appId);
      setIsSubmitting(false);
      setStep(5);
    }, 2000);
  };

  const ProgressHeader = () => (
    <div className="flex items-center justify-center gap-4 mb-16 overflow-x-auto py-4 scrollbar-hide">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${
            step === i ? 'bg-red-600 text-white scale-110 shadow-lg shadow-red-200' : 
            step > i ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
          }`}>
            {step > i ? '✓' : i}
          </div>
          {i < 4 && <div className={`w-10 h-1 rounded-full ${step > i ? 'bg-emerald-500' : 'bg-slate-100'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-16 space-y-24 animate-in fade-in duration-700">
      <section className="text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 uppercase tracking-tighter leading-tight">
          {svc.title[language]}
        </h1>
        <div className="w-48 h-2 bg-red-600 mx-auto rounded-full shadow-lg shadow-red-200" />
        <p className="text-xl md:text-2xl text-red-700 font-bold uppercase tracking-[0.2em] italic opacity-80">
          Official Labor Workforce Bureau
        </p>
      </section>

      {/* Verification section */}
      <section className="bg-slate-50 p-12 md:p-20 rounded-[4rem] border border-slate-200 shadow-inner relative overflow-hidden">
         <div className="text-center mb-16 space-y-4 relative z-10">
           <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">{t.wpVerifyTitle[language]}</h2>
           <p className="text-slate-500 font-medium italic">{t.wpVerifyInstruction[language]}</p>
         </div>
         <VerificationForm language={language} type={DocType.WORK_PERMIT} />
      </section>

      {/* Application section */}
      <section id="apply-section" className="flex flex-col items-center gap-12">
        {!showApply ? (
          <div className="text-center space-y-8">
            <div className="bg-white p-12 rounded-[3rem] border shadow-sm max-w-2xl mx-auto">
              <h3 className="text-2xl font-black text-slate-900 uppercase mb-4">{t.wpApplyTitle[language]}</h3>
              <p className="text-slate-500 italic mb-8">Begin your official work permit application by clicking the button below. You will need your identity documents and sponsorship information ready.</p>
              <button 
                onClick={() => setShowApply(true)}
                className="vn-bg-red text-white px-16 py-6 rounded-full font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-red-700 transition-all active:scale-95 text-lg"
              >
                {t.applyNowBtn[language]}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 md:p-20 w-full rounded-[4rem] shadow-2xl border border-slate-100 relative overflow-hidden text-slate-900">
            <ProgressHeader />
            
            {step === 1 && (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center"><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Step 1: {t.passportInfo[language]}</h3></div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">{t.fullName[language]}</label>
                    <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none focus:border-red-600 uppercase" placeholder="AS PER PASSPORT" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">{t.passportLabel[language]}</label>
                    <input required value={formData.passportNumber} onChange={e => setFormData({...formData, passportNumber: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none focus:border-red-600 uppercase" placeholder="B1234567" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">{t.dob[language]}</label>
                    <input required type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none focus:border-red-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Visa Number</label>
                    <input required value={formData.details.visaNumber} onChange={e => setFormData({...formData, details: {...formData.details, visaNumber: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none focus:border-red-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">TRC Number (If applicable)</label>
                    <input value={formData.details.trcNumber} onChange={e => setFormData({...formData, details: {...formData.details, trcNumber: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none focus:border-red-600" />
                  </div>
                </div>
                <div className="flex justify-end pt-8">
                  <button onClick={nextStep} disabled={!formData.fullName || !formData.passportNumber || !formData.dob} className="px-12 py-5 bg-red-600 text-white font-black uppercase tracking-widest rounded-full shadow-xl hover:bg-red-700 disabled:opacity-30 flex items-center gap-2 transition-all">Next <ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center"><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Step 2: Contact & Professional</h3></div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">{t.emailLabel[language]}</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">{t.phone[language]}</label>
                    <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">{t.wpEmployer[language]}</label>
                    <input required value={formData.details.employer} onChange={e => setFormData({...formData, details: {...formData.details, employer: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none uppercase" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">{t.wpPosition[language]}</label>
                    <input required value={formData.details.jobTitle} onChange={e => setFormData({...formData, details: {...formData.details, jobTitle: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none uppercase" />
                  </div>
                </div>
                <div className="flex justify-between pt-8">
                  <button onClick={prevStep} className="px-10 py-5 bg-slate-100 text-slate-600 font-black uppercase tracking-widest rounded-full flex items-center gap-2 border border-slate-200"><ChevronLeft className="w-5 h-5" /> Back</button>
                  <button onClick={nextStep} disabled={!formData.email || !formData.details.employer} className="px-12 py-5 bg-red-600 text-white font-black uppercase tracking-widest rounded-full shadow-xl hover:bg-red-700 flex items-center gap-2 transition-all">Next <ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center"><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Step 3: Document Uploads</h3></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   <div className="p-8 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-center relative group bg-slate-50 hover:border-red-600 transition-all cursor-pointer">
                    <input type="file" onChange={(e) => handleFileUpload('photo_file', e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <Camera className="mx-auto w-8 h-8 text-slate-300 mb-4 group-hover:text-red-600" />
                    <p className="text-[10px] font-black uppercase tracking-tight">{t.photoUpload[language]}</p>
                    {formData.photo_file && <div className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-white font-black uppercase text-[10px] tracking-widest"><span>Attached</span><CheckCircle2 className="mt-2 w-5 h-5" /></div>}
                  </div>
                   <div className="p-8 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-center relative group bg-slate-50 hover:border-red-600 transition-all cursor-pointer">
                    <input type="file" onChange={(e) => handleFileUpload('passport_file', e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <Upload className="mx-auto w-8 h-8 text-slate-300 mb-4 group-hover:text-red-600" />
                    <p className="text-[10px] font-black uppercase tracking-tight">{t.passportUpload[language]}</p>
                    {formData.passport_file && <div className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-white font-black uppercase text-[10px] tracking-widest"><span>Attached</span><CheckCircle2 className="mt-2 w-5 h-5" /></div>}
                  </div>
                   <div className="p-8 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-center relative group bg-slate-50 hover:border-red-600 transition-all cursor-pointer">
                    <input type="file" onChange={(e) => handleFileUpload('visa_file', e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <Upload className="mx-auto w-8 h-8 text-slate-300 mb-4 group-hover:text-red-600" />
                    <p className="text-[10px] font-black uppercase tracking-tight">{t.visaUpload[language]}</p>
                    {formData.visa_file && <div className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-white font-black uppercase text-[10px] tracking-widest"><span>Attached</span><CheckCircle2 className="mt-2 w-5 h-5" /></div>}
                  </div>
                   <div className="p-8 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-center relative group bg-slate-50 hover:border-red-600 transition-all cursor-pointer">
                    <input type="file" onChange={(e) => handleFileUpload('trc_file', e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <Upload className="mx-auto w-8 h-8 text-slate-300 mb-4 group-hover:text-red-600" />
                    <p className="text-[10px] font-black uppercase tracking-tight">{t.trcUpload[language]}</p>
                    {formData.trc_file && <div className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-white font-black uppercase text-[10px] tracking-widest"><span>Attached</span><CheckCircle2 className="mt-2 w-5 h-5" /></div>}
                  </div>
                </div>
                <div className="flex justify-between pt-8">
                  <button onClick={prevStep} className="px-10 py-5 bg-slate-100 text-slate-600 font-black uppercase tracking-widest rounded-full flex items-center gap-2 border border-slate-200 transition-all hover:bg-slate-200"><ChevronLeft className="w-5 h-5" /> Back</button>
                  <button onClick={nextStep} disabled={!formData.passport_file || !formData.photo_file} className="px-12 py-5 bg-red-600 text-white font-black uppercase tracking-widest rounded-full shadow-xl hover:bg-red-700 flex items-center gap-2 transition-all">Next: Settlement <ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center"><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Step 4: Financial Settlement</h3></div>
                
                <div className="grid lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <h4 className="text-xs font-black uppercase text-red-600 tracking-widest border-b pb-2">Administrative Channels</h4>
                    <div className="grid gap-4">
                      {config.paymentMethods.filter(m => m.enabled).map(m => (
                        <div key={m.id} className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Landmark className="w-5 h-5 text-red-600" />
                              <p className="font-black text-slate-900 uppercase text-xs">{m.name}</p>
                            </div>
                            <button 
                              onClick={() => handleCopy(m.details, m.id)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${copiedId === m.id ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 hover:text-red-600 shadow-sm'}`}
                            >
                              {copiedId === m.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              {copiedId === m.id ? t.copied[language] : t.copyDetails[language]}
                            </button>
                          </div>
                          <p className="text-sm font-mono font-bold text-slate-600 bg-white p-4 rounded-xl border border-slate-100 shadow-inner whitespace-pre-wrap">{m.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleApplyFinal} className="bg-white p-10 rounded-[3rem] border border-red-50 shadow-xl space-y-8">
                    <div className="space-y-4">
                       <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">{t.paymentRef[language]}</label>
                        <input required value={formData.details.paymentRef} onChange={e => setFormData({...formData, details: {...formData.details, paymentRef: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none focus:border-red-600" placeholder="TXN-12345678" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">{t.uploadReceipt[language]}</label>
                        <div className="p-10 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-center relative group bg-slate-50 hover:border-red-600 transition-all">
                          <input type="file" required onChange={(e) => handleFileUpload('payment_receipt_file', e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                          <Upload className="mx-auto w-10 h-10 text-slate-300 mb-4 group-hover:text-red-600" />
                          <p className="text-sm font-black uppercase">Attach Receipt Image</p>
                          {formData.payment_receipt_file && <div className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-white font-black uppercase"><span>Settlement Attached</span><CheckCircle2 className="mt-2" /></div>}
                        </div>
                      </div>
                    </div>
                    <button type="submit" disabled={isSubmitting || !formData.payment_receipt_file} className="w-full py-6 bg-red-600 text-white font-black uppercase tracking-widest rounded-full shadow-2xl hover:bg-red-700 disabled:opacity-30 flex items-center justify-center gap-3 transition-all active:scale-95">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck />} {t.confirmBtn[language]}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="text-center py-24 space-y-12 animate-in zoom-in duration-500">
                <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl border-8 border-white"><CheckCircle2 className="w-16 h-16" /></div>
                <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">WP Docket Created</h3>
                <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Registry ID: <span className="text-red-600">{activeAppId}</span></p>
                <div className="flex justify-center gap-6">
                   <button onClick={() => navigate('/')} className="px-12 py-5 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest">Home</button>
                   <button onClick={() => { setStep(1); setShowApply(false); }} className="px-12 py-5 bg-white border-2 border-slate-100 rounded-full font-black uppercase tracking-widest">New File</button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Background/Rule section */}
      <div className="grid lg:grid-cols-2 gap-12 text-slate-900">
        <div className="space-y-8">
          <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-red-600">
              <Info className="w-8 h-8" />
              <h2 className="text-2xl font-black uppercase tracking-tight">Labor Authorization</h2>
            </div>
            <p className="text-slate-600 leading-relaxed italic">
              A Work Permit allows foreign nationals to work legally in Vietnam. It is mandatory for managers, experts, and technicians employed by Vietnamese entities.
            </p>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-red-600">
              <CreditCard className="w-8 h-8" />
              <h2 className="text-2xl font-black uppercase tracking-tight">Fees & Tariffs</h2>
            </div>
            <p className="text-3xl font-black text-red-600 leading-none">{svc.fees[language]}</p>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Base Administrative Levy</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default WorkPermit;