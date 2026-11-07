---
name: Autonomous GitHub Resolver
description: A crisp near-black developer tool with hairline structure, one violet brand colour, and run data drawn as the signature visual.
colors:
  canvas: "#09090b"
  surface: "#111113"
  surface-2: "#18181b"
  surface-3: "#1f1f23"
  overlay: "#141416"
  border: "#27272a"
  border-strong: "#66666f"
  divider: "#1c1c1f"
  text: "#fafafa"
  text-2: "#a1a1aa"
  text-3: "#8b8b94"
  text-disabled: "#52525b"
  accent: "#6550f0"
  accent-hover: "#5a45e6"
  accent-pressed: "#4f3bd6"
  accent-text: "#9b8cff"
  accent-subtle: "#1e1a33"
  accent-border: "#3d3470"
  success: "#3dd68c"
  success-subtle: "#0f2a1d"
  success-border: "#1d4d35"
  warning: "#f5b544"
  warning-subtle: "#2b2010"
  warning-border: "#5a4213"
  danger: "#ff6369"
  danger-subtle: "#2d1214"
  danger-border: "#5e2226"
  danger-solid: "#d13d43"
  info: "#52a8ff"
  info-subtle: "#0d2036"
  info-border: "#1d3f66"
  diff-add-text: "#7ee2b0"
  diff-del-text: "#ff9a9e"
  series-1: "#8b7cff"
  series-2: "#3bc9db"
  series-3: "#3dd68c"
  series-4: "#f5b544"
  series-5: "#ff6369"
  light-canvas: "#ffffff"
  light-surface-2: "#fafafa"
  light-surface-3: "#f4f4f5"
  light-border: "#e4e4e7"
  light-border-strong: "#8e8e96"
  light-text: "#09090b"
  light-text-2: "#52525b"
  light-text-3: "#67676f"
  light-accent: "#5b47e0"
  light-accent-hover: "#4c3bc9"
  light-accent-subtle: "#efecff"
  light-accent-border: "#cfc8ff"
  light-success: "#15803d"
  light-warning: "#b45309"
  light-danger: "#c81e1e"
  light-danger-solid: "#dc2626"
  light-info: "#2563eb"
  light-series-2: "#0e9fb5"
  light-series-3: "#16a34a"
  light-series-4: "#d97706"
  light-series-5: "#dc2626"
typography:
  headline-figure:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: "2.5rem"
    letterSpacing: "-0.02em"
    fontFeature: "\"tnum\" 1"
  page-title:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: "2.25rem"
    letterSpacing: "-0.02em"
  panel-title:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: "1.75rem"
    letterSpacing: "-0.01em"
  card-title:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: "1.5rem"
  body:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
    fontFeature: "\"tnum\" 1"
  body-sm:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  label:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: "1rem"
  code:
    fontFamily: "JetBrains Mono, ui-monospace, Cascadia Code, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: "1.25rem"
    fontFeature: "\"calt\" 0"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  full: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
  "16": "64px"
  "20": "80px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-primary-active:
    backgroundColor: "{colors.accent-pressed}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "36px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-3}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-2}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "36px"
  button-ghost-hover:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.text}"
  button-danger:
    backgroundColor: "{colors.danger-solid}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "36px"
  button-sm:
    padding: "0 12px"
    height: "30px"
  button-lg:
    padding: "0 20px"
    height: "40px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "36px"
  badge-warning:
    backgroundColor: "{colors.warning-subtle}"
    textColor: "{colors.warning}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 8px"
    height: "24px"
  badge-danger:
    backgroundColor: "{colors.danger-subtle}"
    textColor: "{colors.danger}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 8px"
    height: "24px"
  badge-success:
    backgroundColor: "{colors.success-subtle}"
    textColor: "{colors.success}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 8px"
    height: "24px"
  badge-running:
    backgroundColor: "{colors.info-subtle}"
    textColor: "{colors.info}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 8px"
    height: "24px"
  id-chip:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text-2}"
    typography: "{typography.code}"
    rounded: "{rounded.xs}"
    padding: "1px 6px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "20px"
  dialog:
    backgroundColor: "{colors.overlay}"
    rounded: "{rounded.lg}"
  topbar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.text-2}"
    height: "56px"
    padding: "0 24px"
  timeline-bar:
    backgroundColor: "{colors.series-3}"
    height: "40px"
  timeline-mini:
    backgroundColor: "{colors.series-3}"
    width: "148px"
    height: "16px"
