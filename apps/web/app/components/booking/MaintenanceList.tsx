"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Checkbox,
  TextField,
  IconButton,
  Button,
} from "@mui/material";
import { supabase } from "../../../lib/supabaseClient";

interface MaintenanceItem {
  id: string;
  description: string;
  completed: boolean;
  created_at: string;
}

interface MaintenanceListProps {
  canEdit: boolean;
}

export default function MaintenanceList({ canEdit }: MaintenanceListProps) {
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [newItem, setNewItem] = useState("");

  const fetchItems = useCallback(async () => {
    const { data } = await supabase
      .from("maintenance")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setItems(data);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function addItem() {
    const desc = newItem.trim();
    if (!desc || desc.length > 300) return;
    await supabase.from("maintenance").insert({ description: desc, completed: false });
    setNewItem("");
    fetchItems();
  }

  async function toggleItem(item: MaintenanceItem) {
    await supabase
      .from("maintenance")
      .update({ completed: !item.completed })
      .eq("id", item.id);
    fetchItems();
  }

  async function deleteItem(id: string) {
    await supabase.from("maintenance").delete().eq("id", id);
    fetchItems();
  }

  return (
    <Paper sx={{ p: 2.5, bgcolor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.06)" }} elevation={0}>
      <Typography variant="h6" sx={{ fontSize: "1rem", mb: 2 }}>
        Vedlikehold
      </Typography>

      {items.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 2, textAlign: "center", fontSize: "0.85rem" }}>
          Ingen vedlikeholdspunkter
        </Typography>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {items.map((item) => (
          <Box
            key={item.id}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1,
              borderRadius: 1.5,
              bgcolor: "rgba(255,255,255,0.03)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
            }}
          >
            <Checkbox
              checked={item.completed}
              onChange={() => canEdit && toggleItem(item)}
              disabled={!canEdit}
              size="small"
              sx={{
                color: "rgba(255,255,255,0.3)",
                "&.Mui-checked": { color: "#1DB954" },
                p: 0.5,
              }}
            />
            <Typography
              sx={{
                flex: 1,
                fontSize: "0.85rem",
                textDecoration: item.completed ? "line-through" : "none",
                color: item.completed ? "text.secondary" : "#fff",
              }}
            >
              {item.description}
            </Typography>
            {canEdit && (
              <IconButton
                size="small"
                onClick={() => deleteItem(item.id)}
                sx={{ color: "rgba(255,255,255,0.3)", "&:hover": { color: "#ff6b6b" }, p: 0.5 }}
              >
                ✕
              </IconButton>
            )}
          </Box>
        ))}
      </Box>

      {canEdit && (
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          <TextField
            placeholder="Nytt vedlikeholdspunkt..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            size="small"
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "rgba(255,255,255,0.05)",
                fontSize: "0.85rem",
              },
            }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={addItem}
            disabled={!newItem.trim()}
            sx={{ minWidth: 40, px: 2 }}
          >
            +
          </Button>
        </Box>
      )}
    </Paper>
  );
}
