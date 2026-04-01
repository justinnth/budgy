import { api } from "@budgy/backend/convex/_generated/api";
import { Skeleton } from "@budgy/ui/components/skeleton";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowRightIcon,
  PlusIcon,
  UserPlusIcon,
  WalletIcon,
} from "lucide-react";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";

import { MemberStats } from "@/components/dashboard/member-stats";
import { SplitToggle } from "@/components/dashboard/split-toggle";
import { useBudget } from "@/hooks/use-budget";
import { buildSankeyData } from "@/lib/sankey-utils";
import type { SankeyNodeExtra } from "@/lib/sankey-utils";

import type { Route } from "./+types/_auth._index";

const SankeyDiagram = lazy(
  () => import("@/components/dashboard/sankey-diagram").then((m) => ({ default: m.SankeyDiagram })),
);
const BudgetSidebar = lazy(
  () => import("@/components/dashboard/budget-sidebar"),
);
const AddIncomeModal = lazy(
  () => import("@/components/dashboard/add-income-modal"),
);
const AddExpenseModal = lazy(
  () => import("@/components/dashboard/add-expense-modal"),
);
const AddMemberModal = lazy(
  () => import("@/components/dashboard/add-member-modal"),
);

export function meta({}: Route.MetaArgs) {
  return [
    { title: "budgy" },
    { name: "description", content: "Your money. Clarified." },
  ];
}

type SidebarFilter = {
  tab: "income" | "expenses" | "members";
  category?: string;
  memberId?: string;
};

export default function Dashboard() {
  const user = useQuery(api.auth.getCurrentUser);
  const budget = useBudget();
  const summary = useQuery(
    api.dashboard.getSummary,
    budget ? {} : "skip",
  );
  const updateSplit = useMutation(api.budgets.updateSplitMethod);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarFilter, setSidebarFilter] = useState<SidebarFilter>({
    tab: "expenses",
  });
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);

  const sankeyData = useMemo(() => {
    if (!summary) return { nodes: [], links: [] };
    return buildSankeyData(summary);
  }, [summary]);

  const handleSplitChange = useCallback(
    (method: "equal" | "income-based") => {
      if (!budget) return;
      updateSplit({ budgetId: budget._id, splitMethod: method });
    },
    [budget, updateSplit],
  );

  const handleNodeClick = useCallback((node: SankeyNodeExtra) => {
    if (node.filterType === "income") {
      setSidebarFilter({ tab: "income" });
    } else if (node.filterType === "member") {
      setSidebarFilter({ tab: "members", memberId: node.filterId });
    } else if (node.filterType === "category") {
      setSidebarFilter({ tab: "expenses", category: node.filterId });
    } else {
      setSidebarFilter({ tab: "expenses" });
    }
    setSidebarOpen(true);
  }, []);

  const openSidebar = useCallback((tab: "income" | "expenses" | "members") => {
    setSidebarFilter({ tab });
    setSidebarOpen(true);
  }, []);

  if (!budget || !summary) {
    return (
      <div className="container mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col gap-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-8">
        {/* Header with greeting + split toggle */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h1 className="font-mono text-2xl font-bold tracking-tight">
              {user?.name ? `Hey, ${user.name}` : "Dashboard"}
            </h1>
            <p className="font-mono text-xs text-muted-foreground">
              Your money. Clarified.
            </p>
          </div>
          <SplitToggle
            value={budget.splitMethod}
            onChange={handleSplitChange}
          />
        </div>

        {/* Sankey diagram */}
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <SankeyDiagram
            nodes={sankeyData.nodes}
            links={sankeyData.links}
            totalIncome={summary.totalIncome}
            onNodeClick={handleNodeClick}
          />
        </Suspense>

        {/* Member stats */}
        <MemberStats stats={summary.memberStats} />

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <button
            type="button"
            className="group flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => setIncomeModalOpen(true)}
          >
            <PlusIcon className="size-3.5" />
            Add Income
          </button>
          <button
            type="button"
            className="group flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => setExpenseModalOpen(true)}
          >
            <WalletIcon className="size-3.5" />
            Add Expense
          </button>
          <button
            type="button"
            className="group flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => setMemberModalOpen(true)}
          >
            <UserPlusIcon className="size-3.5" />
            Add Member
          </button>
          <button
            type="button"
            className="ml-auto flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => openSidebar("expenses")}
          >
            Browse All
            <ArrowRightIcon className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <Suspense fallback={null}>
        <BudgetSidebar
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          budgetId={budget._id}
          filter={sidebarFilter}
          onFilterChange={setSidebarFilter}
          members={summary.members}
        />
      </Suspense>

      {/* Modals */}
      <Suspense fallback={null}>
        <AddIncomeModal
          open={incomeModalOpen}
          onOpenChange={setIncomeModalOpen}
          budgetId={budget._id}
          members={summary.members}
        />
      </Suspense>
      <Suspense fallback={null}>
        <AddExpenseModal
          open={expenseModalOpen}
          onOpenChange={setExpenseModalOpen}
          budgetId={budget._id}
          members={summary.members}
          customCategories={summary.customCategories}
        />
      </Suspense>
      <Suspense fallback={null}>
        <AddMemberModal
          open={memberModalOpen}
          onOpenChange={setMemberModalOpen}
          budgetId={budget._id}
        />
      </Suspense>
    </div>
  );
}
