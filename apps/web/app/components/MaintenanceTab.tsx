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
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { supabase } from "../../lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

interface MaintenanceItem {
  id: string;
  description: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

interface MaintenanceTabProps {
  session: Session | null;
}

export default function MaintenanceTab({ session }: MaintenanceTabProps) {
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const canEdit = !!session;

  const fetchItems = useCallback(async () => {
    const { data } = await supabase
      .from("maintenance")
      .select("*")
      .order("completed", { ascending: true })
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
    const nowCompleted = !item.completed;
    await supabase
      .from("maintenance")
      .update({
        completed: nowCompleted,
        completed_at: nowCompleted ? new Date().toISOString() : null,
      })
      .eq("id", item.id);
    fetchItems();
  }

  async function deleteItem(id: string) {
    await supabase.from("maintenance").delete().eq("id", id);
    fetchItems();
  }

  const pending = items.filter((i) => !i.completed);
  const completed = items.filter((i) => i.completed);

  return (
    <Box sx={{ width: "100%", maxWidth: 700 }}>
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
        elevation={0}
      >
        <Typography variant="h6" sx={{ fontSize: "1rem", mb: 2 }}>
          Vedlikehold
        </Typography>

        {canEdit && (
          <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
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

        {items.length === 0 && (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: "center", fontSize: "0.85rem" }}>
            Ingen vedlikeholdspunkter
          </Typography>
        )}

        {/* Pending items */}
        {pending.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {pending.map((item) => (
              <MaintenanceRow
                key={item.id}
                item={item}
                canEdit={canEdit}
                onToggle={toggleItem}
                onDelete={deleteItem}
              />
            ))}
          </Box>
        )}

        {/* Completed items */}
        {completed.length > 0 && (
          <>
            <Typography
              variant="subtitle2"
              sx={{ mt: 3, mb: 1, color: "text.secondary", fontSize: "0.8rem" }}
            >
              Fullført ({completed.length})
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {completed.map((item) => (
                <MaintenanceRow
                  key={item.id}
                  item={item}
                  canEdit={canEdit}
                  onToggle={toggleItem}
                  onDelete={deleteItem}
                />
              ))}
            </Box>
          </>
        )}

        {!canEdit && (
          <Typography
            color="text.secondary"
            sx={{ mt: 3, fontSize: "0.85rem" }}
          >
            Logg inn for å redigere vedlikehold
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

function MaintenanceRow({
  item,
  canEdit,
  onToggle,
  onDelete,
}: {
  item: MaintenanceItem;
  canEdit: boolean;
  onToggle: (item: MaintenanceItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Box
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
        onChange={() => canEdit && onToggle(item)}
        disabled={!canEdit}
        size="small"
        sx={{
          color: "rgba(255,255,255,0.3)",
          "&.Mui-checked": { color: "#1DB954" },
          p: 0.5,
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "0.85rem",
            textDecoration: item.completed ? "line-through" : "none",
            color: item.completed ? "text.secondary" : "#fff",
          }}
        >
          {item.description}
        </Typography>
        {item.completed && item.completed_at && (
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}
          >
            Fullført {format(new Date(item.completed_at), "d. MMM yyyy", { locale: nb })}
          </Typography>
        )}
      </Box>
      {canEdit && (
        <IconButton
          size="small"
          onClick={() => onDelete(item.id)}
          sx={{ color: "rgba(255,255,255,0.3)", "&:hover": { color: "#ff6b6b" }, p: 0.5 }}
        >
          ✕
        </IconButton>
      )}
    </Box>
  );
}
