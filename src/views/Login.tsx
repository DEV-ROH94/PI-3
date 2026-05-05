import { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Mail, Lock, UserPlus, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email ou senha inválidos. Verifique suas credenciais.");
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-dark-bg font-sans">
      {/* Left Panel */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full md:w-1/2 bg-primary flex flex-col items-center justify-center p-8 md:p-16 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="currentColor" />
             <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="0.1" fill="none" />
           </svg>
        </div>

        <div className="z-10 flex flex-col items-center text-center space-y-8 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>

          <h2 className="uppercase tracking-[0.4em] text-sm font-medium opacity-90">
            Amor em Ação
          </h2>

          <div className="space-y-0 leading-tight">
            <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight">
              SERVIR
            </h1>
            <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight text-primary-light">
              COM
            </h1>
            <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight">
              AMOR
            </h1>
          </div>

          <div className="flex items-center w-full space-x-4">
            <div className="h-px bg-white/20 flex-grow"></div>
            <span className="uppercase text-[10px] tracking-[0.3em] font-semibold whitespace-nowrap opacity-60">
              Gestão de Assistência Social
            </span>
            <div className="h-px bg-white/20 flex-grow"></div>
          </div>

          <p className="text-sm opacity-70 leading-relaxed font-light">
            Transformando o atendimento social com tecnologia e humanidade. Uma ferramenta completa para quem dedica a vida a cuidar do próximo.
          </p>

          <div className="flex items-center space-x-2 text-[10px] tracking-widest text-primary-light font-bold opacity-80 uppercase">
             <span className="w-1.5 h-1.5 bg-primary-light rounded-full animate-pulse"></span>
             <span>Excelência no atendimento</span>
          </div>
        </div>
      </motion.div>

      {/* Right Panel */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16"
      >
        <div className="w-full max-w-md space-y-10">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-white uppercase">
              Bem-vindo de volta
            </h2>
            <p className="text-[10px] tracking-[0.2em] font-semibold text-gray-500 uppercase">
              Acesse o sistema de prontuários
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-xl font-bold uppercase tracking-wider">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.2em] font-bold text-gray-500 uppercase">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-[#0a0d14] border border-gray-800 rounded-xl px-12 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition-all text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.2em] font-bold text-gray-500 uppercase">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="w-full bg-[#0a0d14] border border-gray-800 rounded-xl px-12 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition-all text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-5 h-5 bg-[#0a0d14] border border-gray-800 rounded flex items-center justify-center peer-checked:bg-primary-light peer-checked:border-primary-light transition-all">
                    <motion.div 
                      initial={false}
                      animate={{ scale: 1 }}
                      className="w-2.5 h-2.5 bg-white rounded-[1px]"
                    />
                  </div>
                </div>
                <span className="text-[10px] tracking-[0.2em] font-bold text-gray-500 uppercase group-hover:text-gray-300 transition-colors">Manter logado</span>
              </label>

              <button type="button" className="text-[10px] tracking-[0.2em] font-bold text-primary-light uppercase hover:underline">
                Esqueci minha senha
              </button>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary-light hover:bg-blue-600 disabled:opacity-50 text-white py-4 rounded-xl font-bold tracking-[0.2em] uppercase flex items-center justify-center space-x-3 transition-all active:scale-[0.98] shadow-lg shadow-primary-light/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Entrar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="flex items-center space-x-2">
                <span className="text-[10px] tracking-[0.1em] font-semibold text-gray-500 uppercase">Não tem conta?</span>
                <Link to="/signup" className="text-[10px] tracking-[0.1em] font-bold text-gray-400 hover:text-white uppercase">Cadastre-se</Link>
             </div>
             
             <Link to="/signup" className="w-10 h-10 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-gray-800 transition-colors">
                <UserPlus className="w-4 h-4 text-gray-400" />
             </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
