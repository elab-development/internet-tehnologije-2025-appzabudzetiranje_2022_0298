import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Stack,
  Link as MuiLink,
  Button,
  Tooltip,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import axiosClient from "../api/axiosClient";

const COLORS = { primary: "#318D4F", secondary: "#79D16A", dark: "#1D5E32" };
const PALETTE = COLORS;

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Read user
  const user = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("auth_user") || "{}"); }
    catch { return {}; }
  }, []);
  const isAdmin = (user?.role || "").toLowerCase() === "admin";
  const initial = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();

  // Build links dynamically
  const LINKS = isAdmin
    ? [
        { label: "Dashboard", to: "/admin" },
        { label: "Users", to: "/admin/users" },
      ]
    : [
        { label: "Home", to: "/home" },
        { label: "About Us", to: "/about" },
        { label: "Expenses", to: "/expenses" },
        { label: "Settlements", to: "/settlements" },
        { label: "Statistics", to: "/statistics" },
      ];

  // Animated highlight
  const listRef = useRef(null);
  const itemRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const idx = LINKS.findIndex((l) => location.pathname.startsWith(l.to));
    setActiveIndex(idx < 0 ? 0 : idx);
    // reset refs when links set changes
    itemRefs.current = [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isAdmin]);

  useEffect(() => {
    const el = itemRefs.current[activeIndex];
    const parent = listRef.current;
    if (!el || !parent) return;
    const pr = parent.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setIndicator({ left: r.left - pr.left, width: r.width, opacity: 1 });
  }, [activeIndex, listRef, itemRefs, location.pathname]);

  useEffect(() => {
    const onResize = () => {
      const el = itemRefs.current[activeIndex];
      const parent = listRef.current;
      if (!el || !parent) return;
      const pr = parent.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      setIndicator((p) => ({ ...p, left: r.left - pr.left, width: r.width }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIndex]);

  // Logout
  const handleLogout = async () => {
    try { await axiosClient.post("/logout"); } catch {}
    finally {
      sessionStorage.removeItem("auth");
      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_user");
      navigate("/auth", { replace: true });
    }
  };

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        backdropFilter: "blur(6px)",
        background: `
          radial-gradient(1200px 800px at -10% -20%, ${alpha(PALETTE.secondary, 0.28)} 0%, transparent 60%),
          radial-gradient(900px 600px at 120% 120%, ${alpha(PALETTE.primary, 0.22)} 0%, transparent 60%),
          linear-gradient(135deg, ${PALETTE.dark} 0%, ${PALETTE.primary} 45%, ${PALETTE.secondary} 100%)
        `,
        py: 2,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={6}
          sx={{
            borderRadius: 3,
            px: 2,
            py: 1.25,
            display: "flex",
            alignItems: "center",
            gap: 2,
            boxShadow: "0 12px 30px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          {/* Logo */}
          <Box component={Link} to={isAdmin ? "/admin" : "/home"} sx={{ display: "flex", alignItems: "center", textDecoration: "none", pr: 1 }}>
            <Box component="img" src="/images/logo.png" alt="FinSave" sx={{ width: 44, height: 44, objectFit: "contain", borderRadius: 1 }} />
          </Box>

          {/* Links */}
          <Box
            ref={listRef}
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 1,
              mx: "auto",
              px: 1,
              minHeight: 48,
              borderRadius: 999,
              backgroundColor: alpha("#000", 0.03),
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 4,
                bottom: 4,
                left: indicator.left,
                width: indicator.width,
                opacity: indicator.opacity,
                borderRadius: 999,
                background: "linear-gradient(90deg, #1D5E32 0%, #318D4F 60%, #79D16A 100%)",
                boxShadow: "0 8px 18px rgba(49,141,79,0.28)",
                transition: "left 220ms ease, width 220ms ease, opacity 220ms ease",
              }}
            />
            {LINKS.map((link, i) => (
              <MuiLink
                key={link.to}
                component={Link}
                to={link.to}
                ref={(el) => (itemRefs.current[i] = el)}
                onMouseEnter={() => setActiveIndex(i)}
                onFocus={() => setActiveIndex(i)}
                underline="none"
                sx={{
                  position: "relative",
                  px: 2.2,
                  py: 1.1,
                  borderRadius: 999,
                  color: i === activeIndex ? "common.white" : alpha("#000", 0.75),
                  fontWeight: 700,
                  letterSpacing: 0.2,
                  transition: "color 200ms ease",
                  zIndex: 1,
                }}
              >
                {link.label}
              </MuiLink>
            ))}
          </Box>

          {/* User */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                bgcolor: alpha(COLORS.primary, 0.15),
                color: COLORS.dark,
                border: `2px solid ${alpha(COLORS.primary, 0.5)}`,
                width: 40,
                height: 40,
                fontWeight: 800,
              }}
            >
              {initial}
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" }, lineHeight: 1.15 }}>
              <Typography variant="body2" fontWeight={700}>
                {user?.name || user?.email || "User"}
              </Typography>
              <Typography variant="caption" sx={{ color: alpha("#000", 0.6) }}>
                {user?.role ? user.role : "regular"}
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ ml: "auto" }} />

          {/* Logout */}
          <Tooltip title="Logout">
            <Button
              onClick={handleLogout}
              startIcon={<LogoutRounded />}
              variant="contained"
              sx={{
                borderRadius: 999,
                px: 2.2,
                py: 1,
                fontWeight: 800,
                background: "linear-gradient(90deg, #1D5E32 0%, #318D4F 60%, #79D16A 100%)",
                boxShadow: "0 8px 18px rgba(49,141,79,0.28)",
                "&:hover": {
                  background: "linear-gradient(90deg, #184021 0%, #256d3b 60%, #5fb65a 100%)",
                },
              }}
            >
              Logout
            </Button>
          </Tooltip>
        </Paper>
      </Container>
    </Box>
  );
}