import React from "react";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

type Props = {
  size?: number;
};

export function SpartanHelmet({ size = 100 }: Props) {
  const h = size;
  const w = size;

  return (
    <Svg width={w} height={h} viewBox="0 0 100 108">
      <Defs>
        {/* Main gold gradient — top-left to bottom-right */}
        <LinearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#F5D060" stopOpacity="1" />
          <Stop offset="0.45" stopColor="#E5A823" stopOpacity="1" />
          <Stop offset="1" stopColor="#A87010" stopOpacity="1" />
        </LinearGradient>

        {/* Sheen gradient for depth surfaces */}
        <LinearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F0C050" stopOpacity="1" />
          <Stop offset="1" stopColor="#B87A0A" stopOpacity="1" />
        </LinearGradient>

        {/* Dark inner shadow on dome */}
        <LinearGradient id="domeShade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#E5A823" stopOpacity="1" />
          <Stop offset="1" stopColor="#7A5000" stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* ── CREST ─────────────────────────────────────────── */}
      {/* Tall vertical oval plume sitting on top of dome */}
      <Path
        d="M 50 2
           C 61 2 66 13 66 24
           C 66 34 60 40 50 40
           C 40 40 34 34 34 24
           C 34 13 39 2 50 2 Z"
        fill="url(#gold)"
      />
      {/* Inner crest highlight — smaller oval for dimension */}
      <Path
        d="M 50 8
           C 57 8 60 16 60 24
           C 60 31 56 37 50 37
           C 44 37 40 31 40 24
           C 40 16 43 8 50 8 Z"
        fill="url(#sheen)"
        opacity={0.45}
      />

      {/* ── HELMET DOME ───────────────────────────────────── */}
      {/* Main rounded dome body */}
      <Path
        d="M 6 86
           L 6 60
           Q 6 37 50 37
           Q 94 37 94 60
           L 94 86 Z"
        fill="url(#domeShade)"
      />
      {/* Left highlight panel for curvature depth */}
      <Path
        d="M 6 86 L 6 60 Q 6 37 50 37 L 50 86 Z"
        fill="#F0C050"
        opacity={0.18}
      />

      {/* ── VISOR SLOT (dark eye opening) ────────────────── */}
      <Path d="M 19 53 L 81 53 L 78 71 L 22 71 Z" fill="#08111F" />
      {/* Visor inner glow edge */}
      <Path
        d="M 19 53 L 81 53 L 79 56 L 21 56 Z"
        fill="#1A3060"
        opacity={0.6}
      />

      {/* ── NOSE GUARD ───────────────────────────────────── */}
      {/* Vertical bar running through visor center */}
      <Rect x="46" y="49" width="8" height="30" rx="3" fill="url(#sheen)" />

      {/* ── CHIN GUARD (bottom bar) ───────────────────────── */}
      <Rect x="6" y="86" width="88" height="14" rx="5" fill="url(#sheen)" />
      {/* Bottom bar top-edge sheen line */}
      <Rect
        x="6"
        y="86"
        width="88"
        height="3"
        rx="2"
        fill="#F5D060"
        opacity={0.5}
      />
    </Svg>
  );
}
