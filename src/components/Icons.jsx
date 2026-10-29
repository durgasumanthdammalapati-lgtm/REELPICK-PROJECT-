const base = { viewBox: "0 0 24 24", width: 20, height: 20, "aria-hidden": "true", focusable: "false" };

export const HeartIcon = ({ filled }) => (
  <svg {...base} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

export const StarIcon = () => (
  <svg {...base} width="16" height="16" fill="currentColor">
    <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" />
  </svg>
);

export const SunIcon = () => (
  <svg {...base} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const MoonIcon = () => (
  <svg {...base} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export const CloseIcon = () => (
  <svg {...base} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const LogoMark = () => (
  <svg viewBox="0 0 64 64" width="30" height="30" aria-hidden="true" focusable="false">
    <rect width="64" height="64" rx="14" fill="var(--accent)" />
    <rect x="14" y="16" width="36" height="32" rx="5" fill="none" stroke="var(--accent-ink)" strokeWidth="4" />
    <path d="M28 25l11 7-11 7z" fill="var(--accent-ink)" />
  </svg>
);
