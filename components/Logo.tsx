export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Benliyski logo — square the circle"
    >
      {/* Circle */}
      <circle cx="20" cy="20" r="18" stroke="#F3E9D7" strokeWidth="1.5" />
      {/* Inscribed square */}
      <rect
        x="7.27"
        y="7.27"
        width="25.46"
        height="25.46"
        stroke="#F3E9D7"
        strokeWidth="1.5"
        transform="rotate(0 20 20)"
      />
      {/* Center dot */}
      <circle cx="20" cy="20" r="2" fill="#F3E9D7" />
    </svg>
  );
}
