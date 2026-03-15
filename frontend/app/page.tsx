"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type StationStatus = "Operational" | "Maintenance";
type ConnectorType = "CCS" | "Type 2" | "CHAdeMO" | "GB/T";

type Station = {
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

type StationForm = {
  stationName: string;
  locationAddress: string;
  pinCode: string;
  connectorType: ConnectorType;
  status: StationStatus;
  image: string;
  locationLink: string;
};

const CONNECTOR_OPTIONS: ConnectorType[] = ["CCS", "Type 2", "CHAdeMO", "GB/T"];
const STATUS_OPTIONS: StationStatus[] = ["Operational", "Maintenance"];
const PUBLIC_ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY ?? "admin123";

const INITIAL_FORM: StationForm = {
  stationName: "",
  locationAddress: "",
  pinCode: "",
  connectorType: "CCS",
  status: "Operational",
  image: "",
  locationLink: "",
};

export default function Home() {
  const [stations, setStations] = useState<Station[]>([]);
  const [form, setForm] = useState<StationForm>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [now, setNow] = useState(new Date());
  const [secondsOnPage, setSecondsOnPage] = useState(0);

  const isAdmin = adminKey === PUBLIC_ADMIN_KEY;

  const operationalCount = useMemo(
    () => stations.filter((station) => station.status === "Operational").length,
    [stations],
  );

  const fetchStations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/stations", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Could not load stations.");
      }

      const payload = (await response.json()) as { stations: Station[] };
      setStations(payload.stations ?? []);
    } catch {
      setError("Unable to load charging station records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
      setSecondsOnPage((current) => current + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAdmin) {
      setError("Admin key is required to create or update stations.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    const method = editingId ? "PUT" : "POST";
    const endpoint = editingId ? `/api/stations/${editingId}` : "/api/stations";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save station.");
      }

      setForm(INITIAL_FORM);
      setEditingId(null);
      setSuccess(editingId ? "Station updated." : "Station created.");
      await fetchStations();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Failed to save station.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!isAdmin) {
      setError("Admin key is required to delete stations.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/stations/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-key": adminKey,
        },
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to delete station.");
      }

      setSuccess("Station deleted.");
      if (editingId === id) {
        setEditingId(null);
        setForm(INITIAL_FORM);
      }
      await fetchStations();
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Failed to delete station.";
      setError(message);
    }
  }

  function startEdit(station: Station) {
    setEditingId(station.id);
    setForm({
      stationName: station.stationName,
      locationAddress: station.locationAddress,
      pinCode: station.pinCode,
      connectorType: station.connectorType,
      status: station.status,
      image: station.image ?? "",
      locationLink: station.locationLink,
    });
    setSuccess("");
    setError("");
  }

  return (
    <main className="page-shell">
      <div className="ambient-orb ambient-one" aria-hidden="true" />
      <div className="ambient-orb ambient-two" aria-hidden="true" />

      <section className="hero">
        <p className="hero-kicker">ChargingStation Records</p>
        <h1>Station Control Dashboard</h1>
        <p className="hero-sub">Track station health, location links, and connector details in one live panel.</p>
      </section>

      <section className="stats-grid">
        <article className="stat-tile">
          <span>Total Stations</span>
          <strong>{stations.length}</strong>
        </article>
        <article className="stat-tile">
          <span>Operational Now</span>
          <strong>{operationalCount}</strong>
        </article>
        <article className="stat-tile">
          <span>Live Time (1s refresh)</span>
          <strong>{now.toLocaleTimeString()}</strong>
        </article>
        <article className="stat-tile">
          <span>Seconds On Page</span>
          <strong>{secondsOnPage}</strong>
        </article>
      </section>

      <section className="admin-panel">
        <h2>{editingId ? "Update Station" : "Add Station"}</h2>
        <p>Only admins can create, update, or delete records.</p>

        <label className="field-wrap">
          <span>Admin Key</span>
          <input
            className="text-input"
            type="password"
            value={adminKey}
            onChange={(event) => setAdminKey(event.target.value)}
            placeholder="Enter admin key"
          />
        </label>

        <form className="station-form" onSubmit={onSubmit}>
          <label className="field-wrap">
            <span>Station Name</span>
            <input
              className="text-input"
              value={form.stationName}
              onChange={(event) => setForm((current) => ({ ...current, stationName: event.target.value }))}
              required
            />
          </label>

          <label className="field-wrap">
            <span>Location Address</span>
            <input
              className="text-input"
              value={form.locationAddress}
              onChange={(event) => setForm((current) => ({ ...current, locationAddress: event.target.value }))}
              required
            />
          </label>

          <label className="field-wrap">
            <span>Pin Code</span>
            <input
              className="text-input"
              value={form.pinCode}
              onChange={(event) => setForm((current) => ({ ...current, pinCode: event.target.value }))}
              required
            />
          </label>

          <label className="field-wrap">
            <span>Connector Type</span>
            <select
              className="text-input"
              value={form.connectorType}
              onChange={(event) =>
                setForm((current) => ({ ...current, connectorType: event.target.value as ConnectorType }))
              }
            >
              {CONNECTOR_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field-wrap">
            <span>Status</span>
            <select
              className="text-input"
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({ ...current, status: event.target.value as StationStatus }))
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field-wrap">
            <span>Image URL</span>
            <input
              className="text-input"
              type="url"
              value={form.image}
              onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
              placeholder="https://example.com/station.jpg"
            />
          </label>

          <label className="field-wrap">
            <span>Location Link</span>
            <input
              className="text-input"
              type="url"
              value={form.locationLink}
              onChange={(event) => setForm((current) => ({ ...current, locationLink: event.target.value }))}
              placeholder="https://maps.google.com/..."
              required
            />
          </label>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={submitting || !isAdmin}>
              {submitting ? "Saving..." : editingId ? "Update Station" : "Create Station"}
            </button>
            {editingId ? (
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(INITIAL_FORM);
                }}
              >
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>

        {error ? <p className="flash flash-error">{error}</p> : null}
        {success ? <p className="flash flash-success">{success}</p> : null}
      </section>

      <section className="cards-section">
        <div className="cards-header">
          <h2>All Charging Stations</h2>
          <button className="btn btn-secondary" onClick={fetchStations} disabled={loading} type="button">
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {stations.length === 0 ? <p className="empty-state">No stations yet. Create your first record.</p> : null}

        <div className="station-grid">
          {stations.map((station) => (
            <article className="station-card" key={station.id}>
              <header className="card-top">
                <h3>{station.stationName}</h3>
                <span className={`status-pill status-${station.status.toLowerCase()}`}>
                  <span className="dot" />
                  {station.status}
                </span>
              </header>

              {station.image ? (
                <img className="station-image" src={station.image} alt={station.stationName} loading="lazy" />
              ) : null}

              <p>
                <strong>Address:</strong> {station.locationAddress} ({station.pinCode})
              </p>
              <p>
                <strong>Connector:</strong> {station.connectorType}
              </p>
              <p>
                <strong>Location Link:</strong>{" "}
                <a href={station.locationLink} target="_blank" rel="noreferrer">
                  Open in Maps
                </a>
              </p>

              {isAdmin ? (
                <div className="card-actions">
                  <button className="btn btn-secondary" type="button" onClick={() => startEdit(station)}>
                    Edit
                  </button>
                  <button className="btn btn-danger" type="button" onClick={() => handleDelete(station.id)}>
                    Delete
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
