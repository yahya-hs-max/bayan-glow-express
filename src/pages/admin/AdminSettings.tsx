import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase.from("settings").select("*");

    if (!error && data) {
      const settingsMap: Record<string, any> = {};
      data.forEach((item) => {
        settingsMap[item.key] = item.value;
      });
      setSettings(settingsMap);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    const { error } = await supabase
      .from("settings")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("key", key);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le paramètre",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    setLoading(true);

    const updates = Object.keys(settings).map((key) =>
      updateSetting(key, settings[key])
    );

    const results = await Promise.all(updates);

    if (results.every((r) => r)) {
      toast({
        title: "Succès",
        description: "Paramètres mis à jour",
      });
      fetchSettings();
    }

    setLoading(false);
  };

  const updateLocalSetting = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold mb-8">Paramètres</h1>

      <div className="space-y-6">
        {/* Shipping Costs */}
        <Card>
          <CardHeader>
            <CardTitle>Frais de livraison par ville</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settings.shipping_costs &&
                Object.entries(settings.shipping_costs).map(([city, cost]) => (
                  <div key={city}>
                    <Label>{city}</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={cost as number}
                        onChange={(e) => {
                          const newCosts = { ...settings.shipping_costs, [city]: parseFloat(e.target.value) };
                          updateLocalSetting("shipping_costs", newCosts);
                        }}
                        className="mt-1"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        MAD
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Free Shipping Threshold */}
        <Card>
          <CardHeader>
            <CardTitle>Seuil de livraison gratuite</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Montant minimum pour livraison gratuite (MAD)</Label>
              <Input
                type="number"
                value={settings.free_shipping_threshold || 500}
                onChange={(e) => updateLocalSetting("free_shipping_threshold", parseFloat(e.target.value))}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={settings.contact_email?.replace(/"/g, "") || ""}
                  onChange={(e) => updateLocalSetting("contact_email", `"${e.target.value}"`)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input
                  type="tel"
                  value={settings.contact_phone?.replace(/"/g, "") || ""}
                  onChange={(e) => updateLocalSetting("contact_phone", `"${e.target.value}"`)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Numéro WhatsApp (format: 212XXXXXXXXX)</Label>
                <Input
                  type="tel"
                  value={settings.whatsapp_number?.replace(/"/g, "") || ""}
                  onChange={(e) => updateLocalSetting("whatsapp_number", `"${e.target.value}"`)}
                  className="mt-1"
                  placeholder="212XXXXXXXXX"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Réseaux sociaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Instagram</Label>
                <Input
                  type="url"
                  value={settings.social_instagram?.replace(/"/g, "") || ""}
                  onChange={(e) => updateLocalSetting("social_instagram", `"${e.target.value}"`)}
                  className="mt-1"
                  placeholder="https://instagram.com/bayancosmetic"
                />
              </div>
              <div>
                <Label>Facebook</Label>
                <Input
                  type="url"
                  value={settings.social_facebook?.replace(/"/g, "") || ""}
                  onChange={(e) => updateLocalSetting("social_facebook", `"${e.target.value}"`)}
                  className="mt-1"
                  placeholder="https://facebook.com/bayancosmetic"
                />
              </div>
              <div>
                <Label>TikTok</Label>
                <Input
                  type="url"
                  value={settings.social_tiktok?.replace(/"/g, "") || ""}
                  onChange={(e) => updateLocalSetting("social_tiktok", `"${e.target.value}"`)}
                  className="mt-1"
                  placeholder="https://tiktok.com/@bayancosmetic"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-black"
          size="lg"
        >
          {loading ? "Enregistrement..." : "Sauvegarder tous les paramètres"}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;