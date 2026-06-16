# Icon and Visual Asset Requirements

## App icon (1024 × 1024)

Required for the App Store listing. Apple's rules:

- **Dimensions:** exactly 1024 × 1024 pixels
- **Format:** PNG or JPEG
- **Color space:** sRGB or P3
- **No alpha channel** — flatten against a solid background
- **No transparency**
- **No rounded corners** (Apple applies the mask at render time; if
  you pre-round, you get a double-mask)
- **No shadows, reflections, or platform chrome**
- **No text that duplicates the app name** ("Stick Picks" text below
  the monogram is fine; just ensure it's part of the icon design,
  not an overlay Apple would trim)

## Current icon status — verify before upload

The repo already has `assets/images/icon.png`. Verify it passes:

```bash
cd /Users/bobguillow/StickPicks/.claude/worktrees/stoic-kirch
file assets/images/icon.png
# should say: PNG image data, 1024 x 1024, 8-bit/color RGB, non-interlaced
# note the "RGB" — if it says "RGBA" you have an alpha channel
```

If `file` reports `RGBA` or an alpha-present state, flatten:

```bash
# Requires ImageMagick (brew install imagemagick)
magick assets/images/icon.png -background "#0A1A0F" -alpha remove -alpha off \
  assets/images/icon.png
```

(The `#0A1A0F` is the app's dark-green background color from `app.json`
→ `backgroundColor`. Use the same color so the flattening is seamless.)

## Icon verification checklist

- [ ] Dimensions: exactly 1024 × 1024
- [ ] No alpha channel
- [ ] Renders recognizable at 60 × 60 (iPhone home-screen rendered size)
- [ ] Does not include Apple's glyph, App Store badge, or other
      trademarked Apple imagery
- [ ] Colors in sRGB color profile (default for most tools)
- [ ] File size under 1 MB (not a hard Apple rule, but anything much
      larger is likely a sign something's wrong)

## Where to upload in App Store Connect

App Store Connect → Your App → (version tab) → Media Manager → App Icon.
You upload the 1024 × 1024 once; Apple generates all the in-store
rendered sizes automatically.

**Note:** this is separate from the icon bundled inside the `.ipa`
(which Expo generates at build time from `app.json` → `expo.icon`).
The 1024 × 1024 you upload to App Store Connect is used for:
- Store listing page
- Search results
- "Today" tab features
- Editorial banners

## Other visual assets Apple does NOT require

- Launch screen images — handled at build time via
  `expo-splash-screen` and the `splash.image` config. We already ship
  the SP-monogram PNG as the native launch screen.
- Adaptive icon foreground / background — Android-only concern
  (`assets/images/adaptive-icon.png`), unrelated to iOS submission.
- Notification icons, widget icons — only if you ship those features,
  which v1.0.0 does not.

## Marketing visuals (optional)

App Store Connect does not require a marketing image. If you later
want to feature the app in press or social channels, the screenshots
in `05-screenshot-runbook.md` serve double-duty for that.

## Accessibility note

Apple increasingly prefers icons that read well at small sizes and in
grayscale. Open `assets/images/icon.png`, shrink to 60 × 60 in Preview,
and make sure the SP monogram (or whatever's on the icon) is still
recognizable. If it becomes a blob of brown + gold, consider
simplifying.
