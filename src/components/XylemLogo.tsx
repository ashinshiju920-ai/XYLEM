import React from 'react';

interface XylemLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  light?: boolean;
}

export const XylemLogo: React.FC<XylemLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
  light = false,
}) => {
  const navyColor = light ? '#ffffff' : '#0a2540';
  const greenColor = light ? '#34d399' : '#00875a';
  const subtextColor = light ? '#cbd5e1' : '#0a2540';

  const dimensions = showTagline
    ? {
        sm: { width: 125, height: 53 },
        md: { width: 160, height: 68 },
        lg: { width: 215, height: 91 },
        xl: { width: 275, height: 117 },
      }[size]
    : {
        sm: { width: 125, height: 43 },
        md: { width: 160, height: 55 },
        lg: { width: 215, height: 74 },
        xl: { width: 275, height: 95 },
      }[size];

  const viewBox = showTagline ? '0 0 224 94' : '0 0 224 76';

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
        aria-label="XYLEM BOOKSTORE"
      >
        {/* The X glyph with leaf */}
        <g id="x-glyph" transform="translate(1, 6) scale(1.29)">
          {/* Bottom-left arm in emerald green */}
          <path
            d="M8 52L26 27L12 6H29L38 21L24 52H8Z"
            fill={greenColor}
          />
          
          {/* Top-right to bottom-left main stroke in navy */}
          <path
            d="M32 6H49L23 52H6L32 6Z"
            fill={navyColor}
          />

          {/* Top-right leaf feature on the X */}
          <path
            d="M26 27C27 18 35 7 51 4C51 18 42 27 34 29C30 30 27 28 26 27Z"
            fill={greenColor}
          />
          {/* Leaf vein */}
          <path
            d="M27 27C34 22 42 16 50 5"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.95"
          />

          {/* Bottom-right diagonal in navy */}
          <path
            d="M36 30L49 52H32L24 38L36 30Z"
            fill={navyColor}
          />
        </g>

        {/* Row 1: XYLEM in Bold Navy */}
        <text
          x="73"
          y="40"
          fill={navyColor}
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="31"
          letterSpacing="0.5"
          textLength="138"
          lengthAdjust="spacingAndGlyphs"
        >
          XYLEM
        </text>

        {/* Row 2: BOOKSTORE in Bold Emerald Green */}
        <text
          x="73"
          y="70"
          fill={greenColor}
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="22"
          letterSpacing="2.0"
          textLength="138"
          lengthAdjust="spacingAndGlyphs"
        >
          BOOKSTORE
        </text>

        {/* Row 3: LEARN • PRACTICE • ACHIEVE */}
        {showTagline && (
          <text
            x="130"
            y="90"
            textAnchor="middle"
            fill={subtextColor}
            fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            fontWeight="700"
            fontSize="9"
            letterSpacing="2.2"
          >
            LEARN  •  PRACTICE  •  ACHIEVE
          </text>
        )}
      </svg>
    </div>
  );
};
