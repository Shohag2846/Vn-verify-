
import React, { useState } from 'react';
import { Language, DocType, Application } from '../types';
import VerificationForm from '../components/VerificationForm';
import { useAppConfig } from '../context/ConfigContext';
import { translations } from '../i18n';
import { 
  ShieldCheck, Send, Upload, Loader2, 
  CheckCircle2, Landmark, CreditCard, 
  ChevronLeft, ChevronRight, Copy, Check,
  Camera, Info, ShieldAlert, History, FileText, BookmarkCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props { language: Language; }

const TRC: React.FC<Props> = ({ language }) => {
  const navigate = useNavigate();
  const t = translations;
  const { config, addApplication } = useAppConfig();
  const svc = config.services[DocType.TRC];
  
  const [showApply, setShowApply] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Application>>({
    fullName: '', passportNumber: '', 
    dob: '',
    details: { 
      passportExpiry: '',
      visaInfo: '',
      trcType: '',
      contactDetails: '',
      paymentRef: ''
    },
    email: '', phone: '',
    passport_file: '', photo_file: '', visa_file: '', payment_receipt_file: ''
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const nextStep = () => {
    window.scrollTo({ top: 800, behavior: 'smooth' });
    setStep(prev => prev + 1);
  };
  const prevStep = () => {
    window.scrollTo({ top: 800, behavior: 'smooth' });
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
      const appId = `VN-TRC-${Date.now().toString().slice(-6)}`;
      const newApp: Application = {
        ...formData as Application,
        id: appId,
        type: DocType.TRC,
        status: 'Submitted',
        paymentStatus: 'Paid',
        submissionDate: new Date().toLocaleDateString(),
        history: [{ date: new Date().toLocaleString(), action: 'Residency Dossier Filed', by: 'Applicant' }],
        amount: svc.fees[language],
        currency: 'VND',
        support_files: [formData.passport_file || '', formData.visa_file || ''].filter(f => f !== '')
      };
      addApplication(newApp);
      setActiveAppId(appId);
      setIsSubmitting(false);
      setStep(4);
    }, 2000);
  };

  const ProgressHeader = () => (
    <div className="flex items-center justify-center gap-4 mb-16 overflow-x-auto py-4 scrollbar-hide">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${
            step === i ? 'bg-red-600 text-white scale-110 shadow-lg shadow-red-200' : 
            step > i ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
          }`}>
            {step > i ? '✓' : i}
          </div>
          {i < 3 && <div className={`w-10 h-1 rounded-full ${step > i ? 'bg-emerald-500' : 'bg-slate-100'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-16 space-y-24 animate-in fade-in duration-700">
      {/* TRC Detailed Description Section */}
      <section className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="bg-red-600 p-8 md:p-12 text-white text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight">
            {svc.title[language]}
          </h1>
          <p className="text-lg md:text-xl font-medium opacity-90 max-w-4xl mx-auto italic">
            {t.trcIntro[language]}
          </p>
        </div>
        
        <div className="p-8 md:p-16 grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-red-600"><ShieldCheck className="w-6 h-6" /><h3 className="font-black uppercase tracking-widest text-sm">{t.trcRules[language]}</h3></div>
            <p className="text-slate-600 text-sm leading-relaxed">{t.trcRulesText[language]}</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-red-600"><History className="w-6 h-6" /><h3 className="font-black uppercase tracking-widest text-sm">{t.trcDuration[language]}</h3></div>
            <p className="text-slate-600 text-sm leading-relaxed">{t.trcDurationText[language]}</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-red-600"><CreditCard className="w-6 h-6" /><h3 className="font-black uppercase tracking-widest text-sm">{t.trcFees[language]}</h3></div>
            <p className="text-slate-600 text-sm leading-relaxed">{t.trcFeesText[language]}</p>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 text-red-600"><BookmarkCheck className="w-6 h-6" /><h3 className="font-black uppercase tracking-widest text-sm">{t.trcWhy[language]}</h3></div>
            <p className="text-slate-600 text-sm leading-relaxed">{t.trcWhyText[language]}</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-red-600"><FileText className="w-6 h-6" /><h3 className="font-black uppercase tracking-widest text-sm">{t.trcLegal[language]}</h3></div>
            <p className="text-slate-600 text-sm leading-relaxed">{t.trcLegalText[language]}</p>
          </div>
        </div>
      </section>

      {/* Verification section */}
      <section className="bg-slate-50 p-12 md:p-20 rounded-[4rem] border border-slate-200 shadow-inner relative overflow-hidden">
         <div className="text-center mb-16 space-y-4 relative z-10">
           <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">{t.trcStatusCheck[language]}</h2>
           <p className="text-slate-500 font-medium italic">Validate residency status or track your pending application in the national archives.</p>
         </div>
         <VerificationForm language={language} type={DocType.TRC} />
      </section>

      {/* Application section */}
      <section id="apply-section" className="flex flex-col items-center gap-12">
        {!showApply ? (
          <div className="text-center space-y-8">
            <div className="bg-white p-12 rounded-[3rem] border shadow-sm max-w-2xl mx-auto">
              <h3 className="text-2xl font-black text-slate-900 uppercase mb-4">{t.trcApplyNow[language]}</h3>
              <p className="text-slate-500 italic mb-8">Begin your application for long-term residency. Ensure you have your passport and visa information ready.</p>
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
                <div className="text-center"><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Step 1: {t.trcInfo[language]}</h3></div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">{t.fullName[language]}</label>
                    <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none focus:border-red-600 uppercase" placeholder="NAME AS PER PASSPORT" />
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
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">{t.passportExpiry[language]}</label>
                    <input required type="date" value={formData.details.passportExpiry} onChange={e => setFormData({...formData, details: {...formData.details, passportExpiry: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none focus:border-red-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">{t.visaInfoLabel[language]}</label>
                    <input required value={formData.details.visaInfo} onChange={e => setFormData({...formData, details: {...formData.details, visaInfo: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none focus:border-red-600" placeholder="Visa Number / Expiry" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">{t.trcTypeLabel[language]}</label>
                    <select required value={formData.details.trcType} onChange={e => setFormData({...formData, details: {...formData.details, trcType: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none focus:border-red-600">
                      <option value="">Select Type</option>
                      <option value="LD">Labor (LD)</option>
                      <option value="DT">Investor (DT)</option>
                      <option value="TT">Family Visit (TT)</option>
                      <option value="DH">Study (DH)</option>
                    </select>
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">{t.contactUs[language]}</label>
                    <input required value={formData.details.contactDetails} onChange={e => setFormData({...formData, details: {...formData.details, contactDetails: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none focus:border-red-600" placeholder="Phone Number / Social Account Link" />
                  </div>
                </div>
                <div className="flex justify-end pt-8">
                  <button onClick={nextStep} disabled={!formData.fullName || !formData.passportNumber || !formData.dob} className="px-12 py-5 bg-red-600 text-white font-black uppercase tracking-widest rounded-full shadow-xl hover:bg-red-700 disabled:opacity-30 flex items-center gap-2 transition-all">Next <ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center"><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Step 2: File Evidence</h3></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="p-12 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-center relative group bg-slate-50 hover:border-red-600 transition-all cursor-pointer">
                    <input type="file" onChange={(e) => handleFileUpload('photo_file', e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <Camera className="mx-auto w-12 h-12 text-slate-300 mb-4 group-hover:text-red-600" />
                    <p className="text-sm font-black uppercase tracking-tight">{t.photoUpload[language]}</p>
                    {formData.photo_file && <div className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-white font-black uppercase"><span>Attached</span><CheckCircle2 className="mt-2 w-8 h-8" /></div>}
                  </div>
                   <div className="p-12 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-center relative group bg-slate-50 hover:border-red-600 transition-all cursor-pointer">
                    <input type="file" onChange={(e) => handleFileUpload('passport_file', e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <Upload className="mx-auto w-12 h-12 text-slate-300 mb-4 group-hover:text-red-600" />
                    <p className="text-sm font-black uppercase tracking-tight">{t.passportUpload[language]}</p>
                    {formData.passport_file && <div className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-white font-black uppercase"><span>Attached</span><CheckCircle2 className="mt-2 w-8 h-8" /></div>}
                  </div>
                   <div className="p-12 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-center relative group bg-slate-50 hover:border-red-600 transition-all cursor-pointer">
                    <input type="file" onChange={(e) => handleFileUpload('visa_file', e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <Upload className="mx-auto w-12 h-12 text-slate-300 mb-4 group-hover:text-red-600" />
                    <p className="text-sm font-black uppercase tracking-tight">{t.visaUpload[language]}</p>
                    {formData.visa_file && <div className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-white font-black uppercase"><span>Attached</span><CheckCircle2 className="mt-2 w-8 h-8" /></div>}
                  </div>
                </div>
                <div className="flex justify-between pt-8">
                  <button onClick={prevStep} className="px-10 py-5 bg-slate-100 text-slate-600 font-black uppercase tracking-widest rounded-full flex items-center gap-2 border border-slate-200 transition-all hover:bg-slate-200"><ChevronLeft className="w-5 h-5" /> Back</button>
                  <button onClick={nextStep} disabled={!formData.passport_file || !formData.photo_file || !formData.visa_file} className="px-12 py-5 bg-red-600 text-white font-black uppercase tracking-widest rounded-full shadow-xl hover:bg-red-700 flex items-center gap-2 transition-all">Next: Settlement <ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center"><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Step 3: Payment & Confirmation</h3></div>
                
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
                        <input required value={formData.details.paymentRef} onChange={e => setFormData({...formData, details: {...formData.details, paymentRef: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none focus:border-red-600" placeholder="TXN-ID" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">{t.uploadReceipt[language]}</label>
                        <div className="p-10 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-center relative group bg-slate-50 hover:border-red-600 transition-all">
                          <input type="file" required onChange={(e) => handleFileUpload('payment_receipt_file', e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                          <Upload className="mx-auto w-10 h-10 text-slate-300 mb-4 group-hover:text-red-600" />
                          <p className="text-sm font-black uppercase">Attach Receipt</p>
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

            {step === 4 && (
              <div className="text-center py-24 space-y-12 animate-in zoom-in duration-500">
                <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl border-8 border-white"><CheckCircle2 className="w-16 h-16" /></div>
                <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">TRC Docket Created</h3>
                <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Registry ID: <span className="text-red-600">{activeAppId}</span></p>
                <div className="flex justify-center gap-6">
                   <button onClick={() => navigate('/')} className="px-12 py-5 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest">Home</button>
                   <button onClick={() => { setStep(1); setShowApply(false); }} className="px-12 py-5 bg-white border-2 border-slate-100 rounded-full font-black uppercase tracking-widest">New Application</button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Footer Informational Sections */}
      <section className="bg-slate-900 p-16 rounded-[4rem] text-center space-y-8 relative overflow-hidden group">
         <div className="relative z-10 space-y-12">
            <h4 className="text-3xl font-black text-white uppercase tracking-widest flex items-center justify-center gap-4 tracking-tight leading-none">
              <ShieldAlert className="text-red-600 w-10 h-10" /> Sovereign Residency Compliance
            </h4>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm space-y-4 hover:bg-white/10 transition-colors">
                <History className="w-8 h-8 text-red-600 mx-auto" />
                <h5 className="font-bold text-white uppercase text-sm">Residency Tracking</h5>
                <p className="text-xs text-slate-400 italic">Temporary Residence Cards are purpose-specific. Unauthorized activities lead to card revocation and immediate deportation.</p>
              </div>
              <div className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm space-y-4 hover:bg-white/10 transition-colors">
                <History className="w-8 h-8 text-red-600 mx-auto" />
                <h5 className="font-bold text-white uppercase text-sm">Legal Framework</h5>
                <p className="text-xs text-slate-400 italic">Processing time depends on document verification and background authentication by Vietnamese Immigration.</p>
              </div>
              <div className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm space-y-4 hover:bg-white/10 transition-colors">
                <CreditCard className="w-8 h-8 text-red-600 mx-auto" />
                <h5 className="font-bold text-white uppercase text-sm">Fee Policy</h5>
                <p className="text-xs text-slate-400 italic">TRC fees are non-refundable in case of application rejection. Payment confirmation is required for submission.</p>
              </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default TRC;
