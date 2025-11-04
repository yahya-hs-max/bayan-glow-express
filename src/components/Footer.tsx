import { Link } from 'react-router-dom';
import { Mail, Phone, Instagram, Facebook } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.jpg';
import { useSettings } from '@/hooks/useSettings';

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export function Footer() {
  const { settings, loading } = useSettings();

  return (
    <footer className="bg-card border-t mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <img src={logo} alt="Bayan Cosmetic" className="h-16 mb-4" />
            <p className="text-sm text-muted-foreground">
              Beauté naturelle marocaine depuis 2024
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4">Liens Rapides</h3>
            <div className="space-y-2 text-sm">
              <Link to="/boutique" className="block hover:text-primary transition-colors">
                Boutique
              </Link>
              <Link to="/a-propos" className="block hover:text-primary transition-colors">
                À Propos
              </Link>
              <Link to="/contact" className="block hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">Nous Contacter</h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {loading ? 'Chargement...' : settings.contact_email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {loading ? 'Chargement...' : settings.contact_phone}
              </p>
              <div className="flex gap-3 mt-4">
                {settings.social_instagram && settings.social_instagram !== '#' && (
                  <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {settings.social_facebook && settings.social_facebook !== '#' && (
                  <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {settings.social_tiktok && settings.social_tiktok !== '#' && (
                  <a href={settings.social_tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    <TikTokIcon />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">Restez Informée</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Recevez nos offres exclusives
            </p>
            <div className="flex gap-2">
              <Input type="email" placeholder="Votre email" />
              <Button>S'abonner</Button>
            </div>
          </div>
        </div>

        <div className="border-t pt-8">
          <div className="flex flex-wrap justify-center gap-6 mb-4 text-sm">
            <span className="flex items-center gap-2">💵 Paiement à la livraison</span>
            <span className="flex items-center gap-2">🚚 Livraison partout au Maroc</span>
            <span className="flex items-center gap-2">📦 Retour sous 7 jours</span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            © 2025 Bayan Cosmetic. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}