
import React from 'react';
import { AppRoute } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  walletConnected: boolean;
  onConnectWallet: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeRoute, 
  onNavigate, 
  walletConnected, 
  onConnectWallet 
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-white/10 sticky top-0 z-50 bg-[#0b0e14]/80 backdrop-blur-md">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          // Fix: Property 'HOME' does not exist on type 'typeof AppRoute'. Using LANDING instead.
          onClick={() => onNavigate(AppRoute.LANDING)}
        >
          <div className="w-10 h-10 solana-gradient rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <i className="fas fa-shield-alt text-xl"></i>
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">
            Resume<span className="text-[#14F195]">Verify</span>
          </span>
        </div>

        <nav className="flex items-center gap-4 sm:gap-8">
          <button 
            // Fix: Property 'CANDIDATE' does not exist on type 'typeof AppRoute'. Using CANDIDATE_DASHBOARD instead.
            onClick={() => onNavigate(AppRoute.CANDIDATE_DASHBOARD)}
            className={`text-sm font-medium transition-colors ${activeRoute === AppRoute.CANDIDATE_DASHBOARD ? 'text-[#14F195]' : 'text-gray-400 hover:text-white'}`}
          >
            Candidate
          </button>
          <button 
            // Fix: Property 'RECRUITER' does not exist on type 'typeof AppRoute'. Using RECRUITER_DASHBOARD instead.
            onClick={() => onNavigate(AppRoute.RECRUITER_DASHBOARD)}
            className={`text-sm font-medium transition-colors ${activeRoute === AppRoute.RECRUITER_DASHBOARD ? 'text-[#14F195]' : 'text-gray-400 hover:text-white'}`}
          >
            Recruiter
          </button>
          
          <button 
            onClick={onConnectWallet}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
              walletConnected 
              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
              : 'solana-gradient text-white hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/30'
            }`}
          >
            <i className={`fas ${walletConnected ? 'fa-check-circle' : 'fa-wallet'}`}></i>
            {walletConnected ? 'Connected' : 'Connect Phantom'}
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-12 max-w-4xl">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-gray-500 text-sm">
        <p>&copy; 2024 ResumeVerify MVP - Built for Solana Hackathon</p>
        <div className="mt-2 flex justify-center gap-4">
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Solana Devnet</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Gemini 3.0 Flash</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
