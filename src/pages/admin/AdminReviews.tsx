import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Trash2, Star } from "lucide-react";

const AdminReviews = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        products(name, slug, image_url, id)
      `)
      .order("created_at", { ascending: false });

    if (!error) {
      setReviews(data || []);
    }
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from("reviews")
      .update({ is_approved: true })
      .eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver l'avis",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Succès",
      description: "Avis approuvé",
    });

    fetchReviews();
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from("reviews")
      .update({ is_approved: false })
      .eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter l'avis",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Succès",
      description: "Avis rejeté",
    });

    fetchReviews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) return;

    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'avis",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Succès",
      description: "Avis supprimé",
    });

    fetchReviews();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold mb-8">Gestion des avis clients</h1>

      <Card>
        <CardHeader>
          <CardTitle>Avis clients ({reviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {review.products?.image_url && (
                      <a 
                        href={`/product/${review.products.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0"
                      >
                        <img 
                          src={review.products.image_url} 
                          alt={review.products.name}
                          className="w-16 h-16 object-cover rounded-lg hover:opacity-80 transition-opacity"
                        />
                      </a>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{review.customer_name}</p>
                      <a 
                        href={`/product/${review.products?.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        {review.products?.name || "Produit inconnu"}
                      </a>
                      <div className="flex gap-1 mt-1">{renderStars(review.rating)}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        review.is_approved
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {review.is_approved ? "Approuvé" : "En attente"}
                    </span>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {new Date(review.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>

                {review.comment && (
                  <p className="text-gray-700 mb-3 text-sm">{review.comment}</p>
                )}

                <div className="flex gap-2">
                  {!review.is_approved && (
                    <Button
                      size="sm"
                      onClick={() => handleApprove(review.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approuver
                    </Button>
                  )}
                  {review.is_approved && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(review.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rejeter
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(review.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Supprimer
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

export default AdminReviews;