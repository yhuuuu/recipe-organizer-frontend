import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeService } from '@/services/recipeService';
import { authService } from '@/services/authService';
import { Cuisine } from '@/types/Recipe';

interface RecipeForm {
  title: string;
  image: string;
  ingredients: string[];
  steps: string[];
  cuisine: Cuisine;
  sourceUrl: string;
  rating: number;
  isWishlisted: boolean;
}

export function AddRecipe() {
  const navigate = useNavigate();
  const [extractInput, setExtractInput] = useState('');
  const [extractLoading, setExtractLoading] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [recipe, setRecipe] = useState<RecipeForm>({
    title: '',
    image: '',
    ingredients: [],
    steps: [],
    cuisine: 'Chinese',
    sourceUrl: '',
    rating: 0,
    isWishlisted: false
  });
  const [ingredientInput, setIngredientInput] = useState('');
  const [stepInput, setStepInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in
    if (!authService.isAuthenticated()) {
      navigate('/auth');
      return;
    }
  }, [navigate]);

  // Extract recipe from text or URL
  const handleExtract = async () => {
    if (!extractInput.trim()) {
      setExtractError('Please enter recipe content or URL');
      return;
    }

    try {
      setExtractLoading(true);
      setExtractError('');
      const extracted = await recipeService.extractRecipe(extractInput);
      
      // Fill form with extracted data
      setRecipe(prev => ({
        ...prev,
        title: extracted.title || '',
        ingredients: extracted.ingredients || [],
        steps: extracted.steps || [],
        cuisine: extracted.cuisine || 'Chinese',
        image: extracted.image || '',
        sourceUrl: extracted.sourceUrl || extractInput.startsWith('http') ? extractInput : ''
      }));
      setExtractInput(''); // Clear extraction input
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : 'Extraction failed');
    } finally {
      setExtractLoading(false);
    }
  };

  // Add ingredient
  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setRecipe(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, ingredientInput.trim()]
      }));
      setIngredientInput('');
    }
  };

  // Remove ingredient
  const removeIngredient = (index: number) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  // Add step
  const addStep = () => {
    if (stepInput.trim()) {
      setRecipe(prev => ({
        ...prev,
        steps: [...prev.steps, stepInput.trim()]
      }));
      setStepInput('');
    }
  };

  // Remove step
  const removeStep = (index: number) => {
    setRecipe(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  // Save recipe
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipe.title.trim()) {
      setError('Recipe name cannot be empty');
      return;
    }
    
    if (recipe.ingredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }

    if (recipe.steps.length === 0) {
      setError('Please add at least one step');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await recipeService.createRecipe(recipe);
      navigate('/'); // Return to recipe list after successful save
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <h1>Add New Recipe</h1>

      {error && (
        <div style={{ 
          color: '#721c24', 
          marginBottom: '10px', 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px' 
        }}>
          {error}
        </div>
      )}

      {/* Recipe extraction section */}
      <div style={{ 
        marginBottom: '30px', 
        padding: '15px', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '4px' 
      }}>
        <h3>Quick Recipe Extraction (Optional)</h3>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Paste recipe text or URL to automatically extract information:
        </p>
        <textarea
          value={extractInput}
          onChange={(e) => setExtractInput(e.target.value)}
          placeholder="Paste recipe text or enter URL (e.g., https://example.com/recipe)..."
          style={{ 
            width: '100%', 
            height: '100px', 
            padding: '10px', 
            marginBottom: '10px', 
            fontFamily: 'monospace',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
        {extractError && (
          <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>
            {extractError}
          </div>
        )}
        <button
          onClick={handleExtract}
          disabled={extractLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: extractLoading ? 'not-allowed' : 'pointer',
            opacity: extractLoading ? 0.6 : 1
          }}
        >
          {extractLoading ? 'Extracting...' : 'Extract Recipe'}
        </button>
      </div>

      {/* Recipe editing form */}
      <form onSubmit={handleSubmit}>
        {/* Recipe Name */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Recipe Name <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            value={recipe.title}
            onChange={(e) => setRecipe(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter recipe name"
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Cuisine */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Cuisine
          </label>
          <select
            value={recipe.cuisine}
            onChange={(e) => setRecipe(prev => ({ ...prev, cuisine: e.target.value as Cuisine }))}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="Chinese">Chinese</option>
            <option value="Italian">Italian</option>
            <option value="Japanese">Japanese</option>
            <option value="Indian">Indian</option>
            <option value="Mexican">Mexican</option>
            <option value="Thai">Thai</option>
            <option value="French">French</option>
            <option value="Korean">Korean</option>
            <option value="Vietnamese">Vietnamese</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Image URL */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Image URL
          </label>
          <input
            type="url"
            value={recipe.image}
            onChange={(e) => setRecipe(prev => ({ ...prev, image: e.target.value }))}
            placeholder="https://example.com/image.jpg"
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          {recipe.image && (
            <img 
              src={recipe.image} 
              alt="Preview" 
              style={{ 
                width: '100%', 
                maxHeight: '200px', 
                objectFit: 'cover', 
                marginTop: '10px',
                borderRadius: '4px'
              }} 
            />
          )}
        </div>

        {/* Source URL */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Recipe Source
          </label>
          <input
            type="url"
            value={recipe.sourceUrl}
            onChange={(e) => setRecipe(prev => ({ ...prev, sourceUrl: e.target.value }))}
            placeholder="https://example.com/recipe"
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Ingredients */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Ingredients <span style={{ color: 'red' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addIngredient();
                }
              }}
              placeholder="Enter ingredient..."
              style={{ 
                flex: 1, 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <button
              type="button"
              onClick={addIngredient}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Add
            </button>
          </div>
          <div>
            {recipe.ingredients.map((ing, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 12px', 
                  backgroundColor: '#f0f0f0', 
                  marginBottom: '5px', 
                  borderRadius: '4px' 
                }}
              >
                <span style={{ fontSize: '14px' }}>{ing}</span>
                <button
                  type="button"
                  onClick={() => removeIngredient(idx)}
                  style={{ 
                    backgroundColor: '#dc3545', 
                    color: 'white', 
                    border: 'none', 
                    padding: '4px 12px', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Cooking Steps <span style={{ color: 'red' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              value={stepInput}
              onChange={(e) => setStepInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addStep();
                }
              }}
              placeholder="Enter step..."
              style={{ 
                flex: 1, 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <button
              type="button"
              onClick={addStep}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Add
            </button>
          </div>
          <div>
            {recipe.steps.map((step, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 12px', 
                  backgroundColor: '#f0f0f0', 
                  marginBottom: '5px', 
                  borderRadius: '4px' 
                }}
              >
                <span style={{ fontSize: '14px' }}>
                  <strong>{idx + 1}.</strong> {step}
                </span>
                <button
                  type="button"
                  onClick={() => removeStep(idx)}
                  style={{ 
                    backgroundColor: '#dc3545', 
                    color: 'white', 
                    border: 'none', 
                    padding: '4px 12px', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Saving...' : 'Save Recipe'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              opacity: loading ? 0.6 : 1
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddRecipe;