---

# Design System: Autonomous GitHub Resolver

## Overview

**Creative North Star: "The Calm Instrument"**

The Resolver is a developer tool built to the category standard of Vercel and Stripe: a near-black canvas, stepped surfaces drawn in 1px hairlines, a cool neutral text ramp, and one confident violet that marks action, selection and focus. Four semantic colours (green, amber, red, blue) carry run state, and a five-colour data series draws the numbers. Nothing else competes. It should look calm and expensive beside a dark IDE, and work just as well in a demo screenshot.

Density is that of a working product, not a marketing page: a fixed rem type scale anchored at 14px body, 36px controls, 44px list rows, a 56px top bar, and roomy 20px card padding on a 4px module. Dark is the default theme. A full light theme ships alongside, and every token has a light value tuned for contrast, not mirrored.

The signature is the run timeline: every agent step drawn as one segment of a bar, so a run's whole history (passed, rolled back, flagged, current) reads in a second on the run page and in miniature in every run list. The user rejected metaphor or gimmick worlds, pale low-contrast pages, dull colour and messy layouts; this system is the answer to those rejections.

**Key Characteristics:**
- Near-black canvas with three stepped surfaces and hairline borders; depth from tone, not shadow.
- One brand violet, split into a fill shade and a text shade so both pass contrast.
- State always spoken twice: a dot or icon plus a word, plus a hatch for the flag source.
- Host Grotesk for interface, JetBrains Mono for code, IDs, axes and diffs.
- Lucide line icons at 16px, stroke 1.75.
- Data visuals (timeline, charts) are the richest thing on the page.

## Colors

A neutral zinc structure in hairlines lets one brand violet and four state colours do all the talking.

### Primary
- **Resolver Violet** (accent): the fill of primary buttons, the on-state switch, and the first segment of the empty-state ghost timeline. White text on it holds 5.3:1 in dark (light: light-accent, 6.1:1). Hover and pressed step darker (accent-hover, accent-pressed) so white text keeps contrast as the button reacts.
- **Violet Ink** (accent-text): links, the selected state, the focus ring, the caret and the input focus border in dark. In light the ink and the fill are the same shade (light-accent).
- **Violet Wash** (accent-subtle with accent-border): selected rows, the current timeline step's row, accent badges and the avatar chip.

### Secondary
- **Series Violet** (series-1): totals and the current timeline segment in charts and timelines. It is the lighter violet, kept out of button fills because white text on it fails AA. In light it collapses to light-accent.

### Tertiary
- **State set**: success green (passed, PR opened), warning amber (rolled back, awaiting review), danger red (flagged, failed, rejected), info blue (running). Each has a subtle background and a border shade, used together on badges and alerts. Light danger is the deeper light-danger so badge text stays AA on its subtle background; destructive buttons and series-5 stay on light-danger-solid.
- **Data series** (series-1 to series-5): violet, cyan, green, amber, red, used in that order. Series-3 to 5 deliberately match the state set so a chart and a timeline say the same thing.

### Neutral
- **Ink Canvas** (canvas): the page.
- **Panel** (surface): cards, panels, inputs. Light: white, separated from the canvas by border alone.
- **Well** (surface-2): table heads, code wells, nested panels, card footers, disabled controls.
- **Hover Step** (surface-3): row and ghost-button hover.
- **Overlay** (overlay): menus, toasts, the review dialog.
- **Hairline** (border) and **Row Rule** (divider): card edges and the rules between rows inside a card.
- **Control Edge** (border-strong): input borders at 3.3:1, the off-state switch, dashed ghost segments.
- **Text ramp** (text, text-2, text-3, text-disabled): primary at 19:1, secondary at 7.4:1, muted captions at 5.9:1. Light text-3 is light-text-3 (5.4:1 on white, 4.8:1 on the violet wash).

