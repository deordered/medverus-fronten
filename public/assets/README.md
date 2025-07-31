# Medverus AI Assets Organization

This directory contains all static assets for the Medverus AI platform, organized by type for easy maintenance and deployment.

## Directory Structure

```
public/assets/
├── logos/               # Brand logos and brand marks
├── icons/               # Icons, favicons, and UI symbols
├── images/              # Photography, illustrations, graphics
├── fonts/               # Custom fonts and typography assets
├── colors/              # Color palettes and theme definitions
└── README.md            # This file
```

## Asset Categories

### Logos (`/logos`)
Brand identity assets including:
- `main.svg` - Primary logo with green background
- `secondary.svg` - Secondary logo with dark background
- Logo variations for different contexts
- Favicon versions and app icons

### Icons (`/icons`)
UI and functional icons:
- Favicon files (ICO, PNG sizes)
- Medical icons and symbols
- UI component icons
- Status indicators

### Images (`/images`)
Visual content:
- Hero images and backgrounds
- Medical illustrations
- User interface graphics
- Photography assets

### Fonts (`/fonts`)
Typography assets:
- Custom font files (WOFF2, WOFF, TTF)
- Font loading configurations
- Typography specimens

### Colors (`/colors`)
Color system definitions:
- `brand-colors.json` - Core brand color definitions
- `palette.css` - CSS custom properties
- Theme configurations
- Color accessibility documentation

## Asset Usage Guidelines

### File Naming Conventions
- Use kebab-case for all file names
- Include size indicators: `logo-32x32.png`
- Include context: `logo-light.svg`, `logo-dark.svg`
- Use descriptive names: `medical-cross-icon.svg`

### Optimization Standards
- **SVG**: Optimize with SVGO, remove metadata
- **PNG**: Use TinyPNG for compression
- **WEBP**: Provide modern format alternatives
- **Fonts**: Use WOFF2 with WOFF fallback

### Performance Targets
- Individual files: <500KB
- Critical assets: <100KB
- Fonts: <50KB per weight/style
- Icons: <10KB

## Integration

Assets are automatically integrated through:
- Next.js static file serving
- Brand asset configuration system
- Tailwind CSS color definitions
- Component prop systems

### Usage Examples

```tsx
// Logos
import { BrandLogo } from '@/components/branding/brand-logo'
<BrandLogo variant="primary" size="lg" />

// Colors (automatic via CSS variables)
className="bg-brand-primary text-brand-secondary"

// Icons
<Image src="/assets/icons/medical-cross.svg" alt="Medical" />

// Fonts (via CSS)
font-family: var(--font-primary)
```

## Accessibility

All assets must meet accessibility standards:
- Sufficient color contrast (4.5:1 minimum)
- Meaningful alt text for images
- Scalable vector formats preferred
- Reduced motion alternatives

## Browser Support

Assets are optimized for:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile devices (iOS Safari, Chrome Mobile)
- Fallback support for legacy browsers
- Progressive enhancement approach

## Maintenance

Regular maintenance includes:
- Asset optimization and compression
- Accessibility audits
- Performance monitoring
- Brand consistency checks
- File cleanup and organization