import React from 'react';
import {
  Sparkles,
  Database,
  GitBranch,
  LifeBuoy,
  LayoutDashboard,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'form' | 'dashboard';
  setActiveTab: (tab: 'form' | 'dashboard') => void;
  ticketCounts: {
    total: number;
    pending: number;
    aiResponded: number;
    resolved: number;
  };
  supabaseStatus: {
    connected: boolean;
    tableExists: boolean;
    error?: string;
  };
  onRefreshDatabase: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  ticketCounts,
  supabaseStatus,
  onRefreshDatabase,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-display">
                  Laye <span className="text-indigo-600">Consultant</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  AI Support Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Intelligent Client Support & Automated Advisory Service
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/70">
              <button
                id="nav-new-request-btn"
                type="button"
                onClick={() => setActiveTab('form')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'form'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                <span className="hidden xs:inline">Submit</span> Request
              </button>

              <button
                id="nav-dashboard-btn"
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                <span>Dashboard</span>
                {ticketCounts.total > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">
                    {ticketCounts.total}
                  </span>
                )}
              </button>
            </nav>

            {/* Supabase status indicator badge */}
            <button
              id="supabase-status-pill"
              type="button"
              onClick={onRefreshDatabase}
              title="Supabase cloud database status (Click to refresh sync)"
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                supabaseStatus.connected && supabaseStatus.tableExists
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {supabaseStatus.connected && supabaseStatus.tableExists
                  ? 'Cloud Synced'
                  : 'Cloud Active'}
              </span>
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