### Named Rules
**The One Violet Rule.** Violet means "you can act here" or "this is selected". It is never decoration, never a section colour, never a heading colour.

**The Two Violets Rule.** Fill with accent, write with accent-text. Never put white text on series-1, and never set body text in the fill shade on dark surfaces.

**The Said-Twice Rule.** State is never colour alone. Every badge carries a dot or Lucide icon plus a word; every timeline legend carries a count and a label; the flag source is hatched, not just red; rolled-back commands are also struck through.

**The Gradient Leash Rule.** The brand gradient (violet to blue to cyan, 135deg) appears only on the product mark and the empty-state illustration. Never on text, buttons, cards or backgrounds.

## Typography

**Display Font:** Host Grotesk (with ui-sans-serif, system-ui, Segoe UI)
**Body Font:** Host Grotesk
**Label/Mono Font:** JetBrains Mono (with ui-monospace, Cascadia Code, Consolas)

**Character:** A sharp, slightly technical grotesk that stays quiet at 14px and gets confident at 28px and up, paired with a mono that owns everything a developer would copy: commands, IDs, branch names, axes, diffs. Body text uses tabular figures so counts and costs align.

### Hierarchy
- **Headline figure** (600, 36/40, -0.02em): dashboard numbers such as PRs opened. Paired with a trend marker (Lucide arrow plus a value in green or red).
- **Page title** (600, 28/36, -0.02em): one per page.
- **Panel title** (600, 20/28, -0.01em): section headings, run titles, dialog titles.
- **Card title** (600, 16/24): card heads, review and empty-state headings. Card-head titles inside dense cards drop to 14px semibold.
- **Body** (400, 14/20): buttons, inputs, navigation, paragraphs. Leads and section intros run at 24px line height, capped at 64 to 70ch.
- **Body small** (400, 13/20): table cells, meta rows, captions under titles, log lines.
- **Label** (500, 12/16, sentence case): badge text, table-head captions, timestamps, hints. Never uppercase, never letter-spaced.
- **Code** (JetBrains Mono 400 to 500, 13/20; 12px for IDs and axes): commands, IDs, diffs (22px line height), keyboard hints.

### Named Rules
**The Fixed Scale Rule.** The scale is fixed rem (12, 13, 14, 16, 20, 28, 36). No fluid clamp() type in product UI.

**The Copyable Is Mono Rule.** Anything a developer might paste (a command, a run or flag ID, a path, a branch, a hash) is set in JetBrains Mono. Prose is never set in mono.

## Layout

Top navigation, not a sidebar: a sticky 56px top bar with the product mark, a slash, the org switcher, text tabs, search with a keyboard hint, the theme toggle and the avatar. The bar is the canvas at 88% opacity with a 10px backdrop blur and a hairline bottom border.

Content sits in a 1280px max container with 48px top, 32px side and 80px bottom padding. Sections are separated by 64px of space and a heading, not by rules or background bands. Card grids use 16px gaps; two-up data layouts split 1.4fr to 1fr.

Spacing is a 4px module (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80). Fixed heights: controls 36px (small 30px, large 40px), single-line list rows 44px, two-line table rows 60px, the top bar 56px.

Responsive: at 1100px the side table of contents and search hide, the tab list trims to four, and multi-column grids collapse to one column (form grids to two). At 720px the tabs and org role hide, padding tightens to 16px, form grids go single-column, and wide tables keep a 640px minimum and scroll horizontally inside their card rather than squeezing. The product is desktop-first; the phone pass keeps things legible, not featured.

