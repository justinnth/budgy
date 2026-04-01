import type { SankeyGraph } from "d3-sankey";

export type SankeyNodeExtra = {
  id: string;
  label: string;
  column: number;
  filterType?: "income" | "member" | "pool" | "category" | "surplus";
  filterId?: string;
};

export type SankeyLinkExtra = {
  source: number;
  target: number;
  value: number;
};

export type BudgetSankeyGraph = SankeyGraph<SankeyNodeExtra, SankeyLinkExtra>;

type MemberStat = {
  memberId: string;
  name: string;
  income: number;
  sharedShare: number;
  personalExpenses: number;
  surplus: number;
};

type Income = {
  _id: string;
  memberId: string;
  source: string;
  amount: number;
};

type Expense = {
  _id: string;
  category: string;
  amount: number;
  type: "shared" | "personal";
  memberId?: string;
};

type SummaryData = {
  incomes: Income[];
  expenses: Expense[];
  memberStats: MemberStat[];
  sharedByCategory: Record<string, number>;
  personalByMemberAndCategory: Record<string, number>;
  totalShared: number;
  surplus: number;
};

export function buildSankeyData(summary: SummaryData): {
  nodes: SankeyNodeExtra[];
  links: SankeyLinkExtra[];
} {
  const nodes: SankeyNodeExtra[] = [];
  const links: SankeyLinkExtra[] = [];
  const nodeIndex = new Map<string, number>();

  function addNode(node: SankeyNodeExtra): number {
    if (nodeIndex.has(node.id)) return nodeIndex.get(node.id)!;
    const idx = nodes.length;
    nodeIndex.set(node.id, idx);
    nodes.push(node);
    return idx;
  }

  const incomeBySourceAndMember = new Map<string, number>();
  for (const inc of summary.incomes) {
    const key = `${inc.memberId}::${inc.source}`;
    incomeBySourceAndMember.set(
      key,
      (incomeBySourceAndMember.get(key) ?? 0) + inc.amount,
    );
  }

  for (const [key, amount] of incomeBySourceAndMember) {
    const [memberId, source] = key.split("::");
    if (amount <= 0) continue;

    const sourceNodeId = `income::${key}`;
    const memberNodeId = `member::${memberId}`;

    addNode({
      id: sourceNodeId,
      label: source,
      column: 0,
      filterType: "income",
      filterId: key,
    });

    const memberStat = summary.memberStats.find(
      (m) => m.memberId === memberId,
    );
    addNode({
      id: memberNodeId,
      label: memberStat?.name ?? "Unknown",
      column: 1,
      filterType: "member",
      filterId: memberId,
    });

    links.push({
      source: nodeIndex.get(sourceNodeId)!,
      target: nodeIndex.get(memberNodeId)!,
      value: amount,
    });
  }

  const sharedPoolId = "pool::shared";
  if (summary.totalShared > 0) {
    addNode({
      id: sharedPoolId,
      label: "Shared",
      column: 2,
      filterType: "pool",
      filterId: "shared",
    });
  }

  for (const stat of summary.memberStats) {
    if (stat.income <= 0) continue;
    const memberNodeId = `member::${stat.memberId}`;

    if (stat.sharedShare > 0 && nodeIndex.has(sharedPoolId)) {
      links.push({
        source: nodeIndex.get(memberNodeId)!,
        target: nodeIndex.get(sharedPoolId)!,
        value: stat.sharedShare,
      });
    }

    const personalTotal = stat.personalExpenses;
    if (personalTotal > 0) {
      const personalPoolId = `pool::personal::${stat.memberId}`;
      addNode({
        id: personalPoolId,
        label: `${stat.name} Personal`,
        column: 2,
        filterType: "pool",
        filterId: `personal::${stat.memberId}`,
      });

      links.push({
        source: nodeIndex.get(memberNodeId)!,
        target: nodeIndex.get(personalPoolId)!,
        value: personalTotal,
      });
    }

    if (stat.surplus > 0) {
      const surplusId = `surplus::${stat.memberId}`;
      addNode({
        id: surplusId,
        label: `${stat.name} Surplus`,
        column: 3,
        filterType: "surplus",
        filterId: stat.memberId,
      });
      links.push({
        source: nodeIndex.get(memberNodeId)!,
        target: nodeIndex.get(surplusId)!,
        value: stat.surplus,
      });
    }
  }

  for (const [category, amount] of Object.entries(summary.sharedByCategory)) {
    if (amount <= 0) continue;
    const catNodeId = `category::shared::${category}`;
    addNode({
      id: catNodeId,
      label: category,
      column: 3,
      filterType: "category",
      filterId: category,
    });

    links.push({
      source: nodeIndex.get(sharedPoolId)!,
      target: nodeIndex.get(catNodeId)!,
      value: amount,
    });
  }

  for (const [key, amount] of Object.entries(
    summary.personalByMemberAndCategory,
  )) {
    if (amount <= 0) continue;
    const [memberId, category] = key.split("::");
    const personalPoolId = `pool::personal::${memberId}`;
    if (!nodeIndex.has(personalPoolId)) continue;

    const catNodeId = `category::personal::${key}`;
    addNode({
      id: catNodeId,
      label: category,
      column: 3,
      filterType: "category",
      filterId: category,
    });

    links.push({
      source: nodeIndex.get(personalPoolId)!,
      target: nodeIndex.get(catNodeId)!,
      value: amount,
    });
  }

  return { nodes, links };
}
