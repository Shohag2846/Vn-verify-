import React, { useState } from 'react';
import { translations } from '../i18n';
import { Language, DocType, VerificationResult } from '../types';
import { simulateVerification } from '../services/geminiService';
import { useAppConfig } from '../context/ConfigContext';
import { FileCheck, ShieldCheck, AlertCircle, Loader2, Download } from 'lucide-react';

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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passport) return;

    setLoading(true);
    setResult(null);

    // 1. Check official records database first
    const officialRecord = records.find(r => r.passportNumber === passport && r.type === type);
    if (officialRecord) {
      setTimeout(() => {
        setResult({
          status: officialRecord.status === 'Verified' ? 'valid' : 'expired',
          documentId: officialRecord.id,
          ownerName: officialRecord.fullName,
          issueDate: officialRecord.issueDate,
          expiryDate: officialRecord.expiryDate,
          message: `Official Authenticated Record: ${officialRecord.type} - Issue to ${officialRecord.fullName}. Employer: ${officialRecord.employer || 'N/A'}`
        });
        setLoading(false);
      }, 800);
      return;
    }

    // 2. Check pending applications
    const pendingApp = applications.find(a => a.passportNumber === passport && a.email === email && a.type === type);
    if (pendingApp) {
      setTimeout(() => {
        setResult({
          status: 'pending',
          documentId: pendingApp.id,
          ownerName: pendingApp.fullName,
          submissionDate: pendingApp.submissionDate,
          message: `Application is currently ${pendingApp.status}. Payment Status: ${pendingApp.paymentStatus}.`
        });
        setLoading(false);
      }, 800);
      return;
    }

    // 3. Fallback to Gemini Simulation for demo
    try {
      const data = await simulateVerification(type, passport, email);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-10">
          <form onSubmit={handleVerify} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  {t.passportLabel[language]} <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={passport}
                  onChange={(e) => setPassport(e.target.value)}
                  placeholder="e.g. B1234567"
                  required
                  className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition text-slate-900 font-bold bg-slate-50 placeholder-slate-400"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  {t.emailLabel[language]} <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="verify@mail.gov.vn"
                  required
                  className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition text-slate-900 font-bold bg-slate-50 placeholder-slate-400"
                />
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={loading}
                className="vn-bg-red hover:bg-red-700 text-white px-12 py-5 rounded-full font-black uppercase tracking-widest shadow-2xl transition flex items-center gap-3 disabled:opacity-50 active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileCheck className="w-5 h-5" />}
                {loading ? t.verifying[language] : t.verifyBtn[language]}
              </button>
            </div>
          </form>

          {result && (
            <div className={`mt-12 p-8 rounded-3xl border-2 animate-in fade-in slide-in-from-bottom-8 duration-700 ${
              result.status === 'valid' ? 'bg-emerald-50 border-emerald-100' : 
              result.status === 'invalid' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
            }`}>
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className={`p-4 rounded-2xl ${result.status === 'valid' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {result.status === 'valid' ? <ShieldCheck className="w-12 h-12" /> : <AlertCircle className="w-12 h-12" />}
                </div>
                <div className="flex-1 space-y-6">
                  <h3 className={`text-3xl font-black uppercase tracking-tighter ${
                    result.status === 'valid' ? 'text-emerald-900' : 'text-red-900'
                  }`}>
                    {result.status} Result
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Registry ID</p>
                      <p className="font-mono font-bold text-slate-900">{result.documentId}</p>
                    </div>
                    {result.ownerName && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                        <p className="font-black text-slate-900 uppercase">{result.ownerName}</p>
                      </div>
                    )}
                    {result.issueDate && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valid From</p>
                        <p className="font-bold text-slate-900">{result.issueDate}</p>
                      </div>
                    )}
                    {result.expiryDate && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valid Until</p>
                        <p className="font-bold text-red-600">{result.expiryDate}</p>
                      </div>
                    )}
                  </div>
                  <div className="p-5 bg-white/60 rounded-2xl border border-current/10 text-slate-700 italic text-sm leading-relaxed">
                    {result.message}
                  </div>
                  
                  {result.status === 'valid' && (
                    <button className="flex items-center gap-2 text-xs font-black uppercase text-red-600 hover:gap-4 transition-all">
                      Download Official Authentication (PDF) <Download className="w-4 h-4" />
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