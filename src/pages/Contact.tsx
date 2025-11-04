import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';

export default function Contact() {
  const { settings, loading } = useSettings();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message envoyé ! Nous vous répondrons sous 24h.');
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Contactez-Nous</h1>
          <p className="text-xl text-muted-foreground">
            Une question ? N'hésitez pas à nous contacter
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-card p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom Complet</Label>
                <Input id="name" placeholder="Votre nom" required />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="votre@email.com" required />
              </div>

              <div>
                <Label htmlFor="phone">Téléphone (optionnel)</Label>
                <Input id="phone" type="tel" placeholder="06 12 34 56 78" />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={6}
                  placeholder="Votre message..."
                  required
                />
              </div>

              <Button type="submit" size="lg" className="w-full">
                <Send className="w-5 h-5 mr-2" />
                Envoyer
              </Button>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-4">
              Réponse sous 24h
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-card p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">Nos Coordonnées</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Email</h3>
                    <a href={`mailto:${settings.contact_email}`} className="text-muted-foreground hover:text-primary">
                      {loading ? 'Chargement...' : settings.contact_email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Téléphone</h3>
                    <a href={`tel:${settings.contact_phone.replace(/\s/g, '')}`} className="text-muted-foreground hover:text-primary">
                      {loading ? 'Chargement...' : settings.contact_phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Livraison</h3>
                    <p className="text-muted-foreground">
                      Partout au Maroc<br />
                      Livraison en 2-3 jours ouvrables
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Horaires de Réponse</h2>
              <p className="text-muted-foreground mb-4">
                Nous répondons à tous les messages dans un délai de 24 heures durant les jours ouvrables.
              </p>
              <p className="text-sm text-muted-foreground">
                Lundi - Vendredi: 9h00 - 18h00<br />
                Samedi: 9h00 - 13h00<br />
                Dimanche: Fermé
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}