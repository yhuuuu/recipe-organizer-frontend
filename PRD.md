# Recipe Organizer Web Application — PRD

## 1. Product Overview

The Recipe Organizer Web App allows users to save, organize, and view recipes collected from online sources (URLs, Instagram posts, Xiaohongshu posts).

The system automatically extracts recipe name, ingredients, steps, and images using AI.

Users can categorize recipes by cuisine, rate them, and add items to a wishlist.

The app will support:

- Web scraping or AI extraction from URLs
- User-uploaded images or manual input
- Recipe tagging + filtering
- Wishlist (favorites)
- Rating system
- Clean, responsive UI

## 2. Target Users

- Home cooks saving online recipes
- Users who frequently browse Instagram/Xiaohongshu food content
- Anyone wanting an organized recipe library

## 3. Core User Stories

### 3.1 Adding Recipes

As a user, I can paste a URL from any website, Instagram, or Xiaohongshu.

The system will auto-extract:

- Recipe name (if detectable)
- Image(s) (if detectable)
- Ingredients list
- Steps
- Cuisine type (if detectable)

If extraction fails, I can edit fields manually.

### 3.2 Viewing Recipes

As a user, I can see all my saved recipes in a grid layout.

Recipe cards show:

- Cover image
- Title
- Source icon (URL)
- Extracted short ingredient preview
- Rating (stars)
- Wishlist icon

### 3.3 Rating Recipes

As a user, I can give each recipe a rating from 1–5 stars.

Rating should be saved and displayed on recipe cards and detail pages.

### 3.4 Filtering & Searching

As a user, I can filter by cuisine:

- Chinese
- Western
- Italian
- Japanese
- Korean
- (Future: Custom cuisine tags)

As a user, I can search recipes by:

- Title
- Ingredient

### 3.5 Wishlist

As a user, I can tap the Heart icon to add/remove a recipe from my wishlist.

A dedicated Wishlist page displays my favorited recipes.

### 3.6 Recipe Detail Page

A full recipe page includes:

- Title
- Image
- Rating (interactive)
- Ingredients
- Steps
- Cuisine tags
- Source URL
- Wishlist toggle

## 4. Technical Requirements

### 4.1 Frontend

- Framework: React + Vite
- Styling: TailwindCSS
- UI Components: shadcn/ui
- Animation: Framer Motion
- State Management: Redux Toolkit or Zustand
- Language: TypeScript

**Key Components**

- RecipeCard
- FilterBar
- AddRecipeModal
- RecipeDetailPage
- WishlistPage
- RatingComponent

### 4.2 Backend

- Option A: Node.js + Express + MongoDB ✅ (Selected)
- Option B: Supabase (Postgres + Auth)

Recommended: MongoDB for flexibility and scalability.

**API Endpoints (if using own backend):**

- POST /recipes/add
- GET /recipes
- GET /recipes/:id
- PATCH /recipes/:id
- PATCH /recipes/:id/rating
- PATCH /recipes/:id/wishlist

### 4.3 Database Schema

**recipes**

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique ID |
| title | string | Recipe name |
| image | string | Cover image URL |
| ingredients | array<string> | Extracted list |
| steps | array<string> | Cooking steps |
| cuisine | string | Chinese / Western / etc |
| sourceUrl | string | Original URL |
| rating | number | 1–5 stars |
| isWishlisted | boolean | True/False |
| createdAt | datetime | |

## 5. AI Extraction Logic

When user submits a URL or posts a screenshot:

1. Fetch page content OR receive text
2. Use LLM to extract:
   - Title
   - Ingredients (clean bullet points)
   - Steps (numbered)
   - Cuisine type
3. Return structured JSON to frontend.

**Example Output:**

```json
{
  "title": "Creamy Garlic Pasta",
  "ingredients": ["pasta", "garlic", "heavy cream", "butter", "salt"],
  "steps": ["Boil pasta", "Sauté garlic", "Add cream", "Combine"],
  "cuisine": "Western",
  "image": "https://...."
}
```

## 6. UI Requirements

### Homepage

- Header with: Title + Add Recipe button
- Filter buttons (All, Chinese, Western, Italian, Japanese, Korean)
- Grid of recipe cards
- Smooth entry animation

### Recipe Card

- Image
- Title
- Source icon
- Short "Detected ingredients…" preview
- 5-star rating display
- Wishlist button

### Recipe Detail Page

- Large image
- Title
- Interactive rating stars
- Ingredients
- Steps
- Cuisine tag
- Link to original URL
- Wishlist toggle

### Wishlist Page

Same grid layout but filtered to only wishlisted recipes.

### Add Recipe Modal

Fields:

- URL input
- OR upload image
- OR manual fields
- "Extract with AI" button
- Preview + Save

## 7. Future Features (Nice-to-Have)

- Meal planner
- Shopping list generation
- Export recipe to PDF
- Mobile app version
- Social sharing

## 8. Acceptance Criteria

- User can successfully save recipes from URLs
- AI extraction returns structured data
- All key UI components visible and functional
- Filters work correctly
- Rating persists
- Wishlist persists
- Fully responsive on mobile/tablet

