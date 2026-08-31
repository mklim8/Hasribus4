import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Check, 
  ArrowRight, 
  Copy, 
  Layers, 
  TrendingUp, 
  Zap, 
  ChevronRight, 
  AlertCircle,
  HelpCircle,
  BarChart3,
  Sliders,
  CheckCircle2,
  Cpu,
  Key,
  Settings2,
  ExternalLink
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';
import { GoogleGenAI } from '@google/genai';
import { AgentNode, AgencyMetrics } from '../types';
import { calcVolumes, calculateAll, getAgencyMetrics } from '../utils/calculator';
import { fC } from '../data/rates';

const CLIENT_API_KEY_STORAGE = 'kaf_user_gemini_api_key';

const SYSTEM_INSTRUCTION = `You are the KAF Agency Strategist & AI Scenario Copilot, an elite executive compensation advisor for unit trust agencies in Malaysia.
You specialize in agency building, compensation modeling, tier override commissions (ORC), equalisation commissions (EC), recurring trailer fees, and strategic downline hierarchies.

### KAF Agency Hierarchy & Compensation Rules:
1. Ranks: GAM, AM, UM, UTC. Max depth: 3.
2. Commission Streams: PSC, Direct ORC, EC (Gen 1 & 2), and Monthly Trailer (PNAV, PGNAV, ETC).

Whenever the user asks to generate, simulate, design, model, or optimize an agency scenario, ALWAYS INCLUDE A VALID SCENARIO TREE JSON BLOCK inside \`\`\`scenario_json codeblock:
\`\`\`scenario_json
{
  "scenarioName": "Descriptive Scenario Title",
  "scenarioDescription": "Strategy summary",
  "targetGroupSales": 1000000,
  "tree": {
    "id": "root",
    "depth": 0,
    "name": "Agency Principal (You)",
    "rank": "GAM",
    "count": 1,
    "cashFund": "cash1",
    "cash": 80000,
    "epfFund": "epf1",
    "epf": 30000,
    "children": []
  }
}
\`\`\``;

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  scenario?: {
    scenarioName: string;
    scenarioDescription?: string;
    targetGroupSales?: number;
    tree: AgentNode;
  };
  modelUsed?: string;
  calculatedMetrics?: AgencyMetrics;
}

interface AiAdvisorTabProps {
  currentTree: AgentNode;
  currentMetrics: AgencyMetrics;
  onApplyScenario: (newTree: AgentNode, scenarioName?: string) => void;
  onNavigateTab: (tab: string) => void;
}

const QUICK_PROMPTS = [
  {
    title: 'RM 1.5M GAM Empire',
    subtitle: '3 managerial branches, 18 consultants',
    icon: '👑',
    prompt: 'Generate an elite GAM Mega Empire scenario with 1.5M target sales, 2 AM branches, 3 UM branches, and high UTC advisor production. Structure it for maximum tier ORC.',
  },
  {
    title: 'Equalisation & Breakaway',
    subtitle: '1 Sponsor GAM + 2 Direct Breakaways',
    icon: '⚡',
    prompt: 'Create an agency scenario with 1 sponsor GAM having 2 equal breakaway GAM units in Generation 1 to demonstrate Equalisation Commission (EC Gen 1 & Gen 2) dynamics.',
  },
  {
    title: 'High-Trailer Sukuk Engine',
    subtitle: 'Passive recurring AUM focus',
    icon: '🛡️',
    prompt: 'Generate a scenario focused on high-trailer passive income with 2.5M group sales heavily weighted towards KAF Sukuk and Core Balanced funds.',
  },
  {
    title: 'Fast-Track UM Sprint',
    subtitle: '1 UM leading 8 rookie advisors',
    icon: '🚀',
    prompt: 'Build a high-energy rookie Unit Manager scenario with 8 active UTC advisors targeting RM 400,000 monthly production with balanced Cash and EPF sales.',
  },
  {
    title: 'Optimize Current Agency',
    subtitle: 'Audit structure for override gaps',
    icon: '📈',
    prompt: 'Analyze my current agency structure. What are the best 3 actions to double my monthly override commission and eliminate breakaway leakage? Propose an upgraded scenario tree.',
  },
];

