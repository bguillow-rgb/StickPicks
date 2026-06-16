# Build 13 Regression Test Plan

**Purpose:** this doc is the pre-ship gate for Build 13 (first App Store
submission). Every box below must tick green before `eas build` is kicked
AND before the PR to main is merged. Any failure → stop, root-cause the
regression, re-run the affected section only after a fix lands.

**Executor:** Bob (on a real iOS device running Build 13 from TestFlight).
**Environment:** signed-in session using a newly-created test account
(NOT a comped / admin account — see Section Z for admin-specific flows).
**Duration estimate:** 90–120 minutes for a full pass.

**How to use this doc:**
- Run sequentially top-to-bottom the first time; order matters because
  later sections assume state (humidor content, scanned items, etc.) from
  earlier ones.
- Tick each ☐ box after you confirm the expected behavior.
- If a step fails: note the failure in the "Notes" column, stop, file
  the fix, then re-execute from that section's first step.

---

## Section A — Cold launch + onboarding

Uninstall the app first, so this is a literal first-launch experience.
Re-install from TestFlight.

### A1. Splash screen

- [ ] App opens to the SP monogram splash (gold circle + "SP" text + "STICK PICKS / EST. 2025" wordmark + gold pulsing lines above/below)
- [ ] Splash holds ~2.8 seconds without visible jank
- [ ] SP monogram is NOT cropped or cut off on any edge
- [ ] Gold lines subtly pulse (opacity fades in and out)
- [ ] Fade-out is smooth, not abrupt
- [ ] No black flash between native launch screen and JS splash
- [ ] No flash of the tab bar or home screen mid-fade

### A2. Age gate (first surface after splash)

- [ ] Age-gate screen appears immediately after splash
- [ ] Headline reads "Are you 21 years of age or older?"
- [ ] "Yes, I am 21+" button and "No" button both visible
- [ ] Legal disclosure text visible under buttons
- [ ] Tap "No" → blocked screen appears, cannot proceed
- [ ] Blocked screen: "You must be 21 years of age or older to use Stick Picks."
- [ ] Force-quit and re-open app: blocked screen persists (age-gate state remembers)
- [ ] Uninstall + reinstall: age gate re-appears from scratch

**Reset for remaining tests:** uninstall + reinstall, then tap Yes on age gate.

### A3. Auth — Login screen

- [ ] Login screen appears after confirming 21+
- [ ] "Sign in with Apple" button visible and tappable
- [ ] "Sign in with Google" button visible and tappable
- [ ] "Continue as Guest" link visible
- [ ] Privacy Policy + Terms links at bottom are tappable and open readable content

### A4. Google Sign-In flow

- [ ] Tap "Sign in with Google" → system sheet appears
- [ ] After consenting → returns to app, lands on Home tab
- [ ] Profile avatar (top right or profile tab) shows Google picture or initials fallback
- [ ] Profile name shows Google full name

### A5. Apple Sign-In flow

Sign out from Profile first, then:

- [ ] Tap "Sign in with Apple" → Apple system sheet appears
- [ ] Choosing "Hide My Email" → returns to app successfully
- [ ] Choosing "Share My Email" → returns to app successfully
- [ ] Profile shows Apple-provided name (or initials fallback if user chose to hide name)

### A6. Guest mode

Sign out, then:

- [ ] Tap "Continue as Guest" → lands on Home tab
- [ ] Profile tab shows "Guest Mode" with no email
- [ ] Scanner permits scans but counts against a 5-scan guest quota
- [ ] Sign-out is still available (returns to login screen)

---

## Section B — Home tab

- [ ] Tab bar visible at bottom with 5 tabs: Home, Browse, Humidor, Profile (and/or other tabs; count them)
- [ ] Home tab is the default on fresh sign-in
- [ ] Home has a primary "Scan a Cigar" CTA
- [ ] Remaining-scans indicator visible for free user ("X scans left" or similar)
- [ ] Pro users and comped users see NO "scans left" indicator — unlimited implied

---

## Section C — Humidor tab

Start with an empty humidor. Later tests depend on adding items here.

### C1. Empty state

- [ ] Empty-humidor state visible with an encouraging CTA ("Add your first cigar" or similar)
- [ ] "Browse" button or tap-target routes to Browse tab

### C2. Filter chips (B2 regression — must fire fetch on tap)

