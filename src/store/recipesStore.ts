import { create } from 'zustand';
import { Recipe, Cuisine } from '@/types/Recipe';
import { recipeService } from '@/services/recipeService';
import { authService } from '@/services/authService';
import { AuthRequiredError } from '@/services/recipesApi';
import { getDemoRecipes } from '@/data/demoRecipes';

let latestLoadRequest = 0;

interface RecipesState {
  recipes: Recipe[];
  selectedCuisine: Cuisine;
  searchQuery: string;
  isLoading: boolean;
  isGuest: boolean;
  loadRecipes: () => Promise<void>;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => Promise<void>;
  editRecipe: (id: string, recipe: Partial<Omit<Recipe, 'id' | 'createdAt'>>) => Promise<void>;
  deleteRecipeById: (id: string) => Promise<void>;
  updateRating: (id: string, rating: number) => Promise<void>;
  toggleWishlistStatus: (id: string) => Promise<void>;
  setSelectedCuisine: (cuisine: Cuisine) => void;
  setSearchQuery: (query: string) => void;
  getFilteredRecipes: () => Recipe[];
  getWishlistedRecipes: () => Recipe[];
}

export const useRecipesStore = create<RecipesState>((set, get) => ({
  recipes: [],
  selectedCuisine: 'All',
  searchQuery: '',
  isLoading: false,
  isGuest: !authService.isAuthenticated(),

  loadRecipes: async () => {
    const requestId = ++latestLoadRequest;

    // Guests browse read-only sample data. Calling the API without a token
    // would return 401 and bounce them straight to the login page.
    if (!authService.isAuthenticated()) {
      set({ recipes: getDemoRecipes(), isLoading: false, isGuest: true });
      return;
    }

    set({ isLoading: true, isGuest: false });
    try {
      const { searchQuery, selectedCuisine } = get();
      const recipes = await recipeService.getAllRecipes(
        searchQuery || undefined,
        selectedCuisine !== 'All' ? selectedCuisine : undefined
      );
      if (requestId === latestLoadRequest) {
        set({ recipes, isLoading: false });
      }
    } catch (error) {
      if (requestId !== latestLoadRequest) return;

      // An expired/invalid session must not kick the visitor to the login
      // page — degrade to the same read-only demo a first-time guest sees.
      if (error instanceof AuthRequiredError) {
        set({ recipes: getDemoRecipes(), isLoading: false, isGuest: true });
        return;
      }

      console.error('Error loading recipes:', error);
      set({ isLoading: false });
    }
  },

  addRecipe: async (recipe) => {
    try {
      const newRecipe = await recipeService.createRecipe(recipe);
      set((state) => ({
        recipes: [newRecipe, ...state.recipes],
      }));
    } catch (error) {
      console.error('Error adding recipe:', error);
      throw error;
    }
  },

  editRecipe: async (id, updates) => {
    try {
      const updatedRecipe = await recipeService.patchRecipe(id, updates as Partial<Recipe>);
      set((state) => ({
        recipes: state.recipes.map((r) =>
          r.id === id ? updatedRecipe : r
        ),
      }));
    } catch (error) {
      console.error('Error editing recipe:', error);
      throw error;
    }
  },

  deleteRecipeById: async (id) => {
    try {
      await recipeService.deleteRecipe(id);
      set((state) => ({
        recipes: state.recipes.filter((r) => r.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  },

  updateRating: async (id, rating) => {
    // Optimistically update the UI
    set((state) => ({
      recipes: state.recipes.map((r) =>
        r.id === id ? { ...r, rating } : r
      ),
    }));

    // Try to update via API
    try {
      const updatedRecipe = await recipeService.updateRating(id, rating);
      set((state) => ({
        recipes: state.recipes.map((r) =>
          r.id === id ? updatedRecipe : r
        ),
      }));
    } catch (error) {
      // If API is not available, the optimistic update is already done
      console.warn('Rating update (using local state only):', error);
    }
  },

  toggleWishlistStatus: async (id) => {
    const recipe = get().recipes.find((r) => r.id === id);
    if (!recipe) return;

    const newWishlistStatus = !recipe.isWishlisted;

    // Optimistically update the UI
    set((state) => ({
      recipes: state.recipes.map((r) =>
        r.id === id ? { ...r, isWishlisted: newWishlistStatus } : r
      ),
    }));

    // Try to update via API
    try {
      const updatedRecipe = await recipeService.toggleWishlist(id, newWishlistStatus);
      set((state) => ({
        recipes: state.recipes.map((r) =>
          r.id === id ? updatedRecipe : r
        ),
      }));
    } catch (error) {
      // If API is not available, the optimistic update is already done
      console.warn('Wishlist update (using local state only):', error);
    }
  },

  setSelectedCuisine: (cuisine) => {
    set({ selectedCuisine: cuisine });
    get().loadRecipes();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  getFilteredRecipes: () => {
    const { recipes, selectedCuisine, searchQuery } = get();
    let filtered = recipes;

    // Filter by cuisine
    if (selectedCuisine !== 'All') {
      filtered = filtered.filter((r) => r.cuisine === selectedCuisine);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.ingredients.some((ing) => ing.toLowerCase().includes(query))
      );
    }

    return filtered;
  },

  getWishlistedRecipes: () => {
    return get().recipes.filter((r) => r.isWishlisted);
  },
}));
