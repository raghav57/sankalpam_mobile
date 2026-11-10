import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { SankalpamColors } from '@/constants/sankalpam';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: SankalpamColors.cream },
        }}>
        <Stack.Screen name="index" options={{ title: 'Sankalpam' }} />
        <Stack.Screen
          name="poojas"
          options={{
            headerShown: true,
            title: 'Pooja Catalog',
            headerStyle: { backgroundColor: SankalpamColors.cream },
            headerTintColor: SankalpamColors.saffron,
            headerShadowVisible: false,
          }}
        />
      </Stack>
    </>
  );
}
