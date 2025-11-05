import { Star, ShoppingCart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/hooks/useSettings';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  size: string;
  background_gradient: string;
  badge_type: string;
  badge_color?: string;
  stock_quantity: number;
  shipping_cost?: number;
  rating?: number;
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
  badge_color = "default",
  stock_quantity,
  shipping_cost,
  rating = 4.5,
}: ProductCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { settings } = useSettings();
  const [primaryImage, setPrimaryImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductMedia = async () => {
      const { data } = await supabase
        .from('product_media')
        .select('media_url')
        .eq('product_id', id)
        .eq('is_primary', true)
        .single();
      
      if (data) {
        setPrimaryImage(data.media_url);
      }
    };

    fetchProductMedia();
  }, [id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (stock_quantity <= 0) {
      toast.error('Produit en rupture de stock');
      return;
    }
    addItem({ id, name, price, quantity: 1, size, shipping_cost });
    toast.success('✓ Produit ajouté au panier avec succès !');
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = encodeURIComponent(`Bonjour, je suis intéressé(e) par ${name} - ${price} MAD`);
    window.open(`https://wa.me/${settings.whatsapp_number}?text=${message}`, '_blank');
  };

  return (
    <Card
      className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
      onClick={() => navigate(`/produit/${slug}`)}
    >
      <div
        className={`h-64 relative flex items-center justify-center ${primaryImage ? '' : 'p-8'}`}
        style={{ background: background_gradient }}
      >
        {badge_type && (
          <Badge 
            variant={badge_color as any} 
            className="absolute top-4 left-4 z-10"
          >
            {badge_type}
          </Badge>
        )}
        {primaryImage ? (
          <img 
            src={primaryImage} 
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">{name}</h3>
            <p className="text-sm text-muted-foreground">{size}</p>
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div 
              className="text-sm text-muted-foreground mb-1 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: description }}
            />
            <p className="text-3xl font-bold">{price} MAD</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-accent text-accent' : 'text-muted'}`}
                />
              ))}
            </div>
            {stock_quantity !== undefined && stock_quantity <= 10 && (
              <span className={`text-xs font-medium ${stock_quantity === 0 ? 'text-destructive' : 'text-orange-500'}`}>
                {stock_quantity === 0 ? 'Rupture' : `${stock_quantity} restants`}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
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