# Verification procedure

A page is not done when it builds. It is done when you have looked at it.

## 1. Run it

- Start the dev server using the project's script (for example `npm run dev` or `pnpm dev`) and note the URL.
- Load the page and confirm there are no errors in the browser console and no failed requests.

## 2. Look at it at several widths

Capture or inspect at minimum:

| Viewport | Why |
| --- | --- |
| 375 x 812 | Common phone width |
| 768 x 1024 | Tablet and small laptop split |
| 1440 x 900 | Typical desktop |

Also test 320 px wide once, and a very wide window (1920 px) to check max-widths.

For each, check the first screen and scroll the whole page.

## 3. What to look for

- Horizontal scrolling or clipped content.
- Text overlapping, wrapping awkwardly, or running too long a measure.
- Inconsistent spacing between sections; headings crowding their content.
- Weak hierarchy: can you tell the primary action in two seconds?
- Contrast problems on images, gradients, and colored buttons.
- Broken or oversized images; layout shift as assets load.
- Hover, focus, active, and disabled states that are missing or identical.
- Placeholder content, dead links, and buttons that do nothing.

## 4. Iterate

Fix the most severe problem first (broken, unreadable, unusable), then the structural ones (hierarchy, spacing), then polish. Re-capture after each batch of changes. Stop when a complete pass at all three widths turns up nothing you would object to.

## 5. Optional automated review

If the AI Design Engineer CLI is installed, a review command can capture screenshots and report overflow, console errors, failed requests, and basic semantic observations for a URL you provide. Treat its output as prompts for investigation. It cannot judge visual quality and it does not establish accessibility conformance.

If you use Playwright or another tool directly, only visit the URL the user asked you to test, do not submit forms, and do not click destructive controls.

## 6. If you cannot run a browser

Say so plainly. Review the markup, CSS, and tokens against the acceptance criteria, calculate contrast for the token pairs, and list which visual checks remain for the user to do.

## Baselines

If the project keeps screenshot baselines, update them only when a visual change is intentional, and mention it in your summary. A changed screenshot is a change to review, not proof that the design improved.
