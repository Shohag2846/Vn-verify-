
import React from 'react';
import { Language } from '../types';
import { Landmark, Users, ShieldCheck, Scale, Info, Layout } from 'lucide-react';
import { translations } from '../i18n';

interface Props {
  language: Language;
}

const Government: React.FC<Props> = ({ language }) => {
  const t = translations;

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12 space-y-16 animate-in fade-in duration-700">
      {/* Page Header */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tight">
          {t.government[language]}
        </h1>
        <div className="w-32 h-2 bg-red-600 mx-auto rounded-full" />
        <p className="text-xl text-gray-500 max-w-3xl mx-auto italic">
          {language === 'en' 
            ? 'The highest administrative body of the Socialist Republic of Vietnam, exercising executive power and ensuring national development.' 
            : 'Cơ quan hành chính nhà nước cao nhất của nước Cộng hòa xã hội chủ nghĩa Việt Nam, thực hiện quyền hành pháp và đảm bảo phát triển quốc gia.'}
        </p>
      </section>

      {/* Overview */}
      <section className="grid md:grid-cols-2 gap-12 items-center bg-gray-50 p-8 md:p-12 rounded-3xl border border-gray-100">
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-red-600">
            <Landmark className="w-8 h-8" />
            <h2 className="text-2xl font-bold uppercase">{t.govtOverview[language]}</h2>
          </div>
          <div className="text-gray-700 leading-relaxed space-y-4">
            <p>
              {language === 'en'
                ? 'Vietnam is a socialist state governed by law. The Government is the executive organ of the National Assembly and the highest organ of state administration.'
                : 'Việt Nam là một nhà nước xã hội chủ nghĩa pháp quyền. Chính phủ là cơ quan chấp hành của Quốc hội, cơ quan hành chính nhà nước cao nhất.'}
            </p>
            <p>
              {language === 'en'
                ? 'It manages all aspects of national life, implementing laws, resolutions, and decrees while maintaining national sovereignty and socio-economic stability.'
                : 'Chính phủ quản lý mọi mặt của đời sống quốc gia, thực hiện luật, nghị quyết, nghị định đồng thời giữ vững chủ quyền quốc gia và ổn định kinh tế - xã hội.'}
            </p>
          </div>
        </div>
        <div className="relative group overflow-hidden rounded-2xl shadow-xl">
          <img 
            src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=1200" 
            alt="Government Hall" 
            className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition duration-700"
          />
        </div>
      </section>

      {/* Structure */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 text-red-600">
          <Layout className="w-8 h-8" />
          <h2 className="text-2xl font-bold uppercase">{t.govtStructure[language]}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-3">
            <div className="font-black text-red-600 uppercase tracking-widest text-xs">Head of State</div>
            <h3 className="text-lg font-bold">Prime Minister</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {language === 'en' ? 'Directs the work of the Government and its members.' : 'Lãnh đạo công tác của Chính phủ và các thành viên Chính phủ.'}
            </p>
          </div>
          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-3">
            <div className="font-black text-red-600 uppercase tracking-widest text-xs">Executive Assitance</div>
            <h3 className="text-lg font-bold">Deputy Prime Ministers</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {language === 'en' ? 'Assist the Prime Minister in designated sectors.' : 'Giúp Thủ tướng thực hiện nhiệm vụ theo từng lĩnh vực được phân công.'}
            </p>
          </div>
          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-3">
            <div className="font-black text-red-600 uppercase tracking-widest text-xs">Policy & Management</div>
            <h3 className="text-lg font-bold">Ministries</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {language === 'en' ? 'Manage specific sectors like Foreign Affairs, Labor, and Finance.' : 'Quản lý các ngành, lĩnh vực như Ngoại giao, Lao động, Tài chính.'}
            </p>
          </div>
          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-3">
            <div className="font-black text-red-600 uppercase tracking-widest text-xs">Local Authority</div>
            <h3 className="text-lg font-bold">Provincial People\'s Committees</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {language === 'en' ? 'Exercise executive administration at provincial and local levels.' : 'Thực hiện quản lý hành chính nhà nước tại địa phương.'}
            </p>
          </div>
        </div>
      </section>

      {/* Responsibilities */}
      <section className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-red-600">
            <ShieldCheck className="w-8 h-8" />
            <h2 className="text-2xl font-bold uppercase">{t.govtResponsibilities[language]}</h2>
          </div>
          <ul className="space-y-4">
            {[
              { en: 'Protecting the Socialist Republic of Vietnam\'s constitution and laws.', vi: 'Bảo vệ Hiến pháp và pháp luật nước CHXHCN Việt Nam.' },
              { en: 'Managing national labor, immigration, and foreign workforce policy.', vi: 'Quản lý lao động, nhập cư và chính sách lao động nước ngoài.' },
              { en: 'Ensuring social security, public order, and economic growth.', vi: 'Đảm bảo an sinh xã hội, trật tự công cộng và tăng trưởng kinh tế.' },
              { en: 'Regulating foreign investment, visas, and international relations.', vi: 'Quy định về đầu tư nước ngoài, thị thực và quan hệ quốc tế.' }
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-gray-700 bg-red-50/30 p-4 rounded-xl border border-red-50">
                <span className="text-red-600 font-bold">✓</span>
                {item[language]}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 text-red-600">
            <Scale className="w-8 h-8" />
            <h2 className="text-2xl font-bold uppercase">{t.govtLawEnforcement[language]}</h2>
          </div>
          <div className="text-gray-700 leading-relaxed space-y-4">
            <p>
              {language === 'en'
                ? 'Government agencies are responsible for the strict enforcement of laws. There is a unified coordination between central ministries and local authorities to ensure national stability.'
                : 'Các cơ quan chính phủ chịu trách nhiệm thực thi nghiêm chỉnh pháp luật. Có sự phối hợp thống nhất giữa các bộ trung ương và chính quyền địa phương để đảm bảo ổn định quốc gia.'}
            </p>
            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 italic text-xs text-yellow-900">
              {language === 'en' ? 'Legal compliance is mandatory for all citizens and foreign nationals within Vietnamese territory.' : 'Tuân thủ pháp luật là bắt buộc đối với tất cả công dân và người nước ngoài trên lãnh thổ Việt Nam.'}
            </div>
          </div>
        </div>
      </section>

      {/* Services & Transparency */}
      <section className="grid md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <Info className="w-8 h-8" />
            <h2 className="text-2xl font-bold uppercase">{t.govtServices[language]}</h2>
          </div>
          <p className="text-gray-600">
            {language === 'en' 
              ? 'Providing digitalized public services, immigration support, and labor administration through transparent national portals.' 
              : 'Cung cấp dịch vụ công trực tuyến, hỗ trợ nhập cư và quản lý lao động thông qua các cổng thông tin quốc gia minh bạch.'}
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <Users className="w-8 h-8" />
            <h2 className="text-2xl font-bold uppercase">{t.govtTransparency[language]}</h2>
          </div>
          <p className="text-gray-600">
            {language === 'en' 
              ? 'Commitment to lawful governance and administrative discipline. Every action is subject to the rule of law and public accountability.' 
              : 'Cam kết quản lý theo pháp luật và kỷ cương hành chính. Mọi hành động đều tuân theo pháp quyền và trách nhiệm giải trình công khai.'}
          </p>
        </div>
      </section>

      {/* Footer Emblem Note */}
      <div className="pt-12 border-t border-gray-100 flex flex-col items-center text-center space-y-4">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Vietnam.svg/200px-Emblem_of_Vietnam.svg.png" 
          alt="Vietnam Emblem" 
          className="w-16 h-16 opacity-50"
        />
        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400">
          Official Portal of the Socialist Republic of Vietnam
        </p>
      </div>
    </div>
  );
};

export default Government;
