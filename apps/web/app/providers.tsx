"use client";

import type { ReactNode } from "react";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { EmotionRegistry } from "./EmotionRegistry";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#1DB954" }, // Spotify green
    secondary: { main: "#b3b3b3" },
    background: {
      default: "#121212",
      paper: "#181818",
    },
    text: {
      primary: "#ffffff",
      secondary: "#a7a7a7",
    },
    divider: "rgba(255,255,255,0.07)",
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    h6: { fontWeight: 700, letterSpacing: "-0.02em" },
    subtitle2: { fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 20,
        },
        contained: {
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#242424",
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <EmotionRegistry>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </EmotionRegistry>
  );
}
