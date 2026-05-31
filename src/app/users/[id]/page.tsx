import React from "react";
import Link from "next/link";
import { CheckCircle, Star, MapPin } from "lucide-react";

export default async function SellerProfile({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  const id = resolved.id;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/public/${id}`, { cache: "no-store" });
    if (!res.ok) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold">Seller not found</h2>
            <p className="mt-2 text-sm text-slate-500">The seller profile could not be loaded.</p>
            <div className="mt-4">
              <Link href="/products" className="text-sm text-blue-600">Back to listings</Link>
            </div>
          </div>
        </div>
      );
    }

    const data = await res.json();
    const user = data.user || {};
    const listings = data.listings || { total: 0, active: 0, sold: 0 };
    const ratings = data.ratings || { total: 0, average: 0 };

    const initials = (user.name || "").split(" ").filter(Boolean).slice(0,2).map((p:any)=>p[0]?.toUpperCase()).join("") || "S";

    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.04),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4">
            <Link href="/products" className="text-sm text-blue-600">Back to listings</Link>
          </div>

          <section className="rounded-[20px] border border-slate-200 bg-white p-6 shadow">
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 shrink-0 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold">
                {user.avatar ? (
                  <img src={`${process.env.NEXT_PUBLIC_API_URL}/${user.avatar}`} alt={user.name} className="h-20 w-20 rounded-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                  {user.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      <CheckCircle className="h-4 w-4" /> Verified Seller
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">{Array.from({length:5}).map((_,i)=>(
                      <Star key={i} className={`h-4 w-4 ${i < Math.round(ratings.average) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                    ))}</div>
                    <div className="ml-2 font-semibold text-slate-900">{ratings.average.toFixed(1)}</div>
                    <div className="text-slate-500">({ratings.total} reviews)</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
                    <div className="text-xs text-slate-400">Items sold</div>
                    <div className="mt-1 font-semibold text-slate-900">{listings.sold}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
                    <div className="text-xs text-slate-400">Active listings</div>
                    <div className="mt-1 font-semibold text-slate-900">{listings.active}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
                    <div className="text-xs text-slate-400">Member since</div>
                    <div className="mt-1 font-semibold text-slate-900">{new Date(user.memberSince).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href={`/products?user=${user.id}`} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">View listings</Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  } catch (err) {
    console.error('SellerProfile error:', err);
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold">Error</h2>
          <p className="mt-2 text-sm text-slate-500">Could not load seller profile.</p>
        </div>
      </div>
    );
  }
}
