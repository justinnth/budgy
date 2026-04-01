import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";
import { magicLink } from "better-auth/plugins";

import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL!;

export const authComponent = createClient<DataModel>(components.betterAuth);

function createAuth(ctx: GenericCtx<DataModel>) {
  return betterAuth({
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      crossDomain({ siteUrl }),
      convex({
        authConfig,
        jwksRotateOnTokenGenerationError: true,
      }),
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: process.env.RESEND_FROM_EMAIL ?? "Budgy <noreply@yourdomain.com>",
              to: email,
              subject: "Sign in to Budgy",
              html: [
                '<div style="font-family:monospace;max-width:480px;margin:0 auto;padding:40px 20px">',
                '<h1 style="font-size:24px;margin-bottom:8px">budgy</h1>',
                '<p style="color:#666;margin-bottom:32px">Your money. Clarified.</p>',
                `<a href="${url}" style="display:inline-block;background:#e8634a;color:#fff;padding:12px 32px;text-decoration:none;border-radius:6px;font-weight:600">Sign in to Budgy</a>`,
                '<p style="color:#999;font-size:12px;margin-top:32px">If you didn\'t request this, you can safely ignore this email.</p>',
                "</div>",
              ].join(""),
            }),
          });
          if (!res.ok) {
            throw new Error(`Resend API error: ${res.status}`);
          }
        },
      }),
    ],
  });
}

export { createAuth };

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.safeGetAuthUser(ctx);
  },
});
