import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  CheckCircle2, 
  HelpCircle, 
  Table, 
  ShieldAlert, 
  Layers, 
  FileCode,
  ArrowRight,
  TrendingUp,
  Sparkles,
  KeyRound,
  Shield,
  Trash2,
  Plus,
  Loader2,
  Globe
} from 'lucide-react';
import { RATES, CASH_FUNDS, EPF_FUNDS, HIERARCHY, RANK_INFO, fC, calcComm, calcTrail } from '../data/rates';
import { CashFundKey, EpfFundKey, Rank } from '../types';
import { 
  fetchServerPasscodes, 
  addServerPasscode, 
  removeServerPasscode, 
  updateServerMasterPassword, 
  verifyPasscodeApi 
} from '../utils/authApi';

export const AdminTab: React.FC = () => {
  // Interactive Verification Sandbox State
  const [sandboxAmount, setSandboxAmount] = useState<number>(100000);
  const [sandboxFund, setSandboxFund] = useState<CashFundKey>('cash1');
  const [sandboxRank, setSandboxRank] = useState<Rank>('GAM');
  const [sandboxDownlineRank, setSandboxDownlineRank] = useState<Rank>('UM');

  // Passcode Management State
  const [passcodes, setPasscodes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kaf_passcodes_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return ['KAFHQ', 'demouser1', 'demouser2', 'demouser3', 'demouser4', 'demouser5'];
  });
  const [newPasscode, setNewPasscode] = useState('');
  const [passcodeMsg, setPasscodeMsg] = useState<string | null>(null);
  const [newMasterPwd, setNewMasterPwd] = useState('');
  const [currentMasterPwd, setCurrentMasterPwd] = useState('');
  const [masterPwdMsg, setMasterPwdMsg] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('kaf_user_role') === 'admin';
  });
  const [adminPromptPwd, setAdminPromptPwd] = useState('');
  const [adminUnlockError, setAdminUnlockError] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isSavingPasscode, setIsSavingPasscode] = useState(false);

  // Fetch centralized passcodes from server on component mount
  useEffect(() => {
    fetchServerPasscodes().then((codes) => {
      if (codes && codes.length > 0) {
        setPasscodes(codes);
      }
    });
  }, []);

  const handleAddPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPasscode.trim();
    if (!trimmed) return;
    if (passcodes.some((p) => p.toUpperCase() === trimmed.toUpperCase())) {
      setPasscodeMsg('⚠️ Passcode already exists.');
      setTimeout(() => setPasscodeMsg(null), 3000);
      return;
    }

    setIsSavingPasscode(true);
    const res = await addServerPasscode(trimmed);
    setIsSavingPasscode(false);

    if (res.success) {
      if (res.passcodes) {
        setPasscodes(res.passcodes);
      } else {
        setPasscodes((prev) => [...prev, trimmed]);
      }
      setNewPasscode('');
      setPasscodeMsg('✨ Passcode added and synced to cloud server!');
    } else {
      setPasscodeMsg(`⚠️ ${res.error || 'Failed to add passcode'}`);
    }
    setTimeout(() => setPasscodeMsg(null), 3500);
  };

  const handleRemovePasscode = async (code: string) => {
    if (passcodes.length <= 1) {
      setPasscodeMsg('⚠️ You must keep at least one passcode active.');
      setTimeout(() => setPasscodeMsg(null), 3000);
      return;
    }

    const res = await removeServerPasscode(code);
    if (res.success) {
      if (res.passcodes) {
        setPasscodes(res.passcodes);
      } else {
        setPasscodes((prev) => prev.filter((p) => p !== code));
      }
      setPasscodeMsg('🗑️ Passcode removed from cloud server.');
    } else {
      setPasscodeMsg(`⚠️ ${res.error || 'Failed to remove passcode'}`);
    }
    setTimeout(() => setPasscodeMsg(null), 3000);
  };

  const handleUpdateMasterPwd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMasterPwd.trim();
    if (!trimmed) return;

    const res = await updateServerMasterPassword(currentMasterPwd || adminPromptPwd, trimmed);
    if (res.success) {
      localStorage.setItem('kaf_master_admin_pwd', trimmed);
      setNewMasterPwd('');
      setCurrentMasterPwd('');
      setMasterPwdMsg('✨ Master Admin password updated on cloud server!');
    } else {
      setMasterPwdMsg(`⚠️ ${res.error || 'Failed to update Master Admin password'}`);
    }
    setTimeout(() => setMasterPwdMsg(null), 4000);
  };

  const handleAdminUnlock = async () => {
    const trimmed = adminPromptPwd.trim();
    if (!trimmed) return;

    setIsUnlocking(true);
    setAdminUnlockError(false);

    try {
      const res = await verifyPasscodeApi(trimmed);
      if (res.success && res.role === 'admin') {
        localStorage.setItem('kaf_user_role', 'admin');
        setIsAdmin(true);
      } else {
        setAdminUnlockError(true);
      }
    } catch (err) {
      setAdminUnlockError(true);
    } finally {
      setIsUnlocking(false);
    }
  };

  const fundConfig = RATES[sandboxFund];
  const maxCharge = fundConfig.maxCharge;
  const netInvestment = sandboxAmount / (1 + maxCharge / 100);
  const pscRate = fundConfig.psc;
  const rankOrcRate = fundConfig.orc[sandboxRank];
  const pscPlusOrcComm = netInvestment * ((pscRate + rankOrcRate) / 100);

  // Downline ORC diff
  const diffOrcRate = Math.max(0, fundConfig.orc[sandboxRank] - fundConfig.orc[sandboxDownlineRank]);
  const downlineOrcComm = netInvestment * (diffOrcRate / 100);

  // Trailer
  const pnavTrailer = ((sandboxAmount * (fundConfig.trailer.pnav / 100)) / 365) * 30;
  const pgnavTrailer = ((sandboxAmount * (fundConfig.trailer.pgnav[sandboxRank] / 100)) / 365) * 30;

  return (
    <div className="space-y-6 pb-28">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="w-5 h-5 text-indigo-600" />
          <h2 className="font-extrabold text-slate-900 text-lg">KAF Verified Mathematical Engine &amp; Rates</h2>
        </div>
        <p className="text-xs text-slate-500">
          Official mathematical specifications, commission mechanics, breakaway thresholds, and rate matrices.
        </p>
      </div>

      {/* Security & Passcode Management Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Secure Passcode Management</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <Globe className="w-3 h-3" />
                  Cloud Synced
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Passcodes and Master Admin credentials are synchronized centrally across all devices (laptops, phones, tablets).
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
            {isAdmin ? `${passcodes.length} Active Passcodes` : '🔒 Master Admin Only'}
          </span>
        </div>

        {!isAdmin ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Restricted to Master Administrator</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Passcode management and settings can only be configured by you (the Master Administrator). Enter your Master Admin password to manage passcodes for all your devices.
              </p>
            </div>
            <div className="max-w-xs mx-auto flex gap-2 pt-2">
              <input
                type="password"
                value={adminPromptPwd}
                onChange={(e) => { setAdminPromptPwd(e.target.value); setAdminUnlockError(false); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdminUnlock(); }}
                placeholder="Enter Master Admin password..."
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-indigo-600"
              />
              <button
                onClick={handleAdminUnlock}
                disabled={isUnlocking || !adminPromptPwd.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold px-3 py-2 rounded-xl text-xs cursor-pointer flex items-center gap-1"
              >
                {isUnlocking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Unlock</span>
              </button>
            </div>
            {adminUnlockError && <p className="text-[11px] text-red-600 font-bold">❌ Incorrect Master Admin password.</p>}
          </div>
        ) : (
          <>
            {passcodeMsg && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900 animate-in fade-in">
                {passcodeMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add Passcode Form */}
              <form onSubmit={handleAddPasscode} className="space-y-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Add New Authorized Passcode
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      value={newPasscode}
                      onChange={(e) => setNewPasscode(e.target.value)}
                      placeholder="Enter new passcode..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-indigo-600"
                    />
                    <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                  <button
                    type="submit"
                    disabled={isSavingPasscode || !newPasscode.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all whitespace-nowrap"
                  >
                    {isSavingPasscode ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>Add to Cloud</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Adding a passcode here saves it centrally to the server so anyone using this passcode can log in from any laptop or phone.
                </p>
              </form>

              {/* List of Active Passcodes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Active Passcodes ({passcodes.length})
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {passcodes.map((code, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {code}
                        </span>
                      </div>
                      {passcodes.length > 1 && (
                        <button
                          onClick={() => handleRemovePasscode(code)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                          title="Remove Passcode"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Change Master Admin Password Section */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              {masterPwdMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 mb-4 animate-in fade-in">
                  {masterPwdMsg}
                </div>
              )}
              <form onSubmit={handleUpdateMasterPwd} className="space-y-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Change Master Admin Password
                </label>
                <div className="flex flex-col sm:flex-row gap-2 max-w-lg">
                  <div className="relative flex-1">
                    <input
                      type="password"
                      value={newMasterPwd}
                      onChange={(e) => setNewMasterPwd(e.target.value)}
                      placeholder="Enter new Master Admin password..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-indigo-600"
                    />
                    <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMasterPwd.trim()}
                    className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all whitespace-nowrap"
                  >
                    <span>Update Master Password</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  This password is saved centrally on the cloud server and is used exclusively to unlock full admin privileges and manage active passcodes from any device.
                </p>
              </form>
            </div>
          </>
        )}
      </div>

      {/* 4 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Pillar 1: Net Investment & PSC */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Net Investment Commission (PSC)</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            Commissions are strictly calculated on <strong>Net Investment</strong> after deducting the Maximum Sales Charge.
          </p>
          <div className="space-y-1.5 font-mono text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200 text-indigo-900">
            <div>Net Investment = Gross Amount / (1 + MaxSC% / 100)</div>
            <div>Commission = Net Investment × (Rate% / 100)</div>
          </div>
        </div>

        {/* Pillar 2: Direct Front-End ORC */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Direct Front-End Overriding (ORC)</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            ORC is earned only from your <strong>immediate direct downline's</strong> personal production based on rank tier difference.
          </p>
          <div className="space-y-1.5 font-mono text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200 text-sky-900">
            <div>ORC Rate = My Rank Tier % – Direct Downline Rank Tier %</div>
            <div>Direct ORC = Net Investment × (ORC Rate / 100)</div>
          </div>
        </div>

        {/* Pillar 3: Breakaway PGNAV Trailer */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Breakaway PGNAV Trailer (AUM)</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            Trailer is a monthly recurring fee (30/365 convention). When a downline matches your rank, their team <strong>breaks away</strong> from your PGNAV.
          </p>
          <div className="space-y-1.5 font-mono text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200 text-amber-900">
            <div>Monthly Trailer = (AUM × (PGNAV% / 100)) / 365 × 30</div>
            <div>Personal NAV Trailer = (AUM × (PNAV% / 100)) / 365 × 30</div>
          </div>
        </div>

        {/* Pillar 4: Equalisation Commission */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-violet-600 text-white font-bold text-xs flex items-center justify-center">
              4
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Equalisation Commission (EC &amp; ETC)</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            When a downline matches your rank (GAM or AM), standard ORC ceases and Equalisation Commission activates on their Personal Group Sales.
          </p>
          <div className="space-y-1.5 font-mono text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200 text-violet-900">
            <div>Gen 1 EC = Downline PGS × (EC Gen1 Rate / 100)</div>
            <div>Gen 2 EC = Grandchild PGS × (EC Gen2 Rate / 100)</div>
          </div>
        </div>

      </div>

      {/* Interactive Verification Sandbox */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-white text-base">Live Calculation Sandbox</h3>
          </div>
          <span className="text-[11px] font-bold bg-white/10 px-2.5 py-1 rounded-full text-indigo-300">
            Audit Tool
          </span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Gross Investment
            </label>
            <input
              type="number"
              value={sandboxAmount}
              onChange={(e) => setSandboxAmount(Number(e.target.value) || 0)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Fund Type
            </label>
            <select
              value={sandboxFund}
              onChange={(e) => setSandboxFund(e.target.value as CashFundKey)}
              className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none"
            >
              {CASH_FUNDS.map((cf) => (
                <option key={cf.key} value={cf.key}>
                  {cf.label} ({cf.charge})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Your Rank
            </label>
            <select
              value={sandboxRank}
              onChange={(e) => setSandboxRank(e.target.value as Rank)}
              className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none"
            >
              {(['GAM', 'AM', 'UM', 'UTC'] as Rank[]).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Downline Rank (for ORC)
            </label>
            <select
              value={sandboxDownlineRank}
              onChange={(e) => setSandboxDownlineRank(e.target.value as Rank)}
              className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none"
            >
              {(['AM', 'UM', 'UTC'] as Rank[]).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Step by Step Breakdown Output */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white/5 rounded-2xl p-4 border border-white/10 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">Net Investment</span>
            <span className="font-black text-white text-sm">{fC(netInvestment)}</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Gross ÷ (1 + {maxCharge}%)</p>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Personal PSC + ORC</span>
            <span className="font-black text-indigo-300 text-sm">{fC(pscPlusOrcComm)}</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Rate: {pscRate}% + {rankOrcRate}%</p>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Direct Downline ORC</span>
            <span className="font-black text-sky-300 text-sm">{fC(downlineOrcComm)}</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Tier Diff: {diffOrcRate.toFixed(2)}%</p>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Monthly Trailer (PNAV)</span>
            <span className="font-black text-amber-300 text-sm">{fC(pnavTrailer)}</span>
            <p className="text-[10px] text-slate-400 mt-0.5">30-day recurring accrual</p>
          </div>
        </div>
      </div>

      {/* Official Master Fund Rates Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Table className="w-5 h-5 text-indigo-600" />
          <h3 className="font-extrabold text-slate-900 text-base">Full KAF Product Commission Matrix</h3>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase text-[10.5px]">
                <th className="py-3 px-3">Fund Category / Name</th>
                <th className="py-3 px-2 text-center">Max SC</th>
                <th className="py-3 px-2 text-right">PSC Base</th>
                <th className="py-3 px-2 text-right">GAM ORC</th>
                <th className="py-3 px-2 text-right">AM ORC</th>
                <th className="py-3 px-2 text-right">UM ORC</th>
                <th className="py-3 px-2 text-right">EC Gen1/2</th>
                <th className="py-3 px-3 text-right">PNAV / PGNAV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {/* Cash Funds */}
              {CASH_FUNDS.map((cf) => {
                const conf = RATES[cf.key];
                return (
                  <tr key={cf.key} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mr-1.5">Cash</span>
                      {conf.name}
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold text-slate-600">{conf.maxCharge}%</td>
                    <td className="py-2.5 px-2 text-right font-bold text-indigo-700">{conf.psc}%</td>
                    <td className="py-2.5 px-2 text-right text-amber-700 font-semibold">{conf.orc.GAM}%</td>
                    <td className="py-2.5 px-2 text-right text-sky-700 font-semibold">{conf.orc.AM}%</td>
                    <td className="py-2.5 px-2 text-right text-emerald-700 font-semibold">{conf.orc.UM}%</td>
                    <td className="py-2.5 px-2 text-right text-violet-700 font-semibold">
                      {conf.ec.GAM ? `${conf.ec.GAM[0]}% / ${conf.ec.GAM[1]}%` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-700">
                      {conf.trailer.pnav}% / {conf.trailer.pgnav.GAM}%
                    </td>
                  </tr>
                );
              })}

              {/* EPF Funds */}
              {EPF_FUNDS.map((ef) => {
                const conf = RATES[ef.key];
                return (
                  <tr key={ef.key} className="hover:bg-slate-50 bg-sky-50/20">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <span className="text-[10px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded mr-1.5">EPF</span>
                      {conf.name}
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold text-slate-600">{conf.maxCharge}%</td>
                    <td className="py-2.5 px-2 text-right font-bold text-indigo-700">{conf.psc}%</td>
                    <td className="py-2.5 px-2 text-right text-amber-700 font-semibold">{conf.orc.GAM}%</td>
                    <td className="py-2.5 px-2 text-right text-sky-700 font-semibold">{conf.orc.AM}%</td>
                    <td className="py-2.5 px-2 text-right text-emerald-700 font-semibold">{conf.orc.UM}%</td>
                    <td className="py-2.5 px-2 text-right text-violet-700 font-semibold">
                      {conf.ec.GAM ? `${conf.ec.GAM[0]}% / ${conf.ec.GAM[1]}%` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-700">
                      {conf.trailer.pnav}% / {conf.trailer.pgnav.GAM}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
