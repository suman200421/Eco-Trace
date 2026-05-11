import { PersistedRecord } from "@/services/telemetry/types";

export type SyncPayload = {
  items: PersistedRecord[];
};

const BACKEND_URL = "https://example.com/api/telemetry/batch";

export const syncBatchToBackend = async (payload: SyncPayload): Promise<boolean> => {
  if (payload.items.length === 0) return true;

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch {
    return false;
  }
};
