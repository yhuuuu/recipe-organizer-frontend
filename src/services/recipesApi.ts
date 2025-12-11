import { supabase } from './supabaseClient';
import { Recipe } from '@/types/Recipe';

export async function fetchRecipes(): Promise<Recipe[]> {
  // Return mock data if Supabase is not configured
  if (!supabase) {
    return getMockRecipes();
  }

  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching recipes:', error);
    // Return mock data if Supabase query fails
    return getMockRecipes();
  }
}

export async function fetchRecipeById(id: string): Promise<Recipe | null> {
  // Return mock data if Supabase is not configured
  if (!supabase) {
    const mockRecipes = getMockRecipes();
    return mockRecipes.find(r => r.id === id) || null;
  }

  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    // Try to find in mock data as fallback
    const mockRecipes = getMockRecipes();
    return mockRecipes.find(r => r.id === id) || null;
  }
}

export async function createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt'>): Promise<Recipe> {
  // Return mock recipe if Supabase is not configured
  if (!supabase) {
    return {
      id: Date.now().toString(),
      ...recipe,
      createdAt: new Date().toISOString(),
    };
  }

  try {
    const { data, error } = await supabase
      .from('recipes')
      .insert([{
        ...recipe,
        createdAt: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating recipe:', error);
    // Return mock recipe if Supabase insert fails
    return {
      id: Date.now().toString(),
      ...recipe,
      createdAt: new Date().toISOString(),
    };
  }
}

export async function updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe> {
  // If Supabase is not configured, return updated mock recipe
  if (!supabase) {
    const mockRecipes = getMockRecipes();
    const existingRecipe = mockRecipes.find(r => r.id === id);
    if (!existingRecipe) {
      throw new Error('Recipe not found');
    }
    return { ...existingRecipe, ...updates };
  }

  try {
    const { data, error } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
}

export async function updateRecipeRating(id: string, rating: number): Promise<Recipe> {
  return updateRecipe(id, { rating });
}

export async function toggleWishlist(id: string, isWishlisted: boolean): Promise<Recipe> {
  return updateRecipe(id, { isWishlisted });
}

// Mock data for development
function getMockRecipes(): Recipe[] {
  return [
    {
      id: '1',
      title: 'Creamy Garlic Pasta',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
      ingredients: ['pasta', 'garlic', 'heavy cream', 'butter', 'salt', 'pepper'],
      steps: [
        'Boil pasta according to package instructions',
        'Sauté minced garlic in butter until fragrant',
        'Add heavy cream and bring to a simmer',
        'Combine pasta with sauce and season to taste'
      ],
      cuisine: 'Italian',
      sourceUrl: 'https://example.com/recipe1',
      rating: 4,
      isWishlisted: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Mapo Tofu',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
      ingredients: ['tofu', 'ground pork', 'sichuan peppercorns', 'doubanjiang', 'garlic', 'ginger'],
      steps: [
        'Cut tofu into cubes',
        'Sauté ground pork until browned',
        'Add doubanjiang and aromatics',
        'Add tofu and simmer until flavors meld'
      ],
      cuisine: 'Chinese',
      sourceUrl: 'https://example.com/recipe2',
      rating: 5,
      isWishlisted: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Tonkatsu Ramen',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
      ingredients: ['ramen noodles', 'pork belly', 'soft-boiled egg', 'nori', 'scallions', 'miso paste'],
      steps: [
        'Cook ramen noodles according to package',
        'Prepare tonkatsu broth base',
        'Top with sliced pork belly, egg, and nori',
        'Garnish with scallions'
      ],
      cuisine: 'Japanese',
      sourceUrl: 'https://example.com/recipe3',
      rating: 5,
      isWishlisted: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

