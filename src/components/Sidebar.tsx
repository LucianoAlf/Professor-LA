import React from 'react';
import { useAppContext } from '../AppContext';
import { BarChart2, Trophy, Calendar, Inbox, Target, Settings, ClipboardList } from 'lucide-react';
import { QUARTERS } from '../constants';

export const Sidebar: React.FC = () => {
  const { sbOpen, setSbOpen, activePage, setActivePage, curQ } = useAppContext();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2, sec: 'Visão Geral' },
    { id: 'ranking', label: 'Ranking Trimestre', icon: Trophy },
    { id: 'anual', label: 'Resultado Anual', icon: Calendar },
    { id: 'lancamento', label: 'Lançamento Mensal', icon: Inbox, sec: 'Operação' },
    { id: 'pdi', label: 'PDI Trimestral', icon: Target },
    { id: 'config', label: 'Configurações', icon: Settings, sec: 'Sistema' },
    { id: 'instrucoes', label: 'Instruções', icon: ClipboardList },
  ];

  const handleNav = (id: string) => {
    setActivePage(id);
    if (window.innerWidth < 1024) setSbOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[199] backdrop-blur-sm lg:hidden ${sbOpen ? 'block' : 'hidden'}`}
        onClick={() => setSbOpen(false)}
      />
      
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-[220px] bg-[var(--bg2)] border-r border-[var(--border2)] flex flex-col z-[200] backdrop-blur-xl transition-transform duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] ${sbOpen ? 'translate-x-0' : '-translate-x-[220px] lg:translate-x-0'}`}>
        <div className="px-5 pt-[22px] pb-[18px] border-b border-[var(--border2)]">
          <div className="font-serif text-[11px] font-black bg-[var(--gold)] text-[var(--ink)] px-2 py-[3px] rounded-md tracking-wider inline-block mb-2">LA</div>
          <div className="font-serif text-lg font-bold text-[var(--txt)] leading-none">Music</div>
          <div className="text-[10px] text-[var(--txt3)] tracking-[1.5px] uppercase mt-1">Professor+LA</div>
        </div>
        
        <nav className="flex-1 py-3.5 overflow-y-auto">
          {navItems.map((item, i) => (
            <React.Fragment key={item.id}>
              {item.sec && (
                <div className="text-[9px] tracking-[2px] uppercase text-[var(--sb-sec)] px-5 pt-3 pb-1.5 font-semibold">
                  {item.sec}
                </div>
              )}
              <div 
                onClick={() => handleNav(item.id)}
                className={`flex items-center gap-2.5 px-5 py-[9px] cursor-pointer transition-all duration-150 border-l-2 text-[13px] font-medium ${activePage === item.id ? 'bg-[var(--sb-active)] border-[var(--gold)] text-[var(--txt)]' : 'border-transparent text-[var(--sb-item)] hover:bg-[var(--sb-hover)] hover:text-[var(--txt)]'}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
            </React.Fragment>
          ))}
        </nav>
        
        <div className="p-5 border-t border-[var(--border2)] text-[10px] text-[var(--txt4)]">
          <strong className="block text-[var(--txt3)] mb-0.5">{curQ} · {QUARTERS[curQ].names[0].slice(0,3)}–{QUARTERS[curQ].names[2].slice(0,3)} · 2026</strong>
          LA Music · Comissão Pedagógica
        </div>
      </aside>
    </>
  );
};
