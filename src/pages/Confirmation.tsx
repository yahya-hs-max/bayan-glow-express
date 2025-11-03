import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export default function Confirmation() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderNumber]);

  const fetchOrder = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_number', orderNumber)
      .single();

    if (error || !data) {
      console.error('Error fetching order:', error);
      navigate('/');
      return;
    }

    setOrder(data);
    setLoading(false);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Bonjour, j'ai passé la commande ${orderNumber}. J'aimerais avoir plus d'informations.`);
    window.open(`https://wa.me/212600000000?text=${message}`, '_blank');
  };

  if (loading || !order) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-16 h-16 text-success" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Commande Confirmée ! ✓</h1>
          <p className="text-xl text-muted-foreground mb-2">Numéro de commande: {order.order_number}</p>
          <p className="text-lg">Merci {order.customer_name} ! Votre commande a été enregistrée.</p>
        </div>

        <div className="bg-card p-8 rounded-lg space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Récapitulatif de commande</h2>
            <div className="space-y-2">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.product_name} x{item.quantity}</span>
                  <span className="font-semibold">{item.subtotal} MAD</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span>{order.subtotal} MAD</span>
            </div>
            <div className="flex justify-between">
              <span>Frais de livraison</span>
              <span>{order.shipping_cost} MAD</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-success">
                <span>Réduction</span>
                <span>-{order.discount_amount} MAD</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold pt-2 border-t">
              <span>Total payé</span>
              <span>{order.total_amount} MAD</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold mb-2">Informations de livraison</h3>
            <p>{order.customer_name}</p>
            <p>{order.customer_phone}</p>
            <p>{order.customer_address}</p>
            <p>{order.customer_city}</p>
          </div>

          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="font-semibold mb-2">📞 Vous serez contacté sous 24h pour confirmation</p>
            <p className="text-sm text-muted-foreground">Livraison en 2-3 jours ouvrables</p>
          </div>

          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
              variant="outline"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Nous contacter
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => navigate('/boutique')}
            >
              Retour à la boutique
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}