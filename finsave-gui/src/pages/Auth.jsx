import React, { useEffect, useState } from "react";
import {
  Box, Paper, Tabs, Tab, TextField, Button, Typography,
  InputAdornment, IconButton, MenuItem, Alert, Stack, Divider,
} from "@mui/material";
import { styled, alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import { Visibility, VisibilityOff, Email, Lock, Person } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const PALETTE = { primary: "#318D4F", secondary: "#79D16A", dark: "#1D5E32" };

const theme = createTheme({
  palette: {
    primary: { main: PALETTE.primary },
    secondary: { main: PALETTE.secondary },
    background: { default: "#0e1a12" },
  },
  shape: { borderRadius: 18 },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"',
    button: { fontWeight: 700 },
  },
});

const GlassCard = styled(Paper)(({ theme }) => ({
  width: "100%",
  maxWidth: 680,
  borderRadius: 28,
  padding: theme.spacing(2),
  background: "linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.82) 100%)",
  backdropFilter: "blur(10px) saturate(140%)",
  border: `1px solid ${alpha("#fff", 0.6)}`,
  boxShadow: "0 20px 60px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.6)",
}));

const Header = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: theme.spacing(3),
  borderRadius: 20,
  background: "#fff",
  border: `1px solid ${alpha(PALETTE.secondary, 0.7)}`,
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
}));

const PillTabs = styled(Tabs)(({ theme }) => ({
  minHeight: 0,
  "& .MuiTabs-flexContainer": { gap: theme.spacing(1.5) },
  "& .MuiTabs-indicator": { display: "none" },
}));
const PillTab = styled(Tab)(({ theme }) => ({
  minHeight: 0,
  minWidth: 0,
  padding: theme.spacing(1.2, 2.4),
  borderRadius: 999,
  fontWeight: 700,
  textTransform: "none",
  color: alpha(theme.palette.text.primary, 0.6),
  border: `1px solid ${alpha("#000", 0.08)}`,
  background: alpha("#fff", 0.7),
  "&.Mui-selected": {
    color: theme.palette.primary.contrastText,
    background: `linear-gradient(90deg, ${PALETTE.dark} 0%, ${PALETTE.primary} 60%, ${PALETTE.secondary} 100%)`,
    boxShadow: "0 8px 20px rgba(49,141,79,0.25)",
  },
}));
const Section = styled(Box)(({ theme }) => ({ padding: theme.spacing(3), paddingTop: theme.spacing(2) }));

