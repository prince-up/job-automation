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

  const handleProcess = async () => {
    if (!file || !jobUrl) {
      setError('Please upload a resume and provide a Job URL.');
      return;
    }

    setIsProcessing(true);
    setError('');
    
    try {
      // 1. Upload Resume
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await axios.post('http://localhost:8000/upload-resume', formData);
      const resumeText = uploadRes.data.resume_text;

      // 2. Process with Job URL
      const processRes = await axios.post('http://localhost:8000/process-job', {
        url: jobUrl,
        resume_text: resumeText
      });

      setResult(processRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong during processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold gradient-text">JobAI Agent</h1>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-white transition">Dashboard</a>
          <a href="#" className="hover:text-white transition">History</a>
          <a href="#" className="hover:text-white transition">Settings</a>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Inputs */}
        <section className="space-y-6">
          <div className="glass-morphism p-8 space-y-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="text-indigo-400" size={20} />
              Setup Application
            </h2>

            {/* Resume Upload */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Upload Resume (PDF)</label>
              <div 
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer
                  ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-indigo-500/50'}`}
                onClick={() => document.getElementById('resume-input').click()}
              >
                <input 
                  type="file" 
                  id="resume-input" 
                  className="hidden" 
                  accept=".pdf" 
                  onChange={handleFileUpload}
                />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="text-emerald-500" size={32} />
                    <span className="text-emerald-400 font-medium">{file.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <Upload size={32} />
                    <span>Click or drag to upload PDF</span>
                  </div>
                )}
              </div>
            </div>

            {/* Job URL Input */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400 font-medium flex items-center gap-2">
                <LinkIcon size={14} /> Job URL
              </label>
              <input 
                type="text" 
                placeholder="https://linkedin.com/jobs/..." 
                className="input-field"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                {error}
              </div>
            )}

            <button 
              className="btn-primary w-full justify-center disabled:opacity-50"
              onClick={handleProcess}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Optimize Application
                </>
              )}
            </button>
          </div>

          <div className="glass-morphism p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">How it works</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2">
                <span className="text-indigo-400">01</span>
                Upload your latest resume in PDF format.
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400">02</span>
                Paste the URL of the job you want to apply for.
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400">03</span>
                AI customizes your bullet points and writes a cover letter.
              </li>
            </ul>
          </div>
        </section>

        {/* Right Column: Results */}
        <section>
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-morphism h-full flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                  <FileText className="text-slate-600" size={40} />
                </div>
                <h3 className="text-xl font-medium text-slate-400">Awaiting Input</h3>
                <p className="text-slate-500 mt-2">Results will appear here after optimization.</p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Match Score Card */}
                <div className="glass-morphism p-8 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-300">Job Match Score</h3>
                    <p className="text-slate-500 text-sm">Based on your skills & job requirements</p>
                  </div>
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle 
                        cx="48" cy="48" r="40" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        className="text-slate-800"
                      />
                      <circle 
                        cx="48" cy="48" r="40" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * result.match_score) / 100}
                        className="text-indigo-500"
                      />
                    </svg>
                    <span className="absolute text-2xl font-bold">{result.match_score}%</span>
                  </div>
                </div>

                {/* Cover Letter Section */}
                <div className="glass-morphism p-8 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-slate-300">Personalized Cover Letter</h3>
                    <button className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1 transition">
                      <Download size={14} /> Download PDF
                    </button>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-6 text-sm text-slate-300 leading-relaxed font-mono">
                    {result.cover_letter}
                  </div>
                </div>

                {/* Suggestions Section */}
                <div className="glass-morphism p-8 space-y-4">
                  <h3 className="font-semibold text-slate-300">AI Resume Optimization</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                      <h4 className="text-xs font-bold text-emerald-500 uppercase mb-2">Recommended Summary</h4>
                      <p className="text-sm text-slate-300">{result.optimized_resume}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto mt-20 py-8 border-t border-slate-800 text-center text-slate-500 text-sm">
        <p>&copy; 2026 JobAI Agent - Powered by OpenAI</p>
      </footer>
    </div>
  );
}

export default App;
