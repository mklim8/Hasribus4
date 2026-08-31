import React, { useState, useEffect } from 'react';
import { AgentNode, AgencyMetrics, Rank } from '../../types';
import { SlideContainer } from './SlideContainer';
import { SlideOne } from './SlideOne';
import { SlideTwo } from './SlideTwo';
import { PresentationControlsPanel, PresentationConfig } from './PresentationControlsPanel';
import { ScenarioBuilderPanel } from './ScenarioBuilderPanel';
import { ChevronLeft, ChevronRight, Maximize2, Monitor, Layers, Sliders } from 'lucide-react';

interface PresentationEngineProps {
  slide1Tree: AgentNode;
  slide1Metrics: AgencyMetrics;
  slide2Tree: AgentNode;
  slide2Metrics: AgencyMetrics;
  onUpdateNode1: (id: string, field: keyof AgentNode, val: any) => void;
  onAddChild1: (parentId: string, rank?: Rank) => void;
  onRemoveNode1: (id: string) => void;
  onUpdateNode2: (id: string, field: keyof AgentNode, val: any) => void;
  onAddChild2: (parentId: string, rank?: Rank) => void;
  onRemoveNode2: (id: string) => void;
  onLoadScenarioA1: () => void;
  onLoadScenarioB1: () => void;
  onLoadScenarioC1: () => void;
  onLoadScenarioA2: () => void;
  onLoadScenarioB2: () => void;
  onLoadScenarioC2: () => void;
}

const DEFAULT_CONFIG: PresentationConfig = {
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

const STORAGE_CONFIG_KEY = 'kaf_presentation_config_v1';

export const PresentationEngine: React.FC<PresentationEngineProps> = ({
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
  onLoadScenarioA1,
  onLoadScenarioB1,
  onLoadScenarioC1,
  onLoadScenarioA2,
  onLoadScenarioB2,
  onLoadScenarioC2,
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(1);
  const totalSlides = 2; // Slide 1 and Slide 2

  const [primaryRole1, setPrimaryRole1] = useState<Rank>(slide1Tree.rank || 'GAM');
  const [primaryRole2, setPrimaryRole2] = useState<Rank>(slide2Tree.rank || 'GAM');
  const [activeSlideTab, setActiveSlideTab] = useState<'slide1' | 'slide2'>('slide1');
  const [showBuilder, setShowBuilder] = useState<boolean>(true);

  const [config, setConfig] = useState<PresentationConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load presentation config:', e);
    }
    return DEFAULT_CONFIG;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('Could not save presentation config:', e);
    }
  }, [config]);

  const handleNext = () => {
    if (currentSlide < totalSlides) {
      setCurrentSlide(c => {
        const next = c + 1;
        setActiveSlideTab(next === 2 ? 'slide2' : 'slide1');
        return next;
      });
    }
  };

  const handlePrev = () => {
    if (currentSlide > 1) {
      setCurrentSlide(c => {
        const prev = c - 1;
        setActiveSlideTab(prev === 2 ? 'slide2' : 'slide1');
        return prev;
      });
    }
  };

  const activeMetrics = currentSlide === 1 ? slide1Metrics : slide2Metrics;

  return (
    <div className="flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      
      {/* Permanent Scenario Builder Panel */}
      {showBuilder && (
        <ScenarioBuilderPanel
          slide1Tree={slide1Tree}
          slide1Metrics={slide1Metrics}
          slide2Tree={slide2Tree}
          slide2Metrics={slide2Metrics}
          onUpdateNode1={onUpdateNode1}
          onAddChild1={onAddChild1}
          onRemoveNode1={onRemoveNode1}
          onUpdateNode2={onUpdateNode2}
          onAddChild2={onAddChild2}
          onRemoveNode2={onRemoveNode2}
          primaryRole1={primaryRole1}
          onChangePrimaryRole1={setPrimaryRole1}
          primaryRole2={primaryRole2}
          onChangePrimaryRole2={setPrimaryRole2}
          onLoadScenarioA1={onLoadScenarioA1}
          onLoadScenarioB1={onLoadScenarioB1}
          onLoadScenarioC1={onLoadScenarioC1}
          onLoadScenarioA2={onLoadScenarioA2}
          onLoadScenarioB2={onLoadScenarioB2}
          onLoadScenarioC2={onLoadScenarioC2}
          activeSlideTab={activeSlideTab}
          setActiveSlideTab={setActiveSlideTab}
        />
      )}

      {/* Permanent Presentation Controls Panel */}
      <PresentationControlsPanel
        config={config}
        onChangeConfig={setConfig}
        metrics={activeMetrics}
      />

      {/* Presentation Top Control Bar (Non-exported UI outside the presentation canvas) */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-slate-200 rounded-2xl px-6 py-3 shadow-xs gap-4">
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Interactive Presentation Engine</h2>
            <p className="text-xs text-slate-500">Fixed 16:9 1920×1080 canvas · Independent Slide 1 &amp; Slide 2 scenarios</p>
          </div>
        </div>

        {/* Slide Navigation & Controls */}
        <div className="flex items-center gap-3">
          
          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3.5 py-2 rounded-xl border transition-colors cursor-pointer ${
              showBuilder ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showBuilder ? 'Hide Scenario Builder' : 'Show Scenario Builder'}</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <Layers className="w-4 h-4 text-indigo-600 ml-2" />
            <span className="px-2">Slide {currentSlide} of {totalSlides}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              disabled={currentSlide === 1}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
              title="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentSlide === totalSlides}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
              title="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              const elem = document.documentElement;
              if (!document.fullscreenElement) {
                elem.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Toggle Fullscreen Presentation"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Fullscreen</span>
          </button>

        </div>

      </div>

      {/* Presentation Canvas Viewport */}
      <div className="flex items-center justify-center bg-slate-900/5 rounded-2xl p-2 border border-slate-200/80 overflow-hidden shadow-inner min-h-[620px]">
        <SlideContainer>
          {currentSlide === 1 && <SlideOne tree={slide1Tree} metrics={slide1Metrics} />}
          {currentSlide === 2 && <SlideTwo tree={slide2Tree} metrics={slide2Metrics} slide1Metrics={slide1Metrics} config={config} />}
        </SlideContainer>
      </div>

    </div>
  );
};
