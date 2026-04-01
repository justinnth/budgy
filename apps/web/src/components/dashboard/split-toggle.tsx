import { Switch } from "@budgy/ui/components/switch";

type SplitMethod = "equal" | "income-based";

export function SplitToggle({
  value,
  onChange,
}: {
  value: SplitMethod;
  onChange: (method: SplitMethod) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`font-mono text-xs transition-colors ${value === "equal" ? "text-foreground" : "text-muted-foreground"}`}
      >
        50/50
      </span>
      <Switch
        checked={value === "income-based"}
        onCheckedChange={(checked) =>
          onChange(checked ? "income-based" : "equal")
        }
      />
      <span
        className={`font-mono text-xs transition-colors ${value === "income-based" ? "text-foreground" : "text-muted-foreground"}`}
      >
        Income-based
      </span>
    </div>
  );
}
