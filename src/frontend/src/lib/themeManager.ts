// Theme Manager for HisabKitab Pro
// Manages 8 color themes with CSS variable injection

export interface Theme {
  name: string;
  description: string;
  primary: string;
  sidebar: string;
  accent: string;
  // OKLCH values for CSS variables
  primaryOklch: string;
  sidebarOklch: string;
  accentOklch: string;
  tealOklch: string;
}

export const THEMES: Theme[] = [
  {
    name: "Default Blue",
    description: "Classic professional blue — the original HisabKitab look",
    primary: "#1e40af",
    sidebar: "#1e3a5f",
    accent: "#3b82f6",
    primaryOklch: "40% 0.16 255",
    sidebarOklch: "26% 0.06 240",
    accentOklch: "60% 0.19 255",
    tealOklch: "60% 0.12 195",
  },
  {
    name: "Forest Green",
    description: "Calm and trustworthy — ideal for finance and compliance",
    primary: "#166534",
    sidebar: "#14532d",
    accent: "#22c55e",
    primaryOklch: "38% 0.13 148",
    sidebarOklch: "30% 0.10 148",
    accentOklch: "72% 0.20 148",
    tealOklch: "65% 0.16 148",
  },
  {
    name: "Royal Purple",
    description: "Bold and authoritative — premium ERP presence",
    primary: "#6b21a8",
    sidebar: "#581c87",
    accent: "#a855f7",
    primaryOklch: "40% 0.22 300",
    sidebarOklch: "30% 0.18 300",
    accentOklch: "65% 0.28 300",
    tealOklch: "60% 0.22 300",
  },
  {
    name: "Sunset Orange",
    description: "Energetic and warm — great for retail and POS",
    primary: "#9a3412",
    sidebar: "#7c2d12",
    accent: "#f97316",
    primaryOklch: "40% 0.18 40",
    sidebarOklch: "28% 0.14 40",
    accentOklch: "72% 0.22 50",
    tealOklch: "65% 0.20 50",
  },
  {
    name: "Ocean Teal",
    description: "Cool and modern — inspired by coastal clarity",
    primary: "#0f766e",
    sidebar: "#134e4a",
    accent: "#14b8a6",
    primaryOklch: "48% 0.14 185",
    sidebarOklch: "30% 0.10 185",
    accentOklch: "68% 0.18 185",
    tealOklch: "60% 0.16 185",
  },
  {
    name: "Rose Pink",
    description: "Vibrant and distinct — for brands that stand out",
    primary: "#9f1239",
    sidebar: "#881337",
    accent: "#f43f5e",
    primaryOklch: "38% 0.20 10",
    sidebarOklch: "28% 0.18 10",
    accentOklch: "65% 0.26 15",
    tealOklch: "60% 0.24 15",
  },
  {
    name: "Midnight Dark",
    description: "Pure dark mode elegance — easy on the eyes for long sessions",
    primary: "#1e1e2e",
    sidebar: "#11111b",
    accent: "#89b4fa",
    primaryOklch: "18% 0.04 260",
    sidebarOklch: "12% 0.03 260",
    accentOklch: "78% 0.14 240",
    tealOklch: "72% 0.12 240",
  },
  {
    name: "Slate Gray",
    description: "Neutral and minimal — professional understatement",
    primary: "#334155",
    sidebar: "#1e293b",
    accent: "#64748b",
    primaryOklch: "36% 0.06 240",
    sidebarOklch: "24% 0.05 240",
    accentOklch: "52% 0.08 240",
    tealOklch: "55% 0.09 240",
  },
];

const THEME_KEY = "hisabkitab_theme";

export function applyTheme(themeName: string): void {
  const theme = THEMES.find((t) => t.name === themeName);
  if (!theme) return;

  const root = document.documentElement;
  root.style.setProperty("--theme-primary", theme.primary);
  root.style.setProperty("--theme-sidebar", theme.sidebar);
  root.style.setProperty("--theme-accent", theme.accent);

  // Override OKLCH variables for sidebar and teal accent
  root.style.setProperty("--sidebar", theme.sidebarOklch);
  root.style.setProperty("--teal", theme.tealOklch);
  root.style.setProperty("--teal-bright", theme.accentOklch);
  root.style.setProperty("--accent", theme.accentOklch);
  root.style.setProperty("--ring", theme.accentOklch);
  root.style.setProperty("--primary", theme.primaryOklch);

  localStorage.setItem(THEME_KEY, themeName);
}

export function loadSavedTheme(): void {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) {
    applyTheme(saved);
  }
}

export function getCurrentThemeName(): string {
  return localStorage.getItem(THEME_KEY) ?? "Default Blue";
}
