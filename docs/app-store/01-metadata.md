# App Store Metadata — Text Fields

Every text field App Store Connect asks for, filled in and ready to
copy-paste. Character counts given for each; App Store Connect will
reject if you exceed them.

All copy below follows [`framing-guide.md`](framing-guide.md) —
collection/hobby framing only, no consumption language.

---

## App Name (30 chars max)

```
Stick Picks
```
*11 chars — plenty of headroom. Already matches `app.json` name.*

---

## Subtitle (30 chars max)

```
Cigar Collection Journal
```
*24 chars. Positions the app as a journal for collectors — picks up the
hobby/lifestyle framing directly below the app name in search results.*

Alternative if you want a different angle:
- `Your Cigar Humidor` (18 chars)
- `Cigar Collector's Journal` (25 chars)
- `Catalog Your Cigar Hobby` (24 chars)

---

## Promotional Text (170 chars max — editable anytime without a new review)

```
The refined journal for cigar collectors. Catalog your humidor, track your collection's value, and organize your hobby by brand, origin, and vitola.
```
*148 chars. Use this field for seasonal or event-based updates later —
it's the only copy field you can change without resubmitting.*

---

## Description (4000 chars max)

```
Stick Picks is the refined journal for cigar collectors — a lifestyle companion for enthusiasts who catalog their collection, organize their humidor, and track the value of what they own.

WHAT IT IS

A modern personal reference for your cigar hobby. Your private catalog: every stick you acquire can be logged, organized, photographed, and traced through a rich reference database of cigar brands, lines, and vitolas. Your collection stays yours — stored privately in your account and synced across your Apple devices.

CORE FEATURES

• Digital Humidor — organize your physical collection as an online inventory. Group by brand, line, origin, or vitola. See what you own at a glance.

• Value Tracking — log what you paid for each stick and see your collection's total acquisition value. Override prices when you resell, gift, or receive as gifts.

• Reference Catalog — browse hundreds of cigar brands and vitolas. Every catalog entry includes origin, wrapper/binder/filler details, strength, and size dimensions.

• Photo Recognition — snap a band and get ranked catalog matches. Alternative picks and a manual-find fallback handle unusual vitolas. Great for quickly identifying a stick you've been given or bought blind.

• Personal Journal — add photos, notes, and memories to any entry. Record where you acquired it, who you were with, what made it memorable.

• Collection Streaks — track your engagement with your own hobby: how regularly you catalog, review, and organize.

STICK PICKS PRO

Unlocks unlimited photo recognition, a history and review log for your collection, a personal wishlist, and richer value analytics.

• Stick Picks Pro Monthly — $2.99/month
• Stick Picks Pro Yearly — $24.99/year

Subscriptions auto-renew at the price shown in the App Store unless cancelled at least 24 hours before the current period ends. Payment is charged to your Apple ID account on confirmation of purchase. Manage or cancel at any time in your App Store account settings.

FOR ADULT COLLECTORS

Stick Picks is intended for adults of legal age. A 21+ age gate is enforced on first launch. We do not sell cigars, distribute tobacco products, or promote tobacco consumption — Stick Picks is a catalog and journal tool for an existing adult hobby.

PRIVACY

Your collection data is yours. We collect the minimum needed to sync your catalog, authenticate your account, and protect against abuse. Full details in the Privacy Policy linked below.

Questions, feedback, or support: support@stickpicks.app

Privacy Policy: https://stickpicks.app/privacy
Terms of Use: https://stickpicks.app/terms
```

*~2,100 chars. Under the 4,000 cap with room to grow. The Pro
subscription block at the bottom is required-ish — Apple looks for
clear auto-renewal disclosure, billing terms, and cancellation
instructions in the description for subscription apps.*

**Replace the privacy/terms URLs before submission** — see README for
publishing prerequisites.

---

## Keywords (100 chars max, comma-separated, no leading spaces)

```
cigar journal,humidor,cigar catalog,collection,vitola,cigar tracker,cigar hobby,inventory,aficionado
```
*100 chars exact. Do NOT include the app name itself (Apple indexes it
automatically) and do NOT repeat singular/plural (Apple stems them).*

Omitted deliberately:
- "smoke / smoking" — framing violation
- "tobacco" — too broad, attracts unrelated searches
- "pipe" — different hobby
- "cigars" — plural of indexed "cigar"

---

## What's New in This Version

For the initial 1.0.0 release:

```
Welcome to Stick Picks — the journal for your cigar collection. Catalog your humidor, track your collection's value, explore hundreds of cigar brands and vitolas, and keep a personal record of every stick you acquire. Pro unlocks unlimited photo recognition, wishlist, and richer history.
```
*~320 chars. Apple caps this at 4,000; short-and-punchy is the
convention for v1.0.0 where the novelty speaks for itself.*

For subsequent releases, write 2-3 bullets focused on what changed,
not marketing copy. Example template for v1.0.1:

```
• Fixed splash screen rendering on some devices
• Smarter search — now finds cigars by vitola (e.g., "Hyde Park")
• Performance improvements across the humidor and browse tabs
```

---

## Primary Category

```
Lifestyle
```

*Rationale: Lifestyle is the correct home for hobby/collection apps
that aren't games, utilities, or reference tools. Vivino (wine),
Distiller (whisky), and similar collection apps sit in Lifestyle.*

## Secondary Category

```
Catalogs
```

*Rationale: Reinforces the "catalog of cigars" framing and helps
Apple's taxonomy understand the core use-case as reference/inventory,
not consumption.*

---

## Support URL (required)

```
https://stickpicks.app/support
```
*Needs to be a real public URL before submission. Minimum viable: a
single page with contact email and a brief FAQ.*

## Marketing URL (optional)

```
https://stickpicks.app
```
*If you don't have a landing page yet, leave this blank — it's
optional. An empty field is better than a broken link.*

## Privacy Policy URL (required)

```
https://stickpicks.app/privacy
```
*Must be a publicly reachable URL — the in-app `app/legal/privacy.tsx`
screen doesn't satisfy this. Copy the in-app content into a hosted
page before submission.*

## Copyright

```
© 2026 Bob Guillow
```
*Replace with entity name if you're shipping under a company.*

---

## Localizations

For v1.0.0, ship **English (U.S.)** only. Adding localizations later
is a non-breaking ASC update — don't try to do it in the first
submission.

---

## Minimum OS version

Controlled by `app.json` / Expo SDK 54 → iOS 15.1+. App Store Connect
auto-detects this from the binary; you don't type it in.

---

## Export compliance

Already configured in `app.json`:

```json
"ITSAppUsesNonExemptEncryption": false
```

This means Apple won't ask you encryption questions on every build.
Confirmed correct — the app only uses HTTPS + standard platform APIs.
