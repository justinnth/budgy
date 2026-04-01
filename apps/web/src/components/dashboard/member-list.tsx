import type { Id } from "@budgy/backend/convex/_generated/dataModel";
import { api } from "@budgy/backend/convex/_generated/api";
import { Button } from "@budgy/ui/components/button";
import { useMutation, useQuery } from "convex/react";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

export function MemberList({
  budgetId,
  onEdit,
}: {
  budgetId: Id<"budgets">;
  onEdit?: (id: Id<"members">) => void;
}) {
  const members = useQuery(api.members.list, { budgetId });
  const removeMember = useMutation(api.members.remove);

  if (!members) return null;

  if (members.length === 0) {
    return (
      <p className="py-8 text-center font-mono text-xs text-muted-foreground">
        No members added yet
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {members.map((m) => (
        <div
          key={m._id}
          className="group flex items-center justify-between border-b border-border px-1 py-3 last:border-b-0"
        >
          <span className="font-mono text-xs font-medium">{m.name}</span>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit?.(m._id)}
            >
              <PencilIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                removeMember({ id: m._id });
                toast.success("Member removed");
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
