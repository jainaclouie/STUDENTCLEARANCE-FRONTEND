import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Users, Clock, CheckCircle2, XCircle, LogOut } from "lucide-react";
// @ts-ignore
import { apiFetch, clearToken } from "@/api";

interface ClearanceStats {
  total: number;
  pending: number;
  cleared: number;
  rejected: number;
}

const EMPTY_STATS: ClearanceStats = { total: 0, pending: 0, cleared: 0, rejected: 0 };

export default function HomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ClearanceStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await apiFetch("/api/students/stats");
        setStats(data);
      } catch (err) {
        console.error("Failed to load clearance stats:", err);
        setError("Could not load clearance stats.");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const clearedPct = stats.total ? Math.round((stats.cleared / stats.total) * 100) : 0;

  async function handleLogout() {
    try {
      await apiFetch("/logout", { method: "POST" });
    } catch {
      // token may already be invalid; log out locally anyway
    }
    clearToken();
    navigate("/");
  }

  const cards = [
    {
      label: "Total Students",
      value: stats.total,
      icon: Users,
      accent: "from-blue-600 to-indigo-600",
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      accent: "from-amber-500 to-orange-500",
      iconBg: "bg-amber-50 text-amber-600",
    },
    {
      label: "Cleared",
      value: stats.cleared,
      icon: CheckCircle2,
      accent: "from-emerald-500 to-green-600",
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      accent: "from-rose-500 to-red-600",
      iconBg: "bg-rose-50 text-rose-600",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-100 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clearance Dashboard</h1>
            <p className="mt-1 text-gray-500">Overview of student clearance status</p>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => navigate("/students")}
              className="mr-3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              Manage Students
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ label, value, icon: Icon, accent, iconBg }) => (
            <div
              key={label}
              className="rounded-2xl border-2 border-blue-100 bg-white p-6 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-gray-500">{label}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {loading ? "—" : value}
              </p>
              <div className={`mt-4 h-1.5 w-full rounded-full bg-gradient-to-r ${accent} opacity-80`} />
            </div>
          ))}
        </div>

        {/* Cleared progress */}
        <div className="mt-8 rounded-2xl border-2 border-blue-100 bg-white p-6 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Overall Clearance Progress</h2>
            <span className="text-sm font-medium text-gray-500">{loading ? "—" : `${clearedPct}%`}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-500"
              style={{ width: `${loading ? 0 : clearedPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
