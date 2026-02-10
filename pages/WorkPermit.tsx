
import React, { useState } from 'react';
import { Language, DocType, Application } from '../types';
import VerificationForm from '../components/VerificationForm';
import { useAppConfig } from '../context/ConfigContext';
import { 
  FileText, ShieldCheck, User, MapPin, Globe, CreditCard, 
  ChevronRight, ChevronLeft, Upload, Loader2, CheckCircle2,
  AlertCircle, Briefcase, Camera, Send, Landmark, Info, 
  Scale, FileBadge, History, HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props { language: Language; }

const WorkPermit: React.FC<Props> = ({ language }) => {
  const navigate = useNavigate();
  const { config, addApplication } = useAppConfig();
  const svc = config.services[DocType.WORK_PERMIT];
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Application>>({
    fullName: '', passportNumber: '', passportIssueDate: '', passportExpiryDate: '',
    nationality: '', dob: '', gender: 'Male', email: '', phone: '',
    currentAddress: '', vietnamAddress: '', 
    details: { 
      employer: '', 
      employerAddress: '',
      jobTitle: '', 
      category: 'Expert',
      duration: '1 Year' 
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
      const appId = `VN-WP-${Date.now().toString().slice(-6)}`;
      const newApp: Application = {
        ...formData as Application,
        id: appId,
        type: DocType.WORK_PERMIT,
        status: 'Submitted',
        paymentStatus: 'Pending',
        submissionDate: new Date().toLocaleDateString(),
        history: [{ date: new Date().toLocaleString(), action: 'Dossier Filed', by: 'Applicant' }],
        amount: svc.fees[language],
        currency: 'VND',
        support_files: formData.support_files || []
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
      <section className="text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 uppercase tracking-tighter leading-tight">
          {svc.title[language]}
        </h1>
        <div className="w-48 h-2 bg-red-600 mx-auto rounded-full shadow-lg shadow-red-200" />
        <p className="text-xl md:text-2xl text-red-700 font-bold uppercase tracking-[0.2em] italic opacity-80">
          Official Labor Workforce Bureau
        </p>
      </section>

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

          <section className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl" />
            <div className="flex items-center gap-3 text-red-500">
              <Scale className="w-8 h-8" />
              <h2 className="text-2xl font-black uppercase tracking-tight">Legal Basis</h2>
            </div>
            <p className="text-slate-400 text-sm italic">Compliance with Decree 152/2020/ND-CP is mandatory for all foreign labor activities.</p>
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

      <section className="bg-slate-50 p-12 md:p-20 rounded-[4rem] border border-slate-200 shadow-inner relative overflow-hidden">
         <div className="text-center mb-16 space-y-4 relative z-10">
           <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Official WP Verification</h2>
           <p className="text-slate-500 font-medium italic">Check status or authenticate issued permits.</p>
         </div>
         <VerificationForm language={language} type={DocType.WORK_PERMIT} />
      </section>

      {svc.applyEnabled && (
        <section id="apply-section" className="space-y-12">
          <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl border border-slate-100 relative overflow-hidden text-slate-900">
            <ProgressHeader />
            
            {step === 1 && (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center"><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Step 1: Identity</h3></div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Full Legal Name</label>
                    <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none focus:border-red-600 uppercase" placeholder="AS PER PASSPORT" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Nationality</label>
                    <input required value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none focus:border-red-600 uppercase" placeholder="e.g. USA" />
                  </div>
                </div>
                <div className="flex justify-end pt-8">
                  <button onClick={nextStep} disabled={!formData.fullName} className="px-12 py-5 bg-red-600 text-white font-black uppercase tracking-widest rounded-full shadow-xl hover:bg-red-700 disabled:opacity-30 flex items-center gap-2">Next <ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center"><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Step 2: Professional Details</h3></div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Employer Legal Name</label>
                    <input required value={formData.details.employer} onChange={e => setFormData({...formData, details: {...formData.details, employer: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none uppercase" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Job Title / Role</label>
                    <input required value={formData.details.jobTitle} onChange={e => setFormData({...formData, details: {...formData.details, jobTitle: e.target.value}})} className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl text-slate-900 font-bold outline-none uppercase" />
                  </div>
                </div>
                <div className="flex justify-between pt-8">
                  <button onClick={prevStep} className="px-10 py-5 bg-slate-100 text-slate-600 font-black uppercase tracking-widest rounded-full flex items-center gap-2 border border-slate-200"><ChevronLeft className="w-5 h-5" /> Back</button>
                  <button onClick={nextStep} className="px-12 py-5 bg-red-600 text-white font-black uppercase tracking-widest rounded-full shadow-xl hover:bg-red-700 flex items-center gap-2">Next <ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center"><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Step 3: Document Upload</h3></div>
                <div className="grid md:grid-cols-2 gap-12">
                   <div className="p-12 border-4 border-dashed border-slate-100 rounded-[3.5rem] text-center relative group bg-slate-50">
                    <input type="file" onChange={(e) => handleFileUpload('passport_file', e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <Upload className="mx-auto w-10 h-10 text-slate-300 mb-4 group-hover:text-red-600" />
                    <p className="text-sm font-black uppercase">Passport Scan</p>
                    {formData.passport_file && <div className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-white font-black uppercase"><span>Attached</span><CheckCircle2 className="mt-2" /></div>}
                  </div>
                   <div className="p-12 border-4 border-dashed border-slate-100 rounded-[3.5rem] text-center relative group bg-slate-50">
                    <input type="file" onChange={(e) => handleFileUpload('photo_file', e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <Camera className="mx-auto w-10 h-10 text-slate-300 mb-4 group-hover:text-red-600" />
                    <p className="text-sm font-black uppercase">Portrait Photo</p>
                    {formData.photo_file && <div className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-white font-black uppercase"><span>Attached</span><CheckCircle2 className="mt-2" /></div>}
                  </div>
                </div>
                <div className="flex justify-between pt-8">
                  <button onClick={prevStep} className="px-10 py-5 bg-slate-100 text-slate-600 font-black uppercase tracking-widest rounded-full flex items-center gap-2 border border-slate-200"><ChevronLeft className="w-5 h-5" /> Back</button>
                  <button onClick={nextStep} disabled={!formData.passport_file} className="px-12 py-5 bg-red-600 text-white font-black uppercase tracking-widest rounded-full shadow-xl hover:bg-red-700 flex items-center gap-2">Review <ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center"><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Step 4: Final Review</h3></div>
                <div className="bg-slate-50 p-10 rounded-[3rem] space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                     <div><p className="text-[10px] font-black text-slate-400 uppercase">Applicant</p><p className="font-bold text-lg">{formData.fullName}</p></div>
                     <div><p className="text-[10px] font-black text-slate-400 uppercase">Employer</p><p className="font-bold text-lg">{formData.details.employer}</p></div>
                   </div>
                </div>
                <div className="flex justify-between pt-8">
                  <button onClick={prevStep} className="px-10 py-5 bg-slate-100 text-slate-600 font-black uppercase tracking-widest rounded-full flex items-center gap-2 border border-slate-200"><ChevronLeft className="w-5 h-5" /> Back</button>
                  <button onClick={nextStep} className="px-12 py-5 bg-red-600 text-white font-black uppercase tracking-widest rounded-full shadow-xl hover:bg-red-700 flex items-center gap-2">Proceed to Settlement <ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center"><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Step 5: National Treasury</h3></div>
                <div className="grid lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <p className="text-lg font-bold">Official Payment Gateways</p>
                    <div className="space-y-4">
                      {config.paymentMethods.filter(m => m.enabled).map(m => (
                        <div key={m.id} className="p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl flex items-center gap-4">
                          <Landmark className="text-red-600" />
                          <div><p className="font-black text-xs uppercase">{m.name}</p><p className="text-[10px] text-slate-400">{m.details}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <form onSubmit={handleApplyFinal} className="bg-white p-10 rounded-[3.5rem] border-2 border-red-50 space-y-6 shadow-xl">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Payment Ref / Screenshot</label>
                      <div className="border-2 border-dashed border-slate-200 p-8 rounded-3xl text-center relative bg-slate-50">
                        <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer" />
                        <Upload className="mx-auto mb-2 text-slate-300" />
                        <p className="text-[10px] font-black uppercase">Attach Receipt</p>
                      </div>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-emerald-600 text-white font-black uppercase tracking-widest rounded-full shadow-xl hover:bg-emerald-700 flex items-center justify-center gap-3">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck />} Complete Dossier
                    </button>
                  </form>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="text-center py-24 space-y-12 animate-in zoom-in duration-500">
                <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl border-8 border-white"><CheckCircle2 className="w-16 h-16" /></div>
                <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">WP Docket Created</h3>
                <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Registry ID: <span className="text-red-600">{activeAppId}</span></p>
                <div className="flex justify-center gap-6">
                   <button onClick={() => navigate('/')} className="px-12 py-5 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest">Home</button>
                   <button onClick={() => setStep(1)} className="px-12 py-5 bg-white border-2 border-slate-100 rounded-full font-black uppercase tracking-widest">New File</button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default WorkPermit;
