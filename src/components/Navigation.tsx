import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Heart, LogOut, User } from 'lucide-react';
import { Button, buttonVariants } from './ui/button';
import { authService } from '@/services/authService';
import { cn } from '@/utils/cn';

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
            <Link
              to="/"
              className={cn(
                buttonVariants({
                  variant: location.pathname === '/' ? 'default' : 'ghost',
                })
              )}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
            <Link
              to="/wishlist"
              className={cn(
                buttonVariants({
                  variant: location.pathname === '/wishlist' ? 'default' : 'ghost',
                })
              )}
            >
              <Heart className="w-4 h-4 mr-2" />
              Wishlist
            </Link>

            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 text-sm">
                  <User className="w-4 h-4" />
                  <span>{currentUser.username}</span>
                </div>
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </>
            ) : (
              <Link to="/auth" className={buttonVariants()}>
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
