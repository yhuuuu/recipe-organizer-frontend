/**
 * Recipe Service - 统一的菜谱服务接口
 * 包含所有菜谱相关的 CRUD 操作和认证处理
 */

import { Recipe } from '@/types/Recipe';
import { 
  fetchRecipes, 
  fetchRecipeById, 
  createRecipe as apiCreateRecipe,
  updateRecipe as apiUpdateRecipe,
  replaceRecipe,
  deleteRecipe as apiDeleteRecipe
} from './recipesApi';
import { extractRecipeFromBackend } from './backendExtractor';

export const recipeService = {
  /**
   * 获取所有菜谱（支持搜索和过滤）
   * @param q - 搜索关键词
   * @param cuisine - 菜系过滤（如 'Chinese', 'Italian', 'All'）
   * @returns 菜谱列表
   */
  getAllRecipes: async (q?: string, cuisine?: string): Promise<Recipe[]> => {
    return fetchRecipes(q, cuisine);
  },

  /**
   * 获取单个菜谱详情
   * @param id - 菜谱 ID
   * @returns 菜谱详情或 null
   */
  getRecipe: async (id: string): Promise<Recipe | null> => {
    return fetchRecipeById(id);
  },

  /**
   * 创建新菜谱
   * @param recipe - 菜谱数据（不包含 id 和 createdAt）
   * @returns 创建的菜谱（包含生成的 id）
   */
  createRecipe: async (recipe: Omit<Recipe, 'id' | 'createdAt'>): Promise<Recipe> => {
    return apiCreateRecipe(recipe);
  },

  /**
   * 完整更新菜谱 (PUT - 替换整个菜谱)
   * @param id - 菜谱 ID
   * @param recipe - 完整的菜谱数据
   * @returns 更新后的菜谱
   */
  updateRecipe: async (id: string, recipe: Omit<Recipe, 'id' | 'createdAt'>): Promise<Recipe> => {
    return replaceRecipe(id, recipe);
  },

  /**
   * 部分更新菜谱 (PATCH - 只更新指定字段)
   * @param id - 菜谱 ID
   * @param updates - 需要更新的字段
   * @returns 更新后的菜谱
   */
  patchRecipe: async (id: string, updates: Partial<Recipe>): Promise<Recipe> => {
    return apiUpdateRecipe(id, updates);
  },

  /**
   * 更新菜谱评分
   * @param id - 菜谱 ID
   * @param rating - 评分 (0-5)
   * @returns 更新后的菜谱
   */
  updateRating: async (id: string, rating: number): Promise<Recipe> => {
    return apiUpdateRecipe(id, { rating });
  },

  /**
   * 切换收藏状态
   * @param id - 菜谱 ID
   * @param isWishlisted - 是否收藏
   * @returns 更新后的菜谱
   */
  toggleWishlist: async (id: string, isWishlisted: boolean): Promise<Recipe> => {
    return apiUpdateRecipe(id, { isWishlisted });
  },

  /**
   * 删除菜谱
   * @param id - 菜谱 ID
   */
  deleteRecipe: async (id: string): Promise<void> => {
    return apiDeleteRecipe(id);
  },

  /**
   * 从文本或 URL 提取菜谱
   * @param textOrUrl - 文本内容或 URL
   * @returns 提取的菜谱数据
   */
  extractRecipe: async (textOrUrl: string): Promise<any> => {
    const isUrl = textOrUrl.startsWith('http://') || textOrUrl.startsWith('https://');
    
    if (isUrl) {
      // 使用 URL 提取
      return extractRecipeFromBackend('', textOrUrl);
    } else {
      // 使用文本提取
      return extractRecipeFromBackend(textOrUrl);
    }
  }
};

// 导出类型定义
export type RecipeService = typeof recipeService;
