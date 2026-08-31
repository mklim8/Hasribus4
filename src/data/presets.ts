import { AgentNode } from '../types';

export interface AgencyPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon: string;
  data: AgentNode;
}

export const PRESETS: AgencyPreset[] = [
  {
    id: 'starter',
    name: 'Standard Starting Hub',
    badge: 'Starter',
    icon: '🌱',
    description: 'Clean default starting team with a GAM and 1 Unit Manager',
    data: {
      id: 'root',
      depth: 0,
      name: 'You (Sponsor)',
      rank: 'GAM',
      count: 1,
      cashFund: 'cash1',
      cash: 50000,
      epfFund: 'epf1',
      epf: 20000,
      children: [
        {
          id: 'n_1',
          depth: 1,
          name: 'Unit Alpha',
          rank: 'UM',
          count: 3,
          cashFund: 'cash1',
          cash: 40000,
          epfFund: 'epf1',
          epf: 15000,
          children: [
            {
              id: 'n_2',
              depth: 2,
              name: 'Advisors Team',
              rank: 'UTC',
              count: 5,
              cashFund: 'cash1',
              cash: 25000,
              epfFund: 'epf1',
              epf: 10000,
              children: []
            }
          ]
        }
      ]
    }
  },
  {
    id: 'mega_empire',
    name: 'GAM Mega Empire (RM 1.5M)',
    badge: 'Enterprise',
    icon: '👑',
    description: 'Multi-branch agency with 2 Agency Managers, 4 Unit Managers and high volume',
    data: {
      id: 'root',
      depth: 0,
      name: 'Agency Principal (You)',
      rank: 'GAM',
      count: 1,
      cashFund: 'cash1',
      cash: 100000,
      epfFund: 'epf1',
      epf: 50000,
      children: [
        {
          id: 'n_1',
          depth: 1,
          name: 'Klang Valley AM Branch',
          rank: 'AM',
          count: 2,
          cashFund: 'cash1',
          cash: 80000,
          epfFund: 'epf1',
          epf: 30000,
          children: [
            {
              id: 'n_2',
              depth: 2,
              name: 'Subang Fast-Track Unit',
              rank: 'UM',
              count: 4,
              cashFund: 'cash1',
              cash: 50000,
              epfFund: 'epf1',
              epf: 20000,
              children: [
                {
                  id: 'n_3',
                  depth: 3,
                  name: 'Junior Wealth Advisors',
                  rank: 'UTC',
                  count: 8,
                  cashFund: 'cash2',
                  cash: 30000,
                  epfFund: 'epf1',
                  epf: 15000,
                  children: []
                }
              ]
            }
          ]
        },
        {
          id: 'n_4',
          depth: 1,
          name: 'Penang Northern Division',
          rank: 'AM',
          count: 1,
          cashFund: 'cash4',
          cash: 90000,
          epfFund: 'epf2',
          epf: 40000,
          children: [
            {
              id: 'n_5',
              depth: 2,
              name: 'Bay Prime Unit',
              rank: 'UM',
              count: 3,
              cashFund: 'cash4',
              cash: 45000,
              epfFund: 'epf2',
              epf: 20000,
              children: []
            }
          ]
        },
        {
          id: 'n_6',
          depth: 1,
          name: 'Equal GAM Breakaway Unit',
          rank: 'GAM',
          count: 1,
          cashFund: 'cash1',
          cash: 120000,
          epfFund: 'epf1',
          epf: 60000,
          children: [
            {
              id: 'n_7',
              depth: 2,
              name: 'Breakaway Sub-Branch',
              rank: 'GAM',
              count: 1,
              cashFund: 'cash1',
              cash: 80000,
              epfFund: 'epf1',
              epf: 40000,
              children: []
            }
          ]
        }
      ]
    }
  },
  {
    id: 'rookie_unit',
    name: 'Fast-Track Unit Manager',
    badge: 'Growth',
    icon: '🚀',
    description: 'Energetic Unit Manager leading 6 dynamic consultants',
    data: {
      id: 'root',
      depth: 0,
      name: 'Unit Manager (You)',
      rank: 'UM',
      count: 1,
      cashFund: 'cash1',
      cash: 60000,
      epfFund: 'epf1',
      epf: 25000,
      children: [
        {
          id: 'n_1',
          depth: 1,
          name: 'Team Horizon',
          rank: 'UTC',
          count: 4,
          cashFund: 'cash1',
          cash: 35000,
          epfFund: 'epf1',
          epf: 12000,
          children: []
        },
        {
          id: 'n_2',
          depth: 1,
          name: 'Team Vanguard',
          rank: 'UTC',
          count: 3,
          cashFund: 'cash2',
          cash: 28000,
          epfFund: 'epf1',
          epf: 10000,
          children: []
        }
      ]
    }
  },
  {
    id: 'blank',
    name: 'Clean Slate / Custom Build',
    badge: 'Empty',
    icon: '✨',
    description: 'Start from ground zero with just the sponsor node',
    data: {
      id: 'root',
      depth: 0,
      name: 'You (Sponsor)',
      rank: 'GAM',
      count: 1,
      cashFund: 'cash1',
      cash: 0,
      epfFund: 'epf1',
      epf: 0,
      children: []
    }
  }
];
