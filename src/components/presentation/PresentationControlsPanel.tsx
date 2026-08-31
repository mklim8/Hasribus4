import React, { useState } from 'react';
import { Sliders, FileText, Users, DollarSign, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { AgencyMetrics } from '../../types';

export interface PresentationConfig {
  // Slide 1 Copy & Labels
  slide1Headline: string;
  slide1SubheadlineTemplate: string;
  slide1GamLabel: string;
  slide1UtcLabel: string;
  
  // Slide 2 Copy & Settings
  slide2Headline: string;
  slide2Subheadline: string;
  slide2GamLabel: string;
  slide2UtcLabel: string;
  slide2SalesMultiplier: number;
  slide2UtcMultiplier: number;
  slide2BottomMessage: string;
}

interface PresentationControlsPanelProps {
  config: PresentationConfig;
  onChangeConfig: (newConfig: PresentationConfig) => void;
  metrics: AgencyMetrics;
}

export const PresentationControlsPanel: React.FC<PresentationControlsPanelProps> = ({
  config,
  onChangeConfig,
  metrics,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'slide1' | 'slide2' | 'global'>('slide1');

  const updateField = (key: keyof PresentationConfig, value: any) => {
    onChangeConfig({
      ...config,
      [key]: value,
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-4 overflow-hidden transition-all">
      
      {/* Panel Header Bar */}
      <div 
        className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-b border-slate-200 cursor-pointer select-none hover:bg-slate-100/70 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Presentation Content & Team Controls</h3>
            <p className="text-xs text-slate-500">Live configuration for Slide 1 & Slide 2 linked to calculation engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
            {isOpen ? 'Collapse Panel' : 'Expand Controls'}
          </span>
          {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
      </div>

      {/* Expanded Controls Body */}
      {isOpen && (
        <div className="p-6">
          
          {/* Sub-tabs */}
          <div className="flex border-b border-slate-200 mb-6 gap-2">
            <button
              onClick={() => setActiveTab('slide1')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'slide1'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Slide 1 Controls</span>
            </button>
            <button
              onClick={() => setActiveTab('slide2')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'slide2'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Slide 2 Controls</span>
            </button>
            <button
              onClick={() => setActiveTab('global')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'global'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Live Engine / Team Outputs</span>
            </button>
          </div>

          {/* TAB 1: SLIDE 1 CONTROLS */}
          {activeTab === 'slide1' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Main Headline (Slide 1)
                </label>
                <input
                  type="text"
                  value={config.slide1Headline}
                  onChange={(e) => updateField('slide1Headline', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">Primary title shown at the top of Slide 1.</p>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  GAM Earnings Box Label
                </label>
                <input
                  type="text"
                  value={config.slide1GamLabel}
                  onChange={(e) => updateField('slide1GamLabel', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  UTC Earnings Box Label
                </label>
                <input
                  type="text"
                  value={config.slide1UtcLabel}
                  onChange={(e) => updateField('slide1UtcLabel', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Subheadline Template Info
                </label>
                <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700">
                  Dynamically bound to live simulation: <span className="font-bold text-blue-600">{metrics.activeRankCounts.UTC || 10} UTCs</span> & <span className="font-bold text-emerald-700">RM {metrics.totalEpfSales.toLocaleString()} EPF sales</span>.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SLIDE 2 CONTROLS */}
          {activeTab === 'slide2' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Main Headline (Slide 2)
                </label>
                <input
                  type="text"
                  value={config.slide2Headline}
                  onChange={(e) => updateField('slide2Headline', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Subheadline (Slide 2)
                </label>
                <input
                  type="text"
                  value={config.slide2Subheadline}
                  onChange={(e) => updateField('slide2Subheadline', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Sales Multiplier Factor ({config.slide2SalesMultiplier}X)
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="3.0"
                  step="0.1"
                  value={config.slide2SalesMultiplier}
                  onChange={(e) => updateField('slide2SalesMultiplier', parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-bold text-slate-500 mt-1">
                  <span>1.0x (Baseline)</span>
                  <span>2.0x</span>
                  <span>3.0x (Max Scale)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  UTC Count Multiplier ({config.slide2UtcMultiplier}X)
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.1"
                  value={config.slide2UtcMultiplier}
                  onChange={(e) => updateField('slide2UtcMultiplier', parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-bold text-slate-500 mt-1">
                  <span>1.0x</span>
                  <span>1.5x</span>
                  <span>2.5x</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Strategic Bottom Message (Slide 2)
                </label>
                <input
                  type="text"
                  value={config.slide2BottomMessage}
                  onChange={(e) => updateField('slide2BottomMessage', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: GLOBAL CALCULATION & TEAM OUTPUTS */}
          {activeTab === 'global' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-blue-50/85 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold text-blue-900 uppercase">Calculation Engine Source of Truth</p>
                  <p className="text-xs text-blue-700 mt-0.5">Financial metrics are automatically computed in real-time from the active simulator agent tree and commission rate matrix.</p>
                </div>
                <div className="text-xs font-bold text-blue-800 bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-xs">
                  Active Status: Fully Synced
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <p className="text-[11px] font-black text-slate-500 uppercase">Total UTC Count</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{metrics.activeRankCounts.UTC || 10}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <p className="text-[11px] font-black text-slate-500 uppercase">Total EPF Sales</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">RM {metrics.totalEpfSales.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <p className="text-[11px] font-black text-slate-500 uppercase">Total Cash Sales</p>
                  <p className="text-2xl font-black text-blue-700 mt-1">RM {metrics.totalCashSales.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <p className="text-[11px] font-black text-slate-500 uppercase">Sponsor Income (GAM)</p>
                  <p className="text-2xl font-black text-indigo-700 mt-1">RM {metrics.sponsorTotalIncome.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
