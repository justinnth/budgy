import { Button } from "@budgy/ui/components/button";
import { Input } from "@budgy/ui/components/input";
import { Spinner } from "@budgy/ui/components/spinner";
import { useForm } from "@tanstack/react-form";
import { ArrowLeftIcon, MailIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

const RESEND_COOLDOWN = 60;

export default function SignInForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const form = useForm({
    defaultValues: { email: "" },
    validators: {
      onSubmit: z.object({
        email: z.email("Enter a valid email address"),
      }),
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.magicLink(
        {
          email: value.email,
          callbackURL: "/",
        },
        {
          onSuccess: () => {
            setSentTo(value.email);
            setCooldown(RESEND_COOLDOWN);
          },
          onError: (error) => {
            toast.error(error.error.message || "Something went wrong");
          },
        },
      );
    },
  });

  const handleResend = useCallback(() => {
    if (cooldown > 0 || !sentTo) return;
    form.handleSubmit();
  }, [cooldown, sentTo, form]);

  if (sentTo) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <MailIcon className="size-6 text-primary" />
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="font-mono text-lg font-bold text-foreground">
            Check your inbox
          </h2>
          <p className="text-sm text-muted-foreground">
            We sent a sign-in link to{" "}
            <span className="font-mono font-bold text-foreground">{sentTo}</span>
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="w-full"
            disabled={cooldown > 0}
            onClick={handleResend}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend link"}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setSentTo(null)}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Use a different email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <form.Field name="email">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Input
              id={field.name}
              name={field.name}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="h-12 font-mono text-base"
              aria-invalid={field.state.meta.errors.length > 0 ? true : undefined}
            />
            {field.state.meta.errors.map((error, i) => (
              <p key={i} className="text-sm text-destructive">
                {error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full font-mono text-sm font-bold tracking-wide"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Spinner />
            ) : (
              "Continue with email"
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
