"use client";

import { Box, Typography, Paper, Chip } from "@mui/material";
import {
  startOfMonth,
  endOfMonth,
  parseISO,
  format,
  differenceInDays,
  max,
  min,
} from "date-fns";
import { nb } from "date-fns/locale";
import type { Booking } from "./types";

const SEASON_MONTHS = [4, 5, 6, 7, 8, 9]; // May(4) - October(9) zero-indexed
const HIGH_SEASON = new Set([4, 5, 6, 7]); // mai, juni, juli, august

interface SeasonChartProps {
  bookings: Booking[];
  year: number;
  onMonthClick?: (date: Date) => void;
}

export default function SeasonChart({ bookings, year, onMonthClick }: SeasonChartProps) {
  const monthData = SEASON_MONTHS.map((monthIdx) => {
    const monthDate = new Date(year, monthIdx, 1);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;

    const occupiedDays = new Set<string>();
    bookings.forEach((b) => {
      const bStart = parseISO(b.start_date);
      const bEnd = parseISO(b.end_date);
      if (bStart <= monthEnd && bEnd >= monthStart) {
        const overlapStart = max([bStart, monthStart]);
        const overlapEnd = min([bEnd, monthEnd]);
        let d = overlapStart;
        while (d <= overlapEnd) {
          occupiedDays.add(format(d, "yyyy-MM-dd"));
          d = new Date(d.getTime() + 86400000);
        }
      }
    });

    const pct = Math.round((occupiedDays.size / daysInMonth) * 100);
    const isHighSeason = HIGH_SEASON.has(monthIdx);
    return {
      label: format(monthDate, "MMM", { locale: nb }),
      monthIdx,
      pct,
      days: occupiedDays.size,
      total: daysInMonth,
      isHighSeason,
    };
  });

  const totalSeasonDays = monthData.reduce((s, m) => s + m.total, 0);
  const totalOccupied = monthData.reduce((s, m) => s + m.days, 0);
  const totalPct = Math.round((totalOccupied / totalSeasonDays) * 100);

  return (
    <Paper sx={{ p: 2.5, bgcolor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.06)" }} elevation={0}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
        <Typography variant="h6" sx={{ fontSize: "1rem" }}>
          Sesong {year} (mai – okt)
        </Typography>
        <Chip
          label={`${totalPct}% totalt`}
          size="small"
          sx={{
            bgcolor: totalPct > 60 ? "rgba(29,185,84,0.15)" : totalPct > 30 ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.08)",
            color: totalPct > 60 ? "#1DB954" : totalPct > 30 ? "#f59e0b" : "text.secondary",
            fontWeight: 700,
            fontSize: "0.75rem",
          }}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {/* Høysesong header */}
        <Typography
          variant="caption"
          sx={{
            color: "#f59e0b",
            fontWeight: 700,
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            mt: 0.5,
            mb: 0.5,
          }}
        >
          Høysesong
        </Typography>
        {monthData.filter((m) => m.isHighSeason).map((m) => (
          <Box
            key={m.label}
            onClick={() => onMonthClick?.(new Date(year, m.monthIdx, 1))}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              cursor: onMonthClick ? "pointer" : "default",
              borderRadius: 1,
              px: 0.5,
              mx: -0.5,
              transition: "background-color 0.15s",
              "&:hover": onMonthClick ? { bgcolor: "rgba(255,255,255,0.06)" } : {},
            }}
          >
            <Typography
              sx={{
                width: 36,
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "text.secondary",
                textTransform: "capitalize",
              }}
            >
              {m.label}
            </Typography>
            <Box sx={{ flex: 1, height: 20, bgcolor: "rgba(255,255,255,0.06)", borderRadius: 1, overflow: "hidden" }}>
              <Box
                sx={{
                  width: `${m.pct}%`,
                  height: "100%",
                  bgcolor: m.pct > 80 ? "#1DB954" : m.pct > 40 ? "#f59e0b" : "#1e90ff",
                  borderRadius: 1,
                  transition: "width 0.4s ease",
                  minWidth: m.pct > 0 ? 4 : 0,
                }}
              />
            </Box>
            <Typography sx={{ width: 60, fontSize: "0.75rem", color: "text.secondary", textAlign: "right" }}>
              {m.days}/{m.total} d
            </Typography>
          </Box>
        ))}

        {/* Lavsesong header */}
        <Typography
          variant="caption"
          sx={{
            color: "#1e90ff",
            fontWeight: 700,
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            mt: 1.5,
            mb: 0.5,
          }}
        >
          Lavsesong
        </Typography>
        {monthData.filter((m) => !m.isHighSeason).map((m) => (
          <Box
            key={m.label}
            onClick={() => onMonthClick?.(new Date(year, m.monthIdx, 1))}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              cursor: onMonthClick ? "pointer" : "default",
              borderRadius: 1,
              px: 0.5,
              mx: -0.5,
              transition: "background-color 0.15s",
              "&:hover": onMonthClick ? { bgcolor: "rgba(255,255,255,0.06)" } : {},
            }}
          >
            <Typography
              sx={{
                width: 36,
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "text.secondary",
                textTransform: "capitalize",
              }}
            >
              {m.label}
            </Typography>
            <Box sx={{ flex: 1, height: 20, bgcolor: "rgba(255,255,255,0.06)", borderRadius: 1, overflow: "hidden" }}>
              <Box
                sx={{
                  width: `${m.pct}%`,
                  height: "100%",
                  bgcolor: m.pct > 80 ? "#1DB954" : m.pct > 40 ? "#f59e0b" : "#1e90ff",
                  borderRadius: 1,
                  transition: "width 0.4s ease",
                  minWidth: m.pct > 0 ? 4 : 0,
                }}
              />
            </Box>
            <Typography sx={{ width: 60, fontSize: "0.75rem", color: "text.secondary", textAlign: "right" }}>
              {m.days}/{m.total} d
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between" }}>
        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
          Totalt belegg
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.8rem" }}>
          {totalOccupied} av {totalSeasonDays} dager ({totalPct}%)
        </Typography>
      </Box>
    </Paper>
  );
}
