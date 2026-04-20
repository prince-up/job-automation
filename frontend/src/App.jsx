import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Upload, Link as LinkIcon, FileText, CheckCircle, Download, 
  Loader2, Sparkles, LayoutDashboard, History, Settings, 
  Briefcase, User, Search, Bell, ChevronRight, Zap,
  AlertCircle, ShieldCheck, Globe, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [file, setFile] = useState(null);
  const [jobUrl, setJobUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([
    { id: 1, job: 'Senior DevOps Engineer', company: 'Google', date: '2024-04-18', score: 92, status: 'Tailored' },
    { id: 2, job: 'SRE Lead', company: 'Meta', date: '2024-04-15', score: 78, status: 'Draft' },
    { id: 3, job: 'Cloud Architect', company: 'Amazon', date: '2024-04-10', score: 85, status: 'Applied' },
  ]);

  // AI Configuration (Local Storage)
  const [config, setConfig] = useState({
    openaiKey: localStorage.getItem('openai_key') || '',
    apifyToken: localStorage.getItem('apify_token') || ''
  });

  useEffect(() => {
    localStorage.setItem('openai_key', config.openaiKey);
    localStorage.setItem('apify_token', config.apifyToken);
  }, [config]);

  const handleDownload = async (content, filename) => {
    try {
      const response = await axios.post(`${API_BASE}/generate-pdf`, { content }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      setError('Failed to download PDF.');
    }
  };

  const handleProcess = async () => {
    if (!file || !jobUrl) {
      setError('Please upload a resume and provide a Job URL.');
      return;
    }

    setIsProcessing(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await axios.post(`${API_BASE}/upload-resume`, formData);
      const resumeText = uploadRes.data.resume_text;

      const processRes = await axios.post(`${API_BASE}/process-job`, {
        url: jobUrl,
        resume_text: resumeText
      });

      setResult(processRes.data);
      setHistory([{ 
        id: Date.now(), 
        job: 'DevOps Specialist', 
        company: new URL(jobUrl).hostname.split('.')[1] || 'Company', 
        date: new Date().toISOString().split('T')[0], 
        score: processRes.data.match_score,
        status: 'Tailored'
      }, ...history]);
      setActiveTab('results');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong during processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] text-white">
      {/* Sidebar */}
      <aside className="w-72 bg-sidebar border-r border-white/5 p-6 flex flex-col hidden lg:flex">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">JobAI <span className="text-primary">Agent</span></span>
        </div>

        <nav className="space-y-2 flex-1">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<History size={20} />} label="Applications" active={activeTab === 'applications'} onClick={() => setActiveTab('applications')} />
          <SidebarItem icon={<Briefcase size={20} />} label="Resume Hub" active={activeTab === 'resume-hub'} onClick={() => setActiveTab('resume-hub')} />
          <SidebarItem icon={<Settings size={20} />} label="AI Config" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="mt-auto bg-white/5 border border-white/5 p-4 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-0.5">
              <div className="w-full h-full rounded-full bg-sidebar flex items-center justify-center text-[10px] font-bold">LS</div>
            </div>
            <div>
              <p className="text-xs font-bold">Lucky Singh</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Pro Developer</p>
            </div>
          </div>
          <button className="w-full py-2.5 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-xl text-[10px] font-bold transition-all border border-white/5">Sign Out</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-[#020617]">
        {/* Animated Background Orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] animate-pulse-slow" />

        {/* Top bar */}
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-dark/40 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/5 w-[400px] focus-within:border-primary/50 transition-all">
            <Search size={18} className="text-slate-500" />
            <input type="text" placeholder="Search your dream job..." className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-600" />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              <HeaderIcon icon={<Bell size={18} />} hasBadge />
              <HeaderIcon icon={<Globe size={18} />} />
            </div>
            <button className="btn-premium px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2">
              <Zap size={16} /> New Hunt
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-indigo-600/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-purple-600/5 blur-[120px] pointer-events-none" />

          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">Welcome back, Lucky 👋</h2>
                    <p className="text-slate-500 mt-1">You have 3 applications in progress this week.</p>
                  </div>
                  <div className="flex gap-3">
                    <StatCard label="Match Rate" value="84%" trend="+5%" />
                    <StatCard label="Optimization" value="Pro" trend="Active" />
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Action Card */}
                  <div className="xl:col-span-2 glass-morphism p-10 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />
                    
                    <div className="relative">
                      <h3 className="text-xl font-bold flex items-center gap-3 mb-8">
                        <Zap className="text-indigo-400" /> Start New Optimization
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">1. Master Resume</label>
                          <div 
                            className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer h-52
                              ${file ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 hover:border-indigo-500/40 hover:bg-white/5'}`}
                            onClick={() => document.getElementById('resume-input').click()}
                          >
                            <input type="file" id="resume-input" className="hidden" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
                            {file ? (
                              <div className="text-center">
                                <ShieldCheck className="text-emerald-500 mx-auto mb-4" size={40} />
                                <p className="text-sm font-bold text-emerald-400">{file.name}</p>
                              </div>
                            ) : (
                              <>
                                <Upload className="text-slate-600 mb-4" size={40} strokeWidth={1} />
                                <p className="text-sm text-slate-400 text-center font-medium">Drop your master PDF here</p>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">2. Target Job URL</label>
                          <div className="h-52 flex flex-col justify-between">
                            <div className="relative">
                              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                              <input 
                                type="text" 
                                placeholder="LinkedIn, Indeed, or Apify URL" 
                                className="input-premium pl-12 h-14"
                                value={jobUrl}
                                onChange={(e) => setJobUrl(e.target.value)}
                              />
                            </div>
                            <div className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-2xl">
                              <p className="text-[10px] leading-relaxed text-slate-400">
                                <span className="text-indigo-400 font-bold">Pro Tip:</span> Using Apify's RAG Web Browser will increase accuracy by 45%.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {error && <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-3"><AlertCircle size={16} /> {error}</div>}

                      <button 
                        className="btn-premium w-full mt-10 h-16 text-lg justify-center shadow-2xl shadow-indigo-600/30"
                        onClick={handleProcess}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <><Loader2 className="animate-spin" size={24} /> Analyzing Requirements...</>
                        ) : (
                          <><Sparkles size={24} /> Tailor My Application</>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Secondary Card */}
                  <div className="xl:col-span-1 space-y-8">
                    <div className="glass-morphism p-8 h-full flex flex-col">
                      <h3 className="text-lg font-bold mb-6">Application Trends</h3>
                      <div className="flex-1 flex flex-col gap-4">
                        <TrendItem label="DevOps Roles" value="+12%" color="text-emerald-500" />
                        <TrendItem label="Avg Match Score" value="78%" color="text-indigo-400" />
                        <TrendItem label="Hiring Velocity" value="Fast" color="text-amber-500" />
                        <div className="mt-auto p-4 bg-white/5 rounded-2xl text-center">
                          <p className="text-xs text-slate-500 mb-3">AI Resume Power Level</p>
                          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-3/4 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="glass-morphism p-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <History size={18} className="text-slate-400" /> Recent Activity
                    </h3>
                    <div className="space-y-4">
                      {history.slice(0, 3).map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                              <Briefcase size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold">{item.job}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase">{item.company} • {item.date}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-600 group-hover:text-white" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-morphism p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                      <Cpu size={80} className="text-white/5" />
                    </div>
                    <h3 className="text-lg font-bold mb-6">AI Engine Status</h3>
                    <div className="space-y-6">
                      <StatusRow label="GPT-4 Integration" status="Operational" />
                      <StatusRow label="Apify RAG Scraper" status="Operational" />
                      <StatusRow label="Resume Parser" status="Latency: 1.2s" />
                      <button className="w-full mt-4 py-3 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/5 transition-colors">Run Diagnostics</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'results' && result && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="flex justify-between items-center">
                  <button onClick={() => setActiveTab('dashboard')} className="text-sm text-slate-500 hover:text-white flex items-center gap-2">
                    <ChevronRight size={16} className="rotate-180" /> Back to Dashboard
                  </button>
                  <div className="flex gap-3">
                    <button onClick={() => handleDownload(result.optimized_resume, 'Optimized_Resume.pdf')} className="btn-premium bg-emerald-600 shadow-emerald-900/20 py-2">Export Resume</button>
                    <button onClick={() => handleDownload(result.cover_letter, 'Cover_Letter.pdf')} className="btn-premium py-2">Export Letter</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: Score Card */}
                  <div className="lg:col-span-4 space-y-8">
                    <div className="glass-morphism p-10 flex flex-col items-center text-center">
                      <div className="relative w-48 h-48 mb-8">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-900" />
                          <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={552} strokeDashoffset={552 - (552 * result.match_score) / 100} className="text-indigo-500" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-6xl font-black">{result.match_score}%</span>
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Match Score</span>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">High Potential</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">Your profile aligns significantly with the core requirements. A few tweaks to your cloud infrastructure bullet points could bring this to 95%+.</p>
                    </div>

                    <div className="glass-morphism p-8">
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Optimization Checklist</h4>
                      <div className="space-y-4">
                        <ChecklistItem label="Keyword Alignment" checked={true} />
                        <ChecklistItem label="Formatting Consistency" checked={true} />
                        <ChecklistItem label="Achievement Quantifiers" checked={true} />
                        <ChecklistItem label="Skill Gap identified" checked={false} />
                      </div>
                    </div>
                  </div>

                  {/* Right: Content Cards */}
                  <div className="lg:col-span-8 space-y-8">
                    <div className="glass-morphism overflow-hidden">
                      <div className="flex border-b border-white/5">
                        <button className="px-10 py-6 text-sm font-bold border-b-2 border-indigo-500">Cover Letter</button>
                        <button className="px-10 py-6 text-sm font-bold text-slate-500 hover:text-white">Profile Summary</button>
                      </div>
                      <div className="p-10">
                        <div className="bg-slate-950/40 rounded-3xl p-10 border border-white/5 text-slate-300 leading-relaxed font-serif text-lg italic whitespace-pre-wrap">
                          {result.cover_letter}
                        </div>
                      </div>
                    </div>

                    <div className="glass-morphism p-10">
                      <h3 className="text-xl font-bold mb-6">AI Optimization Recommendations</h3>
                      <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                        <p className="text-slate-300 leading-relaxed italic">"{result.optimized_resume}"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto space-y-8">
                <div>
                  <h2 className="text-3xl font-bold">AI Configuration</h2>
                  <p className="text-slate-500 mt-2">Manage your API keys and model preferences. These are stored securely in your browser's local storage.</p>
                </div>

                <div className="glass-morphism p-10 space-y-8">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">OpenAI API Key</label>
                    <input 
                      type="password" 
                      placeholder="sk-..." 
                      className="input-premium"
                      value={config.openaiKey}
                      onChange={(e) => setConfig({...config, openaiKey: e.target.value})}
                    />
                    <p className="text-[10px] text-slate-600">Required for resume optimization and cover letter generation.</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Apify API Token</label>
                    <input 
                      type="password" 
                      placeholder="apify_api_..." 
                      className="input-premium"
                      value={config.apifyToken}
                      onChange={(e) => setConfig({...config, apifyToken: e.target.value})}
                    />
                    <p className="text-[10px] text-slate-600">Required for advanced web scraping and job requirement analysis.</p>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex justify-end">
                    <button className="btn-premium" onClick={() => setActiveTab('dashboard')}>Save & Finish Setup</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Subcomponents
function SidebarItem({ icon, label, active, onClick }) {
  return (
    <div 
      className={`sidebar-item flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
      onClick={onClick}
    >
      {icon}
      <span className="text-sm font-bold">{label}</span>
    </div>
  );
}

function HeaderIcon({ icon, hasBadge }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-all relative">
      {icon}
      {hasBadge && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-dark" />}
    </div>
  );
}

function StatCard({ label, value, trend }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col justify-center min-w-[160px] glass-morphism">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-2xl font-black">{value}</span>
        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded-md">{trend}</span>
      </div>
    </div>
  );
}

function TrendItem({ label, value, color }) {
  return (
    <div className="flex items-center justify-between p-2">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  );
}

function StatusRow({ label, status }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
        <span className="text-[10px] font-bold uppercase text-slate-500">{status}</span>
      </div>
    </div>
  );
}

function ChecklistItem({ label, checked }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${checked ? 'bg-indigo-500 border-indigo-500' : 'border-white/10 bg-white/5'}`}>
        {checked && <CheckCircle size={12} className="text-white" />}
      </div>
      <span className={`text-sm ${checked ? 'text-slate-300' : 'text-slate-600'}`}>{label}</span>
    </div>
  );
}

export default App;
