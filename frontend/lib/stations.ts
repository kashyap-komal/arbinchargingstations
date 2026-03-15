import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

export const STATION_STATUSES = ["Operational", "Maintenance"] as const;
export const CONNECTOR_TYPES = ["CCS", "Type 2", "CHAdeMO", "GB/T"] as const;

export type StationStatus = (typeof STATION_STATUSES)[number];
export type ConnectorType = (typeof CONNECTOR_TYPES)[number];

export type Station = {
  id: number;
  stationName: string;
  locationAddress: string;
  pinCode: string;
  connectorType: ConnectorType;
  status: StationStatus;
  image: string | null;
  locationLink: string;
  createdAt: string;
  updatedAt: string;
};

export type StationInput = {
  stationName: string;
  locationAddress: string;
  pinCode: string;
  connectorType: ConnectorType;
  status: StationStatus;
  image?: string;
  locationLink: string;
};

function getDb() {
  const globalWithDb = globalThis as typeof globalThis & {
    __stationsDb?: Database.Database;
  };

  if (globalWithDb.__stationsDb) {
    return globalWithDb.__stationsDb;
  }

  const dataDir = path.join(process.cwd(), "data");
  mkdirSync(dataDir, { recursive: true });

  const dbPath = path.join(dataDir, "charging-stations.db");
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS charging_stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_name TEXT NOT NULL,
      location_address TEXT NOT NULL,
      pin_code TEXT NOT NULL,
      connector_type TEXT NOT NULL,
      status TEXT NOT NULL,
      image TEXT,
      location_link TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  globalWithDb.__stationsDb = db;
  return db;
}

function mapRow(row: Record<string, unknown>): Station {
  return {
    id: Number(row.id),
    stationName: String(row.station_name),
    locationAddress: String(row.location_address),
    pinCode: String(row.pin_code),
    connectorType: row.connector_type as ConnectorType,
    status: row.status as StationStatus,
    image: row.image ? String(row.image) : null,
    locationLink: String(row.location_link),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function getAllStations(): Station[] {
  const db = getDb();
  const rows = db
    .prepare(
      `
      SELECT id, station_name, location_address, pin_code, connector_type, status, image, location_link, created_at, updated_at
      FROM charging_stations
      ORDER BY datetime(updated_at) DESC
      `,
    )
    .all() as Record<string, unknown>[];

  return rows.map(mapRow);
}

export function getStationById(id: number): Station | null {
  const db = getDb();
  const row = db
    .prepare(
      `
      SELECT id, station_name, location_address, pin_code, connector_type, status, image, location_link, created_at, updated_at
      FROM charging_stations
      WHERE id = ?
      `,
    )
    .get(id) as Record<string, unknown> | undefined;

  return row ? mapRow(row) : null;
}

export function createStation(input: StationInput): Station {
  const db = getDb();
  const result = db
    .prepare(
      `
      INSERT INTO charging_stations
      (station_name, location_address, pin_code, connector_type, status, image, location_link, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `,
    )
    .run(
      input.stationName,
      input.locationAddress,
      input.pinCode,
      input.connectorType,
      input.status,
      input.image?.trim() ? input.image.trim() : null,
      input.locationLink,
    );

  return getStationById(Number(result.lastInsertRowid)) as Station;
}

export function updateStation(id: number, input: StationInput): Station | null {
  const db = getDb();
  const result = db
    .prepare(
      `
      UPDATE charging_stations
      SET station_name = ?,
          location_address = ?,
          pin_code = ?,
          connector_type = ?,
          status = ?,
          image = ?,
          location_link = ?,
          updated_at = datetime('now')
      WHERE id = ?
      `,
    )
    .run(
      input.stationName,
      input.locationAddress,
      input.pinCode,
      input.connectorType,
      input.status,
      input.image?.trim() ? input.image.trim() : null,
      input.locationLink,
      id,
    );

  if (result.changes === 0) {
    return null;
  }

  return getStationById(id);
}

export function deleteStation(id: number): boolean {
  const db = getDb();
  const result = db
    .prepare(
      `
      DELETE FROM charging_stations
      WHERE id = ?
      `,
    )
    .run(id);

  return result.changes > 0;
}
