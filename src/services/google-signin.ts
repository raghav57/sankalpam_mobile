import type { AuthSession } from "@/services/auth";

export async function signInWithGoogle(): Promise<AuthSession | null> {
  throw new Error(
    "Google Sign-In requires a supported native development build.",
  );
}
