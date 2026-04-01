import { api } from "@budgy/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef } from "react";

export function useBudget() {
  const budget = useQuery(api.budgets.getOrCreate);
  const initBudget = useMutation(api.budgets.initBudget);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (budget === null && !hasInitialized.current) {
      hasInitialized.current = true;
      initBudget();
    }
  }, [budget, initBudget]);

  return budget;
}
