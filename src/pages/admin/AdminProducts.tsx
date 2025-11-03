import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import { ProductMediaManager } from "@/components/admin/ProductMediaManager";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [productMedia, setProductMedia] = useState<Record<string, any>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    long_description: "",
    price: "",
    size: "",
    category: "",
    background_gradient: "",
    badge_type: "",
    ingredients: [] as string[],
    benefits: [] as string[],
    usage_instructions: "",
    stock_quantity: "0",
    shipping_cost: "0",
    rating: "4.5",
    is_active: true,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(data);
      
      // Fetch primary images for all products
      const { data: mediaData } = await supabase
        .from("product_media")
        .select("*")
        .eq("is_primary", true)
        .eq("media_type", "image");
      
      if (mediaData) {
        const mediaMap: Record<string, any> = {};
        mediaData.forEach((media) => {
          mediaMap[media.product_id] = media;
        });
        setProductMedia(mediaMap);
      }
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (!error) {
      setCategories(data || []);
    }
  };

  const openDialog = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || "",
        long_description: product.long_description || "",
        price: product.price.toString(),
        size: product.size || "",
        category: product.category || "",
        background_gradient: product.background_gradient || "",
        badge_type: product.badge_type || "",
        ingredients: product.ingredients || [],
        benefits: product.benefits || [],
        usage_instructions: product.usage_instructions || "",
        stock_quantity: product.stock_quantity.toString(),
        shipping_cost: product.shipping_cost?.toString() || "0",
        rating: product.rating?.toString() || "4.5",
        is_active: product.is_active,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        long_description: "",
        price: "",
        size: "",
        category: "",
        background_gradient: "",
        badge_type: "",
        ingredients: [],
        benefits: [],
        usage_instructions: "",
        stock_quantity: "0",
        shipping_cost: "0",
        rating: "4.5",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity),
      shipping_cost: parseFloat(formData.shipping_cost),
      rating: parseFloat(formData.rating),
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
    };

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update(data)
        .eq("id", editingProduct.id);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le produit",
          variant: "destructive",
        });
        return;
      }
    } else {
      const { error } = await supabase.from("products").insert([data]);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de créer le produit",
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: "Succès",
      description: editingProduct ? "Produit mis à jour" : "Produit créé",
    });

    setIsDialogOpen(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Succès",
      description: "Produit supprimé",
    });

    fetchProducts();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold">Gestion des produits</h1>
        <Button onClick={() => openDialog()} className="bg-primary hover:bg-primary/90 text-black">
          <Plus className="w-5 h-5 mr-2" />
          Nouveau Produit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produits ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Image</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nom</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Prix</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Stock</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Catégorie</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {productMedia[product.id]?.media_url ? (
                        <img
                          src={productMedia[product.id].media_url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div 
                          className="w-12 h-12 rounded flex items-center justify-center text-xs font-bold"
                          style={{ background: product.background_gradient || '#ccc' }}
                        >
                          {product.name.substring(0, 2)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">{product.name}</td>
                    <td className="py-3 px-4 text-sm">{product.price} MAD</td>
                    <td className="py-3 px-4 text-sm">{product.stock_quantity}</td>
                    <td className="py-3 px-4 text-sm">{product.category}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {product.is_active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(product.id)}
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

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Modifier le produit" : "Nouveau produit"}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Informations</TabsTrigger>
              <TabsTrigger value="media" disabled={!editingProduct}>
                Médias {!editingProduct && "(Créer d'abord)"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
            <div>
              <Label>Nom *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="Auto-généré si vide"
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Prix (MAD) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div>
                <Label>Stock *</Label>
                <Input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                />
              </div>
              <div>
                <Label>Frais livraison (MAD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.shipping_cost}
                  onChange={(e) => setFormData({ ...formData, shipping_cost: e.target.value })}
                  placeholder="0 = par ville"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Si 0, frais par ville appliqués
                </p>
              </div>
              <div>
                <Label>Note *</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  placeholder="4.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Taille</Label>
                <Input
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="Ex: 50 ml"
                />
              </div>
              <div>
                <Label>Catégorie</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description courte</Label>
              <div className="mt-2 bg-background">
                <ReactQuill
                  theme="snow"
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link'],
                      ['clean']
                    ]
                  }}
                  className="bg-background"
                />
              </div>
            </div>

            <div>
              <Label>Description longue</Label>
              <div className="mt-2 bg-background">
                <ReactQuill
                  theme="snow"
                  value={formData.long_description}
                  onChange={(value) => setFormData({ ...formData, long_description: value })}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      [{ 'align': [] }],
                      ['link'],
                      ['clean']
                    ]
                  }}
                  className="bg-background"
                  style={{ minHeight: '200px' }}
                />
              </div>
            </div>

            <div>
              <Label>Ingrédients</Label>
              <Textarea
                value={formData.ingredients.join('\n')}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value.split('\n').filter(line => line.trim()) })}
                rows={4}
                placeholder="Un ingrédient par ligne"
              />
            </div>

            <div>
              <Label>Bienfaits</Label>
              <Textarea
                value={formData.benefits.join('\n')}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value.split('\n').filter(line => line.trim()) })}
                rows={4}
                placeholder="Un bienfait par ligne"
              />
            </div>

            <div>
              <Label>Mode d'emploi</Label>
              <Textarea
                value={formData.usage_instructions}
                onChange={(e) => setFormData({ ...formData, usage_instructions: e.target.value })}
                rows={3}
                placeholder="Instructions d'utilisation du produit"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Produit actif</Label>
            </div>

            <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90 text-black">
              {editingProduct ? "Mettre à jour" : "Créer"}
            </Button>
          </TabsContent>

          {/* Media Tab - Only for existing products */}
          {editingProduct && (
            <TabsContent value="media" className="mt-4">
              <ProductMediaManager
                productId={editingProduct?.id}
                onMediaUpdate={fetchProducts}
              />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
    </div>
  );
};

export default AdminProducts;