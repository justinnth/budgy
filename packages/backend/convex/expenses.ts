import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const list = query({
  args: { budgetId: v.id("budgets") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("expenses")
      .withIndex("by_budgetId", (q) => q.eq("budgetId", args.budgetId))
      .collect();
  },
});

export const create = mutation({
  args: {
    budgetId: v.id("budgets"),
    category: v.string(),
    description: v.string(),
    amount: v.number(),
    type: v.union(v.literal("shared"), v.literal("personal")),
    memberId: v.optional(v.id("members")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const budget = await ctx.db.get(args.budgetId);
    if (!budget || budget.userId !== user._id) {
      throw new Error("Budget not found");
    }

    if (args.type === "personal" && !args.memberId) {
      throw new Error("Personal expenses must be assigned to a member");
    }

    return await ctx.db.insert("expenses", {
      budgetId: args.budgetId,
      category: args.category,
      description: args.description,
      amount: args.amount,
      type: args.type,
      memberId: args.memberId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("expenses"),
    category: v.string(),
    description: v.string(),
    amount: v.number(),
    type: v.union(v.literal("shared"), v.literal("personal")),
    memberId: v.optional(v.id("members")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const expense = await ctx.db.get(args.id);
    if (!expense) throw new Error("Expense not found");

    const budget = await ctx.db.get(expense.budgetId);
    if (!budget || budget.userId !== user._id) {
      throw new Error("Not authorized");
    }

    if (args.type === "personal" && !args.memberId) {
      throw new Error("Personal expenses must be assigned to a member");
    }

    await ctx.db.patch(args.id, {
      category: args.category,
      description: args.description,
      amount: args.amount,
      type: args.type,
      memberId: args.memberId,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const expense = await ctx.db.get(args.id);
    if (!expense) throw new Error("Expense not found");

    const budget = await ctx.db.get(expense.budgetId);
    if (!budget || budget.userId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.id);
  },
});
