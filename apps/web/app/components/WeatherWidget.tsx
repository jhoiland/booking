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
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        <CircularProgress size={24} sx={{ color: "#1DB954" }} />
      </Box>
    );
  }

  if (error || !forecast) {
    return (
      <Box sx={{ py: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Kunne ikke hente værdata
        </Typography>
      </Box>
    );
  }

  const { now, days } = forecast;

  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{ color: "#1DB954", fontWeight: 700, mb: 1.5, fontSize: "0.85rem", letterSpacing: 0.5 }}
      >
        ☀️ VÆRET I PIGI
      </Typography>

      {/* Current weather */}
      <Box
        sx={{
          bgcolor: "rgba(29,185,84,0.08)",
          borderRadius: 2,
          p: 2,
          mb: 2,
          border: "1px solid rgba(29,185,84,0.2)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography sx={{ fontSize: "2.5rem", lineHeight: 1 }}>
            {getWeatherIcon(now.symbol)}
          </Typography>
          <Box>
            <Typography sx={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
              {now.temp}°C
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 0.3 }}>
              Nå i Pigi
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mt: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography sx={{ fontSize: "0.9rem" }}>💨</Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
              {now.wind.toFixed(1)} m/s · {getWindDescription(now.wind)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography sx={{ fontSize: "0.9rem" }}>💧</Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
              {now.humidity}%
            </Typography>
          </Box>
          {now.precip > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography sx={{ fontSize: "0.9rem" }}>🌧️</Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                {now.precip} mm
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* 4-day forecast */}
      <Box sx={{ display: "flex", gap: 1 }}>
        {days.map((day) => (
          <Box
            key={day.date}
            sx={{
              flex: 1,
              bgcolor: "#1a1a1a",
              borderRadius: 1.5,
              p: 1,
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: "0.7rem" }}
            >
              {day.dayName}
            </Typography>
            <Typography sx={{ fontSize: "1.5rem", lineHeight: 1, my: 0.5 }}>
              {getWeatherIcon(day.symbol)}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#fff", fontWeight: 700, fontSize: "0.8rem" }}
            >
              {day.tempMax}°
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem" }}
            >
              {day.tempMin}°
            </Typography>
            {day.precip > 0 && (
              <Typography
                variant="caption"
                sx={{ display: "block", color: "#64b5f6", fontSize: "0.6rem", mt: 0.3 }}
              >
                {day.precip} mm
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      <Typography
        variant="caption"
        sx={{ display: "block", color: "rgba(255,255,255,0.25)", mt: 1, fontSize: "0.6rem", textAlign: "right" }}
      >
        Kilde: met.no
      </Typography>
    </Box>
  );
}