- [ ] Four (or however many) filter chips visible: Owned, Smoked, Wishlist, All
- [ ] Tapping each chip visibly changes the active state (gold pill, etc.)
- [ ] **List content actually updates** when filter changes (not only on tab-away-and-back)
- [ ] Free users see locked icon on Pro-only filters (Wishlist/Smoked/All)
- [ ] Tapping a locked chip routes to paywall

### C3. Add a cigar from Browse → Humidor

Navigate: Browse → search "Padron" → tap a result → Cigar Detail.

- [ ] "Add to Humidor" button or similar CTA on detail screen
- [ ] Prompts or directly adds as Owned (default)
- [ ] Returns to detail with confirmation
- [ ] Humidor tab now shows that cigar under Owned

### C4. Quantity adjustment

- [ ] `+` button increments quantity, list updates
- [ ] `-` button decrements, floors at 1
- [ ] Humidor total value updates accordingly (if multiple cigars owned)
- [ ] After app relaunch, quantity persists

### C5. Price override (Option A — opt-in)

- [ ] Tap a per-cigar price → opens an editable input OR modal
- [ ] Enter a custom price → saves → display updates
- [ ] Total humidor value updates to reflect override
- [ ] Clearing the override reverts to catalog MSRP

### C6. Acquired date

- [ ] Date-entry modal opens on tap (MM/DD/YY inputs + shortcut chips)
- [ ] "Today" chip fills in today
- [ ] "1 week ago" chip fills in correct relative date
- [ ] Entered date persists across app relaunch

### C7. Multi-size (add another size of same line)

- [ ] "Add another size" button routes to the vitola picker
- [ ] Selecting a new vitola adds a separate row in humidor for that line
- [ ] Both sizes appear under the same line grouping (if grouped) or as discrete rows

### C8. Smoke flow (mark as smoked)

- [ ] Long-press or swipe-action or dedicated button to mark as smoked
- [ ] For multi-vitola line, a size picker inline appears
- [ ] Item moves from Owned → Smoked filter
- [ ] Owned count decrements, Smoked count increments on Profile stats

### C9. Smoke + review flow

- [ ] Smoke action offers "Add review" option
- [ ] Review screen has rating + optional notes
- [ ] Submitting review writes to `cigar_reviews` table
- [ ] Appears in the cigar's detail page under community ratings
- [ ] Own review visible to you on the Smoked filter

### C10. Wishlist

- [ ] Wishlist filter accessible (Pro only)
- [ ] Add-to-wishlist CTA on detail
- [ ] Item appears in Wishlist filter
- [ ] Not counted in "Owned" value totals

### C11. Delete

- [ ] Delete action (swipe, button, or modal) on humidor item
- [ ] Confirmation dialog appears
- [ ] On confirm: item removed from humidor
- [ ] Delete is durable across app relaunch

### C12. Value banner (Owned filter)

- [ ] Banner shows total humidor value in USD (sum of `effectivePriceCents * quantity`)
- [ ] Stick count shown ("12 sticks" etc.)
- [ ] Updates in real-time as quantities change

---

## Section D — Browse tab

### D1. Default state

- [ ] Search bar visible and focusable
- [ ] "Popular Brands" section with 6 brand chips: Padron, Arturo Fuente, Oliva, My Father, Liga Privada, Davidoff
- [ ] "Browse by Strength" with 3 cards: Mild, Medium, Full
- [ ] "Include Cuban Cigars" toggle visible, default OFF

### D2. Search — brand prefix

- [ ] Type "Pad" → list updates (debounced ~300ms)
- [ ] Returns Padron-branded cigars
- [ ] Clear button or X clears the search

### D3. Search — name contains

- [ ] Type "Anniversary" → returns cigars with "Anniversary" anywhere in name (e.g., Padron 1964 Anniversary)

### D4. Search — line contains (B3 regression)

- [ ] Type "Maduro" → returns cigars where `line` field contains Maduro (in addition to brand/name matches)

### D5. Search — vitola contains (B3 regression — Hyde Park case)

- [ ] Type "Hyde Park" → Macanudo Maduro / Hyde Park appears in results
- [ ] Type "Robusto" → multiple cigars with Robusto vitola appear

### D6. Popular brand chip tap

