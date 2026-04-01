const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const formatterWithCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number, cents = false): string {
  return cents ? formatterWithCents.format(amount) : formatter.format(amount);
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}
