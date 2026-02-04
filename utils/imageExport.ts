import { ColorData } from '../types';
import { getContrast } from './colorUtils';

export const generatePaletteImage = (colors: ColorData[], scale: number = 2, transparent: boolean = false): string => {
  const canvas = document.createElement('canvas');
  // Dimensions
  const padding = transparent ? 0 : 40;
  const gap = 0;
  const tileWidth = 200;
  const tileHeight = 300;
  const width = (tileWidth * colors.length) + (gap * (colors.length - 1)) + (padding * 2);
  const height = tileHeight + (padding * 2);

  // Set High Res
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';

  ctx.scale(scale, scale);

  // Background
  if (!transparent) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }

  // Font setup
  const fontMain = 'bold 24px Inter, system-ui, sans-serif';
  const fontSub = '500 14px Inter, system-ui, sans-serif';

  colors.forEach((color, i) => {
    const x = padding + (i * (tileWidth + gap));
    const y = padding;

    // Draw Color Rectangle
    ctx.fillStyle = color.hex;
    // Rounded corners trick if we wanted, but sticking to clean blocks for now
    // to match standard export styles, or we can clip.
    // Let's do simple rects for clean edge-to-edge look within the padding
    ctx.fillRect(x, y, tileWidth, tileHeight);

    // Text Contrast
    const contrast = getContrast(color.hex);
    const textColor = contrast.textColor === 'white' ? '#ffffff' : '#1e293b'; // slate-800
    const subTextColor = contrast.textColor === 'white' ? 'rgba(255,255,255,0.7)' : 'rgba(30,41,59,0.7)';

    ctx.textAlign = 'center';
    
    // HEX
    ctx.fillStyle = textColor;
    ctx.font = fontMain;
    ctx.fillText(color.hex, x + tileWidth / 2, y + tileHeight - 60);

    // Name (or ID/Label)
    ctx.fillStyle = subTextColor;
    ctx.font = fontSub;
    ctx.fillText(color.name.length > 15 ? 'Color ' + (i+1) : color.name, x + tileWidth / 2, y + tileHeight - 35);
  });

  return canvas.toDataURL('image/png');
};

export const downloadImage = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};