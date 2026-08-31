import React, { useState } from 'react';
import { AgentNode, AgencyMetrics, Rank } from '../../types';
import { Users, Plus, Trash2, Shield, DollarSign, ChevronRight, UserPlus, AlertCircle, Layers } from 'lucide-react';
import { fC } from '../../data/rates';

interface ScenarioBuilderPanelProps {
  slide1Tree: AgentNode;
  slide1Metrics: AgencyMetrics;
  slide2Tree: AgentNode;
  slide2Metrics: AgencyMetrics;
  onUpdateNode1: (id: string, field: keyof AgentNode, val: any) => void;
  onAddChild1: (parentId: string, rank: Rank) => void;
  onRemoveNode1: (id: string) => void;
  onUpdateNode2: (id: string, field: keyof AgentNode, val: any) => void;
  onAddChild2: (parentId: string, rank: Rank) => void;
  onRemoveNode2: (id: string) => void;
  primaryRole1: Rank;
  onChangePrimaryRole1: (role: Rank) => void;
  primaryRole2: Rank;
  onChangePrimaryRole2: (role: Rank) => void;
  onLoadScenarioA1: () => void;
  onLoadScenarioB1: () => void;
  onLoadScenarioC1: () => void;
  onLoadScenarioA2: () => void;
  onLoadScenarioB2: () => void;
  onLoadScenarioC2: () => void;
  activeSlideTab: 'slide1' | 'slide2';
  setActiveSlideTab: (tab: 'slide1' | 'slide2') => void;
}

