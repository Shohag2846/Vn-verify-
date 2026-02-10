
import React from 'react';
import { translations } from '../i18n';
import { Language } from '../types';
import { Phone, Mail, MapPin, HelpCircle } from 'lucide-react';

interface Props {
  language: Language;
}

const Support: React.FC<Props> = ({ language }) => {
  const t = translations;

  const faqs = [
    {
      q: { en: 'What documents can I verify here?', vi: 'Tôi có thể xác minh những loại giấy tờ nào ở đây?' },
      a: { en: 'You can verify Work Permits, Visas, and Temporary Residence Cards (TRC).', vi: 'Bạn có thể xác minh Giấy phép lao động, Thị thực (Visa) và Thẻ tạm trú (TRC).' }
    },
    {
      q: { en: 'Is the verification result official?', vi: 'Kết quả xác minh có chính thức không?' },
      a: { en: 'Yes, this portal accesses the national database for document authentication.', vi: 'Có, cổng thông tin này truy cập vào cơ sở dữ liệu quốc gia để xác thực giấy tờ.' }
    },
    {
      q: { en: 'What if my record is not found?', vi: 'Tôi phải làm gì nếu không tìm thấy hồ sơ?' },
      a: { en: 'Please contact the local Immigration Office or Department of Labor where you applied.', vi: 'Vui lòng liên hệ với Cục Quản lý Xuất nhập cảnh hoặc Sở Lao động nơi bạn đã nộp hồ sơ.' }
    }
  ];

  return (
    <div className="py-12 px-6 max-w-screen-xl mx-auto space-y-16 animate-in fade-in duration-500">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t.support[language]}</h1>
        <div className="w-24 h-1 bg-red-600 mx-auto" />
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <section className="space-y-8">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <HelpCircle className="text-red-600" />
            {t.faq[language]}
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-l-4 border-red-600 pl-4 py-2">
                <h3 className="font-bold text-lg mb-2 text-gray-800">{faq.q[language]}</h3>
                <p className="text-gray-600">{faq.a[language]}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-800">{t.contactUs[language]}</h2>
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-full">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'en' ? 'Hotline' : 'Đường dây nóng'}</p>
                <p className="text-lg font-bold">1900 123 456</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-full">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg font-bold">contact@vietnam.gov.vn</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-full">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'en' ? 'Address' : 'Địa chỉ'}</p>
                <p className="text-lg font-bold">1 Hoang Hoa Tham, Hanoi, Vietnam</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Support;