export default function Auth() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const [loginForm, setLoginForm] = useState({ email: "", password: "", showPassword: false });
  const [registerForm, setRegisterForm] = useState({
    name: "", email: "", password: "", password_confirmation: "", role: "regular",
    showPassword: false, showPasswordConfirm: false,
  });

  const onTab = (_e, v) => { setAlert({ type: "", message: "" }); setTab(v); };

  // ---- HARD-REDIRECT helper (forces navigation if SPA navigation fails)
  
  const forceGo = (path) => {
    navigate(path, { replace: true }); // SPA route change
    // safety net: if still on /auth shortly after, do a full reload to that path
    setTimeout(() => {
      if (window.location.pathname === "/auth") {
        window.location.assign(path);
      }
    }, 150);
  };

  // ---- If token already exists (e.g. after login), auto-redirect off /auth
  useEffect(() => {
    const token = sessionStorage.getItem("auth_token");
    if (!token) return;
    let role = "";
    try {
      role = (JSON.parse(sessionStorage.getItem("auth_user") || "{}")?.role || "").toLowerCase();
    } catch {}
    forceGo(role === "admin" ? "/admin" : "/home");
  }, []); // run once when /auth mounts

  // ===== LOGIN =====
  const handleLogin = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });
    setLoading(true);
    try {
      const res = await axiosClient.post("/login", {
        email: loginForm.email,
        password: loginForm.password,
      });

      sessionStorage.setItem("auth", JSON.stringify(res.data));
      sessionStorage.setItem("auth_token", res.data.token || "");
      sessionStorage.setItem("auth_user", JSON.stringify(res.data.user || {}));

      const role = (res?.data?.user?.role || "").toLowerCase();
      forceGo(role === "admin" ? "/admin" : "/home");
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setAlert({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  // ===== REGISTER =====
  const handleRegister = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });
    setLoading(true);
    try {
      await axiosClient.post("/register", {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        password_confirmation: registerForm.password_confirmation,
        role: registerForm.role,
      });
      setAlert({ type: "success", message: "Registration successful! Please log in." });
      setTab(0);
      setLoginForm((p) => ({ ...p, email: registerForm.email }));
    } catch (err) {
      const errors = err?.response?.data?.errors;
      const message =
        (errors && Object.values(errors).flat().join(" ")) ||
        err?.response?.data?.message ||
        "Registration failed. Please check your inputs.";
      setAlert({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          background: `
            radial-gradient(1200px 800px at 10% -10%, ${alpha(PALETTE.secondary, 0.35)} 0%, transparent 60%),
            radial-gradient(1200px 800px at 100% 100%, ${alpha(PALETTE.primary, 0.25)} 0%, transparent 60%),
            linear-gradient(135deg, ${PALETTE.dark} 0%, ${PALETTE.primary} 45%, ${PALETTE.secondary} 100%)
          `,
          display: "grid",
          placeItems: "center",
          p: { xs: 2, md: 4 },
        }}
      >
        <GlassCard>
          <Header>
            <Box component="img" src="/images/logo.png" alt="FinSave Logo" sx={{ width: 85, height: 85, objectFit: "contain" }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: PALETTE.dark, lineHeight: 1 }}>FinSave</Typography>
              <Typography variant="body1" sx={{ color: alpha("#000", 0.5) }}>Track & split expenses beautifully</Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <PillTabs value={tab} onChange={onTab} aria-label="auth tabs">
              <PillTab label="Login" />
              <PillTab label="Register" />
            </PillTabs>
          </Header>

          {alert.message && (
            <Section sx={{ pt: 2 }}>
              <Alert severity={alert.type}>{alert.message}</Alert>
            </Section>
          )}

          {tab === 0 && (
            <Section component="form" onSubmit={handleLogin}>
              <Stack spacing={2.2}>
                <TextField
                  label="Email" type="email" fullWidth required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Email /></InputAdornment> }}
                />
                <TextField
                  label="Password" type={loginForm.showPassword ? "text" : "password"} fullWidth required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() =>
                          setLoginForm((p) => ({ ...p, showPassword: !p.showPassword }))
                        } edge="end">
                          {loginForm.showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit" variant="contained" size="large" disabled={loading}
                  sx={{
                    mt: 0.5, py: 1.3, borderRadius: 12,
                    background: `linear-gradient(90deg, ${PALETTE.dark} 0%, ${PALETTE.primary} 60%, ${PALETTE.secondary} 100%)`,
                    boxShadow: "0 10px 24px rgba(49,141,79,0.35)",
                  }}
                  fullWidth
                >
                  {loading ? "Please wait..." : "Login"}
                </Button>
              </Stack>
            </Section>
          )}

          <Divider sx={{ my: 1.5, opacity: 0.5 }} />

          {tab === 1 && (
            <Section component="form" onSubmit={handleRegister}>
              <Stack spacing={2.2}>
                <TextField
                  label="Name" fullWidth required
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Person /></InputAdornment> }}
                />
                <TextField
                  label="Email" type="email" fullWidth required
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Email /></InputAdornment> }}
                />
                <TextField
                  label="Password" type={registerForm.showPassword ? "text" : "password"} fullWidth required
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setRegisterForm((p) => ({ ...p, showPassword: !p.showPassword }))}
                          edge="end"
                        >
                          {registerForm.showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Confirm Password" type={registerForm.showPasswordConfirm ? "text" : "password"} fullWidth required
                  value={registerForm.password_confirmation}
                  onChange={(e) => setRegisterForm({ ...registerForm, password_confirmation: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setRegisterForm((p) => ({ ...p, showPasswordConfirm: !p.showPasswordConfirm }))}
                          edge="end"
                        >
                          {registerForm.showPasswordConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField select label="Role" fullWidth value={registerForm.role}
                  onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                >
                  <MenuItem value="regular">Regular</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </TextField>
                <Button
                  type="submit" variant="contained" size="large" disabled={loading}
                  sx={{
                    mt: 0.5, py: 1.3, borderRadius: 12,
                    background: `linear-gradient(90deg, ${PALETTE.dark} 0%, ${PALETTE.primary} 60%, ${PALETTE.secondary} 100%)`,
                    boxShadow: "0 10px 24px rgba(49,141,79,0.35)",
                  }}
                  fullWidth
                >
                  {loading ? "Please wait..." : "Create Account"}
                </Button>
              </Stack>
            </Section>
          )}
        </GlassCard>
      </Box>
    </ThemeProvider>
  );
}
