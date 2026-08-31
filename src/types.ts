export type Rank = 'GAM' | 'AM' | 'UM' | 'UTC';

export type CashFundKey = 'cash1' | 'cash2' | 'cash3' | 'cash4' | 'cash5';
export type EpfFundKey = 'epf1' | 'epf2' | 'epf3';

export interface FundRateConfig {
  label: string;
  name: string;
  maxCharge: number;
  psc: number;
  orc: Record<Rank, number>;
  ec: Record<Rank, [number, number]>;
  trailer: {
    pnav: number;
    pgnav: Record<Rank, number>;
    etc?: Record<Rank, [number, number]>;
  };
}

export interface AgentNode {
  id: string;
  depth: number;
  name: string;
  rank: Rank;
  count: number;
  cashFund: CashFundKey;
  cash: number;
  epfFund: EpfFundKey;
  epf: number;
  children: AgentNode[];
  
  // Calculated fields
  pvCash?: number;
  pvEpf?: number;
  tgsCash?: number;
  tgsEpf?: number;
  pgsCash?: number;
  pgsEpf?: number;
  
  ePsc?: number;
  eOrc?: number;
  eEc?: number;
  eTrail?: number;
  
  // Layout fields for Org Chart
  leafCount?: number;
  x?: number;
  y?: number;
}

export interface AgencyMetrics {
  totalAgents: number;
  totalSales: number;
  totalCashSales: number;
  totalEpfSales: number;
  totalCommission: number;
  sponsorTotalIncome: number;
  sponsorPsc: number;
  sponsorOrc: number;
  sponsorEc: number;
  sponsorTrail: number;
  activeRankCounts: Record<Rank, number>;
}
