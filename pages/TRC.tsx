import React, { useState } from 'react';
import { Language, DocType, Application } from '../types';
import VerificationForm from '../components/VerificationForm';
import { useAppConfig } from '../context/ConfigContext';
import { 
  ShieldCheck, FileText, Send, Upload, Loader2, 
  CheckCircle2, Landmark, Clock, Timer, CreditCard, 
  ChevronLeft, ChevronRight, User, Globe, AlertCircle, 
  Camera, Info, Scale, Coins, ShieldAlert, History,
  FileBadge, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props { language: Language; }

const TRC: React.FC<Props> = ({ language }) => {
  const navigate = useNavigate();
  const { config, addApplication } = useAppConfig();
  const svc = config.services[DocType.TRC];
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);

  // Consolidated Form State for Step-by-Step persistence
  const [formData, setFormData] = useState<Partial<Application>>({
    fullName: '', passportNumber: '', passportIssueDate: '', passportExpiryDate: '',
    nationality: '', dob: '', gender: 'Male', email: '', phone: '',
    currentAddress: '', vietnamAddress: '', 
    details: { 
      trcType: 'Work (LD)', 
      sponsorName: '', 
      licenseNumber: '', 
      duration: '2 Years' 
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
      const appId = `VN-TRC-${Date.now().toString().slice(-6)}`;
      const newApp: Application = {
        ...formData as Application,
        id: appId,
        type: DocType.TRC,
        status: 'Submitted',
        paymentStatus: 'Pending',
        submissionDate: new Date().toLocaleDateString(),
        history: [{ date: new Date().toLocaleString(), action: 'Residency Dossier Filed', by: 'Applicant' }],
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
          National Long-term Residency Bureau
        </p>
      </section>

      {/* 📜 Informational Cards */}
      <div className="grid lg:grid-cols-2 gap-12 text-slate-900">
        <div className="space-y-8">
          <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-red-600">
              <Info className="w-8 h-8" />
              <h2 className="text-2xl font-black uppercase tracking-tight">Temporary Residence Card (TRC)</h2>
            </div>
            <div className="space-y-4 text-slate-600 leading-relaxed italic">
              <p>The Temporary Resident Card (TRC) allows eligible foreign nationals to legally reside in Vietnam for an extended period without the need for frequent visa renewals.</p>
              <p>The TRC is usually issued to individuals holding valid work permits, investment licenses, or family sponsorship documents.</p>
              <p>Approval of a TRC is subject to compliance with Vietnamese immigration laws and successful document verification.</p>
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
                "All information must be accurate and match passport/visa records",
                "Passport must be valid for the entire TRC validity period",
                "Valid visa and supporting sponsorship documents are mandatory",
                "Uploaded documents must be clear, authentic, and unedited",
                "TRC is purpose-specific (work, investment, family, etc.)"
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
              <h2 className="text-2xl font-black uppercase tracking-tight">💰 TRC Fees</h2>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-slate-600 font-medium italic">TRC fees vary based on card type and validity duration. Non-refundable once processing begins.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col justify-center shadow-inner">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Fee Policy</p>
                  <p className="text-lg font-black text-slate-900 uppercase">Paid in Advance</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col justify-center shadow-inner">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Standard Levy</p>
                  <p className="text-lg font-black text-red-600">{svc.fees[language]}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {[
                  "Fees must be paid to initiate administrative processing",
                  "Payment confirmation is required for dossier submission",
                  "Additional service or express fees may apply if selected",
                  "No refunds in case of rejection or cancellation"
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
              <h2 className="text-2xl font-black uppercase tracking-tight leading-none">Review Period</h2>
            </div>
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Official Timeline</p>
              <p className="text-3xl font-black text-slate-900">5 – 10 Working Days</p>
            </div>
            <p className="text-xs text-slate-500 italic">
              Processing depends on document verification and official immigration authority review.
            </p>
          </section>
        </div>
      </div>

      {/* Registry Search / Status Tracker */}
      <section className="bg-slate-50 p-12 md:p-20 rounded-[4rem] border border-slate-200 shadow-inner relative overflow-hidden">
         <div className="text-center mb-16 space-y-4 relative z-10">
           <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">TRC Registry Explorer</h2>
           <p className="text-slate-500 font-medium italic leading-relaxed">
             Validate residency status or track your pending application in the national archives.
           </p>
         </div>
         <VerificationForm language={language} type={DocType.TRC} />
      </section>

      {/* 5-Step Application Flow */}
      {svc.applyEnabled && (
        <section id="apply-section" className="space-y-12">
          <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl border border-slate-100 relative overflow-hidden text-slate-900">
            <ProgressHeader />
            
            {step === 1 && (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center"><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Step 1: Resident Information</h3></div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest leading-none">Full Name (per passport)</label>
                    <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none focus:border-red-600 transition-all uppercase shadow-sm" placeholder="LEGAL NAME" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest leading-none">Passport Number</label>
                    <input required value={formData.passportNumber} onChange={e => setFormData({...formData, passportNumber: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold font-mono outline-none focus:border-red-600 shadow-sm" placeholder="B0000000" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest leading-none">Nationality</label>
                      <input required value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none focus:border-red-600 transition-all uppercase shadow-sm" placeholder="ITALY" />
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
                </div>
                <div className="flex justify-end pt-8 border-t border-slate-50">
                  <button onClick={nextStep} disabled={!formData.fullName || !formData.passportNumber} className="px-12 py-5 bg-red-600 text-white font-black uppercase tracking-widest rounded-full shadow-xl hover:bg-red-700 disabled:opacity-30 active:scale-95 transition-all flex items-center gap-2">Next: Contact Details <ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center"><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Step 2: Contact & Address Details</h3></div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest leading-none">Verified Email Address</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none shadow-sm" placeholder="official@mail.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest leading-none">Resident Phone Number</label>
                    <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none shadow-sm" placeholder="+84 ..." />
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest leading-none">Current Domicile (Permanent Home Address)</label>
                    <input required value={formData.currentAddress} onChange={e => setFormData({...formData, currentAddress: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none shadow-sm" />
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest leading-none">Vietnam Registered Address (Residence Book/Confirmation)</label>
                    <input required value={formData.vietnamAddress} onChange={e => setFormData({...formData, vietnamAddress: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none shadow-sm" placeholder="Full address in Vietnam" />
                  </div>
                </div>
                <div className="flex justify-between pt-8 border-t border-slate-50 text-slate-600">
                  <button onClick={prevStep} className="px-10 py-5 bg-slate-100 text-slate-600 font-black uppercase tracking-widest rounded-full flex items-center gap-2 transition-all hover:bg-slate-200 border border-slate-200"><ChevronLeft className="w-5 h-5" /> Back</button>
                  <button onClick={nextStep} disabled={!formData.email || !formData.vietnamAddress} className="px-12 py-5 bg-red-600 text-white font-black uppercase tracking-widest rounded-full shadow-xl hover:bg-red-700 disabled:opacity-30 active:scale-95 transition-all flex items-center gap-2">Next: Sponsorship Info <ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center"><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Step 3: Sponsorship/Purpose Information</h3></div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest leading-none">TRC Classification</label>
                    <select required value={formData.details.trcType} onChange={e => setFormData({...formData, details: {...formData.details, trcType: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-black uppercase outline-none focus:border-red-600 shadow-sm cursor-pointer">
                      <option value="Work (LD1/LD2)">Work (LD1/LD2)</option>
                      <option value="Investment (DT1/DT2/DT3)">Investment (DT1/DT2/DT3)</option>
                      <option value="Family Sponsorship (TT)">Family Sponsorship (TT)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest leading-none">WP Number / Investment License</label>
                    <input required value={formData.details.licenseNumber} onChange={e => setFormData({...formData, details: {...formData.details, licenseNumber: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none shadow-sm uppercase" placeholder="e.g. WP-123 or INV-456" />
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest leading-none">Sponsor / Employer Legal Name</label>
                    <input required value={formData.details.sponsorName} onChange={e => setFormData({...formData, details: {...formData.details, sponsorName: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none shadow-sm uppercase" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest leading-none">Requested Duration</label>
                    <select required value={formData.details.duration} onChange={e => setFormData({...formData, details: {...formData.details, duration: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-black uppercase outline-none focus:border-red-600 shadow-sm cursor-pointer">
                      <option value="1 Year">1 Year</option>
                      <option value="2 Years">2 Years</option>
                      <option value="3 Years">3 Years</option>
                      <option value="5 Years">5 Years</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-between pt-8 border-t border-slate-50">
                  <button onClick={prevStep} className="px-10 py-5 bg-slate-100 text-slate-600 font-black uppercase tracking-widest rounded-full flex items-center gap-2 transition-all hover:bg-slate-200 border border-slate-200"><ChevronLeft className="w-5 h-5" /> Back</button>
                  <button onClick={nextStep} disabled={!formData.details.sponsorName || !formData.details.licenseNumber} className="px-12 py-5 bg-red-600 text-white font-black uppercase tracking-widest rounded-full shadow-xl hover:bg-red-700 disabled:opacity-30 active:scale-95 transition-all flex items-center gap-2">Next: Dossier Upload <ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center"><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Step 4: Dossier Upload</h3></div>
                <div className="grid md:grid-cols-2 gap-8 text-slate-900">
                  <div className="p-8 border-4 border-dashed border-slate-100 rounded-[3rem] text-center hover:border-red-600 transition-all relative group cursor-pointer overflow-hidden bg-slate-50">
                    <input type="file" onChange={(e) => handleFileUpload('passport_file', e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept=".pdf,.jpg,.png" />
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-red-600 group-hover:scale-110 transition-transform shadow-sm"><Upload className="w-8 h-8" /></div>
                      <p className="text-sm font-black text-slate-900 uppercase">Passport Profile Scan</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PDF / JPG / PNG</p>
                    </div>
                    {formData.passport_file && <div className="absolute inset-0 bg-emerald-500/95 flex flex-col items-center justify-center text-white font-black uppercase tracking-widest text-xs"><span>Passport Attached</span><CheckCircle2 className="mt-2 w-6 h-6" /></div>}
                  </div>

                  <div className="p-8 border-4 border-dashed border-slate-100 rounded-[3rem] text-center hover:border-red-600 transition-all relative group cursor-pointer overflow-hidden bg-slate-50">
                    <input type="file" onChange={(e) => handleFileUpload('photo_file', e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept=".jpg,.png" />
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-red-600 group-hover:scale-110 transition-transform shadow-sm"><Camera className="w-8 h-8" /></div>
                      <p className="text-sm font-black text-slate-900 uppercase">Biometric Bio-Photo</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Self Portrait / White Background</p>
                    </div>
                    {formData.photo_file && <div className="absolute inset-0 bg-emerald-500/95 flex flex-col items-center justify-center text-white font-black uppercase tracking-widest text-xs"><span>Photo Attached</span><CheckCircle2 className="mt-2 w-6 h-6" /></div>}
                  </div>

                  <div className="p-8 border-4 border-dashed border-slate-100 rounded-[3rem] text-center hover:border-red-600 transition-all relative group cursor-pointer overflow-hidden bg-slate-50">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" accept=".pdf" />
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-red-600 group-hover:scale-110 transition-transform shadow-sm"><FileBadge className="w-8 h-8" /></div>
                      <p className="text-sm font-black text-slate-900 uppercase">Sponsorship Artifact</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Work Permit / License / Sponsor Proof</p>
                    </div>
                  </div>

                  <div className="p-8 border-4 border-dashed border-slate-100 rounded-[3rem] text-center hover:border-red-600 transition-all relative group cursor-pointer overflow-hidden bg-slate-50">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" accept=".pdf" />
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-red-600 group-hover:scale-110 transition-transform shadow-sm"><MapPin className="w-8 h-8" /></div>
                      <p className="text-sm font-black text-slate-900 uppercase">Residency Confirmation</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Police Registration / Hotel Form</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between pt-8 border-t border-slate-50">
                  <button onClick={prevStep} className="px-10 py-5 bg-slate-100 text-slate-600 font-black uppercase tracking-widest rounded-full flex items-center gap-2 transition-all hover:bg-slate-200 border border-slate-200"><ChevronLeft className="w-5 h-5" /> Back</button>
                  <button onClick={nextStep} disabled={!formData.passport_file || !formData.photo_file} className="px-12 py-5 bg-red-600 text-white font-black uppercase tracking-widest rounded-full shadow-xl hover:bg-red-700 disabled:opacity-30 active:scale-95 transition-all flex items-center gap-2">Next: Review Residency <ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            )}

            {step === 4.5 && null /* Spacer to keep logic clean */}

            {step === 5 && (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Step 5: National Treasury Settlement</h3>
                  <p className="text-slate-500 font-medium italic">Fees must be paid in advance to initiate administrative processing.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 text-slate-900">
                  <div className="space-y-8">
                    <div className="p-8 bg-red-50 rounded-[3rem] border border-red-100 space-y-4 shadow-sm">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Residency Levy</p>
                        <p className="text-3xl font-black text-red-700">{svc.fees[language]}</p>
                      </div>
                      <div className="w-full h-px bg-red-100" />
                      <div className="flex items-center gap-3 text-red-600">
                        <ShieldCheck className="w-5 h-5" />
                        <p className="text-[10px] font-black uppercase">Official State Tariff</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Settle via Official Channel</h4>
                      <div className="grid gap-3">
                        {config.paymentMethods.filter(m => m.enabled).map(m => (
                          <div key={m.id} className="p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl flex items-center gap-4 group hover:border-red-600 transition-all cursor-pointer">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm group-hover:bg-red-600 group-hover:text-white transition-all"><Landmark className="w-6 h-6" /></div>
                            <div className="flex-1">
                              <p className="text-sm font-black text-slate-900 uppercase">{m.name}</p>
                              <p className="text-[10px] font-medium text-slate-400 italic">{m.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleApplyFinal} className="bg-white p-10 rounded-[3.5rem] border-2 border-red-50 space-y-6 shadow-xl relative overflow-hidden">
                    <h4 className="text-xl font-black text-slate-900 uppercase text-center tracking-tight">Financial Validation</h4>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest leading-none">Bank Ref / Transaction Number</label>
                      <input required className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-900 font-bold outline-none focus:border-red-600 shadow-inner" placeholder="TRC-TXN-001" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest leading-none">Payment Proof Artifact (Screenshot)</label>
                      <div className="border-2 border-dashed border-slate-200 p-8 rounded-[2rem] text-center relative group hover:border-red-600 transition-colors bg-slate-50 shadow-inner">
                        <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                        <Upload className="mx-auto w-8 h-8 text-slate-300 group-hover:text-red-600 transition-colors mb-2" />
                        <p className="text-[9px] font-black text-slate-400 uppercase leading-none">Attach Settlement Evidence</p>
                      </div>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-emerald-600 text-white font-black uppercase tracking-widest rounded-full shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck className="w-5 h-5" />} Finalize Residency Dossier
                    </button>
                    <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">Manual verification mandatory for TRC issuance</p>
                  </form>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="text-center py-24 space-y-12 animate-in zoom-in duration-500">
                <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl border-8 border-white"><CheckCircle2 className="w-16 h-16" /></div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Residency Record Initiated</h3>
                  <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Archival Reference ID: <span className="text-red-600 font-black">{activeAppId}</span></p>
                </div>
                <p className="max-w-xl mx-auto text-slate-500 font-medium italic leading-relaxed">
                  Your dossier has been officially recorded in the National Residency system. Manual departmental review and card printing will be processed within 5-10 working days. Status tracking is available via this portal.
                </p>
                <div className="flex justify-center gap-6">
                   <button onClick={() => navigate('/')} className="px-12 py-5 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest shadow-xl hover:bg-red-600 transition-all">Command Home</button>
                   <button onClick={() => setStep(1)} className="px-12 py-5 bg-white border-2 border-slate-100 text-slate-400 rounded-full font-black uppercase tracking-widest hover:border-red-600 hover:text-red-600 transition-all shadow-sm">New Residency File</button>
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
              <ShieldAlert className="text-red-600 w-10 h-10" /> Sovereign Residency Compliance
            </h4>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm space-y-4 hover:bg-white/10 transition-colors">
                <History className="w-8 h-8 text-red-600 mx-auto" />
                <h5 className="font-bold text-white uppercase text-sm">Residency Tracking</h5>
                <p className="text-xs text-slate-400 italic">Temporary Residence Cards are purpose-specific. Unauthorized activities lead to card revocation and immediate deportation.</p>
              </div>
              <div className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm space-y-4 hover:bg-white/10 transition-colors">
                <Scale className="w-8 h-8 text-red-600 mx-auto" />
                <h5 className="font-bold text-white uppercase text-sm">Legal Framework</h5>
                <p className="text-xs text-slate-400 italic">Processing time depends on document verification and background authentication by Vietnamese Immigration.</p>
              </div>
              <div className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm space-y-4 hover:bg-white/10 transition-colors">
                <Coins className="w-8 h-8 text-red-600 mx-auto" />
                <h5 className="font-bold text-white uppercase text-sm">Fee Policy</h5>
                <p className="text-xs text-slate-400 italic">TRC fees are non-refundable in case of application rejection. Payment confirmation is required for submission.</p>
              </div>
            </div>
            <div className="pt-8 border-t border-white/5">
              <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.4em]">Socialist Republic of Vietnam • Ministry of Public Security</p>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      </section>
    </div>
  );
};

export default TRC;