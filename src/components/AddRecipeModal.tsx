import { useState, useRef } from 'react';
import { Loader2, Plus, FileText, Upload, Camera, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useRecipesStore } from '@/store/recipesStore';
import { extractRecipeFromUrl } from '@/services/aiExtractor';
import { extractRecipeFromText } from '@/services/textExtractor';
import { extractRecipeFromBackend } from '@/services/backendExtractor';
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

  // Upload picture handling
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle image file and convert to Base64
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({ ...formData, image: base64String });
    };
    reader.readAsDataURL(file);
  };

  // Upload picture
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Take photo
  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  // Clear image
  const handleClearImage = () => {
    setFormData({ ...formData, image: '' });
  };

  const handleExtract = async () => {
    if (inputMode === 'url' && !url.trim()) return;
    if (inputMode === 'text' && !textContent.trim()) return;

    setIsExtracting(true);
    try {
      let extracted: ExtractedRecipe;
      
      if (inputMode === 'text') {
        // Try backend API first
        try {
          console.log('🔵 Attempting backend extraction for text content...');
          extracted = await extractRecipeFromBackend(textContent);
          console.log('✅ Backend extraction successful:', extracted);
        } catch (backendError) {
          console.warn('⚠️ Backend extraction failed, trying fallback methods:', backendError);
          
          // Fallback: Extract from text content directly
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
        }
      } else {
        // Extract from URL
        // Try backend API first for URL
        try {
          console.log('🔵 Attempting backend extraction for URL:', url);
          extracted = await extractRecipeFromBackend('', url);
          console.log('✅ Backend extraction successful:', extracted);
        } catch (backendError) {
          console.warn('⚠️ Backend extraction failed, trying fallback methods:', backendError);
          extracted = await extractRecipeFromUrl(url);
        }
      }
      
      setExtractedData(extracted);
      
      // 确保使用提取的数据填充表单字段
      console.log('🔵 Filling form with extracted data:', {
        title: extracted.title,
        ingredients: extracted.ingredients,
        steps: extracted.steps,
        cuisine: extracted.cuisine,
        image: extracted.image,
      });
      
      setFormData({
        title: extracted.title,
        image: extracted.image,
        ingredients: extracted.ingredients.join('\n'),
        steps: extracted.steps.join('\n'),
        cuisine: extracted.cuisine,
        sourceUrl: inputMode === 'url' ? url : '',
        rating: 0,
      });
      
      console.log('✅ Form data updated successfully');
    } catch (error) {
      console.error('❌ Extraction error:', error);
      alert(`Extraction failed: ${error instanceof Error ? error.message : 'Please try manual input or check the content format'}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleExtractAndSave = async () => {
    if (inputMode === 'url' && !url.trim()) return;
    if (inputMode === 'text' && !textContent.trim()) return;

    setIsExtracting(true);
    try {
      let extracted: ExtractedRecipe;

      if (inputMode === 'text') {
        // Try backend API first
        try {
          console.log('🔵 Attempting backend extraction for text content...');
          extracted = await extractRecipeFromBackend(textContent);
          console.log('✅ Backend extraction successful:', extracted);
        } catch (backendError) {
          console.warn('⚠️ Backend extraction failed, trying fallback methods:', backendError);
          
          extracted = extractRecipeFromText(textContent);
          const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
          if (OPENAI_API_KEY) {
            try {
              const aiExtracted = await extractRecipeFromUrl(`text://${textContent}`);
              if (aiExtracted.ingredients.length > extracted.ingredients.length ||
                  aiExtracted.steps.length > extracted.steps.length) {
                extracted = aiExtracted;
              }
            } catch (e) {
              console.warn('AI extraction failed, using text extraction');
            }
          }
        }
      } else {
        // Try backend API first for URL
        try {
          console.log('🔵 Attempting backend extraction for URL:', url);
          extracted = await extractRecipeFromBackend('', url);
          console.log('✅ Backend extraction successful:', extracted);
        } catch (backendError) {
          console.warn('⚠️ Backend extraction failed, trying fallback methods:', backendError);
          extracted = await extractRecipeFromUrl(url);
        }
      }

      const ingredients = extracted.ingredients.map((i) => i.trim()).filter(Boolean);
      const steps = extracted.steps.map((s) => s.trim()).filter(Boolean);

      console.log('🔵 Saving recipe with data:', {
        title: extracted.title || 'Untitled Recipe',
        ingredients,
        steps,
        cuisine: extracted.cuisine,
      });

      await addRecipe({
        title: extracted.title || 'Untitled Recipe',
        image: extracted.image || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
        ingredients,
        steps,
        cuisine: extracted.cuisine || ('Western' as Cuisine),
        sourceUrl: inputMode === 'url' ? url : '',
        rating: 0,
        isWishlisted: false,
      });

      console.log('✅ Recipe saved successfully');

      // Reset and close
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
      console.error('❌ Extraction+Save error:', error);
      alert(`Extraction or save failed: ${error instanceof Error ? error.message : 'Please try again later or enter manually'}`);
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
            Paste a recipe website URL to extract information automatically, or enter details manually.
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
                  Enter URL
                </Button>
                <Button
                  variant={inputMode === 'text' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInputMode('text')}
                  className="flex-1"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Paste Content
                </Button>
              </div>

              {inputMode === 'url' ? (
                <div>
                  <label className="text-sm font-medium mb-2 block">Recipe URL</label>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="Enter recipe website URL (e.g., rednote, Instagram)"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleExtract();
                      }}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleExtract} disabled={isExtracting || !url.trim()}>
                        {isExtracting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Extracting...
                          </>
                        ) : (
                          'AI Extract'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleExtractAndSave}
                        disabled={isExtracting || !url.trim()}
                      >
                        {isExtracting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'AI Extract and Add'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Paste recipe content (supports rednote, web text, etc.)
                  </label>
                  <textarea
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Paste the complete recipe content, including title, ingredients, instructions, etc..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={handleExtract}
                      disabled={isExtracting || !textContent.trim()}
                      className="flex-1"
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        'AI Extract Recipe'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleExtractAndSave}
                      disabled={isExtracting || !textContent.trim()}
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'AI Extract and Add'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="text-center text-sm text-muted-foreground">or</div>

              <Button
                variant="outline"
                onClick={() => setManualMode(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Manual Input
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
                <label className="text-sm font-medium mb-2 block">Cover Image</label>
                
                {/* Image preview */}
                {formData.image && (
                  <div className="relative mb-3">
                    <img 
                      src={formData.image} 
                      alt="Recipe preview" 
                      className="w-full h-48 object-cover rounded-lg"
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

                {/* Upload button group */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUploadClick}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCameraClick}
                    className="flex-1"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </Button>
                </div>

                {/* Hidden file inputs */}
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

                {/* Or enter URL */}
                <div className="mt-2">
                  <Input
                    type="url"
                    value={formData.image.startsWith('data:') ? '' : formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="or paste image URL"
                  />
                </div>
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

