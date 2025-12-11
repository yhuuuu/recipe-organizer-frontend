import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRecipesStore } from '../recipesStore';
import * as recipesApi from '@/services/recipesApi';
import { Recipe } from '@/types/Recipe';

// Mock the API
vi.mock('@/services/recipesApi', () => ({
  fetchRecipes: vi.fn(),
  createRecipe: vi.fn(),
  updateRecipe: vi.fn(),
  deleteRecipe: vi.fn(),
  updateRecipeRating: vi.fn(),
  toggleWishlist: vi.fn(),
}));

describe('recipesStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useRecipesStore.getState();
    store.recipes = [];
    store.selectedCuisine = 'All';
    store.searchQuery = '';
    store.isLoading = false;
    vi.clearAllMocks();
  });

  describe('editRecipe', () => {
    it('calls updateRecipe API and updates state', async () => {
      const mockRecipe: Recipe = {
        id: '1',
        title: 'Original Recipe',
        image: 'https://example.com/image.jpg',
        ingredients: ['ingredient 1'],
        steps: ['step 1'],
        cuisine: 'Italian',
        sourceUrl: '',
        rating: 0,
        isWishlisted: false,
        createdAt: '2023-01-01T00:00:00Z',
      };

      const updatedRecipe: Recipe = {
        ...mockRecipe,
        title: 'Updated Recipe',
        ingredients: ['ingredient 1', 'ingredient 2'],
      };

      // Set initial state
      useRecipesStore.setState({ recipes: [mockRecipe] });

      // Mock API response
      vi.mocked(recipesApi.updateRecipe).mockResolvedValue(updatedRecipe);

      // Call editRecipe
      await useRecipesStore.getState().editRecipe('1', {
        title: 'Updated Recipe',
        ingredients: ['ingredient 1', 'ingredient 2'],
      });

      // Verify API was called with correct parameters
      expect(recipesApi.updateRecipe).toHaveBeenCalledWith('1', {
        title: 'Updated Recipe',
        ingredients: ['ingredient 1', 'ingredient 2'],
      });

      // Verify state was updated
      const state = useRecipesStore.getState();
      expect(state.recipes).toHaveLength(1);
      expect(state.recipes[0].title).toBe('Updated Recipe');
      expect(state.recipes[0].ingredients).toEqual(['ingredient 1', 'ingredient 2']);
    });

    it('throws error when API call fails', async () => {
      const mockRecipe: Recipe = {
        id: '1',
        title: 'Test Recipe',
        image: '',
        ingredients: ['ingredient 1'],
        steps: ['step 1'],
        cuisine: 'Italian',
        sourceUrl: '',
        rating: 0,
        isWishlisted: false,
        createdAt: '2023-01-01T00:00:00Z',
      };

      useRecipesStore.setState({ recipes: [mockRecipe] });

      // Mock API to reject
      const error = new Error('API Error');
      vi.mocked(recipesApi.updateRecipe).mockRejectedValue(error);

      // Call editRecipe and expect it to throw
      await expect(
        useRecipesStore.getState().editRecipe('1', { title: 'Updated' })
      ).rejects.toThrow('API Error');

      // Verify state was not updated
      const state = useRecipesStore.getState();
      expect(state.recipes[0].title).toBe('Test Recipe');
    });
  });

  describe('deleteRecipeById', () => {
    it('calls deleteRecipe API and removes recipe from state', async () => {
      const mockRecipes: Recipe[] = [
        {
          id: '1',
          title: 'Recipe 1',
          image: '',
          ingredients: ['ingredient 1'],
          steps: ['step 1'],
          cuisine: 'Italian',
          sourceUrl: '',
          rating: 0,
          isWishlisted: false,
          createdAt: '2023-01-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Recipe 2',
          image: '',
          ingredients: ['ingredient 2'],
          steps: ['step 2'],
          cuisine: 'Chinese',
          sourceUrl: '',
          rating: 0,
          isWishlisted: false,
          createdAt: '2023-01-02T00:00:00Z',
        },
      ];

      // Set initial state
      useRecipesStore.setState({ recipes: mockRecipes });

      // Mock API response
      vi.mocked(recipesApi.deleteRecipe).mockResolvedValue(undefined);

      // Call deleteRecipeById
      await useRecipesStore.getState().deleteRecipeById('1');

      // Verify API was called with correct id
      expect(recipesApi.deleteRecipe).toHaveBeenCalledWith('1');

      // Verify recipe was removed from state
      const state = useRecipesStore.getState();
      expect(state.recipes).toHaveLength(1);
      expect(state.recipes[0].id).toBe('2');
      expect(state.recipes[0].title).toBe('Recipe 2');
    });

    it('throws error when API call fails', async () => {
      const mockRecipe: Recipe = {
        id: '1',
        title: 'Test Recipe',
        image: '',
        ingredients: ['ingredient 1'],
        steps: ['step 1'],
        cuisine: 'Italian',
        sourceUrl: '',
        rating: 0,
        isWishlisted: false,
        createdAt: '2023-01-01T00:00:00Z',
      };

      useRecipesStore.setState({ recipes: [mockRecipe] });

      // Mock API to reject
      const error = new Error('Delete failed');
      vi.mocked(recipesApi.deleteRecipe).mockRejectedValue(error);

      // Call deleteRecipeById and expect it to throw
      await expect(
        useRecipesStore.getState().deleteRecipeById('1')
      ).rejects.toThrow('Delete failed');

      // Verify state was not changed
      const state = useRecipesStore.getState();
      expect(state.recipes).toHaveLength(1);
      expect(state.recipes[0].id).toBe('1');
    });
  });
});
