/**
 * Recipe Service - Unified recipe service interface
 * Includes all recipe-related CRUD operations and authentication handling
 */

import { Recipe } from '@/types/Recipe';
import { 
  fetchRecipes, 
  fetchRecipeById, 
  createRecipe as apiCreateRecipe,
  updateRecipe as apiUpdateRecipe,
  replaceRecipe,
  deleteRecipe as apiDeleteRecipe
} from './recipesApi';
import { extractRecipeFromBackend } from './backendExtractor';

export const recipeService = {
  /**
   * Get all recipes (supports search and filtering)
   * @param q - Search keyword
   * @param cuisine - Cuisine filter (e.g., 'Chinese', 'Italian', 'All')
   * @returns List of recipes
   */
  getAllRecipes: async (q?: string, cuisine?: string): Promise<Recipe[]> => {
    return fetchRecipes(q, cuisine);
  },

  /**
   * Get a single recipe
   * @param id - Recipe ID
   * @returns Recipe details or null
   */
  getRecipe: async (id: string): Promise<Recipe | null> => {
    return fetchRecipeById(id);
  },

  /**
   * Create a new recipe
   * @param recipe - Recipe data (excluding id and createdAt)
   * @returns Created recipe (including generated id)
   */
  createRecipe: async (recipe: Omit<Recipe, 'id' | 'createdAt'>): Promise<Recipe> => {
    return apiCreateRecipe(recipe);
  },

  /**
   * Replace a recipe completely (PUT)
   * @param id - Recipe ID
   * @param recipe - Complete recipe data
   * @returns Updated recipe
   */
  updateRecipe: async (id: string, recipe: Omit<Recipe, 'id' | 'createdAt'>): Promise<Recipe> => {
    return replaceRecipe(id, recipe);
  },

  /**
   * Partially update a recipe (PATCH - only update specified fields)
   * @param id - Recipe ID
   * @param updates - Fields to update
   * @returns Updated recipe
   */
  patchRecipe: async (id: string, updates: Partial<Recipe>): Promise<Recipe> => {
    return apiUpdateRecipe(id, updates);
  },

  /**
   * Update recipe rating
   * @param id - Recipe ID
   * @param rating - Rating (0-5)
   * @returns Updated recipe
   */
  updateRating: async (id: string, rating: number): Promise<Recipe> => {
    return apiUpdateRecipe(id, { rating });
  },

  /**
   * Toggle wishlist status
   * @param id - Recipe ID
   * @param isWishlisted - Whether wishlisted
   * @returns Updated recipe
   */
  toggleWishlist: async (id: string, isWishlisted: boolean): Promise<Recipe> => {
    return apiUpdateRecipe(id, { isWishlisted });
  },

  /**
   * Delete a recipe
   * @param id - Recipe ID
   */
  deleteRecipe: async (id: string): Promise<void> => {
    return apiDeleteRecipe(id);
  },

  /**
   * Extract recipe from text or URL
   * @param textOrUrl - Text content or URL
   * @returns Extracted recipe data
   */
  extractRecipe: async (textOrUrl: string): Promise<any> => {
    const isUrl = textOrUrl.startsWith('http://') || textOrUrl.startsWith('https://');
    
    if (isUrl) {
      // Use URL extraction
      return extractRecipeFromBackend('', textOrUrl);
    } else {
      // Use text extraction
      return extractRecipeFromBackend(textOrUrl);
    }
  }
};

// Export type definition
export type RecipeService = typeof recipeService;
