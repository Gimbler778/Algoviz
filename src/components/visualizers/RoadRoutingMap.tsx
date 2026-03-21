'use client';

import { useMemo, useState } from 'react';
import { MapContainer, Polyline, TileLayer, CircleMarker, useMapEvents } from 'react-leaflet';

type Engine = 'graphhopper' | 'osrm';
type Profile = 'car' | 'bike' | 'foot';

type LatLngPoint = {
  lat: number;
  lng: number;
};

interface RouteResponse {
  engine: Engine;
  profile: Profile;
  distanceMeters: number;
  durationSeconds: number;
  geometry: [number, number][];
}

function ClickHandler({ onPick }: { onPick: (point: LatLngPoint) => void }) {
  useMapEvents({
    click(event) {
      onPick({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return null;
}

export default function RoadRoutingMap() {
  const [engine, setEngine] = useState<Engine>('osrm');
  const [profile, setProfile] = useState<Profile>('car');
  const [start, setStart] = useState<LatLngPoint | null>(null);
  const [end, setEnd] = useState<LatLngPoint | null>(null);
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const center = useMemo(() => ({ lat: 20, lng: 0 }), []);

  const handleMapPick = (point: LatLngPoint) => {
    setError(null);

    if (!start) {
      setStart(point);
      return;
    }

    if (!end) {
      setEnd(point);
      return;
    }

    setStart(point);
    setEnd(null);
    setRoute(null);
  };

  const requestRoute = async () => {
    if (!start || !end) {
      setError('Pick a start and end point by clicking on the map.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, end, engine, profile }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to calculate route.');
      }

      setRoute(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unexpected route error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-white/15 bg-slate-900/55 p-1">
          {(['osrm', 'graphhopper'] as Engine[]).map((option) => (
            <button
              key={option}
              onClick={() => setEngine(option)}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                engine === option ? 'bg-cyan-500/25 text-cyan-100' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="inline-flex rounded-full border border-white/15 bg-slate-900/55 p-1">
          {(['car', 'bike', 'foot'] as Profile[]).map((option) => (
            <button
              key={option}
              onClick={() => setProfile(option)}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                profile === option ? 'bg-orange-500/25 text-orange-100' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <button className="btn btn-primary w-full sm:w-auto" onClick={requestRoute} disabled={loading}>
          {loading ? 'Routing...' : 'Calculate Route'}
        </button>

        <button
          className="btn btn-ghost w-full sm:w-auto"
          onClick={() => {
            setStart(null);
            setEnd(null);
            setRoute(null);
            setError(null);
          }}
        >
          Clear
        </button>
      </div>

      <p className="text-sm text-slate-300">
        Click once for start, click again for destination. Third click resets start point.
      </p>

      <div className="overflow-hidden rounded-xl border border-white/15">
        <MapContainer center={center} zoom={2} scrollWheelZoom className="h-[320px] w-full sm:h-[460px]">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickHandler onPick={handleMapPick} />

          {start && <CircleMarker center={[start.lat, start.lng]} radius={8} pathOptions={{ color: '#22d3ee' }} />}
          {end && <CircleMarker center={[end.lat, end.lng]} radius={8} pathOptions={{ color: '#fb923c' }} />}

          {route && route.geometry.length > 0 && (
            <Polyline positions={route.geometry} pathOptions={{ color: '#34d399', weight: 4 }} />
          )}
        </MapContainer>
      </div>

      {route && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/15 bg-slate-900/45 p-3 text-slate-200">
            <div className="text-xs text-slate-400">Engine</div>
            <div className="text-sm font-semibold uppercase">{route.engine}</div>
          </div>
          <div className="rounded-lg border border-white/15 bg-slate-900/45 p-3 text-slate-200">
            <div className="text-xs text-slate-400">Distance</div>
            <div className="text-sm font-semibold">{(route.distanceMeters / 1000).toFixed(2)} km</div>
          </div>
          <div className="rounded-lg border border-white/15 bg-slate-900/45 p-3 text-slate-200">
            <div className="text-xs text-slate-400">ETA</div>
            <div className="text-sm font-semibold">{Math.round(route.durationSeconds / 60)} min</div>
          </div>
        </div>
      )}

      {error && <div className="rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}
    </div>
  );
}
