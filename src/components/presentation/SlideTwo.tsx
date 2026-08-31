import React from 'react';
import { AgentNode, AgencyMetrics } from '../../types';

interface SlideTwoProps {
  tree: AgentNode;
  metrics: AgencyMetrics;
  slide1Metrics?: AgencyMetrics;
  config: {
    slide2Headline: string;
    slide2Subheadline: string;
    slide2GamLabel: string;
    slide2UtcLabel: string;
    slide2SalesMultiplier: number;
    slide2UtcMultiplier: number;
    slide2BottomMessage: string;
  };
}

export const SlideTwo: React.FC<SlideTwoProps> = ({ tree, metrics, slide1Metrics, config }) => {
  const formatCurrency = (val: number) => {
    return 'RM ' + Math.round(val).toLocaleString('en-MY');
  };

  const primaryRole = tree.rank || 'GAM';
  const gamIncome = metrics.sponsorTotalIncome || 28400;

  // Find sample downline for right card
  let downlineRole = 'UTC';
  let downlineIncome = 7150;
  const findFirstDownline = (node: AgentNode): AgentNode | null => {
    for (const child of node.children) {
      if (child.rank === 'UTC') return child;
      const found = findFirstDownline(child);
      if (found) return found;
    }
    return node.children[0] || null;
  };
  const sampleDownline = findFirstDownline(tree);
  if (sampleDownline) {
    downlineRole = sampleDownline.rank;
    const inc = (sampleDownline.ePsc || 0) + (sampleDownline.eOrc || 0) + (sampleDownline.eEc || 0) + (sampleDownline.eTrail || 0);
    if (inc > 0) downlineIncome = Math.round(inc);
  }

  // Dynamic Sales values
  const epfSales = metrics.totalEpfSales || 200000;
  const cashSales = metrics.totalCashSales || 100000;
  const totalSales = metrics.totalSales || (epfSales + cashSales);

  // Dynamic Multipliers vs Slide 1
  const slide1Sales = slide1Metrics?.totalSales || 200000;
  const salesMultiplier = (totalSales / Math.max(slide1Sales, 1)).toFixed(1);

  const slide1Gam = slide1Metrics?.sponsorTotalIncome || 11600;
  const gamMultiplier = (gamIncome / Math.max(slide1Gam, 1)).toFixed(1);

  // Subheadline text
  const subheadlineText = cashSales > 0
    ? `Add ${formatCurrency(cashSales)} CASH SALES on top of our existing ${formatCurrency(epfSales)} (EPF) sales every month.`
    : `Achieving ${formatCurrency(epfSales)} (EPF) sales every month across ${metrics.totalAgents - 1} active consultants.`;

  // Tree levels extraction for exact hierarchy visual representation
  const getTreeLevels = (root: AgentNode) => {
    const levels: AgentNode[][] = [];
    const traverse = (node: AgentNode, depth: number) => {
      if (!levels[depth]) levels[depth] = [];
      levels[depth].push(node);
      node.children.forEach(child => traverse(child, depth + 1));
    };
    traverse(root, 0);
    return levels;
  };

  const treeLevels = getTreeLevels(tree);

  return (
    <div className="w-[1920px] h-[1080px] bg-[#fcfdff] relative overflow-hidden flex flex-col justify-between px-12 py-5 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Background Subtle Dot Pattern */}
      <div className="absolute inset-0 bg-dots-pattern opacity-40 pointer-events-none" />

      {/* TOP HEADER SECTION */}
      <div className="relative z-10 text-center pt-1">
        <div className="inline-block relative">
          <h1 className="text-7xl font-black text-slate-900 tracking-tight uppercase px-10 py-1">
            {config.slide2Headline}
          </h1>
          {/* Hand-drawn marker underline */}
          <svg className="absolute -bottom-3 left-0 w-full overflow-visible" height="20" viewBox="0 0 950 20" fill="none">
            <path d="M4 15C230 4 720 4 946 15" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
          </svg>
          <div className="absolute -top-8 -left-16 text-blue-600 text-4xl font-bold animate-bounce">🚀</div>
          <div className="absolute -top-6 -right-16 text-blue-600 text-4xl font-bold animate-bounce">⭐</div>
        </div>

        <p className="mt-3 text-3xl font-extrabold text-slate-800 max-w-7xl mx-auto tracking-wide leading-snug">
          {subheadlineText}
        </p>
      </div>

      {/* MIDDLE HIERARCHY & EARNINGS CANVAS */}
      <div className="relative z-10 flex flex-col justify-center items-center my-1 w-full">
        
        {/* TOP CARDS ROW: LEADERSHIP INCOME & TEAM INCENTIVE */}
        <div className="w-full max-w-7xl flex justify-between items-center px-4 mb-2">
          
          {/* Leadership Income Box */}
          <div className="bg-emerald-50/95 border-3 border-emerald-600 rounded-3xl px-8 py-4 shadow-xl relative transform -rotate-1">
            <div className="absolute -top-4 right-8 bg-emerald-600 text-white text-[11px] font-black uppercase px-4 py-1 rounded-full shadow-xs flex items-center gap-1.5">
              <span>Leadership Earnings</span>
              <span className="bg-white text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-black">{gamMultiplier}X</span>
            </div>
            <p className="text-xs font-black text-emerald-900 uppercase tracking-wider">YOU AS {primaryRole} WILL EARN</p>
            <p className="text-5xl font-black text-emerald-700 mt-1 tracking-tight">{formatCurrency(gamIncome)}<span className="text-xl font-bold text-emerald-600">.</span></p>
            <div className="absolute -left-4 top-3 text-emerald-500 text-2xl font-bold">💎</div>
            <div className="absolute -right-4 bottom-3 text-emerald-500 text-2xl font-bold">🌿</div>
          </div>

          {/* CENTER ROOT STICK FIGURE */}
          <div className="flex flex-col items-center">
            <div className="relative mb-1">
              <svg width="100" height="110" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-900 drop-shadow-sm">
                <circle cx="60" cy="22" r="18" stroke="currentColor" strokeWidth="4" fill="white" />
                <circle cx="53" cy="18" r="2" fill="currentColor" />
                <circle cx="67" cy="18" r="2" fill="currentColor" />
                <path d="M53 26C53 31 67 31 67 26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M60 4V8M53 4L55 9M67 4L65 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M60 40V85" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M53 48L67 48L60 62Z" fill="#2563eb" />
                <path d="M60 52L28 42M28 42L19 36M28 42L24 49" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M60 52L92 42M92 42L101 36M92 42L96 49" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M60 85L38 132" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M60 85L82 132" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="bg-indigo-600 text-white font-black text-sm px-6 py-1.5 rounded-xl shadow-md uppercase tracking-wider border-2 border-indigo-700">
              {primaryRole} (YOU)
            </div>
          </div>

          {/* Downline Incentive Box */}
          <div className="bg-blue-50/95 border-3 border-blue-600 rounded-3xl px-8 py-4 shadow-xl relative transform rotate-1">
            <div className="absolute -top-4 left-8 bg-blue-600 text-white text-[11px] font-black uppercase px-4 py-1 rounded-full shadow-xs flex items-center gap-1.5">
              <span>Team Incentive</span>
              <span className="bg-white text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-black">Active</span>
            </div>
            <p className="text-xs font-black text-blue-900 uppercase tracking-wider">EACH {downlineRole} EARN</p>
            <p className="text-5xl font-black text-blue-700 mt-1 tracking-tight">{formatCurrency(downlineIncome)}<span className="text-xl font-bold text-blue-600">.</span></p>
            <svg className="absolute -right-8 -bottom-8 w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>

        </div>

        {/* PROMINENT HIERARCHY TREE LEVELS RENDERER (Optimized height & spacing) */}
        <div className="w-full max-w-7xl flex flex-col items-center gap-3 my-2 px-4">
          {treeLevels.slice(1).map((levelNodes, levelIdx) => (
            <div key={levelIdx} className="w-full flex flex-col items-center">
              {/* Connector line from above */}
              <div className="w-1.5 h-5 bg-indigo-600 rounded-full my-0.5" />
              
              <div className="w-full flex justify-center items-center gap-4 flex-wrap max-h-[220px] overflow-y-auto px-2">
                {levelNodes.map((node, nIdx) => (
                  <div key={node.id || nIdx} className="flex flex-col items-center bg-white border-3 border-indigo-600 rounded-2xl p-3 shadow-lg min-w-[160px]">
                    
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-300 flex items-center justify-center text-indigo-700 mb-1">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>

                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                        node.rank === 'GAM' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        node.rank === 'AM' ? 'bg-sky-100 text-sky-900 border border-sky-300' :
                        node.rank === 'UM' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                        'bg-indigo-100 text-indigo-900 border border-indigo-300'
                      }`}>
                        {node.rank}
                      </span>
                      <span className="text-xs font-extrabold text-slate-800 truncate max-w-[100px]">{node.name || `${node.rank} ${nIdx + 1}`}</span>
                    </div>

                    <div className="text-[11px] text-slate-600 font-bold space-y-0.5 text-center">
                      <p>EPF: <span className="text-indigo-700 font-black">{formatCurrency(node.epf || 0)}</span></p>
                      {node.cash ? (
                        <p className="text-emerald-700 font-black">Cash: {formatCurrency(node.cash)}</p>
                      ) : (
                        <p className="text-slate-400 font-medium">Cash: RM 0</p>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* BOTTOM ACTION & STRATEGY BOXES */}
      <div className="relative z-10 grid grid-cols-12 gap-6 items-stretch pb-1">
        
        {/* TOTAL SALES & MULTIPLIER BREAKDOWN BOX (Left 7 Cols) */}
        <div className="col-span-7 bg-white border-3 border-indigo-600 rounded-3xl p-5 shadow-xl relative flex flex-col justify-between">
          <div className="absolute -top-4 left-10 bg-slate-900 text-white font-black text-xs uppercase px-6 py-1.5 rounded-xl shadow-md tracking-wider">
            TOTAL SALES ACHIEVED EVERY MONTH
          </div>

          <div className="grid grid-cols-3 gap-3 mt-2 items-center">
            
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-indigo-50/90 border-2 border-indigo-200">
              <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1">EPF + CASH SALES</p>
              <p className="text-2xl font-black text-indigo-700 my-0.5">{formatCurrency(totalSales)}</p>
              <p className="text-[11px] font-bold text-slate-700">{formatCurrency(epfSales)} + {formatCurrency(cashSales)}</p>
            </div>

            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-emerald-50/90 border-2 border-emerald-200">
              <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-1">SALES GROWTH</p>
              <p className="text-3xl font-black text-emerald-700 my-0.5">{salesMultiplier}X</p>
              <p className="text-[11px] font-bold text-slate-700">More Volume vs Slide 1</p>
            </div>

            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-blue-50/90 border-2 border-blue-200">
              <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">LEADERSHIP BOOST</p>
              <p className="text-3xl font-black text-blue-700 my-0.5">{gamMultiplier}X</p>
              <p className="text-[11px] font-bold text-slate-700">Higher Income Factor</p>
            </div>

          </div>
        </div>

        {/* MOTIVATIONAL BOTTOM MESSAGE (Right 5 Cols) */}
        <div className="col-span-5 flex flex-col justify-center">
          <div className="relative bg-gradient-to-br from-indigo-900 to-slate-900 border-3 border-indigo-500 rounded-3xl p-5 shadow-xl flex flex-col justify-center text-white">
            <div className="absolute -top-4 left-10 bg-indigo-500 text-white font-black text-xs uppercase px-6 py-1.5 rounded-xl shadow-md tracking-wider">
              MORE PEOPLE. MORE SALES. MORE IMPACT.
            </div>
            <p className="text-lg font-black text-indigo-200 uppercase tracking-wide mb-1 mt-2">
              {config.slide2BottomMessage}
            </p>
            <p className="text-xs font-bold text-slate-300 leading-snug">
              HIGHER INCOME FOR YOU AND YOUR TEAM THROUGH STRATEGIC RECRUITMENT &amp; DIVERSIFIED PRODUCT MIX!
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
