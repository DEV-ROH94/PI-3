import { useState } from 'react';
import React from 'react';
import { motion } from 'motion/react';
import { Heart, Mail, Lock, User, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#0a0d14] border border-gray-800 p-10 rounded-3xl text-center space-y-6"
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10 text-emerald-500 fill-emerald-500" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Cadastro Realizado!</h2>
          <p className="text-gray-400 text-sm">Enviamos um e-mail de confirmação. Após confirmar, você poderá acessar o sistema.</p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-primary-light hover:bg-blue-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-all"
          >
            Ir para o Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-dark-bg font-sans">
      {/* Esquerda - Branding */}
      <div className="hidden md:flex w-1/2 bg-primary flex-col items-center justify-center p-16 text-white relative overflow-hidden">
        <div className="z-10 flex flex-col items-center text-center space-y-8 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <h2 className="uppercase tracking-[0.4em] text-sm font-medium opacity-90">Junte-se ao Movimento</h2>
          <h1 className="text-6xl font-display font-bold tracking-tight">FAÇA PARTE</h1>
          <p className="text-sm opacity-70 leading-relaxed font-light">Crie sua conta e comece a transformar a gestão da assistência social com eficiência e carinho.</p>
        </div>
      </div>

      {/* Direita - Formulário */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-10">
          <div className="space-y-2">
            <Link to="/login" className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors mb-6 group">
               <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Voltar ao login</span>
            </Link>
            <h2 className="text-3xl font-display font-bold tracking-tight text-white uppercase">Criar Nova Conta</h2>
            <p className="text-[10px] tracking-[0.2em] font-semibold text-gray-500 uppercase">Preencha os dados abaixo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-xl font-bold uppercase tracking-wider">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.2em] font-bold text-gray-500 uppercase">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="João da Silva"
                    className="w-full bg-[#0a0d14] border border-gray-800 rounded-xl px-12 py-4 text-sm focus:ring-2 focus:ring-primary-light text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.2em] font-bold text-gray-500 uppercase">Email Profissional</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-[#0a0d14] border border-gray-800 rounded-xl px-12 py-4 text-sm focus:ring-2 focus:ring-primary-light text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.2em] font-bold text-gray-500 uppercase">Senha de Acesso</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-[#0a0d14] border border-gray-800 rounded-xl px-12 py-4 text-sm focus:ring-2 focus:ring-primary-light text-white"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary-light hover:bg-blue-600 disabled:opacity-50 text-white py-4 rounded-xl font-bold tracking-[0.2em] uppercase flex items-center justify-center space-x-3 transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Cadastrar Agora</span> <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
