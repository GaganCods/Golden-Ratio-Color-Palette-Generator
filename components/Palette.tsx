import React, { useRef } from 'react';
import { ColorData, ColorBlindnessMode, AccessibilityStats } from '../types';
import { getContrast, simulateColorBlindness, uuid } from '../utils/colorUtils';
import { Lock, Unlock, Copy, MoveHorizontal, RefreshCcw, GripHorizontal, Check, Pipette } from 'lucide-react';

interface PaletteProps {
  colors: ColorData[];
  onLockToggle: (id: string) => void;
  onUpdateColor: (id: string, newHex: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onSetPrimary: (hex: string) => void;
  colorBlindnessMode: ColorBlindnessMode;
  showAccessibility: boolean;
}

const ColorCard: React.FC<{ 
  color: ColorData; 
  index: number;
  total: number;
  mode: ColorBlindnessMode;
  showA11y: boolean;
  onLock: () => void;
  onChange: (hex: string) => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSetPrimary: () => void;
}> = ({ color, index, total, mode, showA11y, onLock, onChange, onMoveLeft, onMoveRight, onSetPrimary }) => {
  const [copied, setCopied] = React.useState(false);
  
  const displayHex = simulateColorBlindness(color.hex, mode);
  const contrast = getContrast(displayHex);

  const handleCopy = () => {
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const textColor = contrast.textColor === 'black' ? 'text-slate-900' : 'text-white';
  const iconColor = contrast.textColor === 'black' ? 'text-slate-900/60' : 'text-white/60';
  const borderColor = contrast.textColor === 'black' ? 'border-black/10' : 'border-white/20';

  return (
    <div 
      className="relative group flex flex-col items-center justify-end h-48 md:h-96 w-full md:w-full transition-all duration-500 ease-in-out first:rounded-t-2xl md:first:rounded-l-3xl md:first:rounded-tr-none last:rounded-b-2xl md:last:rounded-r-3xl md:last:rounded-bl-none overflow-hidden hover:z-10 hover:shadow-2xl hover:scale-[1.02]"
      style={{ backgroundColor: displayHex }}
    >
      
      {/* Tools Overlay (Visible on Hover) */}
      <div className={`absolute top-0 inset-x-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-start ${textColor}`}>
        <div className="flex gap-2">
            {index > 0 && (
                <button onClick={onMoveLeft} className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition">
                    <MoveHorizontal className="w-4 h-4 rotate-180" />
                </button>
            )}
            {index < total - 1 && (
                 <button onClick={onMoveRight} className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition">
                    <MoveHorizontal className="w-4 h-4" />
                 </button>
            )}
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={onSetPrimary}
                className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition"
                title="Set as Main Color"
            >
                <Pipette className="w-4 h-4" />
            </button>
            <button 
              onClick={onLock}
              className={`p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition ${color.locked ? 'ring-2 ring-white/50 bg-white/30' : ''}`}
            >
              {color.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
        </div>
      </div>

      {/* Info Content */}
      <div className={`w-full p-4 md:p-6 backdrop-blur-[2px] ${textColor}`}>
        
        {/* A11y Badge */}
        {showA11y && (
          <div className={`mb-3 flex items-center gap-2 text-xs font-mono border ${borderColor} rounded px-2 py-1 w-fit`}>
            <span className="font-bold">{contrast.level}</span>
            <span className="opacity-70">{contrast.contrast}:1</span>
          </div>
        )}

        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
             {/* Editable Input */}
            <div className="relative group/input">
                 <input 
                    type="color" 
                    value={color.hex}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                 />
                 <h3 className="text-lg md:text-2xl font-bold font-mono tracking-wider cursor-pointer hover:opacity-70 transition-opacity uppercase select-all">
                    {displayHex}
                </h3>
            </div>
            <p className={`text-xs md:text-sm font-medium opacity-60 uppercase tracking-widest ${iconColor}`}>
              {color.name}
            </p>
          </div>

          <button 
            onClick={handleCopy}
            className={`p-3 rounded-xl transition-all active:scale-95 ${copied ? 'bg-green-500 text-white shadow-lg' : 'hover:bg-black/5 active:bg-black/10'}`}
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5 opacity-80" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export const Palette: React.FC<PaletteProps> = ({ colors, onLockToggle, onUpdateColor, onMove, onSetPrimary, colorBlindnessMode, showAccessibility }) => {
  const moveLeft = (index: number) => {
    if (index > 0) onMove(index, index - 1);
  };
  const moveRight = (index: number) => {
    if (index < colors.length - 1) onMove(index, index + 1);
  };

  return (
    <div className="w-full flex flex-col md:flex-row shadow-xl rounded-2xl md:rounded-3xl transition-all duration-500">
      {colors.map((color, index) => (
        <ColorCard 
          key={color.id} 
          color={color} 
          index={index}
          total={colors.length}
          mode={colorBlindnessMode}
          showA11y={showAccessibility}
          onLock={() => onLockToggle(color.id)}
          onChange={(val) => onUpdateColor(color.id, val)}
          onMoveLeft={() => moveLeft(index)}
          onMoveRight={() => moveRight(index)}
          onSetPrimary={() => onSetPrimary(color.hex)}
        />
      ))}
    </div>
  );
};