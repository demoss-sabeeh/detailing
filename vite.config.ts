import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Use the Vercel Nitro preset when building on Vercel.
const isVercel = Boolean(process.env.VERCEL);

export default defineConfig({
  tanstackStart: {
    server: {
      entry: "server",
    },
  },

  nitro: isVercel
    ? {
        preset: "vercel",
      }
    : true,
});