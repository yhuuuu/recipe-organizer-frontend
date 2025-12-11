import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditRecipeModal } from '../EditRecipeModal';
import { useRecipesStore } from '@/store/recipesStore';
import { Recipe } from '@/types/Recipe';

// Mock the store
vi.mock('@/store/recipesStore', () => ({
  useRecipesStore: vi.fn(),
}));

describe('EditRecipeModal', () => {
  const mockRecipe: Recipe = {
    id: '1',
    title: 'Test Recipe',
    image: 'https://example.com/image.jpg',
    ingredients: ['ingredient 1', 'ingredient 2'],
    steps: ['step 1', 'step 2'],
    cuisine: 'Italian',
    sourceUrl: 'https://example.com',
    rating: 4,
    isWishlisted: false,
    createdAt: '2023-01-01T00:00:00Z',
  };

  const mockEditRecipe = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRecipesStore as any).mockReturnValue({
      editRecipe: mockEditRecipe,
    });
  });

  it('submits with valid data and calls editRecipe', async () => {
    const user = userEvent.setup();
    mockEditRecipe.mockResolvedValue(undefined);

    render(
      <EditRecipeModal
        open={true}
        onOpenChange={mockOnOpenChange}
        recipe={mockRecipe}
      />
    );

    // Wait for form to populate
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Recipe')).toBeInTheDocument();
    });

    // Update title
    const titleInput = screen.getByDisplayValue('Test Recipe');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Recipe');

    // Click save button
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    // Verify editRecipe was called with correct data
    await waitFor(() => {
      expect(mockEditRecipe).toHaveBeenCalledWith('1', {
        title: 'Updated Recipe',
        image: 'https://example.com/image.jpg',
        ingredients: ['ingredient 1', 'ingredient 2'],
        steps: ['step 1', 'step 2'],
        cuisine: 'Italian',
        sourceUrl: 'https://example.com',
        isWishlisted: false,
        rating: 4,
      });
    });

    // Verify modal closes after successful save
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('displays validation error for empty title', async () => {
    const user = userEvent.setup();

    render(
      <EditRecipeModal
        open={true}
        onOpenChange={mockOnOpenChange}
        recipe={mockRecipe}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Recipe')).toBeInTheDocument();
    });

    // Clear title
    const titleInput = screen.getByDisplayValue('Test Recipe');
    await user.clear(titleInput);

    // Try to save
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    // Verify alert was called
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Please enter a recipe title');
    });

    // Verify editRecipe was not called
    expect(mockEditRecipe).not.toHaveBeenCalled();
    expect(mockOnOpenChange).not.toHaveBeenCalled();
  });

  it('displays validation error for empty ingredients', async () => {
    const user = userEvent.setup();

    render(
      <EditRecipeModal
        open={true}
        onOpenChange={mockOnOpenChange}
        recipe={mockRecipe}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Recipe')).toBeInTheDocument();
    });

    // Clear ingredients
    const ingredientsInput = screen.getByDisplayValue(/ingredient 1/);
    await user.clear(ingredientsInput);

    // Try to save
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    // Verify alert was called
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        'Please provide at least one ingredient and one step'
      );
    });

    // Verify editRecipe was not called
    expect(mockEditRecipe).not.toHaveBeenCalled();
    expect(mockOnOpenChange).not.toHaveBeenCalled();
  });

  it('displays validation error for empty steps', async () => {
    const user = userEvent.setup();

    render(
      <EditRecipeModal
        open={true}
        onOpenChange={mockOnOpenChange}
        recipe={mockRecipe}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Recipe')).toBeInTheDocument();
    });

    // Clear steps
    const stepsInput = screen.getByDisplayValue(/step 1/);
    await user.clear(stepsInput);

    // Try to save
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    // Verify alert was called
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        'Please provide at least one ingredient and one step'
      );
    });

    // Verify editRecipe was not called
    expect(mockEditRecipe).not.toHaveBeenCalled();
    expect(mockOnOpenChange).not.toHaveBeenCalled();
  });
});
