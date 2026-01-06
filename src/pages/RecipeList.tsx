import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeService } from '@/services/recipeService';
import { authService } from '@/services/authService';
import { Recipe } from '@/types/Recipe';

export function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    // 检查是否已登录
    if (!authService.isAuthenticated()) {
      navigate('/auth');
      return;
    }
    
    fetchRecipes();
  }, [navigate, searchTerm, cuisine]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getAllRecipes(
        searchTerm || undefined, 
        cuisine !== 'All' ? cuisine : undefined
      );
      setRecipes(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/auth');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个菜谱吗？')) {
      try {
        await recipeService.deleteRecipe(id);
        setRecipes(recipes.filter(r => r.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : '删除失败');
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* 头部：用户信息和登出按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>我的菜谱</h1>
        <div>
          <span>欢迎, {user.username}! </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            登出
          </button>
        </div>
      </div>

      {/* 搜索和过滤 */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="搜索菜谱..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', width: '200px', marginRight: '10px' }}
        />
        <select
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          style={{ padding: '8px', marginRight: '10px' }}
        >
          <option>All</option>
          <option>Chinese</option>
          <option>Italian</option>
          <option>Japanese</option>
          <option>Indian</option>
          <option>Mexican</option>
          <option>Thai</option>
          <option>French</option>
          <option>Korean</option>
          <option>Vietnamese</option>
          <option>Other</option>
        </select>
      </div>

      {/* 添加新菜谱按钮 */}
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        添加菜谱
      </button>

      {/* 错误提示 */}
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {/* 加载状态 */}
      {loading && <p>加载中...</p>}

      {/* 菜谱列表 */}
      {!loading && recipes.length === 0 && <p>还没有菜谱，开始添加吧！</p>}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '20px' 
      }}>
        {recipes.map(recipe => (
          <div key={recipe.id} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s',
          }}>
            {recipe.image && (
              <img 
                src={recipe.image} 
                alt={recipe.title} 
                style={{ 
                  width: '100%', 
                  height: '150px', 
                  objectFit: 'cover', 
                  borderRadius: '4px',
                  marginBottom: '10px'
                }} 
              />
            )}
            <h3 style={{ marginBottom: '8px' }}>{recipe.title}</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>菜系: {recipe.cuisine}</p>
            <p style={{ color: '#666', fontSize: '14px' }}>评分: {recipe.rating} ⭐</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button 
                onClick={() => navigate(`/recipe/${recipe.id}`)} 
                style={{ 
                  flex: 1, 
                  padding: '8px', 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer' 
                }}
              >
                查看
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(recipe.id);
                }} 
                style={{ 
                  flex: 1, 
                  padding: '8px', 
                  backgroundColor: '#dc3545', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer' 
                }}
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecipeList;
