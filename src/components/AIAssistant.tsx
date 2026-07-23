import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { askAssistant } from '../services/gemini';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; content: string }[]>([
    { role: 'ai', content: 'Olá! Sou seu assistente Amor em Ação. Como posso ajudar com seus prontuários hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const response = await askAssistant(userMessage);
    
    setMessages(prev => [...prev, { role: 'ai', content: response }]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-primary-light to-blue-600 rounded-2xl shadow-xl shadow-primary-light/30 flex items-center justify-center z-50 group border border-white/20"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ opacity: 0, rotate: -45 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 45 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
              <Sparkles className="w-6 h-6 text-white fill-white/20" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Badge */}
        {!isOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-dark-bg flex items-center justify-center text-[8px] font-black">AI</span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-8 w-96 max-h-[600px] bg-[#0a0d14] border border-gray-800 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-primary to-primary-light flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-display font-bold text-sm tracking-tight leading-none">Assistente Social IA</h3>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">Online agora</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-grow overflow-y-auto p-6 space-y-4 max-h-[400px] scrollbar-thin scrollbar-thumb-gray-800"
            >
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex space-x-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${msg.role === 'ai' ? 'bg-primary/20 text-primary-light' : 'bg-gray-800 text-gray-400'}`}>
                      {msg.role === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${msg.role === 'ai' ? 'bg-gray-900 text-gray-200' : 'bg-primary-light text-white'}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                   <div className="flex space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary-light flex items-center justify-center">
                         <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                      <div className="p-3 rounded-2xl bg-gray-900 text-gray-500 text-sm italic">
                         Analisando prontuários...
                      </div>
                   </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-gray-800">
               <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex items-center space-x-2"
               >
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Pergunte ao assistente..."
                    className="flex-grow bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-light text-white placeholder-gray-600"
                  />
                  <button 
                    disabled={isLoading || !input.trim()}
                    type="submit"
                    className="w-10 h-10 bg-primary-light hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-primary-light text-white rounded-xl flex items-center justify-center transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
               </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
