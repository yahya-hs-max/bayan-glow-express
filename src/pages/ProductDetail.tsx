import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, MessageCircle, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { CheckoutModal } from '@/components/CheckoutModal';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [slug]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      toast.error('Produit non trouvé');
      navigate('/boutique');
      return;
    }

    setProduct(data);
    setLoading(false);
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setReviews(data);
    }
  };

  if (loading || !product) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  const handleAddToCart = () => {
    if (product.stock_quantity <= 0) {
      toast.error('Produit en rupture de stock');
      return;
    }
    addItem({ 
      id: product.id, 
      name: product.name, 
      price: product.price, 
      quantity, 
      size: product.size,
      shipping_cost: product.shipping_cost 
    });
    toast.success('✓ Produit ajouté au panier avec succès !');
  };

  const handleBuyNow = () => {
    if (product.stock_quantity <= 0) {
      toast.error('Produit en rupture de stock');
      return;
    }
    addItem({ 
      id: product.id, 
      name: product.name, 
      price: product.price, 
      quantity, 
      size: product.size,
      shipping_cost: product.shipping_cost 
    });
    setCheckoutOpen(true);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Bonjour, je suis intéressé(e) par ${product.name} - ${product.price} MAD`);
    window.open(`https://wa.me/212600000000?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Image */}
          <div
            className="rounded-lg p-12 flex items-center justify-center relative"
            style={{ background: product.background_gradient, minHeight: '500px' }}
          >
            <Badge className="absolute top-4 left-4 bg-card text-card-foreground border-border">
              {product.badge_type}
            </Badge>
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              <p className="text-lg text-muted-foreground">{product.size}</p>
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating || 4.5) 
                        ? 'fill-accent text-accent' 
                        : 'text-muted-foreground'
                    }`} 
                  />
                ))}
                <span className="text-sm text-muted-foreground">({product.rating || 4.5})</span>
              </div>
              <p className="text-5xl font-bold mb-2">{product.price} MAD</p>
              <p className="text-lg text-muted-foreground mb-4">{product.description}</p>
              <p className="text-sm">
                Stock disponible: <span className="font-semibold">{product.stock_quantity} unités</span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-full">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-l-full"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-6 font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-r-full"
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={handleBuyNow}
                disabled={product.stock_quantity <= 0}
              >
                Acheter Maintenant
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.stock_quantity <= 0 ? 'Rupture de stock' : 'Ajouter au Panier'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Commander via WhatsApp
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="ingredients">Ingrédients</TabsTrigger>
              <TabsTrigger value="benefits">Bienfaits</TabsTrigger>
              <TabsTrigger value="usage">Mode d'emploi</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <p className="text-lg">{product.long_description}</p>
            </TabsContent>
            <TabsContent value="ingredients" className="mt-6">
              <ul className="space-y-2">
                {product.ingredients?.map((ingredient: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="benefits" className="mt-6">
              <ul className="space-y-2">
                {product.benefits?.map((benefit: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-accent rounded-full"></span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="usage" className="mt-6">
              <p className="text-lg">{product.usage_instructions}</p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Customer Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Ce Que Nos Clientes Disent</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <Card key={review.id} className="border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < review.rating 
                              ? 'fill-accent text-accent' 
                              : 'text-muted-foreground'
                          }`} 
                        />
                      ))}
                    </div>
                    <p className="text-sm mb-3">{review.comment}</p>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{review.customer_name}</p>
                      {review.is_verified && (
                        <Badge variant="secondary" className="text-xs">Achat vérifié</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </div>
  );
}