
import React from 'react';
import { DocType, Language } from '../types';
import VerificationForm from '../components/VerificationForm';
import { translations } from '../i18n';
import { ArrowRight } from 'lucide-react';

interface Props {
  language: Language;
  type: DocType;
}

const VerificationPage: React.FC<Props> = ({ language, type }) => {
  const getTitle = () => {
    switch (type) {
      case DocType.WORK_PERMIT: return translations.workPermit[language];
      case DocType.VISA: return translations.visa[language];
      case DocType.TRC: return translations.trc[language];
    }
  };

  const steps = [
    { 
      en: 'Enter your Passport Number and registered Email address.', 
      vi: 'Nhập số Hộ chiếu và địa chỉ Email đã đăng ký.' 
    },
    { 
      en: 'Review the provided information and click "Check / Verify".', 
      vi: 'Kiểm tra lại thông tin và nhấn "Kiểm tra / Xác minh".' 
    },
    { 
      en: 'The system will process your request and display the result below.', 
      vi: 'Hệ thống sẽ xử lý yêu cầu và hiển thị kết quả bên dưới.' 
    }
  ];

  return (
    <div className="py-12 px-6 max-w-screen-xl mx-auto space-y-12 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-gray-900 uppercase border-b-4 border-red-600 inline-block pb-2">
          {getTitle()} Verification
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          {language === 'en' 
            ? 'Use this secure portal to verify the authenticity of your documents issued by Vietnamese authorities.' 
            : 'Sử dụng cổng thông tin bảo mật này để xác minh tính xác thực của các giấy tờ do cơ quan có thẩm quyền Việt Nam cấp.'}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm">!</span>
            {language === 'en' ? 'How it works' : 'Hướng dẫn'}
          </h2>
          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-red-600 font-bold">{idx + 1}.</span>
                <p className="text-gray-700 text-sm leading-relaxed">{step[language]}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <VerificationForm language={language} type={type} />
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
