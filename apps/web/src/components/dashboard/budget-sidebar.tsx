import type { Id } from "@budgy/backend/convex/_generated/dataModel";
import { ScrollArea } from "@budgy/ui/components/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@budgy/ui/components/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@budgy/ui/components/tabs";

import { ExpenseList } from "./expense-list";
import { IncomeList } from "./income-list";
import { MemberList } from "./member-list";

type SidebarFilter = {
  tab: "income" | "expenses" | "members";
  category?: string;
  memberId?: string;
};

type Member = {
  _id: Id<"members">;
  name: string;
};

export default function BudgetSidebar({
  open,
  onOpenChange,
  budgetId,
  filter,
  onFilterChange,
  members,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetId: Id<"budgets">;
  filter: SidebarFilter;
  onFilterChange: (filter: SidebarFilter) => void;
  members: Member[];
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-mono tracking-tight">
            Budget Items
            {filter.category && (
              <span className="ml-2 text-muted-foreground">
                / {filter.category}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>
        <Tabs
          value={filter.tab}
          onValueChange={(val) =>
            onFilterChange({ tab: val as SidebarFilter["tab"] })
          }
          className="flex flex-1 flex-col overflow-hidden"
        >
          <TabsList variant="line" className="w-full shrink-0">
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>
          <ScrollArea className="flex-1">
            <div className="p-4">
              <TabsContent value="income">
                <IncomeList budgetId={budgetId} members={members} />
              </TabsContent>
              <TabsContent value="expenses">
                <ExpenseList
                  budgetId={budgetId}
                  members={members}
                  filterCategory={filter.category}
                />
              </TabsContent>
              <TabsContent value="members">
                <MemberList budgetId={budgetId} />
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
