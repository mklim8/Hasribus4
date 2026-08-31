import { AgentNode, AgencyMetrics, Rank } from '../types';
import { HIERARCHY, RATES, calcComm, calcTrail } from '../data/rates';

/**
 * Traverses the tree bottom-up to calculate:
 * - pvCash & pvEpf (personal sales * count)
 * - tgsCash & tgsEpf (Total Group Sales, sum of all downstream)
 * - pgsCash & pgsEpf (Personal Group Sales, sum excluding branches where rank >= node.rank)
 */
export function calcVolumes(node: AgentNode): void {
  node.pvCash = (node.cash || 0) * (node.count || 1);
  node.pvEpf = (node.epf || 0) * (node.count || 1);
  node.tgsCash = node.pvCash;
  node.tgsEpf = node.pvEpf;
  node.pgsCash = node.pvCash;
  node.pgsEpf = node.pvEpf;

  for (const child of node.children) {
    calcVolumes(child);
    node.tgsCash += child.tgsCash || 0;
    node.tgsEpf += child.tgsEpf || 0;

    // PGS only accumulates downlines of strictly LOWER rank (breakaway prevents higher/equal)
    if (HIERARCHY[child.rank] < HIERARCHY[node.rank]) {
      node.pgsCash += child.pgsCash || 0;
      node.pgsEpf += child.pgsEpf || 0;
    }
  }
}

/**
 * Traverses the tree to compute:
 * - ePsc: Personal Sales Commission + Personal Rank ORC
 * - eOrc: Direct Overriding on direct downlines of lower rank
 * - eEc: Equalisation Commission on direct & second gen equal-rank downlines
 * - eTrail: Personal NAV Trailer + PGNAV Trailer on non-broken away group + ETC Trailer on equal rank
 */
export function calculateAll(node: AgentNode): void {
  node.ePsc = 0;
  node.eOrc = 0;
  node.eEc = 0;
  node.eTrail = 0;

  const cFund = RATES[node.cashFund] || RATES.cash1;
  const eFund = RATES[node.epfFund] || RATES.epf1;

  // 1. Personal Sales Commission (PSC) + Personal Rank Tier ORC on personal volume
  node.ePsc += calcComm(node.pvCash || 0, cFund.maxCharge, cFund.psc + cFund.orc[node.rank]);
  node.ePsc += calcComm(node.pvEpf || 0, eFund.maxCharge, eFund.psc + eFund.orc[node.rank]);

  // 2. Personal NAV Trailer (monthly recurring 30 days)
  node.eTrail += calcTrail(node.pvCash || 0, cFund.trailer.pnav) + calcTrail(node.pvEpf || 0, eFund.trailer.pnav);

  // 3. PGNAV Trailer on downstream team that has not broken away
  const pgsDownlineCash = (node.pgsCash || 0) - (node.pvCash || 0);
  const pgsDownlineEpf = (node.pgsEpf || 0) - (node.pvEpf || 0);
  if (pgsDownlineCash > 0) {
    node.eTrail += calcTrail(pgsDownlineCash, cFund.trailer.pgnav[node.rank]);
  }
  if (pgsDownlineEpf > 0) {
    node.eTrail += calcTrail(pgsDownlineEpf, eFund.trailer.pgnav[node.rank]);
  }

  // 4. Downlines calculation
  for (const child of node.children) {
    const childCFund = RATES[child.cashFund] || RATES.cash1;
    const childEFund = RATES[child.epfFund] || RATES.epf1;

    if (HIERARCHY[node.rank] > HIERARCHY[child.rank]) {
      // Direct Overriding Commission (ORC) on immediate direct downline's personal sales
      const diffOrcC = childCFund.orc[node.rank] - childCFund.orc[child.rank];
      const diffOrcE = childEFund.orc[node.rank] - childEFund.orc[child.rank];
      node.eOrc += calcComm(child.pvCash || 0, childCFund.maxCharge, Math.max(0, diffOrcC));
      node.eOrc += calcComm(child.pvEpf || 0, childEFund.maxCharge, Math.max(0, diffOrcE));
    } else if (HIERARCHY[node.rank] === HIERARCHY[child.rank]) {
      // Equalisation Commission (EC) & Equalisation Trailer (ETC) on equal rank breakaway
      // Gen 1 EC on child's Personal Group Sales
      if (childCFund.ec[node.rank]) {
        node.eEc += calcComm(child.pgsCash || 0, childCFund.maxCharge, childCFund.ec[node.rank][0]);
        if (childCFund.trailer.etc && childCFund.trailer.etc[node.rank]) {
          node.eTrail += calcTrail(child.pgsCash || 0, childCFund.trailer.etc[node.rank][0]);
        }
      }
      if (childEFund.ec[node.rank]) {
        node.eEc += calcComm(child.pgsEpf || 0, childEFund.maxCharge, childEFund.ec[node.rank][0]);
        if (childEFund.trailer.etc && childEFund.trailer.etc[node.rank]) {
          node.eTrail += calcTrail(child.pgsEpf || 0, childEFund.trailer.etc[node.rank][0]);
        }
      }

      // Gen 2 EC on grandchild's Personal Group Sales (if grandchild also matches rank)
      for (const gChild of child.children) {
        if (HIERARCHY[node.rank] === HIERARCHY[gChild.rank]) {
          const gcCFund = RATES[gChild.cashFund] || RATES.cash1;
          const gcEFund = RATES[gChild.epfFund] || RATES.epf1;
          if (gcCFund.ec[node.rank]) {
            node.eEc += calcComm(gChild.pgsCash || 0, gcCFund.maxCharge, gcCFund.ec[node.rank][1]);
            if (gcCFund.trailer.etc && gcCFund.trailer.etc[node.rank]) {
              node.eTrail += calcTrail(gChild.pgsCash || 0, gcCFund.trailer.etc[node.rank][1]);
            }
          }
          if (gcEFund.ec[node.rank]) {
            node.eEc += calcComm(gChild.pgsEpf || 0, gcEFund.maxCharge, gcEFund.ec[node.rank][1]);
            if (gcEFund.trailer.etc && gcEFund.trailer.etc[node.rank]) {
              node.eTrail += calcTrail(gChild.pgsEpf || 0, gcEFund.trailer.etc[node.rank][1]);
            }
          }
        }
      }
    }

    calculateAll(child);
  }
}

