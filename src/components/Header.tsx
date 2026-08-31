import React from 'react';
import { 
  Building2, 
  Sparkles, 
  Download, 
  RotateCcw, 
  FolderKanban, 
  TrendingUp, 
  Network, 
  PieChart, 
  FileSpreadsheet, 
  Calculator,
  Share2,
  Check,
  Bot,
  Lock,
  MonitorPlay
} from 'lucide-react';
import { PRESETS } from '../data/presets';
import { AgentNode } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelectPreset: (presetData: AgentNode) => void;
  onReset: () => void;
  onExportPdf: () => void;
  isExportingPdf: boolean;
  totalAgents: number;
  onLock?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onSelectPreset,
  onReset,
  onExportPdf,
  isExportingPdf,
  totalAgents,
  onLock,
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const navTabs = [
    { id: 'prospecting', label: 'Prospecting & Pitch', icon: Sparkles, badge: 'Recruit' },
    { id: 'simulator', label: 'Simulator', icon: Calculator, badge: null },
    { id: 'presentation', label: 'Presentation Deck', icon: MonitorPlay, badge: 'Slide 1' },
    { id: 'ai', label: 'AI Copilot & Generator', icon: Bot, badge: 'Gemini 3.7' },
    { id: 'org', label: 'Org Canvas', icon: Network, badge: `${totalAgents} Nodes` },
    { id: 'analytics', label: 'Analytics & Split', icon: PieChart, badge: null },
    { id: 'report', label: 'Commission Report', icon: FileSpreadsheet, badge: null },
    { id: 'admin', label: 'Formulas & Rates', icon: TrendingUp, badge: 'Verified' },
  ];

  const navScrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (navScrollRef.current) {
      const activeBtn = navScrollRef.current.querySelector(`[data-tab-id="${activeTab}"]`);
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
      }
    }
  }, [activeTab]);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-bold text-lg tracking-tight">
              K
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">KAF</span>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-indigo-200/60">
                  v26082026
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden md:block">Agency Expansion &amp; Commission Modeling</p>
            </div>
          </div>

          {/* Action Buttons: Presets, Share, PDF, Reset */}
          <div className="flex items-center gap-2">
            
            {/* Scenario Presets Dropdown */}
            <div className="relative">
              <button
                id="btn-presets"
                onClick={() => setShowPresetsMenu(!showPresetsMenu)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-3 py-2 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                title="Load Preset Scenario"
              >
                <FolderKanban className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Templates</span>
              </button>

              {showPresetsMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Agency Scenarios</p>
                    <p className="text-[11px] text-slate-500">Quickly load tested agency models</p>
                  </div>
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        onSelectPreset(JSON.parse(JSON.stringify(preset.data)));
                        setShowPresetsMenu(false);
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-indigo-50/70 flex items-start gap-2.5 transition-colors cursor-pointer group"
                    >
                      <span className="text-lg">{preset.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 truncate">{preset.name}</p>
                          <span className="text-[10px] font-semibold bg-slate-100 group-hover:bg-indigo-100 text-slate-600 group-hover:text-indigo-700 px-1.5 py-0.2 rounded">
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{preset.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Share Link */}
            <button
              id="btn-share"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-3 py-2 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title="Share simulation"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-600" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>

            {/* Reset Button */}
            <button
              id="btn-reset"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-3 py-2 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title="Reset Tree to Initial State"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">Reset</span>
            </button>

            {/* Export PDF Button */}
            <button
              id="btn-export-pdf"
              onClick={onExportPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-3.5 py-2 rounded-lg shadow-sm shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'Building PDF...' : 'Download PDF'}</span>
            </button>

            {/* Lock Session Button */}
            {onLock && (
              <button
                id="btn-lock"
                onClick={onLock}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-3 py-2 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                title="Lock Session / Logout"
              >
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden lg:inline">Lock</span>
              </button>
            )}

          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div 
          ref={navScrollRef}
          className="flex items-center space-x-1 overflow-x-auto nav-scrollbar py-1.5 -mb-px border-t border-slate-100 min-w-0"
        >
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-tab-id={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold whitespace-nowrap rounded-lg transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'text-indigo-700 bg-indigo-50/80 shadow-xs border border-indigo-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-indigo-200/60 text-indigo-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
