import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

export function EditRecipe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
  const [loadingRecipe, setLoadingRecipe] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 检查是否已登录
    if (!authService.isAuthenticated()) {
      navigate('/auth');
      return;
    }

    // 加载菜谱数据
    const loadRecipe = async () => {
      if (!id) {
        setError('菜谱 ID 不存在');
        setLoadingRecipe(false);
        return;
      }

      try {
        const data = await recipeService.getRecipe(id);
        if (data) {
          setRecipe({
            title: data.title,
            image: data.image,
            ingredients: data.ingredients,
            steps: data.steps,
            cuisine: data.cuisine,
            sourceUrl: data.sourceUrl || '',
            rating: data.rating,
            isWishlisted: data.isWishlisted
          });
        } else {
          setError('菜谱不存在');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoadingRecipe(false);
      }
    };

    loadRecipe();
  }, [id, navigate]);

  // 添加食材
  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setRecipe(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, ingredientInput.trim()]
      }));
      setIngredientInput('');
    }
  };

  // 移除食材
  const removeIngredient = (index: number) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  // 添加步骤
  const addStep = () => {
    if (stepInput.trim()) {
      setRecipe(prev => ({
        ...prev,
        steps: [...prev.steps, stepInput.trim()]
      }));
      setStepInput('');
    }
  };

  // 移除步骤
  const removeStep = (index: number) => {
    setRecipe(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  // 保存菜谱
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipe.title.trim()) {
      setError('菜谱名称不能为空');
      return;
    }
    
    if (recipe.ingredients.length === 0) {
      setError('请至少添加一个食材');
      return;
    }
    
    if (recipe.steps.length === 0) {
      setError('请至少添加一个步骤');
      return;
    }

    if (!id) {
      setError('菜谱 ID 不存在');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await recipeService.updateRecipe(id, recipe);
      navigate('/'); // 保存成功后返回菜谱列表
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setLoading(false);
    }
  };

  if (loadingRecipe) {
    return (
      <div style={{ 
        maxWidth: '800px', 
        margin: '50px auto', 
        padding: '20px',
        textAlign: 'center' 
      }}>
        <p>加载中...</p>
      </div>
    );
  }

  if (error && !recipe.title) {
    return (
      <div style={{ 
        maxWidth: '800px', 
        margin: '50px auto', 
        padding: '20px' 
      }}>
        <div style={{ 
          color: '#721c24', 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <h1>编辑菜谱</h1>

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

      {/* 菜谱编辑表单 */}
      <form onSubmit={handleSubmit}>
        {/* 菜谱名称 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            菜谱名称 <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            value={recipe.title}
            onChange={(e) => setRecipe(prev => ({ ...prev, title: e.target.value }))}
            placeholder="输入菜谱名称"
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* 菜系 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            菜系
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

        {/* 图片 URL */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            图片 URL
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
              alt="预览" 
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

        {/* 源 URL */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            菜谱来源
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

        {/* 食材 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            食材 <span style={{ color: 'red' }}>*</span>
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
              placeholder="输入食材..."
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
              添加
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
                  删除
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 步骤 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            烹饪步骤 <span style={{ color: 'red' }}>*</span>
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
              placeholder="输入步骤..."
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
              添加
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
                  删除
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 按钮 */}
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
            {loading ? '保存中...' : '保存修改'}
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
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditRecipe;
