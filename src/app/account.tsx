import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AccountScreen() {
  const auth = useAuth();
  const insets = useSafeAreaInsets();
  const [error, setError] = useState<string | null>(null);

  async function signout() {
    setError(null);

    try {
      await auth.signout();
    } catch {
      setError("Unable to sign out. Please try again.");
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: 20 + insets.bottom },
      ]}
    >
      {auth.loading ? (
        <ActivityIndicator color="#B45309" />
      ) : auth.user ? (
        <>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(auth.user.name || "S").charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.welcome}>Namaste 🙏</Text>
              <Text style={styles.name}>
                {auth.user.name || "Sankalpam Devotee"}
              </Text>
              <Text style={styles.email}>{auth.user.email}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Explore</Text>

          <Link href="/poojas" asChild>
            <Pressable style={styles.menuItem}>
              <Text style={styles.menuText}>🪷 Browse Poojas</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </Link>

          <Text style={styles.sectionTitle}>Account</Text>

          <Pressable
            accessibilityRole="button"
            disabled={auth.busy}
            style={[styles.signoutButton, auth.busy && styles.disabled]}
            onPress={() => void signout()}
          >
            <Text style={styles.signoutText}>
              {auth.busy ? "Signing out…" : "Sign out"}
            </Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.profileCard}>
          <Text style={styles.name}>Welcome to Sankalpam</Text>
          <Text style={styles.email}>Sign in to manage your account.</Text>

          <Link href="/signin" style={styles.primaryLink}>
            Sign in
          </Link>

          <Link href="/signup" style={styles.secondaryLink}>
            Create an account
          </Link>
        </View>
      )}

      {(error || auth.error) && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error || auth.error}
        </Text>
      )}

      {auth.error && !auth.loading && (
        <Pressable onPress={() => void auth.refresh()}>
          <Text style={styles.secondaryLink}>Retry session check</Text>
        </Pressable>
      )}

      {!auth.user && (
        <Link href="/poojas" style={styles.secondaryLink}>
          Browse poojas
        </Link>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF8EE",
  },
  content: {
    padding: 20,
    gap: 18,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F5D7A5",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#92400E",
  },
  profileInfo: {
    flex: 1,
    minWidth: 180,
  },
  welcome: {
    fontSize: 14,
    color: "#B45309",
  },
  name: {
    fontSize: 19,
    fontWeight: "700",
    color: "#713F12",
    marginTop: 3,
  },
  email: {
    fontSize: 13,
    color: "#78716C",
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#92400E",
    marginTop: 12,
  },
  menuItem: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuText: {
    fontSize: 16,
    color: "#713F12",
    fontWeight: "500",
  },
  chevron: {
    fontSize: 24,
    color: "#B45309",
  },
  signoutButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7CBB0",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  signoutText: {
    color: "#9A3412",
    fontWeight: "600",
    fontSize: 15,
  },
  disabled: {
    opacity: 0.5,
  },
  primaryLink: {
    color: "#B45309",
    fontWeight: "700",
    fontSize: 16,
    marginTop: 14,
  },
  secondaryLink: {
    color: "#B45309",
    fontSize: 15,
    marginTop: 10,
  },
  error: {
    color: "#B91C1C",
    fontSize: 14,
  },
});
