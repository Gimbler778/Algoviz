import { NextResponse } from 'next/server';

type Engine = 'graphhopper' | 'osrm';
type Profile = 'car' | 'bike' | 'foot';

type LatLngPoint = {
  lat: number;
  lng: number;
};

type Body = {
  start?: LatLngPoint;
  end?: LatLngPoint;
  engine?: Engine;
  profile?: Profile;
};

function profileToOsrm(profile: Profile): 'driving' | 'cycling' | 'walking' {
  if (profile === 'bike') return 'cycling';
  if (profile === 'foot') return 'walking';
  return 'driving';
}

function profileToGraphHopper(profile: Profile): 'car' | 'bike' | 'foot' {
  if (profile === 'bike') return 'bike';
  if (profile === 'foot') return 'foot';
  return 'car';
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;

    const start = body.start;
    const end = body.end;
    const engine: Engine = body.engine || 'osrm';
    const profile: Profile = body.profile || 'car';

    if (!start || !end) {
      return NextResponse.json({ error: 'Start and end points are required.' }, { status: 400 });
    }

    if (engine === 'graphhopper') {
      const key = process.env.GRAPHHOPPER_API_KEY;

      if (!key) {
        return NextResponse.json(
          { error: 'GRAPHHOPPER_API_KEY is missing. Add it to your environment variables.' },
          { status: 400 }
        );
      }

      const vehicle = profileToGraphHopper(profile);
      const url = new URL('https://graphhopper.com/api/1/route');
      url.searchParams.set('point', `${start.lat},${start.lng}`);
      url.searchParams.append('point', `${end.lat},${end.lng}`);
      url.searchParams.set('vehicle', vehicle);
      url.searchParams.set('calc_points', 'true');
      url.searchParams.set('points_encoded', 'false');
      url.searchParams.set('key', key);

      const response = await fetch(url.toString());
      const payload = await response.json();

      if (!response.ok || !payload.paths?.[0]) {
        return NextResponse.json(
          { error: payload.message || 'GraphHopper routing failed.' },
          { status: 502 }
        );
      }

      const path = payload.paths[0];
      const geometry = (path.points.coordinates as [number, number][]).map(([lng, lat]) => [lat, lng]);

      return NextResponse.json({
        engine,
        profile,
        distanceMeters: path.distance,
        durationSeconds: Math.round(path.time / 1000),
        geometry,
      });
    }

    const osrmProfile = profileToOsrm(profile);
    const coordinates = `${start.lng},${start.lat};${end.lng},${end.lat}`;
    const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${coordinates}?overview=full&geometries=geojson`;

    const response = await fetch(url);
    const payload = await response.json();

    if (!response.ok || !payload.routes?.[0]) {
      return NextResponse.json({ error: payload.message || 'OSRM routing failed.' }, { status: 502 });
    }

    const route = payload.routes[0];
    const geometry = (route.geometry.coordinates as [number, number][]).map(([lng, lat]) => [lat, lng]);

    return NextResponse.json({
      engine,
      profile,
      distanceMeters: route.distance,
      durationSeconds: Math.round(route.duration),
      geometry,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }
}
