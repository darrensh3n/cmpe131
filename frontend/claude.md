# CLAUDE.md — React Native Mobile Rules

## Always Do First

- **Invoke the `frontend-design` skill** before writing any React Native code, every session, no exceptions.

## Reference Images

- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Local Dev Server

- **Always run the Expo dev server** before taking any screenshots — never screenshot a static file.
- Start the dev server: `npx expo start --web` (serves the app in a browser at `http://localhost:8081`)
- If the server is already running, do not start a second instance.

## Screenshot Workflow

- Puppeteer is installed as a dev dependency (root `node_modules/puppeteer/`). Chrome cache is at `~/.cache/puppeteer/`.
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:8081`
- Screenshots are saved automatically to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten).
- Optional label suffix: `node screenshot.mjs http://localhost:8081 label` → saves as `screenshot-N-label.png`
- `screenshot.mjs` lives in the project root. Use it as-is.
- After screenshotting, read the PNG from `temporary screenshots/` with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

## Output Defaults

- React Native with Expo, TypeScript, functional components only
- All styles via `StyleSheet.create` at the bottom of each file — no inline style objects
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- All layouts must be designed for mobile screen sizes (375px width baseline)

## Brand Assets

- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.

## Anti-Generic Guardrails

- **Colors:** Never use generic defaults. Pick a custom brand color and derive a full palette from it — primary, tints, surfaces, text, status.
- **Shadows:** Never use flat single-value shadows. Use layered, color-tinted shadows with low opacity via `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`, and `elevation`.
- **Typography:** Never use the same font weight for headings and body. Pair a heavy display weight with a lighter body weight. Apply tight `letterSpacing` on large headings, generous `lineHeight` on body text.
- **Gradients:** Use `expo-linear-gradient` with multiple color stops. Add depth through layered gradient overlays.
- **Animations:** Only animate `transform` and `opacity` via `react-native-reanimated`. Never animate layout properties. Use spring-style easing (`withSpring`).
- **Interactive states:** Every `Pressable` / `TouchableOpacity` needs pressed, focused, and disabled visual states. No exceptions.
- **Images:** Add a gradient overlay using `expo-linear-gradient` positioned absolutely over images. Apply color treatment via tinted overlay with reduced opacity.
- **Spacing:** Use intentional, consistent spacing tokens from `constants/spacing.ts` — not arbitrary numbers.
- **Depth:** Surfaces should have a layering system (base → elevated → floating) using shadow and background color variation, not all sitting at the same visual plane.

## Hard Rules

- Do not add screens, components, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not animate layout properties (`width`, `height`, `top`, `left`, etc.) — only `transform` and `opacity`
- Do not use arbitrary or hardcoded color hex values inside components — always reference a token from `constants/colors.ts`
- Do not use `ScrollView` + `.map()` for lists — always use `FlatList` with `keyExtractor`
- Do not use inline style objects in JSX — always use `StyleSheet.create`
