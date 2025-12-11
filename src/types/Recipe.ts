export type Cuisine = 'Chinese' | 'Western' | 'Italian' | 'Japanese' | 'Korean' | 'All';

export interface Recipe {
  id: string;
  title: string;
  image: string;
  ingredients: string[];
  steps: string[];
  cuisine: Cuisine;
  sourceUrl: string;
  rating: number;
  isWishlisted: boolean;
  createdAt: string;
}

export interface ExtractedRecipe {
  title: string;
  image: string;
  ingredients: string[];
  steps: string[];
  cuisine: Cuisine;
}

