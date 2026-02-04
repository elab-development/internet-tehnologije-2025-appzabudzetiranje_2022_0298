import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

/**
 * FinSave Footer (modern + minimal)
 * - Rounded top, subtle gradient, soft shadow
 * - Text: "© YEAR FinSave — All rights reserved."
 * - Readable code with small, clear styles
 */

const COLORS = {
  primary: "#318D4F",
  secondary: "#79D16A",
  dark: "#1D5E32",
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        color: "common.white",
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        // premium green gradient (logo colors)
        background: `linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.primary} 50%, ${COLORS.secondary} 100%)`,
        boxShadow: "0 -10px 28px rgba(0,0,0,0.20)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      
      {/* subtle highlight line */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: alpha("#fff", 0.25),
        }}
      />
      <Container
        maxWidth="lg"
        sx={{
          py: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 600 }}>
          © {year} FinSave — All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}