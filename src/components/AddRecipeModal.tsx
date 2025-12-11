import { useState } from 'react';
import { Loader2, Plus, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useRecipesStore } from '@/store/recipesStore';
import { extractRecipeFromUrl } from '@/services/aiExtractor';
import { extractRecipeFromText } from '@/services/textExtractor';
import { ExtractedRecipe, Cuisine } from '@/types/Recipe';
import { RatingStars } from './RatingStars';

interface AddRecipeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddRecipeModal({ open, onOpenChange }: AddRecipeModalProps) {
  const { addRecipe } = useRecipesStore();
  const [url, setUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedRecipe | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [inputMode, setInputMode] = useState<'url' | 'text'>('url');
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    ingredients: '',
    steps: '',
    cuisine: 'Western' as Cuisine,
    sourceUrl: '',
    rating: 0,
  });

  const handleExtract = async () => {
    if (inputMode === 'url' && !url.trim()) return;
    if (inputMode === 'text' && !textContent.trim()) return;

    setIsExtracting(true);
    try {
      let extracted: ExtractedRecipe;
      
      if (inputMode === 'text') {
        // Extract from text content directly
        extracted = extractRecipeFromText(textContent);
        // Also try AI extraction if OpenAI is available
        const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
        if (OPENAI_API_KEY) {
          try {
            const aiExtracted = await extractRecipeFromUrl(`text://${textContent}`);
            // Use AI result if it's better (has more ingredients/steps)
            if (aiExtracted.ingredients.length > extracted.ingredients.length ||
                aiExtracted.steps.length > extracted.steps.length) {
              extracted = aiExtracted;
            }
          } catch (e) {
            // Fallback to text extraction
            console.warn('AI extraction failed, using text extraction');
          }
        }
      } else {
        // Extract from URL
        extracted = await extractRecipeFromUrl(url);
      }
      
      setExtractedData(extracted);
      setFormData({
        title: extracted.title,
        image: extracted.image,
        ingredients: extracted.ingredients.join('\n'),
        steps: extracted.steps.join('\n'),
        cuisine: extracted.cuisine,
        sourceUrl: inputMode === 'url' ? url : '',
        rating: 0,
      });
    } catch (error) {
      console.error('Extraction error:', error);
      alert('提取失败，请尝试手动输入或检查内容格式。');
    } finally {
      setIsExtracting(false);
    }
  };

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
      alert('Please enter at least one ingredient and one step');
      return;
    }

    try {
      await addRecipe({
        title: formData.title,
        image: formData.image || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
        ingredients,
        steps,
        cuisine: formData.cuisine,
        sourceUrl: formData.sourceUrl || url,
        rating: formData.rating,
        isWishlisted: false,
      });

      // Reset form
      setUrl('');
      setTextContent('');
      setExtractedData(null);
      setFormData({
        title: '',
        image: '',
        ingredients: '',
        steps: '',
        cuisine: 'Western',
        sourceUrl: '',
        rating: 0,
      });
      setManualMode(false);
      setInputMode('url');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe');
    }
  };

  const cuisines: Cuisine[] = ['Chinese', 'Western', 'Italian', 'Japanese', 'Korean'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Recipe</DialogTitle>
          <DialogDescription>
            Paste a URL (website, YouTube, Bilibili, Instagram, or Xiaohongshu video) to extract recipe information automatically, or enter details manually.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!extractedData && !manualMode && (
            <div className="space-y-4">
              {/* Input Mode Toggle */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={inputMode === 'url' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInputMode('url')}
                  className="flex-1"
                >
                  输入链接
                </Button>
                <Button
                  variant={inputMode === 'text' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInputMode('text')}
                  className="flex-1"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  粘贴内容
                </Button>
              </div>

              {inputMode === 'url' ? (
                <div>
                  <label className="text-sm font-medium mb-2 block">Recipe URL</label>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="支持网页、YouTube、Bilibili、Instagram、小红书视频链接"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleExtract();
                      }}
                    />
                    <Button onClick={handleExtract} disabled={isExtracting || !url.trim()}>
                      {isExtracting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          提取中...
                        </>
                      ) : (
                        'AI 提取'
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    粘贴食谱内容（支持小红书、网页文本等）
                  </label>
                  <textarea
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="粘贴完整的食谱内容，包括标题、材料、做法等..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                  />
                  <Button 
                    onClick={handleExtract} 
                    disabled={isExtracting || !textContent.trim()}
                    className="w-full mt-2"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        提取中...
                      </>
                    ) : (
                      'AI 提取食谱'
                    )}
                  </Button>
                </div>
              )}

              <div className="text-center text-sm text-muted-foreground">或</div>

              <Button
                variant="outline"
                onClick={() => setManualMode(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                手动输入
              </Button>
            </div>
          )}

          {(extractedData || manualMode) && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Recipe name"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Image URL</label>
                <Input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Cuisine</label>
                <div className="flex flex-wrap gap-2">
                  {cuisines.map((cuisine) => (
                    <Badge
                      key={cuisine}
                      variant={formData.cuisine === cuisine ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setFormData({ ...formData, cuisine })}
                    >
                      {cuisine}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Ingredients * (one per line)</label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  placeholder="pasta&#10;garlic&#10;heavy cream"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Steps * (one per line)</label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.steps}
                  onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                  placeholder="Boil pasta&#10;Sauté garlic&#10;Add cream"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Rating</label>
                <RatingStars
                  rating={formData.rating}
                  onRatingChange={(rating) => setFormData({ ...formData, rating })}
                  interactive
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  Save Recipe
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setExtractedData(null);
                    setManualMode(false);
                    setUrl('');
                    setTextContent('');
                    setInputMode('url');
                    setFormData({
                      title: '',
                      image: '',
                      ingredients: '',
                      steps: '',
                      cuisine: 'Western',
                      sourceUrl: '',
                      rating: 0,
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

