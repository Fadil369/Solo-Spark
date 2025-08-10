# BrainSAIT Innovation Lab (Unified)

Mobile-first, unified web app that merges and enhances the attached solutions to guide users from idea generation to a shippable, responsive HTML prototype. It includes multilingual support (EN/AR with RTL), gamification, context memory, safe markdown rendering, and pluggable AI integration.

## Highlights

- Mobile-first, responsive UI with TailwindCSS
- EN/AR language toggle with RTL support and persistence
- Gamified progress (XP, levels, achievements, streak placeholder)
- Staged flow: Idea Spark → Story Builder → PRD Creator → Prototype
- Context builder for Story (tone, audience, length, notes)
- Safe markdown rendering (marked + DOMPurify)
- Local storage persistence for theme, language, and progress
- Upload your PRD file for prototype generation or use generated PRD
- Works offline with demo content; real AI via Anthropic when key provided

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Optional: Enable real AI generation (Anthropic Claude)

- Copy `.env.example` to `.env.local` and set `VITE_ANTHROPIC_API_KEY`.
- Without a key, the app falls back to rich demo content.

```bash
cp .env.example .env.local
# edit .env.local and set VITE_ANTHROPIC_API_KEY
```

3. Run the dev server:

```bash
npm run dev
```

Open http://localhost:5173

## How It’s Unified

- Merged UI/UX from `brainsait-react-app.tsx` and the standalone `brainsait-innovation-lab.html`
- Preserved animations, journey cards, notifications, achievements, and progress
- Replaced dynamic Tailwind classes with precomputed variants for reliability
- Secured content display using DOMPurify and proper markdown parsing
- Added a contextual Story builder panel and cleaned stage handoffs
- Implemented mobile-first layouts across sections and controls

## Project Structure

- `src/App.tsx`: Main unified application
- `src/main.tsx`: App bootstrap
- `src/styles.css`: Tailwind + small overrides
- `tailwind.config.js`: Tailwind configuration and custom animations
- `.editorconfig`: Org-aligned formatting
- `.copilot/settings.json`: Optional Copilot metadata preferences

## Environment

- `VITE_ANTHROPIC_API_KEY` for Anthropic Claude (model: `claude-3-5-sonnet-20240620`)
- Requests made to `https://api.anthropic.com/v1/messages` with standard headers

## Notes

- All markdown content from AI is sanitized and rendered safely.
- The Prototype stage generates a fully self-contained, responsive HTML page (downloadable).
- Streak logic is stubbed for simplicity; wire to a scheduler or login to implement real streaks.

## License

Internal BrainSAIT use. 