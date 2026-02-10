import React, { useState, useRef } from 'react';
import { translations } from '../i18n';
import { Language, DocType, VerificationResult } from '../types';
import { useAppConfig } from '../context/ConfigContext';
import { FileCheck, ShieldCheck, AlertCircle, Loader2, Download, History, SearchX } from 'lucide-react';

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
  const resultRef = useRef<HTMLDivElement>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passport.trim()) return;

    setLoading(true);
    setResult(null);

    const cleanPassport = passport.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    // Artificial delay to simulate secure database lookup
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // 1. Check official records database (Verified Records)
      const officialRecord = records.find(r => 
        r.passportNumber.toUpperCase() === cleanPassport && 
        r.type === type
      );

      if (officialRecord) {
        setResult({
          status: officialRecord.status === 'Verified' ? 'valid' : 'expired',
          documentId: officialRecord.id,
          ownerName: officialRecord.fullName,
          issueDate: officialRecord.issueDate,
          expiryDate: officialRecord.expiryDate,
          message: language === 'en' 
            ? `Official Authenticated Record Found: ${officialRecord.type} for ${officialRecord.fullName}. Employer/Sponsor: ${officialRecord.employer || 'National Registry'}. Authority Reference: ${officialRecord.authorityReference || 'Dept of Immigration'}.`
            : `Đã tìm thấy bản ghi chính thức: ${officialRecord.type} cho ${officialRecord.fullName}. Đơn vị bảo lãnh: ${officialRecord.employer || 'Cơ sở dữ liệu quốc gia'}. Tham chiếu cơ quan: ${officialRecord.authorityReference || 'Cục Quản lý Xuất nhập cảnh'}.`
        });
        return;
      } 

      // 2. Check pending applications in the portal
      const pendingApp = applications.find(a => 
        a.passportNumber.toUpperCase() === cleanPassport && 
        (a.email.toLowerCase() === cleanEmail || !email) && 
        a.type === type
      );

      if (pendingApp) {
        setResult({
          status: 'pending',
          documentId: pendingApp.id,
          ownerName: pendingApp.fullName,
          submissionDate: pendingApp.submissionDate,
          message: language === 'en'
            ? `Application Docket Found. Status: ${pendingApp.status}. Payment: ${pendingApp.paymentStatus}. Your file is currently queued for administrative review in the national system.`
            : `Đã tìm thấy hồ sơ đăng ký. Trạng thái: ${pendingApp.status}. Thanh toán: ${pendingApp.paymentStatus}. Hồ sơ của bạn hiện đang chờ xem xét hành chính trong hệ thống quốc gia.`
        });
        return;
      }

      // 3. No record found - Show Invalid/Error
      setResult({
        status: 'invalid',
        documentId: 'NOT_FOUND',
        message: language === 'en'
          ? "The provided Passport Number and/or Document Type does not match any active records in our secure database. Please ensure the information entered is correct or contact your sponsoring entity."
          : "Số hộ chiếu và/hoặc Loại tài liệu được cung cấp không khớp với bất kỳ bản ghi nào trong cơ sở dữ liệu bảo mật của chúng tôi. Vui lòng đảm bảo thông tin đã nhập là chính xác hoặc liên hệ với đơn vị bảo lãnh của bạn."
      });

    } catch (err) {
      console.error("Verification error:", err);
      setResult({
        status: 'invalid',
        documentId: 'ERROR',
        message: language === 'en' ? "A system error occurred during verification. Please try again later." : "Đã xảy ra lỗi hệ thống trong quá trình xác minh. Vui lòng thử lại sau."
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const getStatusInfo = (status: string) => {
    const s = status.toLowerCase();
    if (['valid', 'success', 'approved', 'verified'].includes(s)) {
      return { 
        color: 'emerald', 
        icon: ShieldCheck, 
        label: language === 'en' ? 'Authentic' : 'Hợp lệ' 
      };
    }
    if (['invalid', 'rejected', 'expired', 'revoked'].includes(s)) {
      return { 
        color: 'red', 
        icon: AlertCircle, 
        label: language === 'en' ? 'Invalid / Not Found' : 'Không hợp lệ / Không tìm thấy' 
      };
    }
    return { 
      color: 'amber', 
      icon: History, 
      label: language === 'en' ? 'Processing' : 'Đang xử lý' 
    };
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
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
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 focus:border-red-600 focus:bg-white outline-none transition-all text-slate-900 font-bold bg-slate-50 placeholder-slate-300"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  {t.emailLabel[language]}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="verified@mail.gov.vn"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 focus:border-red-600 focus:bg-white outline-none transition-all text-slate-900 font-bold bg-slate-50 placeholder-slate-300"
                />
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={loading}
                className="vn-bg-red hover:bg-red-700 text-white px-12 py-5 rounded-full font-black uppercase tracking-widest shadow-xl transition-all flex items-center gap-3 disabled:opacity-50 active:scale-95 group"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                {loading ? t.verifying[language] : t.verifyBtn[language]}
              </button>
            </div>
          </form>

          {result && (
            <div 
              ref={resultRef}
              className={`mt-12 p-8 md:p-10 rounded-[2rem] border-2 animate-in fade-in slide-in-from-bottom-8 duration-700 ${
                getStatusInfo(result.status).color === 'emerald' ? 'bg-emerald-50 border-emerald-100' : 
                getStatusInfo(result.status).color === 'red' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
              }`}
            >
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className={`p-5 rounded-2xl shadow-sm ${
                  getStatusInfo(result.status).color === 'emerald' ? 'bg-emerald-500 text-white' : 
                  getStatusInfo(result.status).color === 'red' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {result.status === 'invalid' ? <SearchX className="w-10 h-10" /> : React.createElement(getStatusInfo(result.status).icon, { className: "w-10 h-10" })}
                </div>
                
                <div className="flex-1 space-y-6">
                  <div className="space-y-1">
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                      getStatusInfo(result.status).color === 'emerald' ? 'text-emerald-600' : 
                      getStatusInfo(result.status).color === 'red' ? 'text-red-600' : 'text-amber-600'
                    }`}>National Registry Inquiry</p>
                    <h3 className={`text-4xl font-black uppercase tracking-tighter ${
                      getStatusInfo(result.status).color === 'emerald' ? 'text-emerald-900' : 
                      getStatusInfo(result.status).color === 'red' ? 'text-red-900' : 'text-amber-900'
                    }`}>
                      {getStatusInfo(result.status).label}
                    </h3>
                  </div>

                  {result.documentId !== 'NOT_FOUND' && result.documentId !== 'ERROR' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm bg-white/40 p-6 rounded-2xl border border-white/60">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry ID</p>
                        <p className="font-mono font-bold text-slate-900">{result.documentId}</p>
                      </div>
                      {result.ownerName && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                          <p className="font-black text-slate-900 uppercase">{result.ownerName}</p>
                        </div>
                      )}
                      {(result.issueDate || result.submissionDate) && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {result.issueDate ? 'Issue Date' : 'Submission Date'}
                          </p>
                          <p className="font-bold text-slate-900">{result.issueDate || result.submissionDate}</p>
                        </div>
                      )}
                      {result.expiryDate && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry Date</p>
                          <p className="font-bold text-red-600">{result.expiryDate}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-5 bg-white rounded-2xl border border-slate-100 text-slate-600 italic text-sm leading-relaxed shadow-sm">
                    {result.message}
                  </div>
                  
                  {getStatusInfo(result.status).color === 'emerald' && (
                    <button className="flex items-center gap-3 text-xs font-black uppercase text-red-600 hover:gap-5 transition-all group">
                      Download Digital Authentication (PDF) <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationForm;