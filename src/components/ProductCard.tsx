import { Star, ShoppingCart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  size: string;
  background_gradient: string;
  badge_type: string;
  stock_quantity: number;
  rating?: number;
  onBuyNow: () => void;
}

export function ProductCard({
  id,
  name,
  slug,
  description,
  price,
  size,
  background_gradient,
  badge_type,
  stock_quantity,
  rating = 4.5,
  onBuyNow,
}: ProductCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (stock_quantity <= 0) {
      toast.error('Produit en rupture de stock');
      return;
    }
    addItem({ id, name, price, quantity: 1, size });
    toast.success('✓ Produit ajouté au panier avec succès !');
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = encodeURIComponent(`Bonjour, je suis intéressé(e) par ${name} - ${price} MAD`);
    window.open(`https://wa.me/212600000000?text=${message}`, '_blank');
  };

  return (
    <Card
      className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
      onClick={() => navigate(`/produit/${slug}`)}
    >
      <div
        className="h-64 relative flex items-center justify-center p-8"
        style={{ background: background_gradient }}
      >
        <Badge className="absolute top-4 left-4 bg-card text-card-foreground border-border">
          {badge_type}
        </Badge>
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">{name}</h3>
          <p className="text-sm text-muted-foreground">{size}</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{description}</p>
            <p className="text-3xl font-bold">{price} MAD</p>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-accent text-accent' : 'text-muted'}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Button
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onBuyNow();
            }}
          >
            Acheter Maintenant
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleAddToCart}
            disabled={stock_quantity <= 0}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {stock_quantity <= 0 ? 'Rupture de stock' : 'Ajouter au Panier'}
          </Button>
          <Button
            variant="outline"
            className="w-full border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
        </div>

        {stock_quantity > 0 && stock_quantity <= 10 && (
          <p className="text-sm text-warning text-center">⚠️ Plus que {stock_quantity} unités en stock !</p>
        )}
      </div>
    </Card>
  );
}