---
version: 1
slug: "theme-html"
primary_target: "theme.html"
related_targets: []
---

# Surface: Theme & style guide (theme.html)

Scope: the app-wide visual system for Autonomous GitHub Resolver prototypes, shown as a style guide page. Mode: Operate. Audience: developers and engineering managers at a desk during the workday, beside a dark IDE, glancing at long-running agent runs; demo screenshots go in front of an FYP panel. Dark is the default theme (matches the IDE scene and the user's "too light and plain" rejection); a light theme ships alongside.

Round history: Bound Lab Notebook built, then rejected (too light, plain, generic, dull). Bolder re-roll rejected (gimmicky, ugly colour/type, messy). User took the category standard with named peers: Vercel, GitHub, Stripe, Supabase.

## Direction contract

THESIS: The category standard at the craft level of Vercel and Stripe: a crisp near-black product with hairline structure, one confident violet brand colour, and data drawn beautifully. Refuses gimmicks, pale grey pages and dashboard clutter.

OWN-WORLD: Near-black canvas (#09090B) with stepped surfaces and 1px borders; text in a cool neutral ramp; brand violet (#6550F0 action / #9B8CFF text dark, #5B47E0 light; #8B7CFF kept as series-1 because white text on it fails AA) for primary action, selection and focus; semantic green, amber, red, blue for state; a five-colour data series. Host Grotesk for UI, JetBrains Mono for code. Generous spacing, 8px radius, top navigation.

STORY: The viewer sees a calm, expensive-looking tool; status is obvious at a glance; the one thing that needs them (a flagged change) is unmistakable.

FIRST VIEWPORT: Style guide: top bar with product mark, org switcher and tabs; a page header; then colour tokens, type scale, components, and a run timeline specimen.

FORM: The category standard (canon), chosen by the user after a bolder re-roll. seed:8d6e854257f47add

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature move: the run timeline, a segmented bar of every step (passed, rolled back, flagged) drawn like a Stripe/Supabase data visual, used on run pages and run lists.
