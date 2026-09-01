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
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="font-display text-base font-extrabold italic tracking-tight sm:text-2xl"
          >
            <span className="bg-primary px-1.5 text-primary-foreground sm:px-2">HAOHAOCHIFAN</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/"
              aria-current={location.pathname === '/' ? 'page' : undefined}
              aria-label="Home"
              className={cn(
                buttonVariants({
                  variant: location.pathname === '/' ? 'default' : 'ghost',
                }),
                'rounded-full px-3 sm:px-4'
              )}
            >
              <Home className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link
              to="/wishlist"
              aria-current={location.pathname === '/wishlist' ? 'page' : undefined}
              aria-label="Wishlist"
              className={cn(
                buttonVariants({
                  variant: location.pathname === '/wishlist' ? 'default' : 'ghost',
                }),
                'rounded-full px-3 sm:px-4'
              )}
            >
              <Heart className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Wishlist</span>
            </Link>

            {isAuthenticated ? (
              <>
                <div className="hidden items-center gap-2 px-3 py-2 text-sm sm:flex">
                  <User className="w-4 h-4" />
                  <span className="max-w-[10ch] truncate">{currentUser.username}</span>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  aria-label="Log out"
                  className="rounded-full px-3 sm:px-4"
                >
                  <LogOut className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Log Out</span>
                </Button>
              </>
            ) : (
              /* Ink fill rather than lemon, so the primary action stays
                 distinct from the lemon nav links. */
              <Link
                to="/auth"
                className={cn(
                  buttonVariants(),
                  'rounded-full bg-foreground px-3 text-background hover:bg-foreground/90 sm:px-4'
                )}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
