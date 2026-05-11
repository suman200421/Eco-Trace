import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import googleServices from "../google-services.json";

type GoogleServicesClient = {
  oauth_client?: {
    client_id?: string;
    client_type?: number;
  }[];
};

type GoogleServicesConfig = {
  client?: GoogleServicesClient[];
};

function getFirebaseWebClientId() {
  const config = googleServices as GoogleServicesConfig;

  for (const client of config.client ?? []) {
    const webClient = client.oauth_client?.find(
      (oauthClient) => oauthClient.client_type === 3 && oauthClient.client_id
    );

    if (webClient?.client_id) {
      return webClient.client_id;
    }
  }

  return undefined;
}

const GOOGLE_WEB_CLIENT_ID = getFirebaseWebClientId();

let isConfigured = false;

export function configureGoogleSignIn() {
  if (isConfigured) {
    return true;
  }

  if (!GOOGLE_WEB_CLIENT_ID) {
    if (__DEV__) {
      console.warn(
        "Missing Firebase Web client ID in google-services.json. Google Sign-In is not configured."
      );
    }
    return false;
  }

  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
    // forceCodeForRefreshToken: true,
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
