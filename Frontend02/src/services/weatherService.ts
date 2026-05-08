/**
 * Weather data via Open-Meteo (https://open-meteo.com).
 *
 * Open-Meteo is free and key-less for personal/non-commercial use.
 * The WEATHER_API_KEY env var is optional and only consulted as a hint —
 * it isn't required for any of these endpoints.
 *
 * Flow:
 *   1. Geocode the farmer's location string  → { latitude, longitude, name }
 *   2. Fetch current + daily forecast       → temp, condition, high/low, etc.
 *   3. Fetch air quality (best-effort)      → european AQI, pm2.5, pm10
 */

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const OPEN_METEO_AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

// WMO weather interpretation codes — see https://open-meteo.com/en/docs
const WMO: Record<number, { text: string; emoji: string; nightEmoji?: string }> = {
  0:  { text: 'Clear',                       emoji: '☀️', nightEmoji: '🌙' },
  1:  { text: 'Mainly Clear',                emoji: '🌤️', nightEmoji: '🌙' },
  2:  { text: 'Partly Cloudy',               emoji: '⛅',  nightEmoji: '☁️' },
  3:  { text: 'Overcast',                    emoji: '☁️' },
  45: { text: 'Fog',                         emoji: '🌫️' },
  48: { text: 'Rime Fog',                    emoji: '🌫️' },
  51: { text: 'Light Drizzle',               emoji: '🌦️' },
  53: { text: 'Drizzle',                     emoji: '🌦️' },
  55: { text: 'Heavy Drizzle',               emoji: '🌧️' },
  56: { text: 'Freezing Drizzle',            emoji: '🌧️' },
  57: { text: 'Heavy Freezing Drizzle',      emoji: '🌧️' },
  61: { text: 'Light Rain',                  emoji: '🌦️' },
  63: { text: 'Rain',                        emoji: '🌧️' },
  65: { text: 'Heavy Rain',                  emoji: '🌧️' },
  66: { text: 'Freezing Rain',               emoji: '🌧️' },
  67: { text: 'Heavy Freezing Rain',         emoji: '🌧️' },
  71: { text: 'Light Snow',                  emoji: '🌨️' },
  73: { text: 'Snow',                        emoji: '🌨️' },
  75: { text: 'Heavy Snow',                  emoji: '❄️' },
  77: { text: 'Snow Grains',                 emoji: '❄️' },
  80: { text: 'Light Showers',               emoji: '🌦️' },
  81: { text: 'Showers',                     emoji: '🌧️' },
  82: { text: 'Violent Showers',             emoji: '⛈️' },
  85: { text: 'Light Snow Showers',          emoji: '🌨️' },
  86: { text: 'Heavy Snow Showers',          emoji: '🌨️' },
  95: { text: 'Thunderstorm',                emoji: '⛈️' },
  96: { text: 'Thunderstorm with Hail',      emoji: '⛈️' },
  99: { text: 'Thunderstorm with Heavy Hail',emoji: '⛈️' },
};

const describeCode = (code: number, isDay = true) => {
  const entry = WMO[code] ?? { text: 'Unknown', emoji: '❓' };
  return {
    text: entry.text,
    emoji: !isDay && entry.nightEmoji ? entry.nightEmoji : entry.emoji,
  };
};

const DAY_NAMES   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const formatDay  = (d = new Date()) => DAY_NAMES[d.getDay()];
const formatDate = (d = new Date()) => `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}, ${d.getFullYear()}`;

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  name: string;
  country?: string;
  admin1?: string; // state / region
}

export interface WeatherSnapshot {
  location: string;       // resolved place name
  latitude: number;
  longitude: number;
  temperature: number;    // °C
  feelsLike: number;      // °C
  high: number;           // today's max °C
  low: number;            // today's min °C
  condition: string;      // human-readable WMO description
  weatherCode: number;
  emoji: string;
  isDay: boolean;
  humidity: number;       // %
  windSpeed: number;      // km/h
  aqi?: number;           // European AQI (0-100+; lower is better)
  aqiLabel?: string;      // Good / Fair / Moderate / Poor / Very Poor / Extreme
  pm25?: number;          // µg/m³
  pm10?: number;          // µg/m³
  day: string;
  date: string;
}

