"use client";

import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  startOfMonth,
  endOfMonth,
  parseISO,
  format,
  differenceInDays,
  isWithinInterval,
  max,
  min,
} from "date-fns";
import { nb } from "date-fns/locale";
import type { Booking } from "./types";

const BOOKING_COLORS = [
  "#1DB954",
  "#1e90ff",
  "#ff6b6b",
  "#a855f7",
  "#f59e0b",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

interface MonthlySummaryProps {
  currentMonth: Date;
  bookings: Booking[];
  canEdit: boolean;
  onEdit: (booking: Booking) => void;
}

export default function MonthlySummary({
  currentMonth,
  bookings,
  canEdit,
  onEdit,
}: MonthlySummaryProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Filter bookings that overlap with the current month
  const monthBookings = bookings
    .filter((b) => {
      const bStart = parseISO(b.start_date);
      const bEnd = parseISO(b.end_date);
      return bStart <= monthEnd && bEnd >= monthStart;
    })
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  // Calculate occupancy
  const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
  const occupiedDays = new Set<string>();
  monthBookings.forEach((b) => {
    const bStart = max([parseISO(b.start_date), monthStart]);
    const bEnd = min([parseISO(b.end_date), monthEnd]);
    let d = bStart;
    while (d <= bEnd) {
      occupiedDays.add(format(d, "yyyy-MM-dd"));
      d = new Date(d.getTime() + 86400000);
    }
  });
  const occupancyPct = Math.round((occupiedDays.size / daysInMonth) * 100);

  return (
    <Paper sx={{ p: 2.5, bgcolor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.06)" }} elevation={0}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
        <Typography variant="h6" sx={{ textTransform: "capitalize", fontSize: "1rem" }}>
          Oppsummering
        </Typography>
        <Chip
          label={`${occupancyPct}% belegg`}
          size="small"
          sx={{
            bgcolor: occupancyPct > 80 ? "rgba(29,185,84,0.15)" : occupancyPct > 40 ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.08)",
            color: occupancyPct > 80 ? "#1DB954" : occupancyPct > 40 ? "#f59e0b" : "text.secondary",
            fontWeight: 700,
            fontSize: "0.75rem",
          }}
        />
      </Box>

      {monthBookings.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 3, textAlign: "center", fontSize: "0.85rem" }}>
          Ingen bookinger denne måneden
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {monthBookings.map((b, i) => {
            const bStart = parseISO(b.start_date);
            const bEnd = parseISO(b.end_date);
            const nights = differenceInDays(bEnd, bStart);
            const color = BOOKING_COLORS[i % BOOKING_COLORS.length];

            return (
              <Box
                key={b.id}
                sx={{
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.03)",
                  borderLeft: `3px solid ${color}`,
                  transition: "background-color 0.15s",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: "#fff" }}>{b.guest_name}</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                    {format(bStart, "d. MMM", { locale: nb })} –{" "}
                    {format(bEnd, "d. MMM", { locale: nb })}
                    {" · "}
                    {nights} {nights === 1 ? "natt" : "netter"}
                  </Typography>
                  {b.note && (
                    <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                      {b.note}
                    </Typography>
                  )}
                  <Typography variant="caption" display="block" sx={{ color: "rgba(255,255,255,0.3)", mt: 0.25 }}>
                    {b.user_email}
                  </Typography>
                </Box>
                {canEdit && (
                  <Tooltip title="Rediger">
                    <IconButton size="small" onClick={() => onEdit(b)} sx={{ color: "text.secondary" }}>
                      ✏️
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Paper>
  );
}
