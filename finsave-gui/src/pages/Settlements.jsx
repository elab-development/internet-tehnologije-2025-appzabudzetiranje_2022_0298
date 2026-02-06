import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Container, Paper, Typography, Stack, Chip, TextField, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete,
  InputAdornment, IconButton, Tooltip, Divider, Snackbar, Alert, MenuItem
} from "@mui/material";
import { AddRounded, EditRounded } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import axiosClient from "../api/axiosClient";
import { Link } from "react-router-dom";

const PALETTE = { primary: "#318D4F", secondary: "#79D16A", dark: "#1D5E32" };

const fmt = (n) =>
  Number(n || 0).toLocaleString(undefined, { style: "currency", currency: "EUR" });

function Shell({ title, subtitle, action, children }) {
  return (
    <Paper
      elevation={10}
      sx={{
        p: 3, borderRadius: 3, background: "#fff",
        border: `1px solid ${alpha("#000", 0.06)}`,
        boxShadow: "0 18px 44px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.6)",
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" gap={2} mb={2}>
        <Box>
          <Typography variant="h6" fontWeight={900}>{title}</Typography>
          {subtitle && <Typography variant="body2" sx={{ color: alpha("#000", 0.65) }}>{subtitle}</Typography>}
        </Box>
        {action}
      </Stack>
      {children}
    </Paper>
  );
}

export default function Settlements() {
  /* ------- auth ------- */
  const me = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("auth_user") || "{}"); }
    catch { return {}; }
  }, []);
  const myId = Number(me?.id || 0);

  /* ------- state ------- */
  const [rows, setRows] = useState([]);        // raw settlements from API
  const [users, setUsers] = useState([]);      // for new/edit dialog
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [filterType, setFilterType] = useState("all"); // all|sent|received
  const [q, setQ] = useState("");
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  // create / edit
  const [openCE, setOpenCE] = useState(false);
  const [editing, setEditing] = useState(null); // if set => edit
  const [form, setForm] = useState({ to_user_id: "", amount: "", note: "" });
  const [userObj, setUserObj] = useState(null);
  const [saving, setSaving] = useState(false);

  /* ------- load ------- */
  async function fetchAll() {
    try {
      const res = await axiosClient.get("/settlements");
      setRows(res?.data?.data ?? res?.data ?? []);
    } catch (e) {
      setSnack({ open: true, severity: "error", message: "Failed to load settlements." });
    }
  }
  useEffect(() => { fetchAll(); }, []);

  async function ensureUsers() {
    if (users.length) return;
    setLoadingUsers(true);
    try {
      const res = await axiosClient.get("/users", { params: { all: 1 } });
      // exclude myself
      const list = (res?.data?.data ?? res?.data ?? []).filter(u => Number(u.id) !== myId);
      setUsers(list);
    } finally { setLoadingUsers(false); }
  }

  /* ------- transform (direction & counterparty) ------- */
  const vm = useMemo(() => {
    return (rows || []).map(s => {
      const dir = Number(s.from_user_id) === myId ? "sent" : "received";
      const counterparty = dir === "sent"
        ? (s.to_user || s.toUser)
        : (s.from_user || s.fromUser);
      return {
        id: s.id,
        amount: Number(s.amount || 0),
        note: s.note || "",
        date: (s.settled_at || "").slice(0, 10),
        dir,
        counterparty,
        from_user_id: s.from_user_id,
        to_user_id: s.to_user_id,
        raw: s,
      };
    });
  }, [rows, myId]);

  /* ------- filters & totals ------- */
  const filtered = useMemo(() => {
    const byType = filterType === "all" ? vm : vm.filter(r => r.dir === filterType);
    if (!q.trim()) return byType;
    const t = q.toLowerCase();
    return byType.filter(r =>
      (r.counterparty?.name || "").toLowerCase().includes(t) ||
      (r.counterparty?.email || "").toLowerCase().includes(t) ||
      (r.note || "").toLowerCase().includes(t)
    );
  }, [vm, filterType, q]);

  const sentTotal = vm.filter(r => r.dir === "sent").reduce((a, b) => a + b.amount, 0);
  const recvTotal = vm.filter(r => r.dir === "received").reduce((a, b) => a + b.amount, 0);

  /* ------- open create / edit ------- */
  async function openNew() {
    setEditing(null);
    setForm({ to_user_id: "", amount: "", note: "" });
    setUserObj(null);
    await ensureUsers();
    setOpenCE(true);
  }
  async function openEdit(row) {
    // only allow editing if I sent it
    if (row.dir !== "sent") return;
    setEditing(row);
    setForm({ to_user_id: row.to_user_id, amount: String(row.amount), note: row.note });
    setUserObj(users.find(u => Number(u.id) === Number(row.to_user_id)) || null);
    await ensureUsers();
    setOpenCE(true);
  }
  function closeCE() {
    setOpenCE(false);
    setEditing(null);
    setForm({ to_user_id: "", amount: "", note: "" });
    setUserObj(null);
  }

  /* ------- submit create / edit ------- */
  async function submitCE() {
    setSaving(true);
    try {
      if (editing) {
        // PUT /settlements/{id}  (only amount/note are editable)
        const res = await axiosClient.put(`/settlements/${editing.id}`, {
          amount: Number(form.amount || 0),
          note: form.note || "",
        });
        const updated = res?.data?.data ?? res?.data;
        setRows(prev => prev.map(s => (s.id === updated.id ? updated : s)));
        setSnack({ open: true, severity: "success", message: "Settlement updated." });
      } else {
        // POST /settlements
        const res = await axiosClient.post("/settlements", {
          to_user_id: Number(form.to_user_id),
          amount: Number(form.amount || 0),
          note: form.note || "",
        });
        const created = res?.data?.data ?? res?.data;
        setRows(prev => [created, ...prev]);
        setSnack({ open: true, severity: "success", message: "Settlement created." });
      }
      closeCE();
    } catch (e) {
      setSnack({ open: true, severity: "error", message: e?.response?.data?.message || "Action failed." });
    } finally {
      setSaving(false);
    }
  }

  /* ------- UI ------- */
  return (
    <Box sx={{
      minHeight: "100vh",
      background: `
        radial-gradient(1200px 800px at -10% -20%, ${alpha(PALETTE.secondary, 0.28)} 0%, transparent 60%),
        radial-gradient(900px 600px at 120% 120%, ${alpha(PALETTE.primary, 0.22)} 0%, transparent 60%),
        linear-gradient(135deg, ${PALETTE.dark} 0%, ${PALETTE.primary} 45%, ${PALETTE.secondary} 100%)
      `,
      pb: 10
    }}>
            <nav aria-label="breadcrumb" style={{ font: "14px/1.4 system-ui", marginLeft: "200px", color:"white"}}>
        <span><Link sx={{ color:"white"}} to="/home">Home</Link></span>
        <span style={{ margin: "0 8px", opacity: 0.5 }}>/</span>
        <span aria-current="page" style={{ fontWeight: 600 }}>Settlements</span>
      </nav>
      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 } }}>
        <Shell
          title="Settlements"
          subtitle="Send and track refunds between users."
          action={
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
              <TextField
                size="small"
                label="Search name or note"
                value={q}
                onChange={e => setQ(e.target.value)}
              />
              <TextField
                select size="small" label="Type" value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
                <MenuItem value="received">Received</MenuItem>
              </TextField>
              <Button
                onClick={openNew}
                startIcon={<AddRounded />}
                variant="contained"
                sx={{
                  borderRadius: 999,
                  fontWeight: 800,
                  background: `linear-gradient(90deg, ${PALETTE.dark}, ${PALETTE.primary} 60%, ${PALETTE.secondary})`,
                  whiteSpace: "nowrap",
                }}
              >
                New settlement
              </Button>
            </Stack>
          }
        >
          {/* Tals */}
          <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
              <Stack direction="row" gap={1.5} alignItems="center">
                <Chip
                  icon={<span style={{ fontWeight: 900, color: "#f57c00" }}>↑</span>}
                  label={`Sent: ${fmt(sentTotal)}`}
                  sx={{ bgcolor: alpha("#f57c00", 0.06), border: `1px solid ${alpha("#f57c00", 0.24)}` }}
                />
                <Chip
                  icon={<span style={{ fontWeight: 900, color: "#2e7d32" }}>↓</span>}
                  label={`Received: ${fmt(recvTotal)}`}
                  sx={{ bgcolor: alpha("#2e7d32", 0.06), border: `1px solid ${alpha("#2e7d32", 0.24)}` }}
                />
              </Stack>
              <Typography fontWeight={800}>Net: {fmt(recvTotal - sentTotal)}</Typography>
            </Stack>
          </Paper>

          {/* List */}
          {filtered.map((r) => (
            <Paper key={r.id} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5}>
                <Stack direction="row" gap={1}>
                  <Chip
                    label={r.dir === "sent" ? "You sent" : "You received"}
                    size="small"
                    sx={{
                      bgcolor: r.dir === "sent" ? alpha("#f57c00", 0.08) : alpha("#2e7d32", 0.08),
                      color: r.dir === "sent" ? "#c05600" : "#1b5e20",
                      border: `1px solid ${alpha(r.dir === "sent" ? "#f57c00" : "#2e7d32", 0.25)}`
                    }}
                  />
                  <Chip
                    label={`${r.counterparty?.name ? r.counterparty.name : "User #"}`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip label={`Date: ${r.date}`} size="small" variant="outlined" />
                </Stack>

                <Stack direction="row" alignItems="center" gap={1.5}>
                  <Typography variant="h6" fontWeight={900}>{fmt(r.amount)}</Typography>
                  {r.dir === "sent" && (
                    <Tooltip title="Edit">
                      <IconButton onClick={() => openEdit(r)}>
                        <EditRounded />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </Stack>

              {r.note && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography sx={{ opacity: 0.85 }}>{r.note}</Typography>
                </>
              )}
            </Paper>
          ))}
        </Shell>
      </Container>

      {/* Create / Edit dialog */}
      <Dialog open={openCE} onClose={closeCE} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Edit settlement" : "New settlement"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {!editing && (
              <Autocomplete
                options={users}
                loading={loadingUsers}
                getOptionLabel={(o) => (o?.name ? `${o.name} (${o.email})` : o?.email || "")}
                isOptionEqualToValue={(o, v) => o?.id === v?.id}
                value={userObj}
                onChange={(_, v) => { setUserObj(v); setForm((p) => ({ ...p, to_user_id: v?.id || "" })); }}
                renderInput={(params) => <TextField {...params} label="To user" required />}
              />
            )}
            <TextField
              label="Amount"
              type="number"
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              InputProps={{ startAdornment: <InputAdornment position="start">€</InputAdornment> }}
              required
            />
            <TextField
              label="Note (optional)"
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCE}>Cancel</Button>
          <Button onClick={submitCE} variant="contained" disabled={saving || (!editing && !form.to_user_id)}>
            {saving ? "Saving..." : editing ? "Save changes" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
