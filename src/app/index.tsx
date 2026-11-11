import { router } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SankalpamColors } from "@/constants/sankalpam";

const services = [
  {
    id: "pooja",
    icon: "🙏",
    title: "Pooja Services",
    description: "Explore traditional poojas",
  },
  {
    id: "vedashirvachanam",
    icon: "🪷",
    title: "Vedashirvachanam",
    description: "Receive Vedic blessings",
  },
  {
    id: "dharma",
    icon: "📖",
    title: "Dharma Sandeha",
    description: "Seek spiritual guidance",
  },
  {
    id: "astrology",
    icon: "☀️",
    title: "Astrologer Booking",
    description: "Consult an astrologer",
  },
] as const;

export default function WelcomeScreen() {
  function openService(id: string, title: string) {
    if (id === "pooja") {
      router.push("/poojas");
      return;
    }

    Alert.alert(title, "Coming Soon! This service will be available shortly.");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>
            Sankalpam
          </Text>
          <Text style={styles.subtitle}>Your Sacred Rituals, Simplified</Text>
        </View>

        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>Namaste! 🙏</Text>
          <Text style={styles.welcomeText}>How can we help you today?</Text>
        </View>

        <Text style={styles.sectionTitle}>Explore Our Services</Text>

        <View style={styles.grid}>
          {services.map((service) => (
            <Pressable
              key={service.id}
              accessibilityRole="button"
              accessibilityLabel={service.title}
              onPress={() => openService(service.id, service.title)}
              style={({ pressed }) => [
                styles.serviceCard,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.serviceIcon}>{service.icon}</Text>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceDescription}>
                {service.description}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SankalpamColors.cream,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    color: SankalpamColors.saffron,
    fontSize: 36,
    fontWeight: "700",
  },
  subtitle: {
    color: SankalpamColors.text,
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
  },
  welcome: {
    backgroundColor: SankalpamColors.white,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: SankalpamColors.border,
    marginBottom: 30,
  },
  welcomeTitle: {
    color: SankalpamColors.saffron,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  welcomeText: {
    color: SankalpamColors.text,
    fontSize: 16,
  },
  sectionTitle: {
    color: SankalpamColors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  serviceCard: {
    width: "48%",
    minHeight: 175,
    backgroundColor: SankalpamColors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SankalpamColors.border,
    padding: 16,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  serviceIcon: {
    fontSize: 30,
    marginBottom: 12,
  },
  serviceTitle: {
    color: SankalpamColors.saffron,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },
  serviceDescription: {
    color: SankalpamColors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  pressed: {
    opacity: 0.7,
  },
});
