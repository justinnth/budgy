import type { Id } from "@budgy/backend/convex/_generated/dataModel";
import { api } from "@budgy/backend/convex/_generated/api";
import { Button } from "@budgy/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@budgy/ui/components/dialog";
import { Input } from "@budgy/ui/components/input";
import { Label } from "@budgy/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@budgy/ui/components/select";
import { Spinner } from "@budgy/ui/components/spinner";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import z from "zod";

type Member = {
  _id: Id<"members">;
  name: string;
};

export default function AddIncomeModal({
  open,
  onOpenChange,
  budgetId,
  members,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetId: Id<"budgets">;
  members: Member[];
}) {
  const createIncome = useMutation(api.incomes.create);

  const form = useForm({
    defaultValues: {
      source: "",
      amount: "",
      memberId: (members[0]?._id ?? "") as string,
    },
    validators: {
      onSubmit: z.object({
        source: z.string().min(1, "Source is required"),
        amount: z.string().refine((v) => Number(v) > 0, "Must be greater than 0"),
        memberId: z.string().min(1, "Select a member"),
      }),
    },
    onSubmit: async ({ value }) => {
      await createIncome({
        budgetId,
        memberId: value.memberId as Id<"members">,
        source: value.source,
        amount: Number(value.amount),
      });
      toast.success("Income added");
      form.reset();
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-mono tracking-tight">
            Add Income
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.Field name="memberId">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>Member</Label>
                {members.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Add a member first
                  </p>
                ) : (
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as Id<"members">)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m._id} value={m._id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </form.Field>
          <form.Field name="source">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>Source</Label>
                <Input
                  id={field.name}
                  placeholder="e.g., Salary"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error, i) => (
                  <p key={i} className="text-xs text-destructive">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
          <form.Field name="amount">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>Amount</Label>
                <Input
                  id={field.name}
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error, i) => (
                  <p key={i} className="text-xs text-destructive">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button
                type="submit"
                className="w-full font-mono text-xs"
                disabled={isSubmitting || members.length === 0}
              >
                {isSubmitting ? <Spinner /> : "Add Income"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  );
}