export const ScenarioBuilderPanel: React.FC<ScenarioBuilderPanelProps> = ({
  slide1Tree,
  slide1Metrics,
  slide2Tree,
  slide2Metrics,
  onUpdateNode1,
  onAddChild1,
  onRemoveNode1,
  onUpdateNode2,
  onAddChild2,
  onRemoveNode2,
  primaryRole1,
  onChangePrimaryRole1,
  primaryRole2,
  onChangePrimaryRole2,
  onLoadScenarioA1,
  onLoadScenarioB1,
  onLoadScenarioC1,
  onLoadScenarioA2,
  onLoadScenarioB2,
  onLoadScenarioC2,
  activeSlideTab,
  setActiveSlideTab,
}) => {
  const tree = activeSlideTab === 'slide1' ? slide1Tree : slide2Tree;
  const metrics = activeSlideTab === 'slide1' ? slide1Metrics : slide2Metrics;
  const primaryRole = activeSlideTab === 'slide1' ? primaryRole1 : primaryRole2;
  const onUpdateNode = activeSlideTab === 'slide1' ? onUpdateNode1 : onUpdateNode2;
  const onAddChild = activeSlideTab === 'slide1' ? onAddChild1 : onAddChild2;
  const onRemoveNode = activeSlideTab === 'slide1' ? onRemoveNode1 : onRemoveNode2;
  const onChangePrimaryRole = activeSlideTab === 'slide1' ? onChangePrimaryRole1 : onChangePrimaryRole2;
  const onLoadScenarioA = activeSlideTab === 'slide1' ? onLoadScenarioA1 : onLoadScenarioA2;
  const onLoadScenarioB = activeSlideTab === 'slide1' ? onLoadScenarioB1 : onLoadScenarioB2;
  const onLoadScenarioC = activeSlideTab === 'slide1' ? onLoadScenarioC1 : onLoadScenarioC2;

  const [selectedParentId, setSelectedParentId] = useState<string>(tree.id);
  const [selectedChildRank, setSelectedChildRank] = useState<Rank>('UTC');

  // Allowed child ranks based on parent rank
  const getAllowedChildRanks = (parentRank: Rank): Rank[] => {
    switch (parentRank) {
      case 'GAM':
        return ['GAM', 'AM', 'UTC'];
      case 'AM':
        return ['UM', 'UTC'];
      case 'UM':
        return ['UTC'];
      case 'UTC':
        return [];
      default:
        return ['UTC'];
    }
  };

  // Helper to find node in tree by ID
  const findNodeById = (node: AgentNode, id: string): AgentNode | null => {
    if (node.id === id) return node;
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
    return null;
  };

  const selectedParentNode = findNodeById(tree, selectedParentId) || tree;
  const allowedRanks = getAllowedChildRanks(selectedParentNode.rank);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-6 space-y-6">
      
      {/* Slide Scenario Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Permanent Scenario Input Panel
          </span>
          <span className="text-xs text-slate-500 font-medium">Configure Slide 1 & Slide 2 Independently</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveSlideTab('slide1')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSlideTab === 'slide1'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 bg-transparent'
            }`}
          >
            Slide 1 Scenario
          </button>
          <button
            onClick={() => setActiveSlideTab('slide2')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSlideTab === 'slide2'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 bg-transparent'
            }`}
          >
            Slide 2 Scenario
          </button>
        </div>
      </div>

      {/* Header & Primary Role Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            Editing {activeSlideTab === 'slide1' ? 'Slide 1' : 'Slide 2'} Hierarchy & Sales Assumptions
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Construct recruitment tree and assign individual EPF & Cash sales per agent. Changes instantly update the calculation engine and slide views.
          </p>

          {/* Quick Scenario Test Presets A, B, C */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs font-black text-slate-700">Quick Test Presets for {activeSlideTab === 'slide1' ? 'Slide 1' : 'Slide 2'}:</span>
            <button
              onClick={onLoadScenarioA}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
              title="GAM → 1 UTC"
            >
              Scenario A (GAM → UTC)
            </button>
            <button
              onClick={onLoadScenarioB}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
              title="GAM → 1 AM → 1 UTC"
            >
              Scenario B (GAM → AM → UTC)
            </button>
            <button
              onClick={onLoadScenarioC}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
              title="GAM → 1 AM + 1 UTC"
            >
              Scenario C (GAM → AM + UTC)
            </button>
          </div>
        </div>

        {/* Primary Role Selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold text-slate-700 px-2">Primary User Rank:</span>
          {(['GAM', 'AM', 'UM'] as Rank[]).map((r) => (
            <button
              key={r}
              onClick={() => {
                onChangePrimaryRole(r);
                onUpdateNode(tree.id, 'rank', r);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                primaryRole === r
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 bg-transparent'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Tree Builder (Left) & Sales / Metrics Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Tree Hierarchy Tree Structure & Downline Adder */}
        <div className="lg:col-span-7 bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>{activeSlideTab === 'slide1' ? 'Slide 1' : 'Slide 2'} Recruitment Tree Structure &amp; Sales</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">Total Agents: {metrics.totalAgents}</span>
          </div>

          {/* Interactive Tree Node List */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {renderTreeNodeRow(tree, 0, selectedParentId, setSelectedParentId, onUpdateNode, onRemoveNode)}
          </div>

          {/* Add Recruit Control Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                <span>Add Recruit Under: <strong className="text-blue-600">{selectedParentNode.name || selectedParentNode.rank}</strong> ({selectedParentNode.rank})</span>
              </span>
            </div>

            {allowedRanks.length > 0 ? (
              <div className="flex items-center gap-3">
                <select
                  value={selectedChildRank}
                  onChange={(e) => setSelectedChildRank(e.target.value as Rank)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {allowedRanks.map((r) => (
                    <option key={r} value={r}>
                      Recruit {r}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    onAddChild(selectedParentId, selectedChildRank);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add {selectedChildRank} Downline</span>
                </button>
              </div>
            ) : (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{selectedParentNode.rank} rank cannot recruit further downlines per hierarchy rules.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Live Calculated Financial & Sales Summary */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>{activeSlideTab === 'slide1' ? 'Slide 1' : 'Slide 2'} Calculated Engine Output</span>
              </h3>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                Real-Time Sync
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3">
                <p className="text-[10px] font-black text-slate-300 uppercase">Total EPF Sales</p>
                <p className="text-lg font-black text-emerald-300 mt-1">{fC(metrics.totalEpfSales)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3">
                <p className="text-[10px] font-black text-slate-300 uppercase">Total Cash Sales</p>
                <p className="text-lg font-black text-sky-300 mt-1">{fC(metrics.totalCashSales)}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                <span className="text-slate-300 font-semibold">Total Monthly Sales:</span>
                <span className="font-black text-white">{fC(metrics.totalSales)}</span>
              </div>
              <div className="flex justify-between bg-emerald-600/30 px-3 py-2 rounded-xl border border-emerald-400/30">
                <span className="text-emerald-200 font-semibold">{primaryRole} Total Income:</span>
                <span className="font-black text-amber-300">{fC(metrics.sponsorTotalIncome)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-300">
            <span>✨ Automatically updates {activeSlideTab === 'slide1' ? 'Slide 1' : 'Slide 2'} presentation deck in real time.</span>
          </div>
        </div>

      </div>

    </div>
  );
};

// Helper recursive row renderer for tree structure with individual EPF and Cash inputs
function renderTreeNodeRow(
  node: AgentNode,
  depth: number,
  selectedParentId: string,
  setSelectedParentId: (id: string) => void,
  onUpdateNode: (id: string, field: keyof AgentNode, val: any) => void,
  onRemoveNode: (id: string) => void
) {
  const isSelected = selectedParentId === node.id;

  return (
    <div key={node.id} className="space-y-2">
      <div
        onClick={() => setSelectedParentId(node.id)}
        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-all cursor-pointer gap-2 ${
          isSelected
            ? 'bg-blue-50 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}
        style={{ marginLeft: `${Math.min(depth * 12, 48)}px` }}
      >
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
            node.rank === 'GAM' ? 'bg-amber-100 text-amber-800' :
            node.rank === 'AM' ? 'bg-sky-100 text-sky-800' :
            node.rank === 'UM' ? 'bg-emerald-100 text-emerald-800' :
            'bg-indigo-100 text-indigo-800'
          }`}>
            {node.rank}
          </span>
          <input
            type="text"
            value={node.name}
            placeholder={`${node.rank} Name`}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onUpdateNode(node.id, 'name', e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 w-28 focus:ring-1 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-500">EPF:</span>
            <input
              type="number"
              value={node.epf}
              onChange={(e) => onUpdateNode(node.id, 'epf', parseFloat(e.target.value) || 0)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 w-20 text-right focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-500">Cash:</span>
            <input
              type="number"
              value={node.cash}
              onChange={(e) => onUpdateNode(node.id, 'cash', parseFloat(e.target.value) || 0)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 w-20 text-right focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {node.id !== 'root' && (
            <button
              onClick={() => onRemoveNode(node.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Remove agent"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {node.children.map((child) => renderTreeNodeRow(child, depth + 1, selectedParentId, setSelectedParentId, onUpdateNode, onRemoveNode))}
    </div>
  );
}
