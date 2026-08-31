import React, { useState, useRef } from 'react';
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Search, 
  ArrowUpDown, 
  FileSpreadsheet, 
  CheckCircle2, 
  Crown, 
  Star, 
  Shield, 
  Rocket, 
  Info,
  Maximize2,
  DollarSign
} from 'lucide-react';
import { AgentNode, AgencyMetrics, Rank } from '../types';
import { RANK_INFO, RATES, fC } from '../data/rates';
import { flattenTree, layoutTreeForSvg } from '../utils/calculator';

interface OrgChartTabProps {
  tree: AgentNode;
  metrics: AgencyMetrics;
  onExportPdf: () => void;
  isExportingPdf: boolean;
}

export const OrgChartTab: React.FC<OrgChartTabProps> = ({
  tree,
  metrics,
  onExportPdf,
  isExportingPdf,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedNode, setSelectedNode] = useState<AgentNode | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [sortField, setSortField] = useState<string>('income');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Layout calculations
  const NODE_W = 230;
  const NODE_H = 90;
  const layout = layoutTreeForSvg(tree, NODE_W, NODE_H, 24, 80);

  // Flatten for table
  const flatNodes = flattenTree(tree);

  // Filtered & Sorted Table Rows
  const filteredNodes = flatNodes.filter((node) => {
    const term = searchFilter.toLowerCase();
    return (
      (node.name || '').toLowerCase().includes(term) ||
      node.rank.toLowerCase().includes(term) ||
      `gen ${node.depth}`.includes(term)
    );
  });

  filteredNodes.sort((a, b) => {
    const divA = a.id === 'root' ? 1 : a.count || 1;
    const divB = b.id === 'root' ? 1 : b.count || 1;
    const incomeA = ((a.ePsc || 0) + (a.eOrc || 0) + (a.eEc || 0) + (a.eTrail || 0)) / divA;
    const incomeB = ((b.ePsc || 0) + (b.eOrc || 0) + (b.eEc || 0) + (b.eTrail || 0)) / divB;
    const salesA = ((a.pvCash || 0) + (a.pvEpf || 0)) / divA;
    const salesB = ((b.pvCash || 0) + (b.pvEpf || 0)) / divB;

    let res = 0;
    if (sortField === 'income') res = incomeA - incomeB;
    else if (sortField === 'sales') res = salesA - salesB;
    else if (sortField === 'name') res = (a.name || '').localeCompare(b.name || '');
    else if (sortField === 'rank') res = a.rank.localeCompare(b.rank);

    return sortAsc ? res : -res;
  });

  const exportCsv = () => {
    const headers = ['Depth', 'Name', 'Rank', 'Group Count', 'Personal Cash Sales (RM)', 'Personal EPF Sales (RM)', 'PSC + Pers ORC (RM)', 'Direct ORC (RM)', 'EC (RM)', 'Monthly Trailer (RM)', 'Total Per Agent (RM)'];
    const rows = flatNodes.map((n) => {
      const div = n.id === 'root' ? 1 : n.count || 1;
      return [
        n.depth === 0 ? 'Sponsor' : `Gen ${n.depth}`,
        `"${(n.name || 'Unnamed').replace(/"/g, '""')}"`,
        n.rank,
        n.count || 1,
        (n.cash || 0).toFixed(2),
        (n.epf || 0).toFixed(2),
        ((n.ePsc || 0) / div).toFixed(2),
        ((n.eOrc || 0) / div).toFixed(2),
        ((n.eEc || 0) / div).toFixed(2),
        ((n.eTrail || 0) / div).toFixed(2),
        (((n.ePsc || 0) + (n.eOrc || 0) + (n.eEc || 0) + (n.eTrail || 0)) / div).toFixed(2),
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KAF_Agency_Commission_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render SVG Edges
  const renderEdges = (node: AgentNode) => {
    if (!node.children || node.children.length === 0) return null;
    return (
      <React.Fragment key={`edges-${node.id}`}>
        {node.children.map((child) => {
          const x1 = node.x || 0;
          const y1 = (node.y || 0) + NODE_H / 2;
          const x2 = child.x || 0;
          const y2 = (child.y || 0) - NODE_H / 2;
          const midY = (y1 + y2) / 2;
          const pathD = `M ${x1} ${y1} V ${midY} H ${x2} V ${y2}`;

          return (
            <React.Fragment key={`edge-${node.id}-${child.id}`}>
              <path
                d={pathD}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {renderEdges(child)}
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  };

  // Render SVG Nodes
  const renderNodes = (node: AgentNode) => {
    const isRoot = node.id === 'root';
    const div = isRoot ? 1 : node.count || 1;
    const totalIncome = ((node.ePsc || 0) + (node.eOrc || 0) + (node.eEc || 0) + (node.eTrail || 0)) / div;
    const personalSales = (node.pvCash || 0) + (node.pvEpf || 0);
    const isSelected = selectedNode?.id === node.id;

    const rankColorMap: Record<Rank, { border: string; bg: string; text: string; headerBg: string }> = {
      GAM: { border: '#f59e0b', bg: '#fffbeb', text: '#78350f', headerBg: '#fef3c7' },
      AM: { border: '#0284c7', bg: '#f0f9ff', text: '#0369a1', headerBg: '#e0f2fe' },
      UM: { border: '#10b981', bg: '#ecfdf5', text: '#047857', headerBg: '#d1fae5' },
      UTC: { border: '#6366f1', bg: '#eef2ff', text: '#4338ca', headerBg: '#e0e7ff' },
    };

    const colors = rankColorMap[node.rank] || rankColorMap.UTC;

    return (
      <React.Fragment key={`node-${node.id}`}>
        <g
          transform={`translate(${(node.x || 0) - NODE_W / 2}, ${(node.y || 0) - NODE_H / 2})`}
          className="cursor-pointer group"
          onClick={() => setSelectedNode(node)}
        >
          {/* Card Outer Shape */}
          <rect
            width={NODE_W}
            height={NODE_H}
            rx="14"
            fill="#ffffff"
            stroke={isSelected ? '#4f46e5' : colors.border}
            strokeWidth={isSelected ? '3.5' : isRoot ? '2.5' : '1.5'}
            filter="drop-shadow(0 4px 10px rgba(15, 23, 42, 0.07))"
            className="transition-all duration-200 group-hover:filter-drop-shadow(0 8px 16px rgba(15, 23, 42, 0.12))"
          />

          {/* Top Rank Header Pill bar */}
          <rect
            x="0"
            y="0"
            width={NODE_W}
            height="26"
            rx="14"
            fill={colors.headerBg}
          />
          {/* Square out bottom radius of top header bar */}
          <rect
            x="0"
            y="14"
            width={NODE_W}
            height="12"
            fill={colors.headerBg}
          />

          {/* Header Text & Rank Badge */}
          <text
            x="12"
            y="17"
            fill={colors.text}
            fontSize="10.5"
            fontWeight="700"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            {node.rank} {isRoot ? '· Sponsor (Top)' : `· Gen ${node.depth} (${node.count || 1} pax)`}
          </text>

          {/* Node Name */}
          <text
            x="12"
            y="46"
            fill="#0f172a"
            fontSize="12.5"
            fontWeight="700"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            {(node.name || `Unit ${node.depth}`).length > 20
              ? (node.name || `Unit ${node.depth}`).slice(0, 18) + '...'
              : (node.name || `Unit ${node.depth}`)}
          </text>

          {/* Personal Sales */}
          <text
            x="12"
            y="64"
            fill="#64748b"
            fontSize="10"
            fontWeight="500"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            Sales: {fC(personalSales / div)}
          </text>

          {/* Total Income pill / right badge */}
          <rect
            x={NODE_W - 108}
            y="54"
            width="98"
            height="24"
            rx="7"
            fill="#f0fdf4"
            stroke="#bbf7d0"
            strokeWidth="1"
          />
          <text
            x={NODE_W - 59}
            y="70"
            fill="#15803d"
            fontSize="10"
            fontWeight="800"
            textAnchor="middle"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            {fC(totalIncome)}
          </text>
        </g>

        {node.children && node.children.map((c) => renderNodes(c))}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-6 pb-28">
      
      {/* Top Controls & Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-600" />
            <h2 className="font-extrabold text-slate-900 text-lg">Interactive Organization Canvas</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Hierarchical agency tree with branch routing and live income breakdowns. Click any node to inspect details.
          </p>
        </div>

        {/* Canvas Controls: Zoom, Reset, PDF */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.15))}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-bold text-slate-700 min-w-[48px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-colors cursor-pointer ml-1 border-l border-slate-200"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'Exporting...' : 'Export PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm overflow-hidden relative min-h-[480px]">
        {/* Background micro grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none"></div>

        {/* Legend pills */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 flex-wrap bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Ranks:</span>
          {(['GAM', 'AM', 'UM', 'UTC'] as Rank[]).map((r) => (
            <span key={r} className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${RANK_INFO[r].badgeBg}`}>
              {r}
            </span>
          ))}
        </div>

        {/* Scrollable & Scalable SVG Canvas */}
        <div className="overflow-auto max-h-[640px] pt-12 pb-6 px-4 flex justify-center">
          <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center', transition: 'transform 0.15s ease' }}>
            <svg
              ref={svgRef}
              width={layout.totalWidth + 80}
              height={layout.totalHeight + 80}
              viewBox={`0 0 ${layout.totalWidth + 80} ${layout.totalHeight + 80}`}
              className="select-none"
            >
              <g transform="translate(40, 40)">
                {renderEdges(tree)}
                {renderNodes(tree)}
              </g>
            </svg>
          </div>
        </div>

        {/* Clicked Node Detail Drawer/Overlay */}
        {selectedNode && (
          <div className="absolute bottom-4 right-4 max-w-sm w-full bg-white/95 backdrop-blur-md rounded-2xl border border-indigo-200 shadow-xl p-4 z-20 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${RANK_INFO[selectedNode.rank].badgeBg}`}>
                  {selectedNode.rank}
                </span>
                <h4 className="font-bold text-slate-900 text-sm truncate">
                  {selectedNode.name || 'Unnamed Agent'}
                </h4>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Personal Sales</span>
                <span className="font-bold text-slate-900">{fC((selectedNode.pvCash || 0) + (selectedNode.pvEpf || 0))}</span>
                <span className="text-[9px] text-slate-400 block mt-0.5 truncate">
                  Cash: {RATES[selectedNode.cashFund]?.name || 'Fund'} ({RATES[selectedNode.cashFund]?.maxCharge || 0}%)
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  EPF: {RATES[selectedNode.epfFund]?.name || 'EPF'} ({RATES[selectedNode.epfFund]?.maxCharge || 0}%)
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Total Group (TGS)</span>
                <span className="font-bold text-slate-900">{fC((selectedNode.tgsCash || 0) + (selectedNode.tgsEpf || 0))}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Personal Group (PGS)</span>
                <span className="font-bold text-slate-900">{fC((selectedNode.pgsCash || 0) + (selectedNode.pgsEpf || 0))}</span>
              </div>
              <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-emerald-700 block font-bold">Estimated Pay</span>
                <span className="font-black text-emerald-700">
                  {fC(((selectedNode.ePsc || 0) + (selectedNode.eOrc || 0) + (selectedNode.eEc || 0) + (selectedNode.eTrail || 0)) / (selectedNode.id === 'root' ? 1 : selectedNode.count || 1))}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Downlines under this node: <strong className="text-slate-700">{selectedNode.children.length} direct branches</strong>
            </p>
          </div>
        )}
      </div>

      {/* Detailed Commission Report Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-slate-900 text-base">Detailed Hierarchy Commission Table</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Comprehensive audit breakdown of all active nodes across your agency.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name or rank..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Export CSV button */}
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Table Wrap */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase text-[10.5px] tracking-wider">
                <th className="py-3 px-3.5 cursor-pointer" onClick={() => { setSortField('name'); setSortAsc(!sortAsc); }}>
                  <div className="flex items-center gap-1">
                    <span>Name / Branch</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer" onClick={() => { setSortField('rank'); setSortAsc(!sortAsc); }}>
                  <div className="flex items-center gap-1">
                    <span>Rank</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Pax</th>
                <th className="py-3 px-3 text-right cursor-pointer" onClick={() => { setSortField('sales'); setSortAsc(!sortAsc); }}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Personal Sales</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">PSC + Pers. ORC</th>
                <th className="py-3 px-3 text-right">Direct ORC</th>
                <th className="py-3 px-3 text-right">EC</th>
                <th className="py-3 px-3 text-right">Monthly Trailer</th>
                <th className="py-3 px-3.5 text-right cursor-pointer" onClick={() => { setSortField('income'); setSortAsc(!sortAsc); }}>
                  <div className="flex items-center justify-end gap-1 text-emerald-300">
                    <span>Total Per Agent</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredNodes.map((node) => {
                const isRoot = node.id === 'root';
                const div = isRoot ? 1 : node.count || 1;
                const totalPerAgent = ((node.ePsc || 0) + (node.eOrc || 0) + (node.eEc || 0) + (node.eTrail || 0)) / div;
                const salesPerAgent = ((node.pvCash || 0) + (node.pvEpf || 0)) / div;

                return (
                  <tr key={node.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-normal">
                          {isRoot ? '★' : `G${node.depth}`}
                        </span>
                        <span>{node.name || `Unit ${node.id}`}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${RANK_INFO[node.rank].badgeBg}`}>
                        {node.rank}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-600">
                      {isRoot ? 1 : node.count || 1}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                      {fC(salesPerAgent)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-indigo-700">
                      {fC((node.ePsc || 0) / div)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-sky-700">
                      {fC((node.eOrc || 0) / div)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-violet-700">
                      {fC((node.eEc || 0) / div)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-amber-700">
                      {fC((node.eTrail || 0) / div)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-extrabold text-emerald-700 bg-emerald-50/40">
                      {fC(totalPerAgent)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Footer with Totals */}
            <tfoot>
              <tr className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-300">
                <td className="py-3 px-3.5">Agency Total</td>
                <td className="py-3 px-3">All Ranks</td>
                <td className="py-3 px-3 text-center">{metrics.totalAgents}</td>
                <td className="py-3 px-3 text-right">{fC(metrics.totalSales)}</td>
                <td className="py-3 px-3 text-right text-indigo-800">{fC(metrics.sponsorPsc)}</td>
                <td className="py-3 px-3 text-right text-sky-800">{fC(metrics.sponsorOrc)}</td>
                <td className="py-3 px-3 text-right text-violet-800">{fC(metrics.sponsorEc)}</td>
                <td className="py-3 px-3 text-right text-amber-800">{fC(metrics.sponsorTrail)}</td>
                <td className="py-3 px-3.5 text-right text-emerald-800 bg-emerald-100/60">
                  {fC(metrics.sponsorTotalIncome)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
};
