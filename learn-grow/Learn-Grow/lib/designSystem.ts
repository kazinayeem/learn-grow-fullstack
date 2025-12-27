/**
 * Design System Configuration
 * Learn & Grow EdTech Platform
 * Modern, Premium STEM Brand Identity
 */

export const designSystem = {
  // Brand Colors - Modern, Energetic STEM Palette
  colors: {
    primary: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9", // Main primary
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
    },
    secondary: {
      50: "#fdf4ff",
      100: "#fae8ff",
      200: "#f5d0fe",
      300: "#f0abfc",
      400: "#e879f9",
      500: "#d946ef", // Main secondary
      600: "#c026d3",
      700: "#a21caf",
      800: "#86198f",
      900: "#701a75",
    },
    accent: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e", // Main accent
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d",
    },
    warning: {
      50: "#fff7ed",
      100: "#ffedd5",
      200: "#fed7aa",
      300: "#fdba74",
      400: "#fb923c",
      500: "#f97316", // Main warning (orange)
      600: "#ea580c",
      700: "#c2410c",
      800: "#9a3412",
      900: "#7c2d12",
    },
    success: {
      500: "#10b981", // Success green
    },
    error: {
      500: "#ef4444", // Error red
    },
    // Gradient combinations
    gradients: {
      primary: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
      secondary: "linear-gradient(135deg, #d946ef 0%, #a21caf 100%)",
      accent: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      warm: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      cool: "linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%)",
      robotics: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
      coding: "linear-gradient(135deg, #22c55e 0%, #10b981 100%)",
      math: "linear-gradient(135deg, #d946ef 0%, #ec4899 100%)",
      science: "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)",
    },
    // Neutral colors for text and backgrounds
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
      950: "#0a0a0a",
    },
  },

  // Typography
  typography: {
    fontFamilies: {
      // English fonts
      heading: '"Inter", "SF Pro Display", -apple-system, sans-serif',
      body: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      mono: '"Fira Code", "JetBrains Mono", monospace',

      // Bangla fonts
      bengaliHeading: '"Hind Siliguri", "SolaimanLipi", sans-serif',
      bengaliBody: '"Hind Siliguri", "SolaimanLipi", sans-serif',
    },
    fontSizes: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem", // 48px
      "6xl": "3.75rem", // 60px
      "7xl": "4.5rem", // 72px
      "8xl": "6rem", // 96px
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeights: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },

  // Spacing Scale (Tailwind-compatible)
  spacing: {
    0: "0px",
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px
    4: "1rem", // 16px
    5: "1.25rem", // 20px
    6: "1.5rem", // 24px
    8: "2rem", // 32px
    10: "2.5rem", // 40px
    12: "3rem", // 48px
    16: "4rem", // 64px
    20: "5rem", // 80px
    24: "6rem", // 96px
    32: "8rem", // 128px
    40: "10rem", // 160px
    48: "12rem", // 192px
    56: "14rem", // 224px
    64: "16rem", // 256px
  },

  // Border Radius
  borderRadius: {
    none: "0px",
    sm: "0.125rem", // 2px
    DEFAULT: "0.25rem", // 4px
    md: "0.375rem", // 6px
    lg: "0.5rem", // 8px
    xl: "0.75rem", // 12px
    "2xl": "1rem", // 16px
    "3xl": "1.5rem", // 24px
    full: "9999px",
  },

  // Shadows
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    DEFAULT:
      "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
    // Colored shadows for cards
    primaryGlow: "0 20px 40px -12px rgba(14, 165, 233, 0.3)",
    secondaryGlow: "0 20px 40px -12px rgba(217, 70, 239, 0.3)",
    accentGlow: "0 20px 40px -12px rgba(34, 197, 94, 0.3)",
  },

  // Animation & Transitions
  animations: {
    durations: {
      fast: "150ms",
      normal: "300ms",
      slow: "500ms",
    },
    easings: {
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      easeOut: "cubic-bezier(0, 0, 0.2, 1)",
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    },
    keyframes: {
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
      slideUp: {
        from: { transform: "translateY(20px)", opacity: 0 },
        to: { transform: "translateY(0)", opacity: 1 },
      },
      slideDown: {
        from: { transform: "translateY(-20px)", opacity: 0 },
        to: { transform: "translateY(0)", opacity: 1 },
      },
      scaleIn: {
        from: { transform: "scale(0.9)", opacity: 0 },
        to: { transform: "scale(1)", opacity: 1 },
      },
      float: {
        "0%, 100%": { transform: "translateY(0px)" },
        "50%": { transform: "translateY(-10px)" },
      },
      pulse: {
        "0%, 100%": { opacity: 1 },
        "50%": { opacity: 0.8 },
      },
    },
  },

  // Component Variants
  components: {
    // Button variants
    button: {
      sizes: {
        sm: {
          padding: "0.5rem 1rem",
          fontSize: "0.875rem",
          borderRadius: "0.5rem",
        },
        md: {
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          borderRadius: "0.75rem",
        },
        lg: {
          padding: "1rem 2rem",
          fontSize: "1.125rem",
          borderRadius: "1rem",
        },
      },
      variants: {
        primary: {
          background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
          color: "#ffffff",
          shadow: "0 4px 6px -1px rgba(14, 165, 233, 0.3)",
          hover: {
            transform: "translateY(-2px)",
            shadow: "0 10px 15px -3px rgba(14, 165, 233, 0.4)",
          },
        },
        secondary: {
          background: "linear-gradient(135deg, #d946ef 0%, #a21caf 100%)",
          color: "#ffffff",
          shadow: "0 4px 6px -1px rgba(217, 70, 239, 0.3)",
        },
        outline: {
          background: "transparent",
          border: "2px solid #0ea5e9",
          color: "#0ea5e9",
        },
        ghost: {
          background: "transparent",
          color: "#0ea5e9",
          hover: {
            background: "rgba(14, 165, 233, 0.1)",
          },
        },
      },
    },

    // Card variants
    card: {
      base: {
        background: "#ffffff",
        borderRadius: "1rem",
        padding: "1.5rem",
        shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
      },
      hover: {
        transform: "translateY(-4px)",
        shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
      },
      variants: {
        elevated: {
          shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        },
        bordered: {
          border: "1px solid #e5e5e5",
          shadow: "none",
        },
        glass: {
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        },
      },
    },

    // Input variants
    input: {
      base: {
        padding: "0.75rem 1rem",
        fontSize: "1rem",
        borderRadius: "0.75rem",
        border: "2px solid #e5e5e5",
        transition: "all 300ms",
      },
      focus: {
        borderColor: "#0ea5e9",
        outline: "none",
        shadow: "0 0 0 3px rgba(14, 165, 233, 0.1)",
      },
    },

    // Badge variants
    badge: {
      sizes: {
        sm: { padding: "0.25rem 0.5rem", fontSize: "0.75rem" },
        md: { padding: "0.375rem 0.75rem", fontSize: "0.875rem" },
        lg: { padding: "0.5rem 1rem", fontSize: "1rem" },
      },
      variants: {
        primary: { background: "#e0f2fe", color: "#075985" },
        success: { background: "#dcfce7", color: "#166534" },
        warning: { background: "#ffedd5", color: "#9a3412" },
        error: { background: "#fee2e2", color: "#991b1b" },
      },
    },
  },

  // Breakpoints (Mobile-First)
  breakpoints: {
    sm: "640px", // Small devices
    md: "768px", // Tablets
    lg: "1024px", // Desktops
    xl: "1280px", // Large desktops
    "2xl": "1536px", // Extra large
  },

  // Z-Index Scale
  zIndex: {
    0: 0,
    10: 10,
    20: 20,
    30: 30,
    40: 40,
    50: 50,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

export default designSystem;
