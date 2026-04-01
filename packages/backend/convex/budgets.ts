import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const getOrCreate = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return null;

    const existing = await ctx.db
      .query("budgets")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (existing) return existing;

    return null;
  },
});

export const initBudget = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("budgets")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("budgets", {
      userId: user._id,
      splitMethod: "equal",
    });
  },
});

export const updateSplitMethod = mutation({
  args: {
    budgetId: v.id("budgets"),
    splitMethod: v.union(v.literal("equal"), v.literal("income-based")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const budget = await ctx.db.get(args.budgetId);
    if (!budget || budget.userId !== user._id) {
      throw new Error("Budget not found");
    }

    await ctx.db.patch(args.budgetId, { splitMethod: args.splitMethod });
  },
});
