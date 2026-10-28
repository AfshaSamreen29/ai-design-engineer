# Accessibility and semantics checklist

This is a practical checklist, not a conformance claim. Automated tools find only a portion of real problems, so manual checks are required. Do not state that a page is WCAG compliant.

## Structure

- [ ] One `h1`; headings descend without skipping levels for style reasons.
- [ ] Landmarks: `header`, `nav` (labelled if more than one), `main`, `footer`.
- [ ] Lists use `ul`/`ol`; tables use `th` with `scope`.
- [ ] Language set with `<html lang="...">`; page `<title>` is unique and descriptive.
- [ ] A "skip to content" link appears on keyboard focus for pages with long navigation.

## Interaction

- [ ] Actions use `button`; navigation uses `a` with a real `href`.
- [ ] Every interactive element is reachable and operable by keyboard in a logical order.
- [ ] `:focus-visible` styles are clearly visible against every background.
- [ ] Touch targets are at least 44 by 44 px (24 by 24 px is the absolute floor in WCAG 2.2).
- [ ] Menus, dialogs, and disclosures manage focus and close with Escape; use native elements (`details`, `dialog`) where they fit.
- [ ] No keyboard traps; no content that appears only on hover.

## Forms

- [ ] Every control has a visible, programmatically associated `label`.
- [ ] Appropriate `type`, `name`, and `autocomplete` values.
- [ ] Errors are announced and associated using `aria-describedby`; do not rely on color alone.
- [ ] Required fields are indicated in text.

## Visual

- [ ] Text contrast at least 4.5:1 (3:1 for large text, icons, and control boundaries).
- [ ] Information is not conveyed by color alone.
- [ ] Layout holds at 200 percent zoom and at 320 CSS px width without two-dimensional scrolling.
- [ ] Line height, letter spacing, and paragraph spacing survive user overrides.
- [ ] Respect `prefers-reduced-motion`: remove parallax, autoplay, and large transitions.
- [ ] Respect `prefers-color-scheme` when the design supports both.

## Media

- [ ] Informative images have meaningful `alt`; decorative images use `alt=""`.
- [ ] Icons that carry meaning have accessible names.
- [ ] Video has captions; audio has transcripts; nothing autoplays with sound.
- [ ] SVG illustrations that convey information include a title or are described nearby.

## ARIA

- Prefer native HTML. Add ARIA only when no native element expresses the behavior.
- Do not add roles that contradict the element's semantics.
- Every ARIA widget pattern needs the keyboard behavior that goes with it.

## Manual test script

1. Unplug the mouse. Tab through the entire page and operate every control.
2. Zoom the browser to 200 percent, then narrow the window to 320 px.
3. Disable CSS and read the page order.
4. Turn on reduced motion in the operating system and reload.
5. If a screen reader is available, listen to the heading list and one form.

## What to report

State which checks you ran and which you could not. Example: "Checked keyboard order, focus visibility, heading structure, and contrast values for tokens. Did not test with a screen reader."
