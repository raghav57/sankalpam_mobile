import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SankalpamColors } from "@/constants/sankalpam";
import { fetchPoojas, type PoojaService } from "@/services/poojas";

type DetailState =
  | { status: "loading" }
  | { status: "success"; pooja: PoojaService }
  | { status: "error"; message: string };

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

export default function PoojaDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [result, setResult] = useState<{
    id: string;
    attempt: number;
    state: DetailState;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const numericId = Number(id);
  const validId = Number.isSafeInteger(numericId) && numericId > 0;
  const state: DetailState = !validId
    ? { status: "error", message: "Invalid pooja selected." }
    : result?.id === id && result.attempt === attempt
      ? result.state
      : { status: "loading" };

  useEffect(() => {
    if (!validId) return;

    const controller = new AbortController();

    const timeout = setTimeout(() => controller.abort(), 20000);

    fetchPoojas(controller.signal)
      .then((poojas) => {
        if (controller.signal.aborted) return;

        const pooja = poojas.find((item) => item.id === numericId);

        setResult({
          id,
          attempt,
          state: pooja
            ? { status: "success", pooja }
            : { status: "error", message: "Pooja not found." },
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResult({
            id,
            attempt,
            state: {
              status: "error",
              message: "Unable to load pooja details.",
            },
          });
        }
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [id, attempt, numericId, validId]);

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Pooja Details",
          headerStyle: { backgroundColor: SankalpamColors.cream },
          headerTintColor: SankalpamColors.saffron,
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {state.status === "loading" ? (
          <ActivityIndicator size="large" color={SankalpamColors.saffron} />
        ) : state.status === "error" ? (
          <View style={styles.card}>
            <Text style={styles.description}>{state.message}</Text>
            <Pressable
              accessibilityRole="button"
              style={styles.button}
              onPress={() => setAttempt((value) => value + 1)}
            >
              <Text style={styles.buttonText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.title}>{state.pooja.name}</Text>

            <Text style={styles.description}>{state.pooja.description}</Text>

            <View style={styles.divider} />

            <Text style={styles.label}>Duration</Text>
            <Text style={styles.value}>{state.pooja.duration} minutes</Text>

            <Text style={styles.label}>Price</Text>
            <Text style={styles.price}>
              {priceFormatter.format(state.pooja.price)}
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: "/booking/[id]",
                  params: { id: String(state.pooja.id) },
                })
              }
              style={({ pressed }) => [
                styles.button,
                pressed && styles.disabled,
              ]}
            >
              <Text style={styles.buttonText}>Book This Pooja</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SankalpamColors.cream,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  card: {
    backgroundColor: SankalpamColors.white,
    borderColor: SankalpamColors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    gap: 14,
  },
  title: {
    color: SankalpamColors.saffron,
    fontSize: 26,
    fontWeight: "700",
  },
  description: {
    color: SankalpamColors.text,
    fontSize: 16,
    lineHeight: 25,
  },
  divider: {
    height: 1,
    backgroundColor: SankalpamColors.border,
    marginVertical: 8,
  },
  label: {
    color: SankalpamColors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  value: {
    color: SankalpamColors.text,
    fontSize: 17,
  },
  price: {
    color: SankalpamColors.saffron,
    fontSize: 24,
    fontWeight: "700",
  },
  button: {
    backgroundColor: SankalpamColors.saffron,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: SankalpamColors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  note: {
    color: SankalpamColors.text,
    fontSize: 13,
    textAlign: "center",
  },
});
