import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useRecipesStore } from '@/store/recipesStore';
import { authService } from '@/services/authService';
import { RecipeRow } from '@/components/RecipeRow';

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
            <Heart className="w-7 h-7 text-red-500 fill-current" />
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              My Wishlist
            </h1>
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
            className="lemon-panel px-6 py-16 text-center"
          >
            <p className="font-display text-2xl font-bold">
              Your wishlist is empty. Start adding recipes to save them for later!
            </p>
          </motion.div>
        ) : (
          <div>
            {wishlistedRecipes.map((recipe, index) => (
              <RecipeRow key={recipe.id} recipe={recipe} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

