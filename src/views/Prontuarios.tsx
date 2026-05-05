import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  FileText, 
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  X,
  User,
  Activity,
  Calendar
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Prontuario {
  id: string;
  assistido_nome: string;
  status: string;
  data_entrada: string;
  risco_social: string;
  assistente_nome: string;
}

export default function Prontuarios() {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [prontuarios, setProntuarios] = useState<Prontuario[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [newNome, setNewNome] = useState('');
  const [newRisco, setNewRisco] = useState('Baixo');
  const [newAssistente, setNewAssistente] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('prontuarios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      setProntuarios([
        { id: '1', assistido_nome: 'Maria dos Santos Oliveira', status: 'Ativo', data_entrada: '2026-04-12', risco_social: 'Baixo', assistente_nome: 'Clara Mendes' },
        { id: '2', assistido_nome: 'João Ferreira da Silva', status: 'Pendente', data_entrada: '2026-04-10', risco_social: 'Médio', assistente_nome: 'Roberto Lima' },
        { id: '3', assistido_nome: 'Ana Paula Costa', status: 'Ativo', data_entrada: '2026-04-08', risco_social: 'Alto', assistente_nome: 'Clara Mendes' },
      ]);
    } else {
      setProntuarios(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Get user or session
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('prontuarios').insert({
      assistido_nome: newNome,
      risco_social: newRisco,
      assistente_nome: newAssistente || user?.user_metadata?.full_name || 'Assistente',
      user_id: user?.id,
      status: 'Ativo',
      data_entrada: new Date().toISOString().split('T')[0]
    });

    if (!error) {
       setIsModalOpen(false);
       setNewNome('');
       setNewAssistente('');
       fetchData();
    }
    setSaving(false);
  };

  const getRiscoColor = (risco: string) => {
    switch (risco) {
      case 'Urgente': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'Alto': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Médio': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-white">Prontuários Sociais</h1>
            <p className="text-gray-500 text-sm mt-1">Gerencie o histórico e acompanhamento de todos os assistidos.</p>
          </div>
          <div className="flex items-center space-x-3">
             <button className="flex items-center space-x-2 bg-gray-900 border border-gray-800 text-gray-400 px-4 py-2.5 rounded-xl text-sm font-bold hover:text-white transition-all">
                <Filter className="w-4 h-4" />
                <span>Filtrar</span>
             </button>
             <button 
               onClick={() => setIsModalOpen(true)}
               className="bg-primary-light hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm tracking-wide flex items-center space-x-2 transition-all shadow-lg shadow-primary-light/20"
             >
                <Plus className="w-4 h-4" />
                <span>Novo Prontuário</span>
             </button>
          </div>
        </header>

        {/* Search and Quick Filters */}
        <div className="bg-[#0a0d14] border border-gray-800 p-6 rounded-2xl space-y-6">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              <input 
                type="text" 
                placeholder="Pesquisar por nome, ID ou assistente..."
                className="w-full bg-dark-bg border border-gray-800 rounded-xl px-12 py-4 text-sm focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition-all text-white placeholder-gray-700"
              />
           </div>
           
           <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
              {['Todos', 'Ativos', 'Pendentes', 'Urgentes', 'Arquivados'].map((label) => (
                <button
                  key={label}
                  onClick={() => setActiveFilter(label)}
                  className={`
                    px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all
                    ${activeFilter === label 
                      ? 'bg-primary-light text-white shadow-lg shadow-primary-light/20' 
                      : 'bg-gray-900 text-gray-500 border border-gray-800 hover:text-gray-300'}
                  `}
                >
                  {label}
                </button>
              ))}
           </div>
        </div>

        {/* Data Grid */}
        <div className="bg-[#0a0d14] border border-gray-800 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/30 text-left">
                  <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">ID</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Assistido</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Data de Entrada</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Risco Social</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Assistente</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                   <tr>
                     <td colSpan={6} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center space-y-4">
                           <Loader2 className="w-8 h-8 text-primary-light animate-spin" />
                           <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Sincronizando Banco de Dados...</p>
                        </div>
                     </td>
                   </tr>
                ) : prontuarios.map((item, idx) => (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-primary-light/5 transition-colors group cursor-pointer"
                  >
                    <td className="px-8 py-5">
                       <span className="text-xs font-mono font-medium text-gray-500 group-hover:text-primary-light transition-colors">{item.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-bold uppercase transition-transform group-hover:scale-110">
                             {(item.assistido_nome || 'A').split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                             <p className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">{item.assistido_nome}</p>
                             <div className="flex items-center space-x-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Ativo' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{item.status}</span>
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-sm text-gray-400 font-medium">{new Date(item.data_entrada).toLocaleDateString('pt-BR')}</span>
                    </td>
                    <td className="px-8 py-5">
                       <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${getRiscoColor(item.risco_social)}`}>
                          {item.risco_social}
                       </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-400 font-medium">
                       {item.assistente_nome}
                    </td>
                    <td className="px-8 py-5 text-right">
                       <div className="flex items-center justify-end space-x-2">
                          <button className="p-2 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-all">
                             <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-all">
                             <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all">
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Criação */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-xl bg-[#0a0d14] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden"
             >
                <div className="p-8 border-b border-gray-800 flex items-center justify-between">
                   <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-light/10 flex items-center justify-center">
                         <Plus className="w-5 h-5 text-primary-light" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight">Novo Prontuário</h2>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                   </button>
                </div>

                <form onSubmit={handleCreate} className="p-8 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
                           <User className="w-3 h-3 mr-2" /> Nome do Assistido
                        </label>
                        <input 
                           required
                           value={newNome}
                           onChange={(e) => setNewNome(e.target.value)}
                           className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-light text-white"
                           placeholder="Ex: Maria José de Souza"
                        />
                      </div>

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

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
                           <Calendar className="w-3 h-3 mr-2" /> Assistente Responsável
                        </label>
                        <input 
                           value={newAssistente}
                           onChange={(e) => setNewAssistente(e.target.value)}
                           className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-light text-white"
                           placeholder="Deixe vazio para usar seu nome"
                        />
                      </div>
                   </div>

                   <div className="flex items-center space-x-4 pt-4">
                      <button 
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-grow bg-gray-900 hover:bg-gray-800 text-gray-400 py-4 rounded-xl font-bold uppercase tracking-widest transition-all"
                      >
                        Cancelar
                      </button>
                      <button 
                        disabled={saving}
                        type="submit"
                        className="flex-grow bg-primary-light hover:bg-blue-600 disabled:opacity-50 text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center space-x-2"
                      >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Criar Prontuário</span>}
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
