// src/pages/Statistics.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  Chip,
  TextField,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import axiosClient from "../api/axiosClient";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Link } from "react-router-dom";

const PALETTE = { primary: "#318D4F", secondary: "#79D16A", dark: "#1D5E32" };
const EUR = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { style: "currency", currency: "EUR" });

/* ---------- Small shell/card ---------- */
function Section({ title, subtitle, right, children }) {
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
        {right}
      </Stack>
      {children}
    </Paper>
  );
}

/* ---------- Helpers ---------- */
const shortMonth = new Intl.DateTimeFormat(undefined, { month: "short" });
function monthsBack(count) {
  const out = [];
  const d = new Date();
  d.setDate(1);
  for (let i = count - 1; i >= 0; i--) {
    const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push({
      key: `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`,
      label: `${shortMonth.format(dt)} ${dt.getFullYear()}`,
      y: dt.getFullYear(),
      m: dt.getMonth() + 1,
    });
  }
  return out;
}

export default function Statistics() {
  const me = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("auth_user") || "{}"); }
    catch { return {}; }
  }, []);
  const myId = Number(me?.id || 0);

  const [range, setRange] = useState(12); // last N months
  const [stats, setStats] = useState({ paid_total: 0, owed_total: 0, balance: 0 });
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [s, e] = await Promise.all([
          axiosClient.get("/stats/savings"),
          axiosClient.get("/expenses"),
        ]);
        if (!mounted) return;

        // /stats/savings -> { paid_total, owed_total, balance }
        const sData = s?.data?.data ?? s?.data ?? {};
        setStats({
          paid_total: Number(sData.paid_total || 0),
          owed_total: Number(sData.owed_total || 0),
          balance: Number(sData.balance || 0),
        });

        // /-> list relevant to this user; keep full payload shape flexible
        const eData = e?.data?.data ?? e?.data ?? [];
        setExpenses(Array.isArray(eData) ? eData : []);
      } catch (err) {
        setSnack({
          open: true,
          severity: "error",
          message: err?.response?.data?.message || "Failed to load statistics.",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  /* ---------- Build monthly "Paid by you" series ---------- */
  const chartData = useMemo(() => {
    const buckets = monthsBack(range).map((m) => ({ ...m, paid_by_you: 0 }));
    const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]));

    for (const x of expenses) {
      const payerId = Number(x.payer_id ?? x.payer?.id ?? 0);
      if (payerId !== myId) continue;
      const dateStr = (x.paid_at || x.created_at || "").slice(0, 10);
      if (!dateStr) continue;
      const [Y, M] = dateStr.split("-").map((t) => Number(t));
      const key = `${Y}-${String(M).padStart(2, "0")}`;
      if (byKey[key]) byKey[key].paid_by_you += Number(x.amount || 0);
    }
    return buckets;
  }, [expenses, range, myId]);

  const latestMonthSpend = chartData.length ? chartData[chartData.length - 1].paid_by_you : 0;

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
        <span aria-current="page" style={{ fontWeight: 600 }}>Statistics</span>
      </nav>
      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 } }}>
        {/* KPI Header */}
        <Section
          title="Savings analytics"
          subtitle="Personal insights based on what you paid and what others owe you."
          right={
            <TextField
              select size="small" label="Range"
              value={range}
              onChange={(e) => setRange(Number(e.target.value))}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value={6}>Last 6 months</MenuItem>
              <MenuItem value={12}>Last 12 months</MenuItem>
              <MenuItem value={18}>Last 18 months</MenuItem>
            </TextField>
          }
        >
          {loading ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="caption">Loading…</Typography>
            </Stack>
          ) : (
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
              justifyContent="space-between"
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Chip
                  label={`Paid total: ${EUR(stats.paid_total)}`}
                  sx={{
                    bgcolor: alpha("#1e88e5", 0.08),
                    border: `1px solid ${alpha("#1e88e5", 0.24)}`,
                    fontWeight: 700,
                  }}
                />
                <Chip
                  label={`Owed to you: ${EUR(stats.owed_total)}`}
                  sx={{
                    bgcolor: alpha("#2e7d32", 0.08),
                    border: `1px solid ${alpha("#2e7d32", 0.24)}`,
                    fontWeight: 700,
                  }}
                />
                <Chip
                  label={`Balance: ${EUR(stats.balance)}`}
                  sx={{
                    bgcolor: alpha(stats.balance >= 0 ? "#79D16A" : "#e53935", 0.12),
                    border: `1px solid ${alpha(stats.balance >= 0 ? "#79D16A" : "#e53935", 0.28)}`,
                    fontWeight: 900,
                  }}
                />
              </Stack>

              <Stack alignItems={{ xs: "flex-start", md: "flex-end" }} spacing={0}>
                <Typography variant="overline" sx={{ opacity: 0.7 }}>Latest month paid</Typography>
                <Typography variant="h6" fontWeight={900}>{EUR(latestMonthSpend)}</Typography>
              </Stack>
            </Stack>
          )}
        </Section>

        {/* Chart */}
        <Section
          title="Your spending trend"
          subtitle="Sum of expenses you paid each month."
        >
          <Box sx={{ width: "100%", height: 360 }}>
            <ResponsiveContainer>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="gPaid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PALETTE.secondary} stopOpacity={0.65} />
                    <stop offset="100%" stopColor={PALETTE.secondary} stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha("#000", 0.08)} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: alpha("#000", 0.18) }}
                />
                <YAxis
                  tickFormatter={(v) => EUR(v).replace(/\.\d{2}$/, "")}
                  width={72}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: alpha("#000", 0.18) }}
                />
                <Tooltip
                  formatter={(v) => EUR(v)}
                  labelStyle={{ fontWeight: 700 }}
                />
                <Area
                  type="monotone"
                  dataKey="paid_by_you"
                  name="Paid by you"
                  stroke={PALETTE.primary}
                  fill="url(#gPaid)"
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Section>
      </Container>

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
