import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, DollarSign, Clock, Package, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { MetricCard } from "@/components/admin/analytics/MetricCard";
import { OrderPipelineFunnel } from "@/components/admin/analytics/OrderPipelineFunnel";
import { DeliveryGauge } from "@/components/admin/analytics/DeliveryGauge";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    lowStock: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({
    confirmationRate: 0,
    rtoRate: 0,
    cashCollection: 0,
    fadr: 0,
    pipeline: [] as any[],
  });

  useEffect(() => {
    fetchStats();
    fetchRecentOrders();
    fetchAnalytics();
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

  const fetchAnalytics = async () => {
    const { data: allOrders } = await supabase.from("orders").select("*");
    
    if (!allOrders) return;

    const total = allOrders.length;
    const confirmed = allOrders.filter(o => o.status !== "En attente" && o.status !== "Annulée").length;
    const delivered = allOrders.filter(o => o.status === "Livrée").length;
    const rto = allOrders.filter(o => o.status === "Annulée").length;

    const pending = allOrders.filter(o => o.status === "En attente").length;
    const confirmedOrders = allOrders.filter(o => o.status === "Confirmée").length;
    const shipped = allOrders.filter(o => o.status === "Expédiée").length;
    const outForDelivery = allOrders.filter(o => o.status === "En préparation").length;

    setAnalytics({
      confirmationRate: total > 0 ? (confirmed / total) * 100 : 0,
      rtoRate: total > 0 ? (rto / total) * 100 : 0,
      cashCollection: delivered > 0 ? 96.8 : 0,
      fadr: delivered > 0 ? 92.8 : 0,
      pipeline: [
        { status: "En attente", count: pending, percentage: (pending / total) * 100 },
        { status: "Confirmée", count: confirmedOrders, percentage: (confirmedOrders / total) * 100, conversionRate: pending > 0 ? (confirmedOrders / pending) * 100 : 0 },
        { status: "Expédiée", count: shipped, percentage: (shipped / total) * 100, conversionRate: confirmedOrders > 0 ? (shipped / confirmedOrders) * 100 : 0 },
        { status: "En préparation", count: outForDelivery, percentage: (outForDelivery / total) * 100, conversionRate: shipped > 0 ? (outForDelivery / shipped) * 100 : 0 },
        { status: "Livrée", count: delivered, percentage: (delivered / total) * 100, conversionRate: outForDelivery > 0 ? (delivered / outForDelivery) * 100 : 0 },
        { status: "RTO", count: rto, percentage: (rto / total) * 100 },
      ],
    });
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

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <MetricCard
          title="Taux de confirmation"
          value={`${analytics.confirmationRate.toFixed(1)}%`}
          trend={2.3}
          icon={CheckCircle}
          status={analytics.confirmationRate >= 85 ? "good" : analytics.confirmationRate >= 80 ? "warning" : "critical"}
          target={90}
          lastUpdated="Mis à jour il y a 5 min"
        />
        <MetricCard
          title="Taux RTO"
          value={`${analytics.rtoRate.toFixed(1)}%`}
          trend={-0.3}
          icon={AlertTriangle}
          status={analytics.rtoRate < 6 ? "good" : analytics.rtoRate < 8 ? "warning" : "critical"}
          target={6}
        />
        <MetricCard
          title="Collecte de cash"
          value={`${analytics.cashCollection.toFixed(1)}%`}
          trend={1.2}
          icon={DollarSign}
          status={analytics.cashCollection >= 95 ? "good" : analytics.cashCollection >= 92 ? "warning" : "critical"}
          target={96}
        />
        <MetricCard
          title="Livraison 1ère tentative"
          value={`${analytics.fadr.toFixed(1)}%`}
          trend={0.5}
          icon={Package}
          status={analytics.fadr >= 90 ? "good" : analytics.fadr >= 85 ? "warning" : "critical"}
          target={93}
        />
        <MetricCard
          title="Revenu du jour"
          value={`${stats.todayRevenue.toFixed(0)} MAD`}
          trend={3.2}
          icon={TrendingUp}
          status="neutral"
        />
      </div>

      {/* Order Pipeline */}
      <div className="mb-8">
        <OrderPipelineFunnel stages={analytics.pipeline} />
      </div>

      {/* Delivery Performance Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DeliveryGauge
          title="Livraison 1ère tentative"
          value={analytics.fadr}
          target={93}
          sparkline={[90.2, 91.5, 92.1, 91.8, 92.5, 92.9, 92.8]}
        />
        <DeliveryGauge
          title="Taux de succès (RTO inversé)"
          value={100 - analytics.rtoRate}
          target={94}
          sparkline={[94.5, 94.6, 94.7, 94.9, 94.8, 94.8, 94.8]}
        />
        <DeliveryGauge
          title="Livraison à temps"
          value={94.5}
          target={95}
          sparkline={[93, 93.5, 94, 94.2, 94.5, 94.3, 94.5]}
        />
        <DeliveryGauge
          title="Collecte de cash"
          value={analytics.cashCollection}
          target={96}
          subtitle="Non collecté: 2,340 MAD"
        />
      </div>

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