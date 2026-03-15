"use client";

import React, { useState } from "react";

export type StationStatus = "Operational" | "Maintenance";
export type ConnectorType = "CCS" | "Type 2" | "CHAdeMO" | "GB/T";

export type StationForm = {
  stationName: string;
  locationAddress: string;
  pinCode: string;
  connectorType: ConnectorType;
  status: StationStatus;
  image: string;
  locationLink: string;
};

export const CONNECTOR_OPTIONS: ConnectorType[] = ["CCS", "Type 2", "CHAdeMO", "GB/T"];
export const STATUS_OPTIONS: StationStatus[] = ["Operational", "Maintenance"];
export const EMPTY_FORM: StationForm = {
  stationName: "",
  locationAddress: "",
  pinCode: "",
  connectorType: "CCS",
  status: "Operational",
  image: "",
  locationLink: "",
};

type AdminPanelProps = {
  adminKey: string;
  setAdminKey: (key: string) => void;
  isAdmin: boolean;
  editingId: number | null;
  setEditingId: (id: number | null) => void;
  form: StationForm;
  setForm: (form: StationForm) => void;
  error: string;
  setError: (msg: string) => void;
  success: string;
  setSuccess: (msg: string) => void;
  fetchStations: () => Promise<void>;
};

const AdminPanel = ({
  adminKey, setAdminKey, isAdmin,
  editingId, setEditingId,
  form, setForm,
  error, setError,
  success, setSuccess,
  fetchStations,
}: AdminPanelProps) => {
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
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
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
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

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
  }

  function field(key: keyof StationForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: e.target.value });
  }

  return (
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
          <input className="text-input" value={form.stationName} onChange={field("stationName")} placeholder="e.g. Central EV Hub" required />
        </label>
        <label className="field-wrap">
          <span>Location Address *</span>
          <input className="text-input" value={form.locationAddress} onChange={field("locationAddress")} placeholder="e.g. 42 MG Road, Bangalore" required />
        </label>
        <label className="field-wrap">
          <span>Pin Code *</span>
          <input className="text-input" value={form.pinCode} onChange={field("pinCode")} placeholder="e.g. 560001" required />
        </label>
        <label className="field-wrap">
          <span>Connector Type *</span>
          <select className="text-input" value={form.connectorType} onChange={field("connectorType")}>
            {CONNECTOR_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
        <label className="field-wrap">
          <span>Status *</span>
          <select className="text-input" value={form.status} onChange={field("status")}>
            {STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
        <label className="field-wrap">
          <span>Image URL (optional)</span>
          <input className="text-input" type="url" value={form.image} onChange={field("image")} placeholder="https://example.com/station.jpg" />
        </label>
        <label className="field-wrap">
          <span>Location Link (Google Maps) *</span>
          <input className="text-input" type="url" value={form.locationLink} onChange={field("locationLink")} placeholder="https://maps.google.com/..." required />
        </label>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={submitting || !isAdmin}>
            {submitting ? "Saving…" : editingId ? "Update Station" : "Create Station"}
          </button>
          {editingId ? (
            <button className="btn btn-secondary" type="button" onClick={cancelEdit}>
              Cancel Edit
            </button>
          ) : null}
        </div>
      </form>

      {error   ? <p className="flash flash-error">{error}</p>   : null}
      {success ? <p className="flash flash-success">{success}</p> : null}
    </section>
  );
};

export default AdminPanel;
