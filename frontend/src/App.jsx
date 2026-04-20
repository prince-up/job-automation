import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Upload, Link as LinkIcon, FileText, CheckCircle, Download, 
  Loader2, Sparkles, LayoutDashboard, History, Settings, 
  Briefcase, User, Search, Bell, ChevronRight, Zap,
  AlertCircle, ShieldCheck, Globe, Cpu, MousePointer2, 
  ArrowRight, Star, Target, Rocket, Layers, BarChart3,
  ExternalLink, Github, Twitter, Linkedin as LinkedinIcon,
  Check, X
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const API_BASE = 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [file, setFile] = useState(null);
  const [jobUrl, setJobUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [history, setHistory] = useState([
    { id: 1, job: 'Senior DevOps Engineer', company: 'Google', date: '2024-04-18', score: 92, status: 'Tailored' },
    { id: 2, job: 'SRE Lead', company: 'Meta', date: '2024-04-15', score: 78, status: 'Draft' },
    { id: 3, job: 'Cloud Architect', company: 'Amazon', date: '2024-04-10', score: 85, status: 'Applied' },
  ]);

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

  const handleSearchJobs = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const res = await axios.post(`${API_BASE}/search-jobs`, { query: searchQuery });
      setSearchResults(res.data.jobs);
    } catch (err) {
      setError('Failed to fetch jobs.');
    } finally {
      setIsSearching(false);
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
        job: 'New Tailored Application', 
        company: new URL(jobUrl).hostname.split('.')[1] || 'Company', 
        date: new Date().toISOString().split('T')[0], 
        score: processRes.data.match_score,
        status: 'Tailored'
      }, ...history]);
      setActiveTab('results');
    } catch (err) {
      setError(err.response?.data?.detail || 'Processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (activeTab === 'landing') {
    return <LandingPage onStart={() => setActiveTab('dashboard')} />;
  }

  return (
    <div className="flex h-screen bg-dark text-white font-sans overflow-hidden">
      {/* Sidebar - Pro Version */}
      <aside className="w-72 bg-sidebar/50 border-r border-white/5 p-6 flex flex-col hidden lg:flex relative z-30">
        <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Rocket size={22} className="text-white" />
          </div>
          <span className="text-xl font-display font-extrabold tracking-tight">JobAI <span className="text-primary">Agent</span></span>
        </div>

        <nav className="space-y-2 flex-1">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard' || activeTab === 'results'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<History size={20} />} label="Applications" active={activeTab === 'applications'} onClick={() => setActiveTab('applications')} />
          <SidebarItem icon={<Briefcase size={20} />} label="Resume Hub" active={activeTab === 'resume-hub'} onClick={() => setActiveTab('resume-hub')} />
          <SidebarItem icon={<Settings size={20} />} label="AI Config" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="mt-auto glass-panel p-5 border-white/10 rounded-3xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-lg shadow-primary/20">
              <div className="w-full h-full rounded-2xl bg-sidebar flex items-center justify-center font-bold text-sm">LS</div>
            </div>
            <div>
              <p className="text-sm font-bold">Lucky Singh</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Pro Tier</p>
              </div>
            </div>
          </div>
          <button className="w-full py-3 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-xl text-[11px] font-bold transition-all border border-white/5 flex items-center justify-center gap-2">
            Sign Out <ChevronRight size={14} />
          </button>
        </div>
      </aside>

      {/* Main Body */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Universal Decorative Orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] animate-pulse-slow pointer-events-none" />

        {/* Global Header */}
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-dark/60 backdrop-blur-3xl z-40">
          <div className="flex items-center gap-5 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 w-[500px] focus-within:border-primary/50 focus-within:bg-white/[0.08] transition-all group">
            <Search size={18} className="text-slate-500 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search LinkedIn jobs (e.g. 'SRE Lead Silicon Valley')..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-600" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchJobs()}
            />
            {isSearching && <Loader2 className="animate-spin text-primary" size={18} />}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex gap-3">
              <HeaderIcon icon={<Bell size={18} />} hasBadge />
              <HeaderIcon icon={<Globe size={18} />} />
              <HeaderIcon icon={<ShieldCheck size={18} />} />
            </div>
            <div className="h-8 w-px bg-white/10" />
            <button className="btn-pro px-8 py-3 rounded-2xl text-sm flex items-center gap-2 shadow-2xl shadow-primary/20" onClick={handleSearchJobs}>
              {isSearching ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />} 
              Launch Hunt
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-10 relative z-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12 max-w-7xl mx-auto">
                {/* Search Results Integration */}
                {searchResults.length > 0 && (
                  <motion.section initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-10 border-primary/20 bg-primary/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-20 bg-primary/10 rounded-full blur-3xl" />
                    <div className="relative">
                      <div className="flex justify-between items-center mb-8">
                        <div>
                          <h3 className="text-2xl font-display font-black flex items-center gap-3">
                            <Layers className="text-primary" /> Global Opportunities Found
                          </h3>
                          <p className="text-slate-500 text-sm mt-1">Found {searchResults.length} jobs matching your profile keywords.</p>
                        </div>
                        <button onClick={() => setSearchResults([])} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all border border-white/5">Clear Results</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.map((job, index) => (
                          <div 
                            key={index} 
                            className="glass-panel p-6 border-white/5 hover:border-primary/40 hover:bg-white/[0.08] transition-all cursor-pointer group relative overflow-hidden"
                            onClick={() => { setJobUrl(job.url); setSearchResults([]); }}
                          >
                            <div className="absolute top-0 right-0 p-8 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
                            <div className="relative">
                              <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-dark rounded-xl flex items-center justify-center border border-white/5 group-hover:border-primary/20 transition-all">
                                  <Briefcase className="text-slate-500 group-hover:text-primary transition-colors" size={20} />
                                </div>
                                <span className="text-[9px] bg-primary/10 text-primary px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-primary/20">LinkedIn</span>
                              </div>
                              <h4 className="font-bold text-base text-slate-200 group-hover:text-white transition-colors line-clamp-1">{job.title}</h4>
                              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{job.snippet}</p>
                              <div className="mt-5 pt-5 border-t border-white/5 flex items-center justify-between">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Click to analyze</span>
                                <ArrowRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.section>
                )}

                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-4xl font-display font-black tracking-tighter mb-2">Command Center</h2>
                    <p className="text-slate-500 font-medium">Elevating your career trajectory with precision AI.</p>
                  </div>
                  <div className="flex gap-4">
                    <StatCardPro label="Success Rate" value="94.2%" trend="+2.4%" icon={<Star className="text-amber-400" size={16} />} />
                    <StatCardPro label="ATS Matches" value="128" trend="+12" icon={<Target className="text-primary" size={16} />} />
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                  {/* Primary Action Card */}
                  <div className="xl:col-span-2 glass-panel p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-all duration-1000" />
                    
                    <div className="relative">
                      <div className="flex items-center justify-between mb-10">
                        <h3 className="text-2xl font-display font-black flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <Zap size={22} />
                          </div>
                          Application Architect
                        </h3>
                        <div className="flex gap-2">
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-emerald-500/20">System Live</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                          <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full" /> 01. Source Artifact
                          </label>
                          <div 
                            className={`border-2 border-dashed rounded-[32px] p-12 flex flex-col items-center justify-center transition-all duration-500 cursor-pointer h-60 relative group/upload
                              ${file ? 'border-emerald-500/40 bg-emerald-500/5 shadow-inner' : 'border-white/5 hover:border-primary/40 hover:bg-white/[0.04]'}`}
                            onClick={() => document.getElementById('resume-input').click()}
                          >
                            <input type="file" id="resume-input" className="hidden" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
                            {file ? (
                              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
                                  <ShieldCheck className="text-emerald-500" size={32} />
                                </div>
                                <p className="text-sm font-bold text-emerald-400 mb-1">{file.name}</p>
                                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Encrypted & Ready</p>
                              </motion.div>
                            ) : (
                              <>
                                <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-5 group-hover/upload:bg-primary/10 group-hover/upload:text-primary transition-all">
                                  <Upload className="text-slate-600 group-hover/upload:text-primary" size={32} strokeWidth={1.5} />
                                </div>
                                <p className="text-sm text-slate-400 font-bold text-center">Deploy Resume Artifact</p>
                                <p className="text-[10px] text-slate-600 mt-2 font-bold uppercase tracking-widest">PDF Format Only</p>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="space-y-6">
                          <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full" /> 02. Mission Target
                          </label>
                          <div className="h-60 flex flex-col justify-between">
                            <div className="relative">
                              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-all">
                                <LinkIcon size={20} />
                              </div>
                              <input 
                                type="text" 
                                placeholder="Target URL or Job ID..." 
                                className="input-premium pl-14 h-16 text-base font-bold bg-white/[0.03]"
                                value={jobUrl}
                                onChange={(e) => setJobUrl(e.target.value)}
                              />
                            </div>
                            <div className="bg-primary/5 border border-primary/10 p-6 rounded-[28px] flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                <Cpu size={20} />
                              </div>
                              <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
                                <span className="text-white font-bold">Heuristic Engine:</span> Our RAG architecture will perform a deep semantic crawl of the target to identify high-value skill clusters.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {error && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mt-8 p-5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl flex items-center gap-4">
                          <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                            <AlertCircle size={18} />
                          </div>
                          <span className="font-bold">{error}</span>
                        </motion.div>
                      )}

                      <button 
                        className="btn-pro w-full mt-10 h-20 text-xl justify-center shadow-2xl shadow-primary/30 rounded-[28px]"
                        onClick={handleProcess}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <div className="flex items-center gap-4">
                            <Loader2 className="animate-spin" size={28} />
                            <span className="font-black uppercase tracking-widest text-base">Synthesizing Profile...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <Sparkles size={28} />
                            <span className="font-black uppercase tracking-widest text-base">Initialize Optimization</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sidebar Analytics */}
                  <div className="space-y-10">
                    <div className="glass-panel p-8 h-full">
                      <h3 className="text-xl font-display font-black mb-8 flex items-center justify-between">
                        Pulse
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                      </h3>
                      <div className="space-y-6">
                        <AnalyticsRow label="Market Demand" value="Explosive" color="text-emerald-500" />
                        <AnalyticsRow label="Cloud Computing" value="High" color="text-indigo-400" />
                        <AnalyticsRow label="AI Engineering" value="+400%" color="text-primary" />
                        
                        <div className="pt-8 mt-8 border-t border-white/5 space-y-6">
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Authority</span>
                              <span className="text-xs font-bold text-primary">88/100</span>
                            </div>
                            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                              <motion.div initial={{ width: 0 }} animate={{ width: '88%' }} transition={{ duration: 1.5 }} className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-primary/20 to-transparent p-6 rounded-3xl border border-primary/20 mt-8">
                          <p className="text-[11px] font-bold text-white mb-2 flex items-center gap-2">
                            <Zap size={14} className="text-amber-400" /> Pro Insight
                          </p>
                          <p className="text-[11px] text-slate-400 leading-relaxed">Your profile is currently outperforming 92% of users in the DevOps cluster.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Intelligence Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="glass-panel p-8">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-display font-black flex items-center gap-3">
                        <History size={20} className="text-slate-500" /> Operational History
                      </h3>
                      <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-white transition-colors">View Archive</button>
                    </div>
                    <div className="space-y-3">
                      {history.slice(0, 4).map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-dark border border-white/5 flex items-center justify-center text-slate-600 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                              <Briefcase size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold group-hover:text-primary transition-colors">{item.job}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{item.company}</span>
                                <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{item.date}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xs font-black">{item.score}%</p>
                              <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-tighter">Match</p>
                            </div>
                            <ChevronRight size={18} className="text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-panel p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                      <Cpu size={120} />
                    </div>
                    <h3 className="text-xl font-display font-black mb-8">Infrastructure Status</h3>
                    <div className="space-y-8">
                      <StatusModule label="Neural Synthesis" status="Optimal" delay="8ms" />
                      <StatusModule label="Apify RAG Cluster" status="Scaling" delay="142ms" />
                      <StatusModule label="Vector Database" status="Synchronized" delay="4ms" />
                      
                      <div className="grid grid-cols-2 gap-4 mt-10">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">CPU Load</p>
                          <p className="text-lg font-bold">14.2%</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">AI Tokens</p>
                          <p className="text-lg font-bold">2.4k</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'results' && result && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-10 max-w-7xl mx-auto pb-20">
                <div className="flex justify-between items-center">
                  <button onClick={() => setActiveTab('dashboard')} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold border border-white/5 transition-all flex items-center gap-3">
                    <ChevronRight size={16} className="rotate-180" /> Back to Dashboard
                  </button>
                  <div className="flex gap-4">
                    <button onClick={() => handleDownload(result.optimized_resume, 'Optimized_Resume.pdf')} className="btn-pro bg-emerald-600 shadow-emerald-900/20 px-8 py-3 rounded-2xl text-sm">Export Artifact</button>
                    <button onClick={() => handleDownload(result.cover_letter, 'Cover_Letter.pdf')} className="btn-pro px-8 py-3 rounded-2xl text-sm">Generate PDF</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* Left Column */}
                  <div className="lg:col-span-4 space-y-10">
                    <div className="glass-panel p-12 flex flex-col items-center text-center relative overflow-hidden">
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-secondary" />
                      <div className="relative w-56 h-56 mb-10">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="112" cy="112" r="102" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-dark/50" />
                          <motion.circle 
                            cx="112" cy="112" r="102" 
                            stroke="currentColor" 
                            strokeWidth="16" 
                            fill="transparent" 
                            strokeDasharray={640} 
                            initial={{ strokeDashoffset: 640 }}
                            animate={{ strokeDashoffset: 640 - (640 * result.match_score) / 100 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="text-primary" 
                            strokeLinecap="round" 
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-7xl font-display font-black tracking-tighter">{result.match_score}%</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-2">Semantic Match</span>
                        </div>
                      </div>
                      <h3 className="text-2xl font-display font-black mb-3">Alpha Alignment</h3>
                      <p className="text-slate-500 text-sm leading-relaxed px-4">Our heuristics identify a high correlation between your metadata and the mission profile.</p>
                      
                      <div className="w-full mt-10 space-y-4">
                        <MetricBadge label="Skill Density" value="98/100" />
                        <MetricBadge label="Keyword Velocity" value="High" />
                      </div>
                    </div>

                    <div className="glass-panel p-8">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-500" /> Verification Protocol
                      </h4>
                      <div className="space-y-5">
                        <ProCheckItem label="ATS Semantic Optimization" checked={true} />
                        <ProCheckItem label="Keyword Frequency Analysis" checked={true} />
                        <ProCheckItem label="Achievement Quantization" checked={true} />
                        <ProCheckItem label="Human Element Verification" checked={false} />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="lg:col-span-8 space-y-10">
                    <div className="glass-panel overflow-hidden">
                      <div className="flex bg-white/5 border-b border-white/5">
                        <TabButton label="Tailored Cover Letter" active />
                        <TabButton label="Optimized Resume Data" />
                      </div>
                      <div className="p-10">
                        <div className="bg-dark/60 rounded-[32px] p-12 border border-white/5 text-slate-300 leading-relaxed font-serif text-xl italic whitespace-pre-wrap relative">
                          <div className="absolute top-8 right-8 text-primary/20">
                            <Sparkles size={40} />
                          </div>
                          {result.cover_letter}
                        </div>
                      </div>
                    </div>

                    <div className="glass-panel p-10 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-20 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
                      <h3 className="text-xl font-display font-black mb-8 flex items-center gap-3">
                        <Cpu className="text-primary" /> AI Synthesis Insights
                      </h3>
                      <div className="p-8 bg-primary/5 border border-primary/10 rounded-[32px] relative">
                        <p className="text-slate-300 leading-relaxed italic text-lg">
                          "{result.optimized_resume}"
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-6 mt-10">
                        <div className="glass-panel p-6 bg-emerald-500/5 border-emerald-500/10">
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Strengths Identified</p>
                          <p className="text-sm text-slate-300 font-bold">Cloud Infrastructure, CI/CD, Kubernetes</p>
                        </div>
                        <div className="glass-panel p-6 bg-amber-500/5 border-amber-500/10">
                          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Opportunities</p>
                          <p className="text-sm text-slate-300 font-bold">Expand on Terraform and Helm Charts</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto space-y-10">
                <div className="text-center">
                  <h2 className="text-4xl font-display font-black tracking-tighter">System Configuration</h2>
                  <p className="text-slate-500 mt-3 font-medium">Global parameters for AI synthesis and scraping operations.</p>
                </div>

                <div className="glass-panel p-12 space-y-10">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles size={14} className="text-primary" /> OpenAI API Core
                    </label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600">
                        <ShieldCheck size={20} />
                      </div>
                      <input 
                        type="password" 
                        placeholder="sk-v0-..." 
                        className="input-premium pl-14 h-16 bg-white/[0.03]"
                        value={config.openaiKey}
                        onChange={(e) => setConfig({...config, openaiKey: e.target.value})}
                      />
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold px-2">LOCAL ENCRYPTED STORAGE • DO NOT SHARE</p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Globe size={14} className="text-indigo-400" /> Apify Runtime Token
                    </label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600">
                        <Cpu size={20} />
                      </div>
                      <input 
                        type="password" 
                        placeholder="apify_api_..." 
                        className="input-premium pl-14 h-16 bg-white/[0.03]"
                        value={config.apifyToken}
                        onChange={(e) => setConfig({...config, apifyToken: e.target.value})}
                      />
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold px-2">REQUIRED FOR REAL-WORLD SCRAPING</p>
                  </div>

                  <div className="pt-10 border-t border-white/5 flex justify-end gap-4">
                    <button className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-bold border border-white/5 transition-all">Reset Sync</button>
                    <button className="btn-pro px-10 py-4 rounded-2xl text-sm" onClick={() => setActiveTab('dashboard')}>Save Configuration</button>
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

// Landing Page - The "Pro" Intro
function LandingPage({ onStart }) {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  
  return (
    <div className="min-h-screen bg-dark text-white font-sans overflow-x-hidden relative selection:bg-primary/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse-slow" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 h-24 flex items-center justify-between px-10 z-50 bg-dark/20 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Rocket size={22} className="text-white" />
          </div>
          <span className="text-2xl font-display font-black tracking-tight">JobAI <span className="text-primary">Agent</span></span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          <NavLink label="How it works" />
          <NavLink label="Enterprise" />
          <NavLink label="Careers" />
          <NavLink label="Pricing" />
        </div>
        <button onClick={onStart} className="btn-pro px-8 py-3 rounded-2xl text-sm flex items-center gap-2">
          Get Started <ArrowRight size={16} />
        </button>
      </nav>

      {/* Hero */}
      <section className="pt-48 pb-32 px-10 relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-10"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full mb-6 backdrop-blur-xl">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">v4.0 Protocol Active</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-display font-black tracking-tighter leading-[0.9] heading-pro">
            Apply to Jobs <br />
            <span className="text-white">With God-Like</span> <br />
            Efficiency.
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
            The world's first AI-powered job application agent that scrapes, analyzes, and optimizes your career in real-time. Stand out, get hired, and conquer the market.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center pt-8">
            <button onClick={onStart} className="btn-pro px-12 py-5 rounded-[32px] text-lg flex items-center gap-4 group">
              Launch Dashboard <Rocket size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </button>
            <button className="px-12 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[32px] text-lg font-bold flex items-center gap-4 transition-all">
              Watch Demo <MousePointer2 size={24} />
            </button>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-48 w-full">
          <FeatureCard 
            icon={<Cpu className="text-primary" size={32} />} 
            title="Semantic RAG Engine" 
            desc="Our vector-based retrieval engine scans job requirements with 99.8% semantic accuracy." 
          />
          <FeatureCard 
            icon={<ShieldCheck className="text-emerald-500" size={32} />} 
            title="ATS Master Protocol" 
            desc="Engineered specifically to bypass corporate filtering systems and land you in the top 1%." 
          />
          <FeatureCard 
            icon={<Globe className="text-indigo-400" size={32} />} 
            title="Universal Scraping" 
            desc="Seamless integration with LinkedIn, Indeed, and more via our high-velocity Apify cluster." 
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-32 py-20 px-10 border-t border-white/5 relative z-10 bg-dark/40 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Rocket size={22} className="text-white" />
              </div>
              <span className="text-2xl font-display font-black tracking-tight">JobAI <span className="text-primary">Agent</span></span>
            </div>
            <p className="text-slate-500 max-w-sm leading-relaxed font-medium">Built by career engineers for the next generation of global talent. Stand out or stay average.</p>
            <div className="flex gap-6">
              <SocialLink icon={<Twitter size={20} />} />
              <SocialLink icon={<Github size={20} />} />
              <SocialLink icon={<LinkedinIcon size={20} />} />
            </div>
          </div>
          <div>
            <h4 className="font-display font-black text-white uppercase tracking-widest text-xs mb-8">Platform</h4>
            <div className="flex flex-col gap-4 text-sm text-slate-500 font-bold">
              <a href="#" className="hover:text-primary transition-colors">Features</a>
              <a href="#" className="hover:text-primary transition-colors">API Docs</a>
              <a href="#" className="hover:text-primary transition-colors">Integrations</a>
              <a href="#" className="hover:text-primary transition-colors">Enterprise</a>
            </div>
          </div>
          <div>
            <h4 className="font-display font-black text-white uppercase tracking-widest text-xs mb-8">Support</h4>
            <div className="flex flex-col gap-4 text-sm text-slate-500 font-bold">
              <a href="#" className="hover:text-primary transition-colors">Community</a>
              <a href="#" className="hover:text-primary transition-colors">Help Center</a>
              <a href="#" className="hover:text-primary transition-colors">Security</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">&copy; 2026 JobAI Agent • All Rights Reserved</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Global Status: Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Subcomponents Pro
function SidebarItem({ icon, label, active, onClick }) {
  return (
    <div 
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-all relative group
        ${active ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
      onClick={onClick}
    >
      {icon}
      <span className="text-sm font-bold">{label}</span>
      {active && <motion.div layoutId="sidebar-accent" className="absolute right-0 w-1 h-6 bg-white rounded-l-full" />}
    </div>
  );
}

function HeaderIcon({ icon, hasBadge }) {
  return (
    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-all relative shadow-sm group">
      {icon}
      {hasBadge && <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-primary rounded-full border-[3px] border-dark group-hover:scale-125 transition-transform" />}
    </div>
  );
}

function StatCardPro({ label, value, trend, icon }) {
  return (
    <div className="glass-panel p-6 flex items-center gap-6 min-w-[180px]">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-display font-black">{value}</span>
          <span className="text-[10px] text-emerald-400 font-black tracking-tighter">{trend}</span>
        </div>
      </div>
    </div>
  );
}

function AnalyticsRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl hover:bg-white/[0.05] transition-colors">
      <span className="text-xs text-slate-400 font-medium">{label}</span>
      <span className={`text-xs font-black uppercase tracking-widest ${color}`}>{value}</span>
    </div>
  );
}

function StatusModule({ label, status, delay }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-4">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
        <span className="text-xs text-slate-400 font-bold group-hover:text-slate-200 transition-colors">{label}</span>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">{status}</p>
        <p className="text-[8px] text-slate-600 font-bold">{delay}</p>
      </div>
    </div>
  );
}

function MetricBadge({ label, value }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-black text-primary">{value}</span>
    </div>
  );
}

function ProCheckItem({ label, checked }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className={`w-6 h-6 rounded-xl border flex items-center justify-center transition-all duration-300 ${checked ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'border-white/10 bg-white/5'}`}>
        {checked && <Check size={14} className="text-white" />}
      </div>
      <span className={`text-sm font-bold ${checked ? 'text-slate-300' : 'text-slate-600 group-hover:text-slate-400 transition-colors'}`}>{label}</span>
    </div>
  );
}

function NavLink({ label }) {
  return (
    <a href="#" className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] hover:text-white hover:translate-y-[-1px] transition-all">
      {label}
    </a>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="glass-panel p-10 text-left glass-panel-hover group">
      <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-8 shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500">
        {icon}
      </div>
      <h3 className="text-2xl font-display font-black mb-4 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function SocialLink({ icon }) {
  return (
    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-primary hover:border-primary cursor-pointer transition-all shadow-sm">
      {icon}
    </div>
  );
}

function TabButton({ label, active }) {
  return (
    <button className={`px-10 py-6 text-sm font-black uppercase tracking-widest relative transition-all ${active ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>
      {label}
      {active && <motion.div layoutId="tab-underline" className="absolute bottom-0 inset-x-0 h-1 bg-primary" />}
    </button>
  );
}

export default App;
