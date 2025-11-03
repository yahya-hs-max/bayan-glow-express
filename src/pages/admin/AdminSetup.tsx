import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

const AdminSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  const setupAdmin = async () => {
    setLoading(true);

    try {
      // Sign up the admin user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: "yahyahoussini366@gmail.com",
        password: "ms3odaombark",
        options: {
          emailRedirectTo: `${window.location.origin}/admin/login`
        }
      });

      if (signUpError) throw signUpError;

      if (!signUpData.user) {
        throw new Error("Erreur lors de la création du compte");
      }

      // Assign admin role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: signUpData.user.id,
          role: "admin"
        });

      if (roleError) {
        // If role already exists, that's okay
        if (!roleError.message.includes("duplicate")) {
          throw roleError;
        }
      }

      setSetupComplete(true);
      toast({
        title: "Configuration terminée",
        description: "Le compte administrateur a été créé avec succès",
      });

      // Sign out and redirect to login after 2 seconds
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/admin/login");
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Erreur de configuration",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-background to-primary/20 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="inline-block p-4 bg-primary/10 rounded-full mb-6">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            Configuration Administrateur
          </h1>
          
          {!setupComplete ? (
            <>
              <p className="text-gray-600 mb-8">
                Cliquez sur le bouton ci-dessous pour créer le compte administrateur.
              </p>
              
              <Button
                onClick={setupAdmin}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-black rounded-full py-6 text-lg font-medium"
              >
                {loading ? "Configuration en cours..." : "Créer le compte admin"}
              </Button>
              
              <p className="text-sm text-gray-500 mt-6">
                ⚠️ Cette page doit être supprimée après utilisation
              </p>
            </>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium">
                  ✓ Configuration réussie !
                </p>
                <p className="text-green-600 text-sm mt-2">
                  Redirection vers la page de connexion...
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
