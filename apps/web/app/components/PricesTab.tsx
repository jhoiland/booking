"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { supabase } from "../../lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

interface Prices {
  id: string;
  season_price: number;
  off_season_price: number;
  friends_price: number;
  cleaning_price: number;
}

interface PricesTabProps {
  session: Session | null;
}

export default function PricesTab({ session }: PricesTabProps) {
  const [prices, setPrices] = useState<Prices | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  const [seasonPrice, setSeasonPrice] = useState("");
  const [offSeasonPrice, setOffSeasonPrice] = useState("");
  const [friendsPrice, setFriendsPrice] = useState("");
  const [cleaningPrice, setCleaningPrice] = useState("");

  const canEdit = !!session;

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("prices")
      .select("*")
      .limit(1)
      .single();

    if (!error && data) {
      setPrices(data);
      setSeasonPrice(String(data.season_price));
      setOffSeasonPrice(String(data.off_season_price));
      setFriendsPrice(String(data.friends_price));
      setCleaningPrice(String(data.cleaning_price));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  async function handleSave() {
    if (!prices || !session) return;

    const season = parseFloat(seasonPrice);
    const offSeason = parseFloat(offSeasonPrice);
    const friends = parseFloat(friendsPrice);
    const cleaning = parseFloat(cleaningPrice);

    if ([season, offSeason, friends, cleaning].some((v) => isNaN(v) || v < 0)) {
      setSnackbar({ message: "Alle priser må være gyldige tall (0 eller høyere)", severity: "error" });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("prices")
      .update({
        season_price: season,
        off_season_price: offSeason,
        friends_price: friends,
        cleaning_price: cleaning,
        updated_at: new Date().toISOString(),
      })
      .eq("id", prices.id);

    if (error) {
      setSnackbar({ message: `Kunne ikke lagre: ${error.message}`, severity: "error" });
    } else {
      setSnackbar({ message: "Priser oppdatert", severity: "success" });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  const priceFields = [
    { label: "Pris i sesong (per natt)", value: seasonPrice, setter: setSeasonPrice },
    { label: "Pris utenfor sesong (per natt)", value: offSeasonPrice, setter: setOffSeasonPrice },
    { label: "Vennepris (per natt)", value: friendsPrice, setter: setFriendsPrice },
    { label: "Pris for vask", value: cleaningPrice, setter: setCleaningPrice },
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: 600 }}>
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
        elevation={0}
      >
        <Typography variant="h6" sx={{ fontSize: "1rem", mb: 3, color: "#fff" }}>
          Priser
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {priceFields.map((f) => (
            <TextField
              key={f.label}
              label={f.label}
              type="number"
              value={f.value}
              onChange={(e) => f.setter(e.target.value)}
              disabled={!canEdit}
              fullWidth
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start" sx={{ color: "#fff" }}>kr</InputAdornment>,
                },
                inputLabel: { sx: { color: "rgba(255,255,255,0.7)" } },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                },
              }}
            />
          ))}
        </Box>

        {canEdit && (
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ mt: 3, px: 4 }}
          >
            {saving ? "Lagrer..." : "Lagre priser"}
          </Button>
        )}

        {!canEdit && (
          <Typography
            color="text.secondary"
            sx={{ mt: 3, fontSize: "0.85rem" }}
          >
            Logg inn for å redigere priser
          </Typography>
        )}
      </Paper>

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
