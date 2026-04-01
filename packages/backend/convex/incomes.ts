import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const list = query({
  args: { budgetId: v.id("budgets") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("incomes")
      .withIndex("by_budgetId", (q) => q.eq("budgetId", args.budgetId))
      .collect();
  },
});

export const create = mutation({
  args: {
    budgetId: v.id("budgets"),
    memberId: v.id("members"),
    source: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const budget = await ctx.db.get(args.budgetId);
    if (!budget || budget.userId !== user._id) {
      throw new Error("Budget not found");
    }

    return await ctx.db.insert("incomes", {
      budgetId: args.budgetId,
      memberId: args.memberId,
      source: args.source,
      amount: args.amount,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("incomes"),
    memberId: v.id("members"),
    source: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const income = await ctx.db.get(args.id);
    if (!income) throw new Error("Income not found");

    const budget = await ctx.db.get(income.budgetId);
    if (!budget || budget.userId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.id, {
      memberId: args.memberId,
      source: args.source,
      amount: args.amount,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("incomes") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const income = await ctx.db.get(args.id);
    if (!income) throw new Error("Income not found");

    const budget = await ctx.db.get(income.budgetId);
    if (!budget || budget.userId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.id);
  },
});
