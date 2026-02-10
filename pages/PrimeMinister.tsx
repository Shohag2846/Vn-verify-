
import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n';
import { User, Briefcase, Calendar, Award, History, Globe, Shield } from 'lucide-react';

interface Props {
  language: Language;
}

const PrimeMinister: React.FC<Props> = ({ language }) => {
  const t = translations;

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12 space-y-16 animate-in fade-in duration-700">
      {/* 1. Top Section: Profile */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-2/5 relative">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Pham_Minh_Chinh_2024.jpg/440px-Pham_Minh_Chinh_2024.jpg" 
            alt="PM Pham Minh Chinh" 
            className="w-full h-full object-cover grayscale-[10%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
        </div>
        <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              {t.pmName[language]}
            </h1>
            <p className="text-2xl font-bold text-red-600 uppercase tracking-widest">
              {t.pmTitle[language]}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <Calendar className="text-red-600 w-5 h-5" />
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">{language === 'en' ? 'Date of Appointment' : 'Ngày bổ nhiệm'}</p>
                <p className="font-bold text-gray-800">{t.pmAppointment[language]}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="text-red-600 w-5 h-5" />
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">{language === 'en' ? 'Current Status' : 'Trạng thái'}</p>
                <p className="font-bold text-gray-800">{t.pmStatus[language]}</p>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 italic leading-relaxed text-lg">
            {language === 'en' 
              ? 'Directing the executive branch of the Socialist Republic of Vietnam towards innovation, administrative reform, and sustainable economic growth.' 
              : 'Lãnh đạo cơ quan hành pháp nước Cộng hòa Xã hội Chủ nghĩa Việt Nam hướng tới đổi mới, cải cách hành chính và tăng trưởng kinh tế bền vững.'}
          </p>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* 2. Office of the Prime Minister */}
        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <Briefcase className="w-6 h-6" />
            <h2 className="text-xl font-bold uppercase">{t.pmOfficeTitle[language]}</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            {language === 'en'
              ? 'The Prime Minister is the Head of the Government of the Socialist Republic of Vietnam. As the leader of the executive branch, the Prime Minister oversees the national administration and directs the work of the Government members and ministries.'
              : 'Thủ tướng là người đứng đầu Chính phủ nước Cộng hòa Xã hội Chủ nghĩa Việt Nam. Là người lãnh đạo cơ quan hành pháp, Thủ tướng giám sát công tác quản lý quốc gia và lãnh đạo công việc của các thành viên Chính phủ và các bộ.'}
          </p>
          <p className="text-gray-700 leading-relaxed font-medium">
            {language === 'en'
              ? 'The Prime Minister is accountable to the National Assembly and reports on the activities of the Government and the national administrative system.'
              : 'Thủ tướng chịu trách nhiệm trước Quốc hội và báo cáo về hoạt động của Chính phủ và hệ thống hành chính quốc gia.'}
          </p>
        </div>

        {/* 3. Term & Election Process */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <User className="w-6 h-6" />
            <h2 className="text-xl font-bold uppercase">{t.pmElectionTitle[language]}</h2>
          </div>
          <div className="space-y-4 text-gray-700">
            <p>
              {language === 'en'
                ? 'The Prime Minister is elected by the National Assembly among its members based on the recommendation of the State President.'
                : 'Thủ tướng được Quốc hội bầu trong số các đại biểu Quốc hội theo đề nghị của Chủ tịch nước.'}
            </p>
            <p>
              {language === 'en'
                ? 'The term of the Prime Minister corresponds to the term of the National Assembly. Standard term duration is 5 years, with eligibility for reappointment in accordance with the Constitution.'
                : 'Nhiệm kỳ của Thủ tướng theo nhiệm kỳ của Quốc hội. Thời hạn nhiệm kỳ tiêu chuẩn là 5 năm, có thể được bầu lại theo quy định của Hiến pháp.'}
            </p>
          </div>
        </div>

        {/* 4. Powers & Responsibilities */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-red-600">
            <Shield className="w-6 h-6" />
            <h2 className="text-xl font-bold uppercase">{t.pmPowersTitle[language]}</h2>
          </div>
          <ul className="grid gap-4">
            {[
              { en: 'Directs ministries and government agencies in executing national policy.', vi: 'Lãnh đạo các bộ và cơ quan chính phủ thực hiện chính sách quốc gia.' },
              { en: 'Oversees labor administration, immigration, and foreign employment policy.', vi: 'Giám sát quản lý lao động, nhập cư và chính sách lao động nước ngoài.' },
              { en: 'Ensures the uniform implementation of laws and the Constitution.', vi: 'Đảm bảo việc thực hiện thống nhất pháp luật và Hiến pháp.' },
              { en: 'Maintains public order, social security, and economic stability.', vi: 'Giữ gìn trật tự công cộng, an ninh xã hội và ổn định kinh tế.' }
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700 items-start">
                <span className="text-red-600 font-black mt-0.5">•</span>
                {item[language]}
              </li>
            ))}
          </ul>
        </div>

        {/* 5. Historical Background */}
        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <History className="w-6 h-6" />
            <h2 className="text-xl font-bold uppercase">{t.pmHistoryTitle[language]}</h2>
          </div>
          <p className="text-gray-700 leading-relaxed text-sm">
            {language === 'en'
              ? 'The office of the Prime Minister has evolved since Vietnam’s declaration of independence in 1945. It represents the central authority of executive governance, evolving through different constitutional periods to meet the demands of national development and international integration.'
              : 'Văn phòng Thủ tướng đã phát triển kể từ khi Việt Nam tuyên bố độc lập năm 1945. Nó đại diện cho quyền lực trung tâm của quản trị hành pháp, phát triển qua các thời kỳ hiến pháp khác nhau để đáp ứng yêu cầu phát triển đất nước và hội nhập quốc tế.'}
          </p>
          <p className="text-gray-700 leading-relaxed text-sm">
            {language === 'en'
              ? 'Historical leadership has focused on ensuring political continuity, social progress, and protecting national sovereignty while driving industrialization and modernization.'
              : 'Lãnh đạo lịch sử đã tập trung vào việc đảm bảo tính liên tục về chính trị, tiến bộ xã hội và bảo vệ chủ quyền quốc gia đồng thời thúc đẩy công nghiệp hóa và hiện đại hóa.'}
          </p>
        </div>
      </div>

      {/* 6. International Role */}
      <section className="bg-red-900 text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="bg-white/10 p-4 rounded-full">
            <Globe className="w-12 h-12 text-yellow-400" />
          </div>
          <div className="space-y-4 flex-1">
            <h2 className="text-2xl font-bold uppercase tracking-tight">{t.pmInternationalTitle[language]}</h2>
            <div className="grid md:grid-cols-2 gap-8 text-sm">
              <p className="text-red-100 leading-relaxed">
                {language === 'en'
                  ? 'The Prime Minister represents the Government in international relations, overseeing bilateral and multilateral cooperation to enhance Vietnam’s global standing.'
                  : 'Thủ tướng đại diện cho Chính phủ trong quan hệ quốc tế, giám sát hợp tác song phương và đa phương nhằm nâng cao vị thế toàn cầu của Việt Nam.'}
              </p>
              <p className="text-red-100 leading-relaxed border-l border-white/10 pl-8">
                {language === 'en'
                  ? 'This includes fostering a lawful environment for foreign nationals, ensuring robust systems for visas, work permits, and residency to support international partnership.'
                  : 'Điều này bao gồm việc thúc đẩy môi trường pháp lý cho người nước ngoài, đảm bảo các hệ thống mạnh mẽ về thị thực, giấy phép lao động và cư trú để hỗ trợ đối tác quốc tế.'}
              </p>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      </section>

      {/* Page Footer Emblem */}
      <div className="flex flex-col items-center pt-12 border-t border-gray-100 opacity-40">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Vietnam.svg/200px-Emblem_of_Vietnam.svg.png" 
          alt="Vietnam Emblem" 
          className="w-12 h-12 mb-4"
        />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Constitutional Executive Leadership</p>
      </div>
    </div>
  );
};

export default PrimeMinister;