// Pune fallback if geocoding fails or location is empty
const FALLBACK = { latitude: 18.5204, longitude: 73.8567, name: 'Pune' };

export const geocodeLocation = async (placeName: string): Promise<GeocodeResult | null> => {
  if (!placeName) return null;
  // Open-Meteo geocoding works best with short names — strip "Pune, Maharashtra" → "Pune"
  const query = encodeURIComponent(placeName.split(',')[0].trim());
  if (!query) return null;

  try {
    const res = await fetch(`${OPEN_METEO_GEOCODE_URL}?name=${query}&count=1&language=en&format=json`);
    if (!res.ok) return null;
    const data = await res.json();
    const first = data?.results?.[0];
    if (!first) return null;
    return {
      latitude: first.latitude,
      longitude: first.longitude,
      name: first.name,
      country: first.country,
      admin1: first.admin1,
    };
  } catch {
    return null;
  }
};

const aqiLabel = (aqi?: number): string | undefined => {
  if (typeof aqi !== 'number') return undefined;
  if (aqi <= 20) return 'Good';
  if (aqi <= 40) return 'Fair';
  if (aqi <= 60) return 'Moderate';
  if (aqi <= 80) return 'Poor';
  if (aqi <= 100) return 'Very Poor';
  return 'Extreme';
};

const fetchAirQuality = async (
  latitude: number,
  longitude: number,
): Promise<{ aqi?: number; pm25?: number; pm10?: number }> => {
  try {
    const url = `${OPEN_METEO_AIR_QUALITY_URL}?latitude=${latitude}&longitude=${longitude}&current=european_aqi,pm10,pm2_5`;
    const res = await fetch(url);
    if (!res.ok) return {};
    const data = await res.json();
    const c = data?.current;
    return {
      aqi: typeof c?.european_aqi === 'number' ? Math.round(c.european_aqi) : undefined,
      pm25: typeof c?.pm2_5 === 'number' ? Math.round(c.pm2_5) : undefined,
      pm10: typeof c?.pm10 === 'number' ? Math.round(c.pm10) : undefined,
    };
  } catch {
    return {};
  }
};

export const getCurrentWeather = async (placeName: string): Promise<WeatherSnapshot> => {
  const place = await geocodeLocation(placeName);
  const latitude  = place?.latitude  ?? FALLBACK.latitude;
  const longitude = place?.longitude ?? FALLBACK.longitude;
  const resolvedName = place?.name ?? placeName?.split(',')[0]?.trim() ?? FALLBACK.name;

  const params = new URLSearchParams({
    latitude:  String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code',
    timezone: 'auto',
  });

  const res = await fetch(`${OPEN_METEO_BASE_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Open-Meteo forecast failed: ${res.status}`);
  }
  const data = await res.json();
  const c = data?.current;
  const d = data?.daily;
  if (!c) throw new Error('Open-Meteo forecast returned no current data');

  const isDay = c.is_day === 1;
  const cond = describeCode(c.weather_code, isDay);
  const air = await fetchAirQuality(latitude, longitude);

  return {
    location: resolvedName,
    latitude,
    longitude,
    temperature: Math.round(c.temperature_2m),
    feelsLike:   Math.round(c.apparent_temperature),
    high: Math.round(d?.temperature_2m_max?.[0] ?? c.temperature_2m),
    low:  Math.round(d?.temperature_2m_min?.[0] ?? c.temperature_2m),
    condition: cond.text,
    weatherCode: c.weather_code,
    emoji: cond.emoji,
    isDay,
    humidity:  Math.round(c.relative_humidity_2m),
    windSpeed: Math.round(c.wind_speed_10m),
    ...air,
    aqiLabel: aqiLabel(air.aqi),
    day: formatDay(),
    date: formatDate(),
  };
};

export const weatherService = {
  geocodeLocation,
  getCurrentWeather,
};

export default weatherService;
