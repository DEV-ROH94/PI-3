import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { Download, FileText, Calendar, Table, Loader2, Plus, Trash2, X, Target } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';
import React from 'react';

interface Meta {
  id: string;
  label: string;
  current: number;
  target: number;
  color: string;
}

const DEFAULT_METAS: Meta[] = [
  { id: '1', label: 'Visitas Domiciliares', current: 12, target: 20, color: 'text-primary-light' },
  { id: '2', label: 'Cestas Básicas', current: 145, target: 200, color: 'text-emerald-500' },
  { id: '3', label: 'Encaminhamentos', current: 42, target: 50, color: 'text-purple-500' },
];

const META_COLORS = [
  { label: 'Azul', value: 'text-primary-light' },
  { label: 'Verde', value: 'text-emerald-500' },
  { label: 'Roxo', value: 'text-purple-500' },
  { label: 'Amarelo', value: 'text-yellow-500' },
  { label: 'Vermelho', value: 'text-red-500' },
  { label: 'Laranja', value: 'text-orange-500' },
  { label: 'Rosa', value: 'text-pink-500' },
  { label: 'Ciano', value: 'text-cyan-500' },
];

export default function Relatorios() {
  const [exporting, setExporting] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [chartData, setChartData] = useState<{name: string, total: number}[]>([]);
  const [riskData, setRiskData] = useState<{name: string, value: number, color: string}[]>([]);
  const [loading, setLoading] = useState(true);

  const [metas, setMetas] = useState<Meta[]>(() => {
    const saved = localStorage.getItem('amor_em_acao_metas');
    return saved ? JSON.parse(saved) : DEFAULT_METAS;
  });
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);
  const [metaLabel, setMetaLabel] = useState('');
  const [metaTarget, setMetaTarget] = useState('');
  const [metaCurrent, setMetaCurrent] = useState('');
  const [metaColor, setMetaColor] = useState('text-primary-light');

  useEffect(() => {
    localStorage.setItem('amor_em_acao_metas', JSON.stringify(metas));
  }, [metas]);

  const openAddMeta = () => {
    setEditingMeta(null);
    setMetaLabel('');
    setMetaTarget('');
    setMetaCurrent('0');
    setMetaColor('text-primary-light');
    setShowMetaModal(true);
  };

  const openEditMeta = (meta: Meta) => {
    setEditingMeta(meta);
    setMetaLabel(meta.label);
    setMetaTarget(String(meta.target));
    setMetaCurrent(String(meta.current));
    setMetaColor(meta.color);
    setShowMetaModal(true);
  };

  const saveMeta = () => {
    if (!metaLabel.trim() || !metaTarget) return;
    if (editingMeta) {
      setMetas(metas.map(m => m.id === editingMeta.id ? { ...m, label: metaLabel.trim(), target: Number(metaTarget), current: Number(metaCurrent), color: metaColor } : m));
    } else {
      setMetas([...metas, { id: Date.now().toString(), label: metaLabel.trim(), target: Number(metaTarget), current: Number(metaCurrent), color: metaColor }]);
    }
    setShowMetaModal(false);
  };

  const deleteMeta = (id: string) => {
    if (!confirm('Deseja remover esta meta?')) return;
    setMetas(metas.filter(m => m.id !== id));
  };

  useEffect(() => {
    fetchStats();
  }, [filterPeriod]);

  const fetchStats = async () => {
    setLoading(true);
    let query = supabase.from('prontuarios').select('risco_social, data_entrada');
    
    if (filterPeriod === 'month') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      query = query.gte('data_entrada', startOfMonth.toISOString().split('T')[0]);
    }

    const { data } = await query;
    if (data) {
      // Risk distribution
      const risks = ['Baixo', 'Médio', 'Alto', 'Urgente'];
      const riskColors: Record<string, string> = {
        'Baixo': '#10b981', 'Médio': '#f59e0b', 'Alto': '#f97316', 'Urgente': '#ef4444'
      };
      
      const dist = risks.map(r => ({
        name: r,
        value: data.filter(p => p.risco_social === r).length,
        color: riskColors[r]
      }));
      setRiskData(dist);

      // Simple month distribution for chart (past 6 months)
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const currentYear = new Date().getFullYear();
      
      const monthlyTotal = months.map((m, i) => {
        const count = data.filter(p => {
          const d = new Date(p.data_entrada);
          return d.getMonth() === i && d.getFullYear() === currentYear;
        }).length;
        return { name: m, total: count };
      });
      
      // Limit to relevant months or last 6
      const currentMonthIndex = new Date().getMonth();
      setChartData(monthlyTotal.slice(Math.max(0, currentMonthIndex - 5), currentMonthIndex + 1));
    }
    setLoading(false);
  };

  const getExportData = async () => {
    let query = supabase.from('prontuarios').select('*');
    if (filterPeriod === 'month') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      query = query.gte('data_entrada', startOfMonth.toISOString().split('T')[0]);
    }
    const { data } = await query;
    return data || [];
  };

  const exportToExcel = async () => {
    setExporting(true);
    const exportData = await getExportData();
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Prontuarios");
    XLSX.writeFile(wb, `Relatorio_Social_${new Date().toISOString().split('T')[0]}.xlsx`);
    setExporting(false);
  };

  const exportToPDF = async () => {
    setExporting(true);
    const exportData = await getExportData();
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Amor em Ação - Relatório Social", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [['ID', 'Nome Assistido', 'Risco', 'Assistente', 'Data']],
      body: exportData.map(p => [
        String(p.id).slice(0, 8),
        p.assistido_nome,
        p.risco_social,
        p.assistente_nome,
        p.data_entrada
      ]),
      theme: 'grid',
      headStyles: { fillColor: [26, 59, 142] }
    });

    doc.save(`Relatorio_Social_${new Date().toISOString().split('T')[0]}.pdf`);
    setExporting(false);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">Relatórios de Impacto</h1>
            <p className="text-gray-500 text-sm mt-1">Monitore o desempenho social e estatísticas de atendimento.</p>
          </div>
          <div className="flex items-center space-x-3">
             <button 
               onClick={() => setFilterPeriod(filterPeriod === 'all' ? 'month' : 'all')}
               className={`border border-gray-800 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all ${filterPeriod === 'month' ? 'bg-primary-light text-white' : 'bg-gray-900 text-gray-500 hover:text-white'}`}
             >
                <Calendar className="w-4 h-4" />
                <span>{filterPeriod === 'month' ? 'Filtrado: Este Mês' : 'Ver Todos'}</span>
             </button>
             <button 
               onClick={exportToExcel}
               disabled={exporting}
               className="bg-gray-900 border border-gray-800 text-gray-500 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center space-x-2 hover:text-white transition-all disabled:opacity-50"
             >
                <Table className="w-4 h-4" />
                <span>Exportar Excel</span>
             </button>
             <button 
               onClick={exportToPDF}
               disabled={exporting}
               className="bg-primary-light hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all shadow-lg shadow-primary-light/20 disabled:opacity-50"
             >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Exportar PDF</span>
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-[#0a0d14] border border-gray-800 p-8 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display font-bold text-lg text-white">Evolução de Atendimentos</h3>
              <div className="flex items-center space-x-2">
                 <div className="w-3 h-3 bg-primary-light rounded-full"></div>
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Mensal</span>
              </div>
            </div>
            
            <div className="h-[350px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                     <XAxis 
                       dataKey="name" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                     />
                     <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                     />
                     <Tooltip 
                       cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                       contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', fontSize: '12px' }}
                     />
                     <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Distribution Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0a0d14] border border-gray-800 p-8 rounded-3xl"
          >
            <h3 className="font-display font-bold text-lg text-white mb-8">Distribuição de Risco</h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={riskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {riskData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="space-y-4 mt-4">
                {riskData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.name}</span>
                     </div>
                     <span className="text-sm font-bold text-white">{item.value}</span>
                  </div>
               ))}
            </div>
          </motion.div>

          {/* Table Summary */}
          <div className="col-span-full bg-[#0a0d14] border border-gray-800 rounded-3xl overflow-hidden">
             <div className="p-8 border-b border-gray-800 flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-white">Próximas Metas e Ações</h3>
                <button 
                  onClick={openAddMeta}
                  className="text-xs font-bold text-primary-light hover:underline uppercase tracking-widest flex items-center space-x-1"
                >
                  <Target className="w-3 h-3" />
                  <span>Configurar Metas</span>
                </button>
             </div>
             <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {metas.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => openEditMeta(item)}
                    className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl space-y-4 cursor-pointer hover:border-primary-light/30 transition-colors relative group"
                  >
                     <button
                       onClick={(e) => { e.stopPropagation(); deleteMeta(item.id); }}
                       className="absolute top-3 right-3 text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                     >
                       <Trash2 className="w-3.5 h-3.5" />
                     </button>
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{item.label}</p>
                     <div className="flex items-end justify-between">
                        <h4 className={`text-4xl font-display font-bold ${item.color}`}>{item.current}</h4>
                        <span className="text-sm text-gray-600 font-bold">/ {item.target}</span>
                     </div>
                     <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color.replace('text', 'bg')}`} 
                          style={{ width: `${Math.min((item.current / item.target) * 100, 100)}%` }}
                        ></div>
                     </div>
                  </div>
                ))}
                {metas.length === 0 && (
                  <div className="col-span-full border border-dashed border-gray-800 rounded-2xl p-12 text-center">
                    <Target className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Nenhuma meta configurada</p>
                    <button onClick={openAddMeta} className="text-xs text-primary-light mt-2 hover:underline">Criar primeira meta</button>
                  </div>
                )}
             </div>
          </div>

          {/* Modal Configurar Metas */}
          <AnimatePresence>
            {showMetaModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setShowMetaModal(false)}
                  className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-lg bg-[#0a0d14] border border-gray-800 rounded-3xl shadow-2xl p-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-light/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-primary-light" />
                      </div>
                      <div>
                        <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight">
                          {editingMeta ? 'Editar Meta' : 'Nova Meta'}
                        </h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Defina metas e acompanhe o progresso</p>
                      </div>
                    </div>
                    <button onClick={() => setShowMetaModal(false)} className="text-gray-500 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nome da Meta</label>
                      <input 
                        value={metaLabel}
                        onChange={(e) => setMetaLabel(e.target.value)}
                        placeholder="Ex: Visitas Domiciliares"
                        className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary-light"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Atual</label>
                        <input 
                          type="number"
                          min="0"
                          value={metaCurrent}
                          onChange={(e) => setMetaCurrent(e.target.value)}
                          className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary-light"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Meta (Alvo)</label>
                        <input 
                          type="number"
                          min="1"
                          value={metaTarget}
                          onChange={(e) => setMetaTarget(e.target.value)}
                          className="w-full bg-dark-bg border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary-light"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cor</label>
                      <div className="flex items-center space-x-2">
                        {META_COLORS.map((c) => (
                          <button
                            key={c.value}
                            onClick={() => setMetaColor(c.value)}
                            className={`w-8 h-8 rounded-full ${c.value.replace('text', 'bg')} flex items-center justify-center transition-all ${metaColor === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0d14] scale-110' : 'opacity-50 hover:opacity-100'}`}
                          >
                            {metaColor === c.value && <span className="text-white text-xs">✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>

                    {metaTarget && metaCurrent && Number(metaTarget) > 0 && (
                      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 font-bold uppercase tracking-widest">Progresso</span>
                          <span className="text-white font-bold">{Math.round((Number(metaCurrent) / Number(metaTarget)) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${metaColor.replace('text', 'bg')}`} 
                            style={{ width: `${Math.min((Number(metaCurrent) / Number(metaTarget)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={saveMeta}
                      disabled={!metaLabel.trim() || !metaTarget}
                      className="w-full bg-primary-light hover:bg-blue-600 disabled:opacity-50 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-primary-light/20"
                    >
                      {editingMeta ? 'Salvar Alterações' : 'Criar Meta'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
