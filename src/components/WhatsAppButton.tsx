import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const handleClick = () => {
    const message = encodeURIComponent('Bonjour Bayan Cosmetic, j\'aimerais avoir plus d\'informations sur vos produits.');
    window.open(`https://wa.me/212600000000?text=${message}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#22c55e] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      aria-label="Contacter sur WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}