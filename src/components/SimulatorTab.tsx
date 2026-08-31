import React from 'react';
import { 
  Users, 
  Coins, 
  TrendingUp, 
  Sparkles, 
  PlusCircle, 
  HelpCircle,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AgentNode, AgencyMetrics } from '../types';
import { SimulatorCard } from './SimulatorCard';
import { fC, fCompact } from '../data/rates';

interface SimulatorTabProps {
  tree: AgentNode;
  metrics: AgencyMetrics;
  onUpdateNode: (id: string, field: keyof AgentNode, val: any) => void;
  onAddChild: (parentId: string) => void;
  onRemoveNode: (id: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export const SimulatorTab: React.FC<SimulatorTabProps> = ({
  tree,
  metrics,
  onUpdateNode,
  onAddChild,
  onRemoveNode,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6 pb-28">
      
      {/* Top Banner with Quick Metrics & Pro Tips */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Abstract Glow circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Live Hierarchy Engine
                </span>
                <span className="text-slate-400 text-xs font-medium">KAF Verified Calculation</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Agency Expansion &amp; Income Simulator
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
                Model team growth, personal &amp; overriding commissions (ORC), equalisation (EC), and monthly passive trailer.
              </p>
            </div>

            {/* Quick KPI Stat Chips */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 min-w-[120px]">
                <div className="flex items-center gap-1 text-[11px] text-slate-300">
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                  <span>Team Size</span>
                </div>
                <div className="text-lg font-black text-white mt-0.5">
                  {metrics.totalAgents} <span className="text-xs font-normal text-slate-400">Advisors</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 min-w-[140px]">
                <div className="flex items-center gap-1 text-[11px] text-slate-300">
                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Total Group Sales</span>
                </div>
                <div className="text-lg font-black text-emerald-300 mt-0.5">
                  {fC(metrics.totalSales)}
                </div>
              </div>

              <div className="bg-indigo-600/60 backdrop-blur-md border border-indigo-400/40 rounded-2xl p-3 min-w-[150px]">
                <div className="flex items-center gap-1 text-[11px] text-indigo-200">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
                  <span>Monthly Sponsor Income</span>
                </div>
                <div className="text-lg font-black text-amber-300 mt-0.5">
                  {fC(metrics.sponsorTotalIncome)}
                </div>
              </div>
            </div>
          </div>

          {/* Quick jump actions */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300 text-[11px]">
              <span className="font-semibold text-white">Active Ranks:</span>
              <span className="bg-white/10 px-2 py-0.5 rounded text-amber-300">{metrics.activeRankCounts.GAM} GAM</span>
              <span className="bg-white/10 px-2 py-0.5 rounded text-sky-300">{metrics.activeRankCounts.AM} AM</span>
              <span className="bg-white/10 px-2 py-0.5 rounded text-emerald-300">{metrics.activeRankCounts.UM} UM</span>
              <span className="bg-white/10 px-2 py-0.5 rounded text-indigo-300">{metrics.activeRankCounts.UTC} UTC</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('ai')}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-xl transition-colors cursor-pointer border border-amber-400/30"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Scenario Generator</span>
              </button>

              <button
                onClick={() => onNavigateTab('org')}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-200 hover:text-white transition-colors cursor-pointer"
              >
                <span>View Visual Org Chart</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Hierarchy Tree */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h2 className="font-extrabold text-slate-900 text-base">Agency Tree Hierarchy &amp; Volumes</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Max depth: 3 Generation Branches</span>
        </div>

        {/* Tree Root Card */}
        <SimulatorCard
          node={tree}
          onUpdate={onUpdateNode}
          onAddChild={onAddChild}
          onRemove={onRemoveNode}
        />
      </div>

    </div>
  );
};
