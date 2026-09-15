# Virtual Pet Implementation Plan

**Goal:** Add the approved optional, movable virtual pet with two vector characters, settings, animations, and authenticated AI chat.

**Architecture:** React owns a viewport-bounded widget. Geometry, preferences, SVG artwork, chat transport, and UI are separate modules. A Cloudflare Pages Function verifies Supabase authentication before calling OpenAI Responses; credentials remain server-side.

**Tech stack:** Existing React/TypeScript/Vite, SVG/CSS, Fetch, Cloudflare Pages Functions, Playwright.

## Approved design and constraints

- Warrior and electric characters inspired by the supplied references; default width 160px.
- Mouse/touch drag, keyboard movement, resize handle and slider; bounds reapply on viewport resize.
- Idle/thinking/talking states; reduced-motion support; optional notification tone, muted initially.
- Name, character, accent, lock, size, and enabled state persist locally. Account synchronization belongs to the separately discussed fresh-Supabase project and is not yet available.
- Chat is session-only, limited to 12 messages per request, plain-text rendered, abortable, and cleared at account changes.
- AI requires server-side OPENAI_API_KEY, OPENAI_MODEL, SUPABASE_URL, SUPABASE_ANON_KEY. No simulated AI fallback.

## Tasks

- [x] Add browser tests that fail when the widget is absent; cover drag, bounds, settings persistence, cancellation and retry. Run `npm test -- tests/pet.spec.ts`.
- [x] Add `src/components/pet/geometry.ts`, `usePetSettings.ts`, `PetArt.tsx`, and `VirtualPet.tsx`. Mount within `AppLayout`, outside main content. Pointer capture owns drag/resize gestures; keyboard arrows move by 10px; slider spans 96–240px.
- [x] Add `PetChat.tsx`, `chat.ts`, `pet.css` for bounded chat, request abort, error recovery, accessible labels and animation states.
- [x] Add `functions/api/pet-chat.ts` with same-origin/auth checks, strict payload bounds, server-chosen model, 30-second upstream timeout, non-cacheable responses, and no raw provider errors. Test the handler directly with controlled external fetch responses.
- [x] Document deployment and local Function testing. Run build, lint, and Playwright. Inspect desktop/mobile screenshots and fix failures.

## Verification

18 Playwright tests pass, including 7 companion UI/API tests and 11 existing regression tests. Production build, lint, and standalone server TypeScript checks pass. Desktop warrior/chat, electric/settings, and 320px mobile screenshots inspected. Live provider/deployment verification awaits credentials; no external deployment was performed.
