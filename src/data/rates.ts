import { CashFundKey, EpfFundKey, FundRateConfig, Rank } from '../types';

export const HIERARCHY: Record<Rank, number> = {
  GAM: 4,
  AM: 3,
  UM: 2,
  UTC: 1,
};

export const RANK_INFO: Record<Rank, {
  title: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  accent: string;
  description: string;
  gradient: string;
}> = {
  GAM: {
    title: 'Group Agency Manager',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    badgeText: 'text-amber-700',
    border: 'border-amber-400',
    accent: '#f59e0b',
    description: 'Tier 4 Executive Leader with master overrides & Gen 1/Gen 2 EC',
    gradient: 'from-amber-500 to-orange-500',
  },
  AM: {
    title: 'Agency Manager',
    badgeBg: 'bg-sky-100 text-sky-900 border-sky-300',
    badgeText: 'text-sky-700',
    border: 'border-sky-400',
    accent: '#0284c7',
    description: 'Tier 3 Senior Leader with agency group overriding',
    gradient: 'from-sky-500 to-blue-600',
  },
  UM: {
    title: 'Unit Manager',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    badgeText: 'text-emerald-700',
    border: 'border-emerald-400',
    accent: '#10b981',
    description: 'Tier 2 Direct Unit Leader with unit group overrides',
    gradient: 'from-emerald-500 to-teal-600',
  },
  UTC: {
    title: 'Unit Trust Consultant',
    badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    badgeText: 'text-indigo-700',
    border: 'border-indigo-300',
    accent: '#6366f1',
    description: 'Tier 1 Front-line Consultant earning Direct PSC & PNAV Trailer',
    gradient: 'from-indigo-500 to-violet-600',
  },
};

export const RATES: Record<CashFundKey | EpfFundKey, FundRateConfig> = {
  cash1: {
    label: 'KFF, KVF, KTF (6%)',
    name: 'KFF, KVF, KTF',
    maxCharge: 6.0,
    psc: 3.40,
    orc: { GAM: 1.30, AM: 1.00, UM: 0.65, UTC: 0 },
    ec: { GAM: [0.20, 0.10], AM: [0.10, 0.05], UM: [0, 0], UTC: [0, 0] },
    trailer: { pnav: 0.25, pgnav: { GAM: 0.12, AM: 0.08, UM: 0.04, UTC: 0 }, etc: { GAM: [0.0075, 0.0075], AM: [0, 0], UM: [0, 0], UTC: [0, 0] } }
  },
  cash2: {
    label: 'KMF, KGIEF (5.5%)',
    name: 'KMF, KGIEF',
    maxCharge: 5.5,
    psc: 3.10,
    orc: { GAM: 1.10, AM: 0.80, UM: 0.50, UTC: 0 },
    ec: { GAM: [0.20, 0.10], AM: [0.05, 0.10], UM: [0, 0], UTC: [0, 0] },
    trailer: { pnav: 0.25, pgnav: { GAM: 0.12, AM: 0.08, UM: 0.04, UTC: 0 }, etc: { GAM: [0.0075, 0.0075], AM: [0, 0], UM: [0, 0], UTC: [0, 0] } }
  },
  cash3: {
    label: 'KJF (3%)',
    name: 'KJF',
    maxCharge: 3.0,
    psc: 1.70,
    orc: { GAM: 0.65, AM: 0.50, UM: 0.325, UTC: 0 },
    ec: { GAM: [0.05, 0.10], AM: [0.05, 0.025], UM: [0, 0], UTC: [0, 0] },
    trailer: { pnav: 0.25, pgnav: { GAM: 0.12, AM: 0.08, UM: 0.04, UTC: 0 }, etc: { GAM: [0.0075, 0.0075], AM: [0, 0], UM: [0, 0], UTC: [0, 0] } }
  },
  cash4: {
    label: 'PMBSAF, PMBSPF (6%)',
    name: 'PMBSAF, PMBSPF',
    maxCharge: 6.0,
    psc: 3.20,
    orc: { GAM: 1.20, AM: 0.90, UM: 0.55, UTC: 0 },
    ec: { GAM: [0.20, 0.10], AM: [0.05, 0.10], UM: [0, 0], UTC: [0, 0] },
    trailer: { pnav: 0.20, pgnav: { GAM: 0.11, AM: 0.07, UM: 0.04, UTC: 0 }, etc: { GAM: [0.0075, 0.0075], AM: [0, 0], UM: [0, 0], UTC: [0, 0] } }
  },
  cash5: {
    label: 'PAXJI (5%)',
    name: 'PAXJI',
    maxCharge: 5.0,
    psc: 2.65,
    orc: { GAM: 0.75, AM: 0.50, UM: 0.25, UTC: 0 },
    ec: { GAM: [0.10, 0.05], AM: [0.05, 0.025], UM: [0, 0], UTC: [0, 0] },
    trailer: { pnav: 0.20, pgnav: { GAM: 0.11, AM: 0.07, UM: 0.04, UTC: 0 }, etc: { GAM: [0.0075, 0.0075], AM: [0, 0], UM: [0, 0], UTC: [0, 0] } }
  },
  epf1: {
    label: 'Equity (3%)',
    name: 'Equity',
    maxCharge: 3.0,
    psc: 2.00,
    orc: { GAM: 0.35, AM: 0.25, UM: 0.15, UTC: 0 },
    ec: { GAM: [0.10, 0.05], AM: [0.05, 0.025], UM: [0, 0], UTC: [0, 0] },
    trailer: { pnav: 0.25, pgnav: { GAM: 0.12, AM: 0.08, UM: 0.04, UTC: 0 }, etc: { GAM: [0.0075, 0.0075], AM: [0, 0], UM: [0, 0], UTC: [0, 0] } }
  },
  epf2: {
    label: 'PMBSAF, PMBSPF (3%)',
    name: 'PMBSAF, PMBSPF (EPF)',
    maxCharge: 3.0,
    psc: 1.90,
    orc: { GAM: 0.30, AM: 0.20, UM: 0.10, UTC: 0 },
    ec: { GAM: [0.10, 0.05], AM: [0.05, 0.025], UM: [0, 0], UTC: [0, 0] },
    trailer: { pnav: 0.20, pgnav: { GAM: 0.11, AM: 0.07, UM: 0.04, UTC: 0 }, etc: { GAM: [0.0075, 0.0075], AM: [0, 0], UM: [0, 0], UTC: [0, 0] } }
  },
  epf3: {
    label: 'PAXJI (3%)',
    name: 'PAXJI (EPF)',
    maxCharge: 3.0,
    psc: 1.80,
    orc: { GAM: 0.27, AM: 0.18, UM: 0.09, UTC: 0 },
    ec: { GAM: [0.09, 0.04], AM: [0.045, 0.02], UM: [0, 0], UTC: [0, 0] },
    trailer: { pnav: 0.20, pgnav: { GAM: 0.11, AM: 0.07, UM: 0.04, UTC: 0 }, etc: { GAM: [0.0075, 0.0075], AM: [0, 0], UM: [0, 0], UTC: [0, 0] } }
  }
};

