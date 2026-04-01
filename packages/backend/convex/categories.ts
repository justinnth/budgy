import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const DEFAULT_CATEGORIES = [
  "Housing",
  "Groceries",
  "Transportation",
  "Utilities",
  "Insurance",
  "Healthcare",
  "Entertainment",
  "Subscriptions",
  "Clothing",
  "Education",
  "Personal Care",
  "Debt",
  "Other",
] as const;

export const listCustom = query({
  args: { budgetId: v.id("budgets") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customCategories")
      .withIndex("by_budgetId", (q) => q.eq("budgetId", args.budgetId))
      .collect();
  },
});

export const create = mutation({
  args: { budgetId: v.id("budgets"), name: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const budget = await ctx.db.get(args.budgetId);
    if (!budget || budget.userId !== user._id) {
      throw new Error("Budget not found");
    }

    return await ctx.db.insert("customCategories", {
      budgetId: args.budgetId,
      name: args.name,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("customCategories") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const category = await ctx.db.get(args.id);
    if (!category) throw new Error("Category not found");

    const budget = await ctx.db.get(category.budgetId);
    if (!budget || budget.userId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.id);
  },
});
