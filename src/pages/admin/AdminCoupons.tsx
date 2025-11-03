import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";

const AdminCoupons = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "0",
    max_uses: "",
    is_active: true,
    expires_at: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setCoupons(data || []);
    }
  };

  const openDialog = (coupon?: any) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value.toString(),
        min_order_amount: coupon.min_order_amount.toString(),
        max_uses: coupon.max_uses?.toString() || "",
        is_active: coupon.is_active,
        expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().split("T")[0] : "",
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        min_order_amount: "0",
        max_uses: "",
        is_active: true,
        expires_at: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const data = {
      code: formData.code.toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      min_order_amount: parseFloat(formData.min_order_amount),
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      is_active: formData.is_active,
      expires_at: formData.expires_at || null,
    };

    if (editingCoupon) {
      const { error } = await supabase
        .from("coupons")
        .update(data)
        .eq("id", editingCoupon.id);

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    } else {
      const { error } = await supabase.from("coupons").insert([data]);

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: "Succès",
      description: editingCoupon ? "Coupon mis à jour" : "Coupon créé",
    });

    setIsDialogOpen(false);
    fetchCoupons();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce coupon ?")) return;

    const { error } = await supabase.from("coupons").delete().eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le coupon",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Succès",
      description: "Coupon supprimé",
    });

    fetchCoupons();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold">Gestion des coupons</h1>
        <Button onClick={() => openDialog()} className="bg-primary hover:bg-primary/90 text-black">
          <Plus className="w-5 h-5 mr-2" />
          Nouveau Coupon
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coupons ({coupons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Code</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Valeur</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Utilisé</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Expire le</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-mono font-bold">{coupon.code}</td>
                    <td className="py-3 px-4 text-sm">
                      {coupon.discount_type === "percentage" ? "Pourcentage" : "Fixe"}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">
                      {coupon.discount_type === "percentage"
                        ? `${coupon.discount_value}%`
                        : `${coupon.discount_value} MAD`}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {coupon.used_count}/{coupon.max_uses || "∞"}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {coupon.expires_at
                        ? new Date(coupon.expires_at).toLocaleDateString("fr-FR")
                        : "Aucune"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          coupon.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {coupon.is_active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(coupon)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(coupon.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Coupon Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? "Modifier le coupon" : "Nouveau coupon"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Code *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Ex: PROMO20"
              />
            </div>

            <div>
              <Label>Type de réduction</Label>
              <Select
                value={formData.discount_type}
                onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Pourcentage</SelectItem>
                  <SelectItem value="fixed">Fixe (MAD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Valeur de réduction *</Label>
              <Input
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                placeholder={formData.discount_type === "percentage" ? "Ex: 20" : "Ex: 50"}
              />
            </div>

            <div>
              <Label>Commande minimale (MAD)</Label>
              <Input
                type="number"
                value={formData.min_order_amount}
                onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
              />
            </div>

            <div>
              <Label>Nombre d'utilisations max (optionnel)</Label>
              <Input
                type="number"
                value={formData.max_uses}
                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                placeholder="Illimité si vide"
              />
            </div>

            <div>
              <Label>Date d'expiration (optionnel)</Label>
              <Input
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Coupon actif</Label>
            </div>

            <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90 text-black">
              {editingCoupon ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCoupons;