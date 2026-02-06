// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Chip,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  PeopleAltRounded,
  ShieldRounded,
  CategoryRounded,
  ReceiptLongRounded,
  HandshakeRounded,
} from "@mui/icons-material";
import Slider from "../components/Slider";
import axiosClient from "../api/axiosClient";

const PALETTE = {
  primary: "#318D4F",
  secondary: "#79D16A",
  dark: "#1D5E32",
};

/* ---------- Layout helpers ---------- */
const Hero = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: theme.spacing(4),
  alignItems: "center",
  marginBottom: theme.spacing(6),
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "1.2fr 1fr",
    gap: theme.spacing(6),
  },
}));

export default function AdminDashboard() {
  const images = ["/images/slide1.jpg", "/images/slide2.jpg", "/images/slide3.jpg"];

  // lightweight admin “counters”
  const [counts, setCounts] = useState({
    users: null,
    categories: null,
    expenses: null,
    settlements: null,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [u, c, e, s] = await Promise.allSettled([
          axiosClient.get("/users", { params: { all: 1 } }),
          axiosClient.get("/categories"),
          axiosClient.get("/expenses"),
          axiosClient.get("/settlements"),
        ]);
        if (!mounted) return;
        setCounts({
          users: Array.isArray(u?.value?.data) ? u.value.data.length : u?.value?.data?.data?.length ?? null,
          categories: c?.value?.data?.data?.length ?? c?.value?.data?.length ?? null,
          expenses: e?.value?.data?.data?.length ?? e?.value?.data?.length ?? null,
          settlements: s?.value?.data?.data?.length ?? s?.value?.data?.length ?? null,
        });
      } catch {
        /* optional counters; ignore errors */
      }
    })();
    return () => (mounted = false);
  }, []);

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
      <Container maxWidth="xl" sx={{ pt: { xs: 6, md: 10 } }}>
        {/* HERO */}
        
        <Hero>
          {/* LEFT — Slider */}
          <Box
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
            }}
          >
            <Slider images={images} height={500} />
          </Box>

          {/* RIGHT — Admin copy */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                color="success"
                label="Administrator"
                icon={<ShieldRounded />}
                sx={{
                  bgcolor: alpha("#ffffff", 0.12),
                  border: "1px solid rgba(255,255,255,.35)",
                  color: "#fff",
                  fontWeight: 800,
                }}
              />
              <Typography variant="overline" sx={{ color: alpha("#fff", 0.9), letterSpacing: 1.4 }}>
                FinSave Control Center
              </Typography>
            </Stack>

            <Typography
              variant="h2"
              sx={{
                mt: 1,
                fontWeight: 900,
                lineHeight: 1.05,
                color: "#fff",
                textShadow: "0 10px 36px rgba(0,0,0,0.35)",
              }}
            >
              Manage users, data, and system health
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mt: 2,
                color: alpha("#fff", 0.95),
                lineHeight: 1.6,
                overflowWrap: "anywhere",
                wordBreak: "break-word",
                whiteSpace: "normal",
              }}
            >
              As an administrator you can onboard users, set roles, audit activity,
              and keep FinSave running smoothly.
            </Typography>
          </Box>
        </Hero>
      </Container>
    </Box>
  );
}
