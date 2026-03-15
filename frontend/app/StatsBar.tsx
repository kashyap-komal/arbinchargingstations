 'use client'
import React from 'react'

type StatsBarProps = {
  totalStations: number;
  operationalCount: number;
  secondsOnPage: number;
};

const StatsBar = ({ totalStations, operationalCount, secondsOnPage }: StatsBarProps) => {
  return (
    <section className="stats-grid" aria-label="Live statistics">
      <article className="stat-tile">
        <span>Total Stations</span>
        <strong>{totalStations}</strong>
      </article>
      <article className="stat-tile">
        <span>Operational</span>
        <strong style={{ color: "var(--green)" }}>{operationalCount}</strong>
      </article>
      <article className="stat-tile">
        <span>In Maintenance</span>
        <strong style={{ color: "var(--red)" }}>{totalStations - operationalCount}</strong>
      </article>
      <article className="stat-tile">
        <span>Time on Page</span>
        <strong>{secondsOnPage}s</strong>
      </article>
    </section>
  )
}

export default StatsBar
