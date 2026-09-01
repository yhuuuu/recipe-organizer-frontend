import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRecipesStore } from '@/store/recipesStore';
import { authService } from '@/services/authService';
import { RecipeRow } from '@/components/RecipeRow';
import { FilterBar } from '@/components/FilterBar';
import { AddRecipeModal } from '@/components/AddRecipeModal';
import { EditRecipeModal } from '@/components/EditRecipeModal';
import { HeroIllustrations } from '@/components/HeroIllustrations';
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
      <div className="relative container mx-auto px-4 py-8">
        {/* Hero — white, like the reference. Lemon appears only as accent marks. */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 px-2 py-10 sm:px-4 sm:py-16"
        >
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-14">
            <div>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em]">
                Cook. Save. Enjoy.
              </p>
              <h1 className="max-w-4xl font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                {isAuthenticated
                  ? 'Your kitchen, beautifully organized'
                  : 'Any recipe link, clean and readable'}
              </h1>

              {isAuthenticated && user.username ? (
                <p className="mt-6 max-w-xl text-lg">
                  Welcome back, <span className="font-bold">{user.username}</span> — pick up where
                  you left off.
                </p>
              ) : (
                <p className="mt-6 max-w-xl text-lg">
                  Paste a link, let AI do the reading, and keep the result on your phone. No account
                  needed.
                </p>
              )}

              <Button
                onClick={() => setIsModalOpen(true)}
                size="lg"
                className="mt-9 h-14 rounded-full border-[3px] border-primary bg-background px-8 text-base font-semibold text-foreground hover:bg-primary/25 focus-visible:ring-foreground"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {isAuthenticated ? 'Add a recipe' : 'Try AI extraction'}
              </Button>
            </div>

            <HeroIllustrations />
          </div>

          {/* States the guest offer up front, before the sample recipes. */}
          {!isAuthenticated && (
            <dl className="mt-12 grid max-w-2xl grid-cols-2 gap-6 border-t-2 border-foreground/15 pt-8 sm:grid-cols-3">
              <div>
                <dt className="text-[0.7rem] font-bold uppercase tracking-widest opacity-60">
                  Free tries
                </dt>
                <dd className="mt-1.5">
                  <span className="bg-primary px-2 py-0.5 font-display text-lg font-bold">
                    5 / day
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-[0.7rem] font-bold uppercase tracking-widest opacity-60">
                  Sign up
                </dt>
                <dd className="mt-1.5">
                  <span className="bg-primary px-2 py-0.5 font-display text-lg font-bold">
                    Not required
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-[0.7rem] font-bold uppercase tracking-widest opacity-60">
                  Save as
                </dt>
                <dd className="mt-1.5">
                  <span className="bg-primary px-2 py-0.5 font-display text-lg font-bold">
                    Image · PDF
                  </span>
                </dd>
              </div>
            </dl>
          )}
        </motion.div>

        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-3xl border-2 border-foreground px-6 py-5"
          >
            <p className="text-base">
              You're browsing <span className="font-semibold">sample recipes</span>. Try the AI
              extraction and save the result straight to your device —{' '}
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="ink-link"
              >
                sign in
              </button>{' '}
              only if you want a searchable recipe book.
            </p>
          </motion.div>
        )}

        {/* Search + filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="mb-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Fresh flavors for every mood
          </h2>
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title or ingredient..."
              aria-label="Search recipes by title or ingredient"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 rounded-full border-2 border-foreground pl-11"
            />
          </div>
        </motion.div>

        {/* Filter Bar */}
        <FilterBar />

        {/* Recipe list */}
        {isLoading ? (
          <div className="py-20 text-center">
            <p className="font-display text-2xl font-bold">Loading recipes…</p>
          </div>
        ) : recipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border-2 border-foreground px-6 py-16 text-center"
          >
            <p className="mb-6 font-display text-3xl font-extrabold">
              {searchQuery ? 'Nothing matches that search.' : 'No recipes yet.'}
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="pill h-12 px-6 hover:bg-primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add your first recipe
            </Button>
          </motion.div>
        ) : (
          <>
            <p className="mb-2 text-sm text-muted-foreground" aria-live="polite">
              {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} found
            </p>
            {/*
              Full container width. The card's columns are fractional rather
              than a fixed photo width, so the image keeps growing with the
              viewport instead of letting the lemon panel absorb all the space.
            */}
            <div>
              {recipes.map((recipe, index) => (
                <RecipeRow
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
