# App Privacy — Data Collection Disclosures

App Store Connect → "App Privacy" tab. Apple shows this on every
listing page ("App Privacy" section of the store), so the answers
here become publicly visible. Be accurate.

For each data type, Apple asks:
- **Is it collected?** (Yes/No)
- **Linked to the user's identity?** (Yes/No)
- **Used for tracking across apps/websites?** (Yes/No)
- **Purposes** (one or more from a fixed list)

## The fixed list of purposes Apple offers

- Third-Party Advertising
- Developer's Advertising or Marketing
- Analytics
- Product Personalization
- App Functionality
- Other Purposes

## Our data-collection reality

Stick Picks uses four services that collect user data:
- **Supabase** — authentication + database (core app functionality)
- **RevenueCat** — subscription state
- **PostHog** — product analytics
- **Sentry** — crash / diagnostic reporting

None of these use IDFA or cross-app tracking → **ATT prompt is NOT
required**. Confirm by making sure the binary does not call
`ATTrackingManager.requestTrackingAuthorization` anywhere.

---

## Per-data-type answers

### Contact Info → Email Address

- Collected: **Yes**
- Linked to user: **Yes**
- Used for tracking: **No**
- Purposes: **App Functionality** (authentication)

*Source: Google Sign-In / Apple Sign-In grants us the user's email as
part of the OAuth handshake. Stored in Supabase `auth.users`.*

### Contact Info → Name

- Collected: **Yes**
- Linked to user: **Yes**
- Used for tracking: **No**
- Purposes: **App Functionality** (display name on profile)

*Source: Google/Apple Sign-In full name.*

### User Content → Photos or Videos

- Collected: **Yes**
- Linked to user: **Yes**
- Used for tracking: **No**
- Purposes: **App Functionality**

*Source: Scan captures (sent to our server for photo recognition),
avatar uploads, journal photos. Stored in Supabase Storage buckets.*

### User Content → Other User Content

- Collected: **Yes**
- Linked to user: **Yes**
- Used for tracking: **No**
- Purposes: **App Functionality**

*Source: Journal entries, reviews, custom price and acquisition-date
overrides, wishlist, smoking/owned/smoked status flags.*

### Identifiers → User ID

- Collected: **Yes**
- Linked to user: **Yes**
- Used for tracking: **No**
- Purposes: **App Functionality**, **Analytics**

*Source: Supabase `auth.uid()` — used by RLS, analytics, and Sentry
user context.*

### Identifiers → Device ID

- Collected: **Yes**
- Linked to user: **No** (tied to the device, not to account identity
  — a signed-out guest's scans also count toward this)
- Used for tracking: **No**
- Purposes: **App Functionality** (per-device free-scan quota,
  abuse prevention)

*Source: `expo-application.getAndroidId / getIosIdForVendor` — IDFV,
not IDFA. Resetting/wiping the device resets this ID.*

### Usage Data → Product Interaction

- Collected: **Yes**
- Linked to user: **Yes**
- Used for tracking: **No**
- Purposes: **Analytics**

*Source: PostHog events we fire (paywall_viewed, scan_started,
streak_ticked, etc.). No IDFA; user-ID-linked only.*

### Diagnostics → Crash Data

- Collected: **Yes**
- Linked to user: **Yes** (we set Sentry user context)
- Used for tracking: **No**
- Purposes: **App Functionality**

*Source: Sentry.*

### Diagnostics → Performance Data

- Collected: **Yes**
- Linked to user: **Yes**
- Used for tracking: **No**
- Purposes: **App Functionality**

*Source: Sentry performance spans.*

### Purchases → Purchase History

- Collected: **Yes**
- Linked to user: **Yes**
- Used for tracking: **No**
- Purposes: **App Functionality**

*Source: RevenueCat — tracks which plans the user owns to drive
entitlement gates.*

---

## Data types NOT collected (mark "No" on all)

- Health & Fitness
- Financial Info — Credit Info, Other Financial Info
- Payment Info — credit card numbers, etc. (Apple handles IAP
  payments; we never see the card)
- Location — Precise Location, Coarse Location
- Sensitive Info (race/ethnicity, religion, political opinion,
  sexual orientation, gender identity, pregnancy info, disability,
  union membership, biometric data)
- Contacts (address book)
- Other User Content — Customer Support, Other (covered above)
- Browsing History
- Search History
- Audio Data — Recordings, Other
- Other Data Types

## Tracking (the global question)

Apple asks, "Does your app or its third-party partners use any
collected data for tracking?"

**Answer: No.**

*Rationale: None of our SDKs link user data with data collected from
other apps or websites for advertising or advertising-measurement
purposes, nor do we share data with data brokers.*

---

## What the resulting "App Privacy" card will look like on the store

> **Data Linked to You**
> • Contact Info, Identifiers, User Content, Usage Data, Diagnostics,
>   Purchases
>
> **Data Not Linked to You**
> • Identifiers (Device ID)
>
> **Data Used to Track You**
> • None

This is honest and accurate. Reviewers and privacy-conscious users
will see a short, clean card.
