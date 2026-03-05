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
import { Login } from './pages/Login';
import { Professores } from './pages/Professores';
import { useAuth } from './hooks/useAuth';

const MainContent: React.FC = () => {
  const { activePage, sbOpen, sbCollapsed } = useAppContext();
  const sidebarMargin = sbCollapsed ? 72 : 220;

  return (
    <div className="flex min-h-screen relative z-10">
      <Sidebar />
      <div 
        className={`flex-1 min-w-0 transition-[margin] duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] ${sbOpen ? '' : 'ml-0'}`}
        style={sbOpen ? { marginLeft: sidebarMargin } : undefined}
      >
        <Topbar />
        <UnitBar />
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'ranking' && <Ranking />}
        {activePage === 'anual' && <Anual />}
        {activePage === 'lancamento' && <Lancamento />}
        {activePage === 'pdi' && <PDI />}
        {activePage === 'config' && <Config />}
        {activePage === 'professores' && <Professores />}
        {activePage === 'instrucoes' && <Instrucoes />}
      </div>
    </div>
  );
};

export default function App() {
  const { session, isLoading, signIn } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[var(--txt2)]">
        Carregando autenticação...
      </div>
    );
  }

  if (!session) {
    return <Login onSubmit={signIn} />;
  }

  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
