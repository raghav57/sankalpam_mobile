import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SankalpamColors } from '@/constants/sankalpam';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View accessible={false} style={styles.emblem}>
            <View style={styles.flame} />
            <View style={styles.lamp} />
          </View>
          <Text accessibilityRole="header" style={styles.title}>
            Sankalpam
          </Text>
          <Text style={styles.subtitle}>Your Sacred Rituals, Simplified</Text>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityHint="Browse available pooja services"
              onPress={() => router.push('/poojas')}
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
              <Text style={styles.buttonLabel}>Explore Poojas</Text>
            </Pressable>
          </View>
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
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  card: {
    width: '100%',
    flexShrink: 0,
    maxWidth: 440,
    alignItems: 'center',
    backgroundColor: SankalpamColors.white,
    borderColor: SankalpamColors.border,
    borderWidth: 1,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  emblem: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: SankalpamColors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginBottom: 28,
  },
  flame: {
    width: 14,
    height: 22,
    borderRadius: 10,
    borderTopRightRadius: 0,
    backgroundColor: SankalpamColors.saffron,
    transform: [{ rotate: '20deg' }],
  },
  lamp: {
    width: 36,
    height: 14,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: SankalpamColors.saffron,
  },
  title: {
    color: SankalpamColors.saffron,
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: SankalpamColors.text,
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
    marginTop: 12,
  },
  actions: {
    alignSelf: 'stretch',
    gap: 14,
    marginTop: 40,
  },
  button: {
    width: '100%',
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: SankalpamColors.saffron,
  },
  buttonLabel: {
    color: SankalpamColors.white,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
