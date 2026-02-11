
import React, { useState, useRef } from 'react';
import { translations } from '../i18n';
import { Language, DocType, VerificationResult, OfficialRecord } from '../types';
import { useAppConfig } from '../context/ConfigContext';
import { 
  FileCheck, ShieldCheck, AlertCircle, Loader2, Download, 
  History, SearchX, Eye, User, Globe, Briefcase, Calendar, 
  FileText, ExternalLink, Printer, CheckCircle2, X, Image as ImageIcon,
  Mail, Phone
} from 'lucide-react';

interface Props {
  language: Language;
  type: DocType;
}

const VerificationForm: React.FC<Props> = ({ language, type }) => {
  const { records } = useAppConfig();
  const t = translations;
  const [passport, setPassport] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [matchedRecord, setMatchedRecord] = useState<OfficialRecord | null>(null);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passport.trim()) return;

    setLoading(true);
    setResult(null);
    setMatchedRecord(null);
    setImgError(false);

    const cleanPassport = passport.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Logic: Match passport AND optionally email if provided by admin
      const officialRecord = records.find(r => 
        r.passportNumber.toUpperCase() === cleanPassport && 
        r.type === type &&
        (!cleanEmail || r.email.toLowerCase() === cleanEmail)
      );

      if (officialRecord) {
        setMatchedRecord(officialRecord);
        setResult({
          status: officialRecord.status === 'Verified' ? 'valid' : 'expired',
          documentId: officialRecord.id,
          ownerName: officialRecord.fullName,
          issueDate: officialRecord.issueDate,
          expiryDate: officialRecord.expiryDate,
          message: language === 'en' 
            ? "Administrative Verification Successful. Record exists in national archives."
            : "Xác minh hành chính thành công. Hồ sơ tồn tại trong kho lưu trữ quốc gia."
        });
      } else {
        setResult({
          status: 'invalid',
          documentId: 'NOT_FOUND',
          message: language === 'en'
            ? "No matching records found in the registry for this Passport/Email combination."
            : "Không tìm thấy hồ sơ phù hợp với số Hộ chiếu/Email này."
        });
      }
    } catch (err) {
      setResult({ status: 'invalid', documentId: 'ERROR', message: "System synchronization error." });
    } finally {
      setLoading(false);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Universal Modal for Full Image View */}
      {previewFile && (
        <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
           <button onClick={() => setPreviewFile(null)} className="absolute top-6 right-6 p-4 bg-white/10 text-white rounded-full hover:bg-white/40 transition-all active:scale-90"><X className="w-8 h-8" /></button>
           <div className="max-w-4xl w-full max-h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-2 border border-white/10">
              <img 
                src={previewFile} 
                className="w-full h-full object-contain rounded-2xl" 
                alt="Registry Asset Preview" 
                onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/800x1200?text=Scan+Not+Readable'} 
              />
           </div>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 mb-12">
        <div className="p-8 md:p-12">
          <form onSubmit={handleVerify} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  {t.passportLabel[language]} <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={passport}
                  onChange={(e) => setPassport(e.target.value)}
                  placeholder="e.g. B1234567"
                  required
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-red-600 focus:bg-white outline-none transition-all text-slate-900 font-bold bg-slate-50 uppercase"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address (Registry Check)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="verified@domain.com"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-red-600 focus:bg-white outline-none transition-all text-slate-900 font-bold bg-slate-50"
                />
              </div>
            </div>
            <div className="flex justify-center">
              <button type="submit" disabled={loading} className="vn-bg-red hover:bg-red-700 text-white px-16 py-5 rounded-full font-black uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center gap-3 disabled:opacity-50 active:scale-95">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                {loading ? t.verifying[language] : 'Verify Administrative Record'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {result && (
        <div ref={resultRef} className="animate-in fade-in slide-in-from-bottom-12 duration-1000 space-y-8">
          {/* Status Banner */}
          <div className={`p-8 rounded-[3rem] border-2 shadow-xl flex items-center gap-8 ${
            result.status === 'valid' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
          }`}>
             <div className={`p-6 rounded-2xl shadow-lg ${result.status === 'valid' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
               {result.status === 'valid' ? <CheckCircle2 className="w-12 h-12" /> : <SearchX className="w-12 h-12" />}
             </div>
             <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Authentication Report</p>
               <h3 className={`text-4xl font-black uppercase tracking-tighter italic ${result.status === 'valid' ? 'text-emerald-900' : 'text-red-900'}`}>
                 {result.status === 'valid' ? 'Authenticated' : 'No Registry Entry'}
               </h3>
               <p className="text-sm font-medium text-slate-600">{result.message}</p>
             </div>
          </div>

          {/* Main Record Display */}
          {matchedRecord && (
            <div className="bg-white rounded-[4rem] border-2 border-slate-100 shadow-2xl overflow-hidden relative group">
              <div className="absolute top-10 right-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-1000">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Vietnam.svg/200px-Emblem_of_Vietnam.svg.png" className="w-64" alt="Emblem" />
              </div>

              <div className="p-12 lg:p-20 grid lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2 space-y-12">
                   <div className="flex items-center gap-4 text-red-600 border-b border-slate-50 pb-6">
                      <FileText className="w-8 h-8" />
                      <h4 className="text-2xl font-black uppercase tracking-tight">National Registry Credentials</h4>
                   </div>

                   <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
                      {[
                        { label: 'Full Legal Name', val: matchedRecord.fullName, icon: User },
                        { label: 'Passport Identification', val: matchedRecord.passportNumber, icon: FileText, highlight: true },
                        { label: 'Nationality / Region', val: matchedRecord.nationality, icon: Globe },
                        { label: 'Registry Category', val: matchedRecord.type, icon: Briefcase },
                        // Fixed: Property 'employer' does not exist on type 'OfficialRecord'. Use 'sponsorCompany' instead.
                        { label: 'Sponsoring Entity', val: matchedRecord.sponsorCompany || 'VERIFIED SPONSOR', icon: Briefcase },
                        { label: 'Professional Role', val: matchedRecord.jobTitle || 'ADMINISTRATIVE', icon: User },
                        { label: 'Administrative Contact', val: matchedRecord.email, icon: Mail },
                        { label: 'Secure Phone Line', val: matchedRecord.phone, icon: Phone },
                        { label: 'Issuance Chronology', val: matchedRecord.issueDate, icon: Calendar },
                        { label: 'Registry Expiry', val: matchedRecord.expiryDate, icon: Calendar, danger: true },
                      ].map((field, i) => (
                        <div key={i} className="space-y-2">
                           <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                             <field.icon className="w-3.5 h-3.5" /> {field.label}
                           </div>
                           <div className={`p-4 rounded-xl border-2 font-black text-lg uppercase tracking-tight shadow-sm ${
                             field.highlight ? 'bg-red-50 border-red-100 text-red-700' : 
                             field.danger ? 'bg-slate-50 border-red-50 text-red-500' : 'bg-slate-50 border-slate-100 text-slate-900'
                           }`}>
                             {field.val || '---'}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Right: Registry Assets */}
                <div className="space-y-8">
                   <div className="bg-slate-950 rounded-[3rem] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden">
                      <div className="relative z-10 space-y-8">
                         <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 text-center">Verified Registry Artifacts</h5>
                         
                         <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase text-white/40 tracking-widest text-center">Identity Assets</p>
                            <div className="grid grid-cols-2 gap-4">
                               <button onClick={() => setPreviewFile(matchedRecord.passport_copy || matchedRecord.pdfUrl)} className="aspect-square bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all group">
                                  <ImageIcon className="w-6 h-6 text-emerald-400 group-hover:scale-125 transition-transform" />
                                  <span className="text-[8px] font-black uppercase">Passport</span>
                               </button>
                               <button onClick={() => (matchedRecord.visa_copy || matchedRecord.trc_copy) && setPreviewFile(matchedRecord.visa_copy || matchedRecord.trc_copy || null)} disabled={!matchedRecord.visa_copy && !matchedRecord.trc_copy} className="aspect-square bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all group disabled:opacity-30">
                                  <ImageIcon className="w-6 h-6 text-blue-400 group-hover:scale-125 transition-transform" />
                                  <span className="text-[8px] font-black uppercase">Visa / TRC</span>
                               </button>
                            </div>
                         </div>

                         <div className="space-y-3">
                            <button 
                              onClick={() => handleDownload(matchedRecord.pdfUrl, `${matchedRecord.passportNumber}_Official_Credentials.png`)}
                              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                               <Download className="w-4 h-4" /> Download Credentials
                            </button>
                            <button onClick={() => window.print()} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3">
                               <Printer className="w-4 h-4" /> Print Dossier
                            </button>
                         </div>
                      </div>
                      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
                   </div>

                   <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 italic space-y-4">
                      <div className="flex items-center gap-2 text-amber-600"><AlertCircle className="w-4 h-4" /><p className="text-[10px] font-black uppercase tracking-widest">Procedural Alert</p></div>
                      <p className="text-[10px] text-amber-800 leading-relaxed font-bold">This electronic record is an official extract from the National Registry Database of the Socialist Republic of Vietnam.</p>
                   </div>
                </div>
              </div>
            </div>
          )}

          {!matchedRecord && result.documentId === 'NOT_FOUND' && (
             <div className="bg-white p-20 rounded-[4rem] border-2 border-slate-100 shadow-xl text-center space-y-10 animate-in zoom-in duration-500">
                <div className="w-32 h-32 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner"><SearchX className="w-16 h-16" /></div>
                <div className="space-y-4">
                   <h4 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Record Not Located</h4>
                   <p className="text-slate-500 max-w-xl mx-auto italic font-medium">No official record matches the Passport <span className="text-red-600 font-black">[{passport.toUpperCase()}]</span> and provided Email. Please verify your input or consult the administrative body.</p>
                </div>
                <button onClick={() => { setResult(null); setPassport(''); }} className="px-12 py-5 bg-slate-900 text-white rounded-full font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all">New Search Request</button>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerificationForm;
