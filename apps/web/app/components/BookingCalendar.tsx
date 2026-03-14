"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { addMonths, subMonths, startOfMonth, endOfMonth, format, isBefore, parseISO, isWithinInterval } from "date-fns";
import type { Session } from "@supabase/supabase-js";
import CalendarGrid from "./booking/CalendarGrid";
import BookingDialog from "./booking/BookingDialog";
import MonthlySummary from "./booking/MonthlySummary";
import type { Booking, BookingFormData } from "./booking/types";
import SeasonChart from "./booking/SeasonChart";
import MaintenanceList from "./booking/MaintenanceList";

interface BookingCalendarProps {
  session: Session | null;
}

export default function BookingCalendar({ session }: BookingCalendarProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Selection state for date range picking
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Feedback
  const [snackbar, setSnackbar] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  const canEdit = !!session;

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("id, user_email, guest_name, start_date, end_date, note")
      .order("start_date", { ascending: true });
    if (!error && data) setBookings(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  function handleDayClick(date: Date) {
    if (!canEdit) return;

    // Check if user clicked on a booked day
    const clickedBooking = bookings.find((b) => {
      return isWithinInterval(date, {
        start: parseISO(b.start_date),
        end: parseISO(b.end_date),
      });
    });

    if (clickedBooking) {
      setEditingBooking(clickedBooking);
      setSelectionStart(null);
      setSelectionEnd(null);
      setDialogOpen(true);
      return;
    }

    // Date range selection
    if (!selectionStart || selectionEnd) {
      setSelectionStart(date);
      setSelectionEnd(null);
    } else {
      const start = isBefore(date, selectionStart) ? date : selectionStart;
      const end = isBefore(date, selectionStart) ? selectionStart : date;
      setSelectionStart(start);
      setSelectionEnd(end);
      setEditingBooking(null);
      setDialogOpen(true);
    }
  }

  function handleNewBooking() {
    setEditingBooking(null);
    setSelectionStart(startOfMonth(currentMonth));
    setSelectionEnd(endOfMonth(currentMonth));
    setDialogOpen(true);
  }

  function handleEditFromSummary(booking: Booking) {
    setEditingBooking(booking);
    setDialogOpen(true);
  }

  async function handleSave(data: BookingFormData) {
    if (!session) return;

    // Input validation
    const name = data.guest_name.trim();
    if (!name || name.length > 100) {
      setSnackbar({ message: "Ugyldig gjestenavn (maks 100 tegn)", severity: "error" });
      return;
    }
    if (data.note && data.note.length > 500) {
      setSnackbar({ message: "Notatet er for langt (maks 500 tegn)", severity: "error" });
      return;
    }
    if (new Date(data.end_date) < new Date(data.start_date)) {
      setSnackbar({ message: "Til-dato må være etter fra-dato", severity: "error" });
      return;
    }

    if (editingBooking) {
      // Update
      const { error } = await supabase
        .from("bookings")
        .update({
          guest_name: name,
          start_date: data.start_date,
          end_date: data.end_date,
          note: data.note?.trim() || null,
        })
        .eq("id", editingBooking.id);

      if (error) {
        console.error("Update error:", error);
        setSnackbar({ message: `Kunne ikke oppdatere: ${error.message}`, severity: "error" });
      } else {
        setSnackbar({ message: "Booking oppdatert", severity: "success" });
      }
    } else {
      // Insert
      const { error } = await supabase.from("bookings").insert({
        guest_name: name,
        start_date: data.start_date,
        end_date: data.end_date,
        note: data.note?.trim() || null,
        user_email: session.user.email,
      });

      if (error) {
        setSnackbar({ message: "Kunne ikke opprette bookingen. Prøv igjen.", severity: "error" });
      } else {
        setSnackbar({ message: "Booking opprettet", severity: "success" });
      }
    }

    setDialogOpen(false);
    setSelectionStart(null);
    setSelectionEnd(null);
    setEditingBooking(null);
    fetchBookings();
  }

  async function handleDelete() {
    if (!editingBooking) return;

    const confirmed = window.confirm(
      `Er du sikker på at du vil slette bookingen for ${editingBooking.guest_name}?`
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", editingBooking.id);

    if (error) {
      console.error("Delete error:", error);
      setSnackbar({ message: `Kunne ikke slette: ${error.message}`, severity: "error" });
    } else {
      setSnackbar({ message: "Booking slettet", severity: "success" });
    }

    setDialogOpen(false);
    setEditingBooking(null);
    fetchBookings();
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Action bar */}
      {canEdit && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Button
            variant="contained"
            onClick={handleNewBooking}
            sx={{ px: 3 }}
          >
            + Ny booking
          </Button>
        </Box>
      )}

      {!canEdit && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            textAlign: "center",
            borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Typography color="text.secondary" sx={{ fontSize: "0.9rem" }}>
            Logg inn for å opprette og redigere bookinger
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 380px" },
          gap: 3,
          alignItems: "start",
        }}
      >
        {/* Calendar */}
        <CalendarGrid
          currentMonth={currentMonth}
          bookings={bookings}
          onPrevMonth={() => setCurrentMonth((m) => subMonths(m, 1))}
          onNextMonth={() => setCurrentMonth((m) => addMonths(m, 1))}
          onDayClick={handleDayClick}
          selectionStart={selectionStart}
          selectionEnd={selectionEnd}
        />

        {/* Monthly summary */}
        <MonthlySummary
          currentMonth={currentMonth}
          bookings={bookings}
          canEdit={canEdit}
          onEdit={handleEditFromSummary}
        />
      </Box>

      {/* Season chart + Maintenance */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
          mt: 3,
        }}
      >
        <SeasonChart
          bookings={bookings}
          year={currentMonth.getFullYear()}
          onMonthClick={(date) => setCurrentMonth(date)}
        />
        <MaintenanceList canEdit={canEdit} />
      </Box>

      {/* Booking dialog */}
      <BookingDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectionStart(null);
          setSelectionEnd(null);
          setEditingBooking(null);
        }}
        onSave={handleSave}
        onDelete={canEdit && editingBooking ? handleDelete : undefined}
        booking={editingBooking}
        defaultStart={selectionStart}
        defaultEnd={selectionEnd}
        currentMonth={currentMonth}
      />

      {/* Snackbar */}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {snackbar ? (
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
