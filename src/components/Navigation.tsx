import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Heart, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';
import { authService } from '@/services/authService';

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/auth');
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold">
            Recipe Organizer
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant={location.pathname === '/' ? 'default' : 'ghost'}
              asChild
            >
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button
              variant={location.pathname === '/wishlist' ? 'default' : 'ghost'}
              asChild
            >
              <Link to="/wishlist">
                <Heart className="w-4 h-4 mr-2" />
                Wishlist
              </Link>
            </Button>

            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 text-sm">
                  <User className="w-4 h-4" />
                  <span>{currentUser.username}</span>
                </div>
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  登出
                </Button>
              </>
            ) : (
              <Button variant="default" asChild>
                <Link to="/auth">登录</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

