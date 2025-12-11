import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useRecipesStore } from '@/store/recipesStore';
import { Recipe, Cuisine } from '@/types/Recipe';

interface EditRecipeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: Recipe;
}

const CUISINE_OPTIONS: Cuisine[] = ['Chinese', 'Western', 'Italian', 'Japanese', 'Korean'];

export function EditRecipeModal({ open, onOpenChange, recipe }: EditRecipeModalProps) {
  const { editRecipe } = useRecipesStore();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    ingredients: '',
    steps: '',
    cuisine: 'Western' as Cuisine,
    sourceUrl: '',
  });

  // Initialize form data when recipe changes
  useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title,
        image: recipe.image,
        ingredients: recipe.ingredients.join('\n'),
        steps: recipe.steps.join('\n'),
        cuisine: recipe.cuisine,
        sourceUrl: recipe.sourceUrl,
      });
    }
  }, [recipe, open]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a recipe title');
      return;
    }

    const ingredients = formData.ingredients
      .split('\n')
      .map((i) => i.trim())
      .filter(Boolean);
    const steps = formData.steps
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (ingredients.length === 0 || steps.length === 0) {
      alert('Please provide at least one ingredient and one step');
      return;
    }

    setIsSaving(true);
    try {
      await editRecipe(recipe.id, {
        title: formData.title,
        image: formData.image,
        ingredients,
        steps,
        cuisine: formData.cuisine,
        sourceUrl: formData.sourceUrl,
        isWishlisted: recipe.isWishlisted,
        rating: recipe.rating,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating recipe:', error);
      alert('Failed to update recipe. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Recipe</DialogTitle>
          <DialogDescription>Update your recipe information</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Recipe Title</label>
            <Input
              placeholder="Enter recipe title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium mb-2">Image URL</label>
            <Input
              placeholder="https://example.com/image.jpg"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            />
            {formData.image && (
              <div className="mt-2 h-40 rounded-lg overflow-hidden">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800';
                  }}
                />
              </div>
            )}
          </div>

          {/* Cuisine */}
          <div>
            <label className="block text-sm font-medium mb-2">Cuisine Type</label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_OPTIONS.map((c) => (
                <Badge
                  key={c}
                  variant={formData.cuisine === c ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setFormData({ ...formData, cuisine: c })}
                >
                  {c}
                </Badge>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Ingredients (one per line)
            </label>
            <textarea
              className="w-full h-24 p-2 border rounded-md bg-background text-foreground"
              placeholder="Enter ingredients, one per line"
              value={formData.ingredients}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
            />
          </div>

          {/* Steps */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Cooking Steps (one per line)
            </label>
            <textarea
              className="w-full h-24 p-2 border rounded-md bg-background text-foreground"
              placeholder="Enter cooking steps, one per line"
              value={formData.steps}
              onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
            />
          </div>

          {/* Source URL */}
          <div>
            <label className="block text-sm font-medium mb-2">Source URL (Optional)</label>
            <Input
              placeholder="https://example.com/recipe"
              value={formData.sourceUrl}
              onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
