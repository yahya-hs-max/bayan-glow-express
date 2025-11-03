import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import logo from '@/assets/logo.jpg';

export function Header() {
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ${
          isScrolled ? 'shadow-md py-2' : 'py-4'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>

            <Link to="/" className="flex items-center gap-3">
              <img
                src={logo}
                alt="Bayan Cosmetic"
                className={`object-contain transition-all duration-300 ${
                  isScrolled ? 'h-12' : 'h-16'
                }`}
              />
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="hover:text-primary transition-colors">
                Accueil
              </Link>
              <Link to="/boutique" className="hover:text-primary transition-colors">
                Boutique
              </Link>
              <Link to="/a-propos" className="hover:text-primary transition-colors">
                À Propos
              </Link>
              <Link to="/contact" className="hover:text-primary transition-colors">
                Contact
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate('/panier')}
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-background md:hidden pt-20">
          <nav className="flex flex-col items-center gap-6 p-8">
            <Link
              to="/"
              className="text-2xl hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              to="/boutique"
              className="text-2xl hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Boutique
            </Link>
            <Link
              to="/a-propos"
              className="text-2xl hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              À Propos
            </Link>
            <Link
              to="/contact"
              className="text-2xl hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}