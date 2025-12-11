import { Cuisine } from '@/types/Recipe';

export function parseCuisine(text: string): Cuisine {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('chinese') || lowerText.includes('中餐') || lowerText.includes('中国')) {
    return 'Chinese';
  }
  if (lowerText.includes('italian') || lowerText.includes('pasta') || lowerText.includes('pizza')) {
    return 'Italian';
  }
  if (lowerText.includes('japanese') || lowerText.includes('sushi') || lowerText.includes('ramen')) {
    return 'Japanese';
  }
  if (lowerText.includes('korean') || lowerText.includes('kimchi') || lowerText.includes('kbbq')) {
    return 'Korean';
  }
  if (lowerText.includes('western') || lowerText.includes('american') || lowerText.includes('european')) {
    return 'Western';
  }
  
  return 'Western'; // Default
}

