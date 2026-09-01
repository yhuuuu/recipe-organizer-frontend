import { Recipe } from '@/types/Recipe';

/**
 * Read-only sample recipes shown to visitors who are not signed in, and used
 * as an offline fallback when the API is unreachable.
 */
export function getDemoRecipes(): Recipe[] {
  return [
    {
      id: 'demo-1',
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
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'demo-2',
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
      createdAt: '2024-01-02T00:00:00.000Z',
    },
    {
      id: 'demo-3',
      title: 'Tonkotsu Ramen',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
      ingredients: ['ramen noodles', 'pork belly', 'soft-boiled egg', 'nori', 'scallions', 'miso paste'],
      steps: [
        'Cook ramen noodles according to package',
        'Prepare tonkotsu broth base',
        'Top with sliced pork belly, egg, and nori',
        'Garnish with scallions',
      ],
      cuisine: 'Japanese',
      sourceUrl: 'https://example.com/recipe3',
      rating: 5,
      isWishlisted: true,
      createdAt: '2024-01-03T00:00:00.000Z',
    },
  ];
}

export function findDemoRecipe(id: string): Recipe | null {
  return getDemoRecipes().find((recipe) => recipe.id === id) || null;
}
