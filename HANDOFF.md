# QuteNote — Handoff / Status Board
Written: 2026-10-06 (replaces stale April 10 handoff)

## Where things stand
**QuteNote is now an iOS app.** First TestFlight build (1.0 build 1) uploaded to App Store Connect on Oct 6. Watcher script is waiting for Apple processing, then submits beta review and creates the public TestFlight link.

## What shipped Oct 6 (all committed + deployed)
- Capacitor wrapper (apps/web/ios), app ID club.cutenote.app, runs in simulator
- Native app opens straight to sign-in (website keeps landing page), safe-area/status bar handled, mobile nav decluttered
- Sign in with Apple: native button → POST /auth/apple (jose JWKS verify) → appleId on User
- Google sign-in in app: system browser + qutenote:// deep link back (Google blocks webview OAuth)
- Emerald's stamp icon + cream launch screen
- Live DB updated: appleId column + Invite tables (Invite tables were missing since May — invite feature was silently broken in prod, now repaired)
- API deployed to DO: ACTIVE, /auth/apple verified live on cutenote.club

## Apple account facts (QuteNote)
- ASC App ID 6819877820, bundle club.cutenote.app (bundleId resource 58AWMG6XQZ), SKU qutenote-001
- Sign in with Apple capability enabled on bundle ID (PRIMARY_APP_CONSENT)
- Provisioning profile "QuteNote AppStore" installed on this Mac (cert "Apple Distribution: Emam Cohen", NVA7KZQ4G5)
- Same ASC API key as Dreambound: Y5NXGFNCFV (~/.appstoreconnect/private_keys/), issuer a8f9ba85-917d-49e9-888e-e128d4ef6822, team 97276PB95S; key cannot do cloud signing → manual signing export
- scripts/ios/ in repo: asc.js (ASC API helper), exportOptions.plist, qutenote_testflight.js (processing watcher + beta review + public link)

## Build/upload pipeline (per new build)
1. Bump CURRENT_PROJECT_VERSION in apps/web/ios/App/App.xcodeproj (both Debug + Release) — EVERY upload
2. cd apps/web && VITE_API_BASE=https://cutenote.club/api npm run build && npx cap sync ios
3. xcodebuild -project ios/App/App.xcodeproj -scheme App -sdk iphoneos -destination 'generic/platform=iOS' -archivePath <path>.xcarchive CODE_SIGNING_ALLOWED=NO archive
4. xcodebuild -exportArchive -archivePath <path>.xcarchive -exportOptionsPlist scripts/ios/exportOptions.plist -exportPath <dir> -authenticationKeyPath ~/.appstoreconnect/private_keys/AuthKey_Y5NXGFNCFV.p8 -authenticationKeyID Y5NXGFNCFV -authenticationKeyIssuerID a8f9ba85-917d-49e9-888e-e128d4ef6822

## TestFlight status (Oct 7)
- Build 1.0(1) was REJECTED in beta review (most likely cause: no demo account for the sign-in wall; exact reason unread — ASC web session expired before Resolution Center could be checked)
- Fix applied: demo account applereview@cutenote.club / QuteDemo2026! created on live app and attached to betaAppReviewDetail (demoAccountRequired true, note explains physical-goods Stripe exemption 3.1.3(e))
- Apple refuses resubmission of a rejected build (422 BUILD_STATE_NOT_INTERNAL_TESTING) → build 1.0(2) uploaded Oct 7; watcher adds it to the group + submits review when processing finishes
- Public Beta group afef6516-eef8-413d-b7c3-8103aba2b473, PUBLIC LINK: https://testflight.apple.com/join/BRW6MMEJ (activates on approval)
- Beta app description + feedback email set; review contact copied from Dreambound
- If build 2 is also rejected: Emerald must sign into appstoreconnect.apple.com so the Resolution Center message can be read — do that BEFORE further guessing

## Next steps
1. Confirm beta review approved; link goes live automatically — tell Emerald
2. Round 1 on her phone: Apple sign-in and Google sign-in are UNPROVEN on real device — test first
3. Collect ALL feedback before fixing (round protocol); then remaining Phase 5 web work (CN Score, badges, connection birthdays)

## Watch out for
- ~/Documents is iCloud-synced with optimize-storage: after idle months files get evicted → ETIMEDOUT reads. Fix: brctl download <folder>
- Web deploys: DO builds from REPO ROOT; TypeScript strict; prisma generate before tsc (see MEMORY.md "learned the hard way")
- Native build bakes VITE_API_BASE at build time — always set it for iOS builds or API calls hit capacitor://localhost/api and fail
- google-auth.ts hardcodes production API_URL to https://qutenote.com/api (Google OAuth redirect URI) — do not change without updating Google console
