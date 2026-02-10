
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck, FileText, Globe } from 'lucide-react';
import { Language } from '../types';

interface Props {
  language: Language;
}

const Home: React.FC<Props> = ({ language }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const steps = [
    {
      image: 'https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&q=80&w=1200',
      title: { en: 'Working Legally in Vietnam', vi: 'Làm việc hợp pháp tại Việt Nam' },
      desc: { 
        en: 'Guidelines for foreign experts and workers entering the national labor market.', 
        vi: 'Hướng dẫn cho chuyên gia và người lao động nước ngoài khi gia nhập thị trường lao động quốc gia.' 
      }
    },
    {
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=1200',
      title: { en: 'Work Permit Process', vi: 'Quy trình Giấy phép lao động' },
      desc: { 
        en: 'Detailed requirements and documentation needed under Decree 152/2020/ND-CP.', 
        vi: 'Các yêu cầu và tài liệu chi tiết cần thiết theo Nghị định 152/2020/NĐ-CP.' 
      }
    },
    {
      image: 'https://images.unsplash.com/photo-1508913922359-8359cc045544?auto=format&fit=crop&q=80&w=1200',
      title: { en: 'Visa and Entry Procedures', vi: 'Thủ tục Thị thực và Nhập cảnh' },
      desc: { 
        en: 'Navigating through official visa types (DN, LD, DT) for various stay purposes.', 
        vi: 'Tìm hiểu các loại thị thực chính thức (DN, LD, DT) cho các mục đích lưu trú khác nhau.' 
      }
    },
    {
      image: 'https://images.unsplash.com/photo-1509030450996-93f2eef78060?auto=format&fit=crop&q=80&w=1200',
      title: { en: 'Temporary Residence Card (TRC)', vi: 'Thẻ tạm trú (TRC)' },
      desc: { 
        en: 'Long-term residency authentication for foreign investors and employees.', 
        vi: 'Xác thực cư trú dài hạn cho các nhà đầu tư và người lao động nước ngoài.' 
      }
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % steps.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [steps.length]);

  const next = () => setActiveSlide((prev) => (prev + 1) % steps.length);
  const prev = () => setActiveSlide((prev) => (prev - 1 + steps.length) % steps.length);

  return (
    <div className="bg-white min-h-screen animate-in fade-in duration-700">
      {/* Step-by-Step Scrolling Section */}
      <section className="relative h-[450px] md:h-[550px] overflow-hidden group">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-all duration-1000 transform ${
              idx === activeSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'
            }`}
          >
            <img 
              src={step.image} 
              alt={step.title[language]} 
              className="absolute inset-0 w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 via-black/40 to-transparent" />
            <div className="relative z-20 h-full flex flex-col justify-end p-8 md:p-20 max-w-6xl mx-auto">
              <div className="mb-4 inline-flex items-center gap-2 bg-yellow-400 text-red-900 px-3 py-1 rounded text-xs font-black uppercase tracking-widest shadow-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Step {idx + 1}
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight drop-shadow-md">
                {step.title[language]}
              </h2>
              <p className="text-xl md:text-2xl text-gray-100 max-w-2xl font-light leading-relaxed drop-shadow-sm italic">
                {step.desc[language]}
              </p>
            </div>
          </div>
        ))}
        
        {/* Navigation Controls */}
        <button 
          onClick={prev}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 hover:bg-white/30 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button 
          onClick={next}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 hover:bg-white/30 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`w-12 h-1.5 rounded-full transition-all duration-300 ${
                idx === activeSlide ? 'bg-yellow-400 scale-x-110 shadow-lg' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Information Access Section */}
      <div className="max-w-screen-xl mx-auto px-6 py-16">
        <div className="text-center mb-16 space-y-4">
          <h3 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter">
            {language === 'en' ? 'National Information Access' : 'Truy cập thông tin quốc gia'}
          </h3>
          <div className="w-24 h-1.5 bg-red-600 mx-auto rounded-full" />
          <p className="text-gray-500 max-w-3xl mx-auto italic">
            {language === 'en' 
              ? 'Providing transparent and authoritative guidance for all international administrative processes.' 
              : 'Cung cấp hướng dẫn minh bạch và có thẩm quyền cho tất cả các quy trình hành chính quốc tế.'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="group bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors">
              <ShieldCheck className="w-8 h-8 text-red-600 group-hover:text-white" />
            </div>
            <h4 className="text-xl font-bold mb-4 text-gray-900">{language === 'en' ? 'Legal Compliance' : 'Tuân thủ pháp luật'}</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {language === 'en' 
                ? 'All foreign residents must adhere to the laws of the Socialist Republic of Vietnam for stable residency.' 
                : 'Mọi cư dân nước ngoài phải tuân thủ luật pháp nước CHXHCN Việt Nam để có cư trú ổn định.'}
            </p>
          </div>

          <div className="group bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors">
              <FileText className="w-8 h-8 text-red-600 group-hover:text-white" />
            </div>
            <h4 className="text-xl font-bold mb-4 text-gray-900">{language === 'en' ? 'Administrative Reform' : 'Cải cách hành chính'}</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {language === 'en' 
                ? 'Simplifying procedures through digital platforms to ensure fast and transparent government services.' 
                : 'Đơn giản hóa thủ tục thông qua các nền tảng số để đảm bảo dịch vụ công nhanh chóng và minh bạch.'}
            </p>
          </div>

          <div className="group bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors">
              <Globe className="w-8 h-8 text-red-600 group-hover:text-white" />
            </div>
            <h4 className="text-xl font-bold mb-4 text-gray-900">{language === 'en' ? 'Global Integration' : 'Hội nhập toàn cầu'}</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {language === 'en' 
                ? 'Vietnam actively integrates into the world economy, welcoming experts and investors from across the globe.' 
                : 'Việt Nam chủ động hội nhập kinh tế thế giới, chào đón các chuyên gia và nhà đầu tư từ khắp nơi trên toàn cầu.'}
            </p>
          </div>
        </div>

        {/* Note: No forms or apply buttons here as per restrictions */}
        <div className="mt-20 p-8 md:p-12 bg-gray-900 rounded-3xl text-center space-y-6 overflow-hidden relative">
          <div className="relative z-10">
            <h4 className="text-2xl font-bold text-white mb-2">{language === 'en' ? 'Administrative Notice' : 'Thông báo hành chính'}</h4>
            <p className="text-gray-400 max-w-2xl mx-auto italic text-sm">
              {language === 'en' 
                ? 'Please navigate to the specific service pages (Work Permit, Visa, TRC) for application tracking and verification.' 
                : 'Vui lòng chuyển hướng đến các trang dịch vụ cụ thể (Giấy phép lao động, Thị thực, TRC) để theo dõi và xác minh hồ sơ.'}
            </p>
          </div>
          {/* Subtle decoration */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-600/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
};

export default Home;
