import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'Assistências Ativas', value: '1,284', icon: Users, color: 'text-blue-500', trend: '+12%' },
    { label: 'Prontuários Novos', value: '42', icon: FileText, color: 'text-purple-500', trend: '+5%' },
    { label: 'Casos Críticos', value: '08', icon: AlertCircle, color: 'text-red-500', trend: '-2%' },
    { label: 'Taxa de Sucesso', value: '94%', icon: TrendingUp, color: 'text-emerald-500', trend: '+3%' },
  ];

  const recentActivities = [
    { type: 'Prontuário', detail: 'Maria Silva atualizou dados familiares', time: 'Há 10 min', status: 'Completo' },
    { type: 'Relatório', detail: 'Gerado relatório mensal de impacto', time: 'Há 1 hora', status: 'Processando' },
    { type: 'Ação', detail: 'Novo assistido cadastrado: João Ferreira', time: 'Há 2 horas', status: 'Novo' },
    { type: 'Alerta', detail: 'Vencimento de benefício: Família Costa', time: 'Há 3 horas', status: 'Urgente' },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Painel de Controle</h1>
            <p className="text-gray-500 text-sm mt-1">Bem-vindo, aqui está o resumo das atividades de hoje.</p>
          </div>
          <button className="bg-primary-light hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm tracking-wide flex items-center space-x-2 transition-all active:scale-[0.98]">
            <Plus className="w-4 h-4" />
            <span>Novo Registro</span>
          </button>
        </header>

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
              {[60, 80, 45, 90, 70, 55, 75].map((val, i) => (
                <div key={i} className="flex flex-col items-center group">
                   <div className="relative">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${val}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="w-10 bg-gradient-to-t from-primary to-primary-light rounded-t-lg group-hover:brightness-125 transition-all"
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-dark-bg text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {val}%
                      </div>
                   </div>
                   <span className="text-[10px] font-bold text-gray-500 mt-4">DIA {i+1}</span>
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
