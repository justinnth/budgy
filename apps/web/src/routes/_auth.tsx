import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Navigate, Outlet } from "react-router";

import Header from "@/components/header";

function BrandedLoader() {
  return (
    <div className="flex h-svh items-center justify-center bg-background">
      <span className="animate-pulse font-mono text-2xl font-bold tracking-wider text-foreground">
        budgy
      </span>
    </div>
  );
}

export default function AuthLayout() {
  return (
    <>
      <Authenticated>
        <div className="grid h-svh grid-rows-[auto_1fr]">
          <Header />
          <main className="overflow-auto">
            <Outlet />
          </main>
        </div>
      </Authenticated>
      <Unauthenticated>
        <Navigate to="/signin" replace />
      </Unauthenticated>
      <AuthLoading>
        <BrandedLoader />
      </AuthLoading>
    </>
  );
}