- [ ] Tap "Padron" → results list populates with Padron cigars
- [ ] `query` field reads "Padron"
- [ ] Clear returns to default state

### D7. Browse by Strength

- [ ] Tap "Mild" → filters cigars with strength 1–2
- [ ] Tap "Medium" → strength 3
- [ ] Tap "Full" → strength 4–5
- [ ] Clear returns to default state

### D8. Cuban filter toggle

- [ ] Toggle ON → search results expand to include Cuban-origin cigars
- [ ] Toggle OFF → Cubans hidden again
- [ ] Setting persists across tab-away-and-back (Zustand store)
- [ ] Setting persists across app relaunch? — **document actual behavior** (store is session-scoped intentionally; should reset on cold launch)

### D9. Back-nav preserves state (Patch 3 regression)

- [ ] Search for "Padron" → tap a result → Cigar Detail
- [ ] Tap Back → Browse returns with query "Padron" intact AND results list populated AND Cuban toggle state preserved
- [ ] Tap Clear → back to default state

### D10. Results list rendering

- [ ] Each result card shows: thumbnail (image or initials), line/name, brand, flavor badges, community rating (if ≥1)
- [ ] Image loads (fallback to brand logo or initials if no image_url)
- [ ] Status chips visible if item is in your humidor (owned/smoked/wishlist)

---

## Section E — Scanner flow

### E1. Camera permissions

- [ ] First scan tap triggers iOS camera permission prompt
- [ ] Denying → error state with "enable in Settings" guidance
- [ ] Allowing → camera view opens

### E2. Capture

- [ ] Camera preview shows
- [ ] Shutter button captures a photo
- [ ] Captured preview shows briefly before identification
- [ ] Gallery upload option present and functional

### E3. Identify — happy path

- [ ] Scan a cigar band (Padron, Oliva, etc. — something common)
- [ ] Loading indicator during Claude call
- [ ] Result screen shows top match + 0-3 alternatives
- [ ] Confidence state visible (exact / strong / partial / unknown icon or label)
- [ ] "Add to Humidor" CTA present on match

### E4. Identify — unknown

- [ ] Point camera at an obscure / custom band → result returns "Couldn't identify"
- [ ] Error subtitle: non-scan-limit copy (e.g., "No match found in our database")
- [ ] "Enhance and retry" button present (first failure)
- [ ] "Retake photo" button present
- [ ] "Find It Manually" button present
- [ ] "Suggest a Cigar" button present
- [ ] "Go Home" button present
- [ ] Captured image preview visible on error screen

### E5. Enhance and retry

- [ ] Tap "Enhance and retry" → loading again
- [ ] Second failure also shows "Enhance and retry" (retry 2)
- [ ] Third failure: "Enhance and retry" button HIDDEN, copy changes to "We've tried twice..."
- [ ] "Retake photo" becomes primary button

### E6. Suggest a Cigar

- [ ] Sheet opens with brand / line / vitola / notes fields
- [ ] Brand + line required; submitting blank shows validation
- [ ] Valid submission: success haptic, alert "Thanks! We'll add this..."
- [ ] Row appears in `cigar_submissions` table in Supabase
- [ ] Sheet closes, returns to result or home

### E7. Find It Manually

- [ ] Routes to a manual picker (brand → line → vitola)
- [ ] Choosing a cigar updates the scan's `corrected_cigar_id` in `scan_images`
- [ ] Returns to detail or home

### E8. Scan quota gates (as a FREE user with no Pro)

This requires a fresh guest / free account.

- [ ] Scan 5 times as guest → 6th scan gated at "You've used your 5 free scans" screen
- [ ] Sign up for an account (from guest upgrade path) → limit bumps to 10
- [ ] Scan 5 more times → now at 10 → 11th scan gated at "You've used your 10 free scans"
- [ ] "Go Pro" button routes to paywall
- [ ] Free user sees "Upgrade to Pro for unlimited scans." copy on gate

### E9. Scan quota — Pro bypass

Upgrade to Pro (or use a comped account).

- [ ] Pro user can scan unlimited times
- [ ] No scan-limit dialog ever appears
- [ ] If a 429 fires (rate limit abuse), copy says "Too many scans in a short time — please wait a minute" (NOT "Upgrade to Pro")

### E10. Scan quota — comped bypass

Sign in as `bguillow@gmail.com` or other comped account.

