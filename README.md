# Recipe Organizer Web Application

A modern, full-featured recipe organizer web application built with React, TypeScript, and MongoDB. Save, organize, and view recipes from online sources with AI-powered extraction.

## Features

- 🍳 **AI-Powered Recipe Extraction** - Automatically extract recipe information from recipe website URLs
- 📸 **Image Upload** - Upload or take photos for recipe covers
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- ⭐ **Rating System** - Rate your favorite recipes
- ❤️ **Wishlist** - Save recipes for later
- 🔍 **Search & Filter** - Find recipes by cuisine, title, or ingredients
- 🎨 **Modern UI** - Built with TailwindCSS and shadcn/ui components
- ✨ **Smooth Animations** - Powered by Framer Motion

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Backend**: MongoDB Atlas
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MongoDB Atlas account (free tier works)

### Installation

1. **Clone or navigate to the project directory**

```bash
cd "Recipe Organizer"
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up MongoDB Atlas**

   - Create a new project at [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create a cluster and database
   - Get your connection string

4. **Configure environment variables**

   Create a `.env` file in the project root:
   
   **For local development:**
   ```env
   VITE_API_BASE_URL=http://localhost:4000/api
   ```
   
   **For production (Netlify):**
   
   Set environment variable in Netlify Dashboard → Site settings → Environment variables:
   ```env
   VITE_API_BASE_URL=https://haohaochifan-api.onrender.com/api
   ```

5. **Set up your backend server**

   You need a separate backend server. The backend should:
   - Connect to your MongoDB Atlas database
   - Provide REST API endpoints for recipes CRUD operations
   - Handle the connection string: `mongodb+srv://username:password@cluster.mongodb.net/recipe-organizer`
   
   **Backend URLs:**
   - Local: `http://localhost:4000`
   - Production: `https://haohaochifan-api.onrender.com`

6. **Start the development server**

```bash
npm run dev
```

7. **Open your browser**

Navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── RecipeCard.tsx
│   ├── AddRecipeModal.tsx
│   ├── RatingStars.tsx
│   └── FilterBar.tsx
├── pages/              # Page components
│   ├── Home.tsx
│   ├── RecipeDetail.tsx
│   └── Wishlist.tsx
├── store/              # Zustand state management
│   └── recipesStore.ts
├── services/           # API and external services
│   ├── recipesApi.ts
│   ├── aiExtractor.ts
│   ├── textExtractor.ts
│   └── backendExtractor.ts
├── types/              # TypeScript type definitions
│   └── Recipe.ts
├── utils/              # Utility functions
│   ├── cn.ts
│   └── parseCuisine.ts
├── App.tsx             # Main app component with routing
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Usage

### Adding a Recipe

1. Click the "Add Recipe" button
2. Paste a recipe URL from any website
3. Click "Extract with AI" to automatically extract recipe information
4. Review and edit the extracted data if needed
5. Click "Save Recipe"

Alternatively, you can manually enter recipe details by clicking "Enter Manually".

### Viewing Recipes

- Browse all recipes on the home page
- Use the filter buttons to filter by cuisine (Chinese, Western, Italian, Japanese, Korean)
- Use the search bar to search by title or ingredient
- Click on any recipe card to view full details

### Rating Recipes

- Click on the star rating on a recipe card or detail page
- Select a rating from 1 to 5 stars
- Ratings are automatically saved

### Wishlist

- Click the heart icon on any recipe to add it to your wishlist
- View all wishlisted recipes on the Wishlist page
- Click the heart again to remove from wishlist

## AI Extraction

The app includes AI-powered extraction for recipe websites.

### How It Works

1. Paste a recipe URL from any website
2. The backend fetches the page content
3. AI analyzes the content and extracts:
   - Recipe title
   - Ingredients list
   - Cooking steps
   - Cuisine type
   - Recipe image

### Setup (Optional)

For enhanced AI extraction, you can configure an OpenAI API key:
- Add to `.env`: `VITE_OPENAI_API_KEY=your-key`
- This enables more accurate recipe parsing from complex web pages

## Mock Data

The app includes mock recipe data that will be used if the backend API is not available. This allows you to see the UI in action immediately after installation.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

### Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Netlify

1. Push your code to GitHub
2. Import your repository in Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables
6. Deploy!

## Future Enhancements

- [ ] User authentication and multi-user support
- [ ] Recipe sharing and social features
- [ ] Meal planning
- [ ] Shopping list generation
- [ ] PDF export
- [ ] Mobile app version
- [ ] Image upload support
- [ ] Recipe categories and tags

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

