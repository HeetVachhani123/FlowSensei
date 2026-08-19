import React from 'react';

type TeammateCursorProps = {
  name: string;
  color: string;
  textColor?: string;
  className?: string;
  style?: React.CSSProperties;
};

export const TeammateCursor: React.FC<TeammateCursorProps> = ({
  name,
  color,
  textColor = '#ffffff',
  className = '',
  style,
}) => {
  return (
    <div
      className={`pointer-events-none select-none absolute z-30 transition-all duration-700 ease-out ${className}`}
      style={style}
    >
      {/* Cursor Arrow */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm filter"
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill={color}
          stroke="#ffffff"
          strokeWidth="1.2"
        />
      </svg>

      {/* Trailing Name Tag Pill */}
      <div
        className="ml-3.5 -mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide whitespace-nowrap shadow-md inline-block transform origin-left transition-transform"
        style={{
          backgroundColor: color,
          color: textColor,
        }}
      >
        {name}
      </div>
    </div>
  );
};
