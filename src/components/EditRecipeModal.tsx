import { useState, useEffect, useRef } from 'react';
import { Loader2, Upload, Camera, X } from 'lucide-react';
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

  // 图片上传相关
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // 处理图片文件转换为 Base64
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({ ...formData, image: base64String });
    };
    reader.readAsDataURL(file);
  };

  // 上传图片
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 拍照
  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  // 清除图片
  const handleClearImage = () => {
    setFormData({ ...formData, image: '' });
  };

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
            <label className="block text-sm font-medium mb-2">封面图片</label>
            
            {/* 图片预览 */}
            {formData.image && (
              <div className="relative mb-3">
                <img 
                  src={formData.image} 
                  alt="Recipe preview" 
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800';
                  }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleClearImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* 上传按钮组 */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleUploadClick}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                上传图片
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCameraClick}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                拍照
              </Button>
            </div>

            {/* 隐藏的文件输入 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFile(file);
              }}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFile(file);
              }}
            />

            {/* 或者输入 URL */}
            <div className="mt-2">
              <Input
                type="url"
                value={formData.image.startsWith('data:') ? '' : formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="或粘贴图片 URL"
              />
            </div>
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
