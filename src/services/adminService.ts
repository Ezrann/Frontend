export interface DashboardAnalytics {
  users: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    regular: number;
    newLast30Days: number;
  };
  listings: {
    total: number;
    active: number;
    pending: number;
    sold: number;
    removed: number;
    activeValue: number;
    newLast30Days: number;
  };
  sales: {
    totalSales: number;
    totalRevenue: number;
    averageSalePrice: number;
    monthlySales: number;
    monthlyRevenue: number;
    soldRate: number;
  };
  reports: {
    total: number;
    open: number;
  };
  recentListings: Array<{
    id: number;
    title: string;
    price: string | number;
    status: string;
    created_at?: string;
    seller_name?: string;
    category_name?: string;
  }>;
  recentSales: Array<{
    id: number;
    title: string;
    price: string | number;
    updated_at?: string;
    seller_name?: string;
    category_name?: string;
  }>;
}

export async function fetchDashboardAnalytics(): Promise<DashboardAnalytics> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "Failed to load dashboard analytics");
  }

  return res.json();
}