- [ ] Unlimited scans, no quota dialog

### E11. Scan state persistence

- [ ] After a successful scan, Profile → Scans count increments
- [ ] After a successful scan, Streak → Scan streak ticks (toast appears)
- [ ] Home "scans remaining" counter decrements for free users

---

## Section F — Cigar detail screen

Enter by: tap any cigar from Browse or Humidor.

### F1. Hero + metadata

- [ ] Cigar image at top (or brand-logo fallback, or initials)
- [ ] Line name + brand prominent
- [ ] Origin, wrapper, binder, filler, strength, body, size — all visible
- [ ] Description paragraph visible

### F2. Community rating

- [ ] If ≥1 review: average rating + count visible
- [ ] If 0 reviews: "No reviews yet" or similar empty state

### F3. Your rating (if you reviewed it)

- [ ] Your own review visible separately from community
- [ ] Edit your rating available

### F4. Similar Cigars

- [ ] 0-4 similar cigars visible under the hero
- [ ] Cuban toggle visible above strip IF raw pool contains any Cuban SKUs
- [ ] Cuban toggle hidden when pool has no Cubans
- [ ] Toggle ON → Cubans appear instantly (no re-fetch)
- [ ] Tapping similar cigar → scroll resets to top, new detail loads

### F5. Add to Humidor

- [ ] "Owned / Wishlist / Smoked" CTA present
- [ ] Tapping Owned adds to humidor (happy path)
- [ ] Tapping Smoked requires review flow (or skip)
- [ ] Tapping Wishlist requires Pro (free user routes to paywall)

### F6. Back navigation

- [ ] Back button returns to prior surface (Browse search, Humidor list, Scan result)
- [ ] Prior surface preserves state

---

## Section G — Paywall

Accessible via: any locked feature (Wishlist, 11th scan, etc.) or a direct Pro CTA.

### G1. Product load

- [ ] Real prices visible from StoreKit ($2.99/mo, $24.99/yr or localized equivalents)
- [ ] NOT "Products not available" or placeholder text
- [ ] Monthly + Yearly options visible and togglable

### G2. Legal disclosures

- [ ] Subscription terms block visible (auto-renewal, cancellation, charged to Apple ID)
- [ ] Privacy Policy link tappable and opens in-app (or webview)
- [ ] Terms of Use link tappable and opens
- [ ] Streak/Pro feature list visible

### G3. Purchase flow (sandbox testing)

Use a sandbox Apple ID to avoid real charges.

- [ ] Tap Subscribe Monthly → StoreKit sheet
- [ ] Confirm → success haptic, paywall dismisses
- [ ] Pro features immediately unlock (Wishlist filter, unlimited scans)
- [ ] Profile reflects Pro badge (if present)

### G4. Restore purchases

- [ ] "Restore Purchases" link visible
- [ ] Tap → StoreKit restore flow
- [ ] If prior purchase exists: Pro activates, paywall dismisses
- [ ] If no prior purchase: "No purchases to restore" alert

### G5. Cancel flow

- [ ] Cancellation instructions clear on paywall
- [ ] Cancel in App Store settings → entitlement persists until end of period
- [ ] After period ends → Pro features lock

---

## Section H — Profile tab

### H1. Scroll to reach all actions (B1 regression)

- [ ] Entire Profile content scrolls vertically on any device size
- [ ] Can scroll to reveal Sign Out button
- [ ] Can scroll to reveal Privacy + Terms links
- [ ] Can scroll to reveal Delete Account button (non-guest only)

### H2. Avatar

- [ ] Google avatar OR Apple-provided image visible
- [ ] Fallback initials render if no image
- [ ] Tap avatar → photo picker opens
- [ ] Choose new image → upload → avatar updates with cache-busted URL
- [ ] Avatar persists across app relaunch

### H3. Stats

- [ ] "In Humidor", "Smoked", "Scans" counts visible
- [ ] Tapping stats card routes to Humidor with All filter
- [ ] Numbers match your actual humidor state + scan count

### H4. Streak card

- [ ] Three streak types visible (engagement, scan, quiz)
- [ ] Active streaks show current number
- [ ] Empty streaks show 0 or "not started"

### H5. Sign Out

- [ ] Tap Sign Out → immediate sign-out
- [ ] Routes to login screen
- [ ] Signing in again restores profile + humidor

