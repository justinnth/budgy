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
import { Spinner } from "@budgy/ui/components/spinner";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import z from "zod";

export default function AddMemberModal({
  open,
  onOpenChange,
  budgetId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetId: Id<"budgets">;
}) {
  const createMember = useMutation(api.members.create);

  const form = useForm({
    defaultValues: { name: "" },
    validators: {
      onSubmit: z.object({
        name: z.string().min(1, "Name is required"),
      }),
    },
    onSubmit: async ({ value }) => {
      await createMember({ budgetId, name: value.name });
      toast.success(`${value.name} added`);
      form.reset();
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-mono tracking-tight">
            Add Member
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.Field name="name">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  placeholder="e.g., Alice"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  autoFocus
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
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner /> : "Add Member"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  );
}
