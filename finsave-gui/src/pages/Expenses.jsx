// src/pages/Expenses.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Stack,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  Autocomplete,
  Pagination,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import {
  AddRounded,
  DeleteRounded,
  EditRounded,
  GroupAddRounded,
  CloseRounded,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import axiosClient from "../api/axiosClient";
import { Link } from "react-router-dom";

/**
 * Routes used:
 *   GET    /expenses
 *   POST   /expenses
 *   PATCH  /expenses/:id/update
 *   DELETE /expenses/:id/delete
 *   GET    /categories
 *   GET    /expense-participants
 *   POST   /expense-participants
 *   DELETE /expense-participants/:id
 *   GET    /users?all=1
 *   POST   /settlements
 */

const PALETTE = { primary: "#318D4F", secondary: "#79D16A", dark: "#1D5E32" };
const PAGE_SIZE = 4;     // 2x2
const CARD_HEIGHT = 260; // uniform height

const fmt = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { style: "currency", currency: "EUR" });

// attach participants to expense id (handles a few shapes)
function attachParticipants(expenses, participants) {
  const byExp = {};
  for (const p of participants || []) {
    const expId = p.expense_id ?? p.expense?.id ?? null;
    if (!expId) continue;
    (byExp[expId] ||= []).push(p);
  }
  return (expenses || []).map((e) => ({ ...e, participants: byExp[e.id] || [] }));
}