### H6. Delete Account

- [ ] Visible for non-guest users only
- [ ] Confirmation dialog appears
- [ ] Confirm → Supabase Edge Function invocation
- [ ] Successful delete: routes to login, data is wiped
- [ ] Sign in with same email → fresh profile, no prior data

---

## Section I — Streaks feature

### I1. First-activity toast

- [ ] Fresh account scans 1st cigar → "🔥 Scan streak started" toast appears
- [ ] Takes a quiz → "🔥 Quiz streak started" toast appears
- [ ] Opens app next day → "🔥 Streak started — welcome back" engagement toast

### I2. Milestone toasts

Simulate by scanning on multiple consecutive days (or cheating the DB for test).

- [ ] Day 3: "🔥 3-day [type] streak"
- [ ] Day 7: "🔥 One week strong"
- [ ] Day 14: "🔥 Two weeks — impressive"

### I3. Debounce (new — my Phase 2 commit)

- [ ] Scan twice in < 30 seconds → only one toast + one server tick (check PostHog or scan_images timestamps)
- [ ] Open/close app rapidly (triggering AppState 'active') → no storm of engagement ticks

### I4. Runtime validation (new — my Phase 2 commit)

- [ ] Normal tick_streak RPC response → streak state updates correctly
- [ ] (Synthetic test only — admin manually corrupts tick_streak response via DB meddling) → client does NOT crash, logs to Sentry

---

## Section J — Quiz

### J1. Flow

- [ ] Quiz entry from Home or a CTA
- [ ] Hero intro visible with humidor imagery
- [ ] Questions flow sequentially (5-10 questions depending on flow)
- [ ] Each answer moves to next question
- [ ] Progress indicator visible

### J2. Results

- [ ] Loading state renders while computing recommendations
- [ ] Results screen shows 3-5 recommended cigars
- [ ] Each has image, name, brand, strength indicator
- [ ] Cuban toggle visible; toggling updates list
- [ ] Tap recommendation → detail screen

---

## Section K — Cross-cutting / edge cases

### K1. Background / foreground transitions

- [ ] Background app mid-scan → return → doesn't crash
- [ ] Background during paywall → return → state preserved
- [ ] Background during quiz → return → quiz state preserved

### K2. Offline / network failure

- [ ] Airplane mode on → any network action shows a graceful error (not a raw crash)
- [ ] Browse offline → shows cached or "no connection" state
- [ ] Scan offline → error message, no infinite loading

### K3. Deep links

- [ ] `stickpicks://` scheme doesn't crash
- [ ] Tapping a notification (if any) routes correctly

### K4. iPhone SE / small device layout

Run on iPhone SE (simulator or device).

- [ ] Tab bar icons and labels not clipped
- [ ] Home CTA button reachable without excess scroll
- [ ] Profile scrolls (B1 regression applies)
- [ ] Humidor cards legible at small width

### K5. Dark mode consistency

- [ ] All screens render in dark palette
- [ ] No flashes of light / white backgrounds during navigation

### K6. Accessibility

- [ ] All primary buttons ≥44pt tap target
- [ ] VoiceOver reads primary buttons (labels present)
- [ ] Dynamic Type: change iOS text size → app adapts (or gracefully clips)

---

## Section L — Legal screens (in-app)

- [ ] `/legal/privacy` renders full privacy policy
- [ ] `/legal/terms` renders full terms
- [ ] Both scrollable to bottom
- [ ] Back returns to invoking surface

---

## Section M — NEW: Admin gating (Commit A)

Sign in as an admin account (e.g., `bguillow@gmail.com`).

### M1. `useIsAdmin()` positive path

- [ ] After sign-in, the admin entry (Profile tile) appears
- [ ] Tile reads "Admin" or similar
- [ ] Tapping navigates to `/admin`

### M2. `useIsAdmin()` negative path

Sign out, sign in as a regular (non-admin) account.

- [ ] Profile screen does NOT render the Admin tile
- [ ] Even if you manually navigate to `/admin` via deep link, the admin screens render a 403-style "Not authorized" message
- [ ] Supabase REST API direct call to insert into `cigars` → blocked by RLS (403 Forbidden)

---

## Section N — NEW: Admin Add Cigar (Commit C)

### N1. Form fields

