
import React, { useState, useMemo } from 'react';
import { useAppConfig } from '../context/ConfigContext';
import { Language, DocType, InfoEntry } from '../types';
import { translations } from '../i18n';
import { 
  Briefcase, ShieldCheck, Globe, FileText, Banknote, Bell, 
  ChevronDown, ChevronUp, ShieldAlert, BadgeCheck, Zap
} from 'lucide-react';

interface Props { language: Language; }

const InformationPage: React.FC<Props> = ({ language }) => {
  const { infoEntries } = useAppConfig();
  const [activeType, setActiveType] = useState<DocType>(DocType.WORK_PERMIT);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  const filtered = useMemo(() => infoEntries.filter(e => e.appType === activeType && e.status !== 'Inactive'), [infoEntries, activeType]);
  const rules = filtered.filter(e => e.category === 'Rules');
  const costs = filtered.filter(e => e.category === 'Cost');
  const updates = filtered.filter(e => e.category === 'Update');

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12 space-y-16 animate-in fade-in duration-700">
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tight">Administrative Information Portal</h1>
        <div className="w-24 h-1.5 vn-bg-red mx-auto rounded-full" />
        <p className="text-lg text-gray-500 max-w-2xl mx-auto italic">Access official rules, regulatory costs, and policy updates for foreign residents.</p>
      </section>

      {/* Tabs */}
      <div className="flex justify-center p-2 bg-slate-100 rounded-[2.5rem] max-w-2xl mx-auto border border-slate-200 shadow-inner">
        {[
          { type: DocType.WORK_PERMIT, label: translations.workPermit[language], icon: Briefcase },
          { type: DocType.VISA, label: translations.visa[language], icon: Globe },
          { type: DocType.TRC, label: translations.trc[language], icon: ShieldCheck }
        ].map(tab => (
          <button
            key={tab.type}
            onClick={() => setActiveType(tab.type)}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-full font-black uppercase text-[10px] tracking-widest transition-all ${
              activeType === tab.type ? 'bg-white shadow-xl scale-105 text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeType === tab.type ? 'text-red-600' : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Rules Section */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
            <div className="flex items-center gap-4 text-slate-900 border-b pb-6">
               <FileText className="w-8 h-8 text-red-600" />
               <h2 className="text-2xl font-black uppercase tracking-tight">Rules & Requirements</h2>
            </div>
            <div className="grid gap-6">
              {rules.length > 0 ? rules.map(rule => (
                <div key={rule.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4 hover:bg-white transition-all shadow-sm">
                  <div className="flex justify-between items-start">
                     <h3 className="font-black text-slate-900 uppercase text-sm tracking-tight">{rule.title}</h3>
                     {rule.status === 'Pinned' && <Zap className="w-4 h-4 text-red-600 fill-red-600 animate-pulse" />}
                  </div>
                  <p className={`text-sm text-slate-600 leading-relaxed font-medium ${expandedIds.has(rule.id) ? '' : 'line-clamp-3'}`}>{rule.description}</p>
                  <button onClick={() => toggleExpand(rule.id)} className="text-[10px] font-black uppercase text-red-600 flex items-center gap-2 hover:underline">
                    {expandedIds.has(rule.id) ? 'Collapse' : 'Read Detailed Protocol'} {expandedIds.has(rule.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
              )) : <p className="text-center py-10 text-slate-300 italic uppercase font-black text-xs">Registry rules under update</p>}
            </div>
          </div>

          {/* Costs Section */}
          <div className="bg-slate-900 p-12 rounded-[4rem] text-white space-y-10 relative overflow-hidden">
             <div className="flex items-center gap-4 border-b border-white/10 pb-6 relative z-10">
                <Banknote className="w-8 h-8 text-emerald-400" />
                <h2 className="text-2xl font-black uppercase tracking-tight">Administrative Cost Structure</h2>
             </div>
             <div className="grid md:grid-cols-2 gap-8 relative z-10">
               {costs.length > 0 ? costs.map(cost => (
                 <div key={cost.id} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 flex flex-col justify-between group hover:bg-white/10 transition-all">
                    <div className="space-y-4">
                      <h4 className="font-black text-emerald-400 uppercase text-xs tracking-[0.2em]">{cost.title}</h4>
                      <p className="text-sm text-slate-400 leading-relaxed italic font-medium">{cost.description}</p>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase text-white/40 tracking-widest italic">Government Fee</span>
                       <span className="text-2xl font-black text-white">{cost.amount}</span>
                    </div>
                 </div>
               )) : <p className="text-center py-10 text-white/20 italic font-black uppercase text-xs">Fee schedules are pending synchronization</p>}
             </div>
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Vietnam.svg/200px-Emblem_of_Vietnam.svg.png" className="absolute -bottom-20 -right-20 w-96 opacity-[0.05] grayscale brightness-0 invert" alt="Emblem" />
          </div>
        </div>

        {/* Updates Sidebar */}
        <div className="space-y-10">
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-4 border-b pb-6">
                 <Bell className="w-8 h-8 text-red-600" />
                 <h2 className="text-xl font-black uppercase tracking-tight">Latest Dispatches</h2>
              </div>
              <div className="space-y-6">
                {updates.length > 0 ? updates.map(update => (
                  <div key={update.id} className={`p-6 rounded-[2rem] border-l-8 transition-all shadow-sm ${
                    update.status === 'Pinned' ? 'bg-red-50 border-red-600 animate-in slide-in-from-right-2' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}>
                     <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{update.date}</span>
                        {update.status === 'Pinned' && <Zap className="w-3 h-3 text-red-600 fill-current animate-pulse" />}
                     </div>
                     <h4 className="font-black text-slate-900 text-sm mb-2 uppercase leading-tight">{update.title}</h4>
                     <p className="text-xs text-slate-600 leading-relaxed font-medium italic">{update.description}</p>
                  </div>
                )) : <p className="text-center py-10 text-slate-300 italic font-black uppercase text-xs">No active dispatches</p>}
              </div>
           </div>

           <div className="bg-red-600 p-10 rounded-[4rem] text-white shadow-2xl space-y-6 group overflow-hidden relative">
              <div className="p-4 bg-white/20 rounded-2xl w-fit relative z-10"><BadgeCheck className="w-8 h-8" /></div>
              <h3 className="text-xl font-black uppercase tracking-tight relative z-10">Sovereign Compliance</h3>
              <p className="text-xs text-red-50 leading-relaxed font-bold italic relative z-10">Information provided is synchronized with the National Database. All foreign activities must be conducted under the official legal framework of the Socialist Republic of Vietnam.</p>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
           </div>
        </div>
      </div>

      <div className="p-16 bg-white rounded-[5rem] border-2 border-slate-100 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-12 group">
         <div className="space-y-4 text-center md:text-left">
            <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Verify Authenticity</h3>
            <p className="text-slate-500 font-medium italic text-lg max-w-lg leading-tight">Cross-reference your documents through our high-security administrative portal.</p>
         </div>
         <div className="flex flex-col sm:flex-row gap-6">
            <button className="px-12 py-6 bg-slate-900 text-white rounded-full font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl hover:bg-red-600 transition-all active:scale-95">Verify Registry</button>
            <button className="px-12 py-6 bg-white border-2 border-slate-100 text-slate-400 rounded-full font-black uppercase text-[10px] tracking-[0.3em] hover:text-slate-900 transition-all">Support Center</button>
         </div>
      </div>
    </div>
  );
};

export default InformationPage;
