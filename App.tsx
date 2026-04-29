import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  User, 
  Bot, 
  Calendar, 
  BookOpen,
  GraduationCap,
  Users,
  ChevronRight,
  Mail,
  Zap,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from './utils';

// --- Types ---
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Event {
  id: number;
  title: string;
  date: string;
  type: string;
}

// --- Helper Components ---

function FacultyCard({ name, role, dept, email }: { name: string, role: string, dept: string, email: string }) {
  return (
    <div className="glass-card p-5 group hover:border-brand-primary transition-all">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
          <User className="text-white/20" size={20} />
        </div>
        <div>
          <h4 className="font-display font-bold text-white text-sm">{name}</h4>
          <p className="text-[10px] text-brand-primary font-bold uppercase tracking-wider">{role}</p>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-[10px] text-white/40">
          <BookOpen size={12} className="text-brand-primary" /> {dept}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-white/40">
          <Mail size={12} className="text-brand-primary" /> {email}
        </div>
      </div>
      <button className="mt-4 w-full py-2 bg-brand-primary rounded-xl text-[10px] font-bold uppercase text-white shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform">
        Bridge Connection
      </button>
    </div>
  );
}

function SectionHeader({ title, subtitle, icon: Icon }: { title: string, subtitle: string, icon: any }) {
  return (
    <div className="relative">
      <div className="flex items-center gap-4 mb-3">
         <div className="p-2.5 glass-card border-none bg-brand-primary/20 rounded-xl">
           <Icon className="text-brand-primary" size={24} />
         </div>
         <h2 className="font-display text-3xl font-black text-white tracking-tight">{title}</h2>
      </div>
      <p className="text-white/50 text-sm max-w-xl leading-relaxed">{subtitle}</p>
    </div>
  );
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm **SapthaBot**, your library-trained guide. Ask me anything about **SNPSU**." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: messages.slice(-5) })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get a response');
      }
      setMessages(prev => [...prev, { role: 'assistant', content: data.text || "I couldn't generate a response. Please try again." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I couldn't reach the AI service. Please check the Gemini API key and try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[580px] w-full max-w-2xl glass-card overflow-hidden shadow-2xl">
      <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/5 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center shadow-inner">
            <Bot className="text-white w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white text-sm font-bold">SapthaBot</h3>
            <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Active</span>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 no-scroll">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
            <div className={cn("shrink-0 w-8 h-8 rounded-full flex items-center justify-center", msg.role === 'user' ? "bg-gradient-to-tr from-indigo-500 to-purple-600" : "bg-white/10 border border-white/10")}>
               {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-brand-primary" />}
            </div>
            <div className={cn("p-4 rounded-2xl text-[13px] leading-relaxed", 
              msg.role === 'user' ? "bg-brand-primary text-white rounded-tr-none shadow-lg shadow-brand-primary/10" : "bg-white/5 text-white/90 border border-white/10 rounded-tl-none")}>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
              <Bot size={14} className="text-brand-primary" />
            </div>
            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1">
              <span className="w-1 h-1 bg-white/40 rounded-full animate-bounce" />
              <span className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-white/5">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Query university database..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all placeholder:text-white/20"
          />
          <button onClick={handleSend} className="absolute right-2 top-1.5 p-1.5 text-brand-primary hover:text-white transition-colors">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'guide' | 'programs' | 'faculty'>('guide');
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch('/api/events').then(res => res.json()).then(setEvents);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      <div className="mesh-bg" />
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-black text-xl tracking-tight text-white uppercase tracking-[0.05em]">UniBot</h1>
              <p className="text-[9px] font-bold tracking-[0.3em] text-white/40 uppercase">Ecosystem</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setActiveTab('guide')} className={cn("text-xs font-black uppercase tracking-widest transition-colors", activeTab === 'guide' ? "text-white" : "text-white/40 hover:text-white/60")}>Guide</button>
            <button onClick={() => setActiveTab('programs')} className={cn("text-xs font-black uppercase tracking-widest transition-colors", activeTab === 'programs' ? "text-white" : "text-white/40 hover:text-white/60")}>Programs</button>
            <button onClick={() => setActiveTab('faculty')} className={cn("text-xs font-black uppercase tracking-widest transition-colors", activeTab === 'faculty' ? "text-white" : "text-white/40 hover:text-white/60")}>Faculty</button>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 glass-card border-none bg-white/5">
              <div className="flex -space-x-2">
                <div className="w-5 h-5 rounded-full bg-blue-400 border border-brand-dark"></div>
                <div className="w-5 h-5 rounded-full bg-green-400 border border-brand-dark"></div>
                <div className="w-5 h-5 rounded-full bg-orange-400 border border-brand-dark"></div>
              </div>
              <span className="text-[9px] font-black text-white/60 uppercase tracking-tighter">12 Faculty Hubs Active</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'guide' ? (
            <motion.div 
              key="guide"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid lg:grid-cols-12 gap-12 items-start"
            >
              {/* Hero Left */}
              <div className="lg:col-span-12 xl:col-span-5 space-y-10">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white rounded-full text-[10px] font-bold tracking-widest uppercase mb-4">
                    <Zap size={12} className="text-brand-primary fill-brand-primary" /> Training Complete
                  </div>
                  <h2 className="font-display text-5xl md:text-6xl font-black text-white leading-[1.05] tracking-tight">
                    UniBot <span className="text-brand-primary font-light italic">Assist.</span>
                  </h2>
                  <p className="text-white/60 text-lg leading-relaxed max-w-md">
                    Integrated SNPSU AI. Admissions, fees, or your curriculum — answered instantly.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                     <div className="text-center px-4">
                      <p className="font-display font-black text-2xl text-white">9001:2015</p>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">ISO Certified</p>
                    </div>
                    <div className="w-px h-12 bg-white/10" />
                    <div className="text-center px-4">
                      <p className="font-display font-black text-2xl text-white">CISCO</p>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Global Partner</p>
                    </div>
                  </div>
                </div>

                {/* Quick FAQ / Info */}
                <div className="glass-card p-6 flex-1">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary mb-4">Neural Quick Links</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/80 transition-colors flex justify-between items-center group border border-white/5">
                      Reset campus EduID access <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform text-brand-primary" />
                    </button>
                    <button className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/80 transition-colors flex justify-between items-center group border border-white/5">
                      Locate Registrar Office <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform text-brand-primary" />
                    </button>
                  </div>
                </div>

                {/* Campus Events Section */}
                <div className="space-y-4">
                  <h3 className="font-display font-black text-lg text-white uppercase tracking-tighter">Campus Signal</h3>
                  <div className="space-y-2">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-center gap-4 p-4 glass-card border-white/5 group hover:border-brand-primary transition-all cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex flex-col items-center justify-center text-center group-hover:bg-brand-primary/20">
                          <span className="text-[9px] font-black text-brand-primary uppercase tracking-tighter mb-1">{event.type}</span>
                          <Calendar size={14} className="text-white/40 group-hover:text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white leading-tight">{event.title}</h4>
                          <p className="text-xs text-white/40 mt-1">{event.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chatbot Right */}
              <div className="lg:col-span-12 xl:col-span-7 flex justify-center">
                 <ChatInterface />
              </div>
            </motion.div>
          ) : activeTab === 'programs' ? (
            <motion.div 
              key="programs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <SectionHeader 
                title="Academic Signal" 
                subtitle="Industry-aligned education designed for the modern world. Explore our diverse range of engineering and management degrees."
                icon={BookOpen}
              />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs font-medium">
                {[
                  { title: "B.E. Computer Science", code: "CSE", color: "bg-blue-500/20 text-blue-400" },
                  { title: "B.E. AI & Machine Learning", code: "AIML", color: "bg-purple-500/20 text-purple-400" },
                  { title: "B.E. AI & Data Science", code: "AIDS", color: "bg-emerald-500/20 text-emerald-400" },
                  { title: "B.E. Data Science", code: "DS", color: "bg-indigo-500/20 text-indigo-400" },
                  { title: "B.E. Electronics & Communication", code: "ECE", color: "bg-amber-500/20 text-amber-400" },
                  { title: "B.E. Electrical & Electronics", code: "EEE", color: "bg-rose-500/20 text-rose-400" },
                ].map((prog) => (
                  <div key={prog.code} className="glass-card p-6 group hover:border-brand-primary transition-all">
                    <div className={cn("w-12 h-12 rounded-2xl mb-4 flex items-center justify-center font-black text-xs border border-white/5 bg-white/5", prog.color)}>
                      {prog.code}
                    </div>
                    <h3 className="font-display font-black text-xl text-white mb-2 leading-tight uppercase tracking-tighter">{prog.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed mb-6">Innovative pedagogy focused on deep disciplinary knowledge and problem solving skills.</p>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg group-hover:border-brand-primary group-hover:text-brand-primary transition-colors">
                      Extract Details <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="faculty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
               <SectionHeader 
                title="Faculty Matrix" 
                subtitle="Connect with expert mentors who are currently available for quick queries or standard guidance."
                icon={Users}
              />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <FacultyCard name="Dr. N.C. Mahendra Babu" role="Dean Engineering" dept="Mechanical / CSE" email="mahendra@snpsu.edu.in" />
                <FacultyCard name="Dr. Deepak S Sakkari" role="Director" dept="Data Science" email="deepak@snpsu.edu.in" />
                <FacultyCard name="Prof. Gurucharan Singh" role="CHRO" dept="Management" email="guru@snpsu.edu.in" />
                <FacultyCard name="Dr. Jayashree Nair" role="Director" dept="CSE" email="nair@snpsu.edu.in" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white/5 backdrop-blur-xl border-t border-white/10 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center">
               <GraduationCap className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-black text-xl tracking-tight text-white uppercase tracking-[0.05em]">SNPSU</h1>
              <p className="text-[9px] font-bold tracking-[0.3em] text-white/40 uppercase">Neural Ecosystem</p>
            </div>
          </div>
          <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">© 2026 Sapthagiri NPS University. Bengaluru Research Hub.</p>
        </div>
      </footer>
    </div>
  );
}
