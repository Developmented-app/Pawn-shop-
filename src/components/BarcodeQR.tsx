import React from 'react';

interface BarcodeProps {
  value: string;
  height?: number;
  width?: number;
}

export function Barcode({ value, height = 50, width = 200 }: BarcodeProps) {
  // Simple deterministic pseudo-barcode lines generator based on input string hash
  const generateLines = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const lines: boolean[] = [];
    // Start quiet zone
    lines.push(false, false, false, false);
    // Left guard
    lines.push(true, false, true);
    
    for (let i = 0; i < 35; i++) {
      const bit = ((hash >> (i % 32)) & 1) === 1;
      lines.push(bit, !bit, bit);
    }
    
    // Right guard
    lines.push(true, false, true);
    // End quiet zone
    lines.push(false, false, false, false);
    return lines;
  };

  const lines = generateLines(value);
  const strokeWidth = width / lines.length;

  return (
    <div className="flex flex-col items-center justify-center p-1 bg-white border border-gray-100 rounded-sm">
      <svg height={height} width={width} className="block">
        <g>
          {lines.map((isBlack, index) => {
            if (!isBlack) return null;
            return (
              <rect
                key={index}
                x={index * strokeWidth}
                y={0}
                width={strokeWidth * 0.95}
                height={height}
                fill="#111827"
              />
            );
          })}
        </g>
      </svg>
      <span className="text-[10px] font-mono font-medium tracking-widest text-gray-500 mt-1 uppercase">
        {value}
      </span>
    </div>
  );
}

interface QRCodeProps {
  value: string;
  size?: number;
  title?: string;
}

export function CustomQRCode({ value, size = 120, title }: QRCodeProps) {
  // Deterministic 2D matrix pseudo-QR generator using a hash
  const sizeGrid = 19; // 19x19 grid
  const cellWidth = size / sizeGrid;

  const isCellBlack = (row: number, col: number) => {
    // Standard Finder patterns (at corners: top-left, top-right, bottom-left)
    const inFinder = (r: number, c: number) => {
      // Top-left finder pattern
      if (r < 7 && c < 7) {
        return (r === 0 || r === 6 || c === 0 || c === 6) || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      }
      // Top-right finder pattern
      if (r < 7 && c >= sizeGrid - 7) {
        const adjustedCol = c - (sizeGrid - 7);
        return (r === 0 || r === 6 || adjustedCol === 0 || adjustedCol === 6) || (r >= 2 && r <= 4 && adjustedCol >= 2 && adjustedCol <= 4);
      }
      // Bottom-left finder pattern
      if (r >= sizeGrid - 7 && c < 7) {
        const adjustedRow = r - (sizeGrid - 7);
        return (adjustedRow === 0 || adjustedRow === 6 || c === 0 || c === 6) || (adjustedRow >= 2 && adjustedRow <= 4 && c >= 2 && c <= 4);
      }
      return false;
    };

    if (inFinder(row, col)) {
      return true;
    }

    // Border spaces for finders should be white
    if (
      (row === 7 && col < 8) || 
      (col === 7 && row < 8) ||
      (row === 7 && col >= sizeGrid - 8) ||
      (col === sizeGrid - 8 && row < 8) ||
      (row === sizeGrid - 8 && col < 8) ||
      (col === 7 && row >= sizeGrid - 8)
    ) {
      return false;
    }

    // Static alignment pattern mock near bottom right
    if (row >= sizeGrid - 5 && row <= sizeGrid - 3 && col >= sizeGrid - 5 && col <= sizeGrid - 3) {
      return row === sizeGrid - 5 || row === sizeGrid - 3 || col === sizeGrid - 5 || col === sizeGrid - 3 || (row === sizeGrid - 4 && col === sizeGrid - 4);
    }

    // Simple deterministic hash pattern for other modules
    let hash = 5381;
    for (let i = 0; i < value.length; i++) {
      hash = ((hash << 5) + hash) + value.charCodeAt(i);
    }
    const seed = Math.abs(hash + row * 193 + col * 797);
    return (seed % 3) === 0 || (seed % 7) === 1;
  };

  const rows = Array.from({ length: sizeGrid }, (_, i) => i);
  const cols = Array.from({ length: sizeGrid }, (_, i) => i);

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
      {title && (
        <span className="text-[11px] font-bold text-gray-700 tracking-wider mb-2 uppercase select-none">
          {title}
        </span>
      )}
      <div className="relative p-1.5 bg-white border border-gray-200 rounded">
        <svg height={size} width={size}>
          {rows.map((row) =>
            cols.map((col) => {
              if (!isCellBlack(row, col)) return null;
              return (
                <rect
                  key={`${row}-${col}`}
                  x={col * cellWidth}
                  y={row * cellWidth}
                  width={cellWidth * 1.05} // subtle overlap prevents grid anti-aliasing gaps
                  height={cellWidth * 1.05}
                  fill="#0f172a" // elegant slate-900 color for high-end look
                />
              );
            })
          )}
        </svg>
      </div>
      <span className="text-[9px] font-mono text-gray-400 mt-2 truncate w-32 text-center select-all">
        {value.length > 25 ? value.substring(0, 12) + "..." + value.substring(value.length - 12) : value}
      </span>
    </div>
  );
}

interface KHQRBoxProps {
  value: string;
  merchantName?: string;
  amount?: number;
  currency?: 'USD' | 'KHR';
}

export function KHQRBox({ value, merchantName = "RIEM MICRO-AMORTIZATION", amount, currency = "USD" }: KHQRBoxProps) {
  return (
    <div className="relative w-64 bg-red-600 rounded-2xl p-4 shadow-xl flex flex-col items-center text-white select-none">
      {/* KHQR Header */}
      <div className="flex w-full justify-between items-center mb-3 px-1">
        <div className="flex items-center space-x-1.5">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-red-600 font-extrabold text-xs">
            QR
          </div>
          <span className="font-sans font-black tracking-widest text-sm italic">
            KHQR
          </span>
        </div>
        <div className="text-[10px] bg-red-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
          Cambodia
        </div>
      </div>

      {/* Main Barcode Box */}
      <div className="w-full bg-white rounded-xl p-3.5 flex flex-col items-center text-gray-950">
        <div className="text-xs font-black tracking-tight text-center text-red-600 uppercase mb-1.5">
          {merchantName}
        </div>
        
        {amount && (
          <div className="text-base font-extrabold text-gray-900 mb-2">
            {currency === 'USD' ? '$' : '៛'}
            {amount.toLocaleString(undefined, { minimumFractionDigits: currency === 'USD' ? 2 : 0 })}
          </div>
        )}

        <CustomQRCode value={value} size={150} />

        <div className="w-full flex justify-between items-center mt-3 text-[9px] font-bold text-gray-400 border-t border-gray-100 pt-2 px-1">
          <span>BAKONG EMV</span>
          <span>POWERED BY RIEM</span>
        </div>
      </div>

      {/* Decorative dots/curves */}
      <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-300 rounded-full animate-ping opacity-60"></div>
    </div>
  );
}
