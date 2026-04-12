"use client";

interface PlaceholderImageProps {
  size?: number;
  className?: string;
}

export default function PlaceholderImage({
  size = 200,
  className,
}: PlaceholderImageProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`rounded-2xl ${className ?? ""}`}
    >
      <defs>
        <linearGradient id="bg-grad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0E7490" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#bg-grad)" />
      {/* Earbud body */}
      <ellipse cx="88" cy="95" rx="22" ry="26" fill="#FAFAFA" opacity="0.9" />
      <ellipse cx="88" cy="95" rx="14" ry="17" fill="#0E7490" opacity="0.5" />
      <ellipse cx="88" cy="95" rx="7" ry="8" fill="#FAFAFA" opacity="0.6" />
      {/* Earbud stem */}
      <rect x="82" y="116" width="12" height="28" rx="6" fill="#FAFAFA" opacity="0.9" />
      {/* Second earbud body */}
      <ellipse cx="126" cy="90" rx="20" ry="24" fill="#FAFAFA" opacity="0.7" />
      <ellipse cx="126" cy="90" rx="13" ry="15" fill="#0E7490" opacity="0.4" />
      <ellipse cx="126" cy="90" rx="6" ry="7" fill="#FAFAFA" opacity="0.5" />
      {/* Second earbud stem */}
      <rect x="120" y="110" width="12" height="26" rx="6" fill="#FAFAFA" opacity="0.7" />
    </svg>
  );
}
