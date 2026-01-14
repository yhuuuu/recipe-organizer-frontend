import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRecipesStore } from '@/store/recipesStore';
import { authService } from '@/services/authService';
import { RatingStars } from '@/components/RatingStars';
import { EditRecipeModal } from '@/components/EditRecipeModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Recipe } from '@/types/Recipe';
import { fetchRecipeById } from '@/services/recipesApi';

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateRating, toggleWishlistStatus, deleteRecipeById, recipes } = useRecipesStore();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      navigate('/auth');
      return;
    }

    const loadRecipe = async () => {
      if (!id) return;

      // Try to find in store first
      const foundRecipe = recipes.find((r) => r.id === id);
      if (foundRecipe) {
        setRecipe(foundRecipe);
        setIsLoading(false);
        return;
      }

      // Otherwise fetch from API
      try {
        const fetchedRecipe = await fetchRecipeById(id);
        setRecipe(fetchedRecipe);
      } catch (error) {
        console.error('Error loading recipe:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipe();
  }, [id, recipes]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading recipe...</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Recipe not found</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const handleRatingChange = async (rating: number) => {
    await updateRating(recipe.id, rating);
    setRecipe({ ...recipe, rating });
  };

  const handleWishlistToggle = async () => {
    await toggleWishlistStatus(recipe.id);
    setRecipe({ ...recipe, isWishlisted: !recipe.isWishlisted });
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteRecipeById(recipe.id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <EditRecipeModal 
        open={editModalOpen} 
        onOpenChange={setEditModalOpen}
        recipe={recipe}
      />
      <div className="container mx-auto px-4 py-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Image */}
          <div className="relative h-96 rounded-2xl overflow-hidden mb-8 shadow-lg">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800';
              }}
            />
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-4">{recipe.title}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {recipe.cuisine}
                  </Badge>
                  <RatingStars
                    rating={recipe.rating}
                    onRatingChange={handleRatingChange}
                    interactive
                    size="lg"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={recipe.isWishlisted ? 'default' : 'outline'}
                  onClick={handleWishlistToggle}
                  size="icon"
                >
                  <Heart
                    className={`w-5 h-5 ${recipe.isWishlisted ? 'fill-current' : ''}`}
                  />
                </Button>
                {recipe.sourceUrl && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(recipe.sourceUrl, '_blank')}
                    size="icon"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setEditModalOpen(true)}
                  size="icon"
                >
                  <Edit className="w-5 h-5" />
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  size="icon"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <ol className="space-y-4">
                {recipe.steps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 font-semibold">
                      {index + 1}
                    </span>
                    <span className="flex-1 pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

