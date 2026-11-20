import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { SankalpamColors } from "@/constants/sankalpam";
import { AuthProvider } from "@/contexts/AuthContext";
import { BookingProvider } from "@/contexts/BookingContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <BookingProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: SankalpamColors.cream },
          }}
        >
          <Stack.Screen name="index" options={{ title: "Sankalpam" }} />
          <Stack.Screen
            name="account"
            options={{
              headerShown: true,
              title: "My Account",
              headerBackTitle: "Back",
              headerStyle: {
                backgroundColor: SankalpamColors.cream,
              },
              headerTintColor: SankalpamColors.saffron,
              headerShadowVisible: false,
              headerTransparent: false,
            }}
          />
          <Stack.Screen
            name="signin"
            options={{
              headerShown: true,
              title: "Sign in",
              headerBackTitle: "Back",
              headerStyle: {
                backgroundColor: SankalpamColors.cream,
              },
              headerTintColor: SankalpamColors.saffron,
              headerShadowVisible: false,
              headerTransparent: false,
            }}
          />
          <Stack.Screen
            name="signup"
            options={{
              headerShown: true,
              title: "Create account",
              headerBackTitle: "Back",
              headerStyle: {
                backgroundColor: SankalpamColors.cream,
              },
              headerTintColor: SankalpamColors.saffron,
              headerShadowVisible: false,
              headerTransparent: false,
            }}
          />
          <Stack.Screen
            name="poojas"
            options={{
              headerShown: true,
              title: "Pooja Catalog",
              headerStyle: { backgroundColor: SankalpamColors.cream },
              headerTintColor: SankalpamColors.saffron,
              headerShadowVisible: false,
            }}
          />
        </Stack>
      </BookingProvider>
    </AuthProvider>
  );
}
