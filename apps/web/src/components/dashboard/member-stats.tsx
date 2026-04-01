import { formatCurrency } from "@/lib/format";

type MemberStat = {
  memberId: string;
  name: string;
  income: number;
  sharedShare: number;
  personalExpenses: number;
  surplus: number;
};

export function MemberStats({ stats }: { stats: MemberStat[] }) {
  if (stats.length === 0) {
    return (
      <p className="font-mono text-xs text-muted-foreground">
        Add members to see per-person breakdowns
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {stats.map((s) => (
        <div key={s.memberId} className="flex flex-col gap-0.5">
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-sm font-medium tracking-tight">
              {s.name}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {formatCurrency(s.income)} in
            </span>
            {s.sharedShare > 0 && (
              <span className="font-mono text-xs text-muted-foreground">
                {formatCurrency(s.sharedShare)} shared
              </span>
            )}
            {s.personalExpenses > 0 && (
              <span className="font-mono text-xs text-muted-foreground">
                {formatCurrency(s.personalExpenses)} personal
              </span>
            )}
          </div>
          <span
            className={`font-mono text-xs ${s.surplus >= 0 ? "text-chart-1" : "text-destructive"}`}
          >
            {s.surplus >= 0
              ? `${formatCurrency(s.surplus)} surplus`
              : `${formatCurrency(Math.abs(s.surplus))} over budget`}
          </span>
        </div>
      ))}
    </div>
  );
}
