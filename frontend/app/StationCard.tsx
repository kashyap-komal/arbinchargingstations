 'use client'
import React from 'react';

export type StationStatus = "Operational" | "Maintenance";
export type ConnectorType = "CCS" | "Type 2" | "CHAdeMO" | "GB/T";

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

type StationCardProps = {
  station: Station;
  isAdmin: boolean;
  onEdit: (station: Station) => void;
  onDelete: (id: number) => void;
};

const StationCard = ({ station: s, isAdmin, onEdit, onDelete }: StationCardProps) => {
  return (
    <article className="station-card">
      {/* Card header */}
      <header className="card-top">
        <h3>{s.stationName}</h3>
        <span className={`status-pill status-${s.status.toLowerCase()}`}>
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
      <p><strong>Address:</strong> {s.locationAddress}</p>
      <p><strong>Pin Code:</strong> {s.pinCode}</p>

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
          <button className="btn btn-secondary" type="button" onClick={() => onEdit(s)}>
            ✏ Edit
          </button>
          <button className="btn btn-danger" type="button" onClick={() => onDelete(s.id)}>
            🗑 Delete
          </button>
        </div>
      ) : null}
    </article>
  );
};

export default StationCard;