export const CASH_FUNDS: { key: CashFundKey; label: string; charge: string }[] = [
  { key: 'cash1', label: 'KFF, KVF, KTF', charge: '6.0%' },
  { key: 'cash2', label: 'KMF, KGIEF', charge: '5.5%' },
  { key: 'cash3', label: 'KJF', charge: '3.0%' },
  { key: 'cash4', label: 'PMBSAF, PMBSPF', charge: '6.0%' },
  { key: 'cash5', label: 'PAXJI', charge: '5.0%' },
];

export const EPF_FUNDS: { key: EpfFundKey; label: string; charge: string }[] = [
  { key: 'epf1', label: 'Equity', charge: '3.0%' },
  { key: 'epf2', label: 'PMBSAF, PMBSPF', charge: '3.0%' },
  { key: 'epf3', label: 'PAXJI', charge: '3.0%' },
];

export function fC(amount: number | undefined | null): string {
  const val = amount || 0;
  return 'RM ' + val.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function fCompact(amount: number | undefined | null): string {
  const val = amount || 0;
  if (val >= 1000000) {
    return 'RM ' + (val / 1000000).toFixed(2) + 'M';
  }
  if (val >= 1000) {
    return 'RM ' + (val / 1000).toFixed(1) + 'k';
  }
  return 'RM ' + val.toFixed(2);
}

export function calcComm(amount: number, maxChargePct: number, ratePct: number): number {
  if (amount > 0 && ratePct > 0) {
    return (amount / (1 + (maxChargePct / 100))) * (ratePct / 100);
  }
  return 0;
}

export function calcTrail(amount: number, ratePct: number): number {
  if (amount > 0 && ratePct > 0) {
    return ((amount * (ratePct / 100)) / 365) * 30;
  }
  return 0;
}
