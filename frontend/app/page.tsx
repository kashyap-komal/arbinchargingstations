"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
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

/* ─── Constants ──────────────────────────────────────────────────────────── */
const CONNECTOR_OPTIONS: ConnectorType[] = ["CCS", "Type 2", "CHAdeMO", "GB/T"];
const STATUS_OPTIONS: StationStatus[] = ["Operational", "Maintenance"];
const PUBLIC_ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY ?? "admin123";

const EMPTY_FORM: StationForm = {
  stationName: "",
  locationAddress: "",
  pinCode: "",
  connectorType: "CCS",
  status: "Operational",
  image: "",
  locationLink: "",
};

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function Home() {
  const [stations, setStations] = useState<Station[]>([]);
  const [form, setForm] = useState<StationForm>(EMPTY_FORM);
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
    () => stations.filter((s) => s.status === "Operational").length,
    [stations],
  );

  /* ── data fetching ────────────────────────────────────────────────────── */
  const fetchStations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stations", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { stations: Station[] };
      setStations(data.stations ?? []);
    } catch {
      setError("Unable to load charging station records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  /* ── 1-second live interval ───────────────────────────────────────────── */
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
      setSecondsOnPage((n) => n + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /* ── form submit (create / update) ───────────────────────────────────── */
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isAdmin) {
      setError("Admin key required to create or update stations.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/stations/${editingId}` : "/api/stations";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to save.");

      setForm(EMPTY_FORM);
      setEditingId(null);
      setSuccess(editingId ? "Station updated successfully." : "Station created successfully.");
      await fetchStations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save station.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ── delete ───────────────────────────────────────────────────────────── */
  async function handleDelete(id: number) {
    if (!isAdmin) {
      setError("Admin key required to delete stations.");
      return;
    }
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/stations/${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey },
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to delete.");
      setSuccess("Station deleted.");
      if (editingId === id) { setEditingId(null); setForm(EMPTY_FORM); }
      await fetchStations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete station.");
    }
  }

  /* ── start edit ───────────────────────────────────────────────────────── */
  function startEdit(s: Station) {
    setEditingId(s.id);
    setForm({
      stationName: s.stationName,
      locationAddress: s.locationAddress,
      pinCode: s.pinCode,
      connectorType: s.connectorType,
      status: s.status,
      image: s.image ?? "",
      locationLink: s.locationLink,
    });
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
  }

  function field(key: keyof StationForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  return (
    <>
      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <header className="top-header">
        <div className="header-logo">
          <div className="logo-mark">A</div>
          <span className="logo-text"><span>Arbin</span> ChargingStations</span>
        </div>
        <div className="header-admin">
          <div className="admin-info">
            <span className="admin-name">Komal Kumari</span>
            <span className="admin-role">Admin</span>
          </div>
          <div className="admin-avatar">KK</div>
        </div>
      </header>

      <main className="page-shell">
      {/* decorative background blobs */}
      <div className="ambient-orb ambient-one" aria-hidden="true" />
      <div className="ambient-orb ambient-two" aria-hidden="true" />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="hero">
        <p className="hero-kicker">Arbin ChargingStations</p>
        <h1>ChargingStation Manager</h1>
        <p className="hero-sub">
          Track station health, connector details, and live locations — all in one panel.
        </p>
      </section>

      {/* ── Stats Bar (1s refresh) ───────────────────────────────────────── */}
      <section className="stats-grid" aria-label="Live statistics">
        <article className="stat-tile">
          <span>Total Stations</span>
          <strong>{stations.length}</strong>
        </article>
        <article className="stat-tile">
          <span>Operational</span>
          <strong style={{ color: "var(--green)" }}>{operationalCount}</strong>
        </article>
        <article className="stat-tile">
          <span>In Maintenance</span>
          <strong style={{ color: "var(--red)" }}>
            {stations.length - operationalCount}
          </strong>
        </article>
        <article className="stat-tile">
          <span>Live Clock</span>
          <strong style={{ fontSize: "1.2rem" }}>{now.toLocaleTimeString()}</strong>
        </article>
        <article className="stat-tile">
          <span>Time on Page</span>
          <strong>{secondsOnPage}s</strong>
        </article>
      </section>

      {/* ── Admin Panel ──────────────────────────────────────────────────── */}
      <section className="admin-panel">
        <h2>{editingId ? `Editing Station #${editingId}` : "Add New Station"}</h2>
        <p>Provide your admin key to create, update, or delete station records.</p>

        {/* Admin key row */}
        <div className="key-row">
          <label className="field-wrap" style={{ flex: 1, maxWidth: 320 }}>
            <span>Admin Key</span>
            <input
              className="text-input"
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter admin key to unlock"
              autoComplete="current-password"
            />
          </label>
          <span className={`key-badge ${isAdmin ? "unlocked" : "locked"}`}>
            {isAdmin ? "✓ Admin Unlocked" : "🔒 Locked"}
          </span>
        </div>

        {/* Station form */}
        <form className="station-form" onSubmit={onSubmit}>
          <label className="field-wrap">
            <span>Station Name *</span>
            <input
              className="text-input"
              value={form.stationName}
              onChange={field("stationName")}
              placeholder="e.g. Central EV Hub"
              required
            />
          </label>

          <label className="field-wrap">
            <span>Location Address *</span>
            <input
              className="text-input"
              value={form.locationAddress}
              onChange={field("locationAddress")}
              placeholder="e.g. 42 MG Road, Bangalore"
              required
            />
          </label>

          <label className="field-wrap">
            <span>Pin Code *</span>
            <input
              className="text-input"
              value={form.pinCode}
              onChange={field("pinCode")}
              placeholder="e.g. 560001"
              required
            />
          </label>

          <label className="field-wrap">
            <span>Connector Type *</span>
            <select
              className="text-input"
              value={form.connectorType}
              onChange={field("connectorType")}
            >
              {CONNECTOR_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </label>

          <label className="field-wrap">
            <span>Status *</span>
            <select
              className="text-input"
              value={form.status}
              onChange={field("status")}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </label>

          <label className="field-wrap">
            <span>Image URL (optional)</span>
            <input
              className="text-input"
              type="url"
              value={form.image}
              onChange={field("image")}
              placeholder="https://example.com/station.jpg"
            />
          </label>

          <label className="field-wrap">
            <span>Location Link (Google Maps) *</span>
            <input
              className="text-input"
              type="url"
              value={form.locationLink}
              onChange={field("locationLink")}
              placeholder="https://maps.google.com/..."
              required
            />
          </label>

          <div className="form-actions">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={submitting || !isAdmin}
            >
              {submitting ? "Saving…" : editingId ? "Update Station" : "Create Station"}
            </button>
            {editingId ? (
              <button
                className="btn btn-secondary"
                type="button"
                onClick={cancelEdit}
              >
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>

        {error   ? <p className="flash flash-error">{error}</p>   : null}
        {success ? <p className="flash flash-success">{success}</p> : null}
      </section>

      {/* ── Station Cards ────────────────────────────────────────────────── */}
      <section className="cards-section">
        <div className="cards-header">
          <h2>All Charging Stations</h2>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={fetchStations}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
        </div>

        {!loading && stations.length === 0 ? (
          <p className="empty-state">
            No stations yet. Use the form above to create your first record.
          </p>
        ) : null}

        <div className="station-grid">
          {stations.map((s) => (
            <article className="station-card" key={s.id}>
              {/* Card header */}
              <header className="card-top">
                <h3>{s.stationName}</h3>
                <span
                  className={`status-pill status-${s.status.toLowerCase()}`}
                >
                  <span className="dot" />
                  {s.status}
                </span>
              </header>

              {/* Optional image */}
              {s.image ? (
                <img
                  className="station-image"
                  src={s.image}
                  alt={s.stationName}
                  loading="lazy"
                />
              ) : null}

              {/* Details */}
              <p>
                <strong>Address:</strong> {s.locationAddress}
              </p>
              <p>
                <strong>Pin Code:</strong> {s.pinCode}
              </p>

              <div className="card-meta">
                <span className="meta-tag">⚡ {s.connectorType}</span>
                <a
                  className="meta-tag"
                  href={s.locationLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "var(--accent)", borderColor: "rgba(108,99,255,0.3)" }}
                >
                  📍 Open in Maps
                </a>
              </div>

              <p className="card-timestamps">
                Created: {new Date(s.createdAt).toLocaleString()} &nbsp;|&nbsp;
                Updated: {new Date(s.updatedAt).toLocaleString()}
              </p>

              {/* Admin actions */}
              {isAdmin ? (
                <div className="card-actions">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => startEdit(s)}
                  >
                    ✏ Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={() => handleDelete(s.id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
    </>
  );
}
