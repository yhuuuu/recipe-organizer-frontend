import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { Recipe } from '@/types/Recipe';
import { RatingStars } from './RatingStars';
import { Badge } from './ui/badge';
import { useRecipesStore } from '@/store/recipesStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';

interface RecipeCardProps {
  recipe: Recipe;
  index?: number;
  onEditClick?: () => void;
}

export function RecipeCard({ recipe, index = 0, onEditClick }: RecipeCardProps) {
  const { toggleWishlistStatus, deleteRecipeById } = useRecipesStore();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlistStatus(recipe.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteRecipeById(recipe.id);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe');
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditClick) {
      onEditClick();
    }
  };

  const handleCardClick = () => {
    navigate(`/recipe/${recipe.id}`);
  };

  const ingredientsPreview = recipe.ingredients.slice(0, 3).join(', ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="bg-card rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
      onClick={handleCardClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800';
          }}
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={handleWishlistToggle}
            className={cn(
              'p-2 rounded-full bg-white/90 backdrop-blur-sm transition-colors',
              recipe.isWishlisted
                ? 'text-red-500'
                : 'text-gray-400 hover:text-red-500'
            )}
          >
            <Heart
              className={cn('w-5 h-5', recipe.isWishlisted && 'fill-current')}
            />
          </button>
          <button
            onClick={handleEdit}
            className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-400 hover:text-blue-500 transition-colors"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
            {recipe.cuisine}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-2 flex-1">
            {recipe.title}
          </h3>
          <ExternalLink className="w-4 h-4 text-muted-foreground ml-2 flex-shrink-0" />
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          Ingredients: {ingredientsPreview}
          {recipe.ingredients.length > 3 && '...'}
        </p>

        <div className="flex items-center justify-between">
          <RatingStars rating={recipe.rating} size="sm" />
          <span className="text-xs text-muted-foreground">
            {recipe.ingredients.length} ingredients
          </span>
        </div>
      </div>
    </motion.div>
  );
}

