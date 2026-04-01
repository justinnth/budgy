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

export function IncomeList({
  budgetId,
  members,
  onEdit,
}: {
  budgetId: Id<"budgets">;
  members: Member[];
  onEdit?: (id: Id<"incomes">) => void;
}) {
  const incomes = useQuery(api.incomes.list, { budgetId });
  const removeIncome = useMutation(api.incomes.remove);

  const memberMap = new Map(members.map((m) => [m._id, m.name]));

  if (!incomes) return null;

  if (incomes.length === 0) {
    return (
      <p className="py-8 text-center font-mono text-xs text-muted-foreground">
        No income added yet
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {incomes.map((inc) => (
        <div
          key={inc._id}
          className="group flex items-center justify-between border-b border-border px-1 py-3 last:border-b-0"
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs font-medium">
              {inc.source}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                {formatCurrency(inc.amount)}
              </span>
              <Badge variant="outline">
                {memberMap.get(inc.memberId) ?? "Unknown"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit?.(inc._id)}
            >
              <PencilIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                removeIncome({ id: inc._id });
                toast.success("Income removed");
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