- [ ] Brand (required)
- [ ] Line (required)
- [ ] Name (auto-computed from brand + line, editable)
- [ ] Vitola (required)
- [ ] Origin (required, dropdown)
- [ ] Wrapper, Binder, Filler (text or tag inputs)
- [ ] Strength 1-5 (picker)
- [ ] Body 1-5 (picker)
- [ ] Flavors (multi-tag input)
- [ ] Description (textarea)
- [ ] Price USD (cents, numeric)
- [ ] Popularity tier 1-5 (default 3)
- [ ] Photo capture / upload button

### N2. Validation

- [ ] Submitting with missing required field shows inline error
- [ ] Strength outside 1-5 → rejected
- [ ] Negative price → rejected

### N3. Photo capture

- [ ] Tap camera button → iOS camera opens
- [ ] Capture → preview shown in form
- [ ] Gallery option also available
- [ ] Image resizes to ≤1024px max edge, JPEG q=0.8
- [ ] Upload-in-progress indicator while saving

### N4. Successful insert

- [ ] Submit → loading state
- [ ] On success: toast or alert "Cigar added"
- [ ] New row visible in `cigars` table with correct fields + `image_url` set
- [ ] Browse search for that brand returns the new row
- [ ] Cigar detail for that row shows the photo you uploaded

### N5. Edge cases

- [ ] Duplicate insert (same brand/line/vitola) → warning or graceful handle
- [ ] Admin loses connection mid-upload → error message, form retains values
- [ ] Cancel mid-form → confirmation dialog, doesn't lose data accidentally

---

## Section O — NEW: Admin Review Submissions (Commit D)

### O1. List view

- [ ] `/admin/submissions` route shows pending submissions
- [ ] Count badge on entry tile shows pending count
- [ ] Each row: brand / line / vitola / notes / thumbnail of scan photo
- [ ] Sortable by date (newest first by default)
- [ ] Pull-to-refresh updates list

### O2. Approve in-place

- [ ] Tap row → detail sheet with full image + editable cigar-form fields pre-filled from submission
- [ ] Admin edits as needed → Approve button
- [ ] Insert into `cigars` + mark submission merged
- [ ] List refreshes, approved item removed

### O3. Reject in-place

- [ ] Reject button on row
- [ ] Confirmation prompt
- [ ] Mark submission rejected, don't touch `cigars`
- [ ] Row removed from pending list

### O4. Photo reuse

- [ ] Approving a submission optionally carries the scan photo to the new `cigars.image_url` — admin choice
- [ ] OR admin uploads a cleaner photo to replace

---

## Section P — NEW: Admin Edit Cigar (Commit E)

### P1. Entry point

- [ ] From a cigar detail screen, if admin: "Edit" button visible
- [ ] Tap → `/admin/edit-cigar/[id]` pre-filled form

### P2. Update flow

- [ ] Change any field → Save
- [ ] New values reflected immediately in Browse, Detail, Humidor
- [ ] Audit trail (if implemented) logs the change

### P3. Image replace

- [ ] Replace existing image → new image uploads, old URL replaced in cigars row
- [ ] Browse/detail reflect new image on next load

### P4. Delete cigar

- [ ] Admin can delete a cigar row (rare but required)
- [ ] Confirmation dialog + "this will cascade remove from humidors" warning
- [ ] After delete: row gone, referenced humidor rows set to null or deleted depending on cascade rules

---

## Section Q — NEW: Admin Dashboard (Commit F)

### Q1. Stats load

- [ ] Total cigars count
- [ ] Total users (auth.users count)
- [ ] Pending submissions count
- [ ] Scans in last 24h
- [ ] New sign-ups last 7 days

### Q2. Health indicators

- [ ] RPC latency (optional)
- [ ] Recent errors count from Sentry (optional)

### Q3. Refresh

- [ ] Pull-to-refresh updates all numbers
- [ ] Auto-refresh on tab focus

---

## Section R — NEW: Photo-aided identity (Commit G)

### R1. Server-side prompt enhancement

- [ ] Scan a cigar whose `cigars` row has an `image_url` → Claude's prompt includes that reference image
- [ ] Claude response reliably picks the correct candidate
- [ ] Confidence score is higher than before on the same scan

### R2. Scan without reference image

