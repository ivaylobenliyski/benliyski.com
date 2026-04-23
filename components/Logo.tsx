"use client";

export default function Logo({
  size = 40,
  animate = false,
}: {
  size?: number;
  animate?: boolean;
}) {
  const C = "#F3E9D7"; // stroke color
  const B = "#16302B"; // background eraser color
  const SW = 9;        // main stroke width
  const EW = 16;       // eraser stroke width (wider to fully cover)

  // Geometry (viewBox 200x200, center 100,100):
  // Circle r=65
  // Diamond corners: top(100,18) right(182,100) bottom(100,182) left(18,100)
  // Interweave: diamond in front at top+bottom, circle in front at left+right
  // Intersection points (calculated): near top (80,38)+(120,38), near right (162,80)+(162,120),
  //   near bottom (80,162)+(120,162), near left (38,80)+(38,120)

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Benliyski — square the circle"
    >
      {animate && (
        <style>{`
          @keyframes bSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .b-spin {
            transform-box: fill-box;
            transform-origin: center;
            animation: bSpin 20s linear infinite;
          }
        `}</style>
      )}
      <g className={animate ? "b-spin" : undefined}>
        {/* 1. Full circle */}
        <circle cx="100" cy="100" r="65" stroke={C} strokeWidth={SW} />

        {/* 2. Erase circle at top + bottom corners (diamond passes in front) */}
        <path d="M 80,38 A 65,65 0 0,1 120,38"   stroke={B} strokeWidth={EW} strokeLinecap="butt" />
        <path d="M 120,162 A 65,65 0 0,1 80,162"  stroke={B} strokeWidth={EW} strokeLinecap="butt" />

        {/* 3. Full diamond — miter joins create natural arrow tips at each corner */}
        <path
          d="M 100,18 L 182,100 L 100,182 L 18,100 Z"
          stroke={C}
          strokeWidth={SW}
          strokeLinejoin="miter"
          strokeMiterlimit={10}
        />

        {/* 4. Erase diamond at left + right corners (circle passes in front) */}
        <path d="M 160,78 L 184,100 L 160,122"  stroke={B} strokeWidth={EW} strokeLinejoin="miter" strokeLinecap="butt" />
        <path d="M 40,78 L 16,100 L 40,122"     stroke={B} strokeWidth={EW} strokeLinejoin="miter" strokeLinecap="butt" />

        {/* 5. Redraw circle arcs at left + right (on top of diamond) */}
        <path d="M 162,80 A 65,65 0 0,1 162,120"  stroke={C} strokeWidth={SW} strokeLinecap="butt" />
        <path d="M 38,120 A 65,65 0 0,1 38,80"    stroke={C} strokeWidth={SW} strokeLinecap="butt" />
      </g>
    </svg>
  );
}
