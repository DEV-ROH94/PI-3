import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  User,
  Heart,
  LayoutDashboard
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import AIAssistant from './AIAssistant';
import { supabase } from '../lib/supabase';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Geral', path: '/dashboard' },
    { icon: FileText, label: 'Prontuários', path: '/dashboard/prontuarios' },
    { icon: Users, label: 'Assistidos', path: '/dashboard/assistidos' },
    { icon: BarChart3, label: 'Relatórios', path: '/dashboard/relatorios' },
    { icon: Settings, label: 'Configurações', path: '/dashboard/config' },
  ];

  return (
    <div className="flex min-h-screen bg-dark-bg text-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-[#0a0d14] flex flex-col fixed inset-y-0 left-0">
        <div className="p-8 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sm tracking-tight leading-none">Amor em Ação</h1>
            <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase mt-1">Gestão Social</p>
          </div>
        </div>

        <nav className="flex-grow px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) => `
                flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group
                ${isActive 
                  ? 'bg-primary-light/10 text-primary-light border border-primary-light/20' 
                  : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}
              `}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all group"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col ml-64 min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-gray-800 bg-[#0a0d14]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center bg-gray-900 border border-gray-800 rounded-lg px-4 py-1.5 w-64">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              className="bg-transparent text-sm border-none focus:ring-0 text-white placeholder-gray-600 w-full"
            />
          </div>

          <div className="flex items-center space-x-6">
            <button className="relative text-gray-500 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0d14]"></span>
            </button>
            <div className="h-4 w-px bg-gray-800"></div>
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="text-right">
                <p className="text-sm font-semibold group-hover:text-primary-light transition-colors">Dr. Assistente</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Coordenador</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-[10px] font-bold">
                DA
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="p-8 flex-grow">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      <AIAssistant />
    </div>
  );
}
