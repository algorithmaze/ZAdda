export function Logo() {
  return (
    <div className="flex items-center justify-center gap-2">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="8" fill="url(#paint0_linear_1_2)" />
        <path
          d="M10 10L14 22L16 16L22 14L10 10Z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient
            id="paint0_linear_1_2"
            x1="0"
            y1="0"
            x2="32"
            y2="32"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#007AFF" />
            <stop offset="1" stopColor="#0052D9" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-xl font-bold">ZAdda</span>
    </div>
  );
}
