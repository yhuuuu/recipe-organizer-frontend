# Complete Routing Configuration Guide

## 📍 All Available Routes

### **Public Routes (No Login Required)**

| Path | Component | Description |
|------|------|------|
| `/auth` | `Auth.tsx` | Login/Registration page (recommended) |
| `/login` | `Auth.tsx` | Login page (compatibility path) |

### **Protected Routes (Login Required)**

| Path | Component | Description |
|------|------|------|
| `/` | `Home.tsx` | Home - Recipe grid view (recommended) ⭐ |
| `/recipe/:id` | `RecipeDetail.tsx` | Recipe detail page |
| `/wishlist` | `Wishlist.tsx` | Favorites/Wishlist |
| `/add-recipe` | `AddRecipe.tsx` | Add recipe (standalone page) |
| `/edit-recipe/:id` | `EditRecipe.tsx` | Edit recipe (standalone page) |

### **Special Routes**

| Path | Behavior |
|------|------|
| `*` (any unmatched) | Redirect to `/` |

## 🔐 Authentication Flow

### **When Accessing Protected Routes**
```
User visits /
    ↓
Check authService.isAuthenticated()
    ↓
Not logged in → Navigate to /auth
    ↓
Logged in → Display page
```

### **After Login Redirect**
```
User successfully logs in at /auth
    ↓
navigate('/') 
    ↓
Redirect to home page
```

## 🎨 Usage Examples

### **Navigation in Code**

```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Navigate to login page
navigate('/auth');

// Navigate to home
navigate('/');

// View recipe details
navigate(`/recipe/${recipeId}`);

// Add new recipe (standalone page)
navigate('/add-recipe');

// Edit recipe (standalone page)
navigate(`/edit-recipe/${recipeId}`);

// Wishlist
navigate('/wishlist');
```

### **Using Links**

```tsx
import { Link } from 'react-router-dom';

<Link to="/">Home</Link>
<Link to="/wishlist">Wishlist</Link>
<Link to="/add-recipe">Add Recipe</Link>
<Link to={`/recipe/${id}`}>View Details</Link>
```

## 📊 Routing Configuration Comparison

### **Option 1: Using Modal (Currently Recommended) ⭐**

```typescript
// Route configuration
<Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />

// In Home.tsx
const [isModalOpen, setIsModalOpen] = useState(false);

// Open modal to add recipe
<Button onClick={() => setIsModalOpen(true)}>Add Recipe</Button>

// Modal component
<AddRecipeModal open={isModalOpen} onOpenChange={setIsModalOpen} />
```

**Advantages:**
- ✅ Smoother user experience
- ✅ No page switching required
- ✅ Modern UI
- ✅ Animation effects
- ✅ Supports image upload and camera

### **Option 2: Using Standalone Pages**

```typescript
// Route configuration
<Route path="/add-recipe" element={<ProtectedRoute><AddRecipe /></ProtectedRoute>} />

// In any component
<Button onClick={() => navigate('/add-recipe')}>Add Recipe</Button>
```

**Advantages:**
- ✅ Full page layout
- ✅ Easier to customize styles
- ✅ Suitable for complex forms
- ✅ SEO friendly (if needed)

## 🚀 Recommended Routing Strategy

### **Main Features Using Modals**
- ✅ Add recipe: `AddRecipeModal` (on Home page)
- ✅ Edit recipe: `EditRecipeModal` (on Home page)
- ✅ Home page: `Home.tsx` (grid view)

### **Auxiliary Features Using Standalone Routes**
- ✅ Recipe details: `/recipe/:id`
- ✅ Wishlist: `/wishlist`
- ✅ Login page: `/auth`

### **Alternative Options (Optional)**
- ⚠️ Standalone add page: `/add-recipe`
- ⚠️ Standalone edit page: `/edit-recipe/:id`

## 🔍 Route Debugging

### **Check Current Route**
```tsx
import { useLocation } from 'react-router-dom';

function MyComponent() {
  const location = useLocation();
  console.log('Current path:', location.pathname);
  console.log('Search params:', location.search);
  console.log('Hash:', location.hash);
}
```

### **Check Route Parameters**
```tsx
import { useParams } from 'react-router-dom';

function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  console.log('Recipe ID:', id);
}
```

### **Check Navigation History**
```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Go back
navigate(-1);

// Go forward
navigate(1);

// Replace current history entry (won't add new record)
navigate('/auth', { replace: true });
```

## 🛡️ How ProtectedRoute Works

```typescript
// src/components/ProtectedRoute.tsx
export function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    // Not logged in, redirect to login page
    return <Navigate to="/auth" replace />;
  }
  
  // Logged in, render children
  return <>{children}</>;
}
```

**Usage:**
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

## 📱 Responsive Navigation

### **Navigation Component**
```tsx
// src/components/Navigation.tsx
// Highlight navigation item based on current path
const location = useLocation();

<Button variant={location.pathname === '/' ? 'default' : 'ghost'}>
  Home
</Button>
```

## 🎯 Best Practices

### **1. Use Constants for Paths**
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

// Usage
navigate(ROUTES.HOME);
```

### **2. Create Navigation Helper Functions**
```typescript
// src/utils/navigation.ts
export const navigateToRecipe = (navigate: NavigateFunction, id: string) => {
  navigate(`/recipe/${id}`);
};

export const navigateToEditRecipe = (navigate: NavigateFunction, id: string) => {
  navigate(`/edit-recipe/${id}`);
};
```

### **3. Pass State via URL Parameters**
```typescript
// Navigation with query parameters
navigate('/recipes?cuisine=Chinese&rating=5');

// Get query parameters
const [searchParams] = useSearchParams();
const cuisine = searchParams.get('cuisine');
const rating = searchParams.get('rating');
```

## 🧪 Testing Routes

### **Testing Checklist**

- [ ] Access `/` without login → Redirect to `/auth`
- [ ] Access `/wishlist` without login → Redirect to `/auth`
- [ ] Access `/recipe/123` without login → Redirect to `/auth`
- [ ] Access `/` after login → Display home page
- [ ] Access `/auth` after login → Can access (logged-in users can view login page)
- [ ] Access non-existent path `/xyz` → Redirect to `/`
- [ ] Both `/login` and `/auth` access login page
- [ ] Standalone page routes work: `/add-recipe`, `/edit-recipe/123`

## 🎨 Custom Route Layouts

### **Different Layouts for Different Routes**

```tsx
// App.tsx
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes without navigation bar */}
        <Route path="/auth" element={<Auth />} />
        
        {/* Routes with navigation bar */}
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
      <Outlet /> {/* Render child routes */}
    </>
  );
}
```

## 📝 Summary

Current routing configuration provides flexible options:

1. **Primary paths**: `/`, `/auth`, `/recipe/:id`, `/wishlist`
2. **Alternative page paths**: `/add-recipe`, `/edit-recipe/:id`
3. **Compatibility path**: `/login` → `/auth`
4. **All routes have authentication protection** (except `/auth` and `/login`)
5. **Unmatched paths automatically redirect to home**

Recommended to use existing modal implementation (Home page), with standalone pages as optional alternatives! 🎉
