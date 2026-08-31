import React, { useState } from 'react';
import { 
  PieChart, 
  TrendingUp, 
  Zap, 
  Coins, 
  Award, 
  Users, 
  ShieldCheck, 
  ArrowUpRight, 
  Percent, 
  Sliders,
  DollarSign
} from 'lucide-react';
import { AgentNode, AgencyMetrics, Rank } from '../types';
import { RANK_INFO, fC, fCompact } from '../data/rates';
import { flattenTree } from '../utils/calculator';

interface AnalyticsTabProps {
  tree: AgentNode;
  metrics: AgencyMetrics;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ tree, metrics }) => {
  const [growthMultiplier, setGrowthMultiplier] = useState<number>(100); // 100% = current

  const flat = flattenTree(tree);
  const totalIncome = metrics.sponsorTotalIncome || 1; // avoid / 0

  // Income stream percentages
  const pscPct = Math.round(((metrics.sponsorPsc || 0) / totalIncome) * 100) || 0;
  const orcPct = Math.round(((metrics.sponsorOrc || 0) / totalIncome) * 100) || 0;
  const ecPct = Math.round(((metrics.sponsorEc || 0) / totalIncome) * 100) || 0;
  const trailPct = Math.max(0, 100 - pscPct - orcPct - ecPct);

  // Active vs Passive ratio
  const activeIncome = (metrics.sponsorPsc || 0) + (metrics.sponsorOrc || 0) + (metrics.sponsorEc || 0);
  const passiveIncome = metrics.sponsorTrail || 0;
  const passivePct = Math.round((passiveIncome / totalIncome) * 100) || 0;
  const activePct = 100 - passivePct;

  // Projected earnings with multiplier
  const projectedMonthly = (metrics.sponsorTotalIncome * (growthMultiplier / 100));
  const projectedAnnual = projectedMonthly * 12;

  // Rank breakdown volumes
  const rankVolumes: Record<Rank, number> = { GAM: 0, AM: 0, UM: 0, UTC: 0 };
  flat.forEach((node) => {
    const vol = (node.pvCash || 0) + (node.pvEpf || 0);
    rankVolumes[node.rank] = (rankVolumes[node.rank] || 0) + vol;
  });

  return (
    <div className="space-y-6 pb-28">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <PieChart className="w-5 h-5 text-indigo-600" />
          <h2 className="font-extrabold text-slate-900 text-lg">Income Stream Architecture &amp; Analytics</h2>
        </div>
        <p className="text-xs text-slate-500">
          Deconstruction of your sponsor revenue model, leverage ratio, and future growth projections.
        </p>
      </div>

      {/* 4 Revenue Streams Split Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stream 1: Personal PSC */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-indigo-600 tracking-wider">Personal Production</span>
            <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              {pscPct}%
            </span>
          </div>
          <h3 className="text-xs text-slate-500 font-semibold">PSC + Personal ORC</h3>
          <p className="text-lg font-black text-slate-900 mt-1">{fC(metrics.sponsorPsc)}</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-indigo-600 h-1.5 rounded-full transition-all" style={{ width: `${pscPct}%` }}></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Direct client portfolio commissions</p>
        </div>

        {/* Stream 2: Direct ORC */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-sky-600 tracking-wider">Direct Overrides</span>
            <span className="text-xs font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              {orcPct}%
            </span>
          </div>
          <h3 className="text-xs text-slate-500 font-semibold">Direct ORC</h3>
          <p className="text-lg font-black text-slate-900 mt-1">{fC(metrics.sponsorOrc)}</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-sky-500 h-1.5 rounded-full transition-all" style={{ width: `${orcPct}%` }}></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Rank tier margin on direct recruits</p>
        </div>

        {/* Stream 3: Equalisation EC */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-violet-600 tracking-wider">Breakaway EC</span>
            <span className="text-xs font-extrabold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">
              {ecPct}%
            </span>
          </div>
          <h3 className="text-xs text-slate-500 font-semibold">Equalisation (Gen 1 &amp; 2)</h3>
          <p className="text-lg font-black text-slate-900 mt-1">{fC(metrics.sponsorEc)}</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-violet-600 h-1.5 rounded-full transition-all" style={{ width: `${ecPct}%` }}></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Protected earnings when team matches your rank</p>
        </div>

        {/* Stream 4: Passive Trailer */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-amber-600 tracking-wider">Monthly Passive</span>
            <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {trailPct}%
            </span>
          </div>
          <h3 className="text-xs text-slate-500 font-semibold">Trailer / ETC (AUM)</h3>
          <p className="text-lg font-black text-slate-900 mt-1">{fC(metrics.sponsorTrail)}</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${trailPct}%` }}></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Compounding monthly annuity from assets</p>
        </div>

      </div>

      {/* Active vs Passive Leverage & Production Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active vs Passive Bar Graph */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="font-extrabold text-slate-900 text-sm">Active vs. Passive Revenue Split</h3>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {passivePct}% Annuity
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-6 w-full bg-slate-100 rounded-xl overflow-hidden flex p-1 border border-slate-200">
            <div
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white transition-all"
              style={{ width: `${Math.max(12, activePct)}%` }}
            >
              {activePct}% Active
            </div>
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-400 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-slate-900 transition-all ml-1"
              style={{ width: `${Math.max(12, passivePct)}%` }}
            >
              {passivePct}% Passive
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">Active New Sales Pay</span>
              <span className="text-sm font-extrabold text-indigo-900">{fC(activeIncome)}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">PSC + Direct ORC + EC</p>
            </div>
            <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
              <span className="text-[11px] font-semibold text-amber-800 block">Passive Monthly Trailer</span>
              <span className="text-sm font-extrabold text-amber-900">{fC(passiveIncome)}</span>
              <p className="text-[10px] text-amber-700 mt-0.5">PNAV + PGNAV + ETC</p>
            </div>
          </div>
        </div>

        {/* Sales by Rank Contribution */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">Team Production by Rank Tier</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">{fC(metrics.totalSales)} Total</span>
          </div>

          <div className="space-y-3">
            {(['GAM', 'AM', 'UM', 'UTC'] as Rank[]).map((r) => {
              const vol = rankVolumes[r];
              const pct = metrics.totalSales > 0 ? Math.round((vol / metrics.totalSales) * 100) : 0;
              const count = metrics.activeRankCounts[r];

              return (
                <div key={r} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] px-1.5 py-0.2 rounded border ${RANK_INFO[r].badgeBg}`}>
                        {r}
                      </span>
                      <span className="text-slate-800">{RANK_INFO[r].title}</span>
                      <span className="text-[11px] font-normal text-slate-400">({count} pax)</span>
                    </div>
                    <span className="text-slate-900">{fC(vol)} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${RANK_INFO[r].gradient} transition-all`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Interactive Growth Scale-Up Calculator */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Interactive Future Projection</span>
            </div>
            <h3 className="text-lg font-black text-white">Agency Scale-Up Calculator</h3>
            <p className="text-xs text-slate-300 mt-0.5">Key in target growth percentage or select a quick scenario</p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20">
            <span className="text-xs font-bold text-slate-300">Growth Rate:</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="10"
                max="1000"
                step="5"
                value={growthMultiplier}
                onChange={(e) => setGrowthMultiplier(Math.max(1, Number(e.target.value) || 100))}
                className="w-16 bg-white/20 border border-white/30 rounded-lg px-2 py-1 text-sm font-black text-amber-300 text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <span className="text-xs font-bold text-amber-300">%</span>
            </div>
          </div>
        </div>

        {/* Quick Growth Presets */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-slate-400 font-semibold mr-1">Quick Scenarios:</span>
          {[
            { label: '50% (Conservative)', val: 50 },
            { label: '100% (Baseline)', val: 100 },
            { label: '150% (+50% Scale)', val: 150 },
            { label: '200% (2x Double)', val: 200 },
            { label: '300% (3x Mega Agency)', val: 300 },
            { label: '500% (5x Empire)', val: 500 },
          ].map((preset) => (
            <button
              key={preset.val}
              type="button"
              onClick={() => setGrowthMultiplier(preset.val)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer border ${
                growthMultiplier === preset.val
                  ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/10'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Projected Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <span className="text-xs font-semibold text-slate-300 block">Projected Monthly Income</span>
            <p className="text-2xl font-black text-emerald-300 mt-1">{fC(projectedMonthly)}</p>
            <p className="text-[11px] text-slate-400 mt-1">Estimated monthly payout with team at {growthMultiplier}% scale</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <span className="text-xs font-semibold text-slate-300 block">Projected Annual Payout (12 Mos)</span>
            <p className="text-2xl font-black text-amber-300 mt-1">{fC(projectedAnnual)}</p>
            <p className="text-[11px] text-slate-400 mt-1">Annualized gross agency director earnings</p>
          </div>
        </div>
      </div>

    </div>
  );
};
