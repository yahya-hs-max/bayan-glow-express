import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Variant {
  id: string;
  variant_name: string;
  is_required: boolean;
  options: VariantOption[];
}

interface VariantOption {
  id: string;
  option_name: string;
  price_modifier: number;
  stock_quantity: number;
  is_active: boolean;
}

interface ProductVariantManagerProps {
  productId: string;
}

export const ProductVariantManager = ({ productId }: ProductVariantManagerProps) => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [newVariantName, setNewVariantName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  const fetchVariants = async () => {
    try {
      const { data: variantsData, error: variantsError } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId)
        .order("display_order");

      if (variantsError) throw variantsError;

      const variantsWithOptions = await Promise.all(
        (variantsData || []).map(async (variant) => {
          const { data: options } = await supabase
            .from("product_variant_options")
            .select("*")
            .eq("variant_id", variant.id)
            .order("display_order");

          return { ...variant, options: options || [] };
        })
      );

      setVariants(variantsWithOptions);
    } catch (error) {
      toast.error("Erreur lors du chargement des variantes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = async () => {
    if (!newVariantName.trim()) return;

    try {
      const { error } = await supabase.from("product_variants").insert({
        product_id: productId,
        variant_name: newVariantName,
        is_required: false,
      });

      if (error) throw error;
      setNewVariantName("");
      fetchVariants();
      toast.success("Variante ajoutée");
    } catch (error) {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm("Supprimer cette variante et toutes ses options ?")) return;

    try {
      await supabase.from("product_variant_options").delete().eq("variant_id", variantId);
      await supabase.from("product_variants").delete().eq("id", variantId);
      fetchVariants();
      toast.success("Variante supprimée");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleAddOption = async (variantId: string, optionName: string) => {
    if (!optionName.trim()) return;

    try {
      const { error } = await supabase.from("product_variant_options").insert({
        variant_id: variantId,
        option_name: optionName,
        price_modifier: 0,
        stock_quantity: 0,
      });

      if (error) throw error;
      fetchVariants();
      toast.success("Option ajoutée");
    } catch (error) {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    try {
      await supabase.from("product_variant_options").delete().eq("id", optionId);
      fetchVariants();
      toast.success("Option supprimée");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleUpdateOption = async (
    optionId: string,
    field: string,
    value: any
  ) => {
    try {
      await supabase
        .from("product_variant_options")
        .update({ [field]: value })
        .eq("id", optionId);
      fetchVariants();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter une variante</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Taille, Couleur, Format"
              value={newVariantName}
              onChange={(e) => setNewVariantName(e.target.value)}
            />
            <Button onClick={handleAddVariant}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      {variants.map((variant) => (
        <Card key={variant.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{variant.variant_name}</CardTitle>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteVariant(variant.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nom de l'option"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddOption(variant.id, e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
              <Button
                onClick={(e) => {
                  const input = e.currentTarget.previousSibling as HTMLInputElement;
                  handleAddOption(variant.id, input.value);
                  input.value = "";
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {variant.options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center gap-2 p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <Input
                      value={option.option_name}
                      onChange={(e) =>
                        handleUpdateOption(option.id, "option_name", e.target.value)
                      }
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      placeholder="Prix +"
                      value={option.price_modifier}
                      onChange={(e) =>
                        handleUpdateOption(
                          option.id,
                          "price_modifier",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      placeholder="Stock"
                      value={option.stock_quantity}
                      onChange={(e) =>
                        handleUpdateOption(
                          option.id,
                          "stock_quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <Switch
                    checked={option.is_active}
                    onCheckedChange={(checked) =>
                      handleUpdateOption(option.id, "is_active", checked)
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteOption(option.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
