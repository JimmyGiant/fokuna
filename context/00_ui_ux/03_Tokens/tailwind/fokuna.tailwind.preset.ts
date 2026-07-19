import type { Config } from 'tailwindcss';

export const fokunaTailwindTheme = {
  "colors": {
    "border": {
      "action": "var(--fk-color-border-action)",
      "action-primary": "var(--fk-color-border-action-primary)",
      "action-primary-hover": "var(--fk-color-border-action-primary-hover)",
      "action-secondary": "var(--fk-color-border-action-secondary)",
      "action-secondary-hover": "var(--fk-color-border-action-secondary-hover)",
      "default": "var(--fk-color-border-default)",
      "disabled": "var(--fk-color-border-disabled)",
      "feedback-default": "var(--fk-color-border-feedback-default)",
      "feedback-error": "var(--fk-color-border-feedback-error)",
      "feedback-info": "var(--fk-color-border-feedback-info)",
      "feedback-warning": "var(--fk-color-border-feedback-warning)",
      "focus": "var(--fk-color-border-focus)",
      "inverse": "var(--fk-color-border-inverse)",
      "strong": "var(--fk-color-border-strong)",
      "subtle": "var(--fk-color-border-subtle)",
      "tertiary": "var(--fk-color-border-tertiary)"
    },
    "brand": {
      "primary": "var(--fk-color-brand-primary)",
      "primary-hover": "var(--fk-color-brand-primary-hover)",
      "primary-pressed": "var(--fk-color-brand-primary-pressed)",
      "secondary": "var(--fk-color-brand-secondary)",
      "secondary-hover": "var(--fk-color-brand-secondary-hover)",
      "secondary-pressed": "var(--fk-color-brand-secondary-pressed)"
    },
    "category": {
      "blue": "var(--fk-color-category-blue)",
      "blue-10": "var(--fk-color-category-blue-10)",
      "blue-25": "var(--fk-color-category-blue-25)",
      "blue-50": "var(--fk-color-category-blue-50)",
      "blue-text": "var(--fk-color-category-blue-text)",
      "coral": "var(--fk-color-category-coral)",
      "coral-10": "var(--fk-color-category-coral-10)",
      "coral-25": "var(--fk-color-category-coral-25)",
      "coral-50": "var(--fk-color-category-coral-50)",
      "coral-text": "var(--fk-color-category-coral-text)",
      "gold": "var(--fk-color-category-gold)",
      "gold-10": "var(--fk-color-category-gold-10)",
      "gold-25": "var(--fk-color-category-gold-25)",
      "gold-50": "var(--fk-color-category-gold-50)",
      "gold-text": "var(--fk-color-category-gold-text)",
      "on-color": "var(--fk-color-category-on-color)",
      "pink": "var(--fk-color-category-pink)",
      "pink-10": "var(--fk-color-category-pink-10)",
      "pink-25": "var(--fk-color-category-pink-25)",
      "pink-50": "var(--fk-color-category-pink-50)",
      "pink-text": "var(--fk-color-category-pink-text)",
      "purple": "var(--fk-color-category-purple)",
      "purple-10": "var(--fk-color-category-purple-10)",
      "purple-25": "var(--fk-color-category-purple-25)",
      "purple-50": "var(--fk-color-category-purple-50)",
      "purple-text": "var(--fk-color-category-purple-text)",
      "teal": "var(--fk-color-category-teal)",
      "teal-10": "var(--fk-color-category-teal-10)",
      "teal-25": "var(--fk-color-category-teal-25)",
      "teal-50": "var(--fk-color-category-teal-50)",
      "teal-text": "var(--fk-color-category-teal-text)"
    },
    "icon": {
      "action-primary": "var(--fk-color-icon-action-primary)",
      "action-primary-hover": "var(--fk-color-icon-action-primary-hover)",
      "action-secondary": "var(--fk-color-icon-action-secondary)",
      "action-secondary-hover": "var(--fk-color-icon-action-secondary-hover)",
      "brand-primary": "var(--fk-color-icon-brand-primary)",
      "brand-secondary": "var(--fk-color-icon-brand-secondary)",
      "disabled": "var(--fk-color-icon-disabled)",
      "error": "var(--fk-color-icon-error)",
      "feedback-default": "var(--fk-color-icon-feedback-default)",
      "feedback-error": "var(--fk-color-icon-feedback-error)",
      "feedback-info": "var(--fk-color-icon-feedback-info)",
      "feedback-warning": "var(--fk-color-icon-feedback-warning)",
      "info": "var(--fk-color-icon-info)",
      "inverse": "var(--fk-color-icon-inverse)",
      "primary": "var(--fk-color-icon-primary)",
      "quarternary": "var(--fk-color-icon-quarternary)",
      "secondary": "var(--fk-color-icon-secondary)",
      "success": "var(--fk-color-icon-success)",
      "tertiary": "var(--fk-color-icon-tertiary)",
      "warning": "var(--fk-color-icon-warning)"
    },
    "state": {
      "hover": "var(--fk-color-state-hover)",
      "selected": "var(--fk-color-state-selected)",
      "subtle-alpha-10": "var(--fk-color-state-subtle-alpha-10)",
      "subtle-alpha-50": "var(--fk-color-state-subtle-alpha-50)"
    },
    "surface": {
      "action-primary": "var(--fk-color-surface-action-primary)",
      "action-primary-hover": "var(--fk-color-surface-action-primary-hover)",
      "action-secondary": "var(--fk-color-surface-action-secondary)",
      "action-secondary-hover": "var(--fk-color-surface-action-secondary-hover)",
      "base": "var(--fk-color-surface-base)",
      "brand-primary": "var(--fk-color-surface-brand-primary)",
      "brand-secondary": "var(--fk-color-surface-brand-secondary)",
      "brand-secondary-10": "var(--fk-color-surface-brand-secondary-10)",
      "brand-secondary-25": "var(--fk-color-surface-brand-secondary-25)",
      "brand-secondary-50": "var(--fk-color-surface-brand-secondary-50)",
      "brand-secondary-75": "var(--fk-color-surface-brand-secondary-75)",
      "brand-tertiary": "var(--fk-color-surface-brand-tertiary)",
      "disabled": "var(--fk-color-surface-disabled)",
      "feedback-default": "var(--fk-color-surface-feedback-default)",
      "feedback-error": "var(--fk-color-surface-feedback-error)",
      "feedback-info": "var(--fk-color-surface-feedback-info)",
      "feedback-warning": "var(--fk-color-surface-feedback-warning)",
      "inverse": "var(--fk-color-surface-inverse)",
      "muted": "var(--fk-color-surface-muted)",
      "soft": "var(--fk-color-surface-soft)",
      "subtle": "var(--fk-color-surface-subtle)",
      "tertiary": "var(--fk-color-surface-tertiary)",
      "transparent": "var(--fk-color-surface-transparent)"
    },
    "task-priority": {
      "high": "var(--fk-color-task-priority-high)",
      "low": "var(--fk-color-task-priority-low)",
      "medium": "var(--fk-color-task-priority-medium)",
      "on-color": "var(--fk-color-task-priority-on-color)",
      "urgent": "var(--fk-color-task-priority-urgent)"
    },
    "text": {
      "action-primary": "var(--fk-color-text-action-primary)",
      "action-primary-hover": "var(--fk-color-text-action-primary-hover)",
      "action-secondary": "var(--fk-color-text-action-secondary)",
      "action-secondary-hover": "var(--fk-color-text-action-secondary-hover)",
      "disabled": "var(--fk-color-text-disabled)",
      "error": "var(--fk-color-text-error)",
      "info": "var(--fk-color-text-info)",
      "inverse": "var(--fk-color-text-inverse)",
      "primary": "var(--fk-color-text-primary)",
      "quarternary": "var(--fk-color-text-quarternary)",
      "secondary": "var(--fk-color-text-secondary)",
      "success": "var(--fk-color-text-success)",
      "tertiary": "var(--fk-color-text-tertiary)",
      "warning": "var(--fk-color-text-warning)"
    },
    "primitive": {
      "base": {
        "black": "var(--fk-primitive-base-black)",
        "transparent": "var(--fk-primitive-base-transparent)",
        "white": "var(--fk-primitive-base-white)"
      },
      "categorical": {
        "blue": "var(--fk-primitive-categorical-blue)",
        "gold": "var(--fk-primitive-categorical-gold)",
        "pink": "var(--fk-primitive-categorical-pink)",
        "purple": "var(--fk-primitive-categorical-purple)"
      },
      "coral": {
        "100": "var(--fk-primitive-coral-100)",
        "200": "var(--fk-primitive-coral-200)",
        "300": "var(--fk-primitive-coral-300)",
        "400": "var(--fk-primitive-coral-400)",
        "500": "var(--fk-primitive-coral-500)",
        "600": "var(--fk-primitive-coral-600)",
        "700": "var(--fk-primitive-coral-700)",
        "800": "var(--fk-primitive-coral-800)",
        "900": "var(--fk-primitive-coral-900)",
        "1000": "var(--fk-primitive-coral-1000)"
      },
      "feedback-scale": {
        "error-surface-10": "var(--fk-primitive-feedback-scale-error-surface-10)",
        "warning": "var(--fk-primitive-feedback-scale-warning)",
        "warning-border": "var(--fk-primitive-feedback-scale-warning-border)",
        "warning-surface-10": "var(--fk-primitive-feedback-scale-warning-surface-10)"
      },
      "grey": {
        "100": "var(--fk-primitive-grey-100)",
        "150": "var(--fk-primitive-grey-150)",
        "200": "var(--fk-primitive-grey-200)",
        "300": "var(--fk-primitive-grey-300)",
        "400": "var(--fk-primitive-grey-400)",
        "500": "var(--fk-primitive-grey-500)",
        "600": "var(--fk-primitive-grey-600)",
        "700": "var(--fk-primitive-grey-700)",
        "800": "var(--fk-primitive-grey-800)",
        "900": "var(--fk-primitive-grey-900)",
        "1000": "var(--fk-primitive-grey-1000)"
      },
      "ink": {
        "100": "var(--fk-primitive-ink-100)",
        "200": "var(--fk-primitive-ink-200)",
        "300": "var(--fk-primitive-ink-300)",
        "400": "var(--fk-primitive-ink-400)",
        "500": "var(--fk-primitive-ink-500)",
        "600": "var(--fk-primitive-ink-600)",
        "700": "var(--fk-primitive-ink-700)",
        "800": "var(--fk-primitive-ink-800)",
        "900": "var(--fk-primitive-ink-900)",
        "1000": "var(--fk-primitive-ink-1000)"
      },
      "pink": {
        "100": "var(--fk-primitive-pink-100)",
        "200": "var(--fk-primitive-pink-200)",
        "300": "var(--fk-primitive-pink-300)",
        "400": "var(--fk-primitive-pink-400)",
        "500": "var(--fk-primitive-pink-500)",
        "600": "var(--fk-primitive-pink-600)",
        "700": "var(--fk-primitive-pink-700)",
        "800": "var(--fk-primitive-pink-800)",
        "900": "var(--fk-primitive-pink-900)",
        "1000": "var(--fk-primitive-pink-1000)"
      },
      "priority-scale": {
        "high": "var(--fk-primitive-priority-scale-high)",
        "low": "var(--fk-primitive-priority-scale-low)",
        "medium": "var(--fk-primitive-priority-scale-medium)",
        "urgent": "var(--fk-primitive-priority-scale-urgent)"
      },
      "purple": {
        "100": "var(--fk-primitive-purple-100)",
        "200": "var(--fk-primitive-purple-200)",
        "300": "var(--fk-primitive-purple-300)",
        "400": "var(--fk-primitive-purple-400)",
        "500": "var(--fk-primitive-purple-500)",
        "600": "var(--fk-primitive-purple-600)",
        "700": "var(--fk-primitive-purple-700)",
        "800": "var(--fk-primitive-purple-800)",
        "900": "var(--fk-primitive-purple-900)",
        "1000": "var(--fk-primitive-purple-1000)"
      },
      "sand": {
        "100": "var(--fk-primitive-sand-100)",
        "200": "var(--fk-primitive-sand-200)",
        "300": "var(--fk-primitive-sand-300)",
        "400": "var(--fk-primitive-sand-400)",
        "500": "var(--fk-primitive-sand-500)",
        "600": "var(--fk-primitive-sand-600)",
        "700": "var(--fk-primitive-sand-700)",
        "800": "var(--fk-primitive-sand-800)",
        "900": "var(--fk-primitive-sand-900)",
        "1000": "var(--fk-primitive-sand-1000)"
      },
      "teal": {
        "100": "var(--fk-primitive-teal-100)",
        "200": "var(--fk-primitive-teal-200)",
        "300": "var(--fk-primitive-teal-300)",
        "400": "var(--fk-primitive-teal-400)",
        "500": "var(--fk-primitive-teal-500)",
        "600": "var(--fk-primitive-teal-600)",
        "700": "var(--fk-primitive-teal-700)",
        "800": "var(--fk-primitive-teal-800)",
        "900": "var(--fk-primitive-teal-900)",
        "1000": "var(--fk-primitive-teal-1000)",
        "surface-10": "var(--fk-primitive-teal-surface-10)",
        "surface-25": "var(--fk-primitive-teal-surface-25)",
        "surface-50": "var(--fk-primitive-teal-surface-50)",
        "surface-75": "var(--fk-primitive-teal-surface-75)"
      }
    }
  },
  "fontFamily": {
    "body": [
      "Geist",
      "sans-serif"
    ],
    "heading": [
      "Geist",
      "sans-serif"
    ],
    "label": [
      "Geist",
      "sans-serif"
    ],
    "serif": [
      "Roboto Serif",
      "serif"
    ],
    "schmuckzeile": [
      "Roboto Serif",
      "serif"
    ]
  },
  "fontSize": {
    "body-2-xl": [
      "24px",
      {
        "lineHeight": "32px",
        "letterSpacing": "0px",
        "fontWeight": "400"
      }
    ],
    "body-lg": [
      "16px",
      {
        "lineHeight": "22px",
        "letterSpacing": "0px",
        "fontWeight": "400"
      }
    ],
    "body-md": [
      "14px",
      {
        "lineHeight": "20px",
        "letterSpacing": "0px",
        "fontWeight": "400"
      }
    ],
    "body-sm": [
      "12px",
      {
        "lineHeight": "16px",
        "letterSpacing": "0px",
        "fontWeight": "400"
      }
    ],
    "body-xl": [
      "20px",
      {
        "lineHeight": "28px",
        "letterSpacing": "0px",
        "fontWeight": "400"
      }
    ],
    "headline-2-xl": [
      "48px",
      {
        "lineHeight": "56px",
        "letterSpacing": "0px",
        "fontWeight": "700"
      }
    ],
    "headline-3-xl": [
      "64px",
      {
        "lineHeight": "64px",
        "letterSpacing": "0px",
        "fontWeight": "700"
      }
    ],
    "headline-lg": [
      "32px",
      {
        "lineHeight": "40px",
        "letterSpacing": "0px",
        "fontWeight": "700"
      }
    ],
    "headline-md": [
      "24px",
      {
        "lineHeight": "32px",
        "letterSpacing": "0px",
        "fontWeight": "700"
      }
    ],
    "headline-md-sm": [
      "20px",
      {
        "lineHeight": "24px",
        "letterSpacing": "0px",
        "fontWeight": "700"
      }
    ],
    "headline-sm": [
      "16px",
      {
        "lineHeight": "24px",
        "letterSpacing": "0px",
        "fontWeight": "700"
      }
    ],
    "headline-xl": [
      "40px",
      {
        "lineHeight": "48px",
        "letterSpacing": "0px",
        "fontWeight": "700"
      }
    ],
    "headline-xs": [
      "14px",
      {
        "lineHeight": "16px",
        "letterSpacing": "0px",
        "fontWeight": "700"
      }
    ],
    "label-2-xl": [
      "24px",
      {
        "lineHeight": "32px",
        "letterSpacing": "0px",
        "fontWeight": "600"
      }
    ],
    "label-lg": [
      "16px",
      {
        "lineHeight": "22px",
        "letterSpacing": "0px",
        "fontWeight": "600"
      }
    ],
    "label-md": [
      "14px",
      {
        "lineHeight": "20px",
        "letterSpacing": "0px",
        "fontWeight": "600"
      }
    ],
    "label-sm": [
      "12px",
      {
        "lineHeight": "16px",
        "letterSpacing": "0px",
        "fontWeight": "600"
      }
    ],
    "label-xl": [
      "20px",
      {
        "lineHeight": "28px",
        "letterSpacing": "0px",
        "fontWeight": "600"
      }
    ],
    "link-2-xl": [
      "24px",
      {
        "lineHeight": "32px",
        "letterSpacing": "0px",
        "fontWeight": "600"
      }
    ],
    "link-lg": [
      "16px",
      {
        "lineHeight": "22px",
        "letterSpacing": "0px",
        "fontWeight": "600"
      }
    ],
    "link-md": [
      "14px",
      {
        "lineHeight": "20px",
        "letterSpacing": "0px",
        "fontWeight": "600"
      }
    ],
    "link-sm": [
      "12px",
      {
        "lineHeight": "16px",
        "letterSpacing": "0px",
        "fontWeight": "600"
      }
    ],
    "link-xl": [
      "20px",
      {
        "lineHeight": "28px",
        "letterSpacing": "0px",
        "fontWeight": "600"
      }
    ],
    "schmuckzeile-2-xl": [
      "24px",
      {
        "lineHeight": "32px",
        "letterSpacing": "0px",
        "fontWeight": "500"
      }
    ],
    "schmuckzeile-3-xl": [
      "32px",
      {
        "lineHeight": "40px",
        "letterSpacing": "0px",
        "fontWeight": "500"
      }
    ],
    "schmuckzeile-4-xl": [
      "40px",
      {
        "lineHeight": "48px",
        "letterSpacing": "0px",
        "fontWeight": "500"
      }
    ],
    "schmuckzeile-lg": [
      "16px",
      {
        "lineHeight": "22px",
        "letterSpacing": "0px",
        "fontWeight": "500"
      }
    ],
    "schmuckzeile-md": [
      "14px",
      {
        "lineHeight": "20px",
        "letterSpacing": "0px",
        "fontWeight": "500"
      }
    ],
    "schmuckzeile-sm": [
      "12px",
      {
        "lineHeight": "16px",
        "letterSpacing": "0px",
        "fontWeight": "500"
      }
    ],
    "schmuckzeile-xl": [
      "20px",
      {
        "lineHeight": "24px",
        "letterSpacing": "0px",
        "fontWeight": "500"
      }
    ]
  },
  "borderRadius": {
    "full": "var(--fk-radius-full)",
    "global-focus-radius": "var(--fk-radius-global-focus-radius)",
    "global-radius": "var(--fk-radius-global-radius)",
    "global-radius-card": "var(--fk-radius-global-radius-card)",
    "lg": "var(--fk-radius-lg)",
    "md": "var(--fk-radius-md)",
    "none": "var(--fk-radius-none)",
    "sm": "var(--fk-radius-sm)",
    "xl": "var(--fk-radius-xl)"
  },
  "spacing": {
    "grid-baseline": "var(--fk-spacing-grid-baseline)"
  },
  "boxShadow": {
    "highlight-card": "0px 2px 4px -2px rgba(9, 25, 49, 0.06), 0px 10px 24px -8px rgba(9, 25, 49, 0.08), 0px 24px 56px -18px rgba(9, 25, 49, 0.1), 0px 40px 96px -32px rgba(9, 25, 49, 0.06)",
    "medium-card": "0px 1px 2px -1px rgba(9, 25, 49, 0.05), 0px 6px 16px -6px rgba(9, 25, 49, 0.07), 0px 16px 32px -14px rgba(9, 25, 49, 0.08)",
    "micro-element": "0px 1px 1px 0px rgba(9, 25, 49, 0.04), 0px 2px 6px -3px rgba(9, 25, 49, 0.035)",
    "subtle-element": "0px 1px 2px -1px rgba(9, 25, 49, 0.04), 0px 3px 8px -4px rgba(9, 25, 49, 0.05), 0px 8px 16px -10px rgba(9, 25, 49, 0.04)"
  }
} as const;

const fokunaTailwindPreset = {
  theme: { extend: fokunaTailwindTheme },
} satisfies Partial<Config>;

export default fokunaTailwindPreset;
