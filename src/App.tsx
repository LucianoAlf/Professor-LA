import React from 'react';
import { AppProvider, useAppContext } from './AppContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { UnitBar } from './components/UnitBar';
import { Dashboard } from './pages/Dashboard';
import { Ranking } from './pages/Ranking';
import { Anual } from './pages/Anual';
import { Lancamento } from './pages/Lancamento';
import { PDI } from './pages/PDI';
import { Config } from './pages/Config';
import { Instrucoes } from './pages/Instrucoes';

const MainContent: React.FC = () => {
  const { activePage, sbOpen } = useAppContext();

  return (
    <div className="flex min-h-screen relative z-10">
      <Sidebar />
      <div className={`flex-1 min-w-0 transition-[margin] duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] ${sbOpen ? 'lg:ml-[220px]' : 'ml-0'}`}>
        <Topbar />
        <UnitBar />
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'ranking' && <Ranking />}
        {activePage === 'anual' && <Anual />}
        {activePage === 'lancamento' && <Lancamento />}
        {activePage === 'pdi' && <PDI />}
        {activePage === 'config' && <Config />}
        {activePage === 'instrucoes' && <Instrucoes />}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
