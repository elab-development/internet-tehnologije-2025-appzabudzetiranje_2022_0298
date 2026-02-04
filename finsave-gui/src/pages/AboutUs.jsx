import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Avatar,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import TimelineIcon from "@mui/icons-material/Timeline";
import Slider from "../components/Slider";
import useRandomUserImage from "../hooks/useRandomUserImage";
import useRandomQuote from "../hooks/useRandomQuote";

/**
 * About Us (English)
 * - Headings on top
 * - Slider underneath (uses /public/images/slide4.jpg, slide5.jpg, slide6.jpg)
 * - Timeline section
 * - Team section in a SINGLE ROW on desktop
 */

const PALETTE = {
  primary: "#318D4F",
  secondary: "#79D16A",
  dark: "#1D5E32",
};

// ---------- Styled helpers ----------
const Section = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(8),
  marginBottom: theme.spacing(6),
}));

const SliderFrame = styled(Box)(({ theme }) => ({
  borderRadius: 24,
  overflow: "hidden",
  boxShadow: "0 28px 68px rgba(0,0,0,0.35)",
  border: `1px solid ${alpha("#000", 0.06)}`,
}));

const TimelineWrap = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 22,
  background: "#fff",
  border: `1px solid ${alpha("#000", 0.06)}`,
  boxShadow: "0 18px 44px rgba(0,0,0,0.14)",
}));

const TimelineItem = styled("div")(({ theme }) => ({
  position: "relative",
  paddingLeft: theme.spacing(5),
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  "&::before": {
    content: '""',
    position: "absolute",
    left: 16,
    top: 0,
    bottom: 0,
    width: 2,
    background: `linear-gradient(180deg, transparent, ${alpha(
      PALETTE.primary,
      0.4
    )}, transparent)`,
  },
}));

const Dot = styled("span")(({ theme }) => ({
  position: "absolute",
  left: 10,
  top: 28,
  width: 14,
  height: 14,
  borderRadius: "50%",
  background: `linear-gradient(135deg, ${PALETTE.dark}, ${PALETTE.primary})`,
  boxShadow: "0 6px 16px rgba(49,141,79,0.45)",
}));

const YearPill = styled("span")(({ theme }) => ({
  display: "inline-block",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 1,
  textTransform: "uppercase",
  color: PALETTE.primary,
  background: alpha(PALETTE.secondary, 0.18),
  padding: "6px 10px",
  borderRadius: 999,
}));

const EmployeeCardWrap = styled(Paper)(({ theme }) => ({
  height: "100%",
  padding: theme.spacing(3),
  borderRadius: 20,
  border: `1px solid ${alpha("#000", 0.06)}`,
  background: "#fff",
  boxShadow: "0 14px 36px rgba(0,0,0,0.16)",
  transition: "transform .2s ease, box-shadow .2s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 22px 56px rgba(0,0,0,0.22)",
  },
}));

