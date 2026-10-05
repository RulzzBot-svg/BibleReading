type IconName = "today" | "bible" | "guide" | "you" | "back" | "check" | "next" | "prev";

export function Icon({ name }: { name: IconName }) {
  const common = {
    viewBox: "0 0 24 24",
    "aria-hidden": true as const,
    className: "icon",
  };
  switch (name) {
    case "today":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4.5l2.5 1.5" />
        </svg>
      );
    case "bible":
      return (
        <svg {...common}>
          <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21.5z" />
          <path d="M5 5.5A2.5 2.5 0 0 1 7.5 8H19" />
        </svg>
      );
    case "guide":
      return (
        <svg {...common}>
          <path d="M4 6h6.5a2.5 2.5 0 0 1 2.5 2.5V20" />
          <path d="M20 6h-6.5A2.5 2.5 0 0 0 11 8.5V20" />
          <path d="M4 6v12.5A2.5 2.5 0 0 0 6.5 21H11" />
          <path d="M20 6v12.5A2.5 2.5 0 0 1 17.5 21H11" />
        </svg>
      );
    case "you":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3" />
          <path d="M5.5 19.5c1.2-3 3.4-4.5 6.5-4.5s5.3 1.5 6.5 4.5" />
        </svg>
      );
    case "back":
      return (
        <svg {...common}>
          <path d="M15 5 8 12l7 7" />
        </svg>
      );
    case "next":
      return (
        <svg {...common}>
          <path d="m9 5 7 7-7 7" />
        </svg>
      );
    case "prev":
      return (
        <svg {...common}>
          <path d="M15 5 8 12l7 7" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5.5 12.5 4 4 9-9" />
        </svg>
      );
  }
}

export function Mark({ size = 72 }: { size?: number }) {
  return (
    <svg className="mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#1e3d32" />
      <rect x="14" y="20" width="16" height="26" rx="3" fill="#f6efe4" />
      <rect x="34" y="20" width="16" height="26" rx="3" fill="#f6efe4" />
      <path d="M44 17h5v14l-2.5-2.2L44 31z" fill="#8d2f2a" />
    </svg>
  );
}
