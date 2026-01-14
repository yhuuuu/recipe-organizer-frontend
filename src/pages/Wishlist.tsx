import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useRecipesStore } from '@/store/recipesStore';
import { authService } from '@/services/authService';
import { RecipeCard } from '@/components/RecipeCard';

export function Wishlist() {
  const navigate = useNavigate();
  const { loadRecipes, getWishlistedRecipes } = useRecipesStore();
  const wishlistedRecipes = getWishlistedRecipes();
  const user = authService.getCurrentUser();

  useEffect(() => {
    // Check if user is authenticated 
    if (!authService.isAuthenticated()) {
      navigate('/auth');
      return;
    }
    
    loadRecipes();
  }, [loadRecipes, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
            <h1 className="text-4xl font-bold">My Wishlist</h1>
          </div>
          <p className="text-muted-foreground">
            {user.username && <span className="font-medium">{user.username}'s </span>}
            {wishlistedRecipes.length} saved recipe{wishlistedRecipes.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {wishlistedRecipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              Your wishlist is empty. Start adding recipes to save them for later!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistedRecipes.map((recipe, index) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

