
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n';
import { 
  FileText, Download, Link as LinkIcon, ExternalLink, 
  Search, Info, BookOpen, ShieldCheck, ClipboardList, 
  FileSearch, Globe, ChevronRight 
} from 'lucide-react';

interface Props {
  language: Language;
}

type ResourceCategory = 'IMMIGRATION' | 'LABOR' | 'VISA_TRC' | 'FORMS' | 'LINKS';
type ResourceType = 'PDF' | 'LINK' | 'GUIDE';

interface ResourceItem {
  id: number;
  category: ResourceCategory;
  type: ResourceType;
  title: { en: string; vi: string };
  desc: { en: string; vi: string };
  url: string;
  size?: string;
  date: string;
}

const RESOURCES_DATA: ResourceItem[] = [
  {
    id: 1,
    category: 'IMMIGRATION',
    type: 'GUIDE',
    title: { en: 'Immigration Compliance Guide 2024', vi: 'Hướng dẫn tuân thủ Nhập cảnh 2024' },
    desc: { en: 'Essential legal requirements for all foreign nationals residing in the Socialist Republic of Vietnam.', vi: 'Các yêu cầu pháp lý thiết yếu cho tất cả công dân nước ngoài cư trú tại nước CHXHCN Việt Nam.' },
    url: '#',
    date: '2024-03-12'
  },
  {
    id: 2,
    category: 'LABOR',
    type: 'PDF',
    title: { en: 'Vietnam Labor Code 2019 (English Version)', vi: 'Bộ luật Lao động Việt Nam 2019 (Bản tiếng Anh)' },
    desc: { en: 'The full text of the primary law governing employment and labor rights in Vietnam.', vi: 'Toàn văn luật cơ bản điều chỉnh các quyền về việc làm và lao động tại Việt Nam.' },
    url: '#',
    size: '2.4 MB',
    date: '2019-11-20'
  },
  {
    id: 3,
    category: 'LABOR',
    type: 'GUIDE',
    title: { en: 'Decree 152/2020/ND-CP Explanatory Guide', vi: 'Hướng dẫn giải thích Nghị định 152/2020/NĐ-CP' },
    desc: { en: 'A step-by-step breakdown of the regulations for foreign workers in Vietnam.', vi: 'Bản phân tích từng bước các quy định đối với lao động nước ngoài tại Việt Nam.' },
    url: '#',
    date: '2021-02-15'
  },
  {
    id: 4,
    category: 'VISA_TRC',
    type: 'PDF',
    title: { en: 'TRC Application Checklist', vi: 'Danh mục hồ sơ xin cấp Thẻ tạm trú (TRC)' },
    desc: { en: 'A comprehensive list of documents required for Temporary Residence Card application.', vi: 'Danh sách toàn diện các giấy tờ cần thiết để xin cấp Thẻ tạm trú.' },
    url: '#',
    size: '850 KB',
    date: '2024-01-10'
  },
  {
    id: 5,
    category: 'FORMS',
    type: 'PDF',
    title: { en: 'Form NA1 - Visa Application', vi: 'Mẫu NA1 - Tờ khai đề nghị cấp thị thực' },
    desc: { en: 'Official form for foreign nationals applying for entry visas to Vietnam.', vi: 'Mẫu đơn chính thức dành cho người nước ngoài xin cấp thị thực nhập cảnh Việt Nam.' },
    url: '#',
    size: '1.2 MB',
    date: '2023-08-05'
  },
  {
    id: 6,
    category: 'FORMS',
    type: 'PDF',
    title: { en: 'Form NA5 - Visa Extension', vi: 'Mẫu NA5 - Đề nghị gia hạn tạm trú' },
    desc: { en: 'Form used for extending current visa or stay duration for foreign residents.', vi: 'Mẫu đơn dùng để gia hạn thị thực hoặc thời gian lưu trú cho cư dân nước ngoài.' },
    url: '#',
    size: '1.1 MB',
    date: '2023-08-05'
  },
  {
    id: 7,
    category: 'LINKS',
    type: 'LINK',
    title: { en: 'National Public Service Portal', vi: 'Cổng Dịch vụ công Quốc gia' },
    desc: { en: 'Official online gateway for all Vietnamese government public services.', vi: 'Cổng thông tin trực tuyến chính thức cho tất cả các dịch vụ công của chính phủ Việt Nam.' },
    url: 'https://dichvucong.gov.vn',
    date: 'Live'
  },
  {
    id: 8,
    category: 'LINKS',
    type: 'LINK',
    title: { en: 'Department of Immigration Official Site', vi: 'Trang web chính thức của Cục Quản lý Xuất nhập cảnh' },
    desc: { en: 'Source for the latest official immigration notices and e-visa portal.', vi: 'Nguồn cung cấp các thông báo xuất nhập cảnh chính thức mới nhất và cổng e-visa.' },
    url: 'https://xuatnhapcanh.gov.vn',
    date: 'Live'
  }
];

