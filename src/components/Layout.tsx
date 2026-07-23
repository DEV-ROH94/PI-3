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
  Check,
  Info,
  AlertCircle,
  X,
  Loader2,
  Heart,
  LayoutDashboard
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import AIAssistant from './AIAssistant';
import { supabase } from '../lib/supabase';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LayoutProps {
  children: ReactNode;
}

interface Notification {
  id: string;
  created_at: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<{name: string, initials: string} | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
        const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
        setUser({ name, initials });
        fetchNotifications(user.id);
      } else {
        setUser({ name: 'Convidado', initials: 'CV' });
      }
    }
    getUser();

    // Real-time listener for notifications
    const channel = supabase
      .channel('notificacoes_realtime')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notificacoes' 
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 5));
      })
      .subscribe();

    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async (userId?: string) => {
    setLoadingNotifications(true);
    try {
      let query = supabase.from('notificacoes').select('*').order('created_at', { ascending: false }).limit(5);
      if (userId) query = query.eq('user_id', userId);
      
      const { data, error } = await query;
      if (data) setNotifications(data);
      if (error) console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase.from('notificacoes').update({ read: true }).eq('id', id);
    if (!error) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

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
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-lg transition-colors ${showNotifications ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'}`}
              >
                <Bell className="w-5 h-5" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0d14] animate-pulse"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-[#0d111a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-[#0a0d14]/50">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Notificações</h3>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="p-1 hover:bg-gray-800 rounded-md text-gray-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {loadingNotifications ? (
                        <div className="p-8 flex flex-col items-center justify-center space-y-3">
                          <Loader2 className="w-6 h-6 text-primary-light animate-spin" />
                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Carregando...</span>
                        </div>
                      ) : notifications.length > 0 ? (
                        <div className="divide-y divide-gray-800/50">
                          {notifications.map((item) => (
                            <div 
                              key={item.id}
                              onClick={() => !item.read && markAsRead(item.id)}
                              className={`p-4 transition-colors cursor-pointer group hover:bg-gray-800/40 ${!item.read ? 'bg-primary/5' : ''}`}
                            >
                              <div className="flex space-x-3">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${
                                  item.type === 'success' ? 'bg-green-500/10 text-green-400' :
                                  item.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                                  'bg-blue-500/10 text-blue-400'
                                }`}>
                                  {item.type === 'success' ? <Check className="w-4 h-4" /> :
                                   item.type === 'warning' ? <AlertCircle className="w-4 h-4" /> :
                                   <Info className="w-4 h-4" />}
                                </div>
                                <div className="flex-grow space-y-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className={`text-sm font-semibold transition-colors ${!item.read ? 'text-white' : 'text-gray-400'}`}>
                                      {item.title}
                                    </h4>
                                    {!item.read && (
                                      <div className="w-1.5 h-1.5 bg-primary-light rounded-full"></div>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                    {item.message}
                                  </p>
                                  <span className="text-[10px] text-gray-600 font-medium block pt-1">
                                    {format(new Date(item.created_at), "HH:mm '•' d 'de' MMM", { locale: ptBR })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 flex flex-col items-center justify-center space-y-4 text-center">
                          <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-gray-700">
                             <Bell className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-400">Tudo limpo!</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Nenhuma notificação nova</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3 border-t border-gray-800 bg-[#0a0d14]/50">
                      <button 
                        onClick={() => navigate('/dashboard/config')}
                        className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest rounded-lg transition-all border border-gray-800/50"
                      >
                        Ver todas as configurações
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="h-4 w-px bg-gray-800"></div>
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="text-right">
                <p className="text-sm font-semibold group-hover:text-primary-light transition-colors">{user?.name || 'Carregando...'}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Coordenador</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-[10px] font-bold text-white">
                {user?.initials || '--'}
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
