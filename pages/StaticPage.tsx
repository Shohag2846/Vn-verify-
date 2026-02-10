
import React from 'react';
import { Language } from '../types';

interface Props {
  language: Language;
  title: string;
}

const StaticPage: React.FC<Props> = ({ language, title }) => {
  return (
    <div className="py-20 px-6 text-center space-y-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-800 uppercase tracking-wide">{title}</h1>
      <div className="h-1 w-32 bg-red-600 mx-auto" />
      <div className="p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <p className="text-gray-500 text-xl italic">
          {language === 'en' 
            ? `Content for ${title} is being updated...` 
            : `Nội dung của ${title} đang được cập nhật...`}
        </p>
        <img 
          src="https://picsum.photos/seed/placeholder/600/300" 
          alt="under construction" 
          className="mt-8 rounded-lg mx-auto opacity-50 grayscale"
        />
      </div>
    </div>
  );
};

export default StaticPage;
