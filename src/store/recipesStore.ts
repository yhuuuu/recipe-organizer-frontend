import { create } from 'zustand';
import { Recipe, Cuisine } from '@/types/Recipe';
import { recipeService } from '@/services/recipeService';

interface RecipesState {
  recipes: Recipe[];
  selectedCuisine: Cuisine;
  searchQuery: string;
  isLoading: boolean;
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

  loadRecipes: async () => {
    set({ isLoading: true });
    try {
      const { searchQuery, selectedCuisine } = get();
      // 使用 recipeService 支持搜索和过滤
      const recipes = await recipeService.getAllRecipes(
        searchQuery || undefined,
        selectedCuisine !== 'All' ? selectedCuisine : undefined
      );
      set({ recipes, isLoading: false });
    } catch (error) {
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
    // 重新加载菜谱以应用过滤
    get().loadRecipes();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    // 重新加载菜谱以应用搜索
    get().loadRecipes();
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

