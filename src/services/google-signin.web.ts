import type { AuthSession } from "@/services/auth";

export async function signInWithGoogle(): Promise<AuthSession | null> {
  throw new Error("Native Google Sign-In is not available on web.");
}
