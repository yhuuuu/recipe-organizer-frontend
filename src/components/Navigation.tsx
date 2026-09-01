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
            className="font-display text-2xl font-extrabold italic tracking-tight"
          >
            <span className="bg-primary px-2 text-primary-foreground">HAOHAOCHIFAN</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              aria-current={location.pathname === '/' ? 'page' : undefined}
              className={cn(
                buttonVariants({
                  variant: location.pathname === '/' ? 'default' : 'ghost',
                }),
                'rounded-full'
              )}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
            <Link
              to="/wishlist"
              aria-current={location.pathname === '/wishlist' ? 'page' : undefined}
              className={cn(
                buttonVariants({
                  variant: location.pathname === '/wishlist' ? 'default' : 'ghost',
                }),
                'rounded-full'
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
                <Button variant="ghost" onClick={handleLogout} className="rounded-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </>
            ) : (
              /* Ink fill rather than lemon, so the primary action stays
                 distinct from the lemon nav links. */
              <Link
                to="/auth"
                className={cn(
                  buttonVariants(),
                  'rounded-full bg-foreground text-background hover:bg-foreground/90'
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
