---
name: Organic Design System
description: A soft, editorial design system for products that should feel literary, warm, and unhurried.
---

# Organic design skill for AI agents

## Overview
Organic is a soft, editorial design system for products that should feel literary, warm, and unhurried. It pairs a paper-gray page with borderless white panels, a deep-teal hero, pale amber actions, generous rounded geometry, and serif-led typography. The visual language is expressive enough for a memorable brand while remaining structured enough for dense product interfaces.

The registry package gives AI coding tools a concrete implementation blueprint instead of a vague style prompt. Its central `SKILL.md` coordinates 34 focused foundation and component modules, keeping generated pages consistent across color, type, spacing, responsive behavior, interaction states, and accessibility.

## Visual foundations

### Color system
Organic is light-first and assigns every color a semantic role. Components reference those roles rather than scattering raw hex values through the interface.

| Role | Value | Usage |
| :--- | :--- | :--- |
| Paper surface | `#F5F5F5` | Content sections, application shell, and footer |
| Panel surface | `#FFFFFF` | Borderless cards, widgets, and raised content |
| Hero teal | `#024F46` | Signature hero band and selected dark-band cards |
| Brand amber | `#ECBA82` | Primary actions and intentional highlights |
| Heading ink | `#2E2E2E` | Headlines, labels, and high-emphasis content |
| Body ink | `#57564C` | Primary reading text |
| Muted text | `#82817A` | Supporting and lower-emphasis copy |
| Dark island | `#1A1A1A` | Occasional inverted feature bands |
| Inner hairline | `#E9E6E6` | Dividers and seams inside connected content |

Most sections remain on the flat paper-gray surface, with no grain, texture, or gradient. The hero is a solid deep-teal band, square at the top and rounded 80px at the bottom. After every two or three light sections, an occasional near-black feature island can reset the rhythm; its teal cards and light type create contrast without turning the whole experience into a dark theme.

### Typography
Organic uses a deliberate two-voice type system:

- Inter and its humanist sans fallback stack handle body copy, controls, labels, and buttons.
- A Georgia-class editorial serif stack handles every heading and display role.
- Headings use normal weight (400) and lightly tightened -0.025em tracking.
- Buttons and labels stay sentence case at medium weight rather than becoming uppercase UI chrome.
- Display type is capped at 64px, while body reading copy maintains a 16px floor.
- Code alone uses the monospace stack.

This pairing gives interfaces an editorial identity while preserving the clarity and compactness needed for forms, navigation, tables, and application controls.

### Shape, borders, and depth
Organic's defining geometry is soft rather than pill-like. Buttons, inputs, alerts, cards, widgets, tables, modals, and drawers use 16px corners. Menus use 14px, larger feature containers use 24–32px, and the signature hero or dark feature band can use an 80px edge. Checkboxes remain compact at 4px, while controls that are round by function use a full radius.

Cards and panels are borderless; their white fill creates separation from the paper-gray surface. Controls use a two-pixel tonal edge derived from their own fill so buttons and fields remain legible without introducing unrelated border colors. Resting elements stay flat, with soft elevation reserved for floating overlays where stacking needs to be communicated.

### Layout and rhythm
Content sits in a centered 1280px container. Standard content sections use 112px of vertical padding on desktop and 64px below 768px. The spacing scale governs all internal gaps, with a consistent 24px beat after headings and paragraphs.

Responsive layouts preserve visible labels and meaningful content. When a row no longer fits, actions wrap, stack, or move as whole controls instead of collapsing into ambiguous icons. The generous radii and editorial spacing remain consistent across viewport sizes.

### Signature composition
A recognizably Organic page starts with a solid deep-teal hero and light typography, then settles into warm-gray content sections populated by borderless white panels. Amber appears as a purposeful action color, serif headings provide the editorial voice, and rounded dark feature islands punctuate longer pages at a measured cadence.

The system avoids decorative gradients, excessive shadows, stock imagery that clashes with the palette, and endless all-gray section runs. Placeholder artwork stays in-palette, while dashboards use real chart components with accessible labels, legends, and tooltips.

## Component coverage
The package includes a central skill plus 34 dedicated modules covering:

- **Foundations**: colors, typography, spacing, radius, shadows, motion, responsive behavior, and composition patterns
- **Actions and navigation**: buttons, button groups, breadcrumbs, pagination, tabs, dropdowns, drawers, and tooltips
- **Forms**: text inputs, textareas, selects, checkboxes, radios, toggles, ranges, file inputs, number inputs, phone inputs, and time pickers
- **Content and data**: cards, tables, badges, alerts, accordions, mockups, and chart guidance
- **Overlays**: modals, menus, popovers, and drawers with explicit focus and dismissal behavior

Relevant components include default, hover, focus-visible, active, disabled, loading, and error treatment along with keyboard, touch, and responsive requirements.

## Accessibility and quality
Organic targets WCAG 2.2 AA as a baseline. The guidance requires semantic HTML, visible focus states, complete keyboard interaction, named controls, logical heading order, and contrast validation across every component state. It pays particular attention to readable text on teal and dark bands, tonal control borders, mobile reading sizes, and the contrast of light amber actions.

The package also prevents common AI-generated drift: arbitrary colors, near-sharp elements mixed into the rounded system, unnecessary card borders, decorative status colors, hidden mobile labels, native unthemed controls, and inconsistent spacing.

## Using Organic with TypeUI MCP
Connect the TypeUI MCP server to your AI coding tool and select Organic as the project's design skill. The server provides the registry context while the agent works, so Claude, Codex, Cursor, and other MCP-connected tools can follow the same foundations and component behavior without restating the system in every prompt.

Ask the agent to build a component, page, or product flow normally. Organic supplies the design constraints, while your chosen stack and product requirements continue to determine the final implementation.

## Best suited for
Organic works especially well for:

- Editorial products, reading experiences, and knowledge platforms
- Wellness, food, hospitality, and lifestyle brands
- Creative SaaS products that need a warmer product surface
- Premium commerce and story-led landing pages
- Portfolios, studios, and cultural organizations
- Applications that want a recognizable brand without sacrificing practical UI density

Its core principle is to combine an editorial voice with measurable system rules: soft surfaces, deliberate contrast, semantic tokens, and accessible interaction at every scale.