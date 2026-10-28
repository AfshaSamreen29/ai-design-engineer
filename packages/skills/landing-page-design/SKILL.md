---
name: landing-page-design
description: Guides a coding agent through designing and building a distinctive, accessible, responsive landing page or marketing site. Use when asked to create or redesign a landing page, homepage, product page, or marketing site, or when a page looks generic and needs a clear visual concept, design system, real copy, and screenshot-based review before it is called done.
---

# Landing Page Design

A workflow for building landing pages that look designed rather than generated. It is agent-neutral: it needs only the ability to read and write files, and it gets better when you can run a dev server and look at screenshots.

## When to use this skill

Use it for: new landing pages, homepages, product or pricing pages, launch pages, portfolio and agency sites, and redesigns of pages that feel templated.

Do not use it for: dashboards and app interiors (borrow the design-system steps only), email templates, or tasks where the user has given a finished design to implement pixel for pixel (implement their design; use only the verification steps).

## Core principles

1. **Concept before code.** Decide what the page should feel like and why, in words, before writing markup.
2. **Tokens before components.** Define color, type, spacing, radius, and shadow once. Components consume tokens; they never invent values.
3. **Real content over placeholder content.** Write copy specific to this product. Never ship lorem ipsum, "Feature One", or invented testimonials, metrics, or customer logos.
4. **One memorable idea per page.** A distinctive layout device, type treatment, or illustration style. Everything else supports it quietly.
5. **Variety by context.** The product, audience, and goal decide the layout. Do not reuse the same hero, three-card feature grid, and centered CTA band on every site.
6. **Look at the result.** Code that compiles is not a design review. Render it, view it at several widths, and fix what you see.
7. **Be honest about limits.** Report what you verified and what you could not.

## Workflow

Work through the phases in order. Skip a phase only when the answer is already known, and say so.

### Phase 0: Inspect before deciding

