import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, DollarSign, Clock, Package } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    lowStock: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentOrders();
  }, []);

  const fetchStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's orders
    const { data: ordersToday } = await supabase
      .from("orders")
      .select("total_amount")
      .gte("created_at", today.toISOString());

    // Pending orders
    const { data: pending } = await supabase
      .from("orders")
      .select("id")
      .eq("status", "En attente");

    // Low stock products
    const { data: lowStock } = await supabase
      .from("products")
      .select("id")
      .lte("stock_quantity", 10);

    const todayRevenue = ordersToday?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

    setStats({
      todayOrders: ordersToday?.length || 0,
      todayRevenue,
      pendingOrders: pending?.length || 0,
      lowStock: lowStock?.length || 0,
    });
  };

  const fetchRecentOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    setRecentOrders(data || []);
  };

  const statCards = [
    {
      title: "Commandes aujourd'hui",
      value: stats.todayOrders,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Revenu du jour",
      value: `${stats.todayRevenue.toFixed(2)} MAD`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Commandes en attente",
      value: stats.pendingOrders,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Produits stock faible",
      value: stats.lowStock,
      icon: Package,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  const statusColors: Record<string, string> = {
    "En attente": "bg-yellow-100 text-yellow-800",
    "Confirmée": "bg-blue-100 text-blue-800",
    "En préparation": "bg-purple-100 text-purple-800",
    "Expédiée": "bg-indigo-100 text-indigo-800",
    "Livrée": "bg-green-100 text-green-800",
    "Annulée": "bg-red-100 text-red-800",
  };

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold mb-8">Tableau de bord</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Dernières commandes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Numéro
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Client
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Ville
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Total
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Statut
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium">{order.order_number}</td>
                    <td className="py-3 px-4 text-sm">{order.customer_name}</td>
                    <td className="py-3 px-4 text-sm">{order.customer_city}</td>
                    <td className="py-3 px-4 text-sm font-medium">
                      {Number(order.total_amount).toFixed(2)} MAD
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[order.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;