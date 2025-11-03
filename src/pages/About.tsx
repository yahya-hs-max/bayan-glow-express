import { Leaf, Heart, Award, Sparkles } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">À Propos de Bayan Cosmetic</h1>
          <p className="text-xl text-muted-foreground">Beauté naturelle marocaine depuis 2024</p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          <section className="bg-card p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Notre Histoire</h2>
            <p className="text-muted-foreground">
              Bayan Cosmetic est née d'une passion pour la beauté naturelle et les traditions marocaines.
              Inspirés par les secrets de beauté transmis de génération en génération, nous avons créé
              une gamme de produits cosmétiques alliant authenticité et efficacité moderne.
            </p>
          </section>

          <section className="bg-card p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Notre Mission</h2>
            <p className="text-muted-foreground">
              Offrir des produits de beauté 100% naturels, fabriqués à partir d'ingrédients marocains
              de qualité supérieure. Nous croyons que la beauté doit être accessible, naturelle et
              respectueuse de votre peau et de l'environnement.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-lg text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">100% Naturel</h3>
              <p className="text-sm text-muted-foreground">
                Tous nos produits sont formulés avec des ingrédients naturels soigneusement sélectionnés
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Ingrédients Locaux</h3>
              <p className="text-sm text-muted-foreground">
                Nous utilisons des ingrédients marocains authentiques comme le luban dakar et l'huile d'argan
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Certifié Bio</h3>
              <p className="text-sm text-muted-foreground">
                Nos produits sont certifiés biologiques et respectent les normes les plus strictes
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fait avec Amour</h3>
              <p className="text-sm text-muted-foreground">
                Chaque produit est créé avec soin et passion pour votre bien-être
              </p>
            </div>
          </section>

          <section className="bg-card p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Le Luban Dakar</h2>
            <p className="text-muted-foreground mb-4">
              Le luban dakar, également connu sous le nom d'encens, est un ingrédient précieux utilisé
              depuis des siècles dans les rituels de beauté marocains. Cette résine naturelle possède
              des propriétés extraordinaires pour la peau :
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2"></span>
                <span>Propriétés anti-inflammatoires et apaisantes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2"></span>
                <span>Aide à uniformiser le teint et réduire les taches</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2"></span>
                <span>Effet rajeunissant et régénérant</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2"></span>
                <span>Protection naturelle contre les agressions extérieures</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}