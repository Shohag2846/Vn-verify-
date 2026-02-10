
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n';
import { Calendar, ChevronRight, Filter, ArrowLeft, ShieldAlert } from 'lucide-react';

interface Props {
  language: Language;
}

type NewsCategory = 'GOV' | 'IMMIGRATION' | 'LABOR' | 'EXPAT' | 'SAFETY';

interface NewsItem {
  id: number;
  category: NewsCategory;
  date: string;
  title: { en: string; vi: string };
  desc: { en: string; vi: string };
  content: { en: string; vi: string };
}

const NEWS_DATA: NewsItem[] = [
  {
    id: 1,
    category: 'LABOR',
    date: '2024-05-15',
    title: { 
      en: 'Updated Regulations on Work Permits for Foreigners', 
      vi: 'Cập nhật quy định về Giấy phép lao động cho người nước ngoài' 
    },
    desc: { 
      en: 'The Ministry of Labor introduces new procedural simplifications for foreign experts applying for work permits under Decree 152.', 
      vi: 'Bộ Lao động giới thiệu các đơn giản hóa thủ tục mới cho chuyên gia nước ngoài khi xin cấp giấy phép lao động theo Nghị định 152.' 
    },
    content: {
      en: 'Following the latest administrative reforms, the Vietnamese government has announced several key changes to the Work Permit application process. Foreign experts and technicians will now benefit from reduced documentation requirements and faster processing times. The new guidelines emphasize the digitalization of records to ensure transparency and efficiency. Employers are advised to review the updated checklists available on the official labor portal.',
      vi: 'Theo những cải cách hành chính mới nhất, chính phủ Việt Nam đã công bố một số thay đổi quan trọng đối với quy trình cấp Giấy phép lao động. Các chuyên gia và kỹ thuật viên nước ngoài hiện sẽ được hưởng lợi từ việc giảm bớt các yêu cầu về tài liệu và thời gian xử lý nhanh hơn. Các hướng dẫn mới nhấn mạnh vào việc số hóa hồ sơ để đảm bảo tính minh bạch và hiệu quả. Người sử dụng lao động nên xem lại các danh mục cập nhật có sẵn trên cổng thông tin lao động chính thức.'
    }
  },
  {
    id: 2,
    category: 'IMMIGRATION',
    date: '2024-05-10',
    title: { 
      en: 'Extension of E-Visa Validity and Stay Duration', 
      vi: 'Mở rộng thời hạn hiệu lực và thời gian lưu trú của E-Visa' 
    },
    desc: { 
      en: 'Vietnam officially extends the e-visa duration to 90 days for all nationalities to support tourism and international business.', 
      vi: 'Việt Nam chính thức kéo dài thời hạn e-visa lên 90 ngày cho tất cả quốc tịch nhằm hỗ trợ du lịch và kinh doanh quốc tế.' 
    },
    content: {
      en: 'In a significant move to boost international integration, the National Assembly has approved the extension of e-visa validity from 30 to 90 days. This policy allows for multiple entries, providing greater flexibility for tourists and international investors. The immigration department has upgraded its online portal to accommodate the new processing requirements. This change is expected to significantly enhance Vietnam\'s attractiveness as a global destination.',
      vi: 'Trong một động thái quan trọng nhằm thúc đẩy hội nhập quốc tế, Quốc hội đã phê duyệt việc gia hạn thời hạn e-visa từ 30 lên 90 ngày. Chính sách này cho phép nhập cảnh nhiều lần, mang lại sự linh hoạt hơn cho khách du lịch và các nhà đầu tư quốc tế. Cục quản lý xuất nhập cảnh đã nâng cấp cổng thông tin trực tuyến để đáp ứng các yêu cầu xử lý mới. Thay đổi này được kỳ vọng sẽ nâng cao đáng kể sức hấp dẫn của Việt Nam như một điểm đến toàn cầu.'
    }
  },
  {
    id: 3,
    category: 'GOV',
    date: '2024-05-01',
    title: { 
      en: 'National Digital Transformation Day Announced', 
      vi: 'Công bố Ngày Chuyển đổi số Quốc gia' 
    },
    desc: { 
      en: 'Government focuses on improving electronic administrative services for all residents including foreign nationals.', 
      vi: 'Chính phủ tập trung cải thiện các dịch vụ hành chính điện tử cho tất cả cư dân bao gồm cả công dân nước ngoài.' 
    },
    content: {
      en: 'The Prime Minister has issued a directive to accelerate the national digital transformation program. Key priorities include the integration of public services into a unified national portal and the implementation of electronic identification for all residents. This initiative aims to reduce bureaucracy, combat corruption, and create a more business-friendly environment. Foreign residents are encouraged to utilize the new digital platforms for residency and work-related administrative tasks.',
      vi: 'Thủ tướng đã ban hành chỉ thị đẩy nhanh chương trình chuyển đổi số quốc gia. Các ưu tiên chính bao gồm việc tích hợp các dịch vụ công vào một cổng thông tin quốc gia thống nhất và triển khai định danh điện tử cho tất cả cư dân. Sáng kiến này nhằm giảm bớt thủ tục hành chính, chống tham nhũng và tạo môi trường kinh doanh thuận lợi hơn. Cư dân nước ngoài được khuyến khích sử dụng các nền tảng số mới cho các nhiệm vụ hành chính liên quan đến cư trú và công việc.'
    }
  },
  {
    id: 4,
    category: 'SAFETY',
    date: '2024-04-25',
    title: { 
      en: 'Public Safety Notice: Electronic Identification Security', 
      vi: 'Thông báo An toàn Công cộng: Bảo mật Định danh Điện tử' 
    },
    desc: { 
      en: 'Official warning regarding phishing attempts targeting the national resident database and digital portals.', 
      vi: 'Cảnh báo chính thức về các nỗ lực lừa đảo nhằm vào cơ sở dữ liệu dân cư quốc gia và các cổng thông tin số.' 
    },
    content: {
      en: 'Authorities have detected an increase in fraudulent activities targeting users of government digital portals. Scammers are using sophisticated phishing emails and messages to steal personal data and login credentials. The Ministry of Public Security reminds all residents that government officials will never ask for passwords or private keys over the phone or email. Please ensure you only access services through the official Vietnam.gov.vn domain and report any suspicious activities immediately.',
      vi: 'Cơ quan chức năng đã phát hiện sự gia tăng các hoạt động gian lận nhằm vào người dùng các cổng thông tin điện tử của chính phủ. Những kẻ lừa đảo đang sử dụng các email và tin nhắn lừa đảo tinh vi để đánh cắp dữ liệu cá nhân và thông tin đăng nhập. Bộ Công an nhắc nhở tất cả cư dân rằng cán bộ chính phủ sẽ không bao giờ hỏi mật khẩu hoặc khóa riêng qua điện thoại hoặc email. Vui lòng đảm bảo bạn chỉ truy cập các dịch vụ thông qua tên miền chính thức Vietnam.gov.vn và báo cáo ngay lập tức mọi hoạt động nghi vấn.'
    }
  },
  {
    id: 5,
    category: 'EXPAT',
    date: '2024-04-20',
    title: { 
      en: 'Annual Expat Labor Forum Held in Hanoi', 
      vi: 'Diễn đàn Lao động Nước ngoài Thường niên được tổ chức tại Hà Nội' 
    },
    desc: { 
      en: 'Discussion on improving the living and working conditions for the international workforce in Vietnam.', 
      vi: 'Thảo luận về việc cải thiện điều kiện sống và làm việc cho lực lượng lao động quốc tế tại Việt Nam.' 
    },
    content: {
      en: 'Representatives from major foreign chambers of commerce and government ministries gathered in Hanoi for the annual Labor Forum. The event focused on addressing the challenges faced by expats, including visa hurdles, health insurance coverage, and professional integration. Government officials reiterated their commitment to providing a stable and welcoming environment for international talent. Feedback from the forum will be used to draft further administrative improvements in the coming months.',
      vi: 'Đại diện từ các hiệp hội doanh nghiệp nước ngoài lớn và các bộ ngành đã tập hợp tại Hà Nội cho Diễn đàn Lao động thường niên. Sự kiện tập trung vào việc giải quyết các thách thức mà người nước ngoài phải đối mặt, bao gồm các rào cản về thị thực, phạm vi bảo hiểm y tế và hội nhập chuyên nghiệp. Các quan chức chính phủ nhắc lại cam kết cung cấp một môi trường ổn định và hiếu khách cho tài năng quốc tế. Phản hồi từ diễn đàn sẽ được sử dụng để soạn thảo các cải thiện hành chính tiếp theo trong những tháng tới.'
    }
  }
];

