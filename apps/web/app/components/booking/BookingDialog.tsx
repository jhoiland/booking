"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
} from "@mui/material";
import { format } from "date-fns";
import type { Booking, BookingFormData } from "./types";

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: BookingFormData) => void;
  onDelete?: () => void;
  booking?: Booking | null;
  defaultStart?: Date | null;
  defaultEnd?: Date | null;
  currentMonth?: Date;
}

export default function BookingDialog({
  open,
  onClose,
  onSave,
  onDelete,
  booking,
  defaultStart,
  defaultEnd,
  currentMonth,
}: BookingDialogProps) {
  const [form, setForm] = useState<BookingFormData>({
    guest_name: "",
    start_date: "",
    end_date: "",
    note: "",
  });

  useEffect(() => {
    if (booking) {
      setForm({
        guest_name: booking.guest_name,
        start_date: booking.start_date,
        end_date: booking.end_date,
        note: booking.note || "",
      });
    } else {
      const fallbackStart = defaultStart || (currentMonth ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1) : null);
      const fallbackEnd = defaultEnd || (currentMonth ? new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0) : null);
      setForm({
        guest_name: "",
        start_date: fallbackStart ? format(fallbackStart, "yyyy-MM-dd") : "",
        end_date: fallbackEnd ? format(fallbackEnd, "yyyy-MM-dd") : "",
        note: "",
      });
    }
  }, [booking, defaultStart, defaultEnd, currentMonth, open]);

  const isEdit = !!booking;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1, fontWeight: 700 }}>
        {isEdit ? "Rediger booking" : "Ny booking"}
        {isEdit && onDelete && (
          <IconButton
            onClick={onDelete}
            title="Slett booking"
            sx={{ color: "#ff6b6b", "&:hover": { bgcolor: "rgba(255,107,107,0.1)" } }}
          >
            🗑
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1.5 }}>
          <TextField
            label="Gjest / Navn"
            value={form.guest_name}
            onChange={(e) => setForm((f) => ({ ...f, guest_name: e.target.value }))}
            required
            fullWidth
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Fra dato"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              required
              fullWidth
            />
            <TextField
              label="Til dato"
              type="date"
              value={form.end_date}
              onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              required
              fullWidth
            />
          </Box>
          <TextField
            label="Notat (valgfritt)"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            multiline
            rows={2}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ color: "text.secondary" }}>Avbryt</Button>
        <Button
          variant="contained"
          onClick={() => onSave(form)}
          disabled={!form.guest_name || !form.start_date || !form.end_date}
          sx={{ px: 3 }}
        >
          {isEdit ? "Lagre endringer" : "Opprett booking"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
