import { formatCurrency, formatPercent } from "@/lib/format";

type TooltipData = {
  label: string;
  value: number;
  total: number;
  x: number;
  y: number;
};

export function SankeyTooltip({
  data,
}: {
  data: TooltipData | null;
}) {
  if (!data) return null;

  const ratio = data.total > 0 ? data.value / data.total : 0;

  return (
    <div
      className="pointer-events-none fixed z-50 border border-border bg-popover px-3 py-2 text-popover-foreground shadow-md"
      style={{
        left: data.x + 12,
        top: data.y - 12,
      }}
    >
      <p className="font-mono text-xs font-medium">{data.label}</p>
      <p className="font-mono text-[11px] text-muted-foreground">
        {formatCurrency(data.value)}
        {data.total > 0 && ` (${formatPercent(ratio)})`}
      </p>
    </div>
  );
}
