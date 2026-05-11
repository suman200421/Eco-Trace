import * as SQLite from "expo-sqlite";

import { PersistedRecord } from "@/services/telemetry/types";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const getDb = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("telemetry.db");
  }
  return dbPromise;
};

export const initTelemetryStorage = async (): Promise<void> => {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS telemetry_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      latitude REAL,
      longitude REAL,
      distance_5s REAL NOT NULL,
      state TEXT NOT NULL,
      vehicle_type TEXT,
      confidence REAL,
      synced INTEGER NOT NULL DEFAULT 0
    );
  `);
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_telemetry_unsynced
    ON telemetry_records(synced, vehicle_type, confidence);
  `);
};

export const insertTelemetryRecord = async (record: PersistedRecord): Promise<void> => {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO telemetry_records
      (timestamp, latitude, longitude, distance_5s, state, vehicle_type, confidence, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.timestamp,
      record.latitude,
      record.longitude,
      record.distance_5s,
      record.state,
      record.vehicle_type,
      record.confidence,
      record.synced,
    ]
  );
};

export const fetchUnsyncedRecords = async (
  limit: number,
  minConfidence: number
): Promise<PersistedRecord[]> => {
  const db = await getDb();
  return db.getAllAsync<PersistedRecord>(
    `SELECT *
     FROM telemetry_records
     WHERE synced = 0
       AND vehicle_type IS NOT NULL
       AND confidence >= ?
     ORDER BY id ASC
     LIMIT ?`,
    [minConfidence, limit]
  );
};

export const markRecordsSynced = async (ids: number[]): Promise<void> => {
  if (ids.length === 0) return;
  const db = await getDb();
  const placeholders = ids.map(() => "?").join(",");
  await db.runAsync(`UPDATE telemetry_records SET synced = 1 WHERE id IN (${placeholders})`, ids);
};
