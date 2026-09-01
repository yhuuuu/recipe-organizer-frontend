import { Cuisine } from '@/types/Recipe';
import { Button } from './ui/button';
import { useRecipesStore } from '@/store/recipesStore';
import { motion } from 'framer-motion';

const ALL_CUISINES: Cuisine[] = ['All', 'Chinese', 'Western', 'Italian', 'Japanese', 'Korean'];

export function FilterBar() {
  const { selectedCuisine, setSelectedCuisine, recipes, isGuest } = useRecipesStore();

  /*
   * Guests browse a fixed demo set, so offering cuisines that match nothing
   * just hands them a dead end. Narrow the chips to what is actually there.
   *
   * Only for guests: a signed-in user's `recipes` is the server's already
   * filtered response, so deriving from it would make every other chip vanish
   * the moment one is picked, with no way back.
   */
  const cuisines = isGuest
    ? ALL_CUISINES.filter(
        (cuisine) => cuisine === 'All' || recipes.some((recipe) => recipe.cuisine === cuisine)
      )
    : ALL_CUISINES;

  // Filtering is meaningless unless there are at least two cuisines to switch
  // between; "All | Western" is just noise.
  if (cuisines.length < 3) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {cuisines.map((cuisine) => (
        <motion.div
          key={cuisine}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant={selectedCuisine === cuisine ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCuisine(cuisine)}
            aria-pressed={selectedCuisine === cuisine}
            className="pill h-10 px-5 font-medium"
          >
            {cuisine}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

