import { isRunningInExpoGo } from "expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { AuthError } from "@/services/auth";

export function GoogleSignInButton() {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);

  const isExpoGo = isRunningInExpoGo();

  async function handleGoogleSignIn() {
    if (isExpoGo || loading) return;

    setLoading(true);

    try {
      // Load the native module only after confirming this is not Expo Go.
      const { signInWithGoogle } = await import("@/services/google-signin");

      const session = await signInWithGoogle();

      if (!session) return;

      await auth.acceptSession(session);
      router.replace("/");
    } catch (error) {
      if (__DEV__) {
        console.warn("Google Sign-In failed", {
          backendAuthError: error instanceof AuthError,
          httpStatus: error instanceof AuthError ? error.status : undefined,
        });
      }
      Alert.alert(
        "Google Sign-In",
        error instanceof Error
          ? error.message
          : "Unable to sign in with Google.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (isExpoGo) {
    return (
      <View style={{ paddingVertical: 12 }}>
        <Text style={{ textAlign: "center", color: "#777" }}>
          Google Sign-In will be available in the installed Sankalpam app.
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={handleGoogleSignIn}
      disabled={loading || auth.busy}
      accessibilityRole="button"
      style={{
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        alignItems: "center",
        marginTop: 12,
        opacity: loading || auth.busy ? 0.6 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text style={{ fontWeight: "600" }}>Sign In with Google</Text>
      )}
    </Pressable>
  );
}
