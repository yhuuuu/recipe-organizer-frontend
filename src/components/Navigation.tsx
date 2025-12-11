import { Link, useLocation } from 'react-router-dom';
import { Home, Heart } from 'lucide-react';
import { Button } from './ui/button';

export function Navigation() {
  const location = useLocation();

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
          </div>
        </div>
      </div>
    </nav>
  );
}

