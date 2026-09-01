import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Recipe } from '@/types/Recipe';
import { RatingStars } from './RatingStars';
import { useRecipesStore } from '@/store/recipesStore';
import { cn } from '@/utils/cn';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800';

interface RecipeRowProps {
  recipe: Recipe;
  index?: number;
  onEditClick?: () => void;
  readOnly?: boolean;
}

export function RecipeRow({
  recipe,
  index = 0,
  onEditClick,
  readOnly = false,
}: RecipeRowProps) {
  const { toggleWishlistStatus, deleteRecipeById } = useRecipesStore();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleWishlistToggle = () => toggleWishlistStatus(recipe.id);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;

    setIsDeleting(true);
    try {
      await deleteRecipeById(recipe.id);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe');
      setIsDeleting(false);
    }
  };

  const ingredientsPreview = recipe.ingredients.slice(0, 6).join(', ');

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      // Cap the stagger so a long list does not make the last rows wait seconds.
      transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.3 }}
      className="group relative mb-4 grid grid-cols-1 overflow-hidden rounded-2xl md:min-h-[17rem] md:grid-cols-[2fr_3fr]"
    >
      {/*
        Left — photo. The wrapper is a stretched grid cell, so absolutely
        positioning the image gives it a definite box to fill: it matches the
        text panel's height without its own aspect ratio inflating the row.
      */}
      <div className="relative h-60 w-full md:h-auto">
        <img
          src={recipe.image || FALLBACK_IMAGE}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            const img = e.currentTarget;
            // Guard against an endless loop if the fallback itself fails.
            if (img.src !== FALLBACK_IMAGE) img.src = FALLBACK_IMAGE;
          }}
        />
      </div>
      {/* Right — lemon panel carrying the text */}
      <div className="flex min-w-0 flex-col justify-center bg-primary px-5 py-5 text-primary-foreground sm:px-6">
        <p className="text-[0.65rem] font-bold uppercase tracking-widest opacity-70">
          {recipe.cuisine}
        </p>

        <h3 className="mt-1 font-display text-xl font-bold leading-tight sm:text-2xl">
          {/*
            The pseudo-element stretches this link across the whole card, so the
            card is clickable while the accessibility tree keeps a single link
            instead of a div with a click handler.
          */}
          <Link
            to={`/recipe/${recipe.id}`}
            className="line-clamp-1 rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
          >
            {recipe.title}
          </Link>
        </h3>

        {ingredientsPreview && (
          <p className="mt-1.5 text-sm leading-snug line-clamp-2">
            {ingredientsPreview}
            {recipe.ingredients.length > 6 && '…'}
          </p>
        )}

        <div className="mt-2 flex items-center gap-3">
          <RatingStars rating={recipe.rating} size="sm" />
          <span className="text-[0.7rem] font-medium">
            {recipe.ingredients.length} ingredients
          </span>
        </div>

        {/*
          Actions sit above the stretched link so they stay clickable. They stay
          visible rather than appearing on hover, because hover does not exist
          on touch devices and would strand the buttons there.

          Hidden entirely for guests: the wishlist write fails with a 401 that
          the store swallows, so the heart would appear to work while /wishlist
          bounces them to login and the save is silently lost.
        */}
        {!readOnly && (
          <div className="relative z-10 mt-2 flex items-center gap-0.5 opacity-70 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100">
            <button
              type="button"
              onClick={handleWishlistToggle}
              aria-label={
                recipe.isWishlisted
                  ? `Remove ${recipe.title} from wishlist`
                  : `Add ${recipe.title} to wishlist`
              }
              aria-pressed={recipe.isWishlisted}
              className={cn(
                'rounded-full p-1.5 transition-colors hover:bg-foreground/10',
                recipe.isWishlisted ? 'text-red-600' : 'hover:text-red-600'
              )}
            >
              <Heart className={cn('h-3.5 w-3.5', recipe.isWishlisted && 'fill-current')} />
            </button>

            <button
              type="button"
              onClick={onEditClick}
              aria-label={`Edit ${recipe.title}`}
              className="rounded-full p-1.5 transition-colors hover:bg-foreground/10"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label={`Delete ${recipe.title}`}
              className="rounded-full p-1.5 transition-colors hover:bg-foreground/10 hover:text-red-600 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.article>
  );
}
