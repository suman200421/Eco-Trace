import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

let isConfigured = false;

export function configureGoogleSignIn() {
  if (isConfigured) {
    return true;
  }

  if (!GOOGLE_WEB_CLIENT_ID) {
    if (__DEV__) {
      console.warn(
        "Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID. Google Sign-In is not configured."
      );
    }
    return false;
  }

  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });

  isConfigured = true;
  return true;
}

export async function signOutFromGoogle() {
  if (!configureGoogleSignIn()) {
    return;
  }

  try {
    if (!GoogleSignin.hasPreviousSignIn() && !GoogleSignin.getCurrentUser()) {
      return;
    }

    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
  } catch (error) {
    if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_REQUIRED) {
      return;
    }

    throw error;
  }
}
