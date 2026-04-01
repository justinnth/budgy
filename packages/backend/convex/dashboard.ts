import type { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { authComponent } from "./auth";

export const getSummary = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return null;

    const budget = await ctx.db
      .query("budgets")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!budget) return null;

    const members = await ctx.db
      .query("members")
      .withIndex("by_budgetId", (q) => q.eq("budgetId", budget._id))
      .collect();

    const incomes = await ctx.db
      .query("incomes")
      .withIndex("by_budgetId", (q) => q.eq("budgetId", budget._id))
      .collect();

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_budgetId", (q) => q.eq("budgetId", budget._id))
      .collect();

    const customCategories = await ctx.db
      .query("customCategories")
      .withIndex("by_budgetId", (q) => q.eq("budgetId", budget._id))
      .collect();

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const surplus = totalIncome - totalExpenses;

    const sharedExpenses = expenses.filter((e) => e.type === "shared");
    const totalShared = sharedExpenses.reduce((sum, e) => sum + e.amount, 0);

    const memberIncomes = new Map<Id<"members">, number>();
    for (const income of incomes) {
      memberIncomes.set(
        income.memberId,
        (memberIncomes.get(income.memberId) ?? 0) + income.amount,
      );
    }

    const earningMembers = members.filter(
      (m) => (memberIncomes.get(m._id) ?? 0) > 0,
    );
    const totalEarnerIncome = earningMembers.reduce(
      (sum, m) => sum + (memberIncomes.get(m._id) ?? 0),
      0,
    );

    const memberStats = members.map((m) => {
      const income = memberIncomes.get(m._id) ?? 0;
      const personalExpenses = expenses
        .filter((e) => e.type === "personal" && e.memberId === m._id)
        .reduce((sum, e) => sum + e.amount, 0);

      let sharedShare = 0;
      if (income > 0) {
        if (budget.splitMethod === "equal") {
          sharedShare =
            earningMembers.length > 0
              ? totalShared / earningMembers.length
              : 0;
        } else {
          sharedShare =
            totalEarnerIncome > 0
              ? totalShared * (income / totalEarnerIncome)
              : 0;
        }
      }

      return {
        memberId: m._id,
        name: m.name,
        income,
        sharedShare,
        personalExpenses,
        surplus: income - sharedShare - personalExpenses,
      };
    });

    const sharedByCategory = new Map<string, number>();
    for (const e of sharedExpenses) {
      sharedByCategory.set(
        e.category,
        (sharedByCategory.get(e.category) ?? 0) + e.amount,
      );
    }

    const personalByMemberAndCategory = new Map<string, number>();
    for (const e of expenses.filter((e) => e.type === "personal")) {
      const key = `${e.memberId}::${e.category}`;
      personalByMemberAndCategory.set(
        key,
        (personalByMemberAndCategory.get(key) ?? 0) + e.amount,
      );
    }

    return {
      budget,
      members,
      incomes,
      expenses,
      customCategories: customCategories.map((c) => c.name),
      totalIncome,
      totalExpenses,
      surplus,
      totalShared,
      memberStats,
      sharedByCategory: Object.fromEntries(sharedByCategory),
      personalByMemberAndCategory: Object.fromEntries(
        personalByMemberAndCategory,
      ),
    };
  },
});
