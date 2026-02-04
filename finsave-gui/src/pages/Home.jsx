import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { Savings, Shield, Speed, Assessment } from "@mui/icons-material";
import Slider from "../components/Slider";

/**
 * Modern Home
 * - Slider on the LEFT, heading/subheading on the RIGHT (no logo)
 * - 4 feature cards in ONE row on desktop (responsive below)
 * - Text in cards wraps nicely
 */

const PALETTE = {
  primary: "#318D4F",
  secondary: "#79D16A",
  dark: "#1D5E32",
};

// --- Styled helpers ---
const Hero = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: theme.spacing(4),
  alignItems: "center",
  marginBottom: theme.spacing(6),
  // two columns from md up
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "1.2fr 1fr",
    gap: theme.spacing(6),
  },
}));

const FeatureGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(3),
  // 1 / 2 / 4 columns
  gridTemplateColumns: "1fr",
  [theme.breakpoints.up("sm")]: { gridTemplateColumns: "repeat(2, 1fr)" },
  [theme.breakpoints.up("md")]: { gridTemplateColumns: "repeat(4, 1fr)" },
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  height: "100%",
  padding: theme.spacing(3),
  borderRadius: 18,
  background: "#fff",
  border: `1px solid ${alpha("#000", 0.06)}`,
  boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  transition: "transform .2s ease, box-shadow .2s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 18px 44px rgba(0,0,0,0.22)",
  },
}));

const IconTile = styled(Box)(() => ({
  width: 56,
  height: 56,
  borderRadius: 12,
  display: "grid",
  placeItems: "center",
  color: "#fff",
  background: `linear-gradient(135deg, ${PALETTE.dark} 0%, ${PALETTE.primary} 70%, ${PALETTE.secondary} 100%)`,
  boxShadow: "0 10px 22px rgba(49,141,79,0.35)",
}));

export default function Home() {
  // images from /public/images
    const images = [
    "/images/slide1.jpg",
    "/images/slide2.jpg",
    "/images/slide3.jpg",
  ];

  const features = [
    {
      title: "Smarter Tracking",
      desc: "Log expenses in seconds and see where your money really goes.",
      icon: <Assessment fontSize="large" />,
    },
    {
      title: "Instant Splits",
      desc: "Split bills fairly with friends and settle up with one tap.",
      icon: <Savings fontSize="large" />,
    },
    {
      title: "Secure by Design",
      desc: "Protected routes, token auth, and robust data validation.",
      icon: <Shield fontSize="large" />,
    },
    {
      title: "Fast & Simple",
      desc: "Minimal clicks to get things done, optimized for speed.",
      icon: <Speed fontSize="large" />,
    },
  ];

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
      {/* XL container so 4 cards truly fit on one row */}
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
            {/* Ensure height so the slider is visible */}
            <Slider images={images} height={500} />
          </Box>

          {/* RIGHT — Copy */}
          <Box>
            <Typography
              variant="overline"
              sx={{
                letterSpacing: 2.5,
                color: alpha("#fff", 0.9),
                textTransform: "uppercase",
              }}
            >
              Personal finance, simplified
            </Typography>

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
              Take control of your personal finances
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mt: 2,
                color: alpha("#fff", 0.95),
                lineHeight: 1.6,
                // wrap long strings gracefully
                overflowWrap: "anywhere",
                wordBreak: "break-word",
                whiteSpace: "normal",
              }}
            >
              Track spending, split expenses fairly, and understand your money — beautifully
              and effortlessly.
            </Typography>
          </Box>
        </Hero>

        {/* FEATURES — guaranteed 4 in one row on md+ */}
        <FeatureGrid>
          {features.map((f, i) => (
            <FeatureCard key={i}>
              <IconTile aria-hidden>{f.icon}</IconTile>

              <Typography
                variant="h6"
                fontWeight={800}
                sx={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
              >
                {f.title}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  opacity: 0.8,
                  lineHeight: 1.65,
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                }}
              >
                {f.desc}
              </Typography>
            </FeatureCard>
          ))}
        </FeatureGrid>
      </Container>
    </Box>
  );
}
