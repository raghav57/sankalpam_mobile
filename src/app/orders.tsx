import { Link, Redirect } from "expo-router";
import { ActivityIndicator, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authStyles as styles } from "@/components/auth-styles";
import { useAuth } from "@/contexts/AuthContext";

export default function OrdersScreen() {
  const { user, loading } = useAuth();

  if (loading) return <ActivityIndicator style={styles.loading} accessibilityLabel="Checking session" />;
  if (!user) return <Redirect href="/signin" />;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>My Orders</Text>
        <Text style={styles.text}>Your pooja bookings will appear here.</Text>
        <Link href="/" replace style={styles.link}>Back to Home</Link>
      </ScrollView>
    </SafeAreaView>
  );
}
