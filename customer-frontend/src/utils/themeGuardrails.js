/**
 * DYNAMIC UI/UX THEMING STRICT GUARDRAILS (Section 8)
 * Source of truth for portal color tokens and context styling.
 */

export const THEME_GUARDRAILS = {
  login: {
    page_context: "login",
    aesthetic: "Immersive, premium, and welcoming",
    canvas: "linear-gradient(135deg, #1E1B4B 0%, #4C1D95 100%)", // Midnight Iris to Deep Royal Violet
    bgIris: "#1E1B4B",
    bgViolet: "#4C1D95",
    surface: "#FFFFFF", // Pure White card surface
    surfaceText: "#0F172A",
    surfaceTextMuted: "#475569",
    actionAccent: "#F59E0B", // Warm Gold
    actionAccentHover: "#D97706",
    actionText: "#FFFFFF",
    borderColor: "rgba(255, 255, 255, 0.15)"
  },

  customer: {
    page_context: "customer",
    aesthetic: "Premium boutique, clean, high-contrast product focus (Forced Light Mode)",
    forcedMode: "light",
    dominantShell: "#0F766E", // Deep Ocean Teal (Nav/Footer/Categories)
    shellHover: "#115E59",
    canvas: "#F5F5F4", // Soft Sand / Stone
    cardBg: "#FFFFFF",
    aiWidgetAction: "#0D9488", // Luminous Teal
    aiWidgetHover: "#0F766E",
    highlights: "#BE123C", // Rich Rosewood (Prices/Discount Tags)
    textMain: "#0F172A",
    textMuted: "#57534E",
    border: "#E7E5E4"
  },

  vendor: {
    page_context: "vendor",
    aesthetic: "Energetic, data-driven, entrepreneurial workspace",
    dominantStructure: "#312E81", // Deep Indigo (Sidebars/Headers)
    canvas: "#F3F4F6", // Cool Gray
    cardBg: "#FFFFFF",
    dataAction: "#3B82F6", // Vibrant Cobalt (Primary CTA/Charts)
    dataActionHover: "#2563EB",
    growthMetrics: "#10B981", // Emerald Green (Success/In-Stock)
    textMain: "#111827",
    textMuted: "#4B5563",
    border: "#E5E7EB"
  },

  admin: {
    page_context: "admin",
    aesthetic: "Authoritative, secure, dark-mode-dominant oversight",
    canvas: "#18181B", // Pitch Obsidian
    surfaceCards: "#27272A", // Matte Charcoal
    authorityAccent: "#E11D48", // Crimson Red (Alerts/Compliance Fails)
    dataHighlights: "#38BDF8", // Neon Sky Blue (Revenue Charts)
    textMain: "#F4F4F5",
    textMuted: "#A1A1AA",
    border: "#3F3F46"
  },

  chairman_admin: {
    page_context: "chairman_admin",
    aesthetic: "Imperial Onyx & Sovereign Gold — prestigious, commanding, luxury dark mode",
    canvas: "#090A0F", // Midnight Onyx
    structuralNav: "#111827", // Sovereign Slate
    navBorder: "1px solid #D4AF37", // 1px Burnished Gold border
    coreTelemetryAccent: "#D4AF37", // Burnished Metallic Gold
    coreTelemetryHover: "#B89628",
    systemOrchestration: "#8B5CF6", // Sovereign Amethyst (AI agent load and multi-portal sync)
    killswitch: "#DC2626", // Deep Crimson (Emergency freeze and fraud locks)
    cardBg: "rgba(17, 24, 39, 0.95)",
    textMain: "#F8FAFC",
    textMuted: "#94A3B8",
    border: "rgba(212, 175, 55, 0.25)"
  }
};

export function getContextStyle(pageContext) {
  return THEME_GUARDRAILS[pageContext] || THEME_GUARDRAILS.customer;
}
