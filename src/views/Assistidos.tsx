import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  User, 
  Phone, 
  MapPin, 
  Mail, 
  X, 
  Loader2,
  Filter
} from 'lucide-react';
import { useState, useEffect } from 'react';
import React from 'react';
import { supabase } from '../lib/supabase';

interface FamilyMember {
  nome: string;
  idade: string;
  parentesco: string;
  escolaridade: string;
  ocupacao: string;
}

interface Assistido {
  id: string;
  nome: string;
  cpf: string;
  rg: string;
  nis: string;
  data_nascimento: string;
  telefone: string;
  endereco: string;
  status: string;
  responsavel_familiar: string;
  composicao_familiar: FamilyMember[];
  situacao_trabalho: string;
  renda_familiar: string;
  escolaridade: string;
  condicoes_moradia: string;
  beneficios_sociais: string;
}

export default function Assistidos() {
  const [assistidos, setAssistidos] = useState<Assistido[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'familia' | 'socio'>('info');
  
  // Form State
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [nis, setNis] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [responsavelFamiliar, setResponsavelFamiliar] = useState('');
  const [composicaoFamiliar, setComposicaoFamiliar] = useState<FamilyMember[]>([]);
  const [situacaoTrabalho, setSituacaoTrabalho] = useState('');
  const [rendaFamiliar, setRendaFamiliar] = useState('');
  const [escolaridade, setEscolaridade] = useState('');
  const [condicoesMoradia, setCondicoesMoradia] = useState('');
  const [beneficiosSociais, setBeneficiosSociais] = useState('');
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

  const fetchAssistidos = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    const { data, error } = await supabase
      .from('assistidos')
      .select('*')
      .order('nome');

    if (!error && data) {
      setAssistidos(data);
    } else {
      setAssistidos([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssistidos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) return;
    setSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const payload = {
      nome,
      data_nascimento: dataNascimento || null,
      cpf,
      rg,
      nis,
      telefone,
      endereco,
      responsavel_familiar: responsavelFamiliar,
      composicao_familiar: composicaoFamiliar,
      situacao_trabalho: situacaoTrabalho,
      renda_familiar: rendaFamiliar,
      escolaridade,
      condicoes_moradia: condicoesMoradia,
      beneficios_sociais: beneficiosSociais,
      user_id: user?.id
    };

    let error;
    if (editingId) {
      const { error: err } = await supabase.from('assistidos').update(payload).eq('id', editingId);
      error = err;
    } else {
      const { error: err } = await supabase.from('assistidos').insert([payload]);
      error = err;
    }

    if (!error) {
      // Criar notificação
      try {
        await supabase.from('notificacoes').insert([{
          title: editingId ? 'Assistido Atualizado' : 'Novo Assistido',
          message: `${nome} foi ${editingId ? 'atualizado' : 'cadastrado'} no sistema.`,
          type: 'success',
          user_id: user?.id
        }]);
      } catch (e) {
        console.error('Erro ao criar notificação:', e);
      }

      setIsModalOpen(false);
      resetForm();
      fetchAssistidos();
    } else {
      alert('Erro ao salvar assistido: ' + error.message);
    }
    setSaving(false);
  };

  const handleEdit = (assistido: Assistido) => {
    setEditingId(assistido.id);
    setNome(assistido.nome);
    setDataNascimento(assistido.data_nascimento || '');
    setCpf(assistido.cpf || '');
    setRg(assistido.rg || '');
    setNis(assistido.nis || '');
    setTelefone(assistido.telefone || '');
    setEndereco(assistido.endereco || '');
    setResponsavelFamiliar(assistido.responsavel_familiar || '');
    setComposicaoFamiliar(assistido.composicao_familiar || []);
    setSituacaoTrabalho(assistido.situacao_trabalho || '');
    setRendaFamiliar(assistido.renda_familiar || '');
    setEscolaridade(assistido.escolaridade || '');
    setCondicoesMoradia(assistido.condicoes_moradia || '');
    setBeneficiosSociais(assistido.beneficios_sociais || '');
    setIsModalOpen(true);
  };

  const addFamilyMember = () => {
    setComposicaoFamiliar([...composicaoFamiliar, { nome: '', idade: '', parentesco: '', escolaridade: '', ocupacao: '' }]);
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: string) => {
    const newList = [...composicaoFamiliar];
    newList[index][field] = value;
    setComposicaoFamiliar(newList);
  };

  const removeFamilyMember = (index: number) => {
    setComposicaoFamiliar(composicaoFamiliar.filter((_, i) => i !== index));
  };

  const handleDelete = async (id: string) => {
    try {
      if (isGuest) return;
      if (!confirm('Deseja realmente excluir este assistido? Isso também excluirá permanentemente todos os seus prontuários vinculados.')) return;

      setDeletingId(id);
      const { error } = await supabase
        .from('assistidos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchAssistidos();
      
      // Criar notificação de exclusão (fundo)
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase.from('notificacoes').insert([{
            title: 'Registro Excluído',
            message: `O assistido foi removido permanentemente do sistema.`,
            type: 'warning',
            user_id: user.id
          }]).then(() => {});
        }
      });

      alert('Assistido excluído com sucesso!');
    } catch (error: any) {
      alert('Erro ao excluir assistido: ' + (error.message || 'Erro desconhecido'));
      console.error('Falha na exclusão (assistidos):', error);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAssistidos = assistidos.filter(a => 
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.cpf && a.cpf.includes(searchTerm))
  );

  const resetForm = () => {
    setEditingId(null);
    setNome('');
    setDataNascimento('');
    setCpf('');
    setRg('');
    setNis('');
    setTelefone('');
    setEndereco('');
    setResponsavelFamiliar('');
    setComposicaoFamiliar([]);
    setSituacaoTrabalho('');
    setRendaFamiliar('');
    setEscolaridade('');
    setCondicoesMoradia('');
    setBeneficiosSociais('');
    setActiveTab('info');
  };

  const isGuest = currentUser?.email === 'convidado@convidado.com';

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">Famílias Assistidas</h1>
            <p className="text-gray-500 text-sm mt-1">Gerencie o cadastro de pessoas atendidas pelo programa.</p>
          </div>
          {!isGuest && (
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-primary-light hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all shadow-lg shadow-primary-light/20"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Cadastro</span>
            </button>
          )}
        </header>

        <div className="bg-[#0a0d14] border border-gray-800 p-6 rounded-2xl flex flex-col md:flex-row gap-4">
           <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por nome ou CPF..."
                className="w-full bg-dark-bg border border-gray-800 rounded-xl px-12 py-4 text-sm focus:ring-2 focus:ring-primary-light text-white"
              />
           </div>
           <button className="bg-gray-900 border border-gray-800 text-gray-500 px-6 py-4 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 hover:text-white transition-all">
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-20 flex flex-col items-center space-y-4">
               <Loader2 className="w-10 h-10 text-primary-light animate-spin" />
               <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Carregando Assistidos...</p>
            </div>
          ) : filteredAssistidos.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-[#0a0d14] border border-gray-800 rounded-2xl p-6 group hover:border-primary-light/50 transition-all relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="w-6 h-6 text-primary-light outline-none" />
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isGuest && (
                    <>
                      <button 
                        disabled={deletingId === item.id}
                        onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                        className="p-2 bg-gray-900 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        disabled={deletingId === item.id}
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        className="p-2 bg-gray-900 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-display font-bold text-white mb-4">{item.nome}</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-xs text-gray-400">
                  <Phone className="w-3 h-3 text-primary-light" />
                  <span>{item.telefone || 'Não informado'}</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-400">
                  <MapPin className="w-3 h-3 text-primary-light" />
                  <span className="truncate">{item.endereco || 'Sem endereço'}</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-400">
                  <Mail className="w-3 h-3 text-primary-light" />
                  <span>CPF: {item.cpf || 'Não informado'}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-900 flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {item.status}
                 </span>
                 <button className="text-[10px] font-bold text-gray-500 hover:text-primary-light uppercase tracking-widest transition-colors">
                    Ver Prontuário
                 </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
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
               className="relative w-full max-w-4xl bg-[#0a0d14] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
             >
                <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-dark-bg/50">
                   <div>
                     <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight">
                       {editingId ? 'Editar Assistido' : 'Novo Cadastro'}
                     </h2>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Identificação do Usuário/Família</p>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                   </button>
                </div>

                {/* Custom Tabs */}
                <div className="flex border-b border-gray-800 px-6 bg-dark-bg/30">
                   {[
                     { id: 'info', label: '1. Identificação' },
                     { id: 'familia', label: '2. Família' },
                     { id: 'socio', label: '3. Socioeconômico' }
                   ].map(tab => (
                     <button
                       key={tab.id}
                       type="button"
                       onClick={() => setActiveTab(tab.id as any)}
                       className={`px-4 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                         activeTab === tab.id 
                           ? 'border-primary-light text-primary-light' 
                           : 'border-transparent text-gray-600 hover:text-gray-400'
                       }`}
                     >
                       {tab.label}
                     </button>
                   ))}
                </div>

                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-8 space-y-6">
                   {activeTab === 'info' && (
                     <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                       <div className="space-y-2">
                         <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nome Completo</label>
                         <input 
                             required
                             value={nome}
                             onChange={(e) => handleOnlyLetters(e.target.value, setNome)}
                             className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white"
                             placeholder="Nome do assistido"
                         />
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Data de Nascimento</label>
                            <input 
                               type="date"
                               value={dataNascimento}
                               onChange={(e) => setDataNascimento(e.target.value)}
                               className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">CPF</label>
                            <input 
                               value={cpf}
                               onChange={(e) => handleOnlyNumbers(e.target.value, setCpf)}
                               className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white"
                               placeholder="Apenas números"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">RG</label>
                            <input 
                               value={rg}
                               onChange={(e) => handleOnlyNumbers(e.target.value, setRg)}
                               className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white"
                               placeholder="Apenas números"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">NIS</label>
                            <input 
                               value={nis}
                               onChange={(e) => handleOnlyNumbers(e.target.value, setNis)}
                               className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white"
                               placeholder="Apenas números"
                            />
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Telefone</label>
                            <input 
                               value={telefone}
                               onChange={(e) => handleOnlyNumbers(e.target.value, setTelefone)}
                               className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white"
                               placeholder="Apenas números"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Responsável Familiar</label>
                            <input 
                               value={responsavelFamiliar}
                               onChange={(e) => handleOnlyLetters(e.target.value, setResponsavelFamiliar)}
                               className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white"
                               placeholder="Nome do responsável"
                            />
                          </div>
                       </div>

                       <div className="space-y-2">
                         <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Endereço Completo</label>
                         <input 
                             value={endereco}
                             onChange={(e) => setEndereco(e.target.value)}
                             className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white"
                             placeholder="Rua, Número, Bairro, Cidade"
                         />
                       </div>
                     </motion.div>
                   )}

                   {activeTab === 'familia' && (
                     <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                       <div className="flex items-center justify-between">
                         <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Composição Familiar</label>
                         {!isGuest && (
                           <button 
                             type="button" 
                             onClick={addFamilyMember}
                             className="bg-primary-light/10 text-primary-light hover:bg-primary-light hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all"
                           >
                             + Adicionar Membro
                           </button>
                         )}
                       </div>
                       
                       {composicaoFamiliar.length === 0 ? (
                         <div className="border border-dashed border-gray-800 rounded-2xl p-8 text-center">
                           <p className="text-gray-600 text-xs italic">Nenhum membro da composição familiar cadastrado.</p>
                         </div>
                       ) : (
                         <div className="space-y-4">
                           {composicaoFamiliar.map((member, idx) => (
                             <div key={idx} className="bg-dark-bg border border-gray-800 rounded-2xl p-4 relative group">
                               {!isGuest && (
                                 <button 
                                   type="button"
                                   onClick={() => removeFamilyMember(idx)}
                                   className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                 >
                                   <X className="w-3 h-3" />
                                 </button>
                               )}
                               <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                 <div className="space-y-1 md:col-span-2">
                                   <label className="text-[10px] text-gray-600 uppercase font-bold">Nome</label>
                                   <input 
                                     value={member.nome}
                                     onChange={(e) => {
                                       const val = e.target.value.replace(/[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]/g, '');
                                       updateFamilyMember(idx, 'nome', val);
                                     }}
                                     className="w-full bg-[#0a0d14] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                                   />
                                 </div>
                                 <div className="space-y-1">
                                   <label className="text-[10px] text-gray-600 uppercase font-bold">Idade</label>
                                   <input 
                                     value={member.idade}
                                     onChange={(e) => {
                                       const val = e.target.value.replace(/\D/g, '');
                                       updateFamilyMember(idx, 'idade', val);
                                     }}
                                     className="w-full bg-[#0a0d14] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                                   />
                                 </div>
                                 <div className="space-y-1">
                                   <label className="text-[10px] text-gray-600 uppercase font-bold">Parentesco</label>
                                   <input 
                                     value={member.parentesco}
                                     onChange={(e) => {
                                       const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                       updateFamilyMember(idx, 'parentesco', val);
                                     }}
                                     className="w-full bg-[#0a0d14] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                                   />
                                 </div>
                                 <div className="space-y-1">
                                   <label className="text-[10px] text-gray-600 uppercase font-bold">Ocupação</label>
                                   <input 
                                     value={member.ocupacao}
                                     onChange={(e) => {
                                       const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                       updateFamilyMember(idx, 'ocupacao', val);
                                     }}
                                     className="w-full bg-[#0a0d14] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                                   />
                                 </div>
                               </div>
                             </div>
                           ))}
                         </div>
                       )}
                     </motion.div>
                   )}

                   {activeTab === 'socio' && (
                     <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Situação de Trabalho</label>
                            <input 
                               value={situacaoTrabalho}
                               onChange={(e) => setSituacaoTrabalho(e.target.value)}
                               className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white"
                               placeholder="Registrado, Autônomo, Desempregado..."
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Renda Familiar Mensal</label>
                            <input 
                               value={rendaFamiliar}
                               onChange={(e) => handleOnlyNumbers(e.target.value, setRendaFamiliar)}
                               className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white"
                               placeholder="Apenas números"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Escolaridade do Assistido</label>
                            <input 
                               value={escolaridade}
                               onChange={(e) => setEscolaridade(e.target.value)}
                               className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white"
                               placeholder="Ensino Médio, Superior..."
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Condições de Moradia</label>
                            <input 
                               value={condicoesMoradia}
                               onChange={(e) => setCondicoesMoradia(e.target.value)}
                               className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white"
                               placeholder="Própria, Alugada, Cedida..."
                            />
                          </div>
                       </div>
                       <div className="space-y-2">
                         <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Benefícios Sociais</label>
                         <textarea 
                             value={beneficiosSociais}
                             onChange={(e) => setBeneficiosSociais(e.target.value)}
                             className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white h-24"
                             placeholder="Bolsa Família, BPC, Auxílio Gás..."
                         />
                       </div>
                     </motion.div>
                   )}
                </form>

                <div className="p-6 border-t border-gray-800 bg-dark-bg/50 flex items-center justify-between">
                   <div className="flex items-center space-x-2">
                     <div className={`w-2 h-2 rounded-full ${activeTab === 'info' ? 'bg-primary-light' : 'bg-gray-800'}`} />
                     <div className={`w-2 h-2 rounded-full ${activeTab === 'familia' ? 'bg-primary-light' : 'bg-gray-800'}`} />
                     <div className={`w-2 h-2 rounded-full ${activeTab === 'socio' ? 'bg-primary-light' : 'bg-gray-800'}`} />
                   </div>
                   <div className="flex items-center space-x-4">
                       <button 
                         type="button"
                         onClick={() => setIsModalOpen(false)}
                         className="bg-gray-900 border border-gray-800 text-gray-500 px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:text-white transition-all"
                       >
                         {isGuest ? 'Fechar' : 'Cancelar'}
                       </button>
                       {!isGuest && (
                         <button 
                           onClick={handleSubmit}
                           disabled={saving}
                           type="button"
                           className="bg-primary-light hover:bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary-light/20"
                         >
                           {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{editingId ? 'Atualizar Registro' : 'Concluir Cadastro'}</span>}
                         </button>
                       )}
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
