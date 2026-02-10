
import React, { useState, useEffect } from 'react';
import { Search, CloudSun, Clock } from 'lucide-react';
import { translations } from '../i18n';
import { Language } from '../types';

interface Props {
  language: Language;
}

const InfoBar: React.FC<Props> = ({ language }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'en' ? 'en-US' : 'vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="bg-red-50 border-b border-red-100 px-6 md:px-12 py-2 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-700">
      <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex items-center gap-2 text-red-700">
          <CloudSun className="w-4 h-4" />
          <span>Hanoi 28°C</span>
        </div>
        <div className="h-4 w-px bg-red-200 hidden md:block" />
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{formatDate(time)} | {formatTime(time)}</span>
        </div>
      </div>
      
      <div className="relative w-full md:w-80">
        <input 
          type="text" 
          placeholder={translations.searchPlaceholder[language]} 
          className="w-full pl-9 pr-4 py-1.5 rounded-full border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-700 bg-white shadow-sm transition-all"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-red-400" />
      </div>
    </div>
  );
};

export default InfoBar;
