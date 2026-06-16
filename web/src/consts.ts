// Site-wide constants. Single source of truth for the Astro site.
// Update these as the project evolves; everything else (schema, footer,
// social cards, llms.txt) reads from here.

export const SITE = {
  name: 'Stick Picks',
  tagline: 'The Cigar Collector\u2019s Journal',
  description:
    'Stick Picks is a hobby and lifestyle iOS app for adult cigar collectors. Catalog your humidor, track collection value, and journal your cigars in one reference.',
  url: 'https://stickpicks.app',
  locale: 'en-US',
  supportEmail: 'support@stickpicks.app',
  // Set when the App Store listing is live. Until then, /download routes to a
  // \u201Ccoming soon\u201D state.
  appStoreUrl: '', // e.g. 'https://apps.apple.com/app/stick-picks/id0000000000'
  bundleId: 'com.bobguillow.stickpicks',
  appleTeamId: 'ZNS5TNLB2D',
  // Founder / publisher, used for Person and Organization schema. The
  // /about page is the canonical entity anchor.
  founder: {
    name: 'Bob Guillow',
    role: 'Founder',
    sameAs: [
      // Add LinkedIn / X / GitHub when ready. Empty entries are filtered out
      // before rendering so it\u2019s safe to leave them blank.
      // 'https://www.linkedin.com/in/...',
      // 'https://x.com/...',
    ],
  },
  // Organization-level sameAs, canonical identifiers for the brand entity.
  // Used in OrganizationSchema. Wikidata QID closes the Knowledge-Graph chain.
  orgSameAs: [
    'https://www.wikidata.org/wiki/Q140083289',
  ],
  // Analytics + tracking. All values come from env vars at build time so
  // local builds and forks don't fire analytics.
  analytics: {
    // Google Analytics 4 Measurement ID, e.g. 'G-XXXXXXXXXX'. Set via
    // PUBLIC_GA4_ID at build time. Empty string disables analytics.
    ga4Id: import.meta.env.PUBLIC_GA4_ID ?? '',
    // Google Search Console verification token (the meta tag content
    // value). Set via PUBLIC_GSC_VERIFICATION at build time.
    gscVerification: import.meta.env.PUBLIC_GSC_VERIFICATION ?? '',
    // IndexNow key. Public by design, it's verified by serving the
    // matching <key>.txt file at site root. See public/.
    indexNowKey: import.meta.env.PUBLIC_INDEXNOW_KEY ?? '',
  },
  // Brand colors for the dark luxury aesthetic established in the existing
  // marketing pages and the Expo app.
  theme: {
    bg: '#0A1A0F',
    card: '#122218',
    text: '#E8E2D0',
    muted: '#8F8B78',
    accent: '#C7A24B',
    border: '#2A3E31',
  },
};

export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/features' },
  { label: 'Blog', href: '/articles' },
  { label: 'About', href: '/about' },
  { label: 'Support', href: '/support' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];
