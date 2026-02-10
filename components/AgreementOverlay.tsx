import React from 'react';
import { translations } from '../i18n';
import { Language } from '../types';

interface Props {
  language: Language;
  onAgree: () => void;
  onDecline: () => void;
}

const AgreementOverlay: React.FC<Props> = ({ language, onAgree, onDecline }) => {
  const t = translations;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="max-w-xl w-full mx-4 bg-white rounded-[2rem] shadow-2xl overflow-hidden border-t-[12px] border-red-600">
        <div className="p-12 text-center">
          <div className="mb-8 flex justify-center scale-125">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Vietnam.svg/200px-Emblem_of_Vietnam.svg.png" 
              alt="Vietnam Emblem" 
              className="w-24 h-24"
            />
          </div>
          <h1 className="text-3xl font-black mb-4 text-slate-900 uppercase tracking-tighter">
            {t.agreementTitle[language]}
          </h1>
          <p className="text-slate-600 mb-10 text-lg leading-relaxed font-medium italic">
            {t.agreementText[language]}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onAgree}
              className="px-12 py-4 vn-bg-red text-white font-black uppercase tracking-widest rounded-full hover:bg-red-700 transition shadow-2xl active:scale-95"
            >
              {t.agree[language]}
            </button>
            <button
              onClick={onDecline}
              className="px-12 py-4 bg-slate-100 text-slate-900 font-black uppercase tracking-widest rounded-full hover:bg-slate-200 transition active:scale-95"
            >
              {t.decline[language]}
            </button>
          </div>
          <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Ministry of Public Security</p>
        </div>
      </div>
    </div>
  );
};

export default AgreementOverlay;