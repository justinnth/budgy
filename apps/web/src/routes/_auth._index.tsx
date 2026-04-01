import { api } from "@budgy/backend/convex/_generated/api";
import { useQuery } from "convex/react";

import type { Route } from "./+types/_auth._index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "budgy" },
    { name: "description", content: "Your money. Clarified." },
  ];
}

export default function Dashboard() {
  const user = useQuery(api.auth.getCurrentUser);

  return (
    <div className="container mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-mono text-3xl font-bold tracking-tight">
          {user?.name ? `Hey, ${user.name}` : "Dashboard"}
        </h1>
        <p className="text-muted-foreground">
          Your money. Clarified.
        </p>
      </div>
    </div>
  );
}