function SectionCard({ title, subtitle, action, children }) {
  return (
    <Paper
      elevation={10}
      sx={{
        p: 3,
        borderRadius: 3,
        background: "#fff",
        border: `1px solid ${alpha("#000", 0.06)}`,
        boxShadow: "0 18px 44px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.6)",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        gap={2}
        mb={2}
      >
        <Box>
          <Typography variant="h6" fontWeight={900}>{title}</Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: alpha("#000", 0.65) }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Stack>
      {children}
    </Paper>
  );
}

export default function Expenses() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  // data
  const [expenses, setExpenses] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);       // full list
  const [userOptions, setUserOptions] = useState([]); // filtered for dialog
  const [usersLoading, setUsersLoading] = useState(false);

  // filters & pagination
  const [filterCat, setFilterCat] = useState(null);
  const [page, setPage] = useState(1);

  // dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ category_id: "", description: "", amount: "" });
  const [createDate, setCreateDate] = useState(new Date().toISOString().slice(0, 10));
  const [createCatObj, setCreateCatObj] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [editCatObj, setEditCatObj] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteExpense, setDeleteExpense] = useState(null);

  const [partOpen, setPartOpen] = useState(false);
  const [partForm, setPartForm] = useState({ expense_id: "", user_id: "", amount_owed: "" });
  const [partUserObj, setPartUserObj] = useState(null);
  const [partMax, setPartMax] = useState(0);

  const [settleOpen, setSettleOpen] = useState(false);
  const [settleForm, setSettleForm] = useState({ to_user_id: "", amount: "", note: "" });

  const user = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("auth_user") || "{}"); }
    catch { return {}; }
  }, []);

  const totalOwed = (e) =>
    (e?.participants || []).reduce(
      (s, p) => s + Number(p.amount_owed ?? p.owed_amount ?? p.amount ?? 0),
      0
    );
  const remainingFor = (e) => Math.max(0, Number(e?.amount || 0) - totalOwed(e));

  // initial load
  async function fetchAll() {
    setLoading(true);
    try {
      const [expRes, partRes, catRes] = await Promise.all([
        axiosClient.get("/expenses"),
        axiosClient.get("/expense-participants"),
        axiosClient.get("/categories"),
      ]);
      setExpenses(expRes.data?.data ?? expRes.data ?? []);
      setParticipants(partRes.data?.data ?? partRes.data ?? []);
      setCategories(catRes.data?.data ?? catRes.data ?? []);
    } catch (err) {
      setSnack({ open: true, severity: "error", message: err?.response?.data?.message || "Failed loading data." });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { fetchAll(); }, []);

  const merged = useMemo(() => attachParticipants(expenses, participants), [expenses, participants]);

  const filtered = useMemo(() => {
    const catId = filterCat?.id;
    return catId ? merged.filter(e => Number(e.category_id || e.category?.id) === Number(catId)) : merged;
  }, [merged, filterCat]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // users list (return the array so we can filter immediately)
  async function fetchUsersForCombo() {
    if (users.length > 0) return users;
    setUsersLoading(true);
    try {
      const res = await axiosClient.get("/users", { params: { all: 1 } });
      let arr = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      arr = arr.filter((u) => u?.id !== user?.id); // remove current user
      setUsers(arr);
      return arr;
    } catch {
      setSnack({ open: true, severity: "error", message: "Failed loading users list." });
      return [];
    } finally {
      setUsersLoading(false);
    }
  }

  /* ---------- Create expense ---------- */
  const openCreate = () => {
    setCreateForm({ category_id: "", description: "", amount: "" });
    setCreateDate(new Date().toISOString().slice(0, 10));
    setCreateCatObj(null);
    setCreateOpen(true);
  };

  async function createExpense() {
    setSaving(true);
    try {
      await axiosClient.post("/expenses", {
        category_id: Number(createForm.category_id),
        description: createForm.description || "",
        amount: Number(createForm.amount),
        paid_at: createDate,
      });
      setCreateOpen(false);
      await fetchAll();
      setSnack({ open: true, severity: "success", message: "Expense created." });
      setPage(1);
    } catch (err) {
      setSnack({ open: true, severity: "error", message: err?.response?.data?.message || "Failed to create expense." });
    } finally { setSaving(false); }
  }

  /* ---------- Edit ---------- */
  function openEdit(expense) {
    const catId = expense.category?.id || expense.category_id || "";
    setEditExpense({
      id: expense.id,
      category_id: catId,
      description: expense.description || "",
      amount: expense.amount || "",
      paid_at: expense.paid_at?.slice(0, 10) || "",
    });
    setEditCatObj(categories.find((c) => Number(c.id) === Number(catId)) || null);
    setEditOpen(true);
  }

  async function updateExpense() {
    if (!editExpense?.id) return;
    setSaving(true);
    try {
      await axiosClient.patch(`/expenses/${editExpense.id}/update`, {
        category_id: Number(editExpense.category_id),
        description: editExpense.description,
        amount: Number(editExpense.amount),
        paid_at: editExpense.paid_at,
      });
      setEditOpen(false);
      await fetchAll();
      setSnack({ open: true, severity: "success", message: "Expense updated." });
    } catch (err) {
      setSnack({ open: true, severity: "error", message: err?.response?.data?.message || "Failed to update expense." });
    } finally { setSaving(false); }
  }

  /* ---------- Delete ---------- */
  function openDelete(expense) { setDeleteExpense(expense); setDeleteOpen(true); }
  async function confirmDelete() {
    if (!deleteExpense?.id) return;
    try {
      await axiosClient.delete(`/expenses/${deleteExpense.id}/delete`);
      setDeleteOpen(false);
      await fetchAll();
      setSnack({ open: true, severity: "success", message: "Expense deleted." });
      setPage(1);
    } catch (err) {
      setSnack({ open: true, severity: "error", message: err?.response?.data?.message || "Failed to delete expense." });
    }
  }

  /* ---------- Participants ---------- */
  async function openAddParticipant(expense) {
    const remaining = remainingFor(expense);
    setPartMax(remaining);
    setPartForm({ expense_id: expense.id, user_id: "", amount_owed: remaining > 0 ? "" : 0 });
    setPartUserObj(null);

    const allUsers = await fetchUsersForCombo();
    const existingIds = new Set((expense.participants || []).map((p) => p.user?.id ?? p.user_id));
    const filteredUsers = (allUsers.length ? allUsers : users).filter((u) => !existingIds.has(u.id));
    setUserOptions(filteredUsers);

    setPartOpen(true);
  }
  function closeAddParticipant() {
    setPartOpen(false);
    setPartForm({ expense_id: "", user_id: "", amount_owed: "" });
    setPartUserObj(null);
    setPartMax(0);
    setUserOptions([]);
  }

  async function addParticipant() {
    setSaving(true);
    try {
      const res = await axiosClient.post("/expense-participants", {
        expense_id: Number(partForm.expense_id),
        user_id: Number(partForm.user_id),
        amount_owed: Number(partForm.amount_owed || 0),
        is_settled: false,
      });

      const created = res?.data?.data ?? res?.data ?? null;
      if (created) setParticipants((prev) => [...prev, created]);
      else await fetchAll();

      closeAddParticipant();
      setSnack({ open: true, severity: "success", message: "Participant added." });
    } catch (err) {
      setSnack({ open: true, severity: "error", message: err?.response?.data?.message || "Failed to add participant." });
    } finally { setSaving(false); }
  }

  async function removeParticipant(part) {
    try {
      await axiosClient.delete(`/expense-participants/${part.id}`);
      setParticipants((prev) => prev.filter((p) => p.id !== part.id));
      setSnack({ open: true, severity: "success", message: "Participant removed." });
    } catch (err) {
      setSnack({ open: true, severity: "error", message: err?.response?.data?.message || "Failed to remove participant." });
    }
  }

  /* ---------- Settlements ---------- */
  function openSettle(expense) {
    setSettleForm({
      to_user_id: expense.payer?.id || expense.payer_id || "",
      amount: "",
      note: `Settlement for expense #${expense.id}`,
    });
    setSettleOpen(true);
  }
  function closeSettle() { setSettleOpen(false); setSettleForm({ to_user_id: "", amount: "", note: "" }); }

  async function createSettlement() {
    setSaving(true);
    try {
      await axiosClient.post("/settlements", {
        to_user_id: Number(settleForm.to_user_id),
        amount: Number(settleForm.amount || 0),
        note: settleForm.note || "",
      });
      closeSettle();
      setSnack({ open: true, severity: "success", message: "Settlement recorded." });
    } catch (err) {
      setSnack({ open: true, severity: "error", message: err?.response?.data?.message || "Failed to record settlement." });
    } finally { setSaving(false); }
  }

  /* ---------- UI ---------- */
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `
          radial-gradient(1200px 800px at -10% -20%, ${alpha(PALETTE.secondary, 0.28)} 0%, transparent 60%),
          radial-gradient(900px 600px at 120% 120%, ${alpha(PALETTE.primary, 0.22)} 0%, transparent 60%),
          linear-gradient(135deg, ${PALETTE.dark} 0%, ${PALETTE.primary} 45%, ${PALETTE.secondary} 100%)
        `,
        pb: 10,
      }}
    >
            <nav aria-label="breadcrumb" style={{ font: "14px/1.4 system-ui", marginLeft: "200px", color:"white"}}>
              <span><Link sx={{ color:"white"}} to="/home">Home</Link></span>
              <span style={{ margin: "0 8px", opacity: 0.5 }}>/</span>
              <span aria-current="page" style={{ fontWeight: 600 }}>Expenses</span>
            </nav>
      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 } }}>
        <SectionCard
          title="Your expenses"
          subtitle="Expenses you paid or participated in."
          action={
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
              <Autocomplete
                sx={{ minWidth: 220 }}
                options={[{ id: "", name: "All categories" }, ...categories]}
                getOptionLabel={(o) => o?.name || ""}
                isOptionEqualToValue={(o, v) => o?.id === v?.id}
                value={filterCat || { id: "", name: "All categories" }}
                onChange={(_, v) => { setFilterCat(v?.id ? v : null); setPage(1); }}
                renderInput={(params) => <TextField {...params} label="Filter by category" size="small" />}
              />
              <Button
                startIcon={<AddRounded />}
                variant="contained"
                onClick={openCreate}
                sx={{
                  borderRadius: 999,
                  fontWeight: 800,
                  background: `linear-gradient(90deg, ${PALETTE.dark}, ${PALETTE.primary} 60%, ${PALETTE.secondary})`,
                  whiteSpace: "nowrap",
                }}
              >
                Add expense
              </Button>
            </Stack>
          }
        >
          <Box sx={{ minHeight: 2 * CARD_HEIGHT + 40 }}>
            {loading ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <CircularProgress size={18} />
                <Typography variant="caption">Loading…</Typography>
              </Stack>
            ) : filtered.length === 0 ? (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  No expenses yet. Click “Add expense” to create your first one.
                </Alert>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <Paper key={i} variant="outlined" sx={{ width: "100%", height: CARD_HEIGHT, borderRadius: 2, borderColor: alpha("#000", 0.08), bgcolor: alpha("#000", 0.02) }} />
                  ))}
                </Box>
              </>
            ) : (
              <>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  {pageItems.map((e) => {
                    const remaining = remainingFor(e);
                    const full = remaining <= 0;
                    return (
                      <Paper
                        key={e.id}
                        variant="outlined"
                        sx={{ width: "100%", height: CARD_HEIGHT, p: 2, display: "flex", flexDirection: "column", gap: 1, borderRadius: 2, borderColor: alpha("#000", 0.08), bgcolor: "#fff" }}
                      >
                        {/* header */}
                        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                            <Chip label={e.category?.name || `Category #${e.category_id}`} size="small" sx={{ bgcolor: alpha(PALETTE.secondary, 0.2), color: PALETTE.dark, fontWeight: 700 }} />
                            <Typography fontWeight={800} noWrap title={e.description || "No description"}>{e.description || "No description"}</Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Tooltip title={full ? `Fully allocated (${fmt(Number(e.amount))})` : `Add participant (remaining ${fmt(remaining)})`}>
                              <span>
                                <IconButton onClick={() => openAddParticipant(e)} color="primary" disabled={full}>
                                  <GroupAddRounded />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Edit"><IconButton onClick={() => openEdit(e)}><EditRounded /></IconButton></Tooltip>
                            <Tooltip title="Delete"><IconButton color="error" onClick={() => openDelete(e)}><DeleteRounded /></IconButton></Tooltip>
                          </Stack>
                        </Stack>
                        {/* meta */}
                        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                          <Stack direction="row" spacing={1.5} flexWrap="wrap">
                            <Chip label={`Paid by: ${e.payer?.name}`} size="small" variant="outlined" />
                            <Chip label={`Date: ${e.paid_at?.slice(0, 10) || ""}`} size="small" variant="outlined" />
                          </Stack>
                          <Typography variant="h6" fontWeight={900}>{fmt(e.amount)}</Typography>
                        </Stack>

                        <Divider sx={{ my: 1 }} />

                        {/* participants */}
                        <Box sx={{ flex: 1, overflow: "hidden" }}>
                          {e.participants?.length ? (
                            <Stack spacing={0.5}>
                              {e.participants.map((p) => (
                                <Stack key={p.id} direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                                  <Typography noWrap>
                                    {p.user?.name ? ` ${p.user.name}` : ""}
                                  </Typography>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Chip label={fmt(p.amount_owed ?? p.owed_amount ?? p.amount ?? 0)} color="success" variant="outlined" size="small" />
                                    <Tooltip title="Remove participant">
                                      <IconButton size="small" onClick={() => removeParticipant(p)}>
                                        <CloseRounded fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                </Stack>
                              ))}
                            </Stack>
                          ) : (
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                              No participants yet.
                            </Typography>
                          )}
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>

                <Stack alignItems="center" mt={2}>
                  <Pagination page={page} onChange={(_, v) => setPage(v)} count={totalPages} color="primary" shape="rounded" />
                </Stack>
              </>
            )}
          </Box>
        </SectionCard>
      </Container>

      {/* Create */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add expense</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              options={categories}
              getOptionLabel={(o) => o?.name || ""}
              isOptionEqualToValue={(o, v) => o?.id === v?.id}
              value={createCatObj ?? null}
              onChange={(_, v) => { setCreateCatObj(v ?? null); setCreateForm((p) => ({ ...p, category_id: v?.id ?? "" })); }}
              renderInput={(params) => <TextField {...params} label="Category" required />}
            />
            <TextField label="Description (optional)" value={createForm.description ?? ""} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} fullWidth />
            <TextField label="Amount" type="number" value={createForm.amount ?? ""} onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">€</InputAdornment> }} required fullWidth />
            <TextField label="Paid at" type="date" value={createDate ?? ""} onChange={(e) => setCreateDate(e.target.value)} InputLabelProps={{ shrink: true }} required fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={createExpense} variant="contained" disabled={saving}>{saving ? "Saving..." : "Create"}</Button>
        </DialogActions>
      </Dialog>

      {/* Edit */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit expense</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              options={categories}
              getOptionLabel={(o) => o?.name || ""}
              isOptionEqualToValue={(o, v) => o?.id === v?.id}
              value={editCatObj ?? null}
              onChange={(_, v) => { setEditCatObj(v ?? null); setEditExpense((p) => ({ ...p, category_id: v?.id ?? "" })); }}
              renderInput={(params) => <TextField {...params} label="Category" required />}
            />
            <TextField label="Description" value={editExpense?.description ?? ""} onChange={(e) => setEditExpense((p) => ({ ...p, description: e.target.value }))} fullWidth />
            <TextField label="Amount" type="number" value={editExpense?.amount ?? ""} onChange={(e) => setEditExpense((p) => ({ ...p, amount: e.target.value }))} InputProps={{ startAdornment: <InputAdornment position="start">€</InputAdornment> }} required fullWidth />
            <TextField label="Paid at" type="date" value={editExpense?.paid_at ?? ""} onChange={(e) => setEditExpense((p) => ({ ...p, paid_at: e.target.value }))} InputLabelProps={{ shrink: true }} required fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={updateExpense} variant="contained" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
        </DialogActions>
      </Dialog>

      {/* Add participant */}
      <Dialog open={partOpen} onClose={closeAddParticipant} maxWidth="xs" fullWidth>
        <DialogTitle>Add participant</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              options={userOptions}
              loading={usersLoading}
              getOptionLabel={(o) => (o?.name ? `${o.name} (${o.email})` : o?.email || "")}
              isOptionEqualToValue={(o, v) => o?.id === v?.id}
              value={partUserObj ?? null}
              onChange={(_, v) => { setPartUserObj(v ?? null); setPartForm((p) => ({ ...p, user_id: v?.id ?? "" })); }}
              renderOption={(props, option) => {
                const initials = (option?.name || option?.email || "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
                return (
                  <ListItem {...props} key={option.id} sx={{ py: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: alpha(PALETTE.primary, 0.2), color: PALETTE.dark, fontWeight: 700 }}>
                        {initials}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={option?.name || option?.email}
                      secondary={option?.name ? option?.email : null}
                      primaryTypographyProps={{ fontWeight: 700 }}
                    />
                  </ListItem>
                );
              }}
              renderInput={(params) => <TextField {...params} label="User" placeholder="Choose a user" required />}
            />

            <TextField
              label="Amount to refund"
              type="number"
              value={partForm.amount_owed ?? ""}
              onChange={(e) => setPartForm((p) => ({ ...p, amount_owed: e.target.value }))}
              InputProps={{ startAdornment: <InputAdornment position="start">€</InputAdornment> }}
              inputProps={{ min: 0, max: partMax, step: "0.01" }}
              helperText={`Remaining for this expense: ${fmt(partMax)}`}
              required
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddParticipant}>Cancel</Button>
          <Button
            onClick={addParticipant}
            variant="contained"
            disabled={
              saving ||
              !partForm.user_id ||
              Number(partForm.amount_owed) <= 0 ||
              Number(partForm.amount_owed) > Number(partMax)
            }
          >
            {saving ? "Saving..." : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settlement */}
      <Dialog open={settleOpen} onClose={closeSettle} maxWidth="xs" fullWidth>
        <DialogTitle>Record settlement</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="To user ID (payer)" type="number" value={settleForm.to_user_id ?? ""} onChange={(e) => setSettleForm((p) => ({ ...p, to_user_id: e.target.value }))} fullWidth />
            <TextField label="Amount" type="number" value={settleForm.amount ?? ""} onChange={(e) => setSettleForm((p) => ({ ...p, amount: e.target.value }))} InputProps={{ startAdornment: <InputAdornment position="start">€</InputAdornment> }} fullWidth />
            <TextField label="Note (optional)" value={settleForm.note ?? ""} onChange={(e) => setSettleForm((p) => ({ ...p, note: e.target.value }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSettle}>Cancel</Button>
          <Button onClick={createSettlement} variant="contained" disabled={saving}>{saving ? "Saving..." : "Record"}</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
