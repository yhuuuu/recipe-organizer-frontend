import { Recipe } from '@/types/Recipe';
import { authService } from './authService';
import { getDemoRecipes } from '@/data/demoRecipes';

const BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:4000/api';


// Get auth headers for API requests
const getAuthHeaders = (): Record<string, string> => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Thrown when the API rejects the request for auth reasons. Callers on public
 * pages should degrade to the guest experience instead of masking this as
 * "offline" data.
 */
export class AuthRequiredError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthRequiredError';
  }
}

// Handle 401 Unauthorized errors.
// The session is cleared, but we never force a redirect: public pages should
// fall back to the read-only guest demo rather than bouncing the visitor to
// the login screen. Protected routes redirect on their own once the token is gone.
const handle401 = () => {
  if (authService.getToken()) {
    authService.logout();
  }
  throw new AuthRequiredError();
};

async function apiFetch<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const url = `${BASE}${path}`;
  
  try {
    const res = await fetch(url, {
      ...opts,
      headers: getAuthHeaders(),
    });

    // Handle unauthorized access
    if (res.status === 401) {
      handle401();
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      let errorMessage = `Request failed ${res.status} ${res.statusText}`;
      
      try {
        const errorJson = JSON.parse(text);
        errorMessage = errorJson.error || errorJson.errors?.[0]?.msg || errorMessage;
      } catch {
        if (text) errorMessage += `: ${text}`;
      }
      
      throw new Error(errorMessage);
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

// Get all recipes (supports search and filtering)
export async function fetchRecipes(q?: string, cuisine?: string): Promise<Recipe[]> {
  try {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (cuisine && cuisine !== 'All') params.append('cuisine', cuisine);
    
    const queryString = params.toString();
    const path = queryString ? `/recipes?${queryString}` : '/recipes';
    
    const recipes = await apiFetch<any[]>(path);
    // Map MongoDB _id to id for frontend compatibility
    return recipes.map(recipe => ({
      ...recipe,
      id: recipe._id || recipe.id,
    }));
  } catch (err) {
    if (err instanceof AuthRequiredError) throw err;
    console.warn('fetchRecipes failed, falling back to mock data:', err);
    return getMockRecipes();
  }
}

// Get a single recipe
export async function fetchRecipeById(id: string): Promise<Recipe | null> {
  try {
    const recipe = await apiFetch<any>(`/recipes/${id}`);
    // Map MongoDB _id to id for frontend compatibility
    return {
      ...recipe,
      id: recipe._id || recipe.id,
    };
  } catch (err) {
    if (err instanceof AuthRequiredError) throw err;
    console.warn('fetchRecipeById failed, falling back to mock data:', err);
    return getMockRecipes().find((r) => r.id === id) || null;
  }
}

// Create a new recipe
export async function createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt'>): Promise<Recipe> {
  try {
    const createdRecipe = await apiFetch<any>('/recipes', { 
      method: 'POST', 
      body: JSON.stringify(recipe) 
    });
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

// Replace a recipe completely (PUT)
export async function replaceRecipe(id: string, recipe: Omit<Recipe, 'id' | 'createdAt'>): Promise<Recipe> {
  try {
    const updatedRecipe = await apiFetch<any>(`/recipes/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(recipe) 
    });
    // Map MongoDB _id to id for frontend compatibility
    return {
      ...updatedRecipe,
      id: updatedRecipe._id || updatedRecipe.id,
    };
  } catch (err) {
    console.error('Error replacing recipe:', err);
    throw err;
  }
}

// 部分更新菜谱 (PATCH)
export async function updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe> {
  try {
    const updatedRecipe = await apiFetch<any>(`/recipes/${id}`, { 
      method: 'PATCH', 
      body: JSON.stringify(updates) 
    });
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

// Fallback data shared with the guest demo experience
function getMockRecipes(): Recipe[] {
  return getDemoRecipes();
}