**The Room To Breathe Rule.** Generous spacing is the craft signal. Don't recover space by shrinking row heights below 44px or card padding below 20px.

## Elevation & Depth

Depth is tonal first: canvas, surface, surface-2 and surface-3 step up in lightness, and 1px hairlines draw every edge. Shadows are reserved for things that float above the page, and each floating shadow also carries a 1px border ring so its edge stays crisp in dark mode. In light the same shadows run at far lower opacity.

### Shadow Vocabulary
- **Rest** (`box-shadow: 0 1px 2px rgba(0,0,0,0.4)`; light 0.06): primary and secondary buttons, the selected segmented-control option, the switch knob.
- **Menu** (`box-shadow: 0 8px 24px -6px rgba(0,0,0,0.55), 0 0 0 1px var(--border)`; light 0.12): menus and popovers.
- **Dialog** (`box-shadow: 0 24px 64px -16px rgba(0,0,0,0.7), 0 0 0 1px var(--border)`; light 0.22): the review dialog and toasts.

### Named Rules
**The No Glow Rule.** No coloured shadows, no neon halos, no blurred accent blooms. The only coloured ring is the focus ring, and it is a state, not a decoration.

**The Flat Card Rule.** Cards at rest have a border and no shadow. Lift is earned by floating (menus, dialogs, toasts), not by being important.

## Shapes

Gently rounded and consistent by role: 4px for badges' square cousins (ID chips, kbd, inline code, series swatches), 6px for buttons, inputs, the search field and segmented controls, 8px for cards, alerts, diffs and empty states, 12px for dialogs and popovers, and full pills for status badges, counts, avatars and the switch. Timeline segments use 3px corners with 3px gaps; the mini timeline uses 1px corners with 1px gaps.

Borders are always 1px solid hairlines, with two deliberate exceptions: the keyboard hint has a 2px bottom border to read as a key, and empty states use a 1px dashed border (and dashed ghost segments) to read as "not yet".

## Components

### Buttons
Quiet, precise, one clear primary per view.
- **Shape:** gently rounded (6px), 36px tall, 14px medium label, Lucide icon at 16px with 8px gap.
- **Primary:** violet fill (accent) with white text, a rest shadow and a faint 1px inner top highlight (white at 14%). Hover steps to accent-hover, pressed to accent-pressed.
- **Secondary:** panel fill, hairline border, primary text; hover moves to surface-3 with the control edge border.
- **Inverse:** text-colour fill with canvas-colour text, for a high-emphasis neutral action; hover drops opacity to 0.88.
- **Ghost:** transparent with secondary text; hover fills surface-3 and brightens text.
- **Danger:** danger-solid fill with white text, for the irreversible action only (reject and stop). **Danger outline:** transparent with danger text and danger border, for cancel-type actions.
- **Sizes:** small 30px (13px label, 12px padding), default 36px, large 40px (20px padding).
- **States:** focus is a 2px focus-colour outline offset 2px; disabled is surface-2 with disabled text and a hairline, no shadow; loading swaps the icon for a spinning Lucide loader. Transitions are 120ms on the shared ease.

### Chips: status badges and IDs
- **Status badge:** 24px pill, 1px border, 12px medium label, 8px side padding. Colour trio per state (text colour, subtle background, border). Leads with a 6px dot (running pulses at 1.6s) or a 13px Lucide icon, then a word: Running, PR opened, Awaiting review, Rolled back, Held by FLAG-n, Rejected.
- **Neutral and accent badges:** surface-2 with secondary text; violet wash with violet ink.
- **ID chip:** 12px mono, secondary text on surface-2, hairline border, 4px radius (RUN-0142, FLAG-3, CP-10).
- **Count:** a 16px-tall amber pill on a tab for items needing the user.

### Cards / Containers
- **Corner Style:** 8px.
- **Background:** surface, on the canvas.
- **Shadow Strategy:** none at rest (see The Flat Card Rule).
- **Border:** 1px hairline.
- **Internal Padding:** 20px; card heads are 16px by 20px with a hairline below, a 14px semibold title and a 13px muted caption. Footers sit on surface-2 with a hairline above.

