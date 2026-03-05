import React, { useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { QUARTERS } from '../constants';
import { QuarterId } from '../types';
import { Menu, Sun, Moon, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Topbar: React.FC = () => {
  const { sbOpen, setSbOpen, curQ, setCurQ, setCurMonth, isLight, setIsLight } = useAppContext();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleQuarterChange = (q: QuarterId) => {
    setCurQ(q);
    setCurMonth(QUARTERS[q].months[0]);
  };

  useEffect(() => {
    if (isLight) {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [isLight]);

  return (
    <div className="flex justify-between items-center px-5 py-3.5 border-b border-[var(--border2)] bg-[var(--bg3)] backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2.5">
        <button 
          onClick={() => setSbOpen(!sbOpen)}
          className="p-1.5 rounded-lg text-[var(--txt)] hover:bg-[var(--surface)] transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="font-serif text-[19px] font-bold text-[var(--txt)] hidden sm:block">
          Professor<span className="text-[var(--gold)]">+LA</span>
        </div>
        <div className="flex gap-1.5 ml-2">
          {(Object.keys(QUARTERS) as QuarterId[]).map(q => (
            <button
              key={q}
              onClick={() => handleQuarterChange(q)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer border transition-all duration-150 ${curQ === q ? 'bg-[rgba(200,151,58,0.12)] border-[rgba(200,151,58,0.35)] text-[var(--gold)]' : 'border-[var(--border)] text-[var(--txt3)] bg-transparent hover:border-[rgba(200,151,58,0.4)] hover:text-[var(--txt2)]'}`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="bg-[rgba(45,90,160,0.18)] border border-[rgba(45,90,160,0.3)] rounded-full px-3 py-1.5 text-[11px] text-[#7EB9FF] font-semibold">
          2026
        </div>
        <button 
          onClick={() => setIsLight(!isLight)}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-full p-1.5 cursor-pointer transition-all duration-150 hover:border-[var(--gold)] text-[var(--txt)]"
          title="Alternar tema"
        >
          {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
        <button
          onClick={handleLogout}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-full p-1.5 cursor-pointer transition-all duration-150 hover:border-[var(--gold)] text-[var(--txt)]"
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
        </button>
        <div className="w-2 h-2 bg-[#4AE88A] rounded-full shadow-[0_0_8px_#4AE88A]"></div>
      </div>
    </div>
  );
};
