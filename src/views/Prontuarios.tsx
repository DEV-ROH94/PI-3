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
import React from 'react';
import { supabase } from '../lib/supabase';

interface EvolucaoEntry {
  data: string;
  tipo: string;
  descricao: string;
  profissional: string;
}

interface ArticulacaoRede {
  servico: string;
  motivo: string;
  retorno: string;
}

interface DocumentosAnexos {
  rg: boolean;
  cpf: boolean;
  comprovante_residencia: boolean;
  outros: string;
}

interface Prontuario {
  id: string;
  assistido_id: string | null;
  assistido_nome: string;
  status: string;
  data_entrada: string;
  risco_social: string;
  assistente_nome: string;
  assistente_cress: string;
  motivo_atendimento: string;
  historico_social: string;
  avaliacao_tecnica: string;
  plano_objetivos: string;
  plano_acoes: string;
  plano_encaminhamentos: string;
  evolucao: EvolucaoEntry[];
  articulacao_rede: ArticulacaoRede[];
  documentos_anexos: DocumentosAnexos;
  encerramento_data: string;
  encerramento_motivo: string;
  encerramento_sintese: string;
}

export default function Prontuarios() {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [prontuarios, setProntuarios] = useState<Prontuario[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assistidosList, setAssistidosList] = useState<{id: string, nome: string}[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('atendimento');
  
  // Form State
  const [assistidoId, setAssistidoId] = useState('');
  const [newNome, setNewNome] = useState('');
  const [newRisco, setNewRisco] = useState('Baixo');
  const [newAssistente, setNewAssistente] = useState('');
  const [assistenteCress, setAssistenteCress] = useState('');
  const [motivoAtendimento, setMotivoAtendimento] = useState('');
  const [historicoSocial, setHistoricoSocial] = useState('');
  const [avaliacaoTecnica, setAvaliacaoTecnica] = useState('');
  const [planoObjetivos, setPlanoObjetivos] = useState('');
  const [planoAcoes, setPlanoAcoes] = useState('');
  const [planoEncaminhamentos, setPlanoEncaminhamentos] = useState('');
  const [evolucao, setEvolucao] = useState<EvolucaoEntry[]>([]);
  const [articulacaoRede, setArticulacaoRede] = useState<ArticulacaoRede[]>([]);
  const [documentosAnexos, setDocumentosAnexos] = useState<DocumentosAnexos>({
    rg: false, cpf: false, comprovante_residencia: false, outros: ''
  });
  const [encerramentoData, setEncerramentoData] = useState('');
  const [encerramentoMotivo, setEncerramentoMotivo] = useState('');
  const [encerramentoSintese, setEncerramentoSintese] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Input Handlers
  const handleOnlyLetters = (value: string, setter: (val: string) => void) => {
    const lettersOnly = value.replace(/[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]/g, '');
    setter(lettersOnly);
  };

  const handleOnlyNumbers = (value: string, setter: (val: string) => void) => {
    const numbersOnly = value.replace(/\D/g, '');
    setter(numbersOnly);
  };

  const fetchData = async () => {
    setLoading(true);
    // Fetch Prontuarios
    const { data: pData, error: pError } = await supabase
      .from('prontuarios')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch Assistidos for the dropdown
    const { data: aData } = await supabase.from('assistidos').select('id, nome').order('nome');
    if (aData) setAssistidosList(aData);

    if (pError || !pData) {
      setProntuarios([]);
    } else {
      setProntuarios(pData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    // Find the name of the assistido from the ID
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
      assistente_nome: newAssistente || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Assistente',
      assistente_cress: assistenteCress,
      user_id: user?.id || null,
      status: encerramentoData ? 'Arquivado' : 'Ativo',
      motivo_atendimento: motivoAtendimento,
      historico_social: historicoSocial,
      avaliacao_tecnica: avaliacaoTecnica,
      plano_objetivos: planoObjetivos,
      plano_acoes: planoAcoes,
      plano_encaminhamentos: planoEncaminhamentos,
      evolucao,
      articulacao_rede: articulacaoRede,
      documentos_anexos: documentosAnexos,
      encerramento_data: encerramentoData || null,
      encerramento_motivo: encerramentoMotivo,
      encerramento_sintese: encerramentoSintese,
    };

    if (assistidoId) {
      payload.assistido_id = assistidoId;
    }

    if (!editingId) {
      payload.data_entrada = new Date().toISOString().split('T')[0];
    }

    let error;
    if (editingId) {
      const { error: err } = await supabase.from('prontuarios').update(payload).eq('id', editingId);
      error = err;
    } else {
      const { error: err } = await supabase.from('prontuarios').insert([payload]);
      error = err;
    }

    if (!error) {
       // Criar notificação
       try {
         await supabase.from('notificacoes').insert([{
           title: editingId ? 'Prontuário Atualizado' : 'Novo Prontuário',
           message: `Prontuário de ${nomeToSave} foi ${editingId ? 'atualizado' : 'criado'}.`,
           type: 'info',
           user_id: user?.id
         }]);
       } catch (e) {
         console.error('Erro ao criar notificação:', e);
       }

       setIsModalOpen(false);
       resetForm();
       fetchData();
    } else {
       alert('Erro ao salvar prontuário: ' + error.message);
    }
    setSaving(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setAssistidoId('');
    setNewNome('');
    setNewAssistente('');
    setAssistenteCress('');
    setNewRisco('Baixo');
    setMotivoAtendimento('');
    setHistoricoSocial('');
    setAvaliacaoTecnica('');
    setPlanoObjetivos('');
    setPlanoAcoes('');
    setPlanoEncaminhamentos('');
    setEvolucao([]);
    setArticulacaoRede([]);
    setDocumentosAnexos({ rg: false, cpf: false, comprovante_residencia: false, outros: '' });
    setEncerramentoData('');
    setEncerramentoMotivo('');
    setEncerramentoSintese('');
    setActiveTab('atendimento');
  };

  const handleEdit = (item: Prontuario) => {
    setEditingId(item.id);
    setAssistidoId(item.assistido_id || '');
    setNewNome(item.assistido_nome);
    setNewRisco(item.risco_social);
    setNewAssistente(item.assistente_nome || '');
    setAssistenteCress(item.assistente_cress || '');
    setMotivoAtendimento(item.motivo_atendimento || '');
    setHistoricoSocial(item.historico_social || '');
    setAvaliacaoTecnica(item.avaliacao_tecnica || '');
    setPlanoObjetivos(item.plano_objetivos || '');
    setPlanoAcoes(item.plano_acoes || '');
    setPlanoEncaminhamentos(item.plano_encaminhamentos || '');
    setEvolucao(item.evolucao || []);
    setArticulacaoRede(item.articulacao_rede || []);
    setDocumentosAnexos(item.documentos_anexos || { rg: false, cpf: false, comprovante_residencia: false, outros: '' });
    setEncerramentoData(item.encerramento_data || '');
    setEncerramentoMotivo(item.encerramento_motivo || '');
    setEncerramentoSintese(item.encerramento_sintese || '');
    setIsModalOpen(true);
  };

  const addEvolucao = () => {
    setEvolucao([...evolucao, { data: new Date().toISOString().split('T')[0], tipo: '', descricao: '', profissional: newAssistente }]);
  };

  const updateEvolucao = (index: number, field: keyof EvolucaoEntry, value: string) => {
    const newList = [...evolucao];
    newList[index][field] = value;
    setEvolucao(newList);
  };

  const addArticulacao = () => {
    setArticulacaoRede([...articulacaoRede, { servico: '', motivo: '', retorno: '' }]);
  };

  const updateArticulacao = (index: number, field: keyof ArticulacaoRede, value: string) => {
    const newList = [...articulacaoRede];
    newList[index][field] = value;
    setArticulacaoRede(newList);
  };

  const handleDelete = async (id: string) => {
    try {
      if (!confirm('Deseja realmente excluir este prontuário? Esta ação não pode ser desfeita.')) return;

      setDeletingId(id);
      
      const { error } = await supabase
        .from('prontuarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchData();
      
      // Criar notificação de exclusão (opcional/fundo)
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase.from('notificacoes').insert([{
            title: 'Prontuário Removido',
            message: `Um prontuário foi removido do sistema.`,
            type: 'warning',
            user_id: user.id
          }]).then(() => {});
        }
      });

      alert('Prontuário excluído com sucesso!');
    } catch (error: any) {
      alert('Erro ao excluir prontuário: ' + (error.message || 'Erro desconhecido'));
      console.error('Falha na exclusão:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProntuarios = prontuarios.filter(p => {
    const matchesSearch = 
      p.assistido_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.assistente_nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'Todos') return matchesSearch;
    if (activeFilter === 'Ativos') return matchesSearch && p.status === 'Ativo';
    if (activeFilter === 'Pendentes') return matchesSearch && p.status === 'Pendente';
    if (activeFilter === 'Urgentes') return matchesSearch && p.risco_social === 'Urgente';
    if (activeFilter === 'Arquivados') return matchesSearch && p.status === 'Arquivado';
    return matchesSearch;
  });

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                ) : filteredProntuarios.map((item, idx) => (
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
                          <button 
                            disabled={deletingId === item.id}
                            onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                            className="p-2 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-all disabled:opacity-50"
                          >
                             <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            disabled={deletingId === item.id}
                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all disabled:opacity-50"
                          >
                             {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
               className="relative w-full max-w-5xl bg-[#0a0d14] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
             >
                <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-dark-bg/50">
                   <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-light/10 flex items-center justify-center">
                         {editingId ? <Edit className="w-5 h-5 text-primary-light" /> : <Plus className="w-5 h-5 text-primary-light" />}
                      </div>
                      <div>
                        <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight">
                           {editingId ? 'Editar Prontuário' : 'Novo Prontuário'}
                        </h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Prontuário de Atendimento – Assistência Social</p>
                      </div>
                   </div>
                   <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-gray-500 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                   </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-800 px-6 bg-dark-bg/30 overflow-x-auto scrollbar-hide">
                  {[
                    { id: 'atendimento', label: '1. Atendimento' },
                    { id: 'avaliacao', label: '2. Avaliação' },
                    { id: 'plano', label: '3. Plano' },
                    { id: 'evolucao', label: '4. Evolução' },
                    { id: 'rede', label: '5. Rede/Docs' },
                    { id: 'encerramento', label: '6. Encerramento' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 flex-shrink-0 ${
                        activeTab === tab.id 
                          ? 'border-primary-light text-primary-light' 
                          : 'border-transparent text-gray-600 hover:text-gray-400'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleCreate} className="flex-grow overflow-y-auto p-8 space-y-6">
                   {activeTab === 'atendimento' && (
                     <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
                               <User className="w-3 h-3 mr-2 text-primary-light" /> Selecionar Assistido
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

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
                               <Activity className="w-3 h-3 mr-2 text-primary-light" /> Risco Social
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
                             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Assistente Responsável</label>
                             <input 
                                value={newAssistente}
                                onChange={(e) => handleOnlyLetters(e.target.value, setNewAssistente)}
                                className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white"
                                placeholder="Nome do assistente"
                             />
                          </div>

                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">CRESS do Profissional</label>
                             <input 
                                value={assistenteCress}
                                onChange={(e) => handleOnlyNumbers(e.target.value, setAssistenteCress)}
                                className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white"
                                placeholder="Número do CRESS"
                             />
                          </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Motivo do Atendimento</label>
                           <textarea 
                              value={motivoAtendimento}
                              onChange={(e) => setMotivoAtendimento(e.target.value)}
                              className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white h-24"
                              placeholder="Descreva o motivo principal do atendimento..."
                           />
                        </div>
                     </motion.div>
                   )}

                   {activeTab === 'avaliacao' && (
                     <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Histórico Social</label>
                           <textarea 
                              value={historicoSocial}
                              onChange={(e) => setHistoricoSocial(e.target.value)}
                              className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white h-40"
                              placeholder="Relato detalhado da trajetória do assistido/família..."
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Avaliação Técnica</label>
                           <textarea 
                              value={avaliacaoTecnica}
                              onChange={(e) => setAvaliacaoTecnica(e.target.value)}
                              className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white h-40"
                              placeholder="Parecer técnico do profissional sobre a situação..."
                           />
                        </div>
                     </motion.div>
                   )}

                   {activeTab === 'plano' && (
                     <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Objetivos</label>
                           <textarea 
                              value={planoObjetivos}
                              onChange={(e) => setPlanoObjetivos(e.target.value)}
                              className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white h-24"
                              placeholder="O que se pretende alcançar com este acompanhamento..."
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ações</label>
                           <textarea 
                              value={planoAcoes}
                              onChange={(e) => setPlanoAcoes(e.target.value)}
                              className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white h-24"
                              placeholder="Passos e intervenções planejadas..."
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Encaminhamentos</label>
                           <textarea 
                              value={planoEncaminhamentos}
                              onChange={(e) => setPlanoEncaminhamentos(e.target.value)}
                              className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white h-24"
                              placeholder="Rede externa, benefícios, documentação..."
                           />
                        </div>
                     </motion.div>
                   )}

                   {activeTab === 'evolucao' && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Evolução do Caso / Registros</label>
                          <button 
                            type="button" 
                            onClick={addEvolucao}
                            className="bg-primary-light/10 text-primary-light hover:bg-primary-light hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all"
                          >
                            + Novo Registro
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                           {evolucao.map((entry, idx) => (
                             <div key={idx} className="bg-dark-bg border border-gray-800 rounded-2xl p-6 relative group">
                                <button 
                                  type="button"
                                  onClick={() => setEvolucao(evolucao.filter((_, i) => i !== idx))}
                                  className="absolute top-4 right-4 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                   <div className="space-y-1">
                                      <label className="text-[10px] text-gray-600 uppercase font-bold">Data</label>
                                      <input 
                                         type="date"
                                         value={entry.data}
                                         onChange={(e) => updateEvolucao(idx, 'data', e.target.value)}
                                         className="w-full bg-[#0a0d14] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                                      />
                                   </div>
                                   <div className="space-y-1">
                                      <label className="text-[10px] text-gray-600 uppercase font-bold">Tipo de Atendimento</label>
                                      <input 
                                         value={entry.tipo}
                                         onChange={(e) => {
                                           const val = e.target.value.replace(/[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]/g, '');
                                           updateEvolucao(idx, 'tipo', val);
                                         }}
                                         className="w-full bg-[#0a0d14] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                                         placeholder="Ex: Visita, Reunião, etc."
                                      />
                                   </div>
                                   <div className="space-y-1">
                                      <label className="text-[10px] text-gray-600 uppercase font-bold">Profissional</label>
                                      <input 
                                         value={entry.profissional}
                                         onChange={(e) => {
                                           const val = e.target.value.replace(/[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]/g, '');
                                           updateEvolucao(idx, 'profissional', val);
                                         }}
                                         className="w-full bg-[#0a0d14] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                                      />
                                   </div>
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[10px] text-gray-600 uppercase font-bold">Descrição da Evolução</label>
                                   <textarea 
                                      value={entry.descricao}
                                      onChange={(e) => updateEvolucao(idx, 'descricao', e.target.value)}
                                      className="w-full bg-[#0a0d14] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white h-24"
                                   />
                                </div>
                             </div>
                           ))}
                        </div>
                      </motion.div>
                   )}

                   {activeTab === 'rede' && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                         <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Articulação com a Rede</label>
                              <button 
                                type="button" 
                                onClick={addArticulacao}
                                className="bg-primary-light/10 text-primary-light hover:bg-primary-light hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all"
                              >
                                + Novo Encaminhamento
                              </button>
                            </div>
                            <div className="space-y-4">
                               {articulacaoRede.map((item, idx) => (
                                 <div key={idx} className="bg-dark-bg border border-gray-800 rounded-2xl p-4 gap-4 grid grid-cols-1 md:grid-cols-3 relative">
                                    <div className="space-y-1">
                                       <label className="text-[10px] text-gray-600 uppercase font-bold">Serviço/Órgão</label>
                                       <input 
                                         value={item.servico}
                                         onChange={(e) => updateArticulacao(idx, 'servico', e.target.value)}
                                         className="w-full bg-[#0a0d14] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                                         placeholder="Ex: CRAS, CREAS, Saúde..."
                                       />
                                    </div>
                                    <div className="space-y-1">
                                       <label className="text-[10px] text-gray-600 uppercase font-bold">Motivo</label>
                                       <input 
                                         value={item.motivo}
                                         onChange={(e) => updateArticulacao(idx, 'motivo', e.target.value)}
                                         className="w-full bg-[#0a0d14] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                                       />
                                    </div>
                                    <div className="space-y-1">
                                       <label className="text-[10px] text-gray-600 uppercase font-bold">Retorno do Serviço</label>
                                       <input 
                                         value={item.retorno}
                                         onChange={(e) => updateArticulacao(idx, 'retorno', e.target.value)}
                                         className="w-full bg-[#0a0d14] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                                       />
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>

                         <div className="space-y-4">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Documentos Anexados</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               {[
                                 { id: 'rg', label: 'Cópia de RG/CPF' },
                                 { id: 'cpf', label: 'Cópia de NIS' },
                                 { id: 'comprovante_residencia', label: 'Comp. de Residência' }
                               ].map(doc => (
                                 <label key={doc.id} className="flex items-center space-x-3 bg-dark-bg border border-gray-800 p-4 rounded-xl cursor-pointer hover:border-primary-light/50 transition-all">
                                    <input 
                                      type="checkbox"
                                      checked={(documentosAnexos as any)[doc.id]}
                                      onChange={(e) => setDocumentosAnexos({...documentosAnexos, [doc.id]: e.target.checked})}
                                      className="w-4 h-4 rounded border-gray-800 bg-[#0a0d14] text-primary-light"
                                    />
                                    <span className="text-xs text-gray-300 font-medium uppercase tracking-tight">{doc.label}</span>
                                 </label>
                               ))}
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] text-gray-600 uppercase font-bold">Outros Documentos</label>
                               <input 
                                 value={documentosAnexos.outros}
                                 onChange={(e) => setDocumentosAnexos({...documentosAnexos, outros: e.target.value})}
                                 className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white"
                                 placeholder="Descreva outros documentos..."
                               />
                            </div>
                         </div>
                      </motion.div>
                   )}

                   {activeTab === 'encerramento' && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Data de Encerramento</label>
                             <input 
                                type="date"
                                value={encerramentoData}
                                onChange={(e) => setEncerramentoData(e.target.value)}
                                className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white"
                             />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Motivo do Encerramento</label>
                             <input 
                                value={encerramentoMotivo}
                                onChange={(e) => setEncerramentoMotivo(e.target.value)}
                                className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white"
                                placeholder="Ex: Metas atingidas, Mudança..."
                             />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Síntese de encerramento</label>
                           <textarea 
                              value={encerramentoSintese}
                              onChange={(e) => setEncerramentoSintese(e.target.value)}
                              className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white h-40"
                              placeholder="Resumo geral do caso e justificativa do encerramento..."
                           />
                        </div>
                      </motion.div>
                   )}
                </form>

                <div className="p-6 border-t border-gray-800 bg-dark-bg/50 flex items-center justify-between">
                   <div className="flex items-center space-x-2">
                     <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest mr-2">Progresso</span>
                     {['atendimento', 'avaliacao', 'plano', 'evolucao', 'rede', 'encerramento'].map(t => (
                       <div key={t} className={`w-2 h-2 rounded-full ${activeTab === t ? 'bg-primary-light' : 'bg-gray-800'}`} />
                     ))}
                   </div>
                   <div className="flex items-center space-x-4">
                       <button 
                         type="button"
                         onClick={() => { setIsModalOpen(false); resetForm(); }}
                         className="bg-gray-900 border border-gray-800 text-gray-500 px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:text-white transition-all"
                       >
                         Cancelar
                       </button>
                       <button 
                         onClick={handleCreate}
                         disabled={saving}
                         type="button"
                         className="bg-primary-light hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary-light/20"
                       >
                         {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{editingId ? 'Salvar Histórico' : 'Cadastrar Prontuário'}</span>}
                       </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
