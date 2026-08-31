import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AgentNode, AgencyMetrics, CashFundKey, EpfFundKey, Rank } from '../types';
import { calcVolumes, calculateAll } from '../utils/calculator';
import { CASH_FUNDS, EPF_FUNDS, fC } from '../data/rates';
import { 
  Users, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Copy, 
  Check, 
  Calculator, 
  ShieldCheck, 
  Award,
  Zap,
  BarChart3,
  DollarSign,
  Coins
} from 'lucide-react';

interface ProspectingTabProps {
  onApplyScenario: (tree: AgentNode, name: string) => void;
  onNavigateTab: (tab: string) => void;
  onProspectMetricsChange?: (metrics: AgencyMetrics | null, candidateName: string) => void;
}

export const ProspectingTab: React.FC<ProspectingTabProps> = ({
  onApplyScenario,
  onNavigateTab,
  onProspectMetricsChange,
}) => {
  // Prospecting adjustable parameters
  const [prospectRank, setProspectRank] = useState<Rank>('GAM');
  const [prospectName, setProspectName] = useState<string>('Alex Tan (Candidate)');
  const [prospectCashFund, setProspectCashFund] = useState<CashFundKey>('cash1');
  const [prospectEpfFund, setProspectEpfFund] = useState<EpfFundKey>('epf1');
  const [personalCash, setPersonalCash] = useState<number>(150000);
  const [personalEpf, setPersonalEpf] = useState<number>(50000);
  
  // 3 Recruit Groups: UTC, UM, AM (Aggregate max 49 agents total)
  const [utcCount, setUtcCount] = useState<number>(2);
  const [utcCashFund, setUtcCashFund] = useState<CashFundKey>('cash1');
  const [utcEpfFund, setUtcEpfFund] = useState<EpfFundKey>('epf1');
  const [utcCash, setUtcCash] = useState<number>(80000);
  const [utcEpf, setUtcEpf] = useState<number>(20000);

  const [umCount, setUmCount] = useState<number>(1);
  const [umCashFund, setUmCashFund] = useState<CashFundKey>('cash1');
  const [umEpfFund, setUmEpfFund] = useState<EpfFundKey>('epf1');
  const [umCash, setUmCash] = useState<number>(250000);
  const [umEpf, setUmEpf] = useState<number>(50000);

  const [amCount, setAmCount] = useState<number>(0);
  const [amCashFund, setAmCashFund] = useState<CashFundKey>('cash1');
  const [amEpfFund, setAmEpfFund] = useState<EpfFundKey>('epf1');
  const [amCash, setAmCash] = useState<number>(600000);
  const [amEpf, setAmEpf] = useState<number>(150000);

  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  const totalRecruits = utcCount + umCount + amCount;

  // Enforce max 49 aggregate recruits
  const handleCountChange = (tier: 'utc' | 'um' | 'am', val: number) => {
    const currentOthers = tier === 'utc' ? (umCount + amCount) : tier === 'um' ? (utcCount + amCount) : (utcCount + umCount);
    const maxAllowed = Math.max(0, 49 - currentOthers);
    const newVal = Math.min(Math.max(0, val), maxAllowed);

    if (tier === 'utc') setUtcCount(newVal);
    if (tier === 'um') setUmCount(newVal);
    if (tier === 'am') setAmCount(newVal);
  };

  // Generate simulated tree based on prospecting parameters
  const { teamTree, soloMetrics, teamMetrics } = useMemo(() => {
    // 1. Solo tree (0 recruits)
    const soloRoot: AgentNode = {
      id: 'root',
      depth: 0,
      name: prospectName,
      rank: prospectRank,
      count: 1,
      cashFund: prospectCashFund,
      cash: personalCash,
      epfFund: prospectEpfFund,
      epf: personalEpf,
      children: [],
    };
    calcVolumes(soloRoot);
    calculateAll(soloRoot);
    const soloIncome = (soloRoot.ePsc || 0) + (soloRoot.eOrc || 0) + (soloRoot.eEc || 0) + (soloRoot.eTrail || 0);

    // 2. Team tree (with UTC, UM, AM recruits)
    const childrenNodes: AgentNode[] = [];
    let idx = 1;

    // Add UTC recruits
    for (let i = 1; i <= utcCount; i++) {
      childrenNodes.push({
        id: `rec_utc_${i}`,
        depth: 1,
        name: `UTC Recruit #${idx++}`,
        rank: 'UTC',
        count: 1,
        cashFund: utcCashFund,
        cash: utcCash,
        epfFund: utcEpfFund,
        epf: utcEpf,
        children: [],
      });
    }

    // Add UM recruits
    for (let i = 1; i <= umCount; i++) {
      childrenNodes.push({
        id: `rec_um_${i}`,
        depth: 1,
        name: `UM Recruit #${idx++}`,
        rank: 'UM',
        count: 1,
        cashFund: umCashFund,
        cash: umCash,
        epfFund: umEpfFund,
        epf: umEpf,
        children: [],
      });
    }

    // Add AM recruits
    for (let i = 1; i <= amCount; i++) {
      childrenNodes.push({
        id: `rec_am_${i}`,
        depth: 1,
        name: `AM Recruit #${idx++}`,
        rank: 'AM',
        count: 1,
        cashFund: amCashFund,
        cash: amCash,
        epfFund: amEpfFund,
        epf: amEpf,
        children: [],
      });
    }

    const teamRoot: AgentNode = {
      id: 'root',
      depth: 0,
      name: prospectName,
      rank: prospectRank,
      count: 1,
      cashFund: prospectCashFund,
      cash: personalCash,
      epfFund: prospectEpfFund,
      epf: personalEpf,
      children: childrenNodes,
    };

    calcVolumes(teamRoot);
    calculateAll(teamRoot);
    const teamIncome = (teamRoot.ePsc || 0) + (teamRoot.eOrc || 0) + (teamRoot.eEc || 0) + (teamRoot.eTrail || 0);
    const orcIncome = teamRoot.eOrc || 0;
    const trailIncome = teamRoot.eTrail || 0;

    const recruitTotalSales = 
      utcCount * (utcCash + utcEpf) + 
      umCount * (umCash + umEpf) + 
      amCount * (amCash + amEpf);

    return {
      teamTree: teamRoot,
      soloMetrics: {
        income: soloIncome,
        sales: personalCash + personalEpf,
        psc: soloRoot.ePsc || 0,
        trail: soloRoot.eTrail || 0,
      },
      teamMetrics: {
        income: teamIncome,
        sales: (personalCash + personalEpf) + recruitTotalSales,
        psc: teamRoot.ePsc || 0,
        orc: orcIncome,
        ec: teamRoot.eEc || 0,
        trail: trailIncome,
        totalAgents: 1 + totalRecruits,
      },
    };
  }, [prospectRank, prospectName, prospectCashFund, prospectEpfFund, personalCash, personalEpf, utcCount, utcCashFund, utcCash, utcEpfFund, utcEpf, umCount, umCashFund, umCash, umEpfFund, umEpf, amCount, amCashFund, amCash, amEpfFund, amEpf, totalRecruits]);

  const onProspectMetricsChangeRef = useRef(onProspectMetricsChange);
  useEffect(() => {
    onProspectMetricsChangeRef.current = onProspectMetricsChange;
  });

  // Sync with global sticky dashboard when on prospecting tab
  useEffect(() => {
    if (onProspectMetricsChangeRef.current) {
      const prospectAgencyMetrics: AgencyMetrics = {
        totalAgents: 1 + totalRecruits,
        totalSales: (personalCash + personalEpf) + (utcCount * (utcCash + utcEpf)) + (umCount * (umCash + umEpf)) + (amCount * (amCash + amEpf)),
        totalCashSales: personalCash + (utcCount * utcCash) + (umCount * umCash) + (amCount * amCash),
        totalEpfSales: personalEpf + (utcCount * utcEpf) + (umCount * umEpf) + (amCount * amEpf),
        totalCommission: teamMetrics.income,
        sponsorTotalIncome: teamMetrics.income,
        sponsorPsc: teamMetrics.psc,
        sponsorOrc: teamMetrics.orc,
        sponsorEc: teamMetrics.ec,
        sponsorTrail: teamMetrics.trail,
        activeRankCounts: {
          GAM: prospectRank === 'GAM' ? 1 : 0,
          AM: (prospectRank === 'AM' ? 1 : 0) + amCount,
          UM: (prospectRank === 'UM' ? 1 : 0) + umCount,
          UTC: (prospectRank === 'UTC' ? 1 : 0) + utcCount,
        },
      };
      onProspectMetricsChangeRef.current(prospectAgencyMetrics, prospectName);
    }
  }, [
    teamMetrics.income,
    teamMetrics.psc,
    teamMetrics.orc,
    teamMetrics.ec,
    teamMetrics.trail,
    prospectName,
    prospectRank,
    personalCash,
    personalEpf,
    utcCount,
    utcCash,
    utcEpf,
    umCount,
    umCash,
    umEpf,
    amCount,
    amCash,
    amEpf,
    totalRecruits
  ]);

  const incomeDifference = teamMetrics.income - soloMetrics.income;
  const percentageBoost = soloMetrics.income > 0 ? Math.round((incomeDifference / soloMetrics.income) * 100) : 0;

  // Preset quick templates for prospecting
  const handleLoadPreset = (type: 'solo' | 'starter' | 'growth' | 'elite') => {
    if (type === 'solo') {
      setProspectRank('GAM');
      setPersonalCash(500000);
      setPersonalEpf(200000);
      setUtcCount(0);
      setUmCount(0);
      setAmCount(0);
    } else if (type === 'starter') {
      setProspectRank('GAM');
      setPersonalCash(200000);
      setPersonalEpf(50000);
      setUtcCount(3);
      setUtcCash(100000);
      setUtcEpf(30000);
      setUmCount(1);
      setUmCash(300000);
      setUmEpf(100000);
      setAmCount(0);
    } else if (type === 'growth') {
      setProspectRank('GAM');
      setPersonalCash(150000);
      setPersonalEpf(50000);
      setUtcCount(5);
      setUtcCash(120000);
      setUtcEpf(30000);
      setUmCount(2);
      setUmCash(400000);
      setUmEpf(100000);
      setAmCount(1);
      setAmCash(1200000);
      setAmEpf(300000);
    } else if (type === 'elite') {
      setProspectRank('GAM');
      setPersonalCash(200000);
      setPersonalEpf(100000);
      setUtcCount(10);
      setUtcCash(150000);
      setUtcEpf(50000);
      setUmCount(5);
      setUmCash(500000);
      setUmEpf(150000);
      setAmCount(2);
      setAmCash(2000000);
      setAmEpf(500000);
    }
  };

  const pitchScriptText = `Hi ${prospectName.split(' ')[0]}, looking at your strong production as a ${prospectRank} (${fC(personalCash + personalEpf)} personal sales), if you join our KAF Agency structure and build a multi-tier team of ${totalRecruits} direct recruits (${utcCount} UTCs, ${umCount} UMs, ${amCount} AMs) producing average group sales, your earnings change dramatically:

• Solo Producer Income: ${fC(soloMetrics.income)} / yr
• Multi-Tier Team Income (${totalRecruits} Recruits): ${fC(teamMetrics.income)} / yr
• Income Boost with Leverage: +${percentageBoost}% (${fC(incomeDifference)} more!)
• Includes Overriding Commission (ORC) of ${fC(teamMetrics.orc)} and Passive Monthly Trail ${fC(teamMetrics.trail / 12)}/mo.

Let's schedule a 15-minute coffee chat to review this customized retirement & career projection!`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(pitchScriptText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleApplyAndSimulate = () => {
    onApplyScenario(teamTree, `Prospecting: ${prospectName} (${prospectRank} + ${totalRecruits} Recruits)`);
    onNavigateTab('simulator');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/30 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Agent Recruitment &amp; Prospecting Pitch Deck</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            The Power of Agency Multi-Tier Leverage
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm leading-relaxed">
            Simulate recruiting multiple ranks simultaneously (UTCs, UMs, and AMs up to 49 aggregate downlines) with sales up to RM10M to demonstrate exponential earnings through Overriding Commissions (ORC) and passive trailers.
          </p>
        </div>
      </div>

      {/* Quick Prospecting Presets */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Quick Prospecting Profiles</h2>
            <p className="text-xs text-slate-500">Select a pre-built multi-rank recruitment scenario to instantly pitch candidates</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleLoadPreset('solo')}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              👤 Solo GAM (0 Recruits)
            </button>
            <button
              onClick={() => handleLoadPreset('starter')}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer"
            >
              🌱 Mixed Team (3 UTCs + 1 UM)
            </button>
            <button
              onClick={() => handleLoadPreset('growth')}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
            >
              🚀 Expansion Leader (5 UTCs, 2 UMs, 1 AM)
            </button>
            <button
              onClick={() => handleLoadPreset('elite')}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer"
            >
              👑 Enterprise Agency (10 UTCs, 5 UMs, 2 AMs)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Parameters & Live Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Prospect & Multi-Tier Recruit Parameters (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Prospect Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Prospect Profile</h3>
                <p className="text-xs text-slate-500">Configure candidate's entry rank and high-volume personal sales (up to RM10M)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Candidate Name</label>
                <input
                  type="text"
                  value={prospectName}
                  onChange={(e) => setProspectName(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Starting Rank</label>
                <select
                  value={prospectRank}
                  onChange={(e) => setProspectRank(e.target.value as Rank)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="GAM">GAM (Group Agency Manager)</option>
                  <option value="AM">AM (Agency Manager)</option>
                  <option value="UM">UM (Unit Manager)</option>
                  <option value="UTC">UTC (Unit Trust Consultant)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-emerald-600" />
                      Cash Sales Fund
                    </span>
                    <span className="text-indigo-600 font-extrabold">{fC(personalCash)}</span>
                  </label>
                  <select
                    value={prospectCashFund}
                    onChange={(e) => setProspectCashFund(e.target.value as CashFundKey)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2 cursor-pointer"
                  >
                    {CASH_FUNDS.map((cf) => (
                      <option key={cf.key} value={cf.key}>
                        {cf.label} ({cf.charge})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">RM</span>
                  <input
                    type="number"
                    min="0"
                    max="50000000"
                    step="10000"
                    value={personalCash || ''}
                    onChange={(e) => setPersonalCash(parseFloat(e.target.value) || 0)}
                    placeholder="150000"
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                {/* Quick Add Pills */}
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium mr-1">Quick:</span>
                  {[50000, 100000, 250000, 500000, 1000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPersonalCash(amt)}
                      className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200/50 transition-colors cursor-pointer"
                    >
                      {amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-sky-600" />
                      EPF Sales Fund
                    </span>
                    <span className="text-indigo-600 font-extrabold">{fC(personalEpf)}</span>
                  </label>
                  <select
                    value={prospectEpfFund}
                    onChange={(e) => setProspectEpfFund(e.target.value as EpfFundKey)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2 cursor-pointer"
                  >
                    {EPF_FUNDS.map((ef) => (
                      <option key={ef.key} value={ef.key}>
                        {ef.label} ({ef.charge})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">RM</span>
                  <input
                    type="number"
                    min="0"
                    max="20000000"
                    step="10000"
                    value={personalEpf || ''}
                    onChange={(e) => setPersonalEpf(parseFloat(e.target.value) || 0)}
                    placeholder="50000"
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                {/* Quick Add Pills */}
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium mr-1">Quick:</span>
                  {[25000, 50000, 100000, 200000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPersonalEpf(amt)}
                      className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200/50 transition-colors cursor-pointer"
                    >
                      {amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Tier Direct Recruits Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Multi-Rank Direct Recruits &amp; Team Building</h3>
                  <p className="text-xs text-slate-500">Recruit UTC, UM, and AM simultaneously (Aggregate max 49 agents)</p>
                </div>
              </div>
              <div className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full">
                Total Recruits: {totalRecruits} / 49
              </div>
            </div>

            {/* Tier 1: UTC Recruits */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> UTC (Unit Trust Consultant) Recruits
                </span>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
                  {utcCount} Agents
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Count</label>
                  <input
                    type="number"
                    min="0"
                    max="49"
                    value={utcCount}
                    onChange={(e) => handleCountChange('utc', Number(e.target.value))}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium"
                  />
                </div>
                <div className="sm:col-span-5 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-600">Avg Cash Sales</label>
                  </div>
                  <select
                    value={utcCashFund}
                    onChange={(e) => setUtcCashFund(e.target.value as CashFundKey)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700 mb-1"
                  >
                    {CASH_FUNDS.map((cf) => (
                      <option key={cf.key} value={cf.key}>
                        {cf.label} ({cf.charge})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    max="10000000"
                    step="10000"
                    value={utcCash}
                    onChange={(e) => setUtcCash(Number(e.target.value))}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium"
                  />
                </div>
                <div className="sm:col-span-5 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-600">Avg EPF Sales</label>
                  </div>
                  <select
                    value={utcEpfFund}
                    onChange={(e) => setUtcEpfFund(e.target.value as EpfFundKey)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700 mb-1"
                  >
                    {EPF_FUNDS.map((ef) => (
                      <option key={ef.key} value={ef.key}>
                        {ef.label} ({ef.charge})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    max="5000000"
                    step="10000"
                    value={utcEpf}
                    onChange={(e) => setUtcEpf(Number(e.target.value))}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Tier 2: UM Recruits */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> UM (Unit Manager) Recruits
                </span>
                <span className="text-xs font-extrabold text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-md">
                  {umCount} Agents
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Count</label>
                  <input
                    type="number"
                    min="0"
                    max="49"
                    value={umCount}
                    onChange={(e) => handleCountChange('um', Number(e.target.value))}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium"
                  />
                </div>
                <div className="sm:col-span-5 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-600">Avg Cash Sales</label>
                  </div>
                  <select
                    value={umCashFund}
                    onChange={(e) => setUmCashFund(e.target.value as CashFundKey)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700 mb-1"
                  >
                    {CASH_FUNDS.map((cf) => (
                      <option key={cf.key} value={cf.key}>
                        {cf.label} ({cf.charge})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    max="10000000"
                    step="50000"
                    value={umCash}
                    onChange={(e) => setUmCash(Number(e.target.value))}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium"
                  />
                </div>
                <div className="sm:col-span-5 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-600">Avg EPF Sales</label>
                  </div>
                  <select
                    value={umEpfFund}
                    onChange={(e) => setUmEpfFund(e.target.value as EpfFundKey)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700 mb-1"
                  >
                    {EPF_FUNDS.map((ef) => (
                      <option key={ef.key} value={ef.key}>
                        {ef.label} ({ef.charge})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    max="5000000"
                    step="25000"
                    value={umEpf}
                    onChange={(e) => setUmEpf(Number(e.target.value))}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Tier 3: AM Recruits */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> AM (Agency Manager) Recruits
                </span>
                <span className="text-xs font-extrabold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-md">
                  {amCount} Agents
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Count</label>
                  <input
                    type="number"
                    min="0"
                    max="49"
                    value={amCount}
                    onChange={(e) => handleCountChange('am', Number(e.target.value))}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium"
                  />
                </div>
                <div className="sm:col-span-5 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-600">Avg Cash Sales</label>
                  </div>
                  <select
                    value={amCashFund}
                    onChange={(e) => setAmCashFund(e.target.value as CashFundKey)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700 mb-1"
                  >
                    {CASH_FUNDS.map((cf) => (
                      <option key={cf.key} value={cf.key}>
                        {cf.label} ({cf.charge})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    max="10000000"
                    step="100000"
                    value={amCash}
                    onChange={(e) => setAmCash(Number(e.target.value))}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium"
                  />
                </div>
                <div className="sm:col-span-5 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-600">Avg EPF Sales</label>
                  </div>
                  <select
                    value={amEpfFund}
                    onChange={(e) => setAmEpfFund(e.target.value as EpfFundKey)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700 mb-1"
                  >
                    {EPF_FUNDS.map((ef) => (
                      <option key={ef.key} value={ef.key}>
                        {ef.label} ({ef.charge})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    max="5000000"
                    step="50000"
                    value={amEpf}
                    onChange={(e) => setAmEpf(Number(e.target.value))}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium"
                  />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Comparison & Pitch Impact (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Side-by-Side Earnings Comparison Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-indigo-900/60 pb-4">
              <div>
                <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Prospect Earnings Impact</p>
                <h3 className="text-lg font-extrabold text-white">Solo Sales vs. Multi-Tier Leverage</h3>
              </div>
              <div className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full">
                +{percentageBoost}% Income Boost
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-xs text-slate-400 font-medium mb-1">👤 Solo Producer (0 Recruits)</p>
                <p className="text-lg sm:text-xl font-extrabold text-slate-200 truncate">
                  {fC(soloMetrics.income)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Personal Commission Only</p>
              </div>

              <div className="bg-indigo-600/30 border border-indigo-400/40 rounded-2xl p-4 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
                <p className="text-xs text-indigo-200 font-bold mb-1">🚀 Multi-Tier Team ({teamMetrics.totalAgents} Agents)</p>
                <p className="text-lg sm:text-xl font-extrabold text-white truncate">
                  {fC(teamMetrics.income)}
                </p>
                <p className="text-[11px] text-indigo-200 mt-1">Personal + ORC + Trailers</p>
              </div>
            </div>

            {/* Income Streams Breakdown */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Team Builder Income Breakdown</p>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span> Personal Sales Commission (PSC)
                  </span>
                  <span className="font-bold text-white">{fC(teamMetrics.psc)}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Overriding Commission (ORC from Recruits)
                  </span>
                  <span className="font-bold text-emerald-300">{fC(teamMetrics.orc)}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span> Equalisation Commission (EC)
                  </span>
                  <span className="font-bold text-amber-300">{fC(teamMetrics.ec)}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span> Recurring Trailer Income (Passive)
                  </span>
                  <span className="font-bold text-sky-300">{fC(teamMetrics.trail)} / yr</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row gap-3">
              <button
                id="btn-apply-prospect-scenario"
                onClick={handleApplyAndSimulate}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Simulate in Live Org Chart</span>
              </button>
            </div>
          </div>

          {/* Copyable Pitch Script Generator Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">WhatsApp / Meeting Pitch Script</h3>
                <p className="text-xs text-slate-500">Copy this customized pitch to send to your candidate</p>
              </div>
              <button
                onClick={handleCopyScript}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copied to Clipboard!' : 'Copy Script'}</span>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
              {pitchScriptText}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
