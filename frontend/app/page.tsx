"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./Header";
import StatsBar from "./StatsBar";
import AdminPanel, { StationForm, EMPTY_FORM } from "./AdminPanel";
import StationCard, { Station } from "./StationCard";

/* ─── Types */
type StationStatus = "Operational" | "Maintenance";
type ConnectorType = "CCS" | "Type 2" | "CHAdeMO" | "GB/T";

// StationForm, EMPTY_FORM imported from AdminPanel
// Station type imported from StationCard

/*Constants */
const PUBLIC_ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY ?? "admin123";

/*Page */
export default function Home() {
  const [stations, setStations] = useState<Station[]>([]);
  const [form, setForm] = useState<StationForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [now, setNow] = useState(new Date());
  const [secondsOnPage, setSecondsOnPage] = useState(0);

  const isAdmin = adminKey === PUBLIC_ADMIN_KEY;

  const operationalCount = useMemo(
    () => stations.filter((s) => s.status === "Operational").length,
    [stations],
  );

  /* data fetching */
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

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
      setSecondsOnPage((n) => n + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  return (
    <>
      {/*Sticky Header */}
      <Header />
      <main className="page-shell">
      {/* decorative background blobs */}
      <div className="ambient-orb ambient-one" aria-hidden="true" />
      <div className="ambient-orb ambient-two" aria-hidden="true" />

      <section className="hero">
        <p className="hero-kicker">Arbin ChargingStations</p>
        <h1>ChargingStation Manager</h1>
        <p className="hero-sub">
          Track station health, connector details, and live locations — all in one panel.
        </p>
      </section>

      {/* Stats Bar (1s refresh)  */}
      <StatsBar
        totalStations={stations.length}
        operationalCount={operationalCount}
        secondsOnPage={secondsOnPage}
      />

      {/*Admin Panel */}
      <AdminPanel
        adminKey={adminKey}
        setAdminKey={setAdminKey}
        isAdmin={isAdmin}
        editingId={editingId}
        setEditingId={setEditingId}
        form={form}
        setForm={setForm}
        error={error}
        setError={setError}
        success={success}
        setSuccess={setSuccess}
        fetchStations={fetchStations}
      />

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
            <StationCard
              key={s.id}
              station={s}
              isAdmin={isAdmin}
              onEdit={startEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </section>
    </main>
    </>
  );
}