export const AiAdvisorTab: React.FC<AiAdvisorTabProps> = ({
  currentTree,
  currentMetrics,
  onApplyScenario,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      role: 'model',
      content: `### Welcome to the KAF Agency Strategist & Scenario Copilot! 🎯\n\nI am your dedicated AI compensation strategist. You can ask me to **automatically generate custom agency scenarios**, test breakaway models, model override strategies, or optimize your current downline hierarchy.\n\nTry selecting one of the strategic blueprints below or type any agency goal you want to simulate!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.7-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite'>('gemini-3.7-flash');
  const [autoApply, setAutoApply] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appliedScenarioId, setAppliedScenarioId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [clientApiKey, setClientApiKey] = useState<string>(() => {
    return localStorage.getItem(CLIENT_API_KEY_STORAGE) || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  });
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [tempKeyInput, setTempKeyInput] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSaveApiKey = (key: string) => {
    const trimmed = key.trim();
    setClientApiKey(trimmed);
    if (trimmed) {
      localStorage.setItem(CLIENT_API_KEY_STORAGE, trimmed);
    } else {
      localStorage.removeItem(CLIENT_API_KEY_STORAGE);
    }
    setShowKeyModal(false);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    const userMessageId = `u_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputPrompt('');
    setIsLoading(true);

    try {
      let modelReplyText = '';
      let scenarioData: any = null;
      let modelUsed = selectedModel;

      // 1. First attempt calling backend endpoint /api/gemini/chat
      let serverSuccess = false;
      try {
        const payloadMessages = newHistory.map((m) => ({
          role: m.role === 'model' ? 'model' : 'user',
          content: m.content,
        }));

        const res = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: payloadMessages,
            model: selectedModel,
            currentTreeContext: {
              rank: currentTree.rank,
              totalAgents: currentMetrics.totalAgents,
              totalSales: currentMetrics.totalSales,
              sponsorTotalIncome: currentMetrics.sponsorTotalIncome,
              sponsorPsc: currentMetrics.sponsorPsc,
              sponsorOrc: currentMetrics.sponsorOrc,
              sponsorEc: currentMetrics.sponsorEc,
              sponsorTrail: currentMetrics.sponsorTrail,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          modelReplyText = data.reply || '';
          scenarioData = data.scenario;
          modelUsed = data.modelUsed || selectedModel;
          serverSuccess = true;
        }
      } catch (e) {
        // Server endpoint not reachable (static hosting)
        serverSuccess = false;
      }

      // 2. If server was not available, try client-side direct fallback
      if (!serverSuccess) {
        const activeKey = clientApiKey || localStorage.getItem(CLIENT_API_KEY_STORAGE);
        if (!activeKey) {
          throw new Error('NEEDS_API_KEY');
        }

        const ai = new GoogleGenAI({ apiKey: activeKey });
        let contextualSystemInstruction = SYSTEM_INSTRUCTION;
        contextualSystemInstruction += `\n\n### Current Active Simulator State:\n` +
          `- Sponsor Rank: ${currentTree.rank || 'GAM'}\n` +
          `- Total Agency Force: ${currentMetrics.totalAgents || 0} agents\n` +
          `- Total Group Sales: RM ${(currentMetrics.totalSales || 0).toLocaleString()}\n` +
          `- Sponsor Monthly Income: RM ${(currentMetrics.sponsorTotalIncome || 0).toLocaleString()}`;

        const formattedContents = newHistory.map((m) => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

        const response = await ai.models.generateContent({
          model: selectedModel,
          contents: formattedContents,
          config: {
            systemInstruction: contextualSystemInstruction,
            temperature: 0.7,
          },
        });

        modelReplyText = response.text || '';
        const match = modelReplyText.match(/```scenario_json\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
          try {
            scenarioData = JSON.parse(match[1]);
          } catch (pe) {
            console.warn('Could not parse client scenario:', pe);
          }
        }
      }

      // If scenario was provided, calculate its metrics
      let scenarioMetrics: AgencyMetrics | undefined = undefined;
      if (scenarioData && scenarioData.tree) {
        try {
          const clonedTree: AgentNode = JSON.parse(JSON.stringify(scenarioData.tree));
          calcVolumes(clonedTree);
          calculateAll(clonedTree);
          scenarioMetrics = getAgencyMetrics(clonedTree);
        } catch (calcErr) {
          console.warn('Error computing metrics for scenario:', calcErr);
        }
      }

      const modelMessageId = `m_${Date.now()}`;
      const modelMsg: ChatMessage = {
        id: modelMessageId,
        role: 'model',
        content: modelReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        scenario: scenarioData,
        modelUsed,
        calculatedMetrics: scenarioMetrics,
      };

      setMessages((prev) => [...prev, modelMsg]);

      // Automatically apply scenario if Auto-Apply switch is on!
      if (autoApply && scenarioData && scenarioData.tree) {
        handleApplyScenario(scenarioData.tree, scenarioData.scenarioName || 'AI Generated Scenario', modelMessageId, true);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      if (err.message === 'NEEDS_API_KEY') {
        const keyPromptMsg: ChatMessage = {
          id: `err_key_${Date.now()}`,
          role: 'model',
          content: `🔑 **Gemini API Key Required for Static / Netlify Hosting**\n\nWhen hosted on static Netlify without the backend server, the AI Copilot runs directly in your browser. \n\n**To activate the AI on your Netlify site:**\n1. Click the **"Set API Key"** button below.\n2. Paste your free Google AI Studio API key (stored safely only in your browser).\n\n*Or, if configuring Netlify environment variables, add \`GEMINI_API_KEY\` in your Netlify site dashboard.*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, keyPromptMsg]);
        setShowKeyModal(true);
      } else {
        const errMsg: ChatMessage = {
          id: `err_${Date.now()}`,
          role: 'model',
          content: `⚠️ **Error communicating with Gemini:** ${err.message || 'Please check your connection and API key.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyScenario = (
    scenarioTree: AgentNode,
    name: string,
    messageId: string,
    isAutomatic: boolean = false
  ) => {
    try {
      onApplyScenario(scenarioTree, name);
      setAppliedScenarioId(messageId);

      // Trigger celebratory confetti
      confetti({
        particleCount: isAutomatic ? 40 : 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#0ea5e9'],
      });

      setTimeout(() => {
        setAppliedScenarioId(null);
      }, 4000);
    } catch (e) {
      console.error('Failed to apply scenario:', e);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-20">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">AI Agency Copilot &amp; Scenario Engine</h2>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-200/80 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Gemini 3.7
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-turn advisory with automatic tree synthesis and live compensation analysis
            </p>
          </div>
        </div>

        {/* Controls: Model Selector & Auto-Apply Toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* Auto-Apply Switch */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Zap className={`w-4 h-4 ${autoApply ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
            <div className="text-left">
              <label htmlFor="toggle-auto-apply" className="text-[11px] font-bold text-slate-800 cursor-pointer block">
                Auto-Apply Scenarios
              </label>
              <span className="text-[9px] text-slate-500 block">Instant sync with tree</span>
            </div>
            <button
              id="toggle-auto-apply"
              onClick={() => setAutoApply(!autoApply)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                autoApply ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  autoApply ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Model Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="gemini-3.7-flash">Gemini 3.7 Flash (Fast &amp; Strategic)</option>
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Deep Math &amp; Breakaways)</option>
              <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Ultra Fast)</option>
            </select>
          </div>

          {/* API Key Config Button for Netlify / Static Deployment */}
          <button
            onClick={() => {
              setTempKeyInput(clientApiKey || localStorage.getItem(CLIENT_API_KEY_STORAGE) || '');
              setShowKeyModal(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              clientApiKey || localStorage.getItem(CLIENT_API_KEY_STORAGE)
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Configure Gemini API Key for Netlify or custom hosting"
          >
            <Key className="w-3.5 h-3.5 text-amber-500" />
            <span>{clientApiKey || localStorage.getItem(CLIENT_API_KEY_STORAGE) ? 'API Key: Set' : 'API Key'}</span>
          </button>

          {/* Reset Conversation */}
          <button
            onClick={() => {
              if (window.confirm('Clear conversation history?')) {
                setMessages([
                  {
                    id: 'init_fresh',
                    role: 'model',
                    content: `Conversation reset. How can I assist with your KAF agency model today?`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ]);
              }
            }}
            className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Reset Chat Thread"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* Live Grounding Bar */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-indigo-900 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold">Active Simulation Grounding:</span>
          <span className="bg-white/80 px-2 py-0.5 rounded border border-indigo-200/60 font-semibold text-[11px]">
            {currentTree.rank} Rank
          </span>
          <span className="bg-white/80 px-2 py-0.5 rounded border border-indigo-200/60 font-semibold text-[11px]">
            {currentMetrics.totalAgents} Total Agents
          </span>
          <span className="bg-white/80 px-2 py-0.5 rounded border border-indigo-200/60 font-semibold text-[11px]">
            {fC(currentMetrics.totalSales)} Group Volume
          </span>
        </div>
        <span className="text-[11px] text-indigo-700 font-medium hidden sm:inline">
          Monthly Payout: <strong className="text-emerald-700">{fC(currentMetrics.sponsorTotalIncome)}</strong>
        </span>
      </div>

      {/* Quick Prompt Blueprints */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Automatic Scenario Blueprints
          </p>
          <span className="text-[11px] text-slate-400">Click to instantly generate &amp; simulate</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSendMessage(qp.prompt)}
              className="text-left bg-white hover:bg-indigo-50/60 p-3 rounded-2xl border border-slate-200/80 hover:border-indigo-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{qp.icon}</span>
                <p className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-600 truncate">{qp.title}</p>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">{qp.subtitle}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Thread Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col h-[600px] overflow-hidden">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isModel = msg.role === 'model';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isModel ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-xs font-bold text-xs ${
                    isModel
                      ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  {isModel ? <Bot className="w-4 h-4" /> : 'You'}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[85%] sm:max-w-[75%] space-y-2 ${isModel ? 'text-left' : 'text-left'}`}>
                  
                  <div
                    className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isModel
                        ? 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
                        : 'bg-indigo-600 text-white rounded-tr-xs'
                    }`}
                  >
                    {/* Content */}
                    <div className="prose prose-xs max-w-none text-inherit leading-normal">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h1 className="text-base font-extrabold text-slate-900 mb-1">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-extrabold text-slate-900 mt-2 mb-1">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-xs font-bold text-slate-900 mt-2 mb-1 uppercase tracking-wider">{children}</h3>,
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 mb-2">{children}</ol>,
                          li: ({ children }) => <li className="text-inherit">{children}</li>,
                          strong: ({ children }) => <strong className="font-extrabold text-inherit">{children}</strong>,
                          code: ({ children, className }) => {
                            // Strip raw scenario JSON blocks from inline display as we render the rich card below
                            if (String(children).includes('"scenarioName"') || String(children).includes('"tree"')) {
                              return null;
                            }
                            return (
                              <code className="bg-slate-100 text-indigo-700 px-1 py-0.5 rounded text-[11px] font-mono">
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>

                    {/* Footer Meta info */}
                    <div className={`mt-2 pt-2 flex items-center justify-between text-[10px] ${
                      isModel ? 'border-t border-slate-100 text-slate-400' : 'border-t border-indigo-500/50 text-indigo-200'
                    }`}>
                      <span>{msg.timestamp}</span>
                      {isModel && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyText(msg.content, msg.id)}
                            className="hover:text-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interactive Embedded Scenario Card (When AI Generates a Structure) */}
                  {msg.scenario && msg.scenario.tree && (
                    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white p-4 sm:p-5 rounded-2xl border border-indigo-500/30 shadow-lg space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      
                      <div className="flex items-start justify-between gap-2 border-b border-indigo-800/60 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Generated Scenario</span>
                              {appliedScenarioId === msg.id && (
                                <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Active in Simulator
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-extrabold text-white mt-0.5">
                              {msg.scenario.scenarioName || 'Custom Agency Hierarchy'}
                            </h4>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-200 px-2 py-1 rounded-lg border border-indigo-400/30">
                          {msg.scenario.tree.rank} Tier
                        </span>
                      </div>

                      {msg.scenario.scenarioDescription && (
                        <p className="text-xs text-indigo-200/80 leading-relaxed">
                          {msg.scenario.scenarioDescription}
                        </p>
                      )}

                      {/* Calculated Metrics Snapshot */}
                      {msg.calculatedMetrics && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-800/70 p-3 rounded-xl border border-slate-700/60">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Agents</span>
                            <span className="text-xs font-bold text-white mt-0.5 block">{msg.calculatedMetrics.totalAgents} Pax</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Group Sales</span>
                            <span className="text-xs font-bold text-white mt-0.5 block">{fC(msg.calculatedMetrics.totalSales)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sponsor Income</span>
                            <span className="text-xs font-extrabold text-emerald-400 mt-0.5 block">{fC(msg.calculatedMetrics.sponsorTotalIncome)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Trailer Yield</span>
                            <span className="text-xs font-bold text-amber-400 mt-0.5 block">{fC(msg.calculatedMetrics.sponsorTrail)}</span>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <button
                          onClick={() => handleApplyScenario(msg.scenario!.tree, msg.scenario!.scenarioName, msg.id, false)}
                          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-900 bg-amber-400 hover:bg-amber-300 px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 fill-slate-900" />
                          <span>{appliedScenarioId === msg.id ? 'Re-apply to Simulator' : 'Apply to Live Simulator'}</span>
                        </button>

                        <button
                          onClick={() => {
                            handleApplyScenario(msg.scenario!.tree, msg.scenario!.scenarioName, msg.id, false);
                            onNavigateTab('org');
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5 text-indigo-400" />
                          <span>View in Org Canvas</span>
                        </button>

                        <button
                          onClick={() => {
                            handleApplyScenario(msg.scenario!.tree, msg.scenario!.scenarioName, msg.id, false);
                            onNavigateTab('analytics');
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>View Split Analytics</span>
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {/* Typing / Thinking indicator */}
          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs text-xs text-slate-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                <span>Gemini is generating strategic agency structure &amp; calculating commission streams...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="E.g. 'Build a RM 2M empire with 4 UMs' or 'How can I double my trailer income?'"
              disabled={isLoading}
              className="flex-1 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-all"
            />

            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 sm:px-5 sm:py-3 rounded-2xl font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* API Key Settings Modal (For Netlify / Custom Hosting) */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Gemini API Key</h3>
                <p className="text-xs text-slate-500">For Netlify / Static hosting activation</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              When hosting on static platforms (like Netlify or GitHub Pages) without a backend proxy, the AI Copilot connects directly to Gemini using your key. The key is stored <strong>only in your browser&apos;s localStorage</strong>.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Google AI Studio API Key
              </label>
              <input
                type="password"
                value={tempKeyInput}
                onChange={(e) => setTempKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden font-mono"
              />
              <div className="flex items-center justify-between pt-1">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-indigo-600 hover:text-indigo-700 font-bold inline-flex items-center gap-1"
                >
                  <span>Get free Gemini API Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                {clientApiKey && (
                  <button
                    onClick={() => handleSaveApiKey('')}
                    className="text-[11px] text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                  >
                    Clear Key
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-xs font-bold text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveApiKey(tempKeyInput)}
                className="text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Save &amp; Activate
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
