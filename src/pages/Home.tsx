import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRecipesStore } from '@/store/recipesStore';
import { RecipeCard } from '@/components/RecipeCard';
import { FilterBar } from '@/components/FilterBar';
import { AddRecipeModal } from '@/components/AddRecipeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Home() {
  const { loadRecipes, getFilteredRecipes, setSearchQuery, searchQuery, isLoading } = useRecipesStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const recipes = getFilteredRecipes();

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
        >
          <h1 className="text-4xl font-bold">My Recipes</h1>
          <Button onClick={() => setIsModalOpen(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Recipe
          </Button>
        </motion.div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe, index) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={index} />
            ))}
          </div>
        )}
      </div>

      <AddRecipeModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}

