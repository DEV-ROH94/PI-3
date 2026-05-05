import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Database, 
  LogOut,
  Save,
  Loader2,
  CheckCircle2,
  Download
} from 'lucide-react';
import { useState, useEffect } from 'react';
import React from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Configuracoes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('Perfil');
  
  // Profile state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  // Settings state (mock implementation for persistence)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('app_settings');
    return saved ? JSON.parse(saved) : {
      notifications: true,
      urgentEmails: true,
      offlineSync: false,
      twoFactor: false
    };
  });

  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFullName(user.user_metadata?.full_name || '');
        setEmail(user.email || '');
      }
    }
    loadUser();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });

    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const tabs = [
    { id: 'Perfil', icon: User, label: 'Perfil do Usuário' },
    { id: 'Notificações', icon: Bell, label: 'Notificações' },
    { id: 'Segurança', icon: Shield, label: 'Segurança' },
    { id: 'DADOS', icon: Database, label: 'Backup e Dados' },
  ];

  const handleExportBackup = async () => {
    setLoading(true);
    try {
      const { data: assistidos } = await supabase.from('assistidos').select('*');
      const { data: prontuarios } = await supabase.from('prontuarios').select('*');
      const { data: atividades } = await supabase.from('atividades').select('*');

      const backupData = {
        exportDate: new Date().toISOString(),
        assistidos: assistidos || [],
        prontuarios: prontuarios || [],
        atividades: atividades || []
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_social_amor_em_acao_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar backup:', error);
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (confirm('ATENÇÃO: Isso excluirá permanentEMENTE todos os seus assistidos, prontuários e registros. Esta ação não pode ser desfeita. Deseja continuar?')) {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      // Delete all user data via RLS or manual delete
      await supabase.from('prontuarios').delete().eq('user_id', user?.id);
      await supabase.from('assistidos').delete().eq('user_id', user?.id);
      await supabase.from('atividades').delete().eq('user_id', user?.id);
      
      await supabase.auth.signOut();
      navigate('/login');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <header>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Configurações do Sistema</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie seu perfil, preferências e segurança da conta.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Sidebar Tabs */}
          <aside className="space-y-2">
             {tabs.map((item) => (
               <button
                 key={item.id}
                 onClick={() => setActiveTab(item.id)}
                 className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-primary-light text-white shadow-lg shadow-primary-light/20' : 'text-gray-500 hover:text-gray-200'}`}
               >
                 <item.icon className="w-4 h-4" />
                 <span>{item.label}</span>
               </button>
             ))}
             
             <div className="pt-8">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-sm font-bold uppercase tracking-widest text-red-500/70 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair da Conta</span>
                </button>
             </div>
          </aside>

          {/* Form Content */}
          <main className="md:col-span-2 space-y-8">
             {activeTab === 'Perfil' && (
               <motion.div 
                 initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                 className="bg-[#0a0d14] border border-gray-800 rounded-3xl p-8 space-y-8"
               >
                  <div className="flex items-center space-x-4 mb-4">
                     <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary-light border border-primary/20">
                        <User className="w-8 h-8" />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-white">Informações Pessoais</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Gerencie sua identidade no sistema</p>
                     </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Nome Completo</label>
                        <input 
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-4 text-sm text-white focus:ring-2 focus:ring-primary-light transition-all"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">E-mail de Trabalho (Inalterável)</label>
                        <input 
                          type="email"
                          disabled
                          value={email}
                          className="w-full bg-dark-bg/50 border border-gray-800 rounded-xl px-4 py-4 text-sm text-gray-500 cursor-not-allowed"
                        />
                     </div>

                     <div className="pt-6 border-t border-gray-900 flex items-center justify-between">
                        <p className="text-[10px] text-gray-500 font-medium max-w-[200px]">Estas informações aparecerão nos prontuários e relatórios que você gerar.</p>
                        <button 
                          disabled={loading}
                          type="submit"
                          className="bg-primary-light hover:bg-blue-600 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest flex items-center space-x-2 transition-all shadow-lg shadow-primary-light/20"
                        >
                           {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                            success ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                           <span>{success ? 'Salvo!' : loading ? 'Salvando...' : 'Salvar Perfil'}</span>
                        </button>
                     </div>
                  </form>
               </motion.div>
             )}

             {activeTab === 'Notificações' && (
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#0a0d14] border border-gray-800 rounded-3xl p-8 space-y-6">
                 <h3 className="text-lg font-bold text-white mb-6">Preferências de Notificação</h3>
                 <div className="space-y-4">
                   {[
                     { id: 'notifications', label: 'Notificações no Navegador' },
                     { id: 'urgentEmails', label: 'E-mails de Alerta Urgente' },
                   ].map((item) => (
                     <div key={item.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800/50">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.label}</span>
                        <button 
                          onClick={() => setSettings((s: any) => ({ ...s, [item.id]: !s[item.id] }))}
                          className={`w-10 h-5 rounded-full relative transition-colors ${settings[item.id as keyof typeof settings] ? 'bg-primary-light' : 'bg-gray-700'}`}
                        >
                           <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings[item.id as keyof typeof settings] ? 'right-1' : 'left-1'}`}></div>
                        </button>
                     </div>
                   ))}
                 </div>
               </motion.div>
             )}

             {activeTab === 'Segurança' && (
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#0a0d14] border border-gray-800 rounded-3xl p-8 space-y-6">
                 <h3 className="text-lg font-bold text-white mb-6">Segurança e Autenticação</h3>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800/50">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Autenticação em Duas Etapas</span>
                        <button 
                          onClick={() => setSettings((s: any) => ({ ...s, twoFactor: !s.twoFactor }))}
                          className={`w-10 h-5 rounded-full relative transition-colors ${settings.twoFactor ? 'bg-primary-light' : 'bg-gray-700'}`}
                        >
                           <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.twoFactor ? 'right-1' : 'left-1'}`}></div>
                        </button>
                    </div>
                    <button className="w-full py-4 border border-gray-800 rounded-xl text-xs font-bold text-gray-500 hover:text-white hover:bg-gray-800 transition-all uppercase tracking-widest">Alterar Senha de Acesso</button>
                 </div>
               </motion.div>
             )}

             {activeTab === 'DADOS' && (
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#0a0d14] border border-gray-800 rounded-3xl p-8 space-y-6">
                 <div className="flex items-center space-x-2 mb-4">
                    <Database className="w-5 h-5 text-primary-light" />
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">Cuidado com os Dados</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800/50 flex items-center justify-between">
                        <div className="space-y-1">
                           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sincronização Offline</p>
                           <p className="text-[10px] text-gray-600">Permite trabalhar sem internet ativamente</p>
                        </div>
                        <button 
                          onClick={() => setSettings((s: any) => ({ ...s, offlineSync: !s.offlineSync }))}
                          className={`w-10 h-5 rounded-full relative transition-colors ${settings.offlineSync ? 'bg-primary-light' : 'bg-gray-700'}`}
                        >
                           <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.offlineSync ? 'right-1' : 'left-1'}`}></div>
                        </button>
                    </div>
                    
                    <button 
                      onClick={handleExportBackup}
                      disabled={loading}
                      className="py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                       {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                       <span>Exportar Backup Completo (JSON)</span>
                    </button>

                    <button 
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="py-4 border border-red-500/20 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                       Excluir Permanentemente Meus Dados
                    </button>
                 </div>
               </motion.div>
             )}
          </main>
        </div>
      </div>
    </Layout>
  );
}
