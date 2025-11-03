import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const navigate = useNavigate();

  const handleTrackOrder = async () => {
    if (!orderNumber.trim()) {
      toast.error('Veuillez entrer un numéro de commande');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_name,
            product_price,
            quantity,
            subtotal
          )
        `)
        .eq('order_number', orderNumber.trim())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error('Aucune commande trouvée avec ce numéro');
        setOrder(null);
      } else {
        setOrder(data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Erreur lors de la recherche de la commande');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: { [key: string]: { color: string; icon: any; label: string } } = {
      'En attente': { color: 'bg-yellow-500', icon: Clock, label: 'En attente' },
      'Confirmée': { color: 'bg-blue-500', icon: CheckCircle, label: 'Confirmée' },
      'En préparation': { color: 'bg-purple-500', icon: Package, label: 'En préparation' },
      'Expédiée': { color: 'bg-orange-500', icon: Truck, label: 'Expédiée' },
      'Livrée': { color: 'bg-green-500', icon: CheckCircle, label: 'Livrée' },
      'Annulée': { color: 'bg-red-500', icon: Clock, label: 'Annulée' },
    };
    return statusMap[status] || statusMap['En attente'];
  };

  const statusSteps = ['En attente', 'Confirmée', 'En préparation', 'Expédiée', 'Livrée'];

  const getStatusStep = (status: string) => {
    if (status === 'Annulée') return -1;
    return statusSteps.indexOf(status);
  };

  const handleWhatsApp = () => {
    if (!order) return;
    const message = `Bonjour, je souhaite obtenir des informations sur ma commande #${order.order_number}`;
    window.open(`https://wa.me/212656970709?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Suivre ma commande</h1>
          <p className="text-muted-foreground">
            Entrez votre numéro de commande pour suivre son statut
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Numéro de commande</CardTitle>
            <CardDescription>
              Le numéro de commande vous a été envoyé par email et WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Ex: CMD-20240101-ABC123"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTrackOrder()}
                className="flex-1"
              />
              <Button onClick={handleTrackOrder} disabled={loading}>
                <Search className="mr-2 h-4 w-4" />
                {loading ? 'Recherche...' : 'Rechercher'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {order && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Commande #{order.order_number}</CardTitle>
                    <CardDescription>
                      Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </CardDescription>
                  </div>
                  <Badge
                    className={`${getStatusInfo(order.status).color} text-white`}
                  >
                    {getStatusInfo(order.status).label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {order.status !== 'Annulée' && (
                  <div className="mb-8">
                    <div className="relative">
                      <div className="absolute top-5 left-0 right-0 h-1 bg-muted">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{
                            width: `${(getStatusStep(order.status) / (statusSteps.length - 1)) * 100}%`
                          }}
                        />
                      </div>
                      <div className="relative flex justify-between">
                        {statusSteps.map((step, index) => {
                          const StatusIcon = getStatusInfo(step).icon;
                          const isActive = index <= getStatusStep(order.status);
                          return (
                            <div key={step} className="flex flex-col items-center">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground'
                                } transition-all duration-500`}
                              >
                                <StatusIcon className="h-5 w-5" />
                              </div>
                              <span
                                className={`text-xs mt-2 text-center max-w-[80px] ${
                                  isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                                }`}
                              >
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Informations client
                    </h3>
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <p>{order.customer_name}</p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {order.customer_phone}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {order.customer_address}, {order.customer_city}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold">Résumé de la commande</h3>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sous-total</span>
                        <span className="font-medium">{order.subtotal} MAD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Livraison</span>
                        <span className="font-medium">{order.shipping_cost} MAD</span>
                      </div>
                      {order.discount_amount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Réduction</span>
                          <span>-{order.discount_amount} MAD</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t text-base">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold">{order.total_amount} MAD</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Articles commandés</h3>
                  <div className="space-y-2">
                    {order.order_items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantité: {item.quantity}
                          </p>
                        </div>
                        <span className="font-semibold">{item.subtotal} MAD</span>
                      </div>
                    ))}
                  </div>
                </div>

                {order.notes && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <Button onClick={handleWhatsApp} className="flex-1">
                    Contacter le support
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/boutique')}>
                    Continuer mes achats
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
