import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  budgets: defineTable({
    userId: v.string(),
    splitMethod: v.union(v.literal("equal"), v.literal("income-based")),
  }).index("by_userId", ["userId"]),

  members: defineTable({
    budgetId: v.id("budgets"),
    name: v.string(),
    linkedUserId: v.optional(v.string()),
  }).index("by_budgetId", ["budgetId"]),

  incomes: defineTable({
    budgetId: v.id("budgets"),
    memberId: v.id("members"),
    source: v.string(),
    amount: v.number(),
  }).index("by_budgetId", ["budgetId"]),

  expenses: defineTable({
    budgetId: v.id("budgets"),
    category: v.string(),
    description: v.string(),
    amount: v.number(),
    type: v.union(v.literal("shared"), v.literal("personal")),
    memberId: v.optional(v.id("members")),
  }).index("by_budgetId", ["budgetId"]),

  customCategories: defineTable({
    budgetId: v.id("budgets"),
    name: v.string(),
  }).index("by_budgetId", ["budgetId"]),
});
