# QA Studio UI Style Guide

## Design Philosophy

### Modern & Professional
QA Studio embodies a sleek, professional aesthetic that inspires confidence in testing workflows. The interface balances sophistication with approachability, making complex testing tasks feel manageable.

### Dark-First Design
The primary theme is dark mode, reducing eye strain during long testing sessions while creating a focused, distraction-free environment.

## Color Palette

### Primary Colors
```css
--primary: #14b8a6 (Teal) - Actions, CTAs, success states
--secondary: #6366f1 (Indigo) - Accents, highlights
--accent: #8b5cf6 (Purple) - Special features, premium elements
```

### Semantic Colors
```css
--success: #22c55e (Green) - Successful operations
--warning: #f59e0b (Amber) - Warnings, cautions
--error: #ef4444 (Red) - Errors, critical issues
--info: #3b82f6 (Blue) - Information, neutral states
```

### Background & Surface
```css
--bg-primary: #0a0a0a (Deep Black) - Main background
--bg-secondary: #111111 (Dark Gray) - Cards, panels
--bg-card: #1a1a1a (Charcoal) - Elevated surfaces
--border: #2a2a2a (Subtle Gray) - Dividers, borders
```

### Text Colors
```css
--text-primary: #ffffff (White) - Headings, important text
--text-secondary: #a3a3a3 (Light Gray) - Body text
--text-muted: #737373 (Medium Gray) - Subtle text, hints
```

## Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Font Sizes
- **Headings**: 2xl (24px), xl (20px), lg (18px)
- **Body**: base (16px), sm (14px)
- **Small**: xs (12px)

### Font Weights
- **Bold**: 700 - Headings, emphasis
- **Semibold**: 600 - Subheadings, labels
- **Medium**: 500 - Buttons, tabs
- **Regular**: 400 - Body text

## Component Styles

### Buttons

**Primary Button**
```css
.btn-primary {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
}
```

**Secondary Button**
```css
.btn-secondary {
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
}

.btn-secondary:hover {
  background: var(--bg-secondary);
  border-color: var(--primary);
}
```

**Danger Button**
```css
.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}
```

### Cards

```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s;
}

.card:hover {
  border-color: var(--primary);
  box-shadow: 0 8px 24px rgba(20, 184, 166, 0.1);
}
```

### Inputs

```css
.input {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}
```

### Badges

```css
.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-primary { background: rgba(20, 184, 166, 0.2); color: #14b8a6; }
.badge-red { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
.badge-yellow { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.badge-blue { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
```

## Layout Patterns

### Sidebar Navigation
- Fixed left sidebar (240px width)
- Icon + text navigation items
- Active state with gradient background
- Smooth hover transitions
- User profile at bottom

### Header
- Sticky top header
- Logo + branding on left
- Actions/utilities on right
- Backdrop blur effect
- Subtle bottom border

### Content Area
- Full height with scroll
- Consistent padding (1.5rem)
- Max-width for readability
- Responsive grid layouts

## Spacing System

```css
--space-xs: 0.25rem (4px)
--space-sm: 0.5rem (8px)
--space-md: 1rem (16px)
--space-lg: 1.5rem (24px)
--space-xl: 2rem (32px)
--space-2xl: 3rem (48px)
```

## Border Radius

```css
--radius-sm: 0.5rem (8px) - Inputs, small elements
--radius-md: 0.75rem (12px) - Buttons, badges
--radius-lg: 1rem (16px) - Cards, panels
--radius-xl: 1.5rem (24px) - Modals, large surfaces
```

## Shadows

```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1)
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15)
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.2)
--shadow-xl: 0 12px 32px rgba(0, 0, 0, 0.25)
```

## Animations

### Transitions
```css
transition: all 0.2s ease-in-out; /* Default */
transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* Smooth movement */
```

### Hover Effects
- Subtle lift: `transform: translateY(-2px)`
- Scale: `transform: scale(1.02)`
- Glow: Enhanced box-shadow
- Color shift: Border/background color change

### Loading States
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## Iconography

### Icon Library
Using Lucide React icons for consistency

### Icon Sizes
- Small: 16px (w-4 h-4)
- Medium: 20px (w-5 h-5)
- Large: 24px (w-6 h-6)

### Icon Colors
- Primary actions: var(--primary)
- Danger actions: var(--error)
- Neutral: var(--text-secondary)

## Responsive Design

### Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Mobile Adaptations
- Collapsible sidebar
- Stacked layouts
- Touch-friendly targets (min 44px)
- Simplified navigation

## Accessibility

### Focus States
```css
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Color Contrast
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text
- Test with accessibility tools

### Keyboard Navigation
- Tab order follows visual flow
- Skip links for main content
- Escape closes modals
- Arrow keys for lists

## Brand Elements

### Logo
- Beaker icon with gradient background
- Gradient: #6366f1 → #8b5cf6 → #14b8a6
- Rounded corners (0.75rem)
- Subtle shadow

### Gradient Text
```css
.gradient-text {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #14b8a6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## Code Display

### Syntax Highlighting
- Use Prism.js or similar
- Dark theme matching UI
- Line numbers optional
- Copy button on hover

### Code Blocks
```css
.code-block {
  background: #0d1117;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1rem;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  overflow-x: auto;
}
```

## Micro-interactions

### Button Click
- Scale down slightly on press
- Ripple effect (optional)
- Immediate visual feedback

### Toast Notifications
- Slide in from top-right
- Auto-dismiss after 3-5 seconds
- Color-coded by type
- Dismissible with X button

### Modal Animations
- Fade in backdrop
- Scale up modal content
- Smooth transitions (300ms)

## Best Practices

### Consistency
- Use design tokens (CSS variables)
- Reuse components
- Follow established patterns
- Maintain spacing rhythm

### Performance
- Minimize animations on low-end devices
- Use CSS transforms over position changes
- Lazy load images
- Optimize font loading

### User Experience
- Clear visual hierarchy
- Obvious interactive elements
- Immediate feedback
- Helpful error messages
- Loading states for async operations
