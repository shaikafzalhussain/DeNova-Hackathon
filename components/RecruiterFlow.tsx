
import React, { useState, useEffect } from 'react';
import { fetchVerificationFromChain } from '../services/solanaService';
import { VerificationRecord } from '../types';

interface RecruiterFlowProps {
  initialHash?: string;
}

const RecruiterFlow: React.FC<RecruiterFlowProps> = ({ initialHash }) => {
  const [hash, setHash] = useState(initialHash || '');
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<VerificationRecord | null>(null);
  const [error, setError] = useState('');

  // Auto-verify if hash is passed via props (from Candidate tab shortcut)
  useEffect(() => {
    if (initialHash) {
      handleVerify(initialHash);
    }
  }, [initialHash]);

  const handleVerify = async (hashToVerify?: string) => {
    const targetHash = (hashToVerify || hash).trim().toLowerCase();
    if (!targetHash) return;
    
    setLoading(true);
    setError('');
    setRecord(null);

    try {
      const data = await fetchVerificationFromChain(targetHash);
      if (data) {
        setRecord(data);
      } else {
        setError('Verification record not found. Ensure the resume was successfully stored on Solana first.');
      }
    } catch (err) {
      setError('Error connecting to Solana network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Recruiter Verification</h1>
        <p className="text-gray-400 text-sm">Verify resume authenticity and review score proofs.</p>
      </div>

      <div className="glass-card p-8 rounded-2xl space-y-4 shadow-xl">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Resume SHA-256 Hash</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Paste SHA-256 hash here..."
              className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#14F195]/50 transition-all font-mono text-sm"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
            <button 
              onClick={() => handleVerify()}
              disabled={loading || !hash}
              className="px-8 py-3 solana-gradient rounded-xl font-bold text-white shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all active:scale-95 whitespace-nowrap"
            >
              {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Verify Now'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3 animate-shake">
          <i className="fas fa-exclamation-circle"></i>
          <div>
            <p className="font-bold">Record Not Found</p>
            <p className="opacity-80">Check for extra spaces or verify if the candidate completed step 2: Solana Transaction.</p>
          </div>
        </div>
      )}

      {record && (
        <div className="space-y-6 animate-slide-up">
          <div className="glass-card p-8 rounded-2xl space-y-8 border border-[#14F195]/30 shadow-2xl bg-[#14F195]/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#14F195]/20 flex items-center justify-center text-[#14F195] text-4xl shadow-lg shadow-[#14F195]/10">
                  <i className="fas fa-user-shield"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Verified Credential</h2>
                  <div className="flex items-center gap-2 text-[#14F195] text-xs font-black uppercase tracking-widest">
                    <i className="fas fa-check-double"></i>
                    Solana Devnet Signature Confirmed
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end bg-black/30 p-4 rounded-2xl border border-white/5 min-w-[120px]">
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-tighter">AI VERIFIED SCORE</span>
                <span className="text-6xl font-black text-[#14F195] leading-none">{record.ai_score}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 p-4 rounded-xl space-y-1 border border-white/5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Issuer Wallet</span>
                <div className="text-xs font-mono text-gray-400 truncate">{record.wallet_address}</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl space-y-1 border border-white/5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Verification Date</span>
                <div className="text-xs font-mono text-gray-400">{new Date(record.timestamp).toLocaleDateString()}</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl space-y-1 border border-white/5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</span>
                <div className="text-xs font-bold text-[#14F195]">IMMUTABLE</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <i className="fas fa-chart-line text-purple-400"></i> Quality Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Skills Matrix</h4>
                  <div className="flex flex-wrap gap-2">
                    {record.details.strengths.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-white/5 text-gray-300 border border-white/10 rounded-lg text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Experience Profile</h4>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                    <div className="text-sm flex justify-between">
                      <span className="text-gray-500">Domain:</span> <span className="text-white font-bold">{record.details.role_relevance}</span>
                    </div>
                    <div className="text-sm flex justify-between">
                      <span className="text-gray-500">Seniority:</span> <span className="text-white font-bold">{record.details.experience_level}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                <i className="fas fa-fingerprint"></i>
                <span className="truncate">{record.signature}</span>
              </div>
              <button 
                className="px-6 py-2 bg-[#14F195]/10 hover:bg-[#14F195]/20 border border-[#14F195]/20 rounded-lg text-xs font-bold text-[#14F195] flex items-center gap-2 transition-all"
                onClick={() => window.open(`https://explorer.solana.com/tx/${record.signature}?cluster=devnet`, '_blank')}
              >
                Explorer View <i className="fas fa-external-link-alt"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterFlow;
