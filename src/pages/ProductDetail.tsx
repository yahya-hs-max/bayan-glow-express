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
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [productMedia, setProductMedia] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
    
    // Fetch product media
    const { data: mediaData } = await supabase
      .from('product_media')
      .select('*')
      .eq('product_id', data.id)
      .order('display_order', { ascending: true });
    
    if (mediaData) {
      setProductMedia(mediaData);
    }
    
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

  const images = productMedia.filter(m => m.media_type === 'image');
  const videos = productMedia.filter(m => m.media_type === 'video');

  const scrollToCTA = () => {
    document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen py-4 lg:py-12 px-4 pb-24 lg:pb-12">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Left: Image/Video Gallery */}
          <div className="space-y-4">
            {images.length > 0 ? (
              <>
                {/* Main image carousel */}
                <Carousel className="w-full" opts={{ loop: true }}>
                  <CarouselContent>
                    {images.map((media, index) => (
                      <CarouselItem key={media.id}>
                        <div className="rounded-lg overflow-hidden aspect-square lg:aspect-auto lg:min-h-[500px]">
                          <img
                            src={media.media_url}
                            alt={`${product.name} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
                
                {/* Thumbnail gallery */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((media, index) => (
                      <img
                        key={media.id}
                        src={media.media_url}
                        alt={product.name}
                        className={`w-full h-16 lg:h-20 object-cover rounded cursor-pointer border-2 ${
                          media.is_primary ? 'border-primary' : 'border-border'
                        } hover:border-primary transition-colors`}
                      />
                    ))}
                  </div>
                )}

                {/* Video section */}
                {videos.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Vidéo du produit</h3>
                    {videos.map((video) => (
                      <div key={video.id} className="rounded-lg overflow-hidden aspect-video">
                        <video
                          src={video.media_url}
                          controls
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div
                className="rounded-lg p-12 flex items-center justify-center"
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
            )}
          </div>

          {/* Right: Details */}
          <div className="space-y-4 lg:space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 lg:w-5 lg:h-5 ${
                      i < Math.floor(product.rating || 4.5) 
                        ? 'fill-accent text-accent' 
                        : 'text-muted-foreground'
                    }`} 
                  />
                ))}
                <span className="text-xs lg:text-sm text-muted-foreground">({product.rating || 4.5})</span>
              </div>
              <p className="text-3xl lg:text-5xl font-bold mb-2">{product.price} MAD</p>
              <p className="text-base lg:text-lg text-muted-foreground mb-4">{product.description}</p>
              <p className="text-xs lg:text-sm">
                Stock disponible: <span className="font-semibold">{product.stock_quantity} unités</span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-full">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-l-full h-9 w-9 lg:h-10 lg:w-10"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-3 h-3 lg:w-4 lg:h-4" />
                </Button>
                <span className="px-4 lg:px-6 font-semibold text-sm lg:text-base">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-r-full h-9 w-9 lg:h-10 lg:w-10"
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                >
                  <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                </Button>
              </div>
            </div>

            <div id="cta-section" className="space-y-2 lg:space-y-3">
              <Button
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-11 lg:h-12 text-sm lg:text-base"
                onClick={handleBuyNow}
                disabled={product.stock_quantity <= 0}
              >
                Acheter Maintenant
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full h-11 lg:h-12 text-sm lg:text-base"
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0}
              >
                <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                {product.stock_quantity <= 0 ? 'Rupture de stock' : 'Ajouter au Panier'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white h-11 lg:h-12 text-sm lg:text-base"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                Commander via WhatsApp
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8 lg:mt-12">
          <Tabs defaultValue="description">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="description" className="text-xs lg:text-sm">Description</TabsTrigger>
              <TabsTrigger value="ingredients" className="text-xs lg:text-sm">Ingrédients</TabsTrigger>
              <TabsTrigger value="benefits" className="text-xs lg:text-sm">Bienfaits</TabsTrigger>
              <TabsTrigger value="usage" className="text-xs lg:text-sm">Mode d'emploi</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4 lg:mt-6">
              <p className="text-sm lg:text-lg">{product.long_description}</p>
            </TabsContent>
            <TabsContent value="ingredients" className="mt-4 lg:mt-6">
              <ul className="space-y-2">
                {product.ingredients?.map((ingredient: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-sm lg:text-base">
                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="benefits" className="mt-4 lg:mt-6">
              <ul className="space-y-2">
                {product.benefits?.map((benefit: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-sm lg:text-base">
                    <span className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="usage" className="mt-4 lg:mt-6">
              <p className="text-sm lg:text-lg">{product.usage_instructions}</p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Customer Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-12 lg:mt-16">
            <h2 className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 text-center">Ce Que Nos Clientes Disent</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {reviews.map((review) => (
                <Card key={review.id} className="border-border">
                  <CardContent className="pt-4 lg:pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 lg:w-4 lg:h-4 ${
                            i < review.rating 
                              ? 'fill-accent text-accent' 
                              : 'text-muted-foreground'
                          }`} 
                        />
                      ))}
                    </div>
                    <p className="text-xs lg:text-sm mb-3">{review.comment}</p>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-xs lg:text-sm">{review.customer_name}</p>
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

      {/* Mobile Fixed Bottom Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg z-50">
        <Button
          size="lg"
          className="w-full max-w-md mx-auto bg-accent hover:bg-accent/90 text-accent-foreground h-12"
          onClick={scrollToCTA}
        >
          Voir les options d'achat
        </Button>
      </div>
    </div>
  );
}