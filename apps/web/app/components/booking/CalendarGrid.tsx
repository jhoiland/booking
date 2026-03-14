"use client";

import { Box, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isWithinInterval,
  parseISO,
  isSameDay,
} from "date-fns";
import { nb } from "date-fns/locale";
import type { Booking } from "./types";

const WEEKDAYS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

// Distinct colors for different bookings (dark-theme friendly, saturated)
const BOOKING_COLORS = [
  "#1DB954", // green
  "#1e90ff", // blue
  "#ff6b6b", // coral
  "#a855f7", // purple
  "#f59e0b", // amber
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#84cc16", // lime
];

function getBookingColor(index: number) {
  return BOOKING_COLORS[index % BOOKING_COLORS.length];
}

interface CalendarGridProps {
  currentMonth: Date;
  bookings: Booking[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (date: Date) => void;
  selectionStart: Date | null;
  selectionEnd: Date | null;
}

export default function CalendarGrid({
  currentMonth,
  bookings,
  onPrevMonth,
  onNextMonth,
  onDayClick,
  selectionStart,
  selectionEnd,
}: CalendarGridProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  function getBookingsForDay(day: Date) {
    return bookings.filter((b) =>
      isWithinInterval(day, {
        start: parseISO(b.start_date),
        end: parseISO(b.end_date),
      })
    );
  }

  function isInSelection(day: Date) {
    if (!selectionStart) return false;
    if (!selectionEnd) return isSameDay(day, selectionStart);
    const start = selectionStart < selectionEnd ? selectionStart : selectionEnd;
    const end = selectionStart < selectionEnd ? selectionEnd : selectionStart;
    return isWithinInterval(day, { start, end });
  }

  // Build a stable color map for bookings
  const colorMap = new Map<string, string>();
  bookings.forEach((b, i) => {
    if (!colorMap.has(b.id)) colorMap.set(b.id, getBookingColor(i));
  });

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <IconButton onClick={onPrevMonth} size="small" sx={{ color: "text.secondary" }}>
          ◀
        </IconButton>
        <Typography variant="h6" sx={{ textTransform: "capitalize", letterSpacing: "-0.02em" }}>
          {format(currentMonth, "MMMM yyyy", { locale: nb })}
        </Typography>
        <IconButton onClick={onNextMonth} size="small" sx={{ color: "text.secondary" }}>
          ▶
        </IconButton>
      </Box>

      {/* Weekday headers */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          mb: 0.5,
        }}
      >
        {WEEKDAYS.map((d) => (
          <Box
            key={d}
            sx={{
              textAlign: "center",
              py: 0.5,
              fontWeight: 600,
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {d}
          </Box>
        ))}
      </Box>

      {/* Day cells */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "1px",
          bgcolor: "rgba(255,255,255,0.04)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {days.map((day) => {
          const inMonth = isSameMonth(day, currentMonth);
          const dayBookings = getBookingsForDay(day);
          const selected = isInSelection(day);
          const isToday = isSameDay(day, new Date());

          return (
            <Box
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              sx={{
                minHeight: { xs: 48, sm: 74 },
                bgcolor: selected
                  ? "rgba(29, 185, 84, 0.15)"
                  : inMonth
                    ? "#1a1a1a"
                    : "#141414",
                cursor: "pointer",
                p: 0.5,
                transition: "background-color 0.15s",
                "&:hover": {
                  bgcolor: selected
                    ? "rgba(29, 185, 84, 0.2)"
                    : "rgba(255,255,255,0.06)",
                },
                position: "relative",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: isToday ? 700 : 400,
                  color: !inMonth
                    ? "rgba(255,255,255,0.2)"
                    : isToday
                      ? "primary.main"
                      : "text.secondary",
                  display: "block",
                  textAlign: "right",
                  pr: 0.5,
                  fontSize: { xs: "0.65rem", sm: "0.75rem" },
                }}
              >
                {format(day, "d")}
              </Typography>
              {isMobile ? (
                dayBookings.length > 0 && (
                  <Box sx={{ display: "flex", gap: "3px", flexWrap: "wrap", justifyContent: "center", mt: 0.25 }}>
                    {dayBookings.map((b) => (
                      <Box
                        key={b.id}
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: colorMap.get(b.id) || "#1DB954",
                        }}
                      />
                    ))}
                  </Box>
                )
              ) : (
                dayBookings.map((b) => (
                  <Box
                    key={b.id}
                    sx={{
                      bgcolor: `${colorMap.get(b.id) || "#1DB954"}22`,
                      color: colorMap.get(b.id) || "#1DB954",
                      border: "1px solid",
                      borderColor: `${colorMap.get(b.id) || "#1DB954"}44`,
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      px: 0.5,
                      borderRadius: 0.5,
                      mb: "2px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      lineHeight: 1.5,
                    }}
                  >
                    {b.guest_name}
                  </Box>
                ))
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
