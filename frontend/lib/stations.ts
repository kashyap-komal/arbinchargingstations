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
  const g = globalThis as typeof globalThis & {
    __stationsDb?: Database.Database;
  };

  if (g.__stationsDb) return g.__stationsDb;

  const dataDir = path.join(process.cwd(), "data");
  mkdirSync(dataDir, { recursive: true });

  const db = new Database(path.join(dataDir, "charging-stations.db"));
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS charging_stations (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      station_name    TEXT    NOT NULL,
      location_address TEXT   NOT NULL,
      pin_code        TEXT    NOT NULL,
      connector_type  TEXT    NOT NULL,
      status          TEXT    NOT NULL,
      image           TEXT,
      location_link   TEXT    NOT NULL,
      created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);

  g.__stationsDb = db;
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
  const rows = getDb()
    .prepare(
      `SELECT * FROM charging_stations ORDER BY datetime(updated_at) DESC`,
    )
    .all() as Record<string, unknown>[];
  return rows.map(mapRow);
}

export function getStationById(id: number): Station | null {
  const row = getDb()
    .prepare(`SELECT * FROM charging_stations WHERE id = ?`)
    .get(id) as Record<string, unknown> | undefined;
  return row ? mapRow(row) : null;
}

export function createStation(input: StationInput): Station {
  const result = getDb()
    .prepare(
      `INSERT INTO charging_stations
         (station_name, location_address, pin_code, connector_type, status, image, location_link)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.stationName,
      input.locationAddress,
      input.pinCode,
      input.connectorType,
      input.status,
      input.image || null,
      input.locationLink,
    );
  return getStationById(Number(result.lastInsertRowid))!;
}

export function updateStation(id: number, input: StationInput): Station | null {
  const result = getDb()
    .prepare(
      `UPDATE charging_stations
       SET station_name = ?, location_address = ?, pin_code = ?,
           connector_type = ?, status = ?, image = ?, location_link = ?,
           updated_at = datetime('now')
       WHERE id = ?`,
    )
    .run(
      input.stationName,
      input.locationAddress,
      input.pinCode,
      input.connectorType,
      input.status,
      input.image || null,
      input.locationLink,
      id,
    );
  return result.changes > 0 ? getStationById(id) : null;
}

export function deleteStation(id: number): boolean {
  const result = getDb()
    .prepare(`DELETE FROM charging_stations WHERE id = ?`)
    .run(id);
  return result.changes > 0;
}