/**
 * Calculates global agency level summary metrics
 */
export function getAgencyMetrics(root: AgentNode): AgencyMetrics {
  let totalAgents = 0;
  let totalCash = 0;
  let totalEpf = 0;
  let totalComm = 0;
  const activeRankCounts: Record<Rank, number> = { GAM: 0, AM: 0, UM: 0, UTC: 0 };

  function traverse(node: AgentNode) {
    const count = node.id === 'root' ? 1 : node.count || 1;
    totalAgents += count;
    activeRankCounts[node.rank] = (activeRankCounts[node.rank] || 0) + count;
    totalCash += (node.pvCash || 0);
    totalEpf += (node.pvEpf || 0);
    totalComm += ((node.ePsc || 0) + (node.eOrc || 0) + (node.eEc || 0) + (node.eTrail || 0));

    for (const child of node.children) {
      traverse(child);
    }
  }

  traverse(root);

  const sponsorTotalIncome = (root.ePsc || 0) + (root.eOrc || 0) + (root.eEc || 0) + (root.eTrail || 0);

  return {
    totalAgents,
    totalSales: totalCash + totalEpf,
    totalCashSales: totalCash,
    totalEpfSales: totalEpf,
    totalCommission: totalComm,
    sponsorTotalIncome,
    sponsorPsc: root.ePsc || 0,
    sponsorOrc: root.eOrc || 0,
    sponsorEc: root.eEc || 0,
    sponsorTrail: root.eTrail || 0,
    activeRankCounts,
  };
}

/**
 * Flattens tree into list with hierarchy depths
 */
export function flattenTree(node: AgentNode, parentName: string = 'Top'): (AgentNode & { parentName: string })[] {
  const result: (AgentNode & { parentName: string })[] = [{ ...node, parentName }];
  for (const child of node.children) {
    result.push(...flattenTree(child, node.name || `Node ${node.id}`));
  }
  return result;
}

/**
 * Searches a node by ID
 */
export function findNode(root: AgentNode, id: string): AgentNode | null {
  if (root.id === id) return root;
  for (const c of root.children) {
    const r = findNode(c, id);
    if (r) return r;
  }
  return null;
}

/**
 * Finds parent node ID
 */
export function getParentId(root: AgentNode, targetId: string, parentId: string | null = null): string | null {
  if (root.id === targetId) return parentId;
  for (const c of root.children) {
    const r = getParentId(c, targetId, root.id);
    if (r) return r;
  }
  return null;
}

/**
 * Tree layout coordinate generator for SVG Org Chart
 */
export function layoutTreeForSvg(rootNode: AgentNode, nodeWidth = 200, nodeHeight = 90, hSpacing = 30, vSpacing = 90) {
  function calcLeaf(node: AgentNode): number {
    if (node.children.length === 0) {
      node.leafCount = 1;
    } else {
      let sum = 0;
      for (const child of node.children) {
        sum += calcLeaf(child);
      }
      node.leafCount = sum;
    }
    return node.leafCount;
  }

  calcLeaf(rootNode);

  const leafSlotWidth = nodeWidth + hSpacing;
  const totalLeaves = rootNode.leafCount || 1;
  const totalWidth = Math.max(800, totalLeaves * leafSlotWidth);
  const totalHeight = 4 * (nodeHeight + vSpacing) + 120;

  function assignPos(node: AgentNode, depth: number, xStart: number, xEnd: number) {
    node.x = (xStart + xEnd) / 2;
    node.y = depth * (nodeHeight + vSpacing) + 60;

    if (node.children.length > 0) {
      const parentLeaves = node.leafCount || 1;
      let curX = xStart;
      for (const child of node.children) {
        const childW = ((child.leafCount || 1) / parentLeaves) * (xEnd - xStart);
        assignPos(child, depth + 1, curX, curX + childW);
        curX += childW;
      }
    }
  }

  assignPos(rootNode, 0, 0, totalWidth);

  return { totalWidth, totalHeight, nodeWidth, nodeHeight };
}
