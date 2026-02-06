import React, { useEffect, useRef, useState } from "react";
import { Box, IconButton, useTheme, alpha } from "@mui/material";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";

/**
 * Reusable Slider component (no external libs).
 * - Props:
 *    images: string[] (required) — URLs to images
 *    height?: number — visible height in px (default: 420)
 *    autoPlay?: boolean — enable auto rotation (default: true)
 *    interval?: number — autoplay interval in ms (default: 5000)
 *    showArrows?: boolean — nav arrows (default: true)
 *    showDots?: boolean — nav dots (default: true)
 *
 * - Modern UI: soft corners, subtle shadows, gradient overlay, smooth fades.
 * - Accessible arrows & dots; pauses on hover; responsive.
 */

export default function Slider({
  images = [],
  height = 420,
  autoPlay = true,
  interval = 5000,
  showArrows = true,
  showDots = true,
}) {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const length = images.length;

  const next = () => setIndex((i) => (i + 1) % length);
  const prev = () => setIndex((i) => (i - 1 + length) % length);
  const goTo = (i) => setIndex(((i % length) + length) % length);
  
  useEffect(() => {
    if (!autoPlay || length <= 1 || paused) return;
    timerRef.current = setInterval(next, interval);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, interval, paused, length, index]);

  if (!length) return null;

  return (
    <Box
      role="region"
      aria-label="Image slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      sx={{
        position: "relative",
        height,
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 18px 48px rgba(0,0,0,0.25)",
        background: `linear-gradient(135deg, ${alpha("#1D5E32", 0.25)} 0%, ${alpha(
          theme.palette.primary.main || "#318D4F",
          0.15
        )} 100%)`,
      }}
    >
      {/* Slides (fade transition) */}
      {images.map((src, i) => (
        <Box
          key={i}
          component="img"
          src={src}
          alt={`Slide ${i + 1}`}
          loading="lazy"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "opacity 600ms ease, transform 800ms ease",
            opacity: i === index ? 1 : 0,
            transform: i === index ? "scale(1.02)" : "scale(1)",
          }}
        />
      ))}

      {/* Top gradient sheen */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.15) 100%)",
          pointerEvents: "none",
        }}
      />
      {/* Arrows */}
      {showArrows && length > 1 && (
        <>
          <IconButton
            aria-label="Previous slide"
            onClick={prev}
            sx={arrowSx("left")}
          >
            <ArrowBackIosNew />
          </IconButton>
          <IconButton
            aria-label="Next slide"
            onClick={next}
            sx={arrowSx("right")}
          >
            <ArrowForwardIos />
          </IconButton>
        </>
      )}

      {/* Dots */}
      {showDots && length > 1 && (
        <Box
          sx={{
            position: "absolute",
            bottom: 14,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 1,
            p: 1,
            borderRadius: 999,
            bgcolor: alpha("#000", 0.25),
            backdropFilter: "blur(6px)",
          }}
        >
          {images.map((_, i) => (
            <Box
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              role="button"
              tabIndex={0}
              sx={{
                width: 10,
                height: 10,
                borderRadius: 999,
                cursor: "pointer",
                outline: "none",
                border: `2px solid ${alpha("#fff", 0.8)}`,
                bgcolor: i === index ? "#fff" : "transparent",
                transition: "all 200ms ease",
                "&:hover": { bgcolor: alpha("#fff", 0.9) },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

// Shared arrow styles
function arrowSx(side) {
  return {
    position: "absolute",
    top: "50%",
    [side]: 12,
    transform: "translateY(-50%)",
    bgcolor: "rgba(255,255,255,0.9)",
    "&:hover": { bgcolor: "#fff" },
    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
    color: "text.primary",
    width: 44,
    height: 44,
    borderRadius: 999,
  };
}
