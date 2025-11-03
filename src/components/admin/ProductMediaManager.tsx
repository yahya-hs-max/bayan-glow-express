import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Star, Video, Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProductMediaManagerProps {
  productId: string | null;
  onMediaUpdate?: () => void;
}

interface MediaItem {
  id: string;
  media_type: string;
  media_url: string;
  is_primary: boolean;
  display_order: number;
}

export const ProductMediaManager = ({ productId, onMediaUpdate }: ProductMediaManagerProps) => {
  const { toast } = useToast();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchMedia();
    }
  }, [productId]);

  const fetchMedia = async () => {
    if (!productId) return;

    const { data, error } = await supabase
      .from("product_media")
      .select("*")
      .eq("product_id", productId)
      .order("display_order", { ascending: true });

    if (!error && data) {
      setMedia(data);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file || !productId) return;

    const maxSize = type === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB for images, 50MB for videos
    
    if (file.size > maxSize) {
      toast({
        title: "Erreur",
        description: `Le fichier ne doit pas dépasser ${type === 'image' ? '5' : '50'} MB`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-media")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("product-media")
        .getPublicUrl(fileName);

      const isPrimary = media.filter(m => m.media_type === 'image').length === 0 && type === 'image';
      const maxOrder = Math.max(...media.map(m => m.display_order), -1);

      const { error: insertError } = await supabase
        .from("product_media")
        .insert({
          product_id: productId,
          media_type: type,
          media_url: publicUrl,
          is_primary: isPrimary,
          display_order: maxOrder + 1,
        });

      if (insertError) throw insertError;

      toast({
        title: "Succès",
        description: `${type === 'image' ? 'Image' : 'Vidéo'} uploadée avec succès`,
      });

      fetchMedia();
      onMediaUpdate?.();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'uploader le fichier: " + error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (mediaId: string) => {
    if (!productId) return;

    try {
      // Remove primary from all images
      await supabase
        .from("product_media")
        .update({ is_primary: false })
        .eq("product_id", productId)
        .eq("media_type", "image");

      // Set new primary
      const { error } = await supabase
        .from("product_media")
        .update({ is_primary: true })
        .eq("id", mediaId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Image principale définie",
      });

      fetchMedia();
      onMediaUpdate?.();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (mediaItem: MediaItem) => {
    if (!confirm("Supprimer ce média ?")) return;

    try {
      const fileName = mediaItem.media_url.split("/").slice(-2).join("/");
      
      await supabase.storage.from("product-media").remove([fileName]);

      const { error } = await supabase
        .from("product_media")
        .delete()
        .eq("id", mediaItem.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Média supprimé",
      });

      fetchMedia();
      onMediaUpdate?.();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const images = media.filter(m => m.media_type === 'image');
  const videos = media.filter(m => m.media_type === 'video');

  return (
    <div className="space-y-4">
      <div>
        <Label>Images du produit</Label>
        <div className="grid grid-cols-3 gap-4 mt-2">
          {images.map((item) => (
            <Card key={item.id} className="relative p-2">
              <img
                src={item.media_url}
                alt="Product"
                className="w-full h-32 object-cover rounded"
              />
              <div className="absolute top-1 right-1 flex gap-1">
                <Button
                  size="sm"
                  variant={item.is_primary ? "default" : "secondary"}
                  className="h-6 w-6 p-0"
                  onClick={() => handleSetPrimary(item.id)}
                  title="Définir comme image principale"
                >
                  <Star className={`w-3 h-3 ${item.is_primary ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-6 w-6 p-0"
                  onClick={() => handleDelete(item)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-2">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'image')}
            className="hidden"
            id="product-images"
            disabled={!productId || uploading}
          />
          <Label htmlFor="product-images">
            <Button
              type="button"
              variant="outline"
              disabled={!productId || uploading}
              asChild
            >
              <span>
                <ImageIcon className="w-4 h-4 mr-2" />
                {uploading ? "Upload en cours..." : "Ajouter une image"}
              </span>
            </Button>
          </Label>
        </div>
      </div>

      <div>
        <Label>Vidéo du produit (optionnelle)</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {videos.map((item) => (
            <Card key={item.id} className="relative p-2">
              <video
                src={item.media_url}
                className="w-full h-32 object-cover rounded"
                controls
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-1 right-1 h-6 w-6 p-0"
                onClick={() => handleDelete(item)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Card>
          ))}
        </div>
        <div className="mt-2">
          <Input
            type="file"
            accept="video/*"
            onChange={(e) => handleFileUpload(e, 'video')}
            className="hidden"
            id="product-video"
            disabled={!productId || uploading || videos.length > 0}
          />
          <Label htmlFor="product-video">
            <Button
              type="button"
              variant="outline"
              disabled={!productId || uploading || videos.length > 0}
              asChild
            >
              <span>
                <Video className="w-4 h-4 mr-2" />
                {uploading ? "Upload en cours..." : videos.length > 0 ? "Une vidéo déjà uploadée" : "Ajouter une vidéo"}
              </span>
            </Button>
          </Label>
        </div>
      </div>

      {!productId && (
        <p className="text-sm text-muted-foreground">
          Sauvegardez d'abord le produit pour pouvoir ajouter des médias
        </p>
      )}
    </div>
  );
};
