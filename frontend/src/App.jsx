import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Daily from '@daily-co/daily-js';
import { 
  Upload, Link as LinkIcon, FileText, CheckCircle, Download, 
  Loader2, Sparkles, LayoutDashboard, History, Settings, 
  Briefcase, User, Search, Bell, ChevronRight, Zap,
  AlertCircle, ShieldCheck, Globe, Cpu, MousePointer2, 
  ArrowRight, Star, Target, Rocket, Layers, BarChart3,
  ExternalLink, Code, Send, Users, Video,
  Check, X, Play
} from 'lucide-react';

// Use aliases for brand icons that don't exist in Lucide
const Github = Code;
const Twitter = Send;
const LinkedinIcon = Users;
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// Helper Components
function NavLink({ label }) {
  return (
    <a href="#" className="nav-link px-3 py-2 text-sm font-medium">
      {label}
    </a>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
        active
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <div className={active ? 'text-primary' : 'text-gray-500'}>
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function HeaderIcon({ icon, hasBadge }) {
  return (
    <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
      {icon}
      {hasBadge && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      )}
    </button>
  );
}

function StatCardPro({ label, value, trend, icon }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-lg">
        <div className="text-primary">{icon}</div>
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
}

function AnalyticsRow({ label, value, color }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function StatusModule({ label, status, delay }) {
  return (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
        status === 'Optimal' ? 'bg-green-100 text-green-700' :
        status === 'Scaling' ? 'bg-blue-100 text-blue-700' :
        'bg-gray-100 text-gray-700'
      }`}>
        {status}
      </span>
    </div>
  );
}

function MetricBadge({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-primary">{value}</div>
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
    </div>
  );
}

const API_BASE = 'http://localhost:8001';

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

  // Video interview state
  const [videoRoom, setVideoRoom] = useState(null);
  const [isVideoInterviewActive, setIsVideoInterviewActive] = useState(false);
  const videoRef = useRef(null);

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

  const startVideoInterview = async () => {
    try {
      const response = await axios.post(`${API_BASE}/interview/create-room`);
      
      if (response.data.success) {
        setVideoRoom(response.data);
        setIsVideoInterviewActive(true);
        
        // Initialize Daily.co call
        const callFrame = Daily.createFrame(videoRef.current, {
          iframeStyle: {
            width: '100%',
            height: '400px',
            border: '0',
            borderRadius: '12px'
          }
        });
        
        await callFrame.join({ url: response.data.room_url });
        
        // Store call frame for cleanup
        setVideoRoom(prev => ({ ...prev, callFrame }));
      } else {
        if (response.data.setup_instructions) {
          setError(`Video Interview Setup Required: ${response.data.error}\n\n${response.data.setup_instructions}`);
        } else {
          setError(response.data.error || 'Failed to create video room');
        }
      }
    } catch (err) {
      console.error('Error starting video interview:', err);
      setError('Failed to start video interview. Please check your Daily.co API key configuration.');
    }
  };

  const endVideoInterview = async () => {
    if (videoRoom?.callFrame) {
      await videoRoom.callFrame.leave();
    }
    setVideoRoom(null);
    setIsVideoInterviewActive(false);
  };

  if (activeTab === 'landing') {
    return <LandingPage onStart={() => setActiveTab('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Professional Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-30">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-gray-200">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Rocket size={18} className="text-white" />
            </div>
            <span className="text-lg font-display font-bold">JobAI Pro</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard' || activeTab === 'results'} onClick={() => setActiveTab('dashboard')} />
            <SidebarItem icon={<Search size={20} />} label="Job Search" active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
            <SidebarItem icon={<History size={20} />} label="Applications" active={activeTab === 'applications'} onClick={() => setActiveTab('applications')} />
            <SidebarItem icon={<Video size={20} />} label="Interviews" active={activeTab === 'interviews'} onClick={() => setActiveTab('interviews')} />
            <SidebarItem icon={<FileText size={20} />} label="Resume Hub" active={activeTab === 'resume-hub'} onClick={() => setActiveTab('resume-hub')} />
            <SidebarItem icon={<BarChart3 size={20} />} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
            <SidebarItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">LS</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">Lucky Singh</div>
                <div className="text-xs text-gray-500">Pro Plan</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, or skills..."
                  className="input-field pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchJobs()}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <HeaderIcon icon={<Bell size={18} />} hasBadge />
              <HeaderIcon icon={<Users size={18} />} />
              <HeaderIcon icon={<Settings size={18} />} />
              <button className="btn-primary px-4 py-2 text-sm" onClick={handleSearchJobs}>
                Search Jobs
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                {/* Welcome Section */}
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, Lucky! 👋</h1>
                  <p className="text-gray-600">Here's what's happening with your job search today.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Applications Sent</p>
                        <p className="text-2xl font-bold text-gray-900">247</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <FileText size={24} className="text-primary" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <ArrowRight size={14} className="text-accent rotate-[-90deg]" />
                      <span className="text-sm text-accent font-medium">+12 this week</span>
                    </div>
                  </div>

                  <div className="card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Interview Requests</p>
                        <p className="text-2xl font-bold text-gray-900">12</p>
                      </div>
                      <div className="p-3 bg-secondary/10 rounded-lg">
                        <Video size={24} className="text-secondary" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <ArrowRight size={14} className="text-accent rotate-[-90deg]" />
                      <span className="text-sm text-accent font-medium">+3 this week</span>
                    </div>
                  </div>

                  <div className="card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Response Rate</p>
                        <p className="text-2xl font-bold text-gray-900">89%</p>
                      </div>
                      <div className="p-3 bg-accent/10 rounded-lg">
                        <Target size={24} className="text-accent" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <ArrowRight size={14} className="text-accent rotate-[-90deg]" />
                      <span className="text-sm text-accent font-medium">+5% this month</span>
                    </div>
                  </div>

                  <div className="card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Profile Views</p>
                        <p className="text-2xl font-bold text-gray-900">1,429</p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Users size={24} className="text-purple-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <ArrowRight size={14} className="text-accent rotate-[-90deg]" />
                      <span className="text-sm text-accent font-medium">+127 this week</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Applications */}
                  <div className="lg:col-span-2">
                    <div className="card p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
                        <button className="text-primary text-sm font-medium hover:text-primary/80">View all</button>
                      </div>

                      <div className="space-y-4">
                        {history.slice(0, 5).map(item => (
                          <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Briefcase size={18} className="text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{item.job}</h4>
                                <p className="text-sm text-gray-600">{item.company} • {item.date}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-sm font-semibold text-accent">{item.score}% match</div>
                                <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  item.status === 'Applied' ? 'bg-accent/10 text-accent' :
                                  item.status === 'Tailored' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {item.status}
                                </div>
                              </div>
                              <ChevronRight size={18} className="text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions & Video Interview */}
                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="card p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <button className="w-full flex items-center gap-3 p-3 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg text-left transition-colors group">
                          <Upload size={18} className="text-primary" />
                          <span className="font-medium text-primary">Upload Resume</span>
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 bg-secondary/5 hover:bg-secondary/10 border border-secondary/20 rounded-lg text-left transition-colors group">
                          <Search size={18} className="text-secondary" />
                          <span className="font-medium text-secondary">Find Jobs</span>
                        </button>
                        <button
                          onClick={startVideoInterview}
                          className="w-full flex items-center gap-3 p-3 bg-accent/5 hover:bg-accent/10 border border-accent/20 rounded-lg text-left transition-colors group"
                        >
                          <Video size={18} className="text-accent" />
                          <span className="font-medium text-accent">Practice Interview</span>
                        </button>
                      </div>
                    </div>

                    {/* Video Interview Status */}
                    {isVideoInterviewActive && videoRoom && (
                      <div className="card p-6 border-accent/20 bg-accent/5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                            <Video size={16} className="text-accent" />
                          </div>
                          <h4 className="font-semibold text-gray-900">Video Interview Active</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Your interview room is ready! Share this link with your interviewer:
                        </p>
                        <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4">
                          <code className="text-xs text-gray-800 break-all">{videoRoom.room_url}</code>
                        </div>
                        <div ref={videoRef} className="w-full bg-gray-900 rounded-lg overflow-hidden mb-4" style={{height: '200px'}}></div>
                        <button
                          onClick={endVideoInterview}
                          className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                          End Interview
                        </button>
                      </div>
                    )}

                    {/* Upcoming Interviews */}
                    <div className="card p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Interviews</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Video size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">Google - Software Engineer</p>
                            <p className="text-xs text-gray-600">Tomorrow at 2:00 PM</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Video size={16} className="text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">Meta - Frontend Developer</p>
                            <p className="text-xs text-gray-600">Friday at 10:00 AM</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8">
                <div className="card p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Job Search Results</h3>
                      <p className="text-gray-600 text-sm mt-1">Found {searchResults.length} opportunities matching your criteria</p>
                    </div>
                    <button onClick={() => setSearchResults([])} className="btn-secondary px-4 py-2 text-sm">
                      Clear Results
                    </button>
                  </div>

                  <div className="space-y-4">
                    {searchResults.map((job, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                        onClick={() => { setJobUrl(job.url); setSearchResults([]); setActiveTab('results'); }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Briefcase size={20} className="text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{job.title}</h4>
                            <p className="text-sm text-gray-600">{job.snippet?.substring(0, 100)}...</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="badge badge-primary">LinkedIn</span>
                          <ArrowRight size={18} className="text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Results Page */}
            {activeTab === 'results' && result && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <button onClick={() => setActiveTab('dashboard')} className="btn-secondary px-4 py-2 text-sm flex items-center gap-2">
                      <ArrowRight size={16} className="rotate-180" /> Back to Dashboard
                    </button>
                    <div className="flex gap-3">
                      <button onClick={() => handleDownload(result.optimized_resume, 'Optimized_Resume.pdf')} className="btn-primary px-4 py-2 text-sm">
                        Download Resume
                      </button>
                      <button onClick={() => handleDownload(result.cover_letter, 'Cover_Letter.pdf')} className="btn-secondary px-4 py-2 text-sm">
                        Download Cover Letter
                      </button>
                    </div>
                  </div>

                  {/* Match Score */}
                  <div className="card p-8 text-center">
                    <div className="w-32 h-32 mx-auto mb-6 relative">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
                        <motion.circle
                          cx="60" cy="60" r="54"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={339.292}
                          initial={{ strokeDashoffset: 339.292 }}
                          animate={{ strokeDashoffset: 339.292 - (339.292 * result.match_score) / 100 }}
                          transition={{ duration: 2, ease: "easeOut" }}
                          className="text-primary"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-primary">{result.match_score}%</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Match Score</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellent Match!</h3>
                    <p className="text-gray-600">Your profile aligns well with this position. Here's your optimized application.</p>
                  </div>

                  {/* Application Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Optimized Resume</h4>
                      <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">{result.optimized_resume}</pre>
                      </div>
                    </div>

                    <div className="card p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h4>
                      <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">{result.cover_letter}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );

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

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                  {/* Pipeline Visualization */}
                  <div className="xl:col-span-4 glass-panel p-6 bg-primary/5 border-primary/20">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <Cpu size={16} className="text-primary" /> Active Pipeline Status
                      </h3>
                      <div className="flex gap-2">
                        <PipelineNode label="Scrape" active={isProcessing} />
                        <div className="w-8 h-px bg-white/10 mt-2.5" />
                        <PipelineNode label="Analyze" active={isProcessing} />
                        <div className="w-8 h-px bg-white/10 mt-2.5" />
                        <PipelineNode label="Synthesize" active={isProcessing} />
                        <div className="w-8 h-px bg-white/10 mt-2.5" />
                        <PipelineNode label="Export" active={false} />
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Card */}
                  <div className="xl:col-span-3 glass-panel p-10 relative overflow-hidden group">
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

                      {/* Video Interview Section */}
                      <div className="mt-8 pt-8 border-t border-white/10">
                        <h4 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                          <Video size={16} className="text-primary" /> Real-Time Interview
                        </h4>
                        {isVideoInterviewActive && videoRoom ? (
                          <div className="space-y-4">
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                              <p className="text-green-400 text-sm mb-2">Video room created successfully!</p>
                              <p className="text-xs text-slate-400 mb-3">Share this link with your interviewer:</p>
                              <div className="bg-white/5 rounded-lg p-2 break-all">
                                <code className="text-white text-xs">{videoRoom.room_url}</code>
                              </div>
                            </div>
                            <div ref={videoRef} className="w-full bg-black/20 rounded-xl overflow-hidden" style={{height: '300px'}}></div>
                            <button
                              onClick={endVideoInterview}
                              className="w-full py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm"
                            >
                              End Interview
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={startVideoInterview}
                            className="w-full py-3 bg-primary/20 text-primary rounded-xl hover:bg-primary/30 transition-all text-sm font-bold"
                          >
                            Start Video Interview
                          </button>
                        )}
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

// Landing Page - Professional SaaS Design
function LandingPage({ onStart }) {
  const { scrollYProgress } = useScroll();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans overflow-x-hidden">
      {/* Professional Navigation */}
      <nav className="fixed top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Rocket size={18} className="text-white" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">JobAI <span className="text-primary">Pro</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <NavLink label="Features" />
            <NavLink label="Solutions" />
            <NavLink label="Pricing" />
            <NavLink label="About" />
          </div>

          <div className="flex items-center gap-4">
            <button className="btn-ghost px-4 py-2 text-sm">Sign In</button>
            <button onClick={onStart} className="btn-primary px-6 py-2 text-sm">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 badge badge-primary">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                AI-Powered Career Platform
              </div>

              <h1 className="text-hero text-gray-900">
                Land Your Dream Job with
                <span className="text-primary block">AI Precision</span>
              </h1>

              <p className="text-body max-w-lg">
                Transform your job search with intelligent automation. Our AI analyzes thousands of opportunities,
                optimizes your applications, and connects you with the perfect roles.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={onStart} className="btn-primary px-8 py-4 text-base flex items-center justify-center gap-2">
                  Start Free Trial <ArrowRight size={18} />
                </button>
                <button className="btn-secondary px-8 py-4 text-base flex items-center justify-center gap-2">
                  <Play size={18} /> Watch Demo
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-8 pt-8">
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-accent" />
                  <span className="text-sm font-medium text-gray-600">Free 14-day trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-accent" />
                  <span className="text-sm font-medium text-gray-600">No credit card required</span>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="card-pro p-8 bg-white shadow-2xl">
                {/* Mock Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <BarChart3 size={16} className="text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">JobAI Dashboard</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>

                {/* Mock Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">247</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Applications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">89%</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Match Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">12</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Interviews</div>
                  </div>
                </div>

                {/* Mock Job Cards */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Briefcase size={18} className="text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-900">Senior Software Engineer</div>
                        <div className="text-xs text-gray-500">Google • Mountain View, CA</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-accent">95% match</div>
                      <div className="text-xs text-gray-500">2 hours ago</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <Code size={18} className="text-secondary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-900">Full Stack Developer</div>
                        <div className="text-xs text-gray-500">Meta • Menlo Park, CA</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-accent">87% match</div>
                      <div className="text-xs text-gray-500">5 hours ago</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-secondary/10 rounded-full blur-xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-section text-gray-900 mb-4">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="text-body max-w-2xl mx-auto">
              Our comprehensive platform combines AI-powered insights, automated applications,
              and professional networking tools to accelerate your career growth.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="feature-card"
            >
              <div className="feature-icon">
                <Search size={32} />
              </div>
              <h3 className="feature-title">Smart Job Matching</h3>
              <p className="feature-description">
                AI analyzes your profile and matches you with relevant opportunities
                across 1000+ companies and platforms.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="feature-card"
            >
              <div className="feature-icon">
                <FileText size={32} />
              </div>
              <h3 className="feature-title">Resume Optimization</h3>
              <p className="feature-description">
                Automatically tailor your resume and cover letters for each application
                with ATS-optimized formatting.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="feature-card"
            >
              <div className="feature-icon">
                <Video size={32} />
              </div>
              <h3 className="feature-title">Video Interviews</h3>
              <p className="feature-description">
                Practice interviews with AI feedback and conduct real-time video calls
                with recruiters seamlessly.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="feature-card"
            >
              <div className="feature-icon">
                <BarChart3 size={32} />
              </div>
              <h3 className="feature-title">Analytics Dashboard</h3>
              <p className="feature-description">
                Track your application success rates, interview performance,
                and career progress with detailed insights.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="feature-card"
            >
              <div className="feature-icon">
                <Users size={32} />
              </div>
              <h3 className="feature-title">Networking Tools</h3>
              <p className="feature-description">
                Connect with industry professionals, join communities,
                and expand your professional network.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="feature-card"
            >
              <div className="feature-icon">
                <Zap size={32} />
              </div>
              <h3 className="feature-title">Automation Engine</h3>
              <p className="feature-description">
                Automate repetitive tasks like application tracking,
                follow-up emails, and deadline reminders.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-section mb-4">Trusted by Professionals Worldwide</h2>
            <p className="text-body text-gray-300 max-w-2xl mx-auto">
              Join thousands of successful professionals who have accelerated their careers with JobAI Pro.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="stat-number">50K+</div>
              <div className="stat-label text-gray-300">Active Users</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="stat-number">1M+</div>
              <div className="stat-label text-gray-300">Applications Sent</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="stat-number">85%</div>
              <div className="stat-label text-gray-300">Success Rate</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="stat-number">500+</div>
              <div className="stat-label text-gray-300">Partner Companies</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-section">
              Ready to Transform Your Job Search?
            </h2>
            <p className="text-body text-blue-100 max-w-2xl mx-auto">
              Join thousands of professionals who have landed their dream jobs with JobAI Pro.
              Start your free trial today and see the difference AI can make.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={onStart} className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                Start Free Trial <ArrowRight size={18} />
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors">
                Schedule Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Rocket size={18} className="text-white" />
                </div>
                <span className="text-xl font-display font-bold">JobAI Pro</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered career acceleration platform for modern professionals.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 JobAI Pro. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <LinkedinIcon size={18} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Video Demo Section */}
      <section className="py-32 px-10 relative z-10 max-w-6xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/20">Process Walkthrough</div>
            <h2 className="text-5xl font-display font-black tracking-tight">See JobAI <br /> in Action.</h2>
            <p className="text-slate-400 text-lg leading-relaxed font-medium">
              Watch how our agent identifies job clusters, synthesizes ATS-optimized resumes, and handles the deployment phase with zero human intervention required.
            </p>
            <ul className="space-y-5">
              <li className="flex items-center gap-4 text-sm font-bold text-slate-300">
                <div className="w-6 h-6 bg-emerald-500/20 text-emerald-500 rounded-lg flex items-center justify-center"><Check size={14} /></div>
                Real-time LinkedIn Scraping
              </li>
              <li className="flex items-center gap-4 text-sm font-bold text-slate-300">
                <div className="w-6 h-6 bg-emerald-500/20 text-emerald-500 rounded-lg flex items-center justify-center"><Check size={14} /></div>
                Neural Resume Synthesis
              </li>
              <li className="flex items-center gap-4 text-sm font-bold text-slate-300">
                <div className="w-6 h-6 bg-emerald-500/20 text-emerald-500 rounded-lg flex items-center justify-center"><Check size={14} /></div>
                One-Click Tailored Exports
              </li>
            </ul>
          </div>
          
          {/* Video Player */}
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="glass-panel p-2 rounded-[32px] overflow-hidden relative z-10 shadow-2xl">
              <div className="aspect-video bg-dark rounded-[30px] overflow-hidden flex items-center justify-center relative">
                {/* Placeholder for Video Embed */}
                <iframe 
                  className="w-full h-full border-none" 
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&mute=1" 
                  title="Demo Video" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
                <div className="absolute inset-0 bg-dark/40 flex items-center justify-center group-hover:opacity-0 transition-opacity pointer-events-none">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center border border-white/20">
                    <Zap className="text-white fill-white" size={32} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Prop with Real Images */}
      <section className="py-32 px-10 relative z-10 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-display font-black tracking-tight">Built for Competitive Markets.</h2>
            <p className="text-slate-500 font-medium">Join 5,000+ engineers landing roles at Tier-1 companies.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureWithImage 
              img="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000"
              title="Team Sync"
              desc="Optimized for collaborative environments and high-growth startups."
            />
            <FeatureWithImage 
              img="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1000"
              title="Remote Ready"
              desc="Specialized patterns for globally distributed tech companies."
            />
            <FeatureWithImage 
              img="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1000"
              title="Rapid Growth"
              desc="Engineered to handle massive application volume with ease."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-12 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg">
              <Rocket size={16} className="text-white" />
            </div>
            <span className="text-lg font-display font-extrabold tracking-tight">JobAI <span className="text-primary">Agent</span></span>
          </div>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Designed by Software Engineers in San Francisco</p>
          <div className="flex gap-8">
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Twitter size={18} /></a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Github size={18} /></a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><LinkedinIcon size={18} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureWithImage({ img, title, desc }) {
  return (
    <div className="group relative rounded-[32px] overflow-hidden aspect-[4/5] glass-panel border-white/5">
      <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700 grayscale group-hover:grayscale-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
      <div className="absolute bottom-10 left-10 right-10">
        <h4 className="text-2xl font-display font-black mb-2">{title}</h4>
        <p className="text-slate-400 text-sm font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// Subcomponents Pro
function PipelineNode({ label, active }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${active ? 'bg-primary border-primary shadow-lg shadow-primary/40 animate-pulse' : 'bg-white/5 border-white/10'}`}>
        {active && <Zap size={12} className="text-white" />}
      </div>
      <span className={`text-[9px] font-black uppercase tracking-tighter ${active ? 'text-primary' : 'text-slate-600'}`}>{label}</span>
    </div>
  );
}

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