- [ ] Scan a cigar whose `cigars` row has NO `image_url` → edge function falls back to text-only prompt (old behavior)
- [ ] No crash, no change in happy-path behavior

### R3. Telemetry

- [ ] `SCAN_PROMPT_INCLUDED_REF_IMAGE` event (or equivalent) fires when a ref image is attached
- [ ] Match score distribution shifts upward over time (measured post-ship)

---

## Section S — NEW: Admin Invites (Commit I)

### S1. Current admins list

- [ ] `/admin/invites` shows existing admins (email + invited_by + date)
- [ ] Current user is visible in the list

### S2. Add admin

- [ ] Input for new email
- [ ] Validation rejects invalid email formats
- [ ] Submit → INSERT into `comped_users` with `is_admin=true`
- [ ] New admin's next sign-in: they see the Admin tile on Profile

### S3. Remove admin

- [ ] Remove button next to each admin
- [ ] Confirmation (cannot accidentally de-admin yourself, or at least warns)
- [ ] On confirm: `is_admin=false` update
- [ ] Removed admin's next page load: Admin tile disappears

### S4. RLS enforcement

- [ ] Non-admin user tries to UPDATE `comped_users.is_admin=true` via REST → blocked
- [ ] Non-admin user tries to INSERT into `comped_users` → blocked

---

## Section T — Jest unit tests (Commit H)

These are automated, not manual. Run `npm test` — every suite must pass.

- [ ] Existing 9 tests still pass (streaks service, captureSilent)
- [ ] New tests for `useIsAdmin()` hook (admin positive, non-admin negative, RPC failure → false)
- [ ] New tests for admin invites logic (add/remove, RLS enforcement — mocked)
- [ ] New tests for cigar insert validation
- [ ] New tests for photo upload helper (image resize / format)
- [ ] Coverage report shows > 0% on new surfaces (no empty test files)

---

## Section U — Non-functional / performance

Explicit perf budgets with measurement steps. Every budget is informed
by what iOS users will tolerate without complaint; misses mean we
queue a perf fix and re-test.

### U1. Cold-start time

- [ ] Force-quit app. Start stopwatch when tapping icon, stop when
      age gate or home screen is interactive.
- [ ] Target: **< 2.5s** on an iPhone 13 or newer. Accept up to **3.5s** on iPhone SE / older.
- [ ] If > 3.5s: profile with Instruments (Time Profiler), look for blocking JS init or heavy splash-screen assets.

### U2. Splash duration

- [ ] Measured from first paint to fade-out complete.
- [ ] Target: 2.8s hold (intentional) + 450ms fade = **~3.3s total**. Should not exceed 4s.

### U3. Scan round-trip latency

- [ ] Tap shutter → first visible result on screen.
- [ ] Target: **< 6s end-to-end** on good wifi. Accept up to 12s on LTE.
- [ ] Include: image resize + upload + edge function + Anthropic + response parse.
- [ ] If > 12s on wifi: check PostHog STREAK_TICKED / scan-latency logs for outliers, check Anthropic usage dashboard for rate-limit throttling.

### U4. Humidor render with many items

- [ ] Seed a test account with **100 humidor items**. Open Humidor tab.
- [ ] Target: first render **< 800ms**. Scrolling: **60fps sustained** (no dropped frames visible).
- [ ] If jank: check for N+1 queries in `useCommunityRatings` / `useHumidorStatuses`; check `grouped` useMemo complexity.

### U5. Browse search responsiveness

- [ ] Type "padron" rapidly. Watch for input lag.
- [ ] Target: keystrokes register instantly; debounced search fires once at end of burst.
- [ ] Results list should render within **500ms** of the debounced query firing.

### U6. Cigar detail first render

- [ ] Tap a cigar from Browse. Stopwatch tap → content visible.
- [ ] Target: **< 600ms** including image load (with cache), up to **1.5s** cold.
- [ ] Loading state must appear instantly (no blank screen).

### U7. Admin Add Cigar photo upload

- [ ] Capture a photo from camera → tap "Add to catalog" (with a filled form).
- [ ] Target: total roundtrip **< 5s** for the image resize + upload + DB insert.
- [ ] If > 10s: check Storage region, check bucket RLS, check device network quality.

### U8. Admin Dashboard load

