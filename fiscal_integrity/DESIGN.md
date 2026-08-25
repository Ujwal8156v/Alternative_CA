---
name: Fiscal Integrity
colors:
  surface: '#f7fafd'
  surface-dim: '#d7dadd'
  surface-bright: '#f7fafd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f7'
  surface-container: '#ebeef1'
  surface-container-high: '#e5e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#181c1e'
  on-surface-variant: '#43474d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eef1f4'
  outline: '#74777e'
  outline-variant: '#c4c6ce'
  surface-tint: '#49607e'
  primary: '#000f22'
  on-primary: '#ffffff'
  primary-container: '#0a2540'
  on-primary-container: '#768dad'
  inverse-primary: '#b0c8eb'
  secondary: '#006e0c'
  on-secondary: '#ffffff'
  secondary-container: '#49fd48'
  on-secondary-container: '#00710d'
  tertiary: '#1a0b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#381d00'
  on-tertiary-container: '#ae835a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#b0c8eb'
  on-primary-fixed: '#001c37'
  on-primary-fixed-variant: '#314865'
  secondary-fixed: '#75ff69'
  secondary-fixed-dim: '#25e531'
  on-secondary-fixed: '#002201'
  on-secondary-fixed-variant: '#005307'
  tertiary-fixed: '#ffdcbe'
  tertiary-fixed-dim: '#eebd90'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#613f1c'
  background: '#f7fafd'
  on-background: '#181c1e'
  surface-variant: '#e0e3e6'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max-width: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The brand personality is authoritative yet accessible, designed to alleviate the anxiety often associated with tax compliance. This design system prioritizes **Modern Minimalism** with a focus on **Professionalism and Trust**.

The UI must evoke a sense of security and precision. By utilizing heavy whitespace and a restricted color palette, we guide the user through complex financial data without overwhelming them. The aesthetic leans toward a "Corporate Modern" approach—structured, systematic, and highly legible—ensuring that users feel their sensitive data is handled with institutional-grade care.

## Colors

The palette is anchored by **Deep Trust Blue**, used for core branding, primary actions, and navigational elements to establish authority. **Success Emerald** is used sparingly as a functional accent for positive statuses, completion states, and "Verified" indicators, providing clear visual reinforcement of progress.

The background uses a tiered system of **subtle professional Grays**. The base surface is pure white, while the canvas background utilizes `#F6F9FC` to create soft contrast for content cards. Text should predominantly use a deep slate near-black to ensure maximum readability against the light background.

## Typography

The design system exclusively uses **Inter** to leverage its exceptional legibility in data-dense environments. 

- **Headlines:** Use tighter letter-spacing and semi-bold weights to create a strong visual anchor.
- **Body Text:** Standard weight (400) is used for all descriptive text to ensure long-form reading comfort during the filing process.
- **Labels:** Use a slightly heavier weight and uppercase styling for small metadata or section headers to differentiate them from interactive text.
- **Numbers:** Ensure tabular lining figures are used where possible for financial tables to keep decimal points aligned.

## Layout & Spacing

This design system follows a **Fixed Grid** model on desktop to maintain a professional, organized structure for financial forms. 

- **Desktop:** 12-column grid with a 1200px max-width, centered.
- **Tablet:** 8-column fluid grid with 24px margins.
- **Mobile:** 4-column fluid grid with 16px margins.

Spacing follows an 8px linear scale. Vertical rhythm is critical; use `stack-lg` (32px) to separate major data sections (e.g., Income vs. Deductions) and `stack-md` (16px) for related input groups. Generous padding within cards (24px to 32px) is required to prevent the UI from feeling "taxing" or cluttered.

## Elevation & Depth

To maintain a high-trust, professional aesthetic, this design system avoids heavy shadows in favor of **Tonal Layers** and **Subtle Outlines**.

- **Level 0 (Canvas):** The base background layer in `#F6F9FC`.
- **Level 1 (Cards):** White surfaces with a 1px solid border in `#E3E8EE`. No shadow is used for static cards.
- **Level 2 (Interactive/Floating):** Used for dropdowns, modals, or active states. These utilize a very soft, diffused ambient shadow: `0px 4px 12px rgba(10, 37, 64, 0.05)`.

This approach ensures the UI feels flat and systematic rather than decorative, reinforcing the utilitarian nature of a tax tool.

## Shapes

The shape language is **Soft (0.25rem)**. This provides a subtle modern touch that breaks the rigidity of a corporate tool without appearing too "playful" or consumer-grade.

- **Inputs and Buttons:** 4px (0.25rem) corner radius.
- **Data Cards:** 8px (0.5rem) corner radius for a slightly softer container feel.
- **Status Badges:** Fully rounded (pill-shaped) to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid Deep Trust Blue (#0A2540) with White text. Used for the final "File Now" or "Continue" actions.
- **Secondary:** White background with a 1px border of Deep Trust Blue. Used for "Add More" or "Back" actions.
- **Success:** Solid Success Emerald (#00D924) with White text, reserved for "Payment Complete" or "Final Submission" states.

### Cards
All data sections (e.g., Salary, House Property, Capital Gains) must be enclosed in white cards with 24px internal padding. Each card should have a clear title in `headline-md`.

### Status Indicators
- **Verified:** A Success Emerald pill-badge with a small check icon. Text: "Verified".
- **Security:** A subtle gray-tinted badge with a lock icon. Text: "256-bit Encrypted".
- **Pending:** A soft amber/orange badge used to highlight missing information.

### Input Fields
Inputs must include a clear, persistent label above the field. Use a 1px border (#E3E8EE) that transitions to Deep Trust Blue on focus. Use placeholder text sparingly; prefer "Helper Text" below the field for specific tax instructions.

### Progress Stepper
A horizontal stepper at the top of the viewport is required to show the user's progress through the multi-step filing journey (e.g., Sources of Income → Deductions → Taxes Paid → Verification).