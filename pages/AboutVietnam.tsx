
import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n';
import { Globe, Landmark, Scale, Briefcase, Heart, Ship } from 'lucide-react';

interface Props {
  language: Language;
}

const AboutVietnam: React.FC<Props> = ({ language }) => {
  const t = translations;

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12 space-y-16 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-5xl font-black text-gray-900 uppercase tracking-tight">
          {t.aboutVn[language]}
        </h1>
        <div className="w-24 h-1.5 bg-red-600 mx-auto rounded-full" />
        <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
          {language === 'en' 
            ? 'Official information regarding the Socialist Republic of Vietnam, its governance, and national development.' 
            : 'Thông tin chính thức về nước Cộng hòa Xã hội Chủ nghĩa Việt Nam, hệ thống quản lý và phát triển quốc gia.'}
        </p>
      </section>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Country Overview */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <Globe className="w-8 h-8" />
            <h2 className="text-2xl font-bold uppercase">{t.aboutCountryOverview[language]}</h2>
          </div>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p><strong>{language === 'en' ? 'Official Name:' : 'Tên chính thức:'}</strong> {t.republic[language]}</p>
            <p>
              {language === 'en'
                ? 'Vietnam is located on the eastern margin of the Indochinese peninsula in Southeast Asia. It shares borders with China to the north, Laos and Cambodia to the west, and the South China Sea to the east and south.'
                : 'Việt Nam nằm ở phía đông bán đảo Đông Dương thuộc khu vực Đông Nam Á. Phía bắc giáp Trung Quốc, phía tây giáp Lào và Campuchia, phía đông và nam giáp Biển Đông.'}
            </p>
            <p>
              {language === 'en'
                ? 'The capital is Hanoi. Major administrative and economic hubs include Ho Chi Minh City, Da Nang, Hai Phong, and Can Tho.'
                : 'Thủ đô là Hà Nội. Các trung tâm hành chính và kinh tế lớn bao gồm Thành phố Hồ Chí Minh, Đà Nẵng, Hải Phòng và Cần Thơ.'}
            </p>
          </div>
        </div>

        {/* Political System */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <Landmark className="w-8 h-8" />
            <h2 className="text-2xl font-bold uppercase">{t.aboutPoliticalSystem[language]}</h2>
          </div>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              {language === 'en'
                ? 'Vietnam is a socialist state led by the Communist Party of Vietnam. The political system is unified under the principle that all State power belongs to the people.'
                : 'Việt Nam là một nhà nước xã hội chủ nghĩa dưới sự lãnh đạo của Đảng Cộng sản Việt Nam. Hệ thống chính trị thống nhất theo nguyên tắc tất cả quyền lực Nhà nước thuộc về nhân dân.'}
            </p>
            <p>
              {language === 'en'
                ? 'The State structure includes the National Assembly (legislative), the Government (executive), and the People\'s Courts and Procuracies (judicial).'
                : 'Cơ cấu Nhà nước bao gồm Quốc hội (cơ quan lập pháp), Chính phủ (cơ quan hành pháp) và Tòa án nhân dân, Viện kiểm sát nhân dân (cơ quan tư pháp).'}
            </p>
          </div>
        </div>

        {/* Legal Framework */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <Scale className="w-8 h-8" />
            <h2 className="text-2xl font-bold uppercase">{t.aboutLegalFramework[language]}</h2>
          </div>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              {language === 'en'
                ? 'The Constitution is the supreme law of the Socialist Republic of Vietnam. The legal system emphasizes the rule of law and national sovereignty.'
                : 'Hiến pháp là luật cơ bản của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam. Hệ thống pháp luật nhấn mạnh vào pháp quyền và chủ quyền quốc gia.'}
            </p>
            <p>
              {language === 'en'
                ? 'Compliance with Vietnamese laws is mandatory for everyone residing in the territory, including foreign nationals. The State ensures equal protection under the law for all.'
                : 'Việc tuân thủ pháp luật Việt Nam là bắt buộc đối với tất cả mọi người cư trú trên lãnh thổ, bao gồm cả công dân nước ngoài. Nhà nước đảm bảo sự bảo vệ bình đẳng trước pháp luật cho tất cả mọi người.'}
            </p>
          </div>
        </div>

        {/* Economy & Labor */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <Briefcase className="w-8 h-8" />
            <h2 className="text-2xl font-bold uppercase">{t.aboutEconomyLabor[language]}</h2>
          </div>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              {language === 'en'
                ? 'Vietnam is a dynamic developing industrial hub and a key player in global manufacturing. The country actively encourages foreign direct investment (FDI).'
                : 'Việt Nam là một trung tâm công nghiệp đang phát triển năng động và là nhân tố quan trọng trong sản xuất toàn cầu. Nhà nước tích cực khuyến khích đầu tư trực tiếp nước ngoài (FDI).'}
            </p>
            <p>
              {language === 'en'
                ? 'Foreign nationals working in Vietnam must comply with labor regulations, including obtaining valid Work Permits, appropriate Visas, or Temporary Residence Cards (TRC).'
                : 'Công dân nước ngoài làm việc tại Việt Nam phải tuân thủ các quy định về lao động, bao gồm việc xin Giấy phép lao động hợp lệ, Thị thực phù hợp hoặc Thẻ tạm trú (TRC).'}
            </p>
          </div>
        </div>

        {/* Culture & Society */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <Heart className="w-8 h-8" />
            <h2 className="text-2xl font-bold uppercase">{t.aboutCultureSociety[language]}</h2>
          </div>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              {language === 'en'
                ? 'Vietnamese society is built on core values of patriotism, family orientation, and respect for tradition and social order.'
                : 'Xã hội Việt Nam được xây dựng trên các giá trị cốt lõi là lòng yêu nước, hướng về gia đình và tôn trọng truyền thống, trật tự xã hội.'}
            </p>
            <p>
              {language === 'en'
                ? 'Residents are expected to respect national symbols and maintain cultural harmony. Vietnam welcomes foreign residents who contribute to its socio-economic fabric.'
                : 'Cư dân được kỳ vọng tôn trọng các biểu tượng quốc gia và duy trì sự hòa hợp văn hóa. Việt Nam chào đón các cư dân nước ngoài đóng góp vào cấu trúc kinh tế - xã hội của đất nước.'}
            </p>
          </div>
        </div>

        {/* International Relations */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <Ship className="w-8 h-8" />
            <h2 className="text-2xl font-bold uppercase">{t.aboutInternationalRelations[language]}</h2>
          </div>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              {language === 'en'
                ? 'Vietnam maintains diplomatic relations with over 190 countries and is an active member of ASEAN, the United Nations, and many other international organizations.'
                : 'Việt Nam duy trì quan hệ ngoại giao với hơn 190 quốc gia và là thành viên tích cực của ASEAN, Liên Hợp Quốc và nhiều tổ chức quốc tế khác.'}
            </p>
            <p>
              {language === 'en'
                ? 'The country is committed to international law, global peace, and sustainable development through diverse economic and diplomatic partnerships.'
                : 'Đất nước cam kết tuân thủ luật pháp quốc tế, hòa bình thế giới và phát triển bền vững thông qua các đối tác kinh tế và ngoại giao đa dạng.'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="p-8 bg-red-900 text-white rounded-3xl shadow-xl border-t-4 border-yellow-400">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Vietnam.svg/200px-Emblem_of_Vietnam.svg.png" 
            alt="Emblem" 
            className="w-24 h-24 brightness-0 invert"
          />
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-2xl font-bold uppercase tracking-tight">
              {language === 'en' ? 'Administrative Notice' : 'Thông báo hành chính'}
            </h4>
            <p className="text-red-100 leading-relaxed italic opacity-80">
              {language === 'en'
                ? 'The Socialist Republic of Vietnam provides this information to facilitate transparent governance. All foreign activities must be conducted under official legal frameworks.'
                : 'Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam cung cấp thông tin này nhằm thúc đẩy quản lý minh bạch. Tất cả các hoạt động của người nước ngoài phải được thực hiện theo khung pháp lý chính thức.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutVietnam;
