import { Recipe } from '@/types/Recipe';

const BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:4000/api';

async function apiFetch<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      ...opts,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Request failed ${res.status} ${res.statusText}: ${text}`);
    }

    // No content
    if (res.status === 204) return null as unknown as T;

    const data = await res.json().catch(() => null);
    return data as T;
  } catch (err) {
    // Re-throw to let callers decide to fallback to mock data
    throw err;
  }
}

export async function fetchRecipes(): Promise<Recipe[]> {
  try {
    const recipes = await apiFetch<any[]>('/recipes');
    // Map MongoDB _id to id for frontend compatibility
    return recipes.map(recipe => ({
      ...recipe,
      id: recipe._id || recipe.id,
    }));
  } catch (err) {
    console.warn('fetchRecipes failed, falling back to mock data:', err);
    return getMockRecipes();
  }
}

export async function fetchRecipeById(id: string): Promise<Recipe | null> {
  try {
    const recipe = await apiFetch<any>(`/recipes/${id}`);
    // Map MongoDB _id to id for frontend compatibility
    return {
      ...recipe,
      id: recipe._id || recipe.id,
    };
  } catch (err) {
    console.warn('fetchRecipeById failed, falling back to mock data:', err);
    return getMockRecipes().find((r) => r.id === id) || null;
  }
}

export async function createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt'>): Promise<Recipe> {
  try {
    const createdRecipe = await apiFetch<any>('/recipes', { method: 'POST', body: JSON.stringify(recipe) });
    // Map MongoDB _id to id for frontend compatibility
    return {
      ...createdRecipe,
      id: createdRecipe._id || createdRecipe.id,
    };
  } catch (err) {
    console.warn('createRecipe failed, falling back to mock creation:', err);
    return { id: Date.now().toString(), ...recipe, createdAt: new Date().toISOString() } as Recipe;
  }
}

export async function updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe> {
  try {
    const updatedRecipe = await apiFetch<any>(`/recipes/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
    // Map MongoDB _id to id for frontend compatibility
    return {
      ...updatedRecipe,
      id: updatedRecipe._id || updatedRecipe.id,
    };
  } catch (err) {
    console.error('Error updating recipe:', err);
    throw err;
  }
}

export async function updateRecipeRating(id: string, rating: number): Promise<Recipe> {
  return updateRecipe(id, { rating });
}

export async function toggleWishlist(id: string, isWishlisted: boolean): Promise<Recipe> {
  return updateRecipe(id, { isWishlisted });
}

export async function deleteRecipe(id: string): Promise<void> {
  try {
    await apiFetch<void>(`/recipes/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.error('Error deleting recipe via API:', err);
    throw err;
  }
}

// Mock data for development fallback
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
        'Combine pasta with sauce and season to taste',
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
        'Add tofu and simmer until flavors meld',
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
        'Garnish with scallions',
      ],
      cuisine: 'Japanese',
      sourceUrl: 'https://example.com/recipe3',
      rating: 5,
      isWishlisted: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

