import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface ShippingCost {
  id: string;
  city_name: string;
  shipping_cost: number;
  is_active: boolean;
}

const AdminShipping = () => {
  const [shippingCosts, setShippingCosts] = useState<ShippingCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCity, setNewCity] = useState("");
  const [newCost, setNewCost] = useState("");

  useEffect(() => {
    fetchShippingCosts();
  }, []);

  const fetchShippingCosts = async () => {
    try {
      const { data, error } = await supabase
        .from("shipping_costs")
        .select("*")
        .order("city_name");

      if (error) throw error;
      setShippingCosts(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des frais de livraison");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCity = async () => {
    if (!newCity.trim() || !newCost) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      const { error } = await supabase.from("shipping_costs").insert({
        city_name: newCity.trim(),
        shipping_cost: parseFloat(newCost),
        is_active: true,
      });

      if (error) throw error;
      toast.success("Ville ajoutée avec succès");
      setNewCity("");
      setNewCost("");
      fetchShippingCosts();
    } catch (error: any) {
      toast.error("Erreur lors de l'ajout de la ville");
    }
  };

  const handleUpdateCost = async (id: string, cost: number) => {
    try {
      const { error } = await supabase
        .from("shipping_costs")
        .update({ shipping_cost: cost })
        .eq("id", id);

      if (error) throw error;
      toast.success("Tarif mis à jour");
      fetchShippingCosts();
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("shipping_costs")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
      toast.success(isActive ? "Ville activée" : "Ville désactivée");
      fetchShippingCosts();
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette ville ?")) return;

    try {
      const { error } = await supabase
        .from("shipping_costs")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Ville supprimée");
      fetchShippingCosts();
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold mb-8">Frais de livraison</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ajouter une nouvelle ville</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">Nom de la ville</Label>
              <Input
                id="city"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="Ex: Casablanca"
              />
            </div>
            <div>
              <Label htmlFor="cost">Frais de livraison (MAD)</Label>
              <Input
                id="cost"
                type="number"
                value={newCost}
                onChange={(e) => setNewCost(e.target.value)}
                placeholder="Ex: 30"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddCity} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Villes et tarifs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shippingCosts.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{item.city_name}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <Input
                      type="number"
                      value={item.shipping_cost}
                      onChange={(e) =>
                        handleUpdateCost(item.id, parseFloat(e.target.value))
                      }
                      className="text-center"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12">MAD</span>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.is_active}
                      onCheckedChange={(checked) =>
                        handleToggleActive(item.id, checked)
                      }
                    />
                    <span className="text-sm w-16">
                      {item.is_active ? "Actif" : "Inactif"}
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminShipping;
