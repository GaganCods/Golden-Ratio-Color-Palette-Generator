export interface ColorData {
  id: string;
  hex: string;
  name: string;
  locked: boolean;
}

export type PaletteSize = 3 | 4 | 5 | 6 | 7 | 8 | 9;

export enum HarmonyMode {
  GOLDEN_RATIO = 'Golden Ratio',
  ANALOGOUS = 'Analogous',
  COMPLEMENTARY = 'Complementary',
  TRIADIC = 'Triadic',
  MONOCHROMATIC = 'Monochromatic',
}

export interface Settings {
  harmony: HarmonyMode;
  size: PaletteSize;
  baseColor: string;
}

export interface GeneratedPalette {
  id: string;
  timestamp: number;
  colors: ColorData[];
  settings: Settings;
  name?: string;
}

export enum ColorBlindnessMode {
  NONE = 'None',
  PROTANOPIA = 'Protanopia', // Red-blind
  DEUTERANOPIA = 'Deuteranopia', // Green-blind
  TRITANOPIA = 'Tritanopia', // Blue-blind
  ACHROMATOPSIA = 'Achromatopsia', // Monochromacy
}

export interface AccessibilityStats {
  contrast: number; // vs White or Black depending on context
  level: 'AA' | 'AAA' | 'Fail';
  textColor: 'black' | 'white';
}
