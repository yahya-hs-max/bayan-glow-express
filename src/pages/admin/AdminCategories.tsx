import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Upload, X } from "lucide-react";

const AdminCategories = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    display_order: "0",
    is_active: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error) {
      setCategories(data || []);
    }
  };

  const openDialog = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        display_order: category.display_order.toString(),
        is_active: category.is_active,
      });
      setImagePreview(category.image_url || "");
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        display_order: "0",
        is_active: true,
      });
      setImagePreview("");
    }
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erreur",
          description: "L'image ne doit pas dépasser 5 MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setUploading(true);
    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("category-images")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("category-images")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'uploader l'image: " + error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast({
        title: "Erreur",
        description: "Le nom est obligatoire",
        variant: "destructive",
      });
      return;
    }

    let imageUrl = editingCategory?.image_url || "";
    
    if (imageFile) {
      const uploadedUrl = await uploadImage();
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
        
        // Delete old image if exists
        if (editingCategory?.image_url) {
          const oldPath = editingCategory.image_url.split("/").pop();
          if (oldPath) {
            await supabase.storage.from("category-images").remove([oldPath]);
          }
        }
      } else {
        return;
      }
    }

    const data = {
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
      description: formData.description,
      display_order: parseInt(formData.display_order),
      image_url: imageUrl,
      is_active: formData.is_active,
    };

    if (editingCategory) {
      const { error } = await supabase
        .from("categories")
        .update(data)
        .eq("id", editingCategory.id);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour la catégorie",
          variant: "destructive",
        });
        return;
      }
    } else {
      const { error } = await supabase.from("categories").insert([data]);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de créer la catégorie",
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: "Succès",
      description: editingCategory ? "Catégorie mise à jour" : "Catégorie créée",
    });

    setIsDialogOpen(false);
    fetchCategories();
  };

  const handleDelete = async (category: any) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) return;

    // Delete image if exists
    if (category.image_url) {
      const imagePath = category.image_url.split("/").pop();
      if (imagePath) {
        await supabase.storage.from("category-images").remove([imagePath]);
      }
    }

    const { error } = await supabase.from("categories").delete().eq("id", category.id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la catégorie",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Succès",
      description: "Catégorie supprimée",
    });

    fetchCategories();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold">Gestion des catégories</h1>
        <Button onClick={() => openDialog()} className="bg-primary hover:bg-primary/90 text-black">
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle Catégorie
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catégories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Image</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nom</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Slug</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Ordre</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">{category.name}</td>
                    <td className="py-3 px-4 text-sm">{category.slug}</td>
                    <td className="py-3 px-4 text-sm">{category.display_order}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          category.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {category.is_active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(category)}
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

      {/* Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
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

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label>Ordre d'affichage</Label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
              />
            </div>

            <div>
              <Label>Image</Label>
              {imagePreview && (
                <div className="relative mb-4">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded" />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="category-image"
                />
                <Label htmlFor="category-image" className="cursor-pointer">
                  <Button type="button" variant="outline" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Choisir une image
                    </span>
                  </Button>
                </Label>
                {imageFile && <span className="text-sm text-muted-foreground">{imageFile.name}</span>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Catégorie active</Label>
            </div>

            <Button 
              onClick={handleSave} 
              className="w-full bg-primary hover:bg-primary/90 text-black"
              disabled={uploading}
            >
              {uploading ? "Upload en cours..." : editingCategory ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
