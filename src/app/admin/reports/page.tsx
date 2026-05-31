"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle,
  Clock3,
  Eye,
  Filter,
  Flag,
  RefreshCw,
  Shield,
  User,
  MessageSquareText,
} from "lucide-react";

interface ReportItem {
  id: number;
  product_id?: number | null;
  user_id?: number | null;
  reason?: string;
  detail?: string;
  status?: string;
  created_at?: string;
  reporter_name?: string;
  reported_user_name?: string;
  product_title?: string;
}

const reasonLabels: Record<string, string> = {
  fake_product: "Fake product",
  not_sure: "Not sure about authenticity",
  misleading: "Misleading description or price",
  other: "Other concern",
};

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "reviewed" | "closed">("open");

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";

    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (profileRes.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!profileRes.ok) {
        setError("Unable to verify your admin session.");
        return;
      }

      const profileData = await profileRes.json();
      const role = String(profileData.role || "").toLowerCase().trim();
      setCurrentRole(role || null);

      if (role !== "admin" && role !== "administrator") {
        router.push("/");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        setError("Failed to load reports");
        return;
      }

      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      console.error("Fetch reports error:", fetchError);
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const updateReportStatus = async (reportId: number, status: "open" | "reviewed" | "closed") => {
    try {
      setProcessingId(reportId);
      setError("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportId}/status`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to update report status");
        toast.error(data.message || "Failed to update report status");
        return;
      }

      setReports((current) =>
        current.map((report) => (report.id === reportId ? { ...report, status } : report))
      );
      setMessage(`Report marked as ${status}.`);
      toast.success(`Report marked as ${status}.`);
      setTimeout(() => setMessage(""), 3000);
    } catch (updateError) {
      console.error("Update report status error:", updateError);
      setError("Failed to update report status.");
      toast.error("Failed to update report status.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredReports = reports.filter((report) => {
    if (filter === "all") return true;
    return (report.status || "open") === filter;
  });

  const openReports = reports.filter((report) => (report.status || "open") === "open").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-6 font-medium text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_28%),linear-gradient(135deg,#f8fafc_0%,#e0f2fe_46%,#eef2ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-4xl border border-white/70 bg-white/90 p-6 shadow-[0_30px_90px_rgba(30,64,175,0.12)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Link>

              <div className="mt-5 flex items-center gap-3">
                <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                  <Flag className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                    Reports inbox
                  </h1>
                  <p className="mt-2 text-sm text-slate-500">
                    Review fake or uncertain product reports before they spread.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-amber-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-600">Open reports</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{openReports}</p>
              </div>
              <div className="rounded-3xl bg-slate-100 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin role</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {currentRole || "admin"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-emerald-700 shadow-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700 shadow-sm">
            {error}
          </div>
        )}

        <div className="rounded-4xl border border-white/70 bg-white/90 p-6 shadow-[0_30px_90px_rgba(30,64,175,0.12)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Flagged products</h2>
              <p className="mt-1 text-sm text-slate-500">
                Reports submitted by users about suspicious or fake listings.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["all", "open", "reviewed", "closed"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    filter === status
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
              <button
                onClick={fetchReports}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => {
                const reasonLabel = reasonLabels[report.reason || ""] || report.reason || "Other concern";

                return (
                  <div
                    key={report.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                            {report.status || "open"}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                            {reasonLabel}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-slate-900">
                            {report.product_title || "Reported product"}
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                            <span className="inline-flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Reporter: {report.reporter_name || "Unknown"}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Reported user: {report.reported_user_name || "Unknown"}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <Clock3 className="h-4 w-4" />
                              {formatDate(report.created_at)}
                            </span>
                          </div>
                        </div>

                        {report.detail && (
                          <p className="max-w-3xl rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-600">
                            {report.detail}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {report.product_id && (
                          <Link
                            href={`/products/${report.product_id}`}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4" />
                            View product
                          </Link>
                        )}
                        <button
                          onClick={() => updateReportStatus(report.id, "reviewed")}
                          disabled={processingId === report.id || report.status === "reviewed"}
                          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Reviewed
                        </button>
                        <button
                          onClick={() => updateReportStatus(report.id, "closed")}
                          disabled={processingId === report.id || report.status === "closed"}
                          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                          <MessageSquareText className="h-4 w-4" />
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                <Filter className="mx-auto h-12 w-12 text-slate-400" />
                <p className="mt-4 text-lg font-semibold text-slate-900">No reports found</p>
                <p className="mt-2 text-sm text-slate-500">
                  {filter === "all"
                    ? "There are no product reports yet."
                    : `There are no ${filter} reports right now.`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}