// App Theme Configuration
export const theme = {
  // Color Palette
  colors: {
    // Primary Colors
    primary: "#10b981", // Emerald-500 (main green)
    primaryDark: "#065f46", // Emerald-800 (darker green)
    primaryLight: "#064e3b", // Emerald-900 (darkest green)

    // Background Colors
    background: "#0f172a", // Slate-900 (main background)
    surface: "#1e293b", // Slate-800 (card/surface background)
    surfaceLight: "#334155", // Slate-700 (lighter surface)

    // Text Colors
    textPrimary: "#f8fafc", // Slate-50 (main white text)
    textSecondary: "#e2e8f0", // Slate-200 (secondary white text)
    textMuted: "#cbd5e1", // Slate-300 (muted text)
    textSubtle: "#94a3b8", // Slate-400 (subtle text)
    textDisabled: "#64748b", // Slate-500 (disabled text)
    placeholder: "#64748b", // Slate-600 (input placeholder)

    // Accent Colors
    blue: "#3b82f6", // Blue-500
    blueDark: "#1e3a8a", // Blue-800
    purple: "#8b5cf6", // Violet-500
    purpleDark: "#5b21b6", // Violet-800
    amber: "#f59e0b", // Amber-500
    amberDark: "#92400e", // Amber-800
    cyan: "#06b6d4", // Cyan-500
    cyanDark: "#164e63", // Cyan-800

    // Status Colors
    success: "#10b981", // Emerald-500
    error: "#ef4444", // Red-500
    errorDark: "#7f1d1d", // Red-900
    warning: "#f59e0b", // Amber-500
    info: "#06b6d4", // Cyan-500

    // Destructive Colors
    destructive: "#fca5a5", // Red-300
    destructiveLight: "#f87171", // Red-400
    destructiveBackground: "rgba(127, 29, 29, 0.3)", // Red-900 with opacity
    destructiveBorder: "rgba(220, 38, 38, 0.4)", // Red-600 with opacity

    // Border & Divider Colors
    border: "#334155", // Slate-700
    borderLight: "#475569", // Slate-600

    // Overlay Colors
    overlay: "rgba(0, 0, 0, 0.5)",
    backdrop: "rgba(15, 23, 42, 0.8)", // background with opacity
  },

  // Typography
  typography: {
    // Font Sizes
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      "2xl": 26,
      "3xl": 36,
    },

    // Font Weights
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },

    // Line Heights
    lineHeight: {
      tight: 18,
      normal: 24,
    },

    // Letter Spacing
    letterSpacing: {
      wide: 0.8,
    },
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
    "4xl": 40,
    "5xl": 60,
  },

  // Border Radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 14,
    xl: 16,
    "2xl": 20,
    full: 50,
  },

  // Component Specific Styles
  components: {
    // Avatar
    avatar: {
      size: {
        sm: 40,
        md: 60,
        lg: 90,
      },
      borderWidth: 4,
    },

    // Cards
    card: {
      borderRadius: 12,
      backgroundColor: "#1e293b",
      borderColor: "#334155",
      borderWidth: 1,
    },

    button: {
      padding: 20,
      borderRadius: 16,
      activeOpacity: 0.7,
    },

    // Icons
    icon: {
      container: {
        width: 48,
        height: 48,
        borderRadius: 24,
      },
      size: {
        sm: 16,
        md: 20,
        lg: 24,
      },
    },

    // Status Indicator
    statusIndicator: {
      size: 20,
      borderRadius: 10,
      borderWidth: 3,
    },

    // Role Tag
    roleTag: {
      backgroundColor: "rgba(16, 185, 129, 0.15)",
      borderColor: "rgba(16, 185, 129, 0.3)",
      borderRadius: 25,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
  },

  // Shadow
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
  },

  // Layout
  layout: {
    container: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    header: {
      paddingTop: 60,
      paddingBottom: 30,
    },
  },

  // Animation
  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      ease: "ease",
      easeIn: "ease-in",
      easeOut: "ease-out",
      easeInOut: "ease-in-out",
    },
  },
};
