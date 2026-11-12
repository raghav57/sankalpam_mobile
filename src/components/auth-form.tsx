import { authStyles as styles } from "@/components/auth-styles";
import { GoogleSignInButton } from "@/components/google-signin-button";
import { useAuth } from "@/contexts/AuthContext";
import { Link, Redirect } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function AuthForm({ signup = false }: { signup?: boolean }) {
  const auth = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  if (auth.loading)
    return (
      <ActivityIndicator
        style={styles.loading}
        accessibilityLabel="Checking session"
      />
    );
  if (auth.user) return <Redirect href="/" />;

  async function submit() {
    setError(null);
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      !password ||
      (signup && password.length < 8)
    ) {
      setError(
        signup
          ? "Enter a valid email and a password of at least 8 characters."
          : "Enter your email and password.",
      );
      return;
    }
    try {
      if (signup) await auth.signup(email.trim(), password, name.trim());
      else await auth.signin(email.trim(), password);
      setPassword("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Authentication failed. Please try again.",
      );
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 24 + insets.bottom },
        ]}
      >
        <Text style={styles.text}>Your Sankalpam account</Text>
        {signup && (
          <>
            <Text style={styles.text}>Name (optional)</Text>
            <TextInput
              accessibilityLabel="Name"
              style={styles.input}
              value={name}
              onChangeText={setName}
              maxLength={100}
              autoComplete="name"
              editable={!auth.busy}
            />
          </>
        )}
        <Text style={styles.text}>Email</Text>
        <TextInput
          accessibilityLabel="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          maxLength={254}
          editable={!auth.busy}
        />
        <Text style={styles.text}>Password</Text>
        <TextInput
          accessibilityLabel="Password"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={signup ? "new-password" : "current-password"}
          textContentType={signup ? "newPassword" : "password"}
          editable={!auth.busy}
          onSubmitEditing={() => {
            if (!auth.busy) void submit();
          }}
        />
        {signup && (
          <Text style={styles.text}>
            Use at least 8 characters, up to 72 UTF-8 bytes.
          </Text>
        )}
        {error && (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        )}
        <Pressable
          accessibilityRole="button"
          disabled={auth.busy}
          onPress={() => void submit()}
          style={[styles.button, auth.busy && styles.disabled]}
        >
          <Text style={styles.buttonText}>
            {auth.busy ? "Please wait…" : signup ? "Create account" : "Sign in"}
          </Text>
        </Pressable>
        {!signup && <GoogleSignInButton />}
        {!auth.busy && (
          <Link href={signup ? "/signin" : "/signup"} style={styles.link}>
            {signup ? "Already registered? Sign in" : "Create an account"}
          </Link>
        )}
        <Link href="/poojas" style={styles.link}>
          Browse poojas
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
