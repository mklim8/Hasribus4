import React from 'react';
import { 
  Crown, 
  Star, 
  Shield, 
  Rocket, 
  Trash2, 
  Plus, 
  Users, 
  Coins, 
  TrendingUp, 
  ChevronRight, 
  Info,
  DollarSign
} from 'lucide-react';
import { AgentNode, CashFundKey, EpfFundKey, Rank } from '../types';
import { CASH_FUNDS, EPF_FUNDS, HIERARCHY, RANK_INFO, fC } from '../data/rates';

interface SimulatorCardProps {
  node: AgentNode;
  parentRank?: Rank;
  onUpdate: (id: string, field: keyof AgentNode, val: any) => void;
  onAddChild: (parentId: string) => void;
  onRemove: (id: string) => void;
}

export const SimulatorCard: React.FC<SimulatorCardProps> = ({
  node,
  parentRank,
  onUpdate,
  onAddChild,
  onRemove,
}) => {
  const isRoot = node.id === 'root';
  const rankInfo = RANK_INFO[node.rank] || RANK_INFO.UTC;
  const maxHierarchyLevel = isRoot ? 4 : (parentRank ? HIERARCHY[parentRank] : 4);

  // Available rank options for this node
  const availableRanks: Rank[] = (['GAM', 'AM', 'UM', 'UTC'] as Rank[]).filter(
    (r) => HIERARCHY[r] <= maxHierarchyLevel
  );

  const getRankIcon = (rank: Rank) => {
    switch (rank) {
      case 'GAM':
        return <Crown className="w-4 h-4 text-amber-500" />;
      case 'AM':
        return <Star className="w-4 h-4 text-sky-500" />;
      case 'UM':
        return <Shield className="w-4 h-4 text-emerald-500" />;
      case 'UTC':
        return <Rocket className="w-4 h-4 text-indigo-500" />;
    }
  };

  const addQuickSales = (field: 'cash' | 'epf', amount: number) => {
    const current = Number(node[field]) || 0;
    onUpdate(node.id, field, current + amount);
  };

  const div = isRoot ? 1 : (node.count || 1);
  const totalIncomePerAgent = ((node.ePsc || 0) + (node.eOrc || 0) + (node.eEc || 0) + (node.eTrail || 0)) / div;

  // Depth styling
  const depthColors = [
    'border-l-indigo-600 bg-white',
    'border-l-sky-500 bg-slate-50/50',
    'border-l-emerald-500 bg-slate-50/30',
    'border-l-amber-500 bg-slate-50/20',
  ];

  return (
    <div 
      id={`card-${node.id}`}
      className={`rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 transition-all duration-200 hover:shadow-md border-l-4 ${depthColors[node.depth] || depthColors[0]}`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200/80 shadow-xs">
            {getRankIcon(node.rank)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">
                {isRoot ? 'My Sponsor Profile' : node.name || `Gen ${node.depth} Downline`}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rankInfo.badgeBg}`}>
                {node.rank}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {isRoot ? 'Sponsor (Top)' : `Gen ${node.depth}`}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">{rankInfo.title}</p>
          </div>
        </div>

        {/* Delete button for downlines */}
        {!isRoot && (
          <button
            onClick={() => onRemove(node.id)}
            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
            title="Delete this branch"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 mb-4">
        
        {/* Name Input */}
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Agent / Team Name
          </label>
          <input
            type="text"
            placeholder={isRoot ? 'e.g. John Doe (You)' : `e.g. Alpha Unit ${node.depth}`}
            value={node.name || ''}
            onChange={(e) => onUpdate(node.id, 'name', e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Rank Selector */}
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Designated Rank
          </label>
          <select
            value={node.rank}
            onChange={(e) => onUpdate(node.id, 'rank', e.target.value as Rank)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            {availableRanks.map((r) => (
              <option key={r} value={r}>
                {r} — {RANK_INFO[r].title}
              </option>
            ))}
          </select>
        </div>

        {/* Headcount / Count (Downlines only) */}
        {!isRoot ? (
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Group Size (Agents)
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onUpdate(node.id, 'count', Math.max(1, (node.count || 1) - 1))}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-600 flex items-center justify-center text-sm transition-colors"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={node.count || 1}
                onChange={(e) => onUpdate(node.id, 'count', Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-center bg-white border border-slate-200 rounded-lg py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => onUpdate(node.id, 'count', (node.count || 1) + 1)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-600 flex items-center justify-center text-sm transition-colors"
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <div className="sm:col-span-4 flex items-center">
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-2.5 w-full">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-900">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Direct Sponsor Node</span>
              </div>
              <p className="text-[10px] text-indigo-700 mt-0.5">Calculates your grand personal &amp; overriding pay</p>
            </div>
          </div>
        )}

      </div>

      {/* Production Inputs: Cash & EPF */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
        
        {/* Cash Fund & Volume */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
              Cash Sales Fund
            </label>
          </div>
          
          <select
            value={node.cashFund}
            onChange={(e) => onUpdate(node.id, 'cashFund', e.target.value as CashFundKey)}
            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {CASH_FUNDS.map((cf) => (
              <option key={cf.key} value={cf.key}>
                {cf.label} ({cf.charge})
              </option>
            ))}
          </select>

          <div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">RM</span>
              <input
                type="number"
                placeholder="0"
                value={node.cash || ''}
                onChange={(e) => onUpdate(node.id, 'cash', parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            {/* Quick amount increment pills */}
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[10px] text-slate-400 font-medium mr-1">Quick:</span>
              {[10000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => addQuickSales('cash', amt)}
                  className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200/50 transition-colors"
                >
                  +{amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* EPF Fund & Volume */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-sky-600" />
              EPF Sales Fund
            </label>
          </div>
          
          <select
            value={node.epfFund}
            onChange={(e) => onUpdate(node.id, 'epfFund', e.target.value as EpfFundKey)}
            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {EPF_FUNDS.map((ef) => (
              <option key={ef.key} value={ef.key}>
                {ef.label} ({ef.charge})
              </option>
            ))}
          </select>

          <div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">RM</span>
              <input
                type="number"
                placeholder="0"
                value={node.epf || ''}
                onChange={(e) => onUpdate(node.id, 'epf', parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
            {/* Quick amount increment pills */}
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[10px] text-slate-400 font-medium mr-1">Quick:</span>
              {[10000, 25000, 50000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => addQuickSales('epf', amt)}
                  className="text-[10px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100/80 px-2 py-0.5 rounded border border-sky-200/50 transition-colors"
                >
                  +{amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Commission Earnings Breakdown Panel */}
      <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-200/80">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          
          <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-xs">
            <span className="text-[10px] font-semibold text-slate-500 block uppercase">PSC + Pers. ORC</span>
            <span className="font-extrabold text-indigo-700 text-xs sm:text-sm">
              {fC((node.ePsc || 0) / div)}
            </span>
          </div>

          {!isRoot ? (
            <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-xs">
              <span className="text-[10px] font-semibold text-slate-500 block uppercase">Direct ORC</span>
              <span className="font-extrabold text-sky-700 text-xs sm:text-sm">
                {fC((node.eOrc || 0) / div)}
              </span>
            </div>
          ) : (
            <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-xs">
              <span className="text-[10px] font-semibold text-slate-500 block uppercase">Team Direct ORC</span>
              <span className="font-extrabold text-sky-700 text-xs sm:text-sm">
                {fC(node.eOrc || 0)}
              </span>
            </div>
          )}

          <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-xs">
            <span className="text-[10px] font-semibold text-slate-500 block uppercase">Equalisation (EC)</span>
            <span className="font-extrabold text-violet-700 text-xs sm:text-sm">
              {fC((node.eEc || 0) / div)}
            </span>
          </div>

          <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-xs">
            <span className="text-[10px] font-semibold text-slate-500 block uppercase">Trailer / ETC (Mo)</span>
            <span className="font-extrabold text-amber-700 text-xs sm:text-sm">
              {fC((node.eTrail || 0) / div)}
            </span>
          </div>

        </div>

        {/* Total Income Row */}
        <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">
              {isRoot ? 'Total Monthly Income' : `Estimated Income (Per Agent)`}
            </span>
            {!isRoot && node.count > 1 && (
              <span className="text-[10px] font-medium text-slate-500">
                (Group Total: {fC((node.ePsc || 0) + (node.eOrc || 0) + (node.eEc || 0) + (node.eTrail || 0))})
              </span>
            )}
          </div>
          <span className="text-sm font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
            {fC(totalIncomePerAgent)}
          </span>
        </div>
      </div>

      {/* Add Downline Action Button (Max Depth 3) */}
      {node.depth < 3 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => onAddChild(node.id)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 text-xs font-bold rounded-xl border border-dashed border-indigo-300 transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
          >
            <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
            <span>Add Gen {node.depth + 1} Downline under {node.name || node.rank}</span>
          </button>
        </div>
      )}

      {/* Recursive Children Render with indentation connector */}
      {node.children && node.children.length > 0 && (
        <div className="mt-4 pl-3 sm:pl-6 border-l-2 border-dashed border-indigo-200 space-y-4">
          {node.children.map((child) => (
            <SimulatorCard
              key={child.id}
              node={child}
              parentRank={node.rank}
              onUpdate={onUpdate}
              onAddChild={onAddChild}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
};
