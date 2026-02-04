import { ColorData, HarmonyMode, PaletteSize, AccessibilityStats, ColorBlindnessMode } from '../types';
import * as d3 from 'd3-color';

// Golden Ratio Constant
const GOLDEN_RATIO = 0.618033988749895;
const GOLDEN_ANGLE = 137.508;

// Helper to generate unique ID
export const uuid = () => Math.random().toString(36).substr(2, 9);

export const isValidHex = (hex: string) => /^#([0-9A-F]{3}){1,2}$/i.test(hex);

export const hexToHsl = (hex: string) => {
  const c = d3.hsl(hex);
  return { h: c.h || 0, s: c.s, l: c.l };
};

export const hslToHex = (h: number, s: number, l: number) => {
  return d3.hsl(h, s, l).formatHex();
};

export const getContrast = (hex: string): AccessibilityStats => {
  const rgb = d3.rgb(hex);
  // Calculate relative luminance
  const luminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const lum = luminance(rgb.r, rgb.g, rgb.b);
  const whiteLum = 1.0;
  const blackLum = 0.0;

  const contrastWhite = (whiteLum + 0.05) / (lum + 0.05);
  const contrastBlack = (lum + 0.05) / (blackLum + 0.05);

  if (contrastBlack > contrastWhite) {
    return {
      contrast: parseFloat(contrastBlack.toFixed(2)),
      level: contrastBlack >= 7 ? 'AAA' : (contrastBlack >= 4.5 ? 'AA' : 'Fail'),
      textColor: 'black'
    };
  } else {
    return {
      contrast: parseFloat(contrastWhite.toFixed(2)),
      level: contrastWhite >= 7 ? 'AAA' : (contrastWhite >= 4.5 ? 'AA' : 'Fail'),
      textColor: 'white'
    };
  }
};

export const generatePalette = (
  baseHex: string,
  mode: HarmonyMode,
  size: PaletteSize,
  currentColors: ColorData[] = []
): ColorData[] => {
  // If we have locked colors, we need to respect them.
  // Strategy: Generate a full new palette based on baseHex, then merge.
  // For simplicity in this demo, if preserving locked, we replace unlocked slots.

  const baseHsl = hexToHsl(baseHex);
  const newColors: string[] = [];
  
  // Logic varies by mode
  switch (mode) {
    case HarmonyMode.GOLDEN_RATIO:
      for (let i = 0; i < size; i++) {
        // Golden angle offset
        const h = (baseHsl.h + (i * GOLDEN_ANGLE)) % 360;
        // Minor saturation/lightness oscillation for variety
        const s = Math.max(0.2, Math.min(0.95, baseHsl.s + (i % 2 === 0 ? 0.1 : -0.1) * 0.2));
        const l = Math.max(0.15, Math.min(0.9, baseHsl.l + (i % 3 === 0 ? 0.15 : -0.1) * 0.3)); // Distribute lightness
        newColors.push(hslToHex(h, s, l));
      }
      break;

    case HarmonyMode.ANALOGOUS:
      for (let i = 0; i < size; i++) {
        const h = (baseHsl.h + (i * 30) - (size * 15)) % 360;
        newColors.push(hslToHex(h, baseHsl.s, baseHsl.l));
      }
      break;
    
    case HarmonyMode.COMPLEMENTARY:
        newColors.push(baseHex);
        const compH = (baseHsl.h + 180) % 360;
        newColors.push(hslToHex(compH, baseHsl.s, baseHsl.l));
        // Fill rest with shades/tones
        for(let i = 2; i < size; i++) {
           const isBase = i % 2 === 0;
           const targetH = isBase ? baseHsl.h : compH;
           const l = Math.max(0.1, Math.min(0.9, baseHsl.l + ((i * 0.15) * (i%2===0?1:-1))));
           newColors.push(hslToHex(targetH, baseHsl.s, l));
        }
        break;

    case HarmonyMode.TRIADIC:
        newColors.push(baseHex);
        newColors.push(hslToHex((baseHsl.h + 120) % 360, baseHsl.s, baseHsl.l));
        newColors.push(hslToHex((baseHsl.h + 240) % 360, baseHsl.s, baseHsl.l));
        for(let i = 3; i < size; i++) {
            const rootIdx = i % 3;
            const rootH = (baseHsl.h + (rootIdx * 120)) % 360;
            const l = Math.max(0.2, Math.min(0.8, baseHsl.l + (i * 0.1)));
            newColors.push(hslToHex(rootH, baseHsl.s, l));
        }
        break;

    case HarmonyMode.MONOCHROMATIC:
        for(let i = 0; i < size; i++) {
            const l = Math.max(0.1, Math.min(0.95, 0.1 + (i * (0.85 / (size - 1)))));
            newColors.push(hslToHex(baseHsl.h, baseHsl.s, l));
        }
        break;
      
    default: // Fallback to Golden Ratio
       for (let i = 0; i < size; i++) {
        const h = (baseHsl.h + (i * GOLDEN_ANGLE)) % 360;
        newColors.push(hslToHex(h, baseHsl.s, baseHsl.l));
      }
  }

  // Merge with locked colors
  const result: ColorData[] = [];
  let generatedIdx = 0;

  for (let i = 0; i < size; i++) {
    const existing = currentColors[i];
    if (existing && existing.locked) {
      result.push(existing);
    } else {
      // Use the next generated color, ensuring we don't run out if size increased
      const hex = newColors[generatedIdx % newColors.length] || '#000000';
      generatedIdx++;
      result.push({
        id: uuid(),
        hex: hex.toUpperCase(),
        name: hex, // Would ideally use a namer library
        locked: false
      });
    }
  }

  return result;
};

// Simulation Matrices
// Approximate simulation using simple RGB matrix multiplication
// Source: https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html (Simplified)
const simMatrix = {
  [ColorBlindnessMode.PROTANOPIA]: [
    0.567, 0.433, 0,
    0.558, 0.442, 0,
    0, 0.242, 0.758
  ],
  [ColorBlindnessMode.DEUTERANOPIA]: [
    0.625, 0.375, 0,
    0.7, 0.3, 0,
    0, 0.3, 0.7
  ],
  [ColorBlindnessMode.TRITANOPIA]: [
    0.95, 0.05, 0,
    0, 0.433, 0.567,
    0, 0.475, 0.525
  ],
  [ColorBlindnessMode.ACHROMATOPSIA]: [
    0.299, 0.587, 0.114,
    0.299, 0.587, 0.114,
    0.299, 0.587, 0.114
  ]
};

export const simulateColorBlindness = (hex: string, mode: ColorBlindnessMode): string => {
  if (mode === ColorBlindnessMode.NONE) return hex;
  
  const rgb = d3.rgb(hex);
  const matrix = simMatrix[mode];
  if (!matrix) return hex;

  const r = rgb.r;
  const g = rgb.g;
  const b = rgb.b;

  const sr = (r * matrix[0]) + (g * matrix[1]) + (b * matrix[2]);
  const sg = (r * matrix[3]) + (g * matrix[4]) + (b * matrix[5]);
  const sb = (r * matrix[6]) + (g * matrix[7]) + (b * matrix[8]);

  return d3.rgb(sr, sg, sb).formatHex();
};