const News: React.FC<Props> = ({ language }) => {
  const t = translations;
  const [filter, setFilter] = useState<NewsCategory | 'ALL'>('ALL');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const filteredNews = filter === 'ALL' 
    ? NEWS_DATA 
    : NEWS_DATA.filter(item => item.category === filter);

  const getCategoryLabel = (cat: NewsCategory) => {
    switch(cat) {
      case 'GOV': return t.newsGov[language];
      case 'IMMIGRATION': return t.newsImmigration[language];
      case 'LABOR': return t.newsLabor[language];
      case 'EXPAT': return t.newsExpats[language];
      case 'SAFETY': return t.newsSafety[language];
      default: return '';
    }
  };

  const categories: { key: NewsCategory | 'ALL'; label: string }[] = [
    { key: 'ALL', label: t.newsAll[language] },
    { key: 'GOV', label: t.newsGov[language] },
    { key: 'IMMIGRATION', label: t.newsImmigration[language] },
    { key: 'LABOR', label: t.newsLabor[language] },
    { key: 'EXPAT', label: t.newsExpats[language] },
    { key: 'SAFETY', label: t.newsSafety[language] },
  ];

  if (selectedNews) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-500">
        <button 
          onClick={() => setSelectedNews(null)}
          className="flex items-center gap-2 text-red-600 font-bold hover:text-red-700 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          {t.newsBack[language]}
        </button>

        <article className="space-y-6">
          <div className="space-y-2">
            <span className="inline-block bg-red-50 text-red-600 text-[10px] font-black px-3 py-1 rounded uppercase tracking-widest border border-red-100">
              {getCategoryLabel(selectedNews.category)}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
              {selectedNews.title[language]}
            </h1>
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
              <Calendar className="w-4 h-4" />
              {selectedNews.date}
            </div>
          </div>

          <div className="w-full h-[1px] bg-gray-200" />

          <div className="text-gray-800 text-lg leading-relaxed space-y-4">
            {selectedNews.content[language].split('\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </article>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-gray-400 shrink-0 mt-1" />
          <p className="text-xs text-gray-500 italic leading-relaxed">
            {t.newsDisclaimer[language]}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12 space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 uppercase tracking-tighter">
          {t.newsTitle[language]}
        </h1>
        <div className="w-32 h-2 vn-bg-red mx-auto rounded-full" />
        <p className="text-xl text-red-700 font-bold uppercase tracking-widest opacity-80 max-w-2xl mx-auto">
          {t.newsSubtitle[language]}
        </p>
      </section>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 justify-center bg-gray-50 p-4 rounded-3xl border border-gray-100 shadow-sm">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setFilter(cat.key)}
            className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              filter === cat.key 
                ? 'vn-bg-red text-white shadow-md scale-105' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* News List */}
      <div className="grid gap-8">
        {filteredNews.map((item) => (
          <div 
            key={item.id} 
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all p-8 flex flex-col md:flex-row gap-8 items-start"
          >
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1 rounded uppercase tracking-widest border border-red-100">
                  {getCategoryLabel(item.category)}
                </span>
                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                  {item.date}
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 group-hover:text-red-600 transition-colors">
                {item.title[language]}
              </h3>
              <p className="text-gray-600 leading-relaxed italic text-sm md:text-base">
                {item.desc[language]}
              </p>
              <button 
                onClick={() => setSelectedNews(item)}
                className="inline-flex items-center gap-2 text-red-600 font-black uppercase text-xs tracking-[0.2em] group-hover:gap-4 transition-all"
              >
                {t.newsReadMore[language]}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Disclaimer */}
      <div className="pt-12 border-t border-gray-100 flex flex-col items-center text-center space-y-6">
        <div className="bg-red-50 p-6 rounded-3xl border border-red-100 max-w-2xl">
          <p className="text-xs text-red-900 italic font-medium">
            {t.newsDisclaimer[language]}
          </p>
        </div>
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Vietnam.svg/200px-Emblem_of_Vietnam.svg.png" 
          alt="Vietnam Emblem" 
          className="w-16 h-16 opacity-30"
        />
      </div>
    </div>
  );
};

export default News;
