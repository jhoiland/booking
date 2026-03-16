"use client";

import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

// Pigi, Rethymno coordinates
const LAT = 35.38;
const LON = 24.45;
const API_URL = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${LAT}&lon=${LON}`;

interface TimeEntry {
  time: string;
  data: {
    instant: {
      details: {
        air_temperature: number;
        wind_speed: number;
        relative_humidity: number;
        cloud_area_fraction: number;
      };
    };
    next_1_hours?: {
      summary: { symbol_code: string };
      details: { precipitation_amount: number };
    };
    next_6_hours?: {
      summary: { symbol_code: string };
      details: { precipitation_amount: number; air_temperature_max: number; air_temperature_min: number };
    };
  };
}

interface DayForecast {
  date: string;
  dayName: string;
  symbol: string;
  tempMax: number;
  tempMin: number;
  wind: number;
  precip: number;
}

const WEEKDAYS_NO = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];

function getWeatherIcon(symbol: string): string {
  if (!symbol) return "☀️";
  if (symbol.startsWith("clearsky")) return "☀️";
  if (symbol.startsWith("fair")) return "🌤️";
  if (symbol.startsWith("partlycloudy")) return "⛅";
  if (symbol.startsWith("cloudy")) return "☁️";
  if (symbol.includes("thunder")) return "⛈️";
  if (symbol.includes("sleet")) return "🌨️";
  if (symbol.includes("snow")) return "❄️";
  if (symbol.includes("heavyrain")) return "🌧️";
  if (symbol.includes("rain")) return "🌦️";
  if (symbol.includes("fog")) return "🌫️";
  return "🌤️";
}

function getWindDescription(ms: number): string {
  if (ms < 1) return "Stille";
  if (ms < 4) return "Svak vind";
  if (ms < 8) return "Moderat vind";
  if (ms < 14) return "Frisk vind";
  return "Sterk vind";
}

function parseForecast(timeseries: TimeEntry[]): {
  now: { temp: number; symbol: string; wind: number; humidity: number; precip: number };
  days: DayForecast[];
} | null {
  if (!timeseries || timeseries.length === 0) return null;

  const first = timeseries[0];
  const nowSymbol =
    first.data.next_1_hours?.summary.symbol_code ??
    first.data.next_6_hours?.summary.symbol_code ??
    "clearsky_day";

  const now = {
    temp: Math.round(first.data.instant.details.air_temperature),
    symbol: nowSymbol,
    wind: first.data.instant.details.wind_speed,
    humidity: Math.round(first.data.instant.details.relative_humidity),
    precip: first.data.next_1_hours?.details.precipitation_amount ?? 0,
  };

  // Group timeseries by date, skip today
  const today = new Date().toISOString().slice(0, 10);
  const byDate = new Map<string, TimeEntry[]>();

  for (const entry of timeseries) {
    const date = entry.time.slice(0, 10);
    if (date === today) continue;
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(entry);
  }

  const days: DayForecast[] = [];
  for (const [date, entries] of byDate) {
    if (days.length >= 4) break;

    let tempMax = -Infinity;
    let tempMin = Infinity;
    let symbol = "clearsky_day";
    let totalPrecip = 0;
    let windMax = 0;

    // Find a noon-ish entry for the icon
    const noonEntry = entries.find((e) => {
      const h = new Date(e.time).getUTCHours();
      return h >= 10 && h <= 14;
    });

    for (const e of entries) {
      const t = e.data.instant.details.air_temperature;
      if (t > tempMax) tempMax = t;
      if (t < tempMin) tempMin = t;
      if (e.data.instant.details.wind_speed > windMax) {
        windMax = e.data.instant.details.wind_speed;
      }
      if (e.data.next_1_hours?.details.precipitation_amount) {
        totalPrecip += e.data.next_1_hours.details.precipitation_amount;
      } else if (e.data.next_6_hours?.details.precipitation_amount) {
        totalPrecip += e.data.next_6_hours.details.precipitation_amount / 6;
      }
    }

    if (noonEntry) {
      symbol =
        noonEntry.data.next_1_hours?.summary.symbol_code ??
        noonEntry.data.next_6_hours?.summary.symbol_code ??
        symbol;
    } else if (entries[0]) {
      symbol =
        entries[0].data.next_6_hours?.summary.symbol_code ??
        entries[0].data.next_1_hours?.summary.symbol_code ??
        symbol;
    }

    const d = new Date(date + "T12:00:00Z");
    days.push({
      date,
      dayName: WEEKDAYS_NO[d.getUTCDay()],
      symbol,
      tempMax: Math.round(tempMax),
      tempMin: Math.round(tempMin),
      wind: windMax,
      precip: Math.round(totalPrecip * 10) / 10,
    });
  }

  return { now, days };
}

export default function WeatherWidget() {
  const [forecast, setForecast] = useState<ReturnType<typeof parseForecast>>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchWeather() {
      try {
        const res = await fetch(API_URL, {
          headers: { "User-Agent": "PigiParadiseBooking/1.0 github.com/jhoiland/booking" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setForecast(parseForecast(json.properties.timeseries));
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    fetchWeather();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 80 }}>
        <CircularProgress size={16} sx={{ color: "#1DB954" }} />
      </Box>
    );
  }

  if (error || !forecast) return null;

  const { now, days } = forecast;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 }, flexWrap: "nowrap" }}>
      {/* Current temp */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
        <Typography sx={{ fontSize: { xs: "1.1rem", sm: "1.3rem" }, lineHeight: 1 }}>
          {getWeatherIcon(now.symbol)}
        </Typography>
        <Box>
          <Typography sx={{ fontSize: { xs: "0.85rem", sm: "1rem" }, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
            {now.temp}°C
          </Typography>
          <Typography sx={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.45)", lineHeight: 1, mt: 0.2 }}>
            Pigi nå
          </Typography>
        </Box>
      </Box>

      {/* Compact details */}
      <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1.5, flexShrink: 0 }}>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}>
          💨 {now.wind.toFixed(0)} m/s
        </Typography>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}>
          💧 {now.humidity}%
        </Typography>
      </Box>

      {/* Divider */}
      <Box sx={{ width: "1px", height: 24, bgcolor: "rgba(255,255,255,0.1)", flexShrink: 0, display: { xs: "none", md: "block" } }} />

      {/* 4-day mini forecast */}
      <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1, alignItems: "center" }}>
        {days.map((day) => (
          <Box
            key={day.date}
            sx={{ textAlign: "center", minWidth: 36 }}
          >
            <Typography sx={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.4)", fontWeight: 600, lineHeight: 1 }}>
              {day.dayName}
            </Typography>
            <Typography sx={{ fontSize: "0.9rem", lineHeight: 1, my: 0.2 }}>
              {getWeatherIcon(day.symbol)}
            </Typography>
            <Typography sx={{ fontSize: "0.65rem", color: "#fff", fontWeight: 600, lineHeight: 1 }}>
              {day.tempMax}°
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
