
import React, { useState } from 'react';
// Fix: analyzeResume is now correctly exported from the service
import { analyzeResume } from '../services/geminiService';
import { generateResumeHash, storeVerificationOnChain, generateMockSignature } from '../services/solanaService';
import { ResumeAnalysis, VerificationRecord, AppRoute } from '../types';

interface CandidateFlowProps {
  walletConnected: boolean;
  onConnect: () => void;
  onNavigate: (route: AppRoute, hash?: string) => void;
}

const CandidateFlow: React.FC<CandidateFlowProps> = ({ walletConnected, onConnect, onNavigate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [result, setResult] = useState<{ analysis: ResumeAnalysis; hash: string } | null>(null);
  const [txRecord, setTxRecord] = useState<VerificationRecord | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const processResume = async () => {
    if (!file) return;
    setLoading(true);
    setStatus('Hashing Resume...');
    
    try {
      const hash = await generateResumeHash(file);
      setStatus('AI Analysis in progress...');
      
      const analysis = await analyzeResume(file);
      setResult({ analysis, hash });
      setStatus('Analysis Complete');
    } catch (err) {
      console.error(err);
      setStatus('Processing failed. Please check file format.');
    } finally {
      setLoading(false);
    }
  };

  const submitToBlockchain = async () => {
    if (!result || !walletConnected) return;
    setLoading(true);
    setStatus('Confirming in Wallet...');
    
    try {
      const record: VerificationRecord = {
        resume_hash: result.hash,
        ai_score: result.analysis.score,
        wallet_address: 'GvT9...3B2z', 
        timestamp: Date.now(),
        signature: generateMockSignature(),
        details: result.analysis
      };
      
      await storeVerificationOnChain(record);
      setTxRecord(record);
      setStatus('Confirmed on Solana!');
    } catch (err) {
      console.error(err);
      setStatus('Transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Candidate Verification</h1>
        <p className="text-gray-400 text-sm">Secure your credentials on the Solana blockchain.</p>
      </div>

      {!result ? (
        <div className="glass-card p-10 rounded-2xl border-dashed border-2 border-white/10 flex flex-col items-center justify-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
            <i className="fas fa-file-pdf text-3xl text-[#14F195]"></i>
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg">Upload Resume (PDF/TXT)</h3>
            <p className="text-sm text-gray-500">The file itself is hashed for integrity.</p>
          </div>
          
          <input 
            type="file" 
            id="resume-upload" 
            className="hidden" 
            onChange={handleFileChange} 
            accept=".pdf,.txt"
          />
          <label 
            htmlFor="resume-upload" 
            className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer font-medium transition-all border border-white/10"
          >
            {file ? file.name : 'Select File'}
          </label>

          {file && (
            <button 
              onClick={processResume}
              disabled={loading}
              className="px-10 py-4 solana-gradient rounded-xl font-bold text-white shadow-xl shadow-purple-500/20 disabled:opacity-50 transition-all hover:scale-105"
            >
              {loading ? (
                <span className="flex items-center gap-2"><i className="fas fa-spinner fa-spin"></i> {status}</span>
              ) : 'Analyze & Score'}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass-card p-8 rounded-2xl space-y-6 border border-[#14F195]/20 shadow-2xl">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-[#14F195] bg-[#14F195]/10 px-2 py-1 rounded w-fit">AI Analysis Ready</span>
                <h2 className="text-2xl font-bold mt-2">Resume Score Card</h2>
              </div>
              <div className="text-right">
                <div className="text-6xl font-black text-[#14F195] drop-shadow-sm">{result.analysis.score}</div>
                <div className="text-xs text-gray-500 font-bold tracking-tighter">QUALITY RATING</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <i className="fas fa-star text-yellow-500"></i> Top Strengths
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.analysis.strengths.map((s, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-white/5 rounded-md border border-white/5">{s}</span>
                  ))}
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <i className="fas fa-search text-purple-400"></i> Insights
                </h4>
                <div className="text-sm space-y-1">
                  <div className="text-gray-300">• {result.analysis.role_relevance}</div>
                  <div className="text-gray-300">• {result.analysis.experience_level} Level</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-black/40 rounded-xl border border-white/5">
              <div className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-widest flex justify-between">
                <span>Resume Hash (SHA-256)</span>
                <span className="text-[#14F195]">Immutability ID</span>
              </div>
              <div className="text-xs font-mono break-all text-gray-400 bg-black/20 p-2 rounded">{result.hash}</div>
            </div>

            {!txRecord ? (
              <div className="pt-4 space-y-4">
                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 text-sm text-purple-300 text-center">
                  Click below to store this score on Solana for instant verification.
                </div>
                {walletConnected ? (
                   <button 
                    onClick={submitToBlockchain}
                    disabled={loading}
                    className="w-full py-4 solana-gradient rounded-xl font-bold text-white shadow-xl shadow-purple-500/30 flex items-center justify-center gap-2 text-lg transition-all hover:brightness-110 active:scale-95"
                  >
                    {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-link"></i>}
                    {loading ? status : 'Approve Solana Transaction'}
                  </button>
                ) : (
                  <button 
                    onClick={onConnect}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-white shadow-xl shadow-purple-500/20"
                  >
                    Connect Wallet to Finalize
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6 bg-[#14F195]/10 border border-[#14F195]/30 rounded-xl space-y-4 animate-scale-up">
                <div className="flex items-center gap-3 text-[#14F195]">
                  <i className="fas fa-check-circle text-2xl"></i>
                  <span className="font-bold text-lg">Verified on Solana Devnet</span>
                </div>
                <div className="text-[10px] space-y-1 font-mono">
                  <div className="text-gray-500 uppercase font-bold">TX Signature:</div>
                  <div className="text-gray-400 break-all">{txRecord.signature}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => navigator.clipboard.writeText(result.hash)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-copy"></i> Copy Hash
                  </button>
                  <button 
                    // Fix: Property 'RECRUITER' does not exist on type 'typeof AppRoute'. Using RECRUITER_DASHBOARD instead.
                    onClick={() => onNavigate(AppRoute.RECRUITER_DASHBOARD, result.hash)}
                    className="flex-1 py-3 bg-[#14F195] text-black rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2"
                  >
                    Verify Live <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => {setResult(null); setTxRecord(null); setFile(null);}}
            className="w-full text-center text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest font-bold"
          >
            Clear and start over
          </button>
        </div>
      )}
    </div>
  );
};

export default CandidateFlow;
