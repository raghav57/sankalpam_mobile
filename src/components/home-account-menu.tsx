import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { authStyles } from "@/components/auth-styles";
import { SankalpamColors } from "@/constants/sankalpam";
import { useAuth } from "@/contexts/AuthContext";

export function HomeAccountMenu() {
  const auth = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signout() {
    setError(null);
    try {
      await auth.signout();
      setExpanded(false);
      router.replace("/");
    } catch {
      setError("Unable to sign out. Please try again.");
    }
  }

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="My Account"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        style={styles.toggle}
      >
        <Text style={styles.label}>My Account</Text>
        <Text style={styles.label} accessibilityElementsHidden importantForAccessibility="no">
          {expanded ? "⌃" : "⌄"}
        </Text>
      </Pressable>
      {expanded && (
        <View style={styles.dropdown}>
          <Link href="/profile" asChild>
            <Pressable accessibilityRole="link" style={styles.item} onPress={() => setExpanded(false)}>
              <Text style={authStyles.text}>My Profile</Text>
            </Pressable>
          </Link>
          <Link href="/orders" asChild>
            <Pressable accessibilityRole="link" style={styles.item} onPress={() => setExpanded(false)}>
              <Text style={authStyles.text}>My Orders</Text>
            </Pressable>
          </Link>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign Out"
            disabled={auth.busy}
            style={[styles.item, auth.busy && authStyles.disabled]}
            onPress={() => void signout()}
          >
            <Text style={styles.label}>{auth.busy ? "Signing out…" : "Sign Out"}</Text>
          </Pressable>
        </View>
      )}
      {error && <Text accessibilityRole="alert" style={authStyles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  toggle: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { color: SankalpamColors.saffron, fontSize: 16, fontWeight: "600" },
  dropdown: { borderWidth: 1, borderColor: SankalpamColors.border, borderRadius: 12, overflow: "hidden" },
  item: { minHeight: 48, padding: 14, justifyContent: "center" },
});
