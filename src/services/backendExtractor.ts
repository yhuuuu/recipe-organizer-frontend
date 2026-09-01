/**
 * Backend API extractor service
 * Calls the backend /api/extract endpoint for recipe extraction
 */

import { ExtractedRecipe } from '@/types/Recipe';
import { parseCuisine } from '@/utils/parseCuisine';
import { authService } from './authService';

const BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:4000/api';

/**
 * Extract recipe using backend API
 * @param text - The text content to extract recipe from (optional if url is provided)
 * @param url - Optional source URL to scrape and extract
 * @returns Extracted recipe data
 */
export async function extractRecipeFromBackend(
  text: string = '', 
  url?: string
): Promise<ExtractedRecipe> {
  console.log('🔵 Calling backend /api/extract...');
  
  // 构建请求体
  const requestBody: { text?: string; url?: string } = {};
  if (url) requestBody.url = url;
  if (text) requestBody.text = text;
  
  console.log('Request data:', url ? { url } : { text: text.substring(0, 200) + '...' });
  
  // 获取 token
  const token = authService.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${BASE}/extract`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('❌ Backend API error:', response.status, errorText);

      // Surface the backend's quota message instead of a generic status error.
      let message = `Backend API error: ${response.status} ${response.statusText}`;
      try {
        const parsed = JSON.parse(errorText);
        if (parsed?.error) message = parsed.error;
      } catch {
        // Non-JSON error body, keep the generic message.
      }

      const error = new Error(message) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }

    const extractedRecipe = await response.json();
    console.log('✅ Received from backend:', extractedRecipe);

    // Validate and normalize the response
    const normalized: ExtractedRecipe = {
      title: extractedRecipe.title || 'Untitled Recipe',
      image: extractedRecipe.image || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
      ingredients: Array.isArray(extractedRecipe.ingredients) 
        ? extractedRecipe.ingredients.filter(Boolean)
        : [],
      steps: Array.isArray(extractedRecipe.steps)
        ? extractedRecipe.steps.filter(Boolean)
        : [],
      cuisine: parseCuisine(extractedRecipe.cuisine || ''),
    };

    console.log('✅ Normalized data:', normalized);
    return normalized;

  } catch (error) {
    // Check for network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('❌ Network error - Backend might not be running:', error);
      throw new Error('Unable to connect to backend server. Please ensure the backend service is running (http://localhost:4000)');
    }

    // Check for CORS errors
    if (error instanceof Error && error.message.includes('CORS')) {
      console.error('❌ CORS error:', error);
      throw new Error('CORS error - Backend needs to configure CORS to allow frontend access');
    }

    console.error('❌ Backend extraction error:', error);
    throw error;
  }
}

/**
 * True when the backend rejected the request because the AI extraction quota
 * was exhausted. Callers should surface the message instead of silently
 * falling back to a lower-quality local parser.
 */
export function isQuotaError(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && (error as { status?: number }).status === 429);
}

/**
 * Check if backend is available
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.warn('Backend health check failed:', error);
    return false;
  }
}
