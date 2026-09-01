import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRecipesStore } from '@/store/recipesStore';
import { authService } from '@/services/authService';
import { RecipeCard } from '@/components/RecipeCard';
import { FilterBar } from '@/components/FilterBar';
import { AddRecipeModal } from '@/components/AddRecipeModal';
import { EditRecipeModal } from '@/components/EditRecipeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Recipe } from '@/types/Recipe';

export function Home() {
  const navigate = useNavigate();
  const { loadRecipes, getFilteredRecipes, setSearchQuery, searchQuery, isLoading, isGuest } =
    useRecipesStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const hasLoadedRecipes = useRef(false);
  const recipes = getFilteredRecipes();
  const isAuthenticated = !isGuest;
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!hasLoadedRecipes.current) {
      hasLoadedRecipes.current = true;
      loadRecipes();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      loadRecipes();
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [loadRecipes, searchQuery]);

  const handleEditClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header with User Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold">{isAuthenticated ? 'My Recipes' : 'Recipe Organizer'}</h1>
            {isAuthenticated && user.username ? (
              <p className="text-muted-foreground mt-1">
                Welcome back, <span className="font-medium text-foreground">{user.username}</span>!
              </p>
            ) : (
              <p className="text-muted-foreground mt-1">
                Paste any recipe link and let AI turn it into a clean, structured recipe.
              </p>
            )}
          </div>
          <Button onClick={() => setIsModalOpen(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            {isAuthenticated ? 'Add Recipe' : 'Try AI Extraction'}
          </Button>
        </motion.div>

        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm"
          >
            <p>
              You're viewing <span className="font-medium">sample recipes</span>. Try the AI
              extraction and download the result to your device —{' '}
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="font-medium text-primary underline underline-offset-4"
              >
                sign in
              </button>{' '}
              only if you want to build a searchable recipe book.
            </p>
          </motion.div>
        )}

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by title or ingredient..."
              aria-label="Search recipes by title or ingredient"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Filter Bar */}
        <FilterBar />

        {/* Recipes Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-muted-foreground">Loading recipes...</div>
          </div>
        ) : recipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-muted-foreground text-lg mb-4">
              {searchQuery ? 'No recipes found matching your search.' : 'No recipes yet.'}
            </p>
            <Button onClick={() => setIsModalOpen(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Recipe
            </Button>
          </motion.div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
              {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} found
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe, index) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  index={index}
                  readOnly={!isAuthenticated}
                  onEditClick={() => handleEditClick(recipe)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <AddRecipeModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      {selectedRecipe && (
        <EditRecipeModal 
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          recipe={selectedRecipe}
        />
      )}
    </div>
  );
}
