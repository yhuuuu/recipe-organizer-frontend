# 路由配置完整指南

## 📍 所有可用路由

### **公开路由（无需登录）**

| 路径 | 组件 | 说明 |
|------|------|------|
| `/auth` | `Auth.tsx` | 登录/注册页面（推荐） |
| `/login` | `Auth.tsx` | 登录页面（兼容路径） |

### **受保护路由（需要登录）**

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | `Home.tsx` | 主页 - 菜谱网格视图（推荐）⭐ |
| `/recipe/:id` | `RecipeDetail.tsx` | 菜谱详情页 |
| `/wishlist` | `Wishlist.tsx` | 收藏夹 |
| `/add-recipe` | `AddRecipe.tsx` | 添加菜谱（独立页面） |
| `/edit-recipe/:id` | `EditRecipe.tsx` | 编辑菜谱（独立页面） |
| `/list` | `RecipeList.tsx` | 菜谱列表（简化版） |

### **特殊路由**

| 路径 | 行为 |
|------|------|
| `*`（任意未匹配） | 重定向到 `/` |

## 🔐 认证流程

### **访问受保护路由时**
```
用户访问 /
    ↓
检查 authService.isAuthenticated()
    ↓
未登录 → Navigate to /auth
    ↓
已登录 → 显示页面
```

### **登录后跳转**
```
用户在 /auth 登录成功
    ↓
navigate('/') 
    ↓
跳转到主页
```

## 🎨 使用示例

### **在代码中导航**

```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// 跳转到登录页
navigate('/auth');

// 跳转到主页
navigate('/');

// 查看菜谱详情
navigate(`/recipe/${recipeId}`);

// 添加新菜谱（独立页面）
navigate('/add-recipe');

// 编辑菜谱（独立页面）
navigate(`/edit-recipe/${recipeId}`);

// 收藏夹
navigate('/wishlist');

// 简化版列表
navigate('/list');
```

### **在链接中使用**

```tsx
import { Link } from 'react-router-dom';

<Link to="/">首页</Link>
<Link to="/wishlist">收藏夹</Link>
<Link to="/add-recipe">添加菜谱</Link>
<Link to={`/recipe/${id}`}>查看详情</Link>
```

## 📊 路由配置对比

### **选项 1：使用模态框（当前推荐）⭐**

```typescript
// 路由配置
<Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />

// 在 Home.tsx 中
const [isModalOpen, setIsModalOpen] = useState(false);

// 打开模态框添加菜谱
<Button onClick={() => setIsModalOpen(true)}>Add Recipe</Button>

// 模态框组件
<AddRecipeModal open={isModalOpen} onOpenChange={setIsModalOpen} />
```

**优点：**
- ✅ 更流畅的用户体验
- ✅ 无需页面切换
- ✅ 现代化 UI
- ✅ 动画效果
- ✅ 支持图片上传和相机

### **选项 2：使用独立页面**

```typescript
// 路由配置
<Route path="/add-recipe" element={<ProtectedRoute><AddRecipe /></ProtectedRoute>} />

// 在任意组件中
<Button onClick={() => navigate('/add-recipe')}>Add Recipe</Button>
```

**优点：**
- ✅ 完整的页面布局
- ✅ 更容易定制样式
- ✅ 适合复杂表单
- ✅ SEO 友好（如果需要）

## 🚀 推荐路由策略

### **主要功能使用模态框**
- ✅ 添加菜谱：`AddRecipeModal` (在 Home 页面)
- ✅ 编辑菜谱：`EditRecipeModal` (在 Home 页面)
- ✅ 主页：`Home.tsx` (网格视图)

### **辅助功能使用独立路由**
- ✅ 菜谱详情：`/recipe/:id`
- ✅ 收藏夹：`/wishlist`
- ✅ 登录页：`/auth`

### **备用选项（可选启用）**
- ⚠️ 独立添加页面：`/add-recipe`
- ⚠️ 独立编辑页面：`/edit-recipe/:id`
- ⚠️ 简化列表页面：`/list`

## 🔍 路由调试

