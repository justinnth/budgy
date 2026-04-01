import type { Id } from "@budgy/backend/convex/_generated/dataModel";
import { api } from "@budgy/backend/convex/_generated/api";
import { Badge } from "@budgy/ui/components/badge";
import { Button } from "@budgy/ui/components/button";
import { useMutation, useQuery } from "convex/react";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { formatCurrency } from "@/lib/format";

type Member = {
  _id: Id<"members">;
  name: string;
};

export function ExpenseList({
  budgetId,
  members,
  filterCategory,
  onEdit,
}: {
  budgetId: Id<"budgets">;
  members: Member[];
  filterCategory?: string;
  onEdit?: (id: Id<"expenses">) => void;
}) {
  const expenses = useQuery(api.expenses.list, { budgetId });
  const removeExpense = useMutation(api.expenses.remove);

  const memberMap = new Map(members.map((m) => [m._id, m.name]));

  if (!expenses) return null;

  const filtered = filterCategory
    ? expenses.filter((e) => e.category === filterCategory)
    : expenses;

  if (filtered.length === 0) {
    return (
      <p className="py-8 text-center font-mono text-xs text-muted-foreground">
        {filterCategory
          ? `No ${filterCategory} expenses`
          : "No expenses added yet"}
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {filtered.map((exp) => (
        <div
          key={exp._id}
          className="group flex items-center justify-between border-b border-border px-1 py-3 last:border-b-0"
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs font-medium">
              {exp.description}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                {formatCurrency(exp.amount)}
              </span>
              <Badge variant="outline">{exp.category}</Badge>
              <Badge variant={exp.type === "shared" ? "secondary" : "default"}>
                {exp.type === "shared"
                  ? "shared"
                  : memberMap.get(exp.memberId as Id<"members">) ?? "personal"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit?.(exp._id)}
            >
              <PencilIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                removeExpense({ id: exp._id });
                toast.success("Expense removed");
              }}
            >
              <Trash2Icon />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
