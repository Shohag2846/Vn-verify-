import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { translations } from '../i18n';
import { Language } from '../types';

interface Props {
  language: Language;
}

const Navbar: React.FC<Props> = ({ language }) => {
  const t = translations;
  const location = useLocation();

  const menuItems = [
    { label: t.home[language], path: '/' },
    { label: t.aboutVn[language], path: '/about' },
    { label: t.government[language], path: '/government' },
    { label: t.primeMinister[language], path: '/pm' },
    { label: t.news[language], path: '/news' },
    { label: t.resources[language], path: '/resources' },
    { label: t.workPermit[language], path: '/work-permit' },
    { label: t.visa[language], path: '/visa' },
    { label: t.trc[language], path: '/trc' },
    { label: t.support[language], path: '/support' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-red-700 text-white shadow-md border-b border-red-800">
      <div className="max-w-screen-2xl mx-auto">
        <ul className="flex flex-nowrap md:flex-wrap items-center justify-start lg:justify-center overflow-x-auto scrollbar-hide">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path} className="flex-shrink-0">
                <Link
                  to={item.path}
                  className={`block px-5 py-4 text-[11px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 relative group ${
                    isActive ? 'text-yellow-400' : 'text-white/90 hover:text-white hover:bg-red-800'
                  }`}
                >
                  {item.label}
                  {/* Active Indicator Line */}
                  <span className={`absolute bottom-0 left-0 w-full h-1 bg-yellow-400 transition-all duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-0 scale-x-0 group-hover:opacity-30 group-hover:scale-x-100'
                  }`} />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;