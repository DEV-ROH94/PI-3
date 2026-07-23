import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  X,
  User,
  Activity,
  Calendar,
  Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import React from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assistidosList, setAssistidosList] = useState<{id: string, nome: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Form State
  const [assistidoId, setAssistidoId] = useState('');
  const [newNome, setNewNome] = useState('');
  const [newRisco, setNewRisco] = useState('Baixo');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data } = await supabase.from('assistidos').select('id, nome').order('nome');
      if (data) setAssistidosList(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const isGuest = currentUser?.email === 'convidado@convidado.com';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    const selectedAssistido = assistidosList.find(a => a.id === assistidoId);
    const nomeToSave = selectedAssistido ? selectedAssistido.nome : newNome;

    if (!nomeToSave) {
      alert('Por favor, selecione um assistido ou digite o nome manualmente.');
      setSaving(false);
      return;
    }

    const payload: any = {
      assistido_nome: nomeToSave,
      risco_social: newRisco,
      assistente_nome: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Assistente',
      user_id: user?.id || null,
      status: 'Ativo',
      data_entrada: new Date().toISOString().split('T')[0]
    };

    if (assistidoId) {
      payload.assistido_id = assistidoId;
    }

    const { error } = await supabase.from('prontuarios').insert([payload]);

    if (!error) {
       setIsModalOpen(false);
       setNewNome('');
       setAssistidoId('');
       // Refresh stats after creating a new record
       const { count: assistidosCount } = await supabase.from('assistidos').select('*', { count: 'exact', head: true });
       const { count: prontuariosCount } = await supabase.from('prontuarios').select('*', { count: 'exact', head: true });
       const { count: criticosCount } = await supabase.from('prontuarios').select('*', { count: 'exact', head: true }).eq('risco_social', 'Urgente');
       
       setStats([
         { label: 'Assistências Ativas', value: (assistidosCount || 0).toString(), icon: Users, color: 'text-blue-500', trend: 'Novo' },
         { label: 'Prontuários Novos', value: (prontuariosCount || 0).toString(), icon: FileText, color: 'text-purple-500', trend: 'Novo' },
         { label: 'Casos Críticos', value: (criticosCount || 0).toString(), icon: AlertCircle, color: 'text-red-500', trend: 'Novo' },
         { label: 'Taxa de Sucesso', value: '100%', icon: TrendingUp, color: 'text-emerald-500', trend: 'Novo' },
       ]);

       // Refresh recent activities
       const { data: recent } = await supabase
         .from('prontuarios')
         .select('*')
         .order('created_at', { ascending: false })
         .limit(4);
       
       if (recent) {
         setRecentActivities(recent.map(r => ({
           type: 'Prontuário',
           detail: `Novo registro para: ${r.assistido_nome}`,
           time: new Date(r.created_at).toLocaleDateString(),
           status: r.status
         })));
       }
    } else {
       alert('Erro ao criar registro: ' + error.message);
    }
    setSaving(false);
  };

  const [stats, setStats] = useState([
    { label: 'Assistências Ativas', value: '0', icon: Users, color: 'text-blue-500', trend: '0%' },
    { label: 'Prontuários Novos', value: '0', icon: FileText, color: 'text-purple-500', trend: '0%' },
    { label: 'Casos Críticos', value: '0', icon: AlertCircle, color: 'text-red-500', trend: '0%' },
    { label: 'Taxa de Sucesso', value: '100%', icon: TrendingUp, color: 'text-emerald-500', trend: '0%' },
  ]);

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<{name: string, val: number}[]>([]);

  useEffect(() => {
    async function loadStats() {
      // 1. Fetch Totals
      const { count: assistidosCount } = await supabase.from('assistidos').select('*', { count: 'exact', head: true });
      const { count: prontuariosCount } = await supabase.from('prontuarios').select('*', { count: 'exact', head: true });
      const { count: criticosCount } = await supabase.from('prontuarios').select('*', { count: 'exact', head: true }).eq('risco_social', 'Urgente');
      
      setStats([
        { label: 'Assistências Ativas', value: (assistidosCount || 0).toString(), icon: Users, color: 'text-blue-500', trend: 'Novo' },
        { label: 'Prontuários Novos', value: (prontuariosCount || 0).toString(), icon: FileText, color: 'text-purple-500', trend: 'Novo' },
        { label: 'Casos Críticos', value: (criticosCount || 0).toString(), icon: AlertCircle, color: 'text-red-500', trend: 'Novo' },
        { label: 'Taxa de Sucesso', value: '100%', icon: TrendingUp, color: 'text-emerald-500', trend: 'Novo' },
      ]);

      // 2. Load recent records
      const { data: recent } = await supabase
        .from('prontuarios')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (recent) {
        setRecentActivities(recent.map(r => ({
          type: 'Prontuário',
          detail: `Novo registro para: ${r.assistido_nome}`,
          time: new Date(r.created_at).toLocaleDateString(),
          status: r.status
        })));
      }

      // 3. Calculate simple weekly stats (last 7 days)
      const days = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dayStr = d.toISOString().split('T')[0];
        days.push({ name: dayStr, val: 0, label: d.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase() });
      }

      const { data: weekData } = await supabase
        .from('prontuarios')
        .select('data_entrada')
        .gte('data_entrada', days[0].name);

      if (weekData) {
        weekData.forEach(r => {
          const day = days.find(d => d.name === r.data_entrada);
          if (day) day.val++;
        });
      }
      
      // Calculate max for normalization
      const max = Math.max(...days.map(d => d.val), 1);
      setWeeklyStats(days.map(d => ({ name: d.label, val: (d.val / (max + 2)) * 100 })));
    }
    loadStats();
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-white">Painel de Controle</h1>
            <p className="text-gray-500 text-sm mt-1">Bem-vindo, aqui está o resumo das atividades de hoje.</p>
          </div>
          {!isGuest && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary-light hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm tracking-wide flex items-center space-x-2 transition-all active:scale-[0.98] shadow-lg shadow-primary-light/20"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Registro</span>
            </button>
          )}
        </header>

        {/* Modal inside Dashboard for quick add */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-xl bg-[#0a0d14] border border-gray-800 rounded-3xl shadow-2xl p-8"
              >
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight">Registro Rápido</h2>
                   <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                   </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
                         <User className="w-3 h-3 mr-2" /> Selecionar Assistido
                      </label>
                      <select 
                         value={assistidoId}
                         onChange={(e) => setAssistidoId(e.target.value)}
                         className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-light text-white"
                      >
                         <option value="">-- Selecione uma pessoa --</option>
                         {assistidosList.map(a => (
                           <option key={a.id} value={a.id}>{a.nome}</option>
                         ))}
                      </select>
                   </div>

                   {assistidoId === '' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
                           <User className="w-3 h-3 mr-2" /> Ou Nome Manual
                        </label>
                        <input 
                           value={newNome}
                           onChange={(e) => setNewNome(e.target.value)}
                           className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-light text-white"
                           placeholder="Ex: Maria José de Souza"
                        />
                      </div>
                   )}

                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
                         <Activity className="w-3 h-3 mr-2" /> Risco Social
                      </label>
                      <select 
                         value={newRisco}
                         onChange={(e) => setNewRisco(e.target.value)}
                         className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-light text-white"
                      >
                         <option value="Baixo">Baixo</option>
                         <option value="Médio">Médio</option>
                         <option value="Alto">Alto</option>
                         <option value="Urgente">Urgente</option>
                      </select>
                   </div>

                   <button 
                      type="submit"
                      disabled={saving}
                      className="w-full bg-primary-light hover:bg-blue-600 disabled:opacity-50 text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary-light/20"
                   >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Criar Registro</span>}
                   </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#0a0d14] border border-gray-800 p-6 rounded-2xl relative overflow-hidden group hover:border-primary-light/30 transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center mb-4 ${stat.color} bg-opacity-10 transition-transform group-hover:scale-110`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{stat.label}</p>
              <div className="flex items-end justify-between mt-1">
                <h3 className="text-3xl font-display font-bold">{stat.value}</h3>
                <span className={`text-[10px] font-bold px-2 py-1 rounded bg-gray-900 border border-gray-800 flex items-center space-x-1 ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                   <span>{stat.trend}</span>
                   <ArrowUpRight className="w-2.5 h-2.5" />
                </span>
              </div>
              {/* Decorative line */}
              <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 w-0 group-hover:w-full ${stat.color.replace('text', 'bg')}`}></div>
            </motion.div>
          ))}
        </div>

        {/* Content Tabs area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Area placeholder */}
          <div className="lg:col-span-2 bg-[#0a0d14] border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display font-bold text-lg">Distribuição de Atendimentos</h3>
              <select className="bg-gray-900 border border-gray-800 rounded-lg text-xs font-bold px-4 py-2 hover:border-gray-700 transition-colors">
                <option>Últimos 7 dias</option>
                <option>Último mês</option>
              </select>
            </div>
            
            <div className="h-[300px] flex items-end justify-between px-4">
              {weeklyStats.map((item, i) => (
                <div key={i} className="flex flex-col items-center group">
                   <div className="relative">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${item.val || 5}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="w-10 bg-gradient-to-t from-primary to-primary-light rounded-t-lg group-hover:brightness-125 transition-all"
                      />
                   </div>
                   <span className="text-[10px] font-bold text-gray-500 mt-4">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-[#0a0d14] border border-gray-800 rounded-3xl p-8">
            <h3 className="font-display font-bold text-lg mb-6">Atividades Recentes</h3>
            <div className="space-y-6">
              {recentActivities.map((activity, idx) => (
                <div key={idx} className="flex space-x-4">
                  <div className="flex flex-col items-center py-1">
                    <div className="w-2 h-2 rounded-full bg-primary-light shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                    {idx !== recentActivities.length - 1 && <div className="w-px flex-grow bg-gray-800 mt-1"></div>}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{activity.type}</p>
                      <span className="text-[10px] font-medium text-gray-600 bg-gray-900 border border-gray-800 px-2 py-0.5 rounded uppercase">{activity.status}</span>
                    </div>
                    <p className="text-sm text-gray-200">{activity.detail}</p>
                    <p className="text-[10px] text-gray-500 flex items-center space-x-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{activity.time}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-6 py-3 border border-gray-800 rounded-xl text-xs font-bold text-gray-500 hover:text-white hover:bg-gray-800 transition-all uppercase tracking-widest leading-none">
              Ver Histórico Completo
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
