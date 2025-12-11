import { Cuisine } from '@/types/Recipe';
import { Button } from './ui/button';
import { useRecipesStore } from '@/store/recipesStore';
import { motion } from 'framer-motion';

const cuisines: Cuisine[] = ['All', 'Chinese', 'Western', 'Italian', 'Japanese', 'Korean'];

export function FilterBar() {
  const { selectedCuisine, setSelectedCuisine } = useRecipesStore();

  return (
    <div className="flex flex-wrap gap-2 mb-6">
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
            className="rounded-full"
          >
            {cuisine}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

