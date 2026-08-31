import React from 'react';
import { 
  TrendingUp, 
  Coins, 
  Users, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  ArrowUpRight 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AgencyMetrics } from '../types';
import { fC, fCompact } from '../data/rates';

interface StickyDashboardProps {
  metrics: AgencyMetrics;
  onNavigateTab: (tabId: string) => void;
  isProspectingMode?: boolean;
  candidateName?: string;
}

export const StickyDashboard: React.FC<StickyDashboardProps> = ({ 
  metrics, 
  onNavigateTab,
  isProspectingMode,
  candidateName 
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.85 },
      colors: ['#6366f1', '#10b981', '#f59e0b', '#0284c7'],
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 p-2 sm:p-4 pointer-events-none">
      <div className="max-w-6xl mx-auto pointer-events-auto">
        
        {/* Floating Glass Dock */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border-2 border-slate-200/90 shadow-2xl shadow-slate-900/15 overflow-hidden transition-all duration-300">
          
          {/* Header Strip with Expand/Collapse toggle */}
          <div className={`px-4 py-2 text-white flex items-center justify-between text-xs transition-colors ${
            isProspectingMode 
              ? 'bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900' 
              : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900'
          }`}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-extrabold tracking-tight">
                {isProspectingMode ? `Prospect Live Earnings: ${candidateName || 'Candidate'}` : 'Sponsor Earnings Live Dashboard'}
              </span>
              <span className="hidden sm:inline-block text-[11px] text-slate-300">
                · {metrics.totalAgents} Agents in Team
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('ai')}
                className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-200 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer border border-indigo-400/30"
                title="Open AI Scenario Copilot"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>AI Generator</span>
              </button>

              <button
                onClick={triggerCelebration}
                className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold bg-white/10 hover:bg-white/20 text-amber-300 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                title="Celebrate Income Goal!"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Celebrate</span>
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-300 transition-colors cursor-pointer"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Expanded Metrics Grid */}
          {isExpanded && (
            <div className="p-3 sm:p-4">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 items-center">
                
                {/* Metric 1: PSC */}
                <div className="bg-slate-50/80 rounded-2xl p-2.5 sm:p-3 border border-slate-200/60">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    PSC + Pers. ORC
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-indigo-700 mt-0.5 truncate">
                    {fC(metrics.sponsorPsc)}
                  </div>
                  <div className="text-[10px] text-slate-400 hidden sm:block">Personal Sales Comm.</div>
                </div>

                {/* Metric 2: Direct ORC */}
                <div className="bg-slate-50/80 rounded-2xl p-2.5 sm:p-3 border border-slate-200/60">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Direct ORC
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-sky-700 mt-0.5 truncate">
                    {fC(metrics.sponsorOrc)}
                  </div>
                  <div className="text-[10px] text-slate-400 hidden sm:block">Direct Downline Overrides</div>
                </div>

                {/* Metric 3: Equalisation EC */}
                <div className="bg-slate-50/80 rounded-2xl p-2.5 sm:p-3 border border-slate-200/60">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Equalisation (EC)
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-violet-700 mt-0.5 truncate">
                    {fC(metrics.sponsorEc)}
                  </div>
                  <div className="text-[10px] text-slate-400 hidden sm:block">Breakaway Equal Rank</div>
                </div>

                {/* Metric 4: Trailer / ETC */}
                <div className="bg-slate-50/80 rounded-2xl p-2.5 sm:p-3 border border-slate-200/60">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Monthly Trailer / ETC
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-amber-700 mt-0.5 truncate">
                    {fC(metrics.sponsorTrail)}
                  </div>
                  <div className="text-[10px] text-slate-400 hidden sm:block">Recurring Monthly AUM</div>
                </div>

                {/* Metric 5: Grand Total Monthly Income */}
                <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-3 sm:p-3.5 shadow-md shadow-emerald-600/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100">
                      Total Monthly Income
                    </span>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-200" />
                  </div>
                  <div className="text-base sm:text-lg font-black text-white mt-1 tracking-tight truncate">
                    {fC(metrics.sponsorTotalIncome)}
                  </div>
                  <div className="text-[10px] text-emerald-100/90 font-medium flex items-center justify-between mt-1">
                    <span>TGS: {fC(metrics.totalSales)}</span>
                    <button
                      onClick={() => onNavigateTab('analytics')}
                      className="inline-flex items-center text-[10px] font-bold underline hover:text-white cursor-pointer"
                    >
                      <span>Split</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
