
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import InfoBar from './components/InfoBar';
import Navbar from './components/Navbar';
import AgreementOverlay from './pages/AgreementOverlay';
import Home from './pages/Home';
import AboutVietnam from './pages/AboutVietnam';
import Government from './pages/Government';
import PrimeMinister from './pages/PrimeMinister';
import WorkPermit from './pages/WorkPermit';
import Visa from './pages/Visa';
import TRC from './pages/TRC';
import Support from './pages/Support';
import News from './pages/News';
import Resources from './pages/Resources';
import InformationPage from './pages/InformationPage';
import ManagementConsole from './pages/ManagementConsole';
import { Language, DocType } from './types';
import { translations } from './i18n';
import { ConfigProvider } from './context/ConfigContext';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [agreed, setAgreed] = useState<boolean>(false);
  const [declined, setDeclined] = useState<boolean>(false);
  const [footerEmblemClicks, setFooterEmblemClicks] = useState(0);

  const handleEmblemClick = () => {
    const nextClicks = footerEmblemClicks + 1;
    if (nextClicks >= 5) {
      window.location.hash = '/management-console';
      setFooterEmblemClicks(0);
    } else {
      setFooterEmblemClicks(nextClicks);
    }
  };

  if (declined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white p-6">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-4xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-400">You have declined the Terms of Service. Access to the official verification portal is restricted without agreement.</p>
          <button 
            onClick={() => setDeclined(false)} 
            className="px-6 py-2 bg-white text-black font-bold rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <ConfigProvider>
      <HashRouter>
        {!agreed && (
          <AgreementOverlay 
            language={language} 
            onAgree={() => setAgreed(true)} 
            onDecline={() => setDeclined(true)} 
          />
        )}
        
        <div className={`min-h-screen bg-white flex flex-col transition-filter duration-500 ${!agreed ? 'blur-md pointer-events-none' : ''}`}>
          <Header language={language} setLanguage={setLanguage} />
          <InfoBar language={language} />
          <Navbar language={language} />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home language={language} />} />
              <Route path="/about" element={<AboutVietnam language={language} />} />
              <Route path="/government" element={<Government language={language} />} />
              <Route path="/pm" element={<PrimeMinister language={language} />} />
              <Route path="/information" element={<InformationPage language={language} />} />
              <Route path="/news" element={<News language={language} />} />
              <Route path="/resources" element={<Resources language={language} />} />
              <Route path="/work-permit" element={<WorkPermit language={language} />} />
              <Route path="/visa" element={<Visa language={language} />} />
              <Route path="/trc" element={<TRC language={language} />} />
              <Route path="/support" element={<Support language={language} />} />
              <Route path="/management-console" element={<ManagementConsole />} />
            </Routes>
          </main>

          <footer className="bg-gray-900 text-white py-12 px-6">
            <div className="max-w-screen-xl mx-auto grid md:grid-cols-3 gap-12">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Vietnam.svg/200px-Emblem_of_Vietnam.svg.png" 
                    alt="Vietnam Emblem" 
                    className="w-12 h-12 brightness-0 invert cursor-pointer select-none active:scale-95 transition-transform"
                    onClick={handleEmblemClick}
                  />
                  <div className="font-bold text-lg">Vietnam.gov.vn</div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  The official portal of the Socialist Republic of Vietnam. Providing information and services to citizens, businesses, and foreign nationals.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-6 border-b border-red-600 pb-2 inline-block">Quick Links</h4>
                <ul className="space-y-3 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-red-500">Legal Documents</a></li>
                  <li><a href="#" className="hover:text-red-500">Open Data</a></li>
                  <li><a href="#" className="hover:text-red-500">Contact Prime Minister</a></li>
                  <li><a href="#" className="hover:text-red-500">Public Service Portal</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-6 border-b border-red-600 pb-2 inline-block">Copyright</h4>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  © 2024 Portal of the Socialist Republic of Vietnam. <br/>All rights reserved. Reproduction in whole or in part without permission is prohibited.
                </p>
                <div className="pt-4 border-t border-gray-800">
                   <Link to="/management-console" className="text-[10px] text-gray-600 hover:text-red-500 uppercase tracking-widest transition-colors">
                     {translations.adminPortal[language]}
                   </Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </HashRouter>
    </ConfigProvider>
  );
};

export default App;
