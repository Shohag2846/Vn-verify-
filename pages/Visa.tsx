import React, { useState } from 'react';
import { Language, DocType, Application } from '../types';
import VerificationForm from '../components/VerificationForm';
import { useAppConfig } from '../context/ConfigContext';
import { 
  ShieldCheck, FileText, Send, Upload, Loader2, 
  CheckCircle2, Landmark, Clock, Timer, CreditCard, 
  ChevronLeft, ChevronRight, User, Globe, AlertCircle, 
  Camera, Info, Scale, Coins, ShieldAlert, History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props { language: Language; }

const Visa: React.FC<Props> = ({ language }) => {
  const navigate = useNavigate();
  const { config, addApplication } = useAppConfig();
  const svc = config.services[DocType.VISA];
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);

  // Consolidated Form State for Step-by-Step persistence
  const [formData, setFormData] = useState<Partial<Application>>({
    fullName: '', passportNumber: '', passportIssueDate: '', passportExpiryDate: '',
    nationality: '', dob: '', gender: 'Male', email: '', phone: '',
    currentAddress: '', vietnamAddress: '', 
    details: { 
      visaType: 'Tourist (DL)', 
      purpose: 'Tourism', 
      duration: '90 Days',
      entryType: 'Single Entry'
    },
    passport_file: '', photo_file: '', support_files: []
  });

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
      const appId = `VN-VISA-${Date.now().toString().slice(-6)}`;
      const newApp: Application = {
        ...formData as Application,
        id: appId,
        type: DocType.VISA,
        status: 'Submitted',
        paymentStatus: 'Pending',
        submissionDate: new Date().toLocaleDateString(),
        history: [{ date: new Date().toLocaleString(), action: 'Electronic Dossier Filed', by: 'Applicant' }],
        amount: svc.fees[language],
        currency: 'VND',
        support_files: []
      };
      addApplication(newApp);
      setActiveAppId(appId);
      setIsSubmitting(false);
      nextStep();
    }, 2000);
  };

  const ProgressHeader = () => (
    <div className="flex items-center justify-center gap-4 mb-16 overflow-x-auto py-4 scrollbar-hide">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${
            step === i ? 'bg-red-600 text-white scale-110 shadow-lg shadow-red-200' : 
            step > i ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
          }`}>
            {step > i ? '✓' : i}
          </div>
          {i < 5 && <div className={`w-10 h-1 rounded-full ${step > i ? 'bg-emerald-500' : 'bg-slate-100'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-16 space-y-24 animate-in fade-in duration-700">
      
      {/* Title Section */}
      <section className="text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 uppercase tracking-tighter leading-tight">
          {svc.title[language]}
        </h1>
        <div className="w-48 h-2 bg-red-600 mx-auto rounded-full shadow-lg shadow-red-200" />
        <p className="text-xl md:text-2xl text-red-700 font-bold uppercase tracking-[0.2em] italic opacity-80">
          Official Entry Authorization Portal
        </p>
      </section>

      {/* 📜 Informational Cards */}
      <div className="grid lg:grid-cols-2 gap-12 text-slate-900">
        <div className="space-y-8">
          <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-red-600">
              <Info className="w-8 h-8" />
              <h2 className="text-2xl font-black uppercase tracking-tight">Vietnam Visa Service</h2>
            </div>
            <div className="space-y-4 text-slate-600 leading-relaxed italic">
              <p>This Visa service is designed for foreign nationals who wish to enter and stay in Vietnam legally for work, business, or other permitted purposes.</p>
              <p>Applicants must submit complete and accurate information along with valid supporting documents.</p>
              <p>All visa applications are processed according to Vietnamese immigration laws and regulations, and approval is subject to official authority verification.</p>
            </div>
          </section>

          <section className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl" />
            <div className="flex items-center gap-3 text-red-500">
              <Scale className="w-8 h-8" />
              <h2 className="text-2xl font-black uppercase tracking-tight">📜 Terms & Rules</h2>
            </div>
            <ul className="space-y-3">
              {[
                "All information must be accurate and match passport details",
                "Passport must be valid for at least 6 months from entry date",
                "Uploaded documents must be clear, genuine, and unedited",
                "Visa is issued for specific purpose and duration",
                "Validity, entry type, and duration are non-transferable"
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-400">
                  <span className="text-red-600 font-bold">•</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="p-4 bg-red-950/50 rounded-2xl border border-red-900/50 flex gap-3 items-start">
              <ShieldAlert className="w-8 h-8 text-red-500 shrink-0" />
              <p className="text-[10px] text-red-200 font-bold uppercase tracking-widest leading-relaxed">
                False information results in rejection, cancellation, or legal action under Vietnamese law.
              </p>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-red-600">
              <Coins className="w-8 h-8" />
              <h2 className="text-2xl font-black uppercase tracking-tight">💰 Visa Fees</h2>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-slate-600 font-medium italic">Visa processing fee depends on visa type and duration. Failure to pay prevents processing.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col justify-center shadow-inner">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Fee Type</p>
                  <p className="text-lg font-black text-slate-900 uppercase">Non-Refundable</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col justify-center shadow-inner">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Process Base</p>
                  <p className="text-lg font-black text-red-600">{svc.fees[language]}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {[
                  "Fees must be paid before processing begins",
                  "Payment confirmation is required to activate dossier",
                  "Additional service/urgency fees may apply",
                  "No refunds for failed or rejected applications"
                ].map((item, i) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-500 items-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="bg-slate-50 p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-slate-800">
              <Timer className="w-8 h-8" />
              <h2 className="text-2xl font-black uppercase tracking-tight leading-none">Processing Span</h2>
            </div>
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Window</p>
              <p className="text-3xl font-black text-slate-900">5 – 10 Working Days</p>
            </div>
            <p className="text-xs text-slate-500 italic">
              Processing time may vary depending on verification workload and official authority decisions.
            </p>
          </section>
        </div>
      </div>

      {/* Status Verification Portal */}
      <section className="bg-slate-50 p-12 md:p-20 rounded-[4rem] border border-slate-200 shadow-inner relative overflow-hidden">
         <div className="text-center mb-16 space-y-4 relative z-10">
           <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Official Visa Verification</h2>
           <p className="text-slate-500 font-medium italic leading-relaxed">
             Authenticate entry documents or track pending application progress.
           </p>
         </div>
         <VerificationForm language={language} type={DocType.VISA} />
      </section>

      {/* 5-Step Application Flow */}
      {svc.applyEnabled && (
        <section id="apply-section" className="space-y-12">
          <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl border border-slate-100 relative overflow-hidden text-slate-900">
            <ProgressHeader />
            
            {step === 1 && (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center"><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Step 1: Personal Profile</h3></div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest leading-none">Full Name (per passport)</label>
                    <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none focus:border-red-600 transition-all uppercase shadow-sm" placeholder="FULL NAME" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest leading-none">Nationality</label>
                      <input required value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none focus:border-red-600 transition-all uppercase shadow-sm" placeholder="FRANCE" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest leading-none">Gender</label>
                      <select required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-black uppercase outline-none focus:border-red-600 shadow-sm cursor-pointer">
                        <option value="Male">Male</option><option value="Female">Female</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest leading-none">Date of Birth</label>
                    <input required type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest leading-none">Intended Visa Type</label>
                    <select required value={formData.details.visaType} onChange={e => setFormData({...formData, details: {...formData.details, visaType: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-black uppercase outline-none focus:border-red-600 shadow-sm cursor-pointer">
                      <option value="Tourist (DL)">Tourist (DL)</option>
                      <option value="Business (DN1)">Business (DN1)</option>
                      <option value="Labor (LD1/LD2)">Labor (LD1/LD2)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end pt-8 border-t border-slate-50">
                  <button onClick={nextStep} disabled={!formData.fullName || !formData.nationality} className="px-12 py-5 bg-red-600 text-white font-black uppercase tracking-widest rounded-full shadow-xl hover:bg-red-700 disabled:opacity-30 active:scale-95 transition-all flex items-center gap-2">Next: Passport & Residency <ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center"><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Step 2: Passport & Residency</h3></div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest leading-none">Passport Number</label>
                    <input required value={formData.passportNumber} onChange={e => setFormData({...formData, passportNumber: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold font-mono outline-none shadow-sm" placeholder="PASS001" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest leading-none">Official Mobile Number</label>
                      <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none shadow-sm" placeholder="+..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest leading-none">Verified Notification Email</label>
                      <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none shadow-sm" placeholder="verified@mail.com" />
                    </div>
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest leading-none">Permanent Residence (Home Country)</label>
                    <input required value={formData.currentAddress} onChange={e => setFormData({...formData, currentAddress: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none shadow-sm" />
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest leading-none">Vietnam Intended Residence Address (Hotel/Accommodation)</label>
                    <input value={formData.vietnamAddress} onChange={e => setFormData({...formData, vietnamAddress: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none shadow-sm" placeholder="Full address in Vietnam" />
                  </div>
                </div>
                <div className="flex justify-between pt-8 border-t border-slate-50 text-slate-600">
                  <button onClick={prevStep} className="px-10 py-5 bg-slate-100 text-slate-600 font-black uppercase tracking-widest rounded-full flex items-center gap-2 transition-all hover:bg-slate-200 border border-slate-200"><ChevronLeft className="w-5 h-5" /> Back</button>
                  <button onClick={nextStep} disabled={!formData.passportNumber || !formData.email} className="px-12 py-5 bg-red-600 text-white font-black uppercase tracking-widest rounded-full shadow-xl hover:bg-red-700 disabled:opacity-30 active:scale-95 transition-all flex items-center gap-2">Next: Dossier Upload <ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center"><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Step 3: Dossier Upload</h3></div>
                <div className="grid md:grid-cols-2 gap-12 text-slate-900">
                  <div className="p-12 border-4 border-dashed border-slate-100 rounded-[3.5rem] text-center hover:border-red-600 transition-all relative group cursor-pointer overflow-hidden bg-slate-50">
                    <input type="file" onChange={(e) => handleFileUpload('passport_file', e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept=".pdf,.jpg,.png" />
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-red-600 group-hover:scale-110 transition-transform shadow-sm"><Upload className="w-10 h-10" /></div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">Passport Main Page Scan</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">PDF / JPG / PNG</p>
                    </div>
                    {formData.passport_file && <div className="absolute inset-0 bg-emerald-500/95 flex flex-col items-center justify-center text-white font-black uppercase tracking-widest"><span>Passport Attached</span><CheckCircle2 className="mt-2 w-8 h-8" /></div>}
                  </div>
                  <div className="p-12 border-4 border-dashed border-slate-100 rounded-[3.5rem] text-center hover:border-red-600 transition-all relative group cursor-pointer overflow-hidden bg-slate-50">
                    <input type="file" onChange={(e) => handleFileUpload('photo_file', e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept=".jpg,.png" />
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-red-600 group-hover:scale-110 transition-transform shadow-sm"><Camera className="w-10 h-10" /></div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">Biometric Bio Photo</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Portrait / ID Format</p>
                    </div>
                    {formData.photo_file && <div className="absolute inset-0 bg-emerald-500/95 flex flex-col items-center justify-center text-white font-black uppercase tracking-widest"><span>Photo Attached</span><CheckCircle2 className="mt-2 w-8 h-8" /></div>}
                  </div>
                </div>
                <div className="flex justify-between pt-8 border-t border-slate-50">
                  <button onClick={prevStep} className="px-10 py-5 bg-slate-100 text-slate-600 font-black uppercase tracking-widest rounded-full flex items-center gap-2 transition-all hover:bg-slate-200 border border-slate-200"><ChevronLeft className="w-5 h-5" /> Back</button>
                  <button onClick={nextStep} disabled={!formData.passport_file || !formData.photo_file} className="px-12 py-5 bg-red-600 text-white font-black uppercase tracking-widest rounded-full shadow-xl hover:bg-red-700 disabled:opacity-30 active:scale-95 transition-all flex items-center gap-2">Next: Review Application <ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center"><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Step 4: Application Review</h3></div>
                <div className="bg-slate-50 p-12 rounded-[3.5rem] border-2 border-slate-100 grid lg:grid-cols-2 gap-12 shadow-inner">
                  <div className="space-y-8 text-slate-900">
                    <h4 className="text-xs font-black uppercase text-red-600 tracking-widest border-b-2 border-red-600 pb-2 inline-block leading-none">Portfolio Summary</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 font-black uppercase leading-none">Full Legal Name</p>
                        <p className="font-black text-xl text-slate-900 uppercase leading-none">{formData.fullName}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 font-black uppercase leading-none">Passport ID</p>
                        <p className="font-bold text-slate-800 uppercase leading-none">{formData.passportNumber} ({formData.nationality})</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 font-black uppercase leading-none">Service Tier</p>
                        <p className="font-bold text-slate-800 uppercase leading-none">{formData.details.visaType}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 font-black uppercase leading-none">Primary Contact</p>
                        <p className="font-bold text-slate-800 leading-none">{formData.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <h4 className="text-xs font-black uppercase text-red-600 tracking-widest border-b-2 border-red-600 pb-2 inline-block leading-none">Settlement Breakdown</h4>
                    <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4 text-slate-900">
                      <div className="flex justify-between items-center"><p className="text-sm font-bold text-slate-500 uppercase leading-none">Administrative Fee</p><p className="font-black text-slate-900 leading-none">{svc.fees[language]}</p></div>
                      <div className="flex justify-between items-center"><p className="text-sm font-bold text-slate-500 uppercase leading-none">Urgency Surcharge</p><p className="font-black text-slate-900 leading-none">0 VND</p></div>
                      <div className="pt-4 border-t border-slate-100 flex justify-between items-center"><p className="text-xs font-black text-red-600 uppercase leading-none">Net Total</p><p className="text-2xl font-black text-red-600 leading-none">{svc.fees[language]}</p></div>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex gap-3 items-center">
                       <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                       <p className="text-[10px] text-amber-800 font-bold uppercase tracking-widest">Visa fees are non-refundable once application is filed.</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between pt-8 border-t border-slate-50">
                  <button onClick={prevStep} className="px-10 py-5 bg-slate-100 text-slate-600 font-black uppercase tracking-widest rounded-full flex items-center gap-2 transition-all hover:bg-slate-200 border border-slate-200"><ChevronLeft className="w-5 h-5" /> Back</button>
                  <button onClick={nextStep} className="px-12 py-5 bg-red-600 text-white font-black uppercase tracking-widest rounded-full shadow-2xl hover:bg-red-700 active:scale-95 transition-all flex items-center gap-3 border-b-4 border-red-900">
                    <Send className="w-5 h-5" /> Proceed to Settlement
                  </button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center space-y-4">
                  <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto" />
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Step 5: National Treasury Settlement</h3>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Application Tracking Reference: <span className="text-red-600">{activeAppId || 'PENDING'}</span></p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 text-slate-900">
                  <div className="space-y-8">
                    <h4 className="text-lg font-black text-slate-900 uppercase border-b-2 border-slate-900 pb-2 tracking-tight">Financial Instructions</h4>
                    <div className="space-y-4">
                      {config.paymentMethods.filter(m => m.enabled).map(m => (
                        <div key={m.id} className="p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] flex items-center gap-6 shadow-sm border border-slate-50 group hover:border-red-600 transition-all">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm border border-slate-50 group-hover:bg-red-600 group-hover:text-white transition-all"><Landmark className="w-6 h-6" /></div>
                          <div><p className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none">{m.name}</p><p className="text-[10px] font-medium text-slate-400 italic mt-1 leading-tight">{m.details}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleApplyFinal} className="bg-white p-10 rounded-[3rem] border-2 border-red-50 space-y-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl" />
                    <h4 className="text-lg font-black text-slate-900 uppercase text-center tracking-tight leading-none">Confirm Electronic Transaction</h4>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest leading-none">Bank Ref / Transaction Identifier</label>
                      <input required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-900 font-bold outline-none focus:border-red-600 shadow-inner" placeholder="TXN-12345678" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest leading-none">Attach Settlement Record (Screenshot)</label>
                      <div className="border-2 border-dashed border-slate-200 p-8 rounded-[2rem] text-center relative group hover:border-red-600 transition-colors bg-slate-50 shadow-inner">
                        <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                        <Upload className="mx-auto w-8 h-8 text-slate-300 group-hover:text-red-600 transition-colors mb-2" />
                        <p className="text-[9px] font-black text-slate-400 uppercase leading-none">Attach Electronic Receipt</p>
                      </div>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-emerald-600 text-white font-black uppercase tracking-widest rounded-full shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck />} Verify & finalize
                    </button>
                    <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">Manual departmental review follows filing</p>
                  </form>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="text-center py-24 space-y-12 animate-in zoom-in duration-500">
                <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl border-8 border-white"><CheckCircle2 className="w-16 h-16" /></div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Application Docket Created</h3>
                  <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Registry Tracking ID: <span className="text-red-600 font-black">{activeAppId}</span></p>
                </div>
                <p className="max-w-xl mx-auto text-slate-500 font-medium italic leading-relaxed">
                  Your electronic entry visa application has been successfully Filed. Processing span is typically 5-10 working days. Maintain your reference ID for all status lookups in the National Authentication portal.
                </p>
                <div className="flex justify-center gap-6">
                   <button onClick={() => navigate('/')} className="px-12 py-5 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest shadow-xl hover:bg-red-600 transition-all">Command Home</button>
                   <button onClick={() => setStep(1)} className="px-12 py-5 bg-white border-2 border-slate-100 text-slate-400 rounded-full font-black uppercase tracking-widest hover:border-red-600 hover:text-red-600 transition-all shadow-sm">Start New Application</button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer Informational Sections */}
      <section className="bg-slate-900 p-16 rounded-[4rem] text-center space-y-8 relative overflow-hidden group">
         <div className="relative z-10 space-y-12">
            <h4 className="text-3xl font-black text-white uppercase tracking-widest flex items-center justify-center gap-4 tracking-tight leading-none">
              <ShieldAlert className="text-red-600 w-10 h-10" /> National Immigration Compliance
            </h4>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm space-y-4 hover:bg-white/10 transition-colors">
                <History className="w-8 h-8 text-red-600 mx-auto" />
                <h5 className="font-bold text-white uppercase text-sm">Registry Tracking</h5>
                <p className="text-xs text-slate-400 italic">Official decisions rest solely with Vietnamese Immigration Authorities. Check status only via this portal.</p>
              </div>
              <div className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm space-y-4 hover:bg-white/10 transition-colors">
                <Scale className="w-8 h-8 text-red-600 mx-auto" />
                <h5 className="font-bold text-white uppercase text-sm">Legal Framework</h5>
                <p className="text-xs text-slate-400 italic">Processing time may vary depending on verification workload and background authentication.</p>
              </div>
              <div className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm space-y-4 hover:bg-white/10 transition-colors">
                <Coins className="w-8 h-8 text-red-600 mx-auto" />
                <h5 className="font-bold text-white uppercase text-sm">Fiscal Policy</h5>
                <p className="text-xs text-slate-400 italic">Visa fees are non-refundable once the application is submitted. Failed or rejected applications do not qualify for a refund.</p>
              </div>
            </div>
            <div className="pt-8 border-t border-white/5">
              <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.4em]">Ministry of Public Security • Department of Immigration</p>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      </section>
    </div>
  );
};

export default Visa;