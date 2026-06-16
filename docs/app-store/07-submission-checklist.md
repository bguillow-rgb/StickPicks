# Pre-Submission Checklist

Work through every box before you click **"Submit for Review"** in
App Store Connect. This isn't paranoia — each item below is a common
rejection cause for new apps.

## The meta-gate

- [ ] A `git` tag exists on the exact commit the build was cut from
      (`v1.0.0` or similar). Helps you reproduce if Apple demands
      changes months later.
- [ ] The build uploaded to ASC has processed (not "Processing" or
      "Invalid Binary"). Processing usually takes 5–15 minutes.

---

## Prerequisites outside the app

- [ ] **Privacy Policy URL** is live at a public, non-login URL and
      loads in a browser without errors.
- [ ] **Terms of Use URL** is live at a public URL. Same check.
- [ ] **Support URL** is live at a public URL. Same check.
- [ ] All three URLs use HTTPS (App Review will flag HTTP).
- [ ] Demo account has been created, signed in at least once from the
      app, and added to the `comped_users` table in Supabase with
      `note='app review'`.
- [ ] You have the demo-account password ready to paste into ASC —
      don't re-use your personal account.

---

## App Store Connect — App Information

- [ ] App name: `Stick Picks`
- [ ] Subtitle: `Cigar Collection Journal` (or alternate from `01-metadata.md`)
- [ ] Primary category: `Lifestyle`
- [ ] Secondary category: `Catalogs`
- [ ] Content rights: "Does your app contain, show, or access third-party content?" — **Yes, and I have all necessary rights** (our cigar catalog uses public brand/vitola names, which are factual reference).

---

## App Store Connect — Version Information (1.0.0)

- [ ] Promotional text (optional, editable anytime): filled from `01-metadata.md`
- [ ] Description: pasted from `01-metadata.md`, with privacy/terms URLs replaced with real URLs
- [ ] Keywords: pasted from `01-metadata.md`
- [ ] Support URL: real public URL
- [ ] Marketing URL: real public URL (or left blank)
- [ ] Screenshots: uploaded for the iPhone 6.9" slot (see `05-screenshot-runbook.md`); at least 5
- [ ] App icon: 1024×1024, no alpha, verified per `06-icon-and-visuals.md`
- [ ] Copyright: `© 2026 Bob Guillow` (adjust to entity)
- [ ] Build: the correct build number selected from the processed builds list (expected: **Build 13**)
- [ ] Release option: "Manually release this version" chosen

---

## App Store Connect — Age Rating

- [ ] Questionnaire completed per `02-age-rating.md`
- [ ] Computed rating: **17+**
- [ ] Made for Kids: **No**

---

## App Store Connect — App Privacy

- [ ] Data types disclosed per `03-app-privacy.md` (all 10 types marked)
- [ ] "Tracking" answered **No**
- [ ] "Privacy Policy URL" matches the one in Version Information

---

## App Store Connect — App Review Information

- [ ] Sign-in required: **Yes**
- [ ] Demo username + password: filled
- [ ] Contact first/last name, phone, email: filled
- [ ] Reviewer notes: pasted from `04-review-information.md`

---

## App Store Connect — Pricing and Availability

- [ ] App price: **Free** (Pro is a subscription IAP; the app itself is free)
- [ ] Availability: all countries *except* any that restrict tobacco-related
      media content. At minimum launch in: US, Canada, UK, Australia,
      New Zealand, Western Europe. Apple lets you add more later.
- [ ] Pre-order: **No** for first launch.

---

## App Store Connect — In-App Purchases

- [ ] Stick Picks Pro Monthly product:
  - Reference name, product ID match code / RevenueCat
  - Subscription duration: 1 Month
  - Price tier: $2.99 USD (auto-localized)
  - Localized display name: `Stick Picks Pro — Monthly`
  - Localized description: `Unlimited scans, wishlist, and collection history.`
  - Review screenshot of paywall uploaded
  - State: **Ready to Submit** (Apple requires this before the version can be submitted)
- [ ] Stick Picks Pro Yearly product — same fields, different
  duration/price
- [ ] Both IAPs attached to the version being submitted

---

## In-binary sanity checks (run on the build you'll submit)

- [ ] Launch → age gate appears first (blocks on "No")
- [ ] After 21+ confirmation → login prompt appears
- [ ] Sign in via Google works end-to-end
- [ ] Sign in via Apple works end-to-end
- [ ] Age gate resets after a sign-out + re-sign-in (verify behavior is what you want — may be either)
- [ ] Splash screen: SP monogram renders correctly, no cropping (re-verify after the splash-revert commit landed in Build 12+)
- [ ] Paywall loads real StoreKit products (not "Products not available"); prices are shown from StoreKit, not hardcoded strings
- [ ] "Restore Purchases" on paywall works for a test Pro account
- [ ] Cancel disclosure visible on paywall ("Cancel anytime in App Store settings — …")
- [ ] "Delete Account" in Profile completes without error (tested on a secondary account you don't mind losing)
- [ ] Scan runs end-to-end without hitting the "scan limit" dialog while signed in as the comped review account

---

## Copy sanity check (per `framing-guide.md`)

- [ ] The word "smoke" does NOT appear anywhere in the App Store listing copy
- [ ] The word "tobacco" appears only where factually necessary (age gate copy, one mention in the description's "For Adult Collectors" block)
- [ ] No phrases that promote consumption (e.g., "enjoy a cigar", "light up", "puff")
- [ ] The description reads naturally as a collection/journal/catalog app

---

## Submit

When every box above is ticked, click **Submit for Review**. Expect:

- Review takes 24–48 hours on average for a first submission (sometimes longer)
- First submissions occasionally get "Metadata Rejected" for minor description-copy tweaks — easy to fix in ASC without a new binary
- If rejected for 1.4.3 (tobacco): re-read `framing-guide.md` section "If a reviewer pushes back" and appeal with the four bullet points there

**Post-approval:** do NOT auto-release. Wait until you're ready to
announce, then hit "Release" manually.
