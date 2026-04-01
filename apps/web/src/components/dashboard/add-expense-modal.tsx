import type { Id } from "@budgy/backend/convex/_generated/dataModel";

import { DEFAULT_CATEGORIES } from "@/lib/categories";
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
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@budgy/ui/components/select";
import { Spinner } from "@budgy/ui/components/spinner";
import { Switch } from "@budgy/ui/components/switch";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import z from "zod";

type Member = {
  _id: Id<"members">;
  name: string;
};

export default function AddExpenseModal({
  open,
  onOpenChange,
  budgetId,
  members,
  customCategories,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetId: Id<"budgets">;
  members: Member[];
  customCategories: string[];
}) {
  const createExpense = useMutation(api.expenses.create);
  const allCategories = [
    ...DEFAULT_CATEGORIES,
    ...customCategories.filter((c) => !DEFAULT_CATEGORIES.includes(c as typeof DEFAULT_CATEGORIES[number])),
  ];

  const form = useForm({
    defaultValues: {
      description: "",
      amount: "",
      category: allCategories[0] ?? "",
      isPersonal: false,
      memberId: (members[0]?._id ?? "") as string,
    },
    validators: {
      onSubmit: z.object({
        description: z.string().min(1, "Description is required"),
        amount: z
          .string()
          .refine((v) => Number(v) > 0, "Must be greater than 0"),
        category: z.string().min(1, "Category is required"),
        isPersonal: z.boolean(),
        memberId: z.string(),
      }),
    },
    onSubmit: async ({ value }) => {
      const type = value.isPersonal ? "personal" : "shared";
      await createExpense({
        budgetId,
        description: value.description,
        amount: Number(value.amount),
        category: value.category,
        type,
        memberId: type === "personal" ? (value.memberId as Id<"members">) : undefined,
      });
      toast.success("Expense added");
      form.reset();
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono tracking-tight">
            Add Expense
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.Field name="description">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>Description</Label>
                <Input
                  id={field.name}
                  placeholder="e.g., Monthly rent"
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

          <div className="grid grid-cols-2 gap-4">
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
            <form.Field name="category">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Category</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as string)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                      {customCategories.length > 0 && (
                        <>
                          <SelectSeparator />
                          {customCategories.map((cat) => (
                            <SelectItem key={`custom-${cat}`} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="isPersonal">
            {(field) => (
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <Label className="font-mono text-xs">Personal expense</Label>
                  <span className="text-[10px] text-muted-foreground">
                    {field.state.value
                      ? "Assigned to one member"
                      : "Split between all earners"}
                  </span>
                </div>
                <Switch
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(!!checked)}
                />
              </div>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => state.values.isPersonal}
          >
            {(isPersonal) =>
              isPersonal ? (
                <form.Field name="memberId">
                  {(field) => (
                    <div className="flex flex-col gap-1.5">
                      <Label>Assign to</Label>
                      <Select
                        value={field.state.value}
                        onValueChange={(val) =>
                          field.handleChange(val as Id<"members">)
                        }
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
                    </div>
                  )}
                </form.Field>
              ) : null
            }
          </form.Subscribe>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button
                type="submit"
                className="w-full font-mono text-xs"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner /> : "Add Expense"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  );
}