### Inputs / Fields
- **Style:** 36px, panel fill, 1px control-edge border (3.3:1), 6px radius, 12px side padding, muted placeholder. Hover darkens the border to text-3. Labels sit above at 13px medium with a 6px gap; hints below at 12px muted.
- **Focus:** border turns violet ink and a 3px ring of the focus colour at 35% opacity (color-mix) appears outside.
- **Error:** danger border with a 3px danger ring at 30%, and a hint in danger text led by a Lucide alert icon, so the error is not colour alone.
- **Disabled:** surface-2 fill, disabled text, hairline border.
- **Select:** native select restyled with a Lucide chevrons-up-down SVG at the right.
- **Switch:** a real button with role="switch" and aria-checked; 34 by 20 pill, violet when on, control edge when off, white 16px knob with a rest shadow.
- **Checkbox:** native, 16px, tinted by accent-color.

### Navigation
- **Top tabs:** 14px medium, secondary text, 12px side padding, full bar height. Hover goes to primary text. The active tab is primary text with a 2px primary-text underline bar sitting on the bar's bottom hairline (the underline is neutral, not violet).
- **Segmented control:** a surface-2 track with 3px inset, options 28px tall; the pressed option lifts to surface with a rest shadow and hairline ring.
- **On-page table of contents:** 13px secondary links in 6px-radius pills; hover surface-3, current surface-2 with an inset hairline. Hidden below 1100px.
- **Mobile:** tabs hide at 720px; the mark, org switcher, theme toggle and avatar remain.

### Run Timeline (signature)
The whole run as one segmented bar. A 40px-tall flex row of equal segments, 3px gaps, 3px corners. Passed is series-3, rolled back series-4, the current step series-1 with a 2px outline offset 2px, and the flag source a 135deg hatch of series-5 (3px stripe, 3px gap) with a 1px inset series-5 edge. Segments grow in from 20% height over 320ms. Under the bar: a mono 12px step axis and a legend that pairs every swatch with a count and a word. Below that, step rows (44px min) show a mono step number, a Lucide state icon, the mono command, and a badge; rolled-back commands are struck through in amber with a 12px reason line; the current row sits on the violet wash. The bar carries role="img" with a full count summary as its label.

**Mini timeline:** the same grammar at 148 by 16px with 1px gaps and 1px corners, inside run tables. Unrun steps are border-coloured.

