import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Navigate } from "react-router";

import SignInForm from "@/components/sign-in-form";

import type { Route } from "./+types/signin";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign in — budgy" },
    { name: "description", content: "Sign in to your budgy account." },
  ];
}

export default function SignInPage() {
  return (
    <>
      <Authenticated>
        <Navigate to="/" replace />
      </Authenticated>
      <AuthLoading>
        <SignInShell />
      </AuthLoading>
      <Unauthenticated>
        <SignInShell />
      </Unauthenticated>
    </>
  );
}

function SignInShell() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-6">
      <GridPattern />

      <div className="relative z-10 flex w-full max-w-sm flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h1 className="font-mono text-5xl font-bold tracking-tight text-foreground">
            budgy
          </h1>
          <p className="font-mono text-lg text-muted-foreground">
            Your money. Clarified.
          </p>
        </div>

        <SignInForm />

        <p className="text-xs text-muted-foreground/60">
          By continuing, you agree to our terms of service.
        </p>
      </div>
    </div>
  );
}

function GridPattern() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg className="absolute inset-0 size-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-border/40"
            />
          </pattern>
          <radialGradient id="grid-fade" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="grid-mask">
            <rect width="100%" height="100%" fill="url(#grid-fade)" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#grid)"
          mask="url(#grid-mask)"
        />
      </svg>
      <div className="absolute bottom-0 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
    </div>
  );
}
