import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AgentNode, AgencyMetrics, Rank } from './types';
import { PRESETS } from './data/presets';
import { calcVolumes, calculateAll, getAgencyMetrics, findNode } from './utils/calculator';
import { Header } from './components/Header';
import { SimulatorTab } from './components/SimulatorTab';
import { OrgChartTab } from './components/OrgChartTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { AdminTab } from './components/AdminTab';
import { AiAdvisorTab } from './components/AiAdvisorTab';
import { ProspectingTab } from './components/ProspectingTab';
import { StickyDashboard } from './components/StickyDashboard';
import { PdfExportModal } from './components/PdfExportModal';
import { LoginScreen } from './components/LoginScreen';
import { PresentationEngine } from './components/presentation/PresentationEngine';

const STORAGE_KEY = 'kaf_agency_tree_v9';
const STORAGE_SLIDE1_KEY = 'kaf_slide1_tree_v2';
const STORAGE_SLIDE2_KEY = 'kaf_slide2_tree_v2';
const STORAGE_CONFIG_KEY = 'kaf_presentation_config_v1';

const DEFAULT_CONFIG = {
  slide1Headline: 'WORK A LITTLE BIT HARDER.',
  slide1SubheadlineTemplate: 'Recruit {utcCount} Unit Trust Consultants. You and your downline achieve sales of {totalSales} (EPF) every month.',
  slide1GamLabel: 'YOU AS GAM WILL EARN',
  slide1UtcLabel: 'EACH UTC EARN',
  slide2Headline: 'WORK SMARTER & LEAD HIGHER',
  slide2Subheadline: 'Scale to {utcCount} Active UTCs & {totalSales} Monthly Sales across multi-tier agency structure.',
  slide2GamLabel: 'SENIOR GAM EARNINGS',
  slide2UtcLabel: 'SENIOR UTC INCENTIVE',
  slide2SalesMultiplier: 1.8,
  slide2UtcMultiplier: 1.5,
  slide2BottomMessage: 'EXPONENTIAL GROWTH THROUGH LEADERSHIP & ORC OVERRIDES',
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('kaf_authenticated_v1') === 'true';
  });
  const [activeTab, setActiveTab] = useState<string>('prospecting');
  const [nodeIdCounter, setNodeIdCounter] = useState<number>(10);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [scenarioToast, setScenarioToast] = useState<string | null>(null);
  const [prospectMetrics, setProspectMetrics] = useState<AgencyMetrics | null>(null);
  const [prospectCandidateName, setProspectCandidateName] = useState<string>('Alex Tan (Candidate)');

  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_CONFIG;
  });

  // Initialize main tree state
  const [tree, setTree] = useState<AgentNode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(PRESETS[0].data));
  });

  // Slide 1 Independent Tree State
  const [slide1Tree, setSlide1Tree] = useState<AgentNode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SLIDE1_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return JSON.parse(JSON.stringify(PRESETS[0].data));
  });

  // Slide 2 Independent Tree State
  const [slide2Tree, setSlide2Tree] = useState<AgentNode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SLIDE2_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Preset with slightly richer downlines for Slide 2
    const preset2 = JSON.parse(JSON.stringify(PRESETS[0].data));
    preset2.children.push({
      id: 's2_default_am',
      rank: 'AM',
      name: 'Senior AM',
      depth: 1,
      count: 1,
      cashFund: 'cash1',
      cash: 30000,
      epfFund: 'epf1',
      epf: 150000,
      children: [
        { id: 's2_default_utc', rank: 'UTC', name: 'Sub UTC', depth: 2, count: 1, cashFund: 'cash1', cash: 15000, epfFund: 'epf1', epf: 60000, children: [] }
      ]
    });
    return preset2;
  });

  // Calculate volumes and commission metrics for main tree
  const computedTreeAndMetrics = useMemo(() => {
    const cloned: AgentNode = JSON.parse(JSON.stringify(tree));
    calcVolumes(cloned);
    calculateAll(cloned);
    const metrics: AgencyMetrics = getAgencyMetrics(cloned);
    return { calculatedTree: cloned, metrics };
  }, [tree]);

  const { calculatedTree, metrics } = computedTreeAndMetrics;

  // Computed Slide 1 & Slide 2
  const computedSlide1 = useMemo(() => {
    const cloned = JSON.parse(JSON.stringify(slide1Tree));
    calcVolumes(cloned);
    calculateAll(cloned);
    return { calculatedTree: cloned, metrics: getAgencyMetrics(cloned) };
  }, [slide1Tree]);

  const computedSlide2 = useMemo(() => {
    const cloned = JSON.parse(JSON.stringify(slide2Tree));
    calcVolumes(cloned);
    calculateAll(cloned);
    return { calculatedTree: cloned, metrics: getAgencyMetrics(cloned) };
  }, [slide2Tree]);

  // Persist trees in localStorage
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tree)); } catch (e) {}
  }, [tree]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_SLIDE1_KEY, JSON.stringify(slide1Tree)); } catch (e) {}
  }, [slide1Tree]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_SLIDE2_KEY, JSON.stringify(slide2Tree)); } catch (e) {}
  }, [slide2Tree]);

  const handleProspectMetricsChange = useCallback((pMetrics: AgencyMetrics, cName: string) => {
    setProspectMetrics(pMetrics);
    setProspectCandidateName(cName);
  }, []);

  if (!isAuthenticated) {
    return <LoginScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  // Slide 1 Scenario Preset Loaders
  const handleLoadScenarioA1 = () => {
    setSlide1Tree({
      id: 'root',
      rank: 'GAM',
      name: 'You (GAM)',
      depth: 0,
      count: 1,
      cashFund: 'cash1',
      cash: 50000,
      epfFund: 'epf1',
      epf: 200000,
      children: [
        { id: 's1_a1', rank: 'UTC', name: 'Direct UTC', depth: 1, count: 1, cashFund: 'cash1', cash: 10000, epfFund: 'epf1', epf: 50000, children: [] }
      ]
    });
    setScenarioToast('✨ Loaded Slide 1 Scenario A: GAM → 1 UTC');
    setTimeout(() => setScenarioToast(null), 4000);
  };

  const handleLoadScenarioB1 = () => {
    setSlide1Tree({
      id: 'root',
      rank: 'GAM',
      name: 'You (GAM)',
      depth: 0,
      count: 1,
      cashFund: 'cash1',
      cash: 50000,
      epfFund: 'epf1',
      epf: 200000,
      children: [
        {
          id: 's1_b1',
          rank: 'AM',
          name: 'Sub AM',
          depth: 1,
          count: 1,
          cashFund: 'cash1',
          cash: 20000,
          epfFund: 'epf1',
          epf: 100000,
          children: [
            { id: 's1_b2', rank: 'UTC', name: 'UTC under AM', depth: 2, count: 1, cashFund: 'cash1', cash: 10000, epfFund: 'epf1', epf: 50000, children: [] }
          ]
        }
      ]
    });
    setScenarioToast('✨ Loaded Slide 1 Scenario B: GAM → 1 AM → 1 UTC');
    setTimeout(() => setScenarioToast(null), 4000);
  };

  const handleLoadScenarioC1 = () => {
    setSlide1Tree({
      id: 'root',
      rank: 'GAM',
      name: 'You (GAM)',
      depth: 0,
      count: 1,
      cashFund: 'cash1',
      cash: 50000,
      epfFund: 'epf1',
      epf: 200000,
      children: [
        { id: 's1_c1', rank: 'AM', name: 'Sub AM', depth: 1, count: 1, cashFund: 'cash1', cash: 20000, epfFund: 'epf1', epf: 100000, children: [] },
        { id: 's1_c2', rank: 'UTC', name: 'Direct UTC', depth: 1, count: 1, cashFund: 'cash1', cash: 10000, epfFund: 'epf1', epf: 50000, children: [] }
      ]
    });
    setScenarioToast('✨ Loaded Slide 1 Scenario C: GAM → 1 AM + 1 UTC');
    setTimeout(() => setScenarioToast(null), 4000);
  };

  // Slide 2 Scenario Preset Loaders
  const handleLoadScenarioA2 = () => {
    setSlide2Tree({
      id: 'root',
      rank: 'GAM',
      name: 'Senior GAM',
      depth: 0,
      count: 1,
      cashFund: 'cash1',
      cash: 80000,
      epfFund: 'epf1',
      epf: 350000,
      children: [
        { id: 's2_a1', rank: 'AM', name: 'Leader AM', depth: 1, count: 1, cashFund: 'cash1', cash: 30000, epfFund: 'epf1', epf: 150000, children: [
          { id: 's2_a2', rank: 'UTC', name: 'UTC Alpha', depth: 2, count: 1, cashFund: 'cash1', cash: 12000, epfFund: 'epf1', epf: 60000, children: [] },
          { id: 's2_a3', rank: 'UTC', name: 'UTC Beta', depth: 2, count: 1, cashFund: 'cash1', cash: 12000, epfFund: 'epf1', epf: 60000, children: [] }
        ]}
      ]
    });
    setScenarioToast('✨ Loaded Slide 2 Scenario A: Multi-tier Leadership Structure');
    setTimeout(() => setScenarioToast(null), 4000);
  };

  const handleLoadScenarioB2 = handleLoadScenarioA2;
  const handleLoadScenarioC2 = handleLoadScenarioA2;

  // Slide 1 tree mutation handlers
  const handleUpdateNode1 = (id: string, field: keyof AgentNode, val: any) => {
    setSlide1Tree(prev => {
      const cloned = JSON.parse(JSON.stringify(prev));
      const target = findNode(cloned, id);
      if (target) (target as any)[field] = val;
      return cloned;
    });
  };

  const handleAddChild1 = (parentId: string, rank?: Rank) => {
    setSlide1Tree(prev => {
      const cloned = JSON.parse(JSON.stringify(prev));
      const parent = findNode(cloned, parentId);
      if (!parent || parent.depth >= 3) return prev;
      const assignedRank: Rank = rank || (parent.rank === 'UTC' ? 'UTC' : 'UM');
      parent.children.push({
        id: 's1_' + Date.now() + Math.random().toString(36).substr(2, 4),
        depth: parent.depth + 1,
        name: '',
        rank: assignedRank,
        count: 1,
        cashFund: 'cash1',
        cash: 10000,
        epfFund: 'epf1',
        epf: 40000,
        children: []
      });
      return cloned;
    });
  };

  const handleRemoveNode1 = (idToRemove: string) => {
    setSlide1Tree(prev => {
      const cloned = JSON.parse(JSON.stringify(prev));
      const removeRecursive = (node: AgentNode): boolean => {
        const idx = node.children.findIndex(c => c.id === idToRemove);
        if (idx > -1) { node.children.splice(idx, 1); return true; }
        for (const c of node.children) { if (removeRecursive(c)) return true; }
        return false;
      };
      removeRecursive(cloned);
      return cloned;
    });
  };

  // Slide 2 tree mutation handlers
  const handleUpdateNode2 = (id: string, field: keyof AgentNode, val: any) => {
    setSlide2Tree(prev => {
      const cloned = JSON.parse(JSON.stringify(prev));
      const target = findNode(cloned, id);
      if (target) (target as any)[field] = val;
      return cloned;
    });
  };

  const handleAddChild2 = (parentId: string, rank?: Rank) => {
    setSlide2Tree(prev => {
      const cloned = JSON.parse(JSON.stringify(prev));
      const parent = findNode(cloned, parentId);
      if (!parent || parent.depth >= 3) return prev;
      const assignedRank: Rank = rank || (parent.rank === 'UTC' ? 'UTC' : 'UM');
      parent.children.push({
        id: 's2_' + Date.now() + Math.random().toString(36).substr(2, 4),
        depth: parent.depth + 1,
        name: '',
        rank: assignedRank,
        count: 1,
        cashFund: 'cash1',
        cash: 15000,
        epfFund: 'epf1',
        epf: 50000,
        children: []
      });
      return cloned;
    });
  };

  const handleRemoveNode2 = (idToRemove: string) => {
    setSlide2Tree(prev => {
      const cloned = JSON.parse(JSON.stringify(prev));
      const removeRecursive = (node: AgentNode): boolean => {
        const idx = node.children.findIndex(c => c.id === idToRemove);
        if (idx > -1) { node.children.splice(idx, 1); return true; }
        for (const c of node.children) { if (removeRecursive(c)) return true; }
        return false;
      };
      removeRecursive(cloned);
      return cloned;
    });
  };

  // Main simulator node update handler
  const handleUpdateNode = (id: string, field: keyof AgentNode, val: any) => {
    setTree((prevTree) => {
      const cloned: AgentNode = JSON.parse(JSON.stringify(prevTree));
      const target = findNode(cloned, id);
      if (target) {
        (target as any)[field] = val;
      }
      return cloned;
    });
  };

  const handleAddChild = (parentId: string, rank?: Rank) => {
    setTree((prevTree) => {
      const cloned: AgentNode = JSON.parse(JSON.stringify(prevTree));
      const parent = findNode(cloned, parentId);
      if (!parent || parent.depth >= 3) return prevTree;

      const nextId = 'n_' + (nodeIdCounter + 1);
      setNodeIdCounter((c) => c + 1);

      const assignedRank: Rank = rank || (parent.rank === 'UTC' ? 'UTC' : 'UM');

      parent.children.push({
        id: nextId,
        depth: parent.depth + 1,
        name: '',
        rank: assignedRank,
        count: 1,
        cashFund: 'cash1',
        cash: 10000,
        epfFund: 'epf1',
        epf: 40000,
        children: [],
      });

      return cloned;
    });
  };

  const handleRemoveNode = (idToRemove: string) => {
    setTree((prevTree) => {
      const cloned: AgentNode = JSON.parse(JSON.stringify(prevTree));
      const removeRecursive = (node: AgentNode): boolean => {
        const idx = node.children.findIndex((c) => c.id === idToRemove);
        if (idx > -1) {
          node.children.splice(idx, 1);
          return true;
        }
        for (const child of node.children) {
          if (removeRecursive(child)) return true;
        }
        return false;
      };
      removeRecursive(cloned);
      return cloned;
    });
  };

  const handleSelectPreset = (presetData: AgentNode) => {
    setTree(presetData);
  };

  const handleReset = () => {
    if (window.confirm('Reset agency tree to default starter template?')) {
      setTree(JSON.parse(JSON.stringify(PRESETS[0].data)));
    }
  };

  const handleApplyScenario = (newTree: AgentNode, scenarioName?: string) => {
    setTree(newTree);
    const title = scenarioName || 'Custom AI Scenario';
    setScenarioToast(`✨ Loaded scenario: "${title}" into live simulator!`);
    setTimeout(() => {
      setScenarioToast(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectPreset={handleSelectPreset}
        onReset={handleReset}
        onExportPdf={() => setIsPdfModalOpen(true)}
        isExportingPdf={false}
        totalAgents={metrics.totalAgents}
        onLock={() => {
          localStorage.removeItem('kaf_authenticated_v1');
          setIsAuthenticated(false);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Scenario Loaded Notification Banner */}
        {scenarioToast && (
          <div className="mb-4 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between animate-in slide-in-from-top-3 duration-200">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
              <span>{scenarioToast}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('simulator')}
                className="bg-white/20 hover:bg-white/30 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                Go to Simulator
              </button>
              <button
                onClick={() => setActiveTab('org')}
                className="bg-white text-emerald-800 text-xs font-extrabold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                View Org Map
              </button>
            </div>
          </div>
        )}

        {activeTab === 'prospecting' && (
          <ProspectingTab
            onApplyScenario={handleApplyScenario}
            onNavigateTab={setActiveTab}
            onProspectMetricsChange={handleProspectMetricsChange}
          />
        )}

        {activeTab === 'ai' && (
          <AiAdvisorTab
            currentTree={calculatedTree}
            currentMetrics={metrics}
            onApplyScenario={handleApplyScenario}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'simulator' && (
          <SimulatorTab
            tree={calculatedTree}
            metrics={metrics}
            onUpdateNode={handleUpdateNode}
            onAddChild={handleAddChild}
            onRemoveNode={handleRemoveNode}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'presentation' && (
          <PresentationEngine
            slide1Tree={computedSlide1.calculatedTree}
            slide1Metrics={computedSlide1.metrics}
            slide2Tree={computedSlide2.calculatedTree}
            slide2Metrics={computedSlide2.metrics}
            onUpdateNode1={handleUpdateNode1}
            onAddChild1={handleAddChild1}
            onRemoveNode1={handleRemoveNode1}
            onUpdateNode2={handleUpdateNode2}
            onAddChild2={handleAddChild2}
            onRemoveNode2={handleRemoveNode2}
            onLoadScenarioA1={handleLoadScenarioA1}
            onLoadScenarioB1={handleLoadScenarioB1}
            onLoadScenarioC1={handleLoadScenarioC1}
            onLoadScenarioA2={handleLoadScenarioA2}
            onLoadScenarioB2={handleLoadScenarioB2}
            onLoadScenarioC2={handleLoadScenarioC2}
          />
        )}

        {activeTab === 'org' && (
          <OrgChartTab
            tree={calculatedTree}
            metrics={metrics}
            onExportPdf={() => setIsPdfModalOpen(true)}
            isExportingPdf={false}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            tree={calculatedTree}
            metrics={metrics}
          />
        )}

        {activeTab === 'report' && (
          <OrgChartTab
            tree={calculatedTree}
            metrics={metrics}
            onExportPdf={() => setIsPdfModalOpen(true)}
            isExportingPdf={false}
          />
        )}

        {activeTab === 'admin' && (
          <AdminTab />
        )}

      </main>

      {/* Sticky Bottom Real-Time Earnings Dock (hidden during presentation deck mode) */}
      {activeTab !== 'presentation' && (
        <StickyDashboard
          metrics={activeTab === 'prospecting' && prospectMetrics ? prospectMetrics : metrics}
          onNavigateTab={setActiveTab}
          isProspectingMode={activeTab === 'prospecting'}
          candidateName={prospectCandidateName}
        />
      )}

      {/* High Resolution PDF Export Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        slide1Tree={computedSlide1.calculatedTree}
        slide1Metrics={computedSlide1.metrics}
        slide2Tree={computedSlide2.calculatedTree}
        slide2Metrics={computedSlide2.metrics}
        config={config}
      />

    </div>
  );
}
