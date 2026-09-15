# Virtual companion

Use the **Companion** button in the lower-right corner to opt in. The widget is mounted by `AppLayout`, and works across routes. It is a browser widget; it does not float over other desktop applications.

## Controls

- Drag the character with mouse, pen, or touch. Focus it and use arrow keys for 10px movement.
- Drag the diagonal handle to resize, or use its left/right arrow keys. The settings slider provides another resizing control.
- Use the speech symbol to open chat, the gear to customize, and × to hide. Escape closes the panel.
- Settings include name, warrior/electric character, accent color, size, position locking, sound and animation. Device reduced-motion preferences override animations.
- Optional sound is a short notification tone, not spoken responses. Browsers may suppress audio until a user gesture.

## Modules

`src/components/pet/geometry.ts` clamps the pet into the viewport. `usePetSettings.ts` validates and persists preferences. `PetArt.tsx` contains original layered SVG renditions inspired by the provided references. `VirtualPet.tsx` handles pointer capture and controls. `PetChat.tsx` owns session-only conversations and cancellation; `chat.ts` supplies the network boundary. `pet.css` contains isolated styling and animation states.

Preferences currently use local browser storage. The separately proposed fresh-Supabase account/preferences migration has not been implemented. Chat history is kept only in component memory, survives panel collapse, and clears when the pet is hidden, the page reloads, or the account changes. Requests include at most 12 recent messages. AI has no access to workspace files or notes.

## Cloudflare Pages deployment

The `/api/pet-chat` route is a Pages Function in `functions/api/pet-chat.ts`. Deploy through the Pages Git integration or Wrangler with the root `functions` directory included. Uploading only `dist` through a static dashboard upload does not package the function.

Configure these **server-side** variables for the Pages Function:

| Variable | Value |
| --- | --- |
| `OPENAI_API_KEY` | Secret API key for your OpenAI project |
| `OPENAI_MODEL` | A Responses-compatible text model available to that project |
| `SUPABASE_URL` | The same Supabase project used by the frontend |
| `SUPABASE_ANON_KEY` | That project's public publishable/anon key |

Keep the existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` build variables. Never prefix the AI secret with `VITE_`. The function requires a valid Supabase session, validates message roles and sizes, imposes an output limit, disables response storage, and returns non-cacheable JSON with its own security headers. It never returns raw provider errors.

The function uses the [OpenAI Responses API](https://developers.openai.com/api/docs/guides/text). Set project spending controls and an appropriate Cloudflare rate-limit rule for `/api/pet-chat` before enabling shared production access. Per-user billing quotas are not implemented by this widget.

`npm run dev` serves the widget without Pages Functions. Chat will show an unavailable/configuration message there. For a live local endpoint, build with `npm run build` and run `npx wrangler pages dev dist` from the repository root with the four variables in an untracked `.dev.vars` file. Check `.dev.vars` is ignored before adding any secrets. Set this local origin in Supabase if required by your Auth configuration.

No credentials were added and no production service was deployed as part of this change. Browser tests intercept external auth/chat requests; handler tests exercise validation and response parsing with a controlled network boundary. Live provider and Cloudflare deployment checks require the configured environment.
