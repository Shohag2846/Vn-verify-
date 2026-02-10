
import React from 'react';
import { translations } from '../i18n';
import { Language } from '../types';

interface Props {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Header: React.FC<Props> = ({ language, setLanguage }) => {
  const t = translations;

  return (
    <header className="bg-white px-6 md:px-12 py-3 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between">
      <div className="flex items-center gap-4">
        {/* National Emblem */}
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Vietnam.svg/200px-Emblem_of_Vietnam.svg.png" 
          alt="Vietnam National Emblem" 
          className="w-16 h-16 md:w-20 md:h-20"
        />
        
        {/* Branding Lines - No empty space above */}
        <div className="flex flex-col justify-start leading-tight">
          <div className="text-[10px] md:text-sm text-gray-700 font-medium uppercase tracking-tight">
            {t.republic[language]}
          </div>
          <div className="text-xl md:text-2xl font-black text-red-600 py-0 my-0">
            {t.domain[language]}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500 font-light italic">
            {t.subHeader[language]}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 md:mt-0">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition ${language === 'en' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            EN
          </button>
          <button 
            onClick={() => setLanguage('vi')}
            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition ${language === 'vi' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            VN
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