- [ ] Open `/admin/dashboard`. Stopwatch tap → stats visible.
- [ ] Target: **< 1.2s**. All four count queries should complete in parallel.

### U9. Memory stability

- [ ] Navigate through: tabs → scan → detail → back → quiz → humidor → admin → 20x.
- [ ] Watch for: memory warnings, slow-downs, janky transitions after minutes of use.
- [ ] Target: no iOS memory warnings, no visible slowdown.
- [ ] If leaks observed: suspect ToastHost listener accumulation (though Set-swap fix should prevent), suspect scan_images URL cache growth.

### U10. Battery / thermal

- [ ] After 10 minutes of active use (scanning + browsing + humidor CRUD), phone should not become noticeably warm, battery shouldn't drop more than 3%.
- [ ] If drains: profile which screen is CPU-hot in Instruments.

---

## Section V — Auto-promote user image submissions (from migration 017)

New trigger behavior: admin seeds a cigar without an image → user
submits a photo → auto-promotes to the canonical image for everyone.
Must not break the pre-existing moderation-queue behavior for cigars
that already have an image.

### V1. Happy path — admin-seeded cigar with no image

- [ ] Admin: Add Cigar form, fill brand/line/vitola/origin, skip photo. Submit. Row created in `cigars` with `image_url=NULL`.
- [ ] Regular user (different device, non-admin account): open the cigar's detail page. Brand-logo fallback renders (no image).
- [ ] Regular user: tap the Add-photo affordance (if present on detail screen), capture a photo, submit.
- [ ] Refresh: cigar now shows the submitted photo. DB check:
  - `cigars.image_url` = submitted URL
  - `cigars.image_status` = 'live'
  - `cigar_image_submissions.status` = 'approved'

### V2. Existing moderation still works — cigar with a live image

- [ ] Pick a cigar that already has `image_url` set + `image_status='live'`.
- [ ] Regular user: submit a replacement photo.
- [ ] Refresh: cigar still shows the original photo. DB check:
  - `cigars.image_url` unchanged
  - `cigar_image_submissions.status` = 'pending'

### V3. Banned cigars never auto-promote

- [ ] Pick a cigar and manually SET `image_status='banned'` via Supabase SQL editor.
- [ ] Regular user: submit a photo for that cigar.
- [ ] Refresh: photo NOT promoted. Submission stays 'pending'.

### V4. Takedown case still auto-promotes (from migration 010)

- [ ] Pick a cigar and manually SET `image_status='takedown'`.
- [ ] Regular user: submit a photo.
- [ ] Refresh: photo promoted. `image_status` flips back to 'live'. Submission is 'approved'.

---

## Section Z — Cross-section sign-off gate

Only tick these after every above section's boxes are green.

- [ ] **All A-L** pre-existing surfaces passed (regression floor)
- [ ] **All M-S** new admin surfaces passed (feature acceptance)
- [ ] **Section T** Jest suite passes in CI
- [ ] **Section U** perf budgets met (or exceptions justified)
- [ ] **Section V** auto-promote trigger behaves correctly (all four cases)
- [ ] No P0 or P1 finding from Compliance Cop persona remains unaddressed
- [ ] No P0 or P1 finding from UX Eyes persona remains unaddressed
- [ ] `npm run typecheck` clean
- [ ] `git status` on scanner-overhaul shows only the commits we planned
- [ ] App Store asset pack (`docs/app-store/`) prerequisites satisfied: public privacy/terms/support URLs live
- [ ] Reviewer demo account created and plugged into ASC

**Only when every box above ticks green do we push scanner-overhaul and kick Build 13.**

---

## What to do when a regression is found

1. **Stop immediately.** Do not continue testing other sections until the failure is triaged.
2. **Record the failure** here in a Notes column or separate file with:
   - Section and step number (e.g., "D5 step 3")
   - Observed behavior vs expected behavior
   - Device + iOS version
   - Screenshot or screen recording
3. **Git bisect if the regression isn't obvious.** `git bisect good <SHA>` on the last known-good commit, `git bisect bad HEAD`.
4. **Fix as a dedicated commit** on scanner-overhaul with a clear message referencing this regression.
5. **Re-run the affected section only** to confirm the fix. If the fix is intrusive, re-run adjacent sections to rule out side effects.
6. **Do not squash regression-fix commits into the feature commits.** They're part of the permanent record.
