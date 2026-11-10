import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SankalpamColors } from '@/constants/sankalpam';
import { fetchPoojas, type PoojaService } from '@/services/poojas';

type CatalogState =
  | { status: 'loading' }
  | { status: 'success'; poojas: PoojaService[] }
  | { status: 'error' };

const priceFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export default function PoojaCatalogScreen() {
  const [state, setState] = useState<CatalogState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      if (__DEV__) console.warn('[Pooja catalog] Request timed out after 20 seconds.');
      controller.abort();
      setState({ status: 'error' });
    }, 20000);

    fetchPoojas(controller.signal)
      .then((poojas) => {
        if (!controller.signal.aborted) setState({ status: 'success', poojas });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          if (__DEV__) console.error('[Pooja catalog] Load failed:', error);
          setState({ status: 'error' });
        }
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  function retry() {
    setState({ status: 'loading' });
    setAttempt((value) => value + 1);
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.screen}>
      <FlatList
        data={state.status === 'success' ? state.poojas : []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <Text style={styles.intro}>Discover a sacred ritual for your next occasion.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.name}>{item.name}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.details}>
              <Text style={styles.detail}>{item.duration} minutes</Text>
              <Text style={styles.price}>{priceFormatter.format(item.price)}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View accessibilityLiveRegion="polite" style={styles.feedback}>
            {state.status === 'loading' ? (
              <>
                <ActivityIndicator size="large" color={SankalpamColors.saffron} />
                <Text style={styles.message}>Loading poojas...</Text>
              </>
            ) : (
              <>
                <Text accessibilityRole="header" style={styles.name}>
                  {state.status === 'error' ? 'Unable to load poojas' : 'No poojas available yet'}
                </Text>
                <Text style={styles.message}>
                  {state.status === 'error'
                    ? 'Check your connection and try again.'
                    : 'Please check again soon.'}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={retry}
                  style={({ pressed }) => [styles.retry, pressed && styles.pressed]}>
                  <Text style={styles.retryLabel}>Retry</Text>
                </Pressable>
              </>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SankalpamColors.cream },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    padding: 24,
    gap: 16,
  },
  intro: { color: SankalpamColors.text, fontSize: 16, lineHeight: 24, marginBottom: 8 },
  card: {
    backgroundColor: SankalpamColors.white,
    borderColor: SankalpamColors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    gap: 12,
  },
  name: { color: SankalpamColors.saffron, fontSize: 22, fontWeight: '600' },
  description: { color: SankalpamColors.text, fontSize: 16, lineHeight: 25 },
  details: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  detail: { color: SankalpamColors.text, fontSize: 15 },
  price: { color: SankalpamColors.saffron, fontSize: 17, fontWeight: '600' },
  feedback: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 48 },
  message: { color: SankalpamColors.text, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  retry: {
    backgroundColor: SankalpamColors.saffron,
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 48,
  },
  retryLabel: { color: SankalpamColors.white, fontSize: 16, fontWeight: '600' },
  pressed: { opacity: 0.8 },
});
