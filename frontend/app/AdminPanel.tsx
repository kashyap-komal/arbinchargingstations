"use client";

import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

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

  return (
    <section className="admin-panel">
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
        {editingId ? `Editing Station #${editingId}` : "Add New Station"}
      </Typography>
      <Typography sx={{ mb: 2, color: "rgba(255,255,255,0.7)" }}>
        Provide your admin key to create, update, or delete station records.
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2, alignItems: { md: "center" } }}>
        <TextField
          label="Admin Key"
          type="password"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          placeholder="Enter admin key to unlock"
          autoComplete="current-password"
          fullWidth
          sx={{ maxWidth: { md: 360 } }}
        />
        <Chip
          label={isAdmin ? "Admin Unlocked" : "Locked"}
          color={isAdmin ? "success" : "default"}
          variant={isAdmin ? "filled" : "outlined"}
        />
      </Stack>

      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(220px, 1fr))" },
          gap: 1.5,
        }}
      >
        <TextField
          label="Station Name"
          value={form.stationName}
          onChange={(e) => setForm({ ...form, stationName: e.target.value })}
          placeholder="e.g. Central EV Hub"
          required
          fullWidth
        />
        <TextField
          label="Location Address"
          value={form.locationAddress}
          onChange={(e) => setForm({ ...form, locationAddress: e.target.value })}
          placeholder="e.g. 42 MG Road, Bangalore"
          required
          fullWidth
        />
        <TextField
          label="Pin Code"
          value={form.pinCode}
          onChange={(e) => setForm({ ...form, pinCode: e.target.value })}
          placeholder="e.g. 560001"
          required
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel id="connector-type-label">Connector Type</InputLabel>
          <Select
            labelId="connector-type-label"
            label="Connector Type"
            value={form.connectorType}
            onChange={(e) => setForm({ ...form, connectorType: e.target.value as ConnectorType })}
          >
            {CONNECTOR_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as StationStatus })}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Image URL (optional)"
          type="url"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          placeholder="https://example.com/station.jpg"
          fullWidth
        />
        <TextField
          label="Location Link (Google Maps)"
          type="url"
          value={form.locationLink}
          onChange={(e) => setForm({ ...form, locationLink: e.target.value })}
          placeholder="https://maps.google.com/..."
          required
          fullWidth
          sx={{ gridColumn: { md: "1 / -1" } }}
        />

        <Stack direction="row" spacing={1.2} sx={{ gridColumn: { md: "1 / -1" }, mt: 0.5 }}>
          <Button variant="contained" type="submit" disabled={submitting || !isAdmin}>
            {submitting ? "Saving..." : editingId ? "Update Station" : "Create Station"}
          </Button>
          {editingId ? (
            <Button variant="outlined" type="button" onClick={cancelEdit}>
              Cancel Edit
            </Button>
          ) : null}
        </Stack>
      </Box>

      <Stack spacing={1} sx={{ mt: 2 }}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {success ? <Alert severity="success">{success}</Alert> : null}
      </Stack>
    </section>
  );
};

export default AdminPanel;
