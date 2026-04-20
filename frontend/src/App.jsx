import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Link as LinkIcon, FileText, CheckCircle, Download, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [file, setFile] = useState(null);
  const [jobUrl, setJobUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please upload a valid PDF resume.');
    }
  };

  const [history, setHistory] = useState([
    { id: 1, job: 'Senior DevOps Engineer', company: 'Google', date: '2024-04-18', score: 92 },
    { id: 2, job: 'SRE Lead', company: 'Meta', date: '2024-04-15', score: 78 },
  ]);

  const handleDownload = async (content, filename) => {
    try {
      const response = await axios.post('http://localhost:8000/generate-pdf', { content }, { responseType: 'blob' });
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
      const uploadRes = await axios.post('http://localhost:8000/upload-resume', formData);
      const resumeText = uploadRes.data.resume_text;

      const processRes = await axios.post('http://localhost:8000/process-job', {
        url: jobUrl,
        resume_text: resumeText
      });

      setResult(processRes.data);
      // Add to history
      setHistory([{ 
        id: Date.now(), 
        job: 'New Application', 
        company: new URL(jobUrl).hostname, 
        date: new Date().toISOString().split('T')[0], 
        score: processRes.data.match_score 
      }, ...history]);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong during processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text tracking-tight">JobAI Agent</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Pro Edition</p>
          </div>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-400">
          <a href="#" className="hover:text-white transition-colors relative group">
            Dashboard
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform"></span>
          </a>
          <a href="#" className="hover:text-white transition-colors">Applications</a>
          <a href="#" className="hover:text-white transition-colors">Career Path</a>
          <div className="h-5 w-px bg-slate-800"></div>
          <button className="text-indigo-400 hover:text-indigo-300 transition-colors">Upgrade to Pro</button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left: Input & History */}
        <div className="xl:col-span-4 space-y-8">
          <section className="glass-morphism p-8 space-y-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <FileText className="text-indigo-400" size={18} />
              </div>
              Optimize Resume
            </h2>

            {/* Resume Upload */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source Resume</label>
              <div 
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300
                  ${file ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800 hover:border-indigo-500/30 hover:bg-indigo-500/5'}`}
                onClick={() => document.getElementById('resume-input').click()}
              >
                <input type="file" id="resume-input" className="hidden" accept=".pdf" onChange={(e) => {
                  const selectedFile = e.target.files[0];
                  if (selectedFile) setFile(selectedFile);
                }} />
                {file ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="text-emerald-500" size={24} />
                    </div>
                    <span className="text-emerald-400 text-sm font-medium">{file.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-500">
                    <Upload size={32} strokeWidth={1.5} />
                    <span className="text-sm font-medium">Click to upload PDF resume</span>
                  </div>
                )}
              </div>
            </div>

            {/* Job URL */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Listing URL</label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Paste LinkedIn or Indeed URL..." 
                  className="input-field pl-12 h-14"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                />
              </div>
            </div>

            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{error}</div>}

            <button 
              className="btn-primary w-full h-14 justify-center shadow-xl shadow-indigo-600/20"
              onClick={handleProcess}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <><Sparkles size={20} /> Generate Tailored Version</>}
            </button>
          </section>

          {/* History */}
          <section className="glass-morphism p-6 overflow-hidden">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 px-2">Recent Applications</h3>
            <div className="space-y-2">
              {history.map(item => (
                <div key={item.id} className="p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">{item.job}</h4>
                      <p className="text-xs text-slate-500 mt-1">{item.company} • {item.date}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${item.score > 80 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {item.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Results */}
        <div className="xl:col-span-8">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-morphism h-full min-h-[600px] flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-10 animate-pulse"></div>
                  <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center relative">
                    <FileText className="text-slate-700" size={48} strokeWidth={1} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-300">Intelligent Analysis Ready</h3>
                <p className="text-slate-500 mt-3 max-w-md mx-auto">Upload your resume and a job link to see the magic happen. We'll optimize your profile for ATS algorithms.</p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Score & Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-morphism p-8 md:col-span-1 flex flex-col items-center justify-center text-center">
                    <div className="relative w-32 h-32 mb-4">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * result.match_score) / 100} className="text-indigo-500" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-white">{result.match_score}%</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Match</span>
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-slate-300">Strong Candidate</h4>
                  </div>

                  <div className="glass-morphism p-8 md:col-span-2">
                    <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2">
                      <Sparkles className="text-amber-400" size={18} />
                      AI Insights
                    </h3>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></div>
                        <p className="text-sm text-slate-400"><span className="text-slate-200 font-medium">Keywords Found:</span> Kubernetes, CI/CD, Terraform, AWS.</p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5"></div>
                        <p className="text-sm text-slate-400"><span className="text-slate-200 font-medium">Tip:</span> Highlight your Helm chart experience to increase score.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Tabs */}
                <div className="glass-morphism overflow-hidden">
                  <div className="flex border-b border-white/5">
                    <button className="px-8 py-5 text-sm font-bold border-b-2 border-indigo-500 text-white">Cover Letter</button>
                    <button className="px-8 py-5 text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors">Optimized Summary</button>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-slate-300">Generated Cover Letter</h3>
                      <button 
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-2 bg-indigo-500/10 px-4 py-2 rounded-lg transition-colors"
                        onClick={() => handleDownload(result.cover_letter, 'Cover_Letter.pdf')}
                      >
                        <Download size={14} /> Download PDF
                      </button>
                    </div>
                    <div className="bg-slate-950/50 rounded-2xl p-8 text-sm text-slate-400 leading-relaxed font-serif border border-white/5 whitespace-pre-wrap">
                      {result.cover_letter}
                    </div>
                  </div>
                </div>

                {/* Resume Highlights */}
                <div className="glass-morphism p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-300">Optimized Resume Summary</h3>
                    <button 
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-2 bg-indigo-500/10 px-4 py-2 rounded-lg transition-colors"
                      onClick={() => handleDownload(result.optimized_resume, 'Resume_Summary.pdf')}
                    >
                      <Download size={14} /> Export Summary
                    </button>
                  </div>
                  <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                    <p className="text-sm text-slate-300 italic leading-relaxed">
                      "{result.optimized_resume}"
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto mt-20 py-8 border-t border-slate-800 text-center text-slate-500 text-sm">
        <p>&copy; 2026 JobAI Agent - Powered by OpenAI</p>
      </footer>
    </div>
  );
}

export default App;
