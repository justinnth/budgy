import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const list = query({
  args: { budgetId: v.id("budgets") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("members")
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

    return await ctx.db.insert("members", {
      budgetId: args.budgetId,
      name: args.name,
    });
  },
});

export const update = mutation({
  args: { id: v.id("members"), name: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const member = await ctx.db.get(args.id);
    if (!member) throw new Error("Member not found");

    const budget = await ctx.db.get(member.budgetId);
    if (!budget || budget.userId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.id, { name: args.name });
  },
});

export const remove = mutation({
  args: { id: v.id("members") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const member = await ctx.db.get(args.id);
    if (!member) throw new Error("Member not found");

    const budget = await ctx.db.get(member.budgetId);
    if (!budget || budget.userId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.id);
  },
});