### Run Graph (run page hero)
The run page draws the run as a graph of shadow-git checkpoints, read left to right like `git log --graph`. One shared x scale places every step: phase labels above (Explore, Reproduce, Fix, Verify, Gate, each a 1px top rule that turns violet ink for the current phase), the graph, then a 10px slim timeline bar that acts as the scrubber, with a 2px playhead.
- **Nodes:** 22px circles carrying the step number (JetBrains Mono 11px). Passed is success on its subtle wash, the running step is violet ink with a rotating dashed ring, a failed attempt is a hollow dashed amber ring, a step undone by the root-cause rollback is amber on its wash, the flag source is hatched danger with a danger ring, the gate is a 26px diamond with a Lucide shield. A small hollow circle marks the clone the run started from.
- **Edges:** 2px control-edge lines from the state each step started from. Failed attempts leave the line as dashed amber stubs one lane up; the edge into the running step flows in violet dashes; the provenance edge is a dashed danger curve below the trunk from the gate back to the source step.
- **Lanes:** the trunk is lane 0. When failure attribution fires, the broken branch lifts to lane 1 (its failed stubs to lane 2), a dot traces back to the checkpoint before the root cause, and the trunk resumes from there. Lanes are 46px apart and the graph re-centres itself as lanes appear, easing every move.
- **Labels:** chips sit on the graph, never in a legend: "Root cause · step 10" (warning chip above the branch), "Rewound to CP-10" (neutral chip on the trunk), "hooks.attacker.dev came from step 4" (danger chip at the provenance curve's lowest point).
- **Time travel:** drag across the graph, use the arrow keys, or click a step, a node or a token column; everything on the page (steps, terminal, changes, numbers) shows that moment, later nodes fade to 28%, and "Back to live" returns. Hover shows a card with the command, checkpoint id and commit, files changed and the step's SHA-256 audit hash.
- **While running:** a dashed ghost diamond waits at the end of the scale, joined to the running step by a dotted line, because every run ends at the gate.

### Run page side rail
- **Live numbers:** elapsed, step, tokens and cost in a 2 by 2 grid, then a tokens-per-step column chart (56px, columns in the step's state colour, hover readout in the chart header).
- **Sandbox:** the guardrails as a key-value list (network none, read-only root filesystem, non-root user, image, checkpoints saved, secrets masked) under a success "Sealed" badge.
- **While you wait:** a card of checked developer facts and Resolver tips (category label in violet ink, one fact at a time, pager, rotates every 12s and pauses on hover), and a secondary button that opens Rollback Runner: an original mini-game in a 12px-radius dialog where the ground is a run timeline, failing tests are the obstacles, a crash rewinds to the last checkpoint, and five failures in a row end the run. The game pauses itself and shows an alert when the real run needs a person.

### Data Chart
Stacked bars in series order on a quiet grid, 200px tall, a legend of 8px swatches with words, headline figures above with a Lucide trend arrow. Cancelled uses border-strong, not a sixth hue.

### Runs Table
Inside a card; surface-2 header row at 40px with 13px medium muted captions and sortable header buttons (Lucide arrow), 60px two-line rows (title in medium, repo and issue in 12px muted), divider rules, surface-3 hover, right-aligned figures, an ID chip, a status badge and a mini timeline per row.

### Security Review Panel
A 12px-radius overlay dialog with the dialog shadow, max 760px. Head: a 36px danger-wash icon square beside the title (severity marker, sitting left of the heading, never stacked above it) and a caption with ID chips. Body: a two-column fact list (What was flagged, Where it came from, Why it matters) and a mono diff in an 8px bordered well with line numbers, diff-add and diff-del rows, and the suspect string marked on danger-border. Foot on surface-2: a lock note in muted text, then Secondary "Approve" and Danger "Reject". Only a person approves.

### Alerts, Toast, Empty State
- **Alert:** 8px, 1px state border on the state's subtle wash, a Lucide state icon in the state colour, a bold 14px line plus body text in primary colour.
- **Toast:** overlay surface, 8px, dialog shadow, success icon plus a single line.
- **Empty state:** dashed 8px border, centred; a ghost timeline (12 dashed segments, the first filled violet) instead of an icon or illustration tile, a 16px semibold heading, a 44ch muted line, and one primary button.

### Patterns across pages
The prototype pages (sign in through settings) settled these patterns; reuse them rather than inventing new ones.
- **Page frame:** top bar with tabs Runs, Findings, Audit log, Members, Usage, Settings; a page head with a 28px title, one lead line, and at most one primary action on the right. The run page alone widens to 1440px.
- **Review page:** the evidence column reads top to bottom as gate checks (a danger row for each hit, success rows for passes), a provenance trace (dashed danger connector between numbered nodes, the source node hatched, the gate a rotated square), then the full diff with the flagged line marked and annotated. The decision sits in a sticky 360px card: what Approve and Reject each do, an optional audit note, Secondary Approve and Danger Reject, and the lock note.
- **Confirmation by weight:** reversible actions act at once and confirm with a toast. Risky approvals (approving a flagged change) open a dialog whose primary stays disabled until an acknowledgement checkbox is ticked. Irreversible actions (delete organization, transfer ownership) need the organization name typed, list exactly what will happen, and name the live sandboxes affected.
- **Dialogs:** 12px radius, overlay surface, dialog shadow, scrim backdrop, body padding 24px, a surface-2 footer with Cancel then the action.
- **Row menus:** a 32px ellipsis icon button opens a 230px menu (overlay, 12px radius, menu shadow) that lists only the actions the viewer's role allows; destructive items come last, below a rule, in danger text.
- **Forms:** Save stays disabled until a value changes; the footer says "Saved" or "Unsaved changes". Errors appear under the field in danger text with an icon, and focus moves to the first bad field.
- **Toasts:** bottom right, at most three, auto-dismissing; a state icon plus a bold title and one line saying what happened and what it affects.
- **Audit chain:** every audit entry's SHA-256 covers the previous entry's hash. Verify recomputes each hash in order and marks rows verified (success check), broken (danger row, details opened with stored and recomputed hashes side by side) or untrusted after a break (warning wash).
- **Charts:** follow the data-visualization rules: one axis, whole-number ticks for counts, state colours only for outcomes (with a legend), a crosshair or per-mark tooltip, and a table view. The two model colours are violet #8B7CFF and cyan #1C9FB3 in dark, #5B47E0 and #0E9FB5 in light, validated for colour-blind separation on each surface; model bars are also labelled directly.
- **Loading:** waits tell the product's story, never a generic spinner. The page-load screen (theme/loader.js) shows the mark over a tiny run: checkpoints appear, step 4 fails and lifts off as a dashed amber stub, a dot rewinds to CP-3, the run recovers, the gate diamond knocks then turns green, with a mono status line ("Step 4 failed. Rewinding. Nobody saw that."). It plays in full on the first page of a visit and as a 0.6s glimpse after that, and anything timed (the demo) starts on Loader.ready. Components load as skeletons in their exact final shape, swept by a playhead with a fine violet leading edge; run rows fill their mini timeline while waiting. Small waits use five checkpoint squares where the third fails, rolls back and recovers. After eight seconds, say why it is slow and offer Rollback Runner. All of it stops under reduced motion.
- **Example data:** every number shown is illustrative and says so on the page; the same run, people and counts agree across pages (RUN-0142 is the 28-step run held as FLAG-3).

## Do's and Don'ts

### Do:
- **Do** use accent (#6550F0 dark, #5B47E0 light) for button fills and accent-text (#9B8CFF dark) for links, selection and focus.
- **Do** pair every state colour with a dot or Lucide icon and a word; hatch the flag source.
- **Do** draw a run page as the run graph, with the slim timeline bar as its scrubber; use the 148 by 16px mini timeline in lists.
- **Do** set commands, IDs, paths, axes and diffs in JetBrains Mono; everything else in Host Grotesk.
- **Do** keep cards flat with a 1px hairline; reserve shadows for menus, dialogs and toasts.
- **Do** use Lucide icons at 16px, stroke 1.75 (13 to 14px inside badges and hints).
- **Do** keep a single primary button per view; use danger-solid only for the irreversible action.
- **Do** give every new token a light value checked for AA, not an inverted copy.
- **Do** use theme/shadcn-globals.css as the palette in the Next.js shadcn app, instead of tokens.css, never both.

### Don't:
- **Don't** put white text on series-1 (#8B7CFF); it fails AA.
- **Don't** use the brand gradient anywhere but the product mark and the empty-state illustration, and never on text.
- **Don't** add glows, coloured shadows or accent blooms.
- **Don't** put eyebrow or kicker labels above headings, or icon tiles stacked above headings.
- **Don't** use unicode arrows or glyph icons; use Lucide.
- **Don't** signal state by colour alone.
- **Don't** use fluid clamp() type, uppercase tracked labels, or a type size outside 12/13/14/16/20/28/36 (the 56px type-specimen glyph on the style guide is a specimen, not a step).
- **Don't** drift toward pale low-contrast pages, dull colour, metaphor or gimmick styling, or crowded dashboard layouts.
- **Don't** load theme/tokens.css and theme/shadcn-globals.css together; --accent and --border collide.