### **检查当前路由**
```tsx
import { useLocation } from 'react-router-dom';

function MyComponent() {
  const location = useLocation();
  console.log('Current path:', location.pathname);
  console.log('Search params:', location.search);
  console.log('Hash:', location.hash);
}
```

### **检查路由参数**
```tsx
import { useParams } from 'react-router-dom';

function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  console.log('Recipe ID:', id);
}
```

### **检查导航历史**
```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// 返回上一页
navigate(-1);

// 前进
navigate(1);

// 替换当前历史记录（不会添加新记录）
navigate('/auth', { replace: true });
```

## 🛡️ ProtectedRoute 工作原理

```typescript
// src/components/ProtectedRoute.tsx
export function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    // 未登录，重定向到登录页
    return <Navigate to="/auth" replace />;
  }
  
  // 已登录，渲染子组件
  return <>{children}</>;
}
```

**使用场景：**
```tsx
<Route 
  path="/protected" 
  element={
    <ProtectedRoute>
      <ProtectedPage />
    </ProtectedRoute>
  } 
/>
```

## 📱 响应式导航

### **Navigation 组件**
```tsx
// src/components/Navigation.tsx
// 根据当前路径高亮导航项
const location = useLocation();

<Button variant={location.pathname === '/' ? 'default' : 'ghost'}>
  Home
</Button>
```

## 🎯 最佳实践

### **1. 使用常量定义路径**
```typescript
// src/constants/routes.ts
export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  RECIPE_DETAIL: '/recipe/:id',
  WISHLIST: '/wishlist',
  ADD_RECIPE: '/add-recipe',
  EDIT_RECIPE: '/edit-recipe/:id',
} as const;

// 使用
navigate(ROUTES.HOME);
```

### **2. 创建导航辅助函数**
```typescript
// src/utils/navigation.ts
export const navigateToRecipe = (navigate: NavigateFunction, id: string) => {
  navigate(`/recipe/${id}`);
};

export const navigateToEditRecipe = (navigate: NavigateFunction, id: string) => {
  navigate(`/edit-recipe/${id}`);
};
```

### **3. 使用 URL 参数传递状态**
```typescript
// 带查询参数的导航
navigate('/recipes?cuisine=Chinese&rating=5');

// 获取查询参数
const [searchParams] = useSearchParams();
const cuisine = searchParams.get('cuisine');
const rating = searchParams.get('rating');
```

## 🧪 测试路由

### **测试清单**

- [ ] 未登录访问 `/` → 重定向到 `/auth`
- [ ] 未登录访问 `/wishlist` → 重定向到 `/auth`
- [ ] 未登录访问 `/recipe/123` → 重定向到 `/auth`
- [ ] 登录后访问 `/` → 显示主页
- [ ] 登录后访问 `/auth` → 可以访问（已登录用户可以查看登录页）
- [ ] 访问不存在的路径 `/xyz` → 重定向到 `/`
- [ ] `/login` 和 `/auth` 都可以访问登录页
- [ ] 独立页面路由正常工作：`/add-recipe`, `/edit-recipe/123`, `/list`

## 🎨 自定义路由布局

### **不同路由使用不同布局**

```tsx
// App.tsx
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 无导航栏的路由 */}
        <Route path="/auth" element={<Auth />} />
        
        {/* 有导航栏的路由 */}
        <Route element={<LayoutWithNav />}>
          <Route path="/" element={<Home />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// LayoutWithNav.tsx
function LayoutWithNav() {
  return (
    <>
      <Navigation />
      <Outlet /> {/* 渲染子路由 */}
    </>
  );
}
```

## 📝 总结

当前路由配置提供了灵活的选项：

1. **主要使用路径**：`/`, `/auth`, `/recipe/:id`, `/wishlist`
2. **备用页面路径**：`/add-recipe`, `/edit-recipe/:id`, `/list`
3. **兼容路径**：`/login` → `/auth`
4. **所有路由都有认证保护**（除了 `/auth` 和 `/login`）
5. **未匹配路径自动重定向到首页**

推荐使用现有的模态框实现（Home 页面），备用的独立页面作为可选方案！🎉
