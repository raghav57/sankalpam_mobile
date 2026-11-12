import {
    GoogleSignin,
    isSuccessResponse,
} from "@react-native-google-signin/google-signin";

import { authApi, AuthSession } from "@/services/auth";
import { Platform } from "react-native";

let configured = false;

export async function signInWithGoogle(): Promise<AuthSession | null> {
  if (!configured) {
    const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

    if (!webClientId) {
      throw new Error("Google Web OAuth client ID is not configured.");
    }

    if (Platform.OS === "ios" && !iosClientId) {
      throw new Error("Google iOS OAuth client ID is not configured.");
    }

    GoogleSignin.configure({
      webClientId,
      ...(Platform.OS === "ios" ? { iosClientId } : {}),
    });

    configured = true;
  }

  if (Platform.OS === "android") {
    await GoogleSignin.hasPlayServices();
  }

  const response = await GoogleSignin.signIn();

  if (!isSuccessResponse(response)) {
    return null;
  }

  const idToken = response.data.idToken;

  if (!idToken) {
    throw new Error("Google did not return an ID token.");
  }

  return authApi.google(idToken);
}
