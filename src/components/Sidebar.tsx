import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { BarChart2, Trophy, Calendar, Inbox, Target, Settings, ClipboardList, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { QUARTERS } from '../constants';
import { Tooltip } from './ui/tooltip';

export const Sidebar: React.FC = () => {
  const { sbOpen, setSbOpen, sbCollapsed, setSbCollapsed, activePage, setActivePage, curQ } = useAppContext();
  const [showLogoFallback, setShowLogoFallback] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2, sec: 'Visão Geral' },
    { id: 'ranking', label: 'Ranking Trimestre', icon: Trophy },
    { id: 'anual', label: 'Resultado Anual', icon: Calendar },
    { id: 'lancamento', label: 'Lançamento Mensal', icon: Inbox, sec: 'Operação' },
    { id: 'pdi', label: 'PDI Trimestral', icon: Target },
    { id: 'professores', label: 'Cadastro Professores', icon: UserPlus },
    { id: 'config', label: 'Configurações', icon: Settings, sec: 'Sistema' },
    { id: 'instrucoes', label: 'Instruções', icon: ClipboardList },
  ];

  const handleNav = (id: string) => {
    setActivePage(id);
    if (window.innerWidth < 1024) setSbOpen(false);
  };

  const sidebarWidth = sbCollapsed ? 72 : 220;

  return (
    <>
      {/* Overlay mobile */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[199] backdrop-blur-sm lg:hidden ${sbOpen ? 'block' : 'hidden'}`}
        onClick={() => setSbOpen(false)}
      />
      
      {/* Sidebar */}
      <aside
        style={{ width: sidebarWidth }}
        className={`fixed top-0 left-0 h-screen bg-[var(--bg2)] border-r border-[var(--border2)] flex flex-col z-[200] backdrop-blur-xl transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] ${sbOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header com logo */}
        <div className={`${sbCollapsed ? 'px-3' : 'px-5'} pt-[22px] pb-[18px] border-b border-[var(--border2)]`}>
          {showLogoFallback ? (
            <div className={`flex ${sbCollapsed ? 'justify-center' : ''}`}>
              <div className="font-serif text-[11px] font-black bg-[var(--gold)] text-[var(--ink)] px-2 py-[3px] rounded-md tracking-wider inline-block">
                LA
              </div>
            </div>
          ) : (
            <div className={`flex ${sbCollapsed ? 'justify-center' : ''}`}>
              <img
                src="/logo2.png"
                alt="Professor +LA"
                onError={() => setShowLogoFallback(true)}
                className="h-8 w-auto"
              />
            </div>
          )}
          {!sbCollapsed && (
            <div className="text-[10px] text-[var(--txt3)] tracking-[1.5px] uppercase mt-2">
              Professor+LA
            </div>
          )}
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto overflow-x-clip py-3.5">
          {navItems.map((item) => (
            <React.Fragment key={item.id}>
              {!sbCollapsed && item.sec && (
                <div className="text-[9px] tracking-[2px] uppercase text-[var(--sb-sec)] px-5 pt-3 pb-1.5 font-semibold">
                  {item.sec}
                </div>
              )}
              <Tooltip content={sbCollapsed ? item.label : ''}>
                <div
                  onClick={() => handleNav(item.id)}
                  className={`flex w-full items-center py-[10px] cursor-pointer transition-all duration-150 border-l-2 text-[13px] font-medium ${
                    sbCollapsed ? 'justify-center px-0' : 'gap-3 px-5'
                  } ${
                    activePage === item.id
                      ? 'bg-[var(--sb-active)] border-[var(--gold)] text-[var(--txt)]'
                      : 'border-transparent text-[var(--sb-item)] hover:bg-[var(--sb-hover)] hover:text-[var(--txt)]'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sbCollapsed && <span>{item.label}</span>}
                </div>
              </Tooltip>
            </React.Fragment>
          ))}
        </nav>

        {/* Footer */}
        <div className={`${sbCollapsed ? 'px-3 text-center' : 'px-5'} py-4 border-t border-[var(--border2)] text-[10px] text-[var(--txt4)]`}>
          <strong className="block text-[var(--txt3)] mb-0.5">
            {sbCollapsed ? curQ : `${curQ} · ${QUARTERS[curQ].names[0].slice(0,3)}–${QUARTERS[curQ].names[2].slice(0,3)} · 2026`}
          </strong>
          {!sbCollapsed && 'LA Music · Comissão Pedagógica'}
        </div>
      </aside>

      {/* Botão colapsar — fixed, colado na borda direita da sidebar, só desktop */}
      <button
        onClick={() => setSbCollapsed(!sbCollapsed)}
        className="hidden lg:flex fixed top-[42px] z-[201] items-center justify-center w-[26px] h-[26px] rounded-full border border-[var(--border2)] bg-[var(--bg2)] text-[var(--txt3)] hover:border-[var(--gold)] hover:text-[var(--txt)] transition-all duration-250 shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
        style={{ left: sidebarWidth - 13 }}
        aria-label={sbCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
      >
        {sbCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
    </>
  );
};
