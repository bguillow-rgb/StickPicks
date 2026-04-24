# Stick Picks — App Store Submission Assets

Everything needed to submit Stick Picks to the iOS App Store, organised for
copy-paste into App Store Connect.

## How to use this folder

Work through the numbered docs in order when you're filling in App Store
Connect. Every text field maps to a specific file; every visual asset has a
runbook so you know exactly what to capture and in which simulator.

## What you'll find

| File | What it covers | Where it goes in ASC |
|---|---|---|
| [`framing-guide.md`](framing-guide.md) | Tone rules: how to talk about the app without promoting tobacco use. Read this first. | Background only |
| [`01-metadata.md`](01-metadata.md) | App name, subtitle, description, keywords, promo text, categories, copyright, URLs | App Information + Version Information tabs |
| [`02-age-rating.md`](02-age-rating.md) | Apple's age-rating questionnaire — every question with our answer + rationale | App Information → Age Rating |
| [`03-app-privacy.md`](03-app-privacy.md) | "App Privacy" data-collection disclosures for the store listing | App Privacy tab |
| [`04-review-information.md`](04-review-information.md) | Reviewer demo account, contact info, notes that help App Review pass us first try | App Review Information |
| [`05-screenshot-runbook.md`](05-screenshot-runbook.md) | Device sizes, shot list, simulator setup, exact flow to capture each shot | Media Manager |
| [`06-icon-and-visuals.md`](06-icon-and-visuals.md) | 1024×1024 icon requirements + a verify-step for the current icon.png | Media Manager → App Icon |
| [`07-submission-checklist.md`](07-submission-checklist.md) | Final pre-submit gate — tick everything here before clicking "Submit for Review" | Mental checklist |

## Open prerequisites you need to handle outside this folder

These **aren't App Store Connect entries** — they need action elsewhere
before you can complete the submission:

1. **Publish your Privacy Policy at a public URL.** In-app screens (`app/legal/privacy.tsx`)
   aren't enough — Apple requires a hosted public URL reachable without
   the app. Suggest: GitHub Pages on your repo, Netlify free tier, or
   a one-page subdomain of `stickpicks.app`. Content is already written
   inside the app; copy it out.
2. **Publish your Terms of Use / EULA at a public URL.** Same reasoning.
   Also required for the in-app Subscription Terms disclosure (you need
   a link to these terms on the paywall).
3. **Publish a Support page.** A simple page at `https://stickpicks.app/support`
   (or equivalent) with contact email, FAQ, maybe a form. Minimum viable
   is a plain-text page with your support email.
4. **Register the app record in App Store Connect.** You've already got
   ASC App ID `6762097047` from eas.json so this appears done — verify
   metadata language and primary territory.
5. **Review Information demo account.** Provision a real test account
   App Review can use to sign in. See `04-review-information.md`.

## What I did NOT create (and why)

- **Screenshots themselves.** I can't run the iOS simulator from this
  session. `05-screenshot-runbook.md` gives you the exact shot list,
  sizes, and simulator instructions so you can capture them yourself
  (or hand off to a designer).
- **The 1024×1024 icon.** The repo already has `assets/images/icon.png`
  which is correct. `06-icon-and-visuals.md` tells you how to verify
  it passes Apple's requirements before upload.
- **Preview video.** Optional asset. Not drafted here. If you want one,
  ask and I'll give you a 30-second storyboard.

## Framing reminder

Every piece of external copy in this folder follows one rule:

> Stick Picks is a lifestyle/hobby app for collectors. We don't sell
> cigars, promote consumption, or condone smoking. The app catalogs a
> collection and tracks its value. The word "smoke" never appears in
> marketing copy — only, where technically necessary, as a neutral
> status label inside the app UI.

If you edit any of this copy, re-read [`framing-guide.md`](framing-guide.md)
first.
