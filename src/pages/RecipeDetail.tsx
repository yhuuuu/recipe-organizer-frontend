import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ExternalLink, Edit, Trash2, Download, Printer, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRecipesStore } from '@/store/recipesStore';
import { authService } from '@/services/authService';
import { RatingStars } from '@/components/RatingStars';
import { EditRecipeModal } from '@/components/EditRecipeModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Recipe } from '@/types/Recipe';
import { fetchRecipeById, AuthRequiredError } from '@/services/recipesApi';
import { findDemoRecipe } from '@/data/demoRecipes';
import { downloadRecipeAsMarkdown, printRecipe, saveRecipeAsImage } from '@/utils/exportRecipe';

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateRating, toggleWishlistStatus, deleteRecipeById, recipes } = useRecipesStore();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    const loadRecipe = async () => {
      if (!id) return;

      // Try to find in store first
      const foundRecipe = recipes.find((r) => r.id === id);
      if (foundRecipe) {
        setRecipe(foundRecipe);
        setIsLoading(false);
        return;
      }

      // Guests only ever see the read-only sample recipes.
      if (!authService.isAuthenticated()) {
        setRecipe(findDemoRecipe(id));
        setIsLoading(false);
        return;
      }

      // Otherwise fetch from API
      try {
        const fetchedRecipe = await fetchRecipeById(id);
        setRecipe(fetchedRecipe);
      } catch (error) {
        // Session expired: fall back to the guest demo instead of a redirect.
        if (error instanceof AuthRequiredError) {
          setRecipe(findDemoRecipe(id));
        } else {
          console.error('Error loading recipe:', error);
        }
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

  const handleSaveImage = async () => {
    setIsSavingImage(true);
    try {
      await saveRecipeAsImage(recipe);
    } catch (error) {
      console.error('Error saving recipe image:', error);
      alert('Could not create the image. Please try the PDF option instead.');
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleRatingChange = async (rating: number) => {    await updateRating(recipe.id, rating);
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
          <div className="rounded-3xl border-2 relative h-96 overflow-hidden border-foreground/25 mb-8">
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
                <h1 className="font-display text-5xl font-bold mb-4">{recipe.title}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <Badge
                    variant="secondary"
                    className="pill bg-primary px-4 py-1 text-base font-semibold text-primary-foreground"
                  >
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
                    aria-label="Open original source"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleSaveImage}
                  disabled={isSavingImage}
                  size="icon"
                  aria-label="Save recipe as image"
                  title="Save as image"
                >
                  {isSavingImage ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ImageIcon className="w-5 h-5" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => printRecipe(recipe)}
                  size="icon"
                  aria-label="Print or save recipe as PDF"
                  title="Print / Save as PDF"
                >
                  <Printer className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => downloadRecipeAsMarkdown(recipe)}
                  size="icon"
                  aria-label="Download recipe as a text file"
                  title="Download text file"
                >
                  <Download className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditModalOpen(true)}
                  size="icon"
                  className={isAuthenticated ? undefined : 'hidden'}
                >
                  <Edit className="w-5 h-5" />
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  size="icon"
                  className={isAuthenticated ? undefined : 'hidden'}
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
            <h2 className="mb-4 flex items-center gap-3 font-display text-3xl font-extrabold tracking-tight">
              Ingredients
            </h2>
            <div className="rounded-3xl border-2 border-foreground bg-card p-6">
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary ring-1 ring-foreground/20" />
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
            <h2 className="mb-4 flex items-center gap-3 font-display text-3xl font-extrabold tracking-tight">
              Instructions
            </h2>
            <div className="rounded-3xl border-2 border-foreground bg-card p-6">
              <ol className="space-y-4">
                {recipe.steps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
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

