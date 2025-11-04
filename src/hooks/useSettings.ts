import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Settings {
  shipping_costs: Record<string, number>;
  free_shipping_threshold: number;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  social_instagram: string;
  social_facebook: string;
  social_tiktok: string;
}

const DEFAULT_SETTINGS: Settings = {
  shipping_costs: {
    'Casablanca': 30,
    'Rabat': 35,
    'Marrakech': 40,
    'Fès': 40,
    'Tanger': 40,
    'Agadir': 40,
    'Meknès': 40,
    'Oujda': 50,
    'Kénitra': 35,
    'Tétouan': 40,
    'Salé': 35,
    'Autre': 50,
  },
  free_shipping_threshold: 500,
  contact_email: "contact@bayancosmetic.ma",
  contact_phone: "+212 600 000 000",
  whatsapp_number: "212600000000",
  social_instagram: "#",
  social_facebook: "#",
  social_tiktok: "#",
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from("settings").select("*");

      if (!error && data) {
        const settingsMap: Record<string, any> = {};
        data.forEach((item) => {
          settingsMap[item.key] = item.value;
        });

        // Parse and clean settings
        const parsedSettings: Settings = {
          shipping_costs: settingsMap.shipping_costs || DEFAULT_SETTINGS.shipping_costs,
          free_shipping_threshold: typeof settingsMap.free_shipping_threshold === 'number' 
            ? settingsMap.free_shipping_threshold 
            : DEFAULT_SETTINGS.free_shipping_threshold,
          contact_email: typeof settingsMap.contact_email === 'string' 
            ? settingsMap.contact_email.replace(/"/g, '') 
            : DEFAULT_SETTINGS.contact_email,
          contact_phone: typeof settingsMap.contact_phone === 'string' 
            ? settingsMap.contact_phone.replace(/"/g, '') 
            : DEFAULT_SETTINGS.contact_phone,
          whatsapp_number: typeof settingsMap.whatsapp_number === 'string' 
            ? settingsMap.whatsapp_number.replace(/"/g, '') 
            : DEFAULT_SETTINGS.whatsapp_number,
          social_instagram: typeof settingsMap.social_instagram === 'string' 
            ? settingsMap.social_instagram.replace(/"/g, '') 
            : DEFAULT_SETTINGS.social_instagram,
          social_facebook: typeof settingsMap.social_facebook === 'string' 
            ? settingsMap.social_facebook.replace(/"/g, '') 
            : DEFAULT_SETTINGS.social_facebook,
          social_tiktok: typeof settingsMap.social_tiktok === 'string' 
            ? settingsMap.social_tiktok.replace(/"/g, '') 
            : DEFAULT_SETTINGS.social_tiktok,
        };

        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, refetch: fetchSettings };
};
