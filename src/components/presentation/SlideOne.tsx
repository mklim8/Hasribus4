import React from 'react';
import { AgentNode, AgencyMetrics } from '../../types';

interface SlideOneProps {
  tree: AgentNode;
  metrics: AgencyMetrics;
}

export const SlideOne: React.FC<SlideOneProps> = ({ tree, metrics }) => {
  // Extract dynamic values from calculation engine
  const totalUtcCount = metrics.activeRankCounts.UTC || tree.children.filter(c => c.rank === 'UTC').reduce((acc, c) => acc + (c.count || 1), 0) || 10;
  const totalSalesEpf = metrics.totalEpfSales > 0 ? metrics.totalEpfSales : metrics.totalSales || 200000;
  const gamIncome = metrics.sponsorTotalIncome || 11600;

  // Calculate average UTC income or first direct UTC income
  let utcIncome = 3890;
  const directUtcs = tree.children.filter(c => c.rank === 'UTC');
  if (directUtcs.length > 0) {
    const firstUtc = directUtcs[0];
    const firstUtcIncome = (firstUtc.ePsc || 0) + (firstUtc.eOrc || 0) + (firstUtc.eEc || 0) + (firstUtc.eTrail || 0);
    if (firstUtcIncome > 0) {
      utcIncome = Math.round(firstUtcIncome);
    }
  }

  const formatCurrency = (val: number) => {
    return 'RM ' + val.toLocaleString('en-MY');
  };

  const renderCount = Math.min(Math.max(totalUtcCount, 3), 10);
  const utcArray = Array.from({ length: renderCount }, (_, i) => i + 1);

  return (
    <div className="w-[1920px] h-[1080px] bg-[#fcfdff] relative overflow-hidden flex flex-col justify-between px-16 py-8 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Background Subtle Dot Pattern */}
      <div className="absolute inset-0 bg-dots-pattern opacity-40 pointer-events-none" />

      {/* TOP HEADER SECTION */}
      <div className="relative z-10 text-center pt-2">
        <div className="inline-block relative">
          <h1 className="text-7xl font-black text-slate-900 tracking-tight uppercase px-8 py-2">
            WORK A LITTLE BIT HARDER.
          </h1>
          {/* Hand-drawn style blue underline */}
          <svg className="absolute -bottom-3 left-0 w-full overflow-visible" height="18" viewBox="0 0 750 18" fill="none">
            <path d="M4 14C190 4 560 4 746 14" stroke="#2563eb" strokeWidth="6.5" strokeLinecap="round" />
          </svg>
          <div className="absolute -top-6 -left-14 text-blue-600 text-3xl font-bold animate-pulse">✨</div>
          <div className="absolute -top-4 -right-14 text-blue-600 text-3xl font-bold animate-pulse">✨</div>
        </div>

        <p className="mt-5 text-3xl font-extrabold text-slate-800 max-w-5xl mx-auto tracking-wide leading-snug">
          Recruit <span className="text-blue-600 font-black underline decoration-blue-400 underline-offset-4">{totalUtcCount}</span> Unit Trust Consultants.<br/>
          You and your downline achieve sales of <span className="text-emerald-700 font-black underline decoration-emerald-400 underline-offset-4">{formatCurrency(totalSalesEpf)} (EPF)</span> every month.
        </p>
      </div>

      {/* MIDDLE HIERARCHY & EARNINGS CANVAS */}
      <div className="relative z-10 flex flex-col justify-center items-center my-2">
        
        {/* TOP CARDS ROW: GAM INCOME & UTC EARN */}
        <div className="w-full max-w-7xl flex justify-between items-center px-6 mb-2">
          
          {/* GAM Income Box */}
          <div className="bg-emerald-50/95 border-4 border-emerald-600 rounded-3xl px-10 py-6 shadow-xl relative transform -rotate-1">
            <div className="absolute -top-4 right-8 bg-emerald-600 text-white text-xs font-black uppercase px-4 py-1 rounded-full shadow-xs">
              Sponsor Earnings
            </div>
            <p className="text-base font-black text-emerald-900 uppercase tracking-wider">YOU AS GAM WILL EARN</p>
            <p className="text-5xl font-black text-emerald-700 mt-1.5 tracking-tight">{formatCurrency(gamIncome)}<span className="text-xl font-bold text-emerald-600">.</span></p>
            <div className="absolute -left-4 top-3 text-emerald-500 text-2xl font-bold">🌿</div>
            <div className="absolute -right-4 bottom-3 text-emerald-500 text-2xl font-bold">🌿</div>
          </div>

          {/* CENTER GAM STICK FIGURE */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <svg width="140" height="160" viewBox="0 0 140 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-900 drop-shadow-sm">
                <circle cx="70" cy="24" r="20" stroke="currentColor" strokeWidth="4.5" fill="white" />
                <circle cx="62" cy="20" r="2.2" fill="currentColor" />
                <circle cx="78" cy="20" r="2.2" fill="currentColor" />
                <path d="M62 29C62 34 78 34 78 29" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M70 4V9M62 5L64 10M78 5L76 10" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M70 44V95" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                <path d="M63 54L77 54L70 70Z" fill="#2563eb" />
                <path d="M70 58L32 46M32 46L22 40M32 46L27 54" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <path d="M70 58L108 46M108 46L118 40M108 46L113 54" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <path d="M70 95L44 150" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                <path d="M70 95L96 150" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="bg-blue-600 text-white font-black text-lg px-7 py-2 rounded-xl shadow-lg uppercase tracking-wider border-3 border-blue-700">
              GAM
            </div>
          </div>

          {/* Each UTC Earn Box */}
          <div className="bg-blue-50/95 border-4 border-blue-600 rounded-3xl px-10 py-6 shadow-xl relative transform rotate-1">
            <div className="absolute -top-4 left-8 bg-blue-600 text-white text-xs font-black uppercase px-4 py-1 rounded-full shadow-xs">
              Downline Incentive
            </div>
            <p className="text-base font-black text-blue-900 uppercase tracking-wider">EACH UTC EARN</p>
            <p className="text-5xl font-black text-blue-700 mt-1.5 tracking-tight">{formatCurrency(utcIncome)}<span className="text-xl font-bold text-blue-600">.</span></p>
            <svg className="absolute -right-8 -bottom-8 w-14 h-14 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

        </div>

        {/* HORIZONTAL ORGANIZATIONAL HIERARCHY CONNECTOR LINE */}
        <div className="w-full max-w-7xl px-4 my-2">
          <div className="h-2 bg-emerald-600 w-full relative rounded-full">
            <div className="absolute inset-0 flex justify-around items-center">
              {utcArray.map((_, i) => (
                <div key={i} className="w-1.5 h-10 bg-emerald-600 relative">
                  <div className="absolute bottom-0 -left-2.5 w-0 h-0 border-l-5 border-l-transparent border-r-5 border-r-transparent border-t-10 border-t-emerald-600" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DOWNLINE UTC ROW */}
        <div className="w-full max-w-7xl flex justify-around items-start px-2 mt-4">
          {utcArray.map((idx) => {
            const hasGlasses = idx === 3;
            const hasPonytail = idx === 2 || idx === 8;

            return (
              <div key={idx} className="flex flex-col items-center">
                <svg width="100" height="140" viewBox="0 0 100 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-900 drop-shadow-xs">
                  <circle cx="50" cy="22" r="15" stroke="currentColor" strokeWidth="4" fill="white" />
                  {hasPonytail && <path d="M63 16C70 12 70 20 65 23" stroke="currentColor" strokeWidth="3" fill="currentColor" />}
                  <circle cx="44" cy="19" r="1.8" fill="currentColor" />
                  <circle cx="56" cy="19" r="1.8" fill="currentColor" />
                  {hasGlasses ? (
                    <rect x="40" y="15" width="20" height="9" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none" />
                  ) : (
                    <path d="M45 25C45 27 55 27 55 25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  )}
                  <path d="M50 37V84" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <path d="M45 45L55 45L50 58Z" fill="#2563eb" />
                  <path d="M50 50L24 62" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M50 50L76 60M76 60L82 55" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M50 84L32 130" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <path d="M50 84L68 130" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
                <div className="bg-white border-3 border-blue-600 text-blue-700 font-black text-base px-4 py-1 rounded-lg shadow-sm mt-1 tracking-wider">
                  UTC
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* BOTTOM ACTION & STRATEGY BOXES */}
      <div className="relative z-10 grid grid-cols-12 gap-8 items-stretch pb-2">
        
        {/* HOW TO DO IT BOX (Left 7 Cols) */}
        <div className="col-span-7 bg-white border-4 border-blue-600 rounded-3xl p-8 shadow-2xl relative flex flex-col justify-between">
          <div className="absolute -top-5 left-10 bg-slate-900 text-white font-black text-lg uppercase px-7 py-2 rounded-2xl shadow-lg tracking-wider">
            HOW TO DO IT
          </div>

          <div className="grid grid-cols-3 gap-6 mt-4 items-center">
            
            {/* Step 1: Every Day */}
            <div className="flex flex-col items-center text-center p-5 rounded-3xl bg-slate-50/90 border-2 border-slate-200 shadow-xs">
              <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2">EVERY DAY</p>
              <div className="flex items-center gap-3 my-2">
                <span className="text-4xl">📢</span>
                <span className="text-5xl font-black text-blue-600">3</span>
              </div>
              <p className="text-sm font-extrabold text-slate-800 mt-1">PEOPLE CONTACTED</p>
            </div>

            {/* Step 2: A Week */}
            <div className="flex flex-col items-center text-center p-5 rounded-3xl bg-slate-50/90 border-2 border-slate-200 shadow-xs relative">
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-blue-600 font-black text-3xl">→</div>
              <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2">A WEEK</p>
              <div className="bg-white border-2 border-slate-300 rounded-xl p-2 w-24 shadow-sm my-1">
                <div className="bg-red-500 text-white text-[10px] font-extrabold text-center rounded-t py-0.5">7 DAYS</div>
                <div className="grid grid-cols-7 gap-0.5 text-[9px] p-1 text-slate-600 font-bold">
                  {Array.from({length: 7}).map((_, idx) => <span key={idx} className="bg-blue-100 rounded text-center">✓</span>)}
                </div>
              </div>
              <p className="text-4xl font-black text-slate-900 mt-1">15 <span className="text-sm font-bold text-slate-500">PEOPLE</span></p>
            </div>

            {/* Step 3: A Month */}
            <div className="flex flex-col items-center text-center p-5 rounded-3xl bg-slate-50/90 border-2 border-slate-200 shadow-xs relative">
              <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2">A MONTH</p>
              <div className="bg-white border-2 border-slate-300 rounded-xl p-2 w-24 shadow-sm my-1">
                <div className="bg-indigo-600 text-white text-[10px] font-extrabold text-center rounded-t py-0.5">30 DAYS</div>
                <div className="grid grid-cols-6 gap-0.5 text-[8px] p-1 text-slate-600 font-bold">
                  {Array.from({length: 12}).map((_, idx) => <span key={idx} className="bg-emerald-100 rounded text-center">✓</span>)}
                </div>
              </div>
              <p className="text-4xl font-black text-blue-600 mt-1">60 <span className="text-sm font-bold text-slate-500">PEOPLE</span></p>
            </div>

          </div>
        </div>

        {/* OR / EITHER OPTIONS BOX (Right 5 Cols) */}
        <div className="col-span-5 flex flex-col justify-center">
          <div className="relative bg-white border-4 border-slate-900 rounded-3xl p-8 shadow-2xl flex items-center justify-between">
            <div className="absolute -top-5 left-10 bg-slate-900 text-white font-black text-lg uppercase px-7 py-2 rounded-2xl shadow-lg tracking-wider">
              EITHER
            </div>

            {/* Option 1: people RM20k */}
            <div className="flex-1 pr-3 border-r-2 border-slate-200">
              <div className="bg-amber-50/90 border-3 border-amber-500 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-black text-amber-900 uppercase">GET <span className="text-2xl font-black text-amber-600">{Math.max(1, Math.round(totalSalesEpf / 20000))}</span> PEOPLE</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">TO INVEST</p>
                <p className="text-3xl font-black text-amber-700 tracking-tight mt-1">RM 20K</p>
                <p className="text-xs font-bold text-slate-600 mt-1">EACH, FROM THEIR EPF.</p>
              </div>
            </div>

            {/* OR */}
            <div className="px-5 text-center">
              <span className="text-3xl font-black text-slate-400 italic">OR</span>
            </div>

            {/* Option 2: people RM10k */}
            <div className="flex-1 pl-3">
              <div className="bg-emerald-50/90 border-3 border-emerald-600 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-black text-emerald-900 uppercase">GET <span className="text-2xl font-black text-emerald-600">{Math.max(1, Math.round(totalSalesEpf / 10000))}</span> PEOPLE</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">TO INVEST</p>
                <p className="text-3xl font-black text-emerald-700 tracking-tight mt-1">RM 10K</p>
                <p className="text-xs font-bold text-slate-600 mt-1">EACH, FROM THEIR EPF.</p>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
