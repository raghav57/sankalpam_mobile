import { Stack, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SankalpamColors } from "@/constants/sankalpam";
import { useBooking } from "@/contexts/BookingContext";

export default function BookingReviewScreen() {
  const router = useRouter();
  const { draft } = useBooking();

  if (!draft) {
    return (
      <SafeAreaView style={styles.screen}>
        <Stack.Screen
          options={{ headerShown: true, title: "Booking Review" }}
        />
        <View style={styles.content}>
          <Text style={styles.title}>No booking to review</Text>
          <Text style={styles.value}>
            Please select a pooja and enter your booking details.
          </Text>
          <Text style={styles.link} onPress={() => router.replace("/poojas")}>
            Browse Poojas
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Booking Review",
          headerStyle: { backgroundColor: SankalpamColors.cream },
          headerTintColor: SankalpamColors.saffron,
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Review your booking</Text>
        <Text style={styles.subtitle}>
          Please verify your preferences before submitting a request.
        </Text>

        <View style={styles.card}>
          <Detail label="Pooja ID" value={String(draft.poojaId)} />
          <Detail
            label="Booking Mode"
            value={draft.mode === "ONLINE" ? "Online Pooja" : "In-Person Pooja"}
          />
          <Detail label="Preferred Date" value={draft.date} />
          <Detail label="Preferred Time" value={draft.time} />

          {draft.mode === "IN_PERSON" && (
            <>
              <Detail label="Address" value={draft.address} />
              <Detail label="City" value={draft.city} />
              <Detail label="State" value={draft.state} />
            </>
          )}

          <Detail
            label="Special Instructions"
            value={draft.instructions || "None"}
          />
        </View>

        <Text style={styles.notice}>
          Your booking has not been submitted yet. Priest availability will be
          confirmed after the request is received.
        </Text>

        <Text style={styles.link} onPress={() => router.back()}>
          Edit Booking Details
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SankalpamColors.cream,
  },
  content: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 25,
    fontWeight: "700",
    color: SankalpamColors.saffron,
  },
  subtitle: {
    fontSize: 15,
    color: "#62564C",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    gap: 18,
  },
  detail: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#776A5D",
  },
  value: {
    fontSize: 16,
    color: "#302820",
  },
  notice: {
    fontSize: 14,
    color: "#62564C",
    lineHeight: 21,
  },
  link: {
    fontSize: 16,
    fontWeight: "700",
    color: SankalpamColors.saffron,
    marginTop: 12,
  },
});
