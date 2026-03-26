'use client';

import { useEffect, useMemo, useState } from 'react';
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

function sampleGeometry(points: [number, number][], maxPoints = 24): [number, number][] {
  if (points.length <= maxPoints) {
    return points;
  }

  const result: [number, number][] = [];
  const step = Math.max(1, Math.floor((points.length - 1) / (maxPoints - 1)));

  for (let index = 0; index < points.length; index += step) {
    result.push(points[index]);
  }

  const last = points[points.length - 1];
  const hasLast = result.length > 0 && result[result.length - 1][0] === last[0] && result[result.length - 1][1] === last[1];
  if (!hasLast) {
    result.push(last);
  }

  return result;
}

function checkpointLabel(index: number, nodes: [number, number][]): string {
  const point = nodes[index];
  if (!point) {
    return `CP-${index + 1}`;
  }

  const [lat, lng] = point;
  return `CP-${index + 1} (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
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
  const [visualNodes, setVisualNodes] = useState<[number, number][]>([]);
  const [pendingQueue, setPendingQueue] = useState<number[]>([]);
  const [removedQueue, setRemovedQueue] = useState<number[]>([]);
  const [finalOrder, setFinalOrder] = useState<string[]>([]);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);

  const center = useMemo(() => ({ lat: 20, lng: 0 }), []);

  useEffect(() => {
    if (!playing) return;

    const timer = window.setInterval(() => {
      setPendingQueue((currentPending) => {
        if (currentPending.length === 0) {
          setPlaying(false);
          setCompleted(true);
          return currentPending;
        }

        const [nextNode, ...rest] = currentPending;
        setActiveNode(nextNode);
        setRemovedQueue((currentRemoved) => [...currentRemoved, nextNode]);
        setFinalOrder((currentOrder) => [...currentOrder, checkpointLabel(nextNode, visualNodes)]);

        if (rest.length === 0) {
          setPlaying(false);
          setCompleted(true);
        }

        return rest;
      });
    }, 420);

    return () => {
      window.clearInterval(timer);
    };
  }, [playing, visualNodes]);

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
    setVisualNodes([]);
    setPendingQueue([]);
    setRemovedQueue([]);
    setFinalOrder([]);
    setActiveNode(null);
    setPlaying(false);
    setCompleted(false);
  };

  const resetVisualizationState = () => {
    setVisualNodes([]);
    setPendingQueue([]);
    setRemovedQueue([]);
    setFinalOrder([]);
    setActiveNode(null);
    setPlaying(false);
    setCompleted(false);
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

      const sampled = sampleGeometry(payload.geometry, 26);
      const queued = sampled.map((_, index) => index);
      setVisualNodes(sampled);
      setPendingQueue(queued);
      setRemovedQueue([]);
      setFinalOrder([]);
      setActiveNode(null);
      setCompleted(false);
      setPlaying(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unexpected route error');
    } finally {
      setLoading(false);
    }
  };

  const visitedPath = removedQueue
    .map((index) => visualNodes[index])
    .filter((point): point is [number, number] => Boolean(point));

  const pendingPath = pendingQueue
    .map((index) => visualNodes[index])
    .filter((point): point is [number, number] => Boolean(point));

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
          className="btn btn-secondary w-full sm:w-auto"
          onClick={() => setPlaying((previous) => !previous)}
          disabled={visualNodes.length === 0 || completed}
        >
          {playing ? 'Pause Visual' : 'Play Visual'}
        </button>

        <button
          className="btn btn-secondary w-full sm:w-auto"
          onClick={() => {
            const queued = visualNodes.map((_, index) => index);
            setPendingQueue(queued);
            setRemovedQueue([]);
            setFinalOrder([]);
            setActiveNode(null);
            setCompleted(false);
            setPlaying(true);
          }}
          disabled={visualNodes.length === 0}
        >
          Restart Visual
        </button>

        <button
          className="btn btn-ghost w-full sm:w-auto"
          onClick={() => {
            setStart(null);
            setEnd(null);
            setRoute(null);
            setError(null);
            resetVisualizationState();
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
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <ClickHandler onPick={handleMapPick} />

          {start && <CircleMarker center={[start.lat, start.lng]} radius={8} pathOptions={{ color: '#22d3ee' }} />}
          {end && <CircleMarker center={[end.lat, end.lng]} radius={8} pathOptions={{ color: '#fb923c' }} />}

          {route && route.geometry.length > 0 && (
            <Polyline positions={route.geometry} pathOptions={{ color: '#34d399', weight: 3, opacity: 0.35 }} />
          )}

          {visitedPath.length > 1 && (
            <Polyline positions={visitedPath} pathOptions={{ color: '#ef4444', weight: 5, opacity: 0.9 }} />
          )}

          {pendingPath.length > 1 && (
            <Polyline positions={pendingPath} pathOptions={{ color: '#34d399', weight: 4, opacity: 0.9 }} />
          )}

          {activeNode !== null && visualNodes[activeNode] && (
            <CircleMarker center={visualNodes[activeNode]} radius={6} pathOptions={{ color: '#facc15', fillColor: '#facc15', fillOpacity: 0.9 }} />
          )}
        </MapContainer>
      </div>

      {visualNodes.length > 0 && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="rounded-lg border border-white/15 bg-slate-900/45 p-3 text-slate-200">
            <div className="text-xs text-slate-400">Visiting Queue</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {pendingQueue.length === 0 && <span className="text-sm text-slate-500">Empty</span>}
              {pendingQueue.map((index) => (
                <span
                  key={`pending-${index}`}
                  title={checkpointLabel(index, visualNodes)}
                  className="rounded-full border border-emerald-400/50 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-200"
                >
                  {`CP-${index + 1}`}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/15 bg-slate-900/45 p-3 text-slate-200">
            <div className="text-xs text-slate-400">Removed From Queue</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {removedQueue.length === 0 && <span className="text-sm text-slate-500">Empty</span>}
              {removedQueue.map((index) => (
                <span
                  key={`removed-${index}`}
                  title={checkpointLabel(index, visualNodes)}
                  className="rounded-full border border-rose-400/50 bg-rose-500/10 px-2 py-1 text-xs text-rose-200"
                >
                  {`CP-${index + 1}`}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/15 bg-slate-900/45 p-3 text-slate-200">
            <div className="text-xs text-slate-400">Final Visit Order</div>
            <div className="mt-2 text-sm text-cyan-200">
              {finalOrder.length === 0 ? '[]' : `[${finalOrder.join(', ')}]`}
            </div>
          </div>
        </div>
      )}

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