// ---------- Small components ----------
function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <Box textAlign="center" maxWidth={880} mx="auto">
      {eyebrow && (
        <Typography
          variant="overline"
          sx={{
            letterSpacing: 2.5,
            color: alpha("#000", 0.6),
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </Typography>
      )}
      <Typography
        variant="h3"
        fontWeight={900}
        sx={{
          mt: 0.5,
          color: "#fff",
          textShadow: "0 10px 36px rgba(0,0,0,0.35)",
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="h6"
          sx={{
            mt: 1.5,
            color: alpha("#fff", 0.95),
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

function TimelineRow({ year, title, desc }) {
  return (
    <TimelineItem>
      <Dot />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="baseline">
        <YearPill>{year}</YearPill>
        <Typography variant="h6" fontWeight={800}>
          {title}
        </Typography>
      </Stack>
      <Typography variant="body1" sx={{ mt: 1.5, color: alpha("#000", 0.75) }}>
        {desc}
      </Typography>
    </TimelineItem>
  );
}

function EmployeeCard({ role }) {
  const { image, name, loading: userLoading, error: userError } = useRandomUserImage();
  const { quote, loading: quoteLoading, error: quoteError } = useRandomQuote();

  const initials = useMemo(() => {
    if (!name) return "";
    const parts = name.split(" ");
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  }, [name]);

  return (
    <EmployeeCardWrap>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar
          src={!userLoading && !userError ? image : undefined}
          alt={name || "user"}
          sx={{ width: 64, height: 64, fontWeight: 800, bgcolor: PALETTE.primary }}
        >
          {userLoading || userError ? initials || "?" : null}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={800} sx={{ overflowWrap: "anywhere" }}>
            {name || "Loading…"}
          </Typography>
          <Typography variant="body2" sx={{ color: PALETTE.primary }}>
            {role}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 2.5 }} />

      <Typography variant="body1" sx={{ fontStyle: "italic", color: alpha("#000", 0.8), lineHeight: 1.7 }}>
        {quoteLoading && "“Loading quote…”"}
        {!quoteLoading && quoteError && "“The motivational quote is currently unavailable.”"}
        {!quoteLoading && !quoteError && quote?.quote && `“${quote.quote}”`}
      </Typography>
      {!quoteLoading && !quoteError && quote?.author && (
        <Typography variant="body2" sx={{ mt: 1.25, color: alpha("#000", 0.6) }}>
          — {quote.author}
        </Typography>
      )}
    </EmployeeCardWrap>
  );
}

// ---------- Main ----------
export default function AboutUs() {
  const images = ["/images/slide4.jpg", "/images/slide5.jpg", "/images/slide6.jpg"];

  const timeline = [
    {
      year: "2019",
      title: "The idea was born",
      desc:
        "We started as a small fintech-loving team with a mission to make personal finance clear and accessible to everyone.",
    },
    {
      year: "2020",
      title: "First MVP",
      desc:
        "We launched our first MVP focused on budgets, saving goals, and real-time spending overview.",
    },
    {
      year: "2022",
      title: "Team expansion",
      desc:
        "We grew the team and partnered with banking providers to enrich our data.",
    },
    {
      year: "2024",
      title: "Intelligent insights",
      desc:
        "We introduced AI recommendations for healthy financial habits and personalized savings tips.",
    },
  ];

  const team = [
    { role: "CEO & Co-Founder" },
    { role: "Head of Product" },
    { role: "Lead Engineer" },
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
        pb: 12,
      }}
    >
      <nav aria-label="breadcrumb" style={{ font: "14px/1.4 system-ui", marginLeft: "200px", color:"white"}}>
        <span><Link sx={{ color:"white"}} to="/home">Home</Link></span>
        <span style={{ margin: "0 8px", opacity: 0.5 }}>/</span>
        <span aria-current="page" style={{ fontWeight: 600 }}>About Us</span>
      </nav>
      <Container maxWidth="xl" sx={{ pt: { xs: 6, md: 10 } }}>
        {/* Headings */}
        <Section sx={{ mt: 2 }}>
          <SectionHeading
            eyebrow="About us"
            title="We’re building a smarter way to manage personal finance"
            subtitle="Our mission is to simplify money decisions through clarity, insight, and trust."
          />
        </Section>

        {/* Slider */}
        <Section sx={{ mt: 0 }}>
          <SliderFrame>
            <Slider images={images} height={520} />
          </SliderFrame>
        </Section>

        {/* Timeline */}
        <Section>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" fontWeight={900} sx={{ color: "#fff", textShadow: "0 8px 28px rgba(0,0,0,0.35)" }}>
              How we started
            </Typography>
            <Chip
              icon={<TimelineIcon sx={{ color: "#fff !important" }} />}
              label="Milestones"
              sx={{ bgcolor: alpha("#000", 0.2), color: "#fff", fontWeight: 700 }}
            />
          </Box>

          <TimelineWrap>
            {timeline.map((t, i) => (
              <Box key={i}>
                <TimelineRow {...t} />
                {i !== timeline.length - 1 && <Divider sx={{ my: 1.5, opacity: 0.4 }} />}
              </Box>
            ))}
          </TimelineWrap>
        </Section>

        {/* Team (single row on desktop) */}
        <Section sx={{ mb: 10 }}>
          <Box mb={2}>
            <Typography variant="h4" fontWeight={900} sx={{ color: "#fff", textShadow: "0 8px 28px rgba(0,0,0,0.35)" }}>
              Our team
            </Typography>
            <Typography variant="body1" sx={{ color: alpha("#fff", 0.92) }}>
              Random avatars (randomuser.me) and inspirational quotes (dummyjson.com) keep this section dynamic.
            </Typography>
          </Box>

          <Grid
            container
            spacing={3}
            // Force one row on md+; allow wrapping on small screens
            sx={{ flexWrap: { xs: "wrap", md: "nowrap" } }}
          >
            {team.map((m, i) => (
              <Grid item xs={12} md={4} key={i}>
                <EmployeeCard role={m.role} />
              </Grid>
            ))}
          </Grid>
        </Section>
      </Container>
    </Box>
  );
}
