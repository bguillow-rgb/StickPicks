# App Review Information — Helping Apple Pass Us First Try

App Store Connect → Version Information → "App Review Information".
Apple's reviewer reads this before (and during) the review. A good
review-information block is worth hours of re-submission time.

## Sign-in requirement disclosure

Yes — Stick Picks requires sign-in to use most features (anonymous
"guest" mode is allowed for limited free scans, but the full
experience needs an account).

## Demo Account (required since the app gates content behind sign-in)

Create a **dedicated reviewer test account** — do NOT give App Review
your personal account, your comped founder account, or a production
user's credentials.

Recommended approach:
1. Sign up a fresh Google / Apple account (e.g. `stickpicks.review@gmail.com`)
2. Add it to `comped_users` in Supabase with `note='app review'` —
   this gives reviewers unlimited scans during review without hitting
   the free-tier quota.
3. Sign in once from the app so the profile row is created.
4. Plug the credentials into ASC.

Fill into App Store Connect:

```
Username: stickpicks.review@gmail.com
Password: [generate a strong password, store in 1Password]
```

After launch, rotate this password if you suspect it leaked.

## Contact Information

```
First name:  Bob
Last name:   Guillow
Phone:       [your phone number]
Email:       support@stickpicks.app
```

Apple uses these to reach you if the review raises a question they
need answered live. Use a phone you'll actually answer in US business
hours.

## Notes for the Reviewer (free-text field, generous)

This is your chance to pre-empt the most common rejection reasons.

```
Hi — thanks for reviewing Stick Picks.

ABOUT THE APP
Stick Picks is a lifestyle and hobby app for adult cigar collectors. It
is NOT a storefront: we do not sell cigars, distribute tobacco products,
or facilitate any tobacco purchase. The app is a catalog, journal, and
humidor-organization tool for users who already collect cigars as a
hobby — analogous to Vivino (wine), Distiller (whisky), or CellarTracker.

AGE RESTRICTIONS
A 21+ age gate is enforced on first launch (before any content is
visible), matching US federal legal smoking age. Answering "No" dead-ends
the user on a blocked screen. The App Store rating is 17+ (the maximum
rating under Apple's taxonomy), and our in-app gate is stricter.

HOW TO TEST

1. Sign in with the provided review account. It is flagged as comped
   so it has unlimited photo scans during review — no free-tier quota
   dialog will appear.
2. Confirm 21+ on the age gate.
3. Browse tab — try searching for "Macanudo", "Padron", or "Hyde Park".
   The search looks up brand, line, and vitola; any match returns.
4. Scan tab — take a photo of any cigar band (our demo will have sample
   bands inside the Humidor tab → Smoked tab → [any entry] → photo).
   The app suggests ranked matches from our reference catalog.
5. Humidor tab — add a cigar from Browse; it appears in your humidor
   inventory. Try adjusting quantity, marking as smoked, and logging
   a review.
6. Profile tab — see collection stats and streak counters. Sign Out
   works from here.
7. Paywall — tap any Pro-gated feature (e.g., Humidor → Wishlist tab).
   Pro costs $2.99/month or $24.99/year with auto-renew and full
   cancellation disclosure in the paywall copy.

WHAT YOU WON'T SEE
- In-app purchases that bypass Apple (all Pro billing goes through
  StoreKit via RevenueCat).
- Any external links to buy cigars or tobacco products.
- Any content encouraging smoking, consumption, or underage use.
- Tracking prompts (we don't use IDFA; ATT isn't needed).

ACCOUNT DELETION
The profile tab has a "Delete Account" button that calls a Supabase
Edge Function (`delete-account`) — it wipes the user's humidor,
journal, scan history, reviews, and Storage objects, then deletes
the auth.users row. Test this on a secondary review account if you
want to verify — it's the real flow.

CONTACT
Questions during review? support@stickpicks.app — reaches a human
within a few business hours.

Thank you.
```

*~1,900 chars — Apple allows up to 4,000. You've got room to add any
app-specific reviewer aids.*

## Attachment (optional)

Apple allows PDF/text attachments in this section. Consider attaching:
- A one-page PDF of how the age gate works (screenshot + flow).
- A one-page PDF of the subscription flow (copy, prices, restore path).

Both are optional. Skip for v1.0.0; add for v1.1 if you have extra time.

## Release Options

Pick **"Manually release this version"** for v1.0.0. This lets you
click "Release" after the app is Approved, not at the moment of
Approval — so you can coordinate with any marketing/announcement.

For subsequent versions, **"Automatically release after approval"** is
usually fine.
