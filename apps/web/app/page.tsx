
"use client";

import { useEffect, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { supabase } from "../lib/supabaseClient";
import BookingCalendar from "./components/BookingCalendar";
import type { Session } from "@supabase/supabase-js";

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogin() {
    setError("");
    if (!email || !password) {
      setError("Fyll inn e-post og passord");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Feil e-post eller passord");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
  }

  if (loading) {
    return null;
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* Top bar */}
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          backdropFilter: "blur(12px)",
          bgcolor: "rgba(18,18,18,0.85)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "primary.main",
            fontSize: { xs: "0.95rem", sm: "1.25rem" },
            whiteSpace: "nowrap",
          }}
        >
          Booking leilighet Kreta
        </Typography>
        {session ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: { xs: "none", sm: "block" },
                maxWidth: 160,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {session.user.email}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={handleLogout}
              sx={{ borderColor: "rgba(255,255,255,0.2)", color: "text.secondary" }}
            >
              Logg ut
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <TextField
              placeholder="E-post"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="small"
              sx={{
                width: { xs: 130, sm: 180 },
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgba(255,255,255,0.07)",
                  fontSize: { xs: "0.8rem", sm: "1rem" },
                },
              }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <TextField
              placeholder="Passord"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="small"
              sx={{
                width: { xs: 110, sm: 140 },
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgba(255,255,255,0.07)",
                  fontSize: { xs: "0.8rem", sm: "1rem" },
                },
              }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <Button variant="contained" size="small" onClick={handleLogin}>
              Logg inn
            </Button>
            {error && (
              <Typography variant="caption" color="error">
                {error}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Main content */}
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
        <BookingCalendar session={session} />
      </Box>
    </Box>
  );
}