const Resources: React.FC<Props> = ({ language }) => {
  const t = translations;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ResourceCategory | 'ALL'>('ALL');

  const categories: { key: ResourceCategory | 'ALL'; label: string; icon: any }[] = [
    { key: 'ALL', label: t.resAll[language], icon: Globe },
    { key: 'IMMIGRATION', label: t.resImmigrationCat[language], icon: ShieldCheck },
    { key: 'LABOR', label: t.resLaborCat[language], icon: ClipboardList },
    { key: 'VISA_TRC', label: t.resVisaTrcCat[language], icon: FileSearch },
    { key: 'FORMS', label: t.resFormsCat[language], icon: FileText },
    { key: 'LINKS', label: t.resLinksCat[language], icon: LinkIcon },
  ];

  const filteredResources = RESOURCES_DATA.filter(item => {
    const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesSearch = item.title[language].toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.desc[language].toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTypeLabel = (type: ResourceType) => {
    switch (type) {
      case 'PDF': return t.resTypePdf[language];
      case 'LINK': return t.resTypeLink[language];
      case 'GUIDE': return t.resTypeGuide[language];
    }
  };

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'PDF': return <FileText className="w-5 h-5" />;
      case 'LINK': return <ExternalLink className="w-5 h-5" />;
      case 'GUIDE': return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12 space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 uppercase tracking-tighter">
          {t.resTitle[language]}
        </h1>
        <div className="w-32 h-2 vn-bg-red mx-auto rounded-full" />
        <p className="text-xl text-red-700 font-bold uppercase tracking-widest opacity-80 max-w-3xl mx-auto italic">
          {t.resSubtitle[language]}
        </p>
      </section>

      {/* Search & Filter Bar */}
      <div className="space-y-6">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.resSearchPlaceholder[language]}
            className="w-full pl-12 pr-6 py-4 rounded-full border-2 border-red-50 focus:border-red-600 outline-none transition-all shadow-lg text-gray-800 font-medium placeholder-gray-400"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-red-600" />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategory === cat.key 
                  ? 'vn-bg-red text-white shadow-xl scale-105' 
                  : 'bg-white text-gray-600 border border-gray-100 hover:bg-red-50'
              }`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredResources.length > 0 ? (
          filteredResources.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all p-8 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-widest">
                    {getTypeIcon(item.type)}
                    {getTypeLabel(item.type)}
                  </div>
                  {item.size && (
                    <span className="text-[10px] font-black text-gray-400 uppercase">{item.size}</span>
                  )}
                </div>
                <h3 className="text-xl font-black text-gray-900 group-hover:text-red-600 transition-colors">
                  {item.title[language]}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed italic">
                  {item.desc[language]}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  {t.resUpdated[language]}: {item.date}
                </div>
                {item.type === 'LINK' ? (
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 vn-bg-red text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:shadow-xl transition-all active:scale-95"
                  >
                    {t.resOpenLink[language]}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button className="flex items-center gap-2 vn-bg-red text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:shadow-xl transition-all active:scale-95">
                    {item.type === 'PDF' ? t.resDownload[language] : t.resView[language]}
                    {item.type === 'PDF' ? <Download className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
            <Info className="w-16 h-16 text-gray-200 mx-auto" />
            <p className="text-gray-400 text-xl font-medium italic">
              {language === 'en' ? 'No resources found matching your search criteria.' : 'Không tìm thấy tài nguyên nào phù hợp với tiêu chí tìm kiếm.'}
            </p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="pt-12 border-t border-gray-100 flex flex-col items-center text-center space-y-8">
        <div className="bg-red-50 p-8 rounded-3xl border border-red-100 max-w-3xl">
          <div className="flex items-center justify-center gap-3 mb-2 text-red-600">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-black text-xs uppercase tracking-widest">Official Policy Notice</span>
          </div>
          <p className="text-xs text-red-900 italic font-medium leading-relaxed">
            {t.resDisclaimer[language]}
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-4 opacity-40">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Vietnam.svg/200px-Emblem_of_Vietnam.svg.png" 
            alt="Vietnam Emblem" 
            className="w-16 h-16"
          />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">
            Ministry of Information and Communications
          </p>
        </div>
      </div>
    </div>
  );
};

export default Resources;
