import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteRecipe, updateRecipe } from '../recipesApi';

// Mock the supabase client module
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '../supabaseClient';

describe('recipesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deleteRecipe', () => {
    it('correctly calls supabase delete method', async () => {
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });

      mockFrom.mockReturnValue({
        delete: mockDelete,
      } as any);

      mockDelete.mockReturnValue({
        eq: mockEq,
      });

      await deleteRecipe('test-id');

      // Verify supabase.from was called with correct table
      expect(mockFrom).toHaveBeenCalledWith('recipes');

      // Verify delete was called
      expect(mockDelete).toHaveBeenCalled();

      // Verify eq was called with correct id
      expect(mockEq).toHaveBeenCalledWith('id', 'test-id');
    });

    it('throws error when supabase returns error', async () => {
      const mockError = new Error('Delete failed');
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: mockError });

      mockFrom.mockReturnValue({
        delete: mockDelete,
      } as any);

      mockDelete.mockReturnValue({
        eq: mockEq,
      });

      await expect(deleteRecipe('test-id')).rejects.toThrow('Delete failed');
    });
  });

  describe('updateRecipe', () => {
    it('calls supabase update method correctly', async () => {
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: 'test-id',
          title: 'Updated Recipe',
          image: '',
          ingredients: ['ingredient 1'],
          steps: ['step 1'],
          cuisine: 'Italian',
          sourceUrl: '',
          rating: 0,
          isWishlisted: false,
          createdAt: '2023-01-01T00:00:00Z',
        },
        error: null,
      });

      mockFrom.mockReturnValue({
        update: mockUpdate,
      } as any);

      mockUpdate.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      const updates = { title: 'Updated Recipe' };
      const result = await updateRecipe('test-id', updates);

      // Verify supabase.from was called with correct table
      expect(mockFrom).toHaveBeenCalledWith('recipes');

      // Verify update was called with updates
      expect(mockUpdate).toHaveBeenCalledWith(updates);

      // Verify eq was called with correct id
      expect(mockEq).toHaveBeenCalledWith('id', 'test-id');

      // Verify select and single were called
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();

      // Verify result
      expect(result.title).toBe('Updated Recipe');
    });

    it('throws error when supabase returns error', async () => {
      const mockError = new Error('Update failed');
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ error: mockError, data: null });

      mockFrom.mockReturnValue({
        update: mockUpdate,
      } as any);

      mockUpdate.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      await expect(
        updateRecipe('test-id', { title: 'Updated' })
      ).rejects.toThrow('Update failed');
    });
  });
});
