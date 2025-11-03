import { Link } from "react-router-dom";
import { Home, ShoppingBag, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-cream to-white px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* 404 Number with gradient */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Decorative element */}
        <div className="mb-6">
          <div className="inline-block p-4 bg-primary/10 rounded-full">
            <Search className="w-16 h-16 text-primary" />
          </div>
        </div>

        {/* Main message */}
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
          Page Introuvable
        </h2>
        
        <p className="text-lg text-gray-600 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          <br />
          Découvrez nos magnifiques produits de beauté naturelle !
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/">
            <Button className="bg-primary hover:bg-primary/90 text-black rounded-full px-8 py-6 text-lg font-medium flex items-center gap-2">
              <Home className="w-5 h-5" />
              Retour à l'Accueil
            </Button>
          </Link>
          
          <Link to="/boutique">
            <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary/10 rounded-full px-8 py-6 text-lg font-medium flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Voir la Boutique
            </Button>
          </Link>
        </div>

        {/* Additional help text */}
        <p className="mt-12 text-sm text-gray-500">
          Besoin d'aide ? 
          <Link to="/contact" className="text-primary hover:text-accent ml-1 underline">
            Contactez-nous
          </Link>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
