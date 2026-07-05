const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Each "service" answers in ~700ms — that's the contractual SLA. */
const SERVICE_LATENCY = 700;

export interface Flight {
  code: string;
  route: string;
  status: string;
}

export async function getFlights(): Promise<Flight[]> {
  await delay(SERVICE_LATENCY);
  return [
    { code: 'DW114', route: 'Driftwood → Kestrel City', status: 'On time' },
    { code: 'DW207', route: 'Driftwood → North Sound', status: 'Boarding' },
  ];
}

export interface Hotel {
  name: string;
  district: string;
  nightly: number;
}

export async function getHotels(): Promise<Hotel[]> {
  await delay(SERVICE_LATENCY);
  return [
    { name: 'The Quayside', district: 'Old Harbor', nightly: 140 },
    { name: 'Hotel Meridian', district: 'Signal Hill', nightly: 185 },
  ];
}

export interface Weather {
  summary: string;
  highC: number;
  lowC: number;
}

export async function getWeather(): Promise<Weather> {
  await delay(SERVICE_LATENCY);
  return { summary: 'Fog until noon, then defiantly sunny', highC: 17, lowC: 9 };
}
