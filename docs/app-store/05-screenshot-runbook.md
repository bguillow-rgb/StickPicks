# Screenshot Runbook — Exact Capture Plan

Apple requires 1–10 screenshots per device size. We ship **at least 5
strong shots** — fewer looks sparse on the listing, more than 7 is
overkill for v1.0.0.

## Device sizes Apple requires (as of 2026)

| Device | Resolution | Required? |
|---|---|---|
| iPhone 6.9" (iPhone 16 Pro Max) | 1290 × 2796 | **Yes — mandatory** |
| iPhone 6.7" (iPhone 14 Pro Max, 15 Plus) | 1290 × 2796 | **Reuse 6.9" shots** — Apple auto-accepts same-size images for both |
| iPhone 6.5" (iPhone 11 Pro Max) | 1242 × 2688 | **Optional** — can leave empty if we have 6.9" |
| iPhone 5.5" (iPhone 8 Plus) | 1242 × 2208 | **Optional** — deprecated for new apps |
| iPad 12.9" Pro | 2048 × 2732 | **NOT required** — `supportsTablet: false` in app.json |

**Bottom line: capture ONE set at 1290 × 2796, upload for all iPhone size
slots that accept it.** No iPad work needed.

## Simulator to use

Open Xcode → Open Developer Tool → Simulator → Hardware → iPhone 16 Pro Max.
That simulator renders at 1290 × 2796 natively.

To capture: `Cmd+S` in the simulator (saves to Desktop). Or File → Save
Screen. Or use `xcrun simctl io booted screenshot /tmp/shot.png` from
the command line.

## Pre-capture state prep

1. **Sign in with a seeded account** that has a realistic-looking
   humidor — at least 6–10 cigars across owned / smoked / wishlist.
   Don't screenshot an empty humidor.
2. **Force light-mode colors** are not needed — the app is dark-mode only.
3. **Hide the notch/indicator clutter.** The simulator includes a
   mock status bar; that's fine. Make sure the time reads `9:41` (Apple's
   convention) — use `xcrun simctl status_bar booted override --time 9:41`.
4. **Charged battery, full bars.** Same command: `--batteryState charged
   --batteryLevel 100 --cellularBars 4 --wifiBars 3`.
5. **Disable streaks toast popups** during capture (flip `SUPPRESSION_WINDOW_MS`
   high temporarily, or just avoid actions that trigger a toast).

## Shot list — 5 screens, in order

### Shot 1 — "The collection at a glance" (Humidor tab)

- Screen: Humidor tab, filter set to "All"
- State: 6+ cigars visible with images, price values, quantities
- Caption (overlaid in a marketing tool like Shottr or Figma, optional):
  `Organize your humidor, your way.`
- Why this shot first: establishes the app's core hook — a beautiful
  personal catalog, collection-first framing.

### Shot 2 — "Find any stick" (Browse tab with results)

- Screen: Browse tab, search bar showing `Padron` with results list
- State: 4–5 Padron results visible, each with thumbnail + name + brand
- Caption: `A rich reference catalog at your fingertips.`
- Why: shows catalog breadth + search experience.

### Shot 3 — "Photo recognition" (Scanner result screen)

- Screen: the post-scan result screen with a top match + alternatives strip
- State: a confident match (e.g., Oliva Serie V) with 2-3 alternatives below
- Caption: `Identify any band. Catalog it instantly.`
- Why: shows the scanner as an *inventory tool*, not a consumption tool.
  The phrase "catalog it" reinforces the hobby framing.

### Shot 4 — "Cigar detail" (Detail screen with Similar Cigars)

- Screen: a cigar detail page showing hero image, metadata (origin,
  strength, wrapper/binder/filler, size), community rating, Similar
  Cigars strip
- Caption: `Every cigar, fully catalogued.`
- Why: shows depth of the reference database. Pick a detail page with
  rich metadata.

### Shot 5 — "Your hobby, tracked" (Profile with streaks)

- Screen: Profile tab showing avatar, stats (Humidor count, Smoked
  count, Scans count), and the Streak card with 2-3 active streaks
- Caption: `Your collector's journal.`
- Why: closes the marketing narrative — personal, owned, long-term
  hobby engagement.

### Optional Shot 6 — "Pro unlocks more" (Paywall)

- Screen: the paywall view
- State: showing plan options with clear prices ($2.99/mo, $24.99/yr)
  and the subscription terms block
- Caption: `Unlimited scans and more with Pro.`
- Why: legal disclosure of subscription terms is visible in your
  screenshots, which reinforces your App Review Guideline §3.1.2
  compliance at a glance.

## What NOT to show in screenshots

- Any text that reads "smoke a cigar" or equivalent consumption
  language. The "Smoked" filter chip label in Humidor is a technical
  status — when you screenshot the humidor, **select the "All" filter**
  so the chips show but "Smoked" isn't the active state.
- Age gate screen. Apple's reviewer sees it; marketing does not need
  to lead with it.
- Any error state, empty state, or debug panel.
- Competitor brand logos that you don't control — stick to public
  cigar brand names in the catalog, which are fine (factual reference).

## Tools for overlay text / frames (optional)

Captions are optional. If you want polished screenshots with caption
text overlaid:

- **Shottr** (free, macOS) — quick annotation
- **Figma template** (free) — more control, reusable for future versions
- **Screenshot.rocks**, **Previewed**, or **AppMockUp** — online tools

Keep captions ≤ 6 words, one line, top or bottom 15% of the frame.

## Delivery format

- PNG, 1290 × 2796 px
- No alpha (Apple prefers — bg should be solid color or the app's
  natural dark background)
- File naming suggestion: `01-humidor.png`, `02-browse.png`,
  `03-scanner.png`, `04-detail.png`, `05-profile.png`, `06-paywall.png`
- Drop them into `docs/app-store/assets/screenshots/` when captured.

## Preview video (optional)

Skip for v1.0.0. A preview video is compelling but not required,
and the screenshot set above tells the app's story clearly enough.

If you do want one later:
- 15–30 seconds, 1080p minimum
- Show: humidor scroll → browse search → scan capture → detail page
  → back to humidor (closing the loop)
- No voice-over (Apple strongly discourages)
- Background music: only if licensed
