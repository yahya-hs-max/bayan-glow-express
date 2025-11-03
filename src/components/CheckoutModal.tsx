import { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

const SHIPPING_COSTS: Record<string, number> = {
  'Casablanca': 30,
  'Rabat': 35,
  'Marrakech': 40,
  'Fès': 40,
  'Tanger': 40,
  'Agadir': 40,
  'Meknès': 40,
  'Oujda': 50,
  'Kénitra': 35,
  'Tétouan': 40,
  'Salé': 35,
  'Autre': 50,
};

export function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    address: '',
    couponCode: '',
  });
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const shippingCost = formData.city ? (subtotal >= 500 ? 0 : SHIPPING_COSTS[formData.city] || 50) : 0;
  const total = subtotal + shippingCost - discount;

  const applyCoupon = async () => {
    if (!formData.couponCode) return;

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', formData.couponCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      toast.error('❌ Code promo invalide ou expiré');
      return;
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      toast.error('❌ Code promo expiré');
      return;
    }

    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      toast.error('❌ Ce code promo a atteint sa limite d\'utilisation');
      return;
    }

    if (subtotal < coupon.min_order_amount) {
      toast.error(`⚠️ Commande minimale: ${coupon.min_order_amount} MAD`);
      return;
    }

    const discountAmount = coupon.discount_type === 'percentage'
      ? (subtotal * coupon.discount_value) / 100
      : coupon.discount_value;

    setDiscount(discountAmount);
    setCouponApplied(true);
    toast.success(`✓ Code promo appliqué : -${discountAmount} MAD`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.city || !formData.address) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.phone.length !== 10 || !formData.phone.match(/^0[67]/)) {
      toast.error('Veuillez entrer un numéro de téléphone valide (06/07)');
      return;
    }

    if (formData.address.length < 10) {
      toast.error('L\'adresse doit contenir au moins 10 caractères');
      return;
    }

    setLoading(true);

    try {
      const orderNumber = `BC-${Date.now()}`;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_city: formData.city,
          customer_address: formData.address,
          subtotal,
          shipping_cost: shippingCost,
          discount_amount: discount,
          total_amount: total,
          coupon_code: couponApplied ? formData.couponCode : null,
          status: 'En attente',
          payment_method: 'COD',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      if (couponApplied && formData.couponCode) {
        const { data: couponData } = await supabase
          .from('coupons')
          .select('used_count')
          .eq('code', formData.couponCode)
          .single();
        
        if (couponData) {
          await supabase
            .from('coupons')
            .update({ used_count: couponData.used_count + 1 })
            .eq('code', formData.couponCode);
        }
      }

      clearCart();
      toast.success('✓ Commande confirmée !');
      navigate(`/confirmation/${orderNumber}`);
      onClose();
    } catch (error) {
      console.error('Order error:', error);
      toast.error('❌ Une erreur est survenue lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Finaliser votre commande</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h3 className="font-semibold mb-3">Récapitulatif de commande</h3>
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} x{item.quantity}</span>
                <span>{item.price * item.quantity} MAD</span>
              </div>
            ))}
            <div className="border-t pt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Sous-total</span>
                <span>{subtotal} MAD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Frais de livraison</span>
                <span className={shippingCost === 0 && subtotal >= 500 ? 'text-success font-semibold' : ''}>
                  {shippingCost === 0 && subtotal >= 500 ? 'GRATUIT' : `${shippingCost} MAD`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-success">
                  <span>Réduction</span>
                  <span>-{discount} MAD</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>{total} MAD</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom Complet *</Label>
              <Input
                id="name"
                placeholder="Ex: Ahmed Bennani"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                minLength={3}
              />
            </div>

            <div>
              <Label htmlFor="phone">Numéro de Téléphone *</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                placeholder="Ex: 0612345678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="city">Ville *</Label>
              <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre ville" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(SHIPPING_COSTS).map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="address">Adresse Complète *</Label>
              <Textarea
                id="address"
                rows={3}
                placeholder="Rue, numéro, quartier, code postal..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                minLength={10}
              />
            </div>

            <div>
              <Label htmlFor="coupon">Code Promo (optionnel)</Label>
              <div className="flex gap-2">
                <Input
                  id="coupon"
                  placeholder="Entrez votre code"
                  value={formData.couponCode}
                  onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })}
                  disabled={couponApplied}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={applyCoupon}
                  disabled={couponApplied || !formData.couponCode}
                >
                  Appliquer
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg text-center space-y-2">
            <p className="font-semibold">💵 Paiement à la livraison (Cash on Delivery)</p>
            <p className="text-sm text-muted-foreground">Vous paierez lors de la réception de votre commande</p>
            <p className="text-sm text-muted-foreground">Livraison en 2-3 jours ouvrables</p>
          </div>

          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={loading}>
            {loading ? 'Traitement...' : `Confirmer la Commande - ${total} MAD`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}