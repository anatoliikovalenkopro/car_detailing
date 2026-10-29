"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import { HQ } from "@/lib/brand";

type Pt = { lat: number; lng: number };

const pin = (emoji: string, color: string, pulse = false) =>
  L.divIcon({
    className: "",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    html: `<div style="position:relative;width:44px;height:44px;display:grid;place-items:center">
      ${pulse ? `<span style="position:absolute;inset:0;border-radius:9999px;background:${color};opacity:.35;animation:ngping 1.6s cubic-bezier(0,0,.2,1) infinite"></span>` : ""}
      <span style="position:relative;width:34px;height:34px;border-radius:9999px;background:${color};display:grid;place-items:center;font-size:18px;border:3px solid #fff;box-shadow:0 2px 10px rgb(0 0 0 / .25)">${emoji}</span>
    </div><style>@keyframes ngping{75%,100%{transform:scale(1.8);opacity:0}}</style>`,
  });

const homeIcon = pin("🏠", "#0f172a");
const vanIcon = pin("🚗", "#1d4ed8", true);

function FitBounds({ points }: { points: Pt[] }) {
  const map = useMap();
  const key = points.map((p) => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`).join("|");
  useEffect(() => {
    if (points.length === 1) map.setView(points[0], 14);
    else if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [60, 60], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

export default function LiveMap({ customer, tech, className = "" }: { customer?: Pt | null; tech?: Pt | null; className?: string }) {
  const points = [customer, tech].filter((p): p is Pt => Boolean(p));
  return (
    <MapContainer center={points[0] ?? HQ} zoom={12} scrollWheelZoom={false} className={className}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {customer && <Marker position={customer} icon={homeIcon} />}
      {tech && <Marker position={tech} icon={vanIcon} />}
      {customer && tech && <Polyline positions={[tech, customer]} pathOptions={{ color: "#1d4ed8", dashArray: "6 8", weight: 3 }} />}
      <FitBounds points={points} />
    </MapContainer>
  );
}
