import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Leaf, Award, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { CheckoutModal } from '@/components/CheckoutModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Index() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .limit(4);

    if (error) {
      console.error('Error fetching products:', error);
      return;
    }

    setProducts(data || []);
  };

  const handleBuyNow = (product: any) => {
    setSelectedProduct(product);
    setCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-to-b from-primary/20 to-background">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Beauté Naturelle Marocaine
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Soins à base de luban dakar pour une peau radieuse
          </p>
          <Button
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 rounded-full"
            onClick={() => navigate('/boutique')}
          >
            Découvrir Nos Produits
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-card">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">100% Naturel</h3>
              <p className="text-muted-foreground">Ingrédients naturels soigneusement sélectionnés</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Ingrédients Marocains</h3>
              <p className="text-muted-foreground">Luban Dakar et huile d'argan authentiques</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Certifié Bio</h3>
              <p className="text-muted-foreground">Qualité garantie et contrôlée</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Nos Produits Vedettes</h2>
            <p className="text-xl text-muted-foreground">Découvrez notre collection de soins naturels</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onBuyNow={() => handleBuyNow(product)}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="border-2"
              onClick={() => navigate('/boutique')}
            >
              Voir Tous Les Produits
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-card">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12">Ce Que Nos Clientes Disent</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-background p-6 rounded-lg shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Heart key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "Une transformation incroyable de ma peau ! Les produits sont vraiment naturels et efficaces."
              </p>
              <p className="font-semibold">Fatima Z.</p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-lg">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Heart key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "J'adore la crème hydratante ! Ma peau n'a jamais été aussi douce et éclatante."
              </p>
              <p className="font-semibold">Amina M.</p>
            </div>
          </div>
        </div>
      </section>

      {selectedProduct && (
        <CheckoutModal
          open={checkoutOpen}
          onClose={() => {
            setCheckoutOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}