- Read the existing project: framework, styling approach (Tailwind, CSS modules, plain CSS), component library, existing tokens, fonts, logos, brand assets, and any README or brand guide.
- Reuse what exists. Do not introduce a second styling system or UI library without a reason.
- If a design system or `design-tokens.json` / CSS variables file exists, treat it as the source of truth.
- Check for a project instruction file (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules`) that states design constraints.

### Phase 1: Gather requirements efficiently

You need answers to these. Infer what you can from the repo and the request; ask only about what you cannot infer, in one batched message, at most five questions.

| Need | Why it matters | Default if unanswered |
| --- | --- | --- |
| What the product does, in one sentence | Drives the headline and the visual metaphor | Infer from README; state your assumption |
| Primary audience | Sets tone, density, and vocabulary | The most likely buyer implied by the product |
| Single primary conversion goal | Decides the one dominant call to action | Sign up / start free for software; contact for services |
| Brand constraints (name, colors, fonts, logo) | Avoids rework | Propose your own and label them as proposals |
| Hard constraints (framework, deadline, existing pages) | Prevents conflicts | Match the existing stack |

If the user says "just build it", do not ask. Record your assumptions in a short list at the top of your final summary.

### Phase 2: Define a visual concept

Write a concept of three to five sentences before coding:

- **Feeling:** three adjectives that are specific and not interchangeable ("dry, precise, archival" rather than "modern, clean, professional").
- **Reference world:** a real-world visual domain the page borrows from (printed manuals, ship logs, scientific plates, ticket stubs, sheet music, field notes). Borrow principles such as grid, rule weight, and type contrast, not literal clip art.
- **Signature device:** the one repeatable element that makes the page recognizable (an oversized numeral system, a ruled-ledger layout, a diagram that runs the page's length, a type specimen hero).
- **What it is not:** name the generic default you are avoiding.

See `references/visual-concepts.md` for directions and how to choose among them.

### Phase 3: Establish the design system first

Create or confirm tokens before building sections. Minimum set:

- **Color:** background, foreground, primary, primary-foreground, secondary, muted, muted-foreground, border. Add one semantic color each for success, warning, and danger only if the page needs them.
- **Type:** heading family, body family, mono family if code appears, base size (16px minimum for body), and a modular scale ratio.
- **Spacing:** a base unit and a short scale. Section padding should come from the scale, not ad hoc numbers.
- **Shape:** two or three radii and two or three shadows, or an explicit "no shadows, borders only" decision.

Rules:

- Text and its background must reach at least 4.5:1 contrast (3:1 for large text and UI boundaries). Verify with a calculation or tool, not by eye.
- Use at most two font families plus mono. Prefer fonts with solid fallbacks and avoid depending on a remote font that breaks the page when offline. Self-host when practical.
- One accent color does most of the work. A second accent needs a stated job.
- Express tokens as CSS custom properties (or the project's equivalent) and use them everywhere.

If the AI Design Engineer CLI is available, `ai-design-engineer tokens export` produces JSON and CSS tokens in a validated format. Otherwise write them by hand.

### Phase 4: Plan structure and hierarchy

Choose sections from the product and the goal, not from a fixed list. Start from `references/page-structures.md`.

For every section, write one line: *what question from the visitor does this answer, and what should they do next?* Remove any section that answers no question.

Hierarchy rules:

- The first screen must state who it is for, what it does, and what to do next, without scrolling.
- One primary action per viewport. Secondary actions look visibly secondary.
- Order sections by the visitor's doubts: what is it, does it work for me, can I trust it, what does it cost, what happens next.
- Prove claims near the claim: a real screenshot, real code, a real number from the user, or a real constraint. If you have no proof, make the claim smaller.

### Phase 5: Write the copy

See `references/copywriting.md`. Essentials:

- Headline: say the outcome in plain words. Avoid "revolutionize", "supercharge", "seamless", "unlock", and "next-generation".
- Subhead: one or two sentences adding the *how* or the *for whom*.
- Buttons: verb plus object ("Start a free project", "Read the docs"), never "Submit" or "Learn more" as the only primary label.
- Use specifics: numbers, nouns, file names, steps. Mark anything you invented as placeholder in a code comment and in your summary.
- Never invent testimonials, customer names, logos, statistics, awards, or press mentions. If the user has none, omit the section or design an honest alternative (how it works, a changelog, open-source stats the user supplies).

### Phase 6: Typography, color, spacing, imagery

- **Type contrast:** create hierarchy through size, weight, and family contrast, not through color alone. Body line length 55 to 75 characters. Body line-height 1.5 to 1.7. Headings tighter, 1.05 to 1.25.
- **Color:** begin with neutrals, then add the accent where attention must go. If everything is accented, nothing is.
- **Spacing:** use generous, consistent vertical rhythm. Group related items tightly and separate groups clearly. Equal spacing everywhere reads as unfinished.
- **Imagery:** prefer, in order: real product screenshots or UI the user supplies, genuine diagrams, CSS or SVG illustrations that express the concept, then photography. Do not hotlink stock photos or generate decorative gradients to fill space. Every image needs meaningful `alt` text, or `alt=""` if decorative, plus explicit width and height to prevent layout shift.
- **Motion:** purposeful and short (150 to 300 ms for state changes). Honor `prefers-reduced-motion`. No scroll-jacking and no animation that delays reading.

### Phase 7: Implement

- Mobile first. Build the narrow layout, then add structure at wider breakpoints. Design for 375, 768, 1024, and 1440 px wide at minimum.
- Use semantic HTML: one `h1`, ordered headings, `header`, `nav`, `main`, `section` with headings, `footer`, `button` for actions and `a` for navigation.
- Every interactive element needs visible hover, `:focus-visible`, active, and disabled states. Target size at least 44 by 44 px on touch.
- Handle states that apply: loading, error, empty, and success for forms; a no-JS baseline for content that should not need JS.
- Forms: visible labels (not placeholder-only), correct `type` and `autocomplete`, inline error messages tied with `aria-describedby`, and no submitting on the user's behalf during testing.
- Every link and button has a real destination or action. If a destination does not exist yet, link to a real placeholder route and list it in the summary rather than using `href="#"`.
- Keep it fast: no layout shift, images sized and lazy loaded below the fold, minimal third-party scripts.

### Phase 8: Accessibility pass

Follow `references/accessibility-and-semantics.md`. Automated tools catch only part of the problems. Always do these by hand: keyboard-only navigation through the whole page, visible focus order, zoom to 200 percent without horizontal scrolling or lost content, and reading order with CSS disabled.

Never claim WCAG conformance. Say what you checked.

### Phase 9: Verify visually and iterate

Follow `references/verification.md`. In short:

1. Start the dev server and open the page in a real browser.
2. Capture or inspect screenshots at 375, 768, and 1440 px wide, above and below the fold.
3. Look for: horizontal scroll, clipped or overlapping text, awkward wraps, inconsistent spacing, weak hierarchy, low contrast, broken images, and placeholder content.
4. Fix, then re-capture. Repeat until a full pass finds nothing you would object to.
5. Check the browser console for errors and the network tab for failed requests.

If you cannot run a browser, say so, and review the markup and CSS against the checklist instead. Do not describe visuals you did not see.

### Phase 10: Report

End with a short summary:

- What you built and where the files are.
- The visual concept in one sentence and the token choices that matter.
- Assumptions you made and content you invented as placeholder.
- What you verified (viewports, keyboard, contrast, console) and what you could not.
- Known limitations and sensible next steps.

## Decision criteria

| Situation | Prefer | Avoid |
| --- | --- | --- |
| Developer tool | Code, terminal output, and diagrams as the hero; dense, mono accents; docs link prominent | Stock photos of people at laptops |
| Local or physical business | Real photos, address, hours, and a phone or booking action above the fold | Abstract tech visuals |
| B2B with a long sales cycle | Clear problem framing, proof, security and compliance facts, a low-pressure contact path | A single "Buy now" with no explanation |
| Consumer app | Product in use, one emotional or practical benefit, store badges that work | Feature lists with no product shown |
| Creative portfolio | Work first, minimal chrome, strong type | Boilerplate "services" grids |
| Early-stage product with no users | Honest "how it works" and a roadmap | Fake social proof |
| Existing brand | Extend the brand's tokens and voice | Replacing the brand with your taste |

## Anti-patterns

- A purple-to-blue gradient background with a centered headline, two buttons, and a floating mockup.
- Three or four identical rounded cards with an icon, a title, and two lines of text, repeated for every section.
- Huge border radii on every container, drop shadows on everything, glassmorphism with no purpose.
- Emoji used as icons or navigation.
- Fake testimonials, "trusted by" logos, star ratings, and statistics.
- Headlines made of buzzwords that could describe any product.
- Placeholder-only form labels, `href="#"` links, buttons that do nothing.
- Text over images without a contrast guarantee.
- Different spacing, radii, and shades invented per component.
- Animations that play on every scroll position or ignore reduced-motion settings.
- Declaring the page finished without opening it.

## Acceptance criteria

The work is done only when all of these are true:

- [ ] A written visual concept exists and the page visibly follows it.
- [ ] Tokens are defined once and used throughout; no stray hard-coded colors or sizes.
- [ ] The first screen states audience, offer, and next action.
- [ ] Copy is specific, with no invented proof and no lorem ipsum.
- [ ] Layout works at 375, 768, 1024, and 1440 px with no horizontal scrolling.
- [ ] Body text and UI boundaries meet contrast minimums.
- [ ] The whole page is operable by keyboard with visible focus.
- [ ] Headings, landmarks, labels, and `alt` text are correct.
- [ ] Reduced-motion preferences are respected.
- [ ] No console errors and no failed requests in a normal load.
- [ ] Every link and button leads somewhere real or is listed as pending.
- [ ] The final report lists assumptions, verification done, and limitations.

## Examples

### Example 1: Open-source CLI tool

*Request:* "Make a landing page for my CLI that formats SQL files."

- Questions needed: license, install command, and whether there is a docs site. Infer the rest.
- Concept: "dry, exact, typeset"; reference world is a printed language reference; signature device is a before/after SQL block that is the hero itself, with the diff highlighted.
- Structure: hero with install command and before/after; how it works in three steps; options table; link to docs and repository; license. No testimonials.
- Tokens: near-white paper, near-black ink, one blue accent for the diff; serif headings, mono for code.

### Example 2: Neighborhood bakery

*Request:* "Website for my bakery, we sell bread and take pre-orders."

- Questions needed: address and hours, how pre-orders work, photos available. Ask all in one message.
- Concept: "warm, floury, handwritten-menu"; reference world is a chalkboard menu and paper bags; signature device is the day's menu as live content near the top.
- Structure: today's loaf list with a pre-order button, hours and map, short story, contact. Photos supplied by the owner; if none exist, use typographic layouts rather than stock bread photos.
- Mobile priority: phone and pre-order actions reachable with the thumb.

### Example 3: B2B compliance software

*Request:* "Landing page for audit-log software aimed at security teams."

- Questions needed: what regulations matter, deployment options, whether security documentation can be public.
- Concept: "calm, rigorous, evidentiary"; reference world is an audit ledger; signature device is a ruled timeline of log entries.
- Structure: problem statement, how events are captured, retention and export facts, security and deployment details, a "talk to us" path that does not demand a long form.
- Proof: only claims the user can substantiate; otherwise link to documentation.

## Final self-review checklist

Before you report completion, answer each with yes or a documented reason:

1. Did I read the existing project and reuse what was there?
2. Can I state the concept and the signature device in one sentence each?
3. Would this layout look noticeably different from the last site I built for a different product?
4. Is every claim on the page one I can support?
5. Did I look at actual screenshots at narrow and wide widths?
6. Did I tab through the page and zoom to 200 percent?
7. Are there leftover placeholders, dead links, or console errors?
8. Does my summary state assumptions, verification, and limitations plainly?

## Reference files

- `references/visual-concepts.md`: choosing a direction and avoiding sameness.
- `references/page-structures.md`: section patterns by product type.
- `references/copywriting.md`: headline, subhead, button, and proof guidance.
- `references/accessibility-and-semantics.md`: semantic and accessibility checklist.
- `references/verification.md`: viewport, screenshot, and review procedure.
- `templates/design-brief.md`: fill-in brief to complete before coding.
- `templates/project-instructions.md`: snippets for agent instruction files.
