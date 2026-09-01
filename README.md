# Haohaochifan — Frontend

Paste a recipe link, let AI read it, and keep the result. A React + TypeScript
single-page app backed by a separate Express/MongoDB API.

- **Live:** https://haohaochifan.netlify.app
- **API:** https://haohaochifan-api.onrender.com
- **Backend repo:** https://github.com/yhuuuu/recipe-organizer-backend

## Features

- **AI recipe extraction** — paste a URL or raw text; the backend scrapes and
  parses it into title, ingredients, steps and cuisine
- **Works without an account** — visitors browse sample recipes and run
  extractions immediately; signing in only adds a saved, searchable collection
- **Export to your device** — save any recipe as an image, PDF or Markdown file,
  no account required
- **Wishlist, ratings, search and cuisine filters** for signed-in users
- **Responsive**, including the iOS Safari quirks that usually break layouts

## Tech stack

React 18 · Vite · TypeScript · TailwindCSS · Zustand · React Router v6 ·
Framer Motion · Vitest + Testing Library

## Getting started

Requires Node.js 18+.

```bash
npm install
```

Create `.env` in the project root:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

In production, set the same variable in Netlify → Site settings → Environment
variables, pointing at `https://haohaochifan-api.onrender.com/api`.

```bash
npm run dev      # http://localhost:5173
npm run build    # tsc && vite build → dist/
npm test         # vitest (watch); npm test -- --run for one pass
```

The app needs the backend running for extraction and for signed-in accounts.
Guests see the bundled sample recipes, so the UI is usable without it.

> `npm run lint` is defined but there is no ESLint config in the repo, so it
> currently fails. Type errors are caught by `npm run build` in the meantime.

## Design system

Three colours only — white, lemon `#f8fc52`, ink black — with Fraunces as the
display face. All of it is defined in `src/index.css`.

**Lemon never carries text.** Against white it measures ~1.10:1 contrast, far
below the 4.5:1 minimum, so it is used exclusively as a fill. Text placed on
lemon is always ink (16.7:1). Links and the `link` button variant use
underlined ink rather than a lemon tint for the same reason.

Two things that are easy to get wrong here:

- **Buttons on lemon must be styled with utilities, not custom classes.**
  tailwind-merge cannot tell that a component-layer class conflicts with the
  `bg-primary` inside a button variant, so the yellow fill survives and wins.
- **Inputs are 16px on phones** (`text-base sm:text-sm`). iOS Safari zooms into
  any focused field smaller than that and never zooms back out.

## Project structure

```
src/
├── components/
│   ├── ui/                  # button, input, dialog, badge
│   ├── RecipeRow.tsx        # full-width row: photo + lemon text panel
│   ├── AddRecipeModal.tsx   # extract, review, export or save
│   ├── EditRecipeModal.tsx
│   ├── FilterBar.tsx        # cuisine chips
│   ├── HeroIllustrations.tsx
│   ├── Footer.tsx           # asset attribution — see Licensing
│   ├── Navigation.tsx
│   ├── RatingStars.tsx
│   └── ProtectedRoute.tsx
├── pages/                   # Home, RecipeDetail, Wishlist, Auth
├── data/demoRecipes.ts      # samples shown to guests
├── store/recipesStore.ts    # Zustand; guest vs authenticated state
├── services/                # API clients, extraction
├── utils/exportRecipe.ts    # image / PDF / Markdown export
└── index.css                # design system: colours, fonts, .pill, .lemon-panel
```

`pages/AddRecipe.tsx` and `pages/EditRecipe.tsx` are older inline-styled screens
still routed at `/add` and `/edit/:id`. Nothing in the UI links to them — adding
and editing happen in modals — and they have not been restyled or made
responsive.

## Guest mode

Guests get a real, working demo rather than a locked door, which means some
state is deliberately client-side only:

- `demoRecipes.ts` supplies the recipe list; filtering happens in the browser
- The cuisine filter derives its options from the loaded data **for guests only**.
  A signed-in user's `recipes` array is already filtered server-side, so
  deriving from it would make every other chip disappear once one was picked.
- Wishlist and delete controls are hidden from guests. The wishlist write fails
  with a 401 that the store swallows, so the heart would appear to work while
  `/wishlist` bounced them to login and the save was silently lost.

## Testing

```bash
npm test -- --run
```

20 tests across the store, the edit modal and the export utilities.

## Deployment

Netlify, building `npm run build` and publishing `dist`. `VITE_API_BASE_URL`
must be set in the dashboard. Pushes to `main` deploy automatically.

The API runs on a free Render instance that sleeps when idle, so the first
extraction after a quiet period can take 30–60 seconds to wake it.

## Licensing of bundled assets

The footer credits are **licence conditions, not decoration**:

- Hero illustrations are Flaticon stickers by **paulalee**, free only with
  visible attribution
- Sample recipe photos come from Wikimedia Commons under **CC BY-SA** (Gerda
  Arendt, HaJunkiyada) and CC0, requiring the author to be named

If an asset is removed, its credit can go with it — not before. Photos from the
original recipe sites are all rights reserved and must not be committed here.
