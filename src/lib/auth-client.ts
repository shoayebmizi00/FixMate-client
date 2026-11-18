import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

// One client for the whole app.
// No baseURL is passed, so the client talks to this same Next.js app
// (the auth endpoints live in src/app/api/auth/[...all]/route.ts).
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});

// Small aliases so pages can import { signIn } instead of authClient.signIn.
export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;
export const useSession = authClient.useSession;
