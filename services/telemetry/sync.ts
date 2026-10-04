import { MlPredictionResult, PersistedRecord, RawSensorFeatures } from "@/services/telemetry/types";
import { API_BASE_URL, getSession } from "@/lib/auth";

export type SyncPayload = {
  items: PersistedRecord[];
};

/**
 * Sends a single 2-minute aggregated window of 13 sensor statistics to the authenticated EcoTrace Backend.
 * Called EXACTLY ONCE every completed 2-minute inference window.
 */
export const sendMlWindowPrediction = async (
  windowId: string,
  windowIndex: number,
  durationMs: number,
  features: RawSensorFeatures
): Promise<MlPredictionResult | null> => {
  const session = await getSession();
  const token = session?.accessToken;

  const url = `${API_BASE_URL}/api/stats/predict`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        windowId,
        windowIndex,
        durationMs,
        features,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.warn(`ML Window Prediction Failed (${response.status}):`, errText);
      return null;
    }

    const data: MlPredictionResult = await response.json();
    return data;
  } catch (err) {
    console.error("sendMlWindowPrediction Network Error:", err);
    return null;
  }
};

export const syncBatchToBackend = async (payload: SyncPayload): Promise<boolean> => {
  if (payload.items.length === 0) return true;

  const session = await getSession();
  const token = session?.accessToken;

  // Convert telemetry records to the format expected by /api/stats/batch
  const records = payload.items.map((it) => ({
    timestamp: it.timestamp,
    lat: it.latitude ?? 22.57,
    lng: it.longitude ?? 88.36,
    distance_km: (it.distance_5s ?? 0) / 1000,
    vehicle_type: it.vehicle_type || "car",
  }));

  const url = `${API_BASE_URL}/api/stats/batch`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ records }),
    });
    return response.ok;
  } catch {
    return false;
  }
};

