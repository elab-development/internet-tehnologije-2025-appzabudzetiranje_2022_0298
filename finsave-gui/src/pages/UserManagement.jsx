import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";
import {
  SearchRounded,
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  EditRounded,
  DeleteRounded,
  VisibilityRounded,
  DownloadRounded,
  SaveRounded,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import axiosClient from "../api/axiosClient";
import { Link } from "react-router-dom";

const PALETTE = { primary: "#318D4F", secondary: "#79D16A", dark: "#1D5E32" };
const EUR = (n) => Number(n ?? 0).toLocaleString();

export default function UserManagement() {
  const me = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("auth_user") || "{}");
    } catch {
      return {};
    }
  }, []);
  const isAdmin = (me?.role || "").toLowerCase() === "admin";

  // table state
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name_asc"); // name_asc | name_desc
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // dialogs
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // edit form
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "regular",
    password: "",
    password_confirmation: "",
  });

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  async function load() {
    setLoading(true);
    try {
      const res = await axiosClient.get("/users", {
        params: {
          search: search || undefined,
          page: page + 1,
          per_page: perPage,
          sort,
        },
      });

      const payload = res?.data ?? {};
      // Flexible shape for Laravel paginator
      const list = payload.data ?? payload;
      setRows(Array.isArray(list) ? list : []);

      const meta = payload.meta ?? {};
      setTotal(meta.total ?? payload.total ?? list.length ?? 0);
    } catch (err) {
      setSnack({
        open: true,
        severity: "error",
        message: err?.response?.data?.message || "Failed to load users.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, sort]);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(0);
      load();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  /* ---------- Handlers ---------- */
  function openView(row) {
    setSelected(row);
    setViewOpen(true);
  }

  async function openEdit(row) {
    try {
      const res = await axiosClient.get(`/users/${row.id}`);
      const u = res?.data ?? row;
      setSelected(u);
      setForm({
        name: u.name || "",
        email: u.email || "",
        role: u.role || "regular",
        password: "",
        password_confirmation: "",
      });
      setEditOpen(true);
    } catch (err) {
      setSnack({
        open: true,
        severity: "error",
        message: err?.response?.data?.message || "Failed to open user.",
      });
    }
  }

  async function saveEdit() {
    if (!selected?.id) return;
    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
      };
      if (form.password) {
        payload.password = form.password;
        payload.password_confirmation = form.password_confirmation;
      }

      await axiosClient.patch(`/users/${selected.id}`, payload);
      setEditOpen(false);
      setSnack({ open: true, severity: "success", message: "User updated." });
      load();
    } catch (err) {
      setSnack({
        open: true,
        severity: "error",
        message: err?.response?.data?.message || "Update failed.",
      });
    }
  }

  function confirmDelete(row) {
    setSelected(row);
    setDeleteOpen(true);
  }

  async function doDelete() {
    if (!selected?.id) return;
    try {
      await axiosClient.delete(`/users/${selected.id}`);
      setDeleteOpen(false);
      setSnack({ open: true, severity: "success", message: "User deleted." });
      // If last item on last page is removed, go one page back
      if (rows.length === 1 && page > 0) setPage((p) => p - 1);
      else load();
    } catch (err) {
      setSnack({
        open: true,
        severity: "error",
        message: err?.response?.data?.message || "Delete failed.",
      });
    }
  }

  async function exportCsv() {
    try {
      const res = await axiosClient.get("/users/export", {
        params: { search: search || undefined, sort },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setSnack({
        open: true,
        severity: "error",
        message: err?.response?.data?.message || "Export failed.",
      });
    }
  }

  const sortIsAsc = sort === "name_asc";

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
              <span><Link sx={{ color:"white"}} to="/admin">Admin Dashboard</Link></span>
              <span style={{ margin: "0 8px", opacity: 0.5 }}>/</span>
              <span aria-current="page" style={{ fontWeight: 600 }}>User Management</span>
            </nav>
      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 } }}>
        {/* Header / Toolbar */}
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
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h6" fontWeight={900}>
                User management
              </Typography>
              <Typography variant="body2" sx={{ color: alpha("#000", 0.65) }}>
                Search, sort (by name), edit or remove users. Export the current view to CSV.
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
              <TextField
                size="small"
                placeholder="Search name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: { xs: "100%", sm: 300 } }}
              />

              <Tooltip title={`Sort by name (${sortIsAsc ? "A→Z" : "Z→A"})`}>
                <Button
                  onClick={() => setSort(sortIsAsc ? "name_desc" : "name_asc")}
                  variant="outlined"
                  startIcon={sortIsAsc ? <ArrowDownwardRounded /> : <ArrowUpwardRounded />}
                  sx={{ borderRadius: 999, fontWeight: 800 }}
                >
                  {sortIsAsc ? "A → Z" : "Z → A"}
                </Button>
              </Tooltip>

              <Tooltip title={isAdmin ? "Export CSV" : "Admin only"}>
                <span>
                  <Button
                    onClick={exportCsv}
                    startIcon={<DownloadRounded />}
                    variant="contained"
                    disabled={!isAdmin}
                    sx={{
                      borderRadius: 999,
                      fontWeight: 800,
                      background: `linear-gradient(90deg, ${PALETTE.dark}, ${PALETTE.primary} 60%, ${PALETTE.secondary})`,
                    }}
                  >
                    Export CSV
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Table */}
          <TableContainer sx={{ borderRadius: 2, border: `1px solid ${alpha("#000", 0.08)}` }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="left" sx={{ fontWeight: 900 }}>Name</TableCell>
                  <TableCell align="left" sx={{ fontWeight: 900 }}>Email</TableCell>
                  <TableCell align="left" sx={{ fontWeight: 900 }}>Role</TableCell>
                  <TableCell align="left" sx={{ fontWeight: 900, whiteSpace: "nowrap" }}>Created</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 900 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={r.role}
                        color={r.role === "admin" ? "warning" : "success"}
                        variant={r.role === "admin" ? "filled" : "outlined"}
                        sx={{ textTransform: "capitalize", fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>{String(r.created_at || "").slice(0, 10)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="View">
                          <IconButton onClick={() => openView(r)}>
                            <VisibilityRounded />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={isAdmin ? "Edit" : "Admin only"}>
                          <span>
                            <IconButton onClick={() => openEdit(r)} disabled={!isAdmin}>
                              <EditRounded />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={isAdmin ? "Delete" : "Admin only"}>
                          <span>
                            <IconButton color="error" onClick={() => confirmDelete(r)} disabled={!isAdmin}>
                              <DeleteRounded />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6, color: alpha("#000", 0.6) }}>
                      No users match your query.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={perPage}
            onRowsPerPageChange={(e) => {
              setPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 20, 50]}
          />
        </Paper>
      </Container>

      {/* VIEW */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>User details</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            <Typography><strong>Name:</strong> {selected?.name}</Typography>
            <Typography><strong>Email:</strong> {selected?.email}</Typography>
            <Typography><strong>Role:</strong> {selected?.role}</Typography>
            <Typography><strong>Created:</strong> {String(selected?.created_at || "").slice(0, 19)}</Typography>
            <Typography><strong>Updated:</strong> {String(selected?.updated_at || "").slice(0, 19)}</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* EDIT */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit user</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
            />
            <TextField
              select
              label="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              fullWidth
            >
              <MenuItem value="regular">regular</MenuItem>
              <MenuItem value="admin">admin</MenuItem>
            </TextField>
            <Divider />
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              (Optional) Change password
            </Typography>
            <TextField
              label="New password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              fullWidth
            />
            <TextField
              label="Confirm new password"
              type="password"
              value={form.password_confirmation}
              onChange={(e) =>
                setForm({ ...form, password_confirmation: e.target.value })
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button
            onClick={saveEdit}
            variant="contained"
            startIcon={<SaveRounded />}
            sx={{
              borderRadius: 999,
              fontWeight: 800,
              background: `linear-gradient(90deg, ${PALETTE.dark}, ${PALETTE.primary} 60%, ${PALETTE.secondary})`,
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete user</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{selected?.name || selected?.email}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={doDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
