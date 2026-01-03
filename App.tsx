
import React, { useState, useEffect } from 'react';
import { AppRoute, User, UserRole, Job, Application } from './types';
import { api } from './services/api';
import { analyzeResumeForJob } from './services/geminiService';
import { generateResumeHash } from './services/solanaService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [route, setRoute] = useState<AppRoute>(AppRoute.LANDING);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    api.getJobs().then(setJobs);
  }, [route]);

  const handleLogout = () => {
    setUser(null);
    setRoute(AppRoute.LANDING);
  };

  const renderLanding = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-12">
      <div className="space-y-4">
        <div className="w-20 h-20 solana-gradient rounded-3xl mx-auto flex items-center justify-center text-white text-4xl shadow-2xl">
          <i className="fas fa-shield-alt"></i>
        </div>
        <h1 className="text-5xl font-black">ResumeVerify <span className="text-[#14F195]">MVP</span></h1>
        <p className="text-gray-400 max-w-md mx-auto">Select your portal to begin the hackathon demo.</p>
      </div>

      <div className="flex gap-6">
        <button 
          onClick={() => setRoute(AppRoute.LOGIN)}
          className="w-48 h-48 glass-card rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-[#14F195] transition-all hover:scale-105"
        >
          <i className="fas fa-user-graduate text-4xl text-[#14F195]"></i>
          <span className="font-bold text-lg">Candidate</span>
        </button>
        <button 
          onClick={() => setRoute(AppRoute.LOGIN)}
          className="w-48 h-48 glass-card rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-purple-500 transition-all hover:scale-105"
        >
          <i className="fas fa-user-tie text-4xl text-purple-500"></i>
          <span className="font-bold text-lg">Recruiter</span>
        </button>
      </div>
    </div>
  );

  const renderLogin = () => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      try {
        if (isRegister) {
          await api.register({ email, password: pass, role: UserRole.CANDIDATE });
          setIsRegister(false);
          alert("Registered! Now Login.");
        } else {
          const u = await api.login(email, pass);
          setUser(u);
          setRoute(u.role === UserRole.RECRUITER ? AppRoute.RECRUITER_DASHBOARD : AppRoute.CANDIDATE_DASHBOARD);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card w-full max-w-md p-8 rounded-3xl space-y-8 shadow-2xl">
          <button onClick={() => setRoute(AppRoute.LANDING)} className="text-gray-500 hover:text-white transition-colors">
            <i className="fas fa-arrow-left mr-2"></i> Back
          </button>
          <div className="text-center">
            <h2 className="text-3xl font-bold">{isRegister ? 'Register Candidate' : 'Portal Login'}</h2>
            <p className="text-sm text-gray-500 mt-2">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <input 
              type="email" placeholder="Email" required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#14F195]/50 transition-all"
              value={email} onChange={e => setEmail(e.target.value)}
            />
            <input 
              type="password" placeholder="Password" required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#14F195]/50 transition-all"
              value={pass} onChange={e => setPass(e.target.value)}
            />
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <button type="submit" className="w-full py-4 solana-gradient rounded-xl font-bold text-white shadow-lg">
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="text-center text-sm">
            <button onClick={() => setIsRegister(!isRegister)} className="text-[#14F195] hover:underline">
              {isRegister ? 'Already have an account? Login' : 'New candidate? Register here'}
            </button>
            <div className="mt-6 p-4 bg-white/5 rounded-xl text-[10px] text-gray-500 text-left space-y-1">
              <p className="font-bold text-gray-400 uppercase">Demo Shortcuts:</p>
              <p>• Recruiter Login: abc@abc.com / 12345678</p>
              <p>• Candidate: Register any email</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCandidateDashboard = () => (
    <div className="min-h-screen p-6 max-w-5xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Hello, <span className="text-[#14F195]">{user?.email}</span></h2>
          <p className="text-sm text-gray-500">Available Job Openings</p>
        </div>
        <button onClick={handleLogout} className="text-gray-500 hover:text-red-400">Logout</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center rounded-3xl border-dashed border-2">
            <p className="text-gray-500">No jobs posted yet. Ask the recruiter to post one!</p>
          </div>
        ) : jobs.map(j => (
          <div key={j.id} className="glass-card p-6 rounded-3xl space-y-4 hover:border-[#14F195]/30 transition-all group">
            <div className="flex justify-between">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                j.role === 'Cloud' ? 'bg-blue-500/20 text-blue-400' : 
                j.role === 'DevOps' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'
              }`}>
                {j.role}
              </span>
              <span className="text-xs text-gray-500">{new Date(j.createdAt).toLocaleDateString()}</span>
            </div>
            <h3 className="text-xl font-bold group-hover:text-[#14F195] transition-colors">{j.title}</h3>
            <p className="text-sm text-gray-400 line-clamp-2">{j.description}</p>
            <div className="flex flex-wrap gap-2">
              {j.skills.map(s => <span key={s} className="text-[10px] bg-white/5 px-2 py-1 rounded">{s}</span>)}
            </div>
            <button 
              onClick={() => { setSelectedJob(j); setRoute(AppRoute.APPLY); }}
              className="w-full py-3 bg-white/5 group-hover:bg-[#14F195] group-hover:text-black rounded-xl font-bold transition-all"
            >
              Apply Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderApply = () => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState('');
    const [analysis, setAnalysis] = useState<Application | null>(null);

    const handleApply = async () => {
      if (!file || !selectedJob || !user) return;
      setLoading(true);
      setStatus('Hashing & Uploading...');
      try {
        const hash = await generateResumeHash(file);
        setStatus('AI Analyzing for Job Fit...');
        const result = await analyzeResumeForJob(file, selectedJob);
        
        const app: Application = {
          id: Math.random().toString(36).substr(2, 9),
          jobId: selectedJob.id,
          candidateEmail: user.email,
          resumeHash: hash,
          aiScore: result.score,
          status: 'Verified',
          timestamp: Date.now(),
          analysis: result
        };

        await api.submitApplication(app);
        setAnalysis(app);
        setStatus('Application Submitted!');
      } catch (err) {
        setStatus('Error during submission.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen p-6 max-w-3xl mx-auto space-y-8">
        <button onClick={() => setRoute(AppRoute.CANDIDATE_DASHBOARD)} className="text-gray-500 hover:text-white">
          <i className="fas fa-arrow-left mr-2"></i> Back to Jobs
        </button>

        {!analysis ? (
          <div className="glass-card p-10 rounded-3xl space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold">Applying for {selectedJob?.title}</h2>
              <p className="text-gray-400 mt-2">Please upload your resume in PDF format.</p>
            </div>

            <div className="border-2 border-dashed border-white/10 rounded-3xl p-12 text-center space-y-4">
              <input type="file" accept=".pdf" id="pdf" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
              <label htmlFor="pdf" className="cursor-pointer block">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-file-pdf text-2xl text-red-400"></i>
                </div>
                <span className="font-bold text-gray-300">{file ? file.name : 'Select PDF Resume'}</span>
              </label>
            </div>

            <button 
              disabled={!file || loading}
              onClick={handleApply}
              className="w-full py-4 solana-gradient rounded-xl font-bold text-white shadow-xl disabled:opacity-50"
            >
              {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i> {status}</> : 'Submit & AI Verify'}
            </button>
          </div>
        ) : (
          <div className="glass-card p-8 rounded-3xl space-y-6 border border-[#14F195]/30 animate-scale-up">
            <div className="text-center space-y-2">
              <i className="fas fa-check-circle text-5xl text-[#14F195]"></i>
              <h2 className="text-3xl font-bold">Application Verified</h2>
              <p className="text-sm text-gray-500">Your resume has been hashed and stored on Solana.</p>
            </div>
            
            <div className="bg-black/40 p-6 rounded-2xl flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">AI Integrity Score</p>
                <p className="text-4xl font-black text-[#14F195]">{analysis.aiScore}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Hash Status</p>
                <p className="text-xs font-mono text-gray-400">{analysis.resumeHash.substring(0, 16)}...</p>
              </div>
            </div>

            <button onClick={() => setRoute(AppRoute.CANDIDATE_DASHBOARD)} className="w-full py-4 bg-white/5 rounded-xl font-bold hover:bg-white/10 transition-all">
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderRecruiterDashboard = () => {
    const [apps, setApps] = useState<Application[]>([]);
    const [activeTab, setActiveTab] = useState<'jobs' | 'applicants'>('jobs');

    useEffect(() => {
      api.getApplications().then(setApps);
    }, []);

    return (
      <div className="min-h-screen p-6 max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 font-bold">R</div>
            <div>
              <h2 className="text-2xl font-bold">Recruiter Portal</h2>
              <p className="text-xs text-gray-500">Managing {jobs.length} Active Listings</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setRoute(AppRoute.POST_JOB)} className="px-4 py-2 solana-gradient rounded-lg text-xs font-bold">+ Post Job</button>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-400">Logout</button>
          </div>
        </header>

        <nav className="flex gap-4 border-b border-white/5 pb-2">
          <button 
            onClick={() => setActiveTab('jobs')}
            className={`pb-2 px-4 font-bold text-sm border-b-2 transition-all ${activeTab === 'jobs' ? 'border-purple-500 text-white' : 'border-transparent text-gray-500'}`}
          >
            Posted Jobs
          </button>
          <button 
            onClick={() => setActiveTab('applicants')}
            className={`pb-2 px-4 font-bold text-sm border-b-2 transition-all ${activeTab === 'applicants' ? 'border-purple-500 text-white' : 'border-transparent text-gray-500'}`}
          >
            All Applicants
          </button>
        </nav>

        {activeTab === 'jobs' ? (
          <div className="space-y-4">
            {jobs.map(j => (
              <div key={j.id} className="glass-card p-6 rounded-2xl flex justify-between items-center group">
                <div>
                  <h3 className="text-lg font-bold group-hover:text-purple-400 transition-colors">{j.title}</h3>
                  <p className="text-xs text-gray-500">{j.role} • {apps.filter(a => a.jobId === j.id).length} applicants</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-white/5 rounded-lg text-xs hover:bg-white/10"><i className="fas fa-edit"></i></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {apps.length === 0 ? <p className="text-center py-12 text-gray-500">No applications yet.</p> : apps.map(a => (
              <div key={a.id} className="glass-card p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                    <i className="fas fa-user"></i>
                  </div>
                  <div>
                    <h4 className="font-bold">{a.candidateEmail}</h4>
                    <p className="text-[10px] text-gray-500 font-mono">{a.resumeHash}</p>
                  </div>
                </div>
                
                <div className="flex gap-8 items-center w-full md:w-auto">
                   <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">AI Score</p>
                    <p className="text-2xl font-black text-[#14F195]">{a.aiScore}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Status</p>
                    <span className="px-2 py-0.5 bg-[#14F195]/10 text-[#14F195] text-[10px] font-bold rounded uppercase">Verified</span>
                  </div>
                  <button className="ml-auto px-4 py-2 bg-white/5 rounded-xl text-xs font-bold hover:bg-white/10">View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderPostJob = () => {
    const [title, setTitle] = useState('');
    const [role, setRole] = useState<'Cloud' | 'DevOps' | 'Support'>('Cloud');
    const [desc, setDesc] = useState('');
    const [skills, setSkills] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await api.postJob({
        title, role, description: desc, 
        skills: skills.split(',').map(s => s.trim()), 
        postedBy: user?.email || 'Admin'
      });
      setRoute(AppRoute.RECRUITER_DASHBOARD);
    };

    return (
      <div className="min-h-screen p-6 max-w-3xl mx-auto space-y-8">
        <button onClick={() => setRoute(AppRoute.RECRUITER_DASHBOARD)} className="text-gray-500 hover:text-white">
          <i className="fas fa-arrow-left mr-2"></i> Back
        </button>
        <div className="glass-card p-8 rounded-3xl space-y-6">
          <h2 className="text-3xl font-bold">Post New Job</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Job Title (e.g. Senior Cloud Architect)" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3" value={title} onChange={e => setTitle(e.target.value)} />
            <select className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white" value={role} onChange={e => setRole(e.target.value as any)}>
              <option value="Cloud">Cloud</option>
              <option value="DevOps">DevOps</option>
              <option value="Support">Support</option>
            </select>
            <input type="text" placeholder="Skills (comma separated)" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3" value={skills} onChange={e => setSkills(e.target.value)} />
            <textarea placeholder="Job Description" rows={6} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3" value={desc} onChange={e => setDesc(e.target.value)} />
            <button type="submit" className="w-full py-4 solana-gradient rounded-xl font-bold text-white shadow-xl">Publish Job</button>
          </form>
        </div>
      </div>
    );
  };

  const renderPage = () => {
    switch (route) {
      case AppRoute.LOGIN: return renderLogin();
      case AppRoute.CANDIDATE_DASHBOARD: return renderCandidateDashboard();
      case AppRoute.RECRUITER_DASHBOARD: return renderRecruiterDashboard();
      case AppRoute.APPLY: return renderApply();
      case AppRoute.POST_JOB: return renderPostJob();
      default: return renderLanding();
    }
  };

  return (
    <div className="min-h-screen">
      {renderPage()}
    </div>
  );
};

export default App;
