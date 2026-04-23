"use client";

// Geometry (viewBox 200x200, center 100,100):
// Circle r=70
// Diamond corners: top(100,14) right(186,100) bottom(100,186) left(14,100)
// Diamond sides bow outward — quadratic bezier curves, not straight lines
// Interweave: diamond arrow tips in front at top+bottom, circle in front at left+right
// Intersection points (numerically verified):
//   near top:   (63,41) and (137,41)
//   near right: (159,63) and (159,137)
//   near bottom:(137,159) and (63,159)
//   near left:  (41,63) and (41,137)

export default function Logo({
  size = 40,
  animate = false,
}: {
  size?: number;
  animate?: boolean;
}) {
  const C = "#F3E9D7";
  const B = "#16302B";
  const SW = 14;
  const EW = 28;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Benliyski logo"
    >
      {animate && (
        <style>{`
          @keyframes bSpin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
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
        <circle cx="100" cy="100" r="70" stroke={C} strokeWidth={SW} />

        {/* 2. Erase circle at top + bottom — diamond arrow tips pass in front */}
        <path d="M 63,41 A 70,70 0 0,1 137,41"   stroke={B} strokeWidth={EW} strokeLinecap="butt" />
        <path d="M 137,159 A 70,70 0 0,1 63,159"  stroke={B} strokeWidth={EW} strokeLinecap="butt" />

        {/* 3. Diamond — sides are outward-bowing quadratic bezier curves, miter joins give sharp arrow tips */}
        <path
          d="M 100,14 Q 154,46 186,100 Q 154,154 100,186 Q 46,154 14,100 Q 46,46 100,14 Z"
          stroke={C}
          strokeWidth={SW}
          strokeLinejoin="miter"
          strokeMiterlimit={12}
        />

        {/* 4. Erase diamond at right + left — circle passes in front */}
        <path d="M 159,63 L 186,100 L 159,137"  stroke={B} strokeWidth={EW} strokeLinejoin="miter" strokeLinecap="butt" />
        <path d="M 41,63 L 14,100 L 41,137"     stroke={B} strokeWidth={EW} strokeLinejoin="miter" strokeLinecap="butt" />

        {/* 5. Redraw circle arcs at right + left — on top of diamond */}
        <path d="M 159,63 A 70,70 0 0,1 159,137"  stroke={C} strokeWidth={SW} strokeLinecap="butt" />
        <path d="M 41,137 A 70,70 0 0,1 41,63"    stroke={C} strokeWidth={SW} strokeLinecap="butt" />

      </g>
    </svg>
  );
}
