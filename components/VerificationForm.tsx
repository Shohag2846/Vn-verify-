
import React, { useState, useRef } from 'react';
import { translations } from '../i18n';
import { Language, DocType, VerificationResult, OfficialRecord } from '../types';
import { useAppConfig } from '../context/ConfigContext';
import { 
  FileCheck, ShieldCheck, AlertCircle, Loader2, Download, 
  History, SearchX, Eye, User, Globe, Briefcase, Calendar, 
  FileText, ExternalLink, Printer, CheckCircle2, X
} from 'lucide-react';

interface Props {
  language: Language;
  type: DocType;
}

const VerificationForm: React.FC<Props> = ({ language, type }) => {
  const { records, applications } = useAppConfig();
  const t = translations;
  const [passport, setPassport] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [matchedRecord, setMatchedRecord] = useState<OfficialRecord | null>(null);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passport.trim()) return;

    setLoading(true);
    setResult(null);
    setMatchedRecord(null);

    const cleanPassport = passport.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    // Artificial delay for secure lookup feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // 1. Search in Official Records (Admin-created)
      const officialRecord = records.find(r => 
        r.passportNumber.toUpperCase() === cleanPassport && 
        r.type === type
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
            ? "Administrative Verification Successful. This document is authentic and registered in the national database."
            : "Xác minh hành chính thành công. Tài liệu này là xác thực và đã được đăng ký trong cơ sở dữ liệu quốc gia."
        });
        return;
      } 

      // 2. Search in Applications (Pending/Submitted)
      const pendingApp = applications.find(a => 
        a.passportNumber.toUpperCase() === cleanPassport && 
        a.type === type
      );

      if (pendingApp) {
        setResult({
          status: 'pending',
          documentId: pendingApp.id,
          ownerName: pendingApp.fullName,
          submissionDate: pendingApp.submissionDate,
          message: language === 'en'
            ? `Dossier found with status: ${pendingApp.status}. Your application is under review.`
            : `Hồ sơ được tìm thấy với trạng thái: ${pendingApp.status}. Đơn đăng ký của bạn đang được xem xét.`
        });
        return;
      }

      // 3. No record found
      setResult({
        status: 'invalid',
        documentId: 'NOT_FOUND',
        message: language === 'en'
          ? "No matching records found in the secure registry. Please check your passport number."
          : "Không tìm thấy hồ sơ phù hợp trong sổ đăng ký bảo mật. Vui lòng kiểm tra số hộ chiếu của bạn."
      });

    } catch (err) {
      setResult({
        status: 'invalid',
        documentId: 'ERROR',
        message: "System verification error."
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <button onClick={() => setPreviewFile(null)} className="absolute top-6 right-6 p-4 bg-white/20 text-white rounded-full hover:bg-white/40"><X className="w-8 h-8" /></button>
           <div className="max-w-4xl w-full h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-2 border border-white/10">
              <img src={previewFile} className="w-full h-full object-contain rounded-2xl" alt="Document Preview" onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/800x1200?text=Document+Load+Error'} />
           </div>
        </div>
      )}

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
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Reference Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="verified@domain.com"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-red-600 focus:bg-white outline-none transition-all text-slate-900 font-bold bg-slate-50"
                />
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={loading}
                className="vn-bg-red hover:bg-red-700 text-white px-16 py-5 rounded-full font-black uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center gap-3 disabled:opacity-50 active:scale-95 group"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                {loading ? t.verifying[language] : 'Verify Credentials'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {result && (
        <div 
          ref={resultRef}
          className="animate-in fade-in slide-in-from-bottom-12 duration-1000 space-y-8"
        >
          {/* HEADER STATUS */}
          <div className={`p-8 rounded-[3rem] border-2 shadow-xl flex items-center gap-8 ${
            result.status === 'valid' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' :
            result.status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-900' : 'bg-red-50 border-red-100 text-red-900'
          }`}>
             <div className={`p-6 rounded-2xl shadow-lg ${
               result.status === 'valid' ? 'bg-emerald-600 text-white' :
               result.status === 'pending' ? 'bg-amber-600 text-white' : 'bg-red-600 text-white'
             }`}>
               {result.status === 'valid' ? <ShieldCheck className="w-12 h-12" /> : result.status === 'pending' ? <History className="w-12 h-12" /> : <SearchX className="w-12 h-12" />}
             </div>
             <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Electronic Verification Summary</p>
               <h3 className="text-4xl font-black uppercase tracking-tighter italic">
                 {result.status === 'valid' ? 'Authenticated' : result.status === 'pending' ? 'In-Process' : 'Record Not Found'}
               </h3>
               <p className="text-sm font-medium opacity-80">{result.message}</p>
             </div>
          </div>

          {/* DETAILED RECORD VIEW (The "Fill-in-the-gap" Styled Table) */}
          {matchedRecord && (
            <div className="bg-white rounded-[4rem] border-2 border-slate-100 shadow-2xl overflow-hidden relative group">
              {/* Authenticated Seal - Background */}
              <div className="absolute top-10 right-10 flex flex-col items-center opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Vietnam.svg/200px-Emblem_of_Vietnam.svg.png" className="w-40" alt="Emblem" />
                 <p className="mt-4 text-2xl font-black uppercase text-center">Ministry of<br/>Public Security</p>
              </div>

              <div className="p-12 lg:p-20 grid lg:grid-cols-3 gap-16">
                {/* Left: Metadata & Fields */}
                <div className="lg:col-span-2 space-y-12">
                   <div className="flex items-center gap-4 text-red-600 border-b pb-6">
                      <User className="w-8 h-8" />
                      <h4 className="text-2xl font-black uppercase tracking-tight">Citizen Identification Data</h4>
                   </div>

                   <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
                      {[
                        { label: 'Full Legal Name', val: matchedRecord.fullName, icon: User },
                        { label: 'Passport Identification', val: matchedRecord.passportNumber, icon: FileText, highlight: true },
                        { label: 'Nationality / Origin', val: matchedRecord.nationality, icon: Globe },
                        { label: 'Date of Birth', val: matchedRecord.dob || 'NOT RECORDED', icon: Calendar },
                        { label: 'Official Registry ID', val: matchedRecord.id, icon: ShieldCheck },
                        { label: 'Class of Authorization', val: matchedRecord.type, icon: Briefcase },
                        { label: 'Authority Issue Date', val: matchedRecord.issueDate, icon: Calendar },
                        { label: 'Validity Expiry Date', val: matchedRecord.expiryDate, icon: Calendar, danger: true },
                        { label: 'Sponsoring Employer', val: matchedRecord.employer || 'N/A', icon: Briefcase },
                        { label: 'Professional Designation', val: matchedRecord.jobTitle || 'N/A', icon: User },
                      ].map((field, i) => (
                        <div key={i} className="space-y-3">
                           <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                             <field.icon className="w-3 h-3" /> {field.label}
                           </div>
                           <div className={`p-4 rounded-xl border-2 font-black text-lg uppercase tracking-tight shadow-sm ${
                             field.highlight ? 'bg-red-50 border-red-100 text-red-700' : 
                             field.danger ? 'bg-slate-50 border-red-50 text-red-500' : 'bg-slate-50 border-slate-100 text-slate-900'
                           }`}>
                             {field.val}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Right: File Evidence & Actions */}
                <div className="space-y-8">
                   <div className="bg-slate-950 rounded-[3rem] p-10 text-white space-y-10 shadow-2xl relative overflow-hidden">
                      <div className="relative z-10 space-y-6 text-center">
                         <h5 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400">Archived Document</h5>
                         <div className="aspect-[3/4] bg-white/5 rounded-[2rem] border-2 border-dashed border-white/20 flex flex-col items-center justify-center group overflow-hidden">
                            <img src={matchedRecord.pdfUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" alt="Official Scan" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                               <button onClick={() => setPreviewFile(matchedRecord.pdfUrl)} className="p-4 bg-white rounded-full text-slate-950 shadow-2xl transform scale-75 group-hover:scale-100 transition-transform"><Eye className="w-8 h-8" /></button>
                            </div>
                         </div>
                         <div className="space-y-4">
                            <a 
                              href={matchedRecord.pdfUrl} 
                              download={`${matchedRecord.passportNumber}_VERIFIED.png`}
                              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                               <Download className="w-4 h-4" /> Download Official Scan
                            </a>
                            <button onClick={() => window.print()} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3">
                               <Printer className="w-4 h-4" /> Print Verification
                            </button>
                         </div>
                      </div>
                      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
                   </div>

                   {/* Legal Disclaimer Box */}
                   <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 italic space-y-4">
                      <div className="flex items-center gap-2 text-slate-400"><AlertCircle className="w-4 h-4" /><p className="text-[10px] font-black uppercase tracking-widest">Notice</p></div>
                      <p className="text-xs text-slate-500 leading-relaxed">This digital authentication serves as primary evidence of lawful status within the Socialist Republic of Vietnam. Any tampering or misuse of this record is punishable by law.</p>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Fallback for Pending / Not Found results */}
          {!matchedRecord && result.documentId !== 'ERROR' && (
             <div className="bg-white p-12 md:p-16 rounded-[4rem] border-2 border-slate-100 shadow-xl text-center space-y-8">
                {result.status === 'invalid' ? (
                  <>
                    <SearchX className="w-20 h-20 text-red-200 mx-auto" />
                    <div className="space-y-2">
                       <h4 className="text-2xl font-black text-slate-900 uppercase">Registry Miss</h4>
                       <p className="text-slate-500 max-w-xl mx-auto italic">The credentials entered do not match any issued documents in our electronic registry. Please verify your passport number or contact the issuing authority.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto"><Loader2 className="w-12 h-12 animate-spin" /></div>
                    <div className="space-y-4">
                       <h4 className="text-2xl font-black text-slate-900 uppercase">Docket In-Process</h4>
                       <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                             <p className="text-[10px] font-black text-slate-400 uppercase">Applicant</p>
                             <p className="font-bold text-slate-900 uppercase truncate">{result.ownerName}</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                             <p className="text-[10px] font-black text-slate-400 uppercase">Docket ID</p>
                             <p className="font-mono font-bold text-red-600">{result.documentId}</p>
                          </div>
                       </div>
                    </div>
                  </>
                )}
                <div className="pt-4 flex justify-center">
                   <button onClick={() => { setResult(null); setPassport(''); }} className="px-10 py-4 bg-slate-900 text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl">New Verification Inquiry</button>
                </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerificationForm;
