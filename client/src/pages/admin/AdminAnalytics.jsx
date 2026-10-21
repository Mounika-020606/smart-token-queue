
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  RefreshCw,
  Ticket
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

const API_URL = "http://localhost:5000/api/admin";
const COLORS = ["#7c3aed", "#2563eb", "#06b6d4", "#ec4899"];

const EMPTY_STATS = {
  totalTokens: 0,
  waitingTokens: 0,
  servingTokens: 0,
  completedTokens: 0,
  cancelledTokens: 0
};

function AdminAnalytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(EMPTY_STATS);
  const [recentTokens, setRecentTokens] = useState([]);
  const [serviceStats, setServiceStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          response.status === 403
            ? "Admin access is required."
            : "Unable to load analytics."
        );
      }

      const data = await response.json();

      setStats({
        ...EMPTY_STATS,
        ...(data.stats || {})
      });

      setRecentTokens(data.recentTokens || []);
      setServiceStats(data.serviceStats || []);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const statusData = [
    { name: "Waiting", value: stats.waitingTokens },
    { name: "Serving", value: stats.servingTokens },
    { name: "Completed", value: stats.completedTokens },
    { name: "Cancelled", value: stats.cancelledTokens }
  ];

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit"
        })
      : "—";

  return (
    <div style={styles.page}>
      <button
        style={styles.backButton}
        onClick={() => navigate("/admin/dashboard")}
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <header style={styles.header}>
        <div style={styles.icon}>
          <BarChart3 size={34} />
        </div>
        <div>
          <h1>Queue Analytics</h1>
          <p>Review token status and recent queue activity.</p>
        </div>
        <button style={styles.refreshButton} onClick={loadAnalytics}>
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      {error && <p style={styles.error}>{error}</p>}

      <section style={styles.statsGrid}>
        <StatCard title="Total Tokens" value={stats.totalTokens} color="#7c3aed" />
        <StatCard title="Waiting" value={stats.waitingTokens} color="#d97706" />
        <StatCard title="Serving" value={stats.servingTokens} color="#2563eb" />
        <StatCard title="Completed" value={stats.completedTokens} color="#16a34a" />
        <StatCard title="Cancelled" value={stats.cancelledTokens} color="#db2777" />
      </section>

      {loading ? (
        <p style={{ marginTop: 25 }}>Loading analytics...</p>
      ) : (
        <>
          <section style={styles.chartGrid}>
            <div style={styles.card}>
              <h2>Token Status Distribution</h2>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={styles.card}>
              <h2>Tokens by Service</h2>
              {serviceStats.length > 0 ? (
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={serviceStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="service" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="total"
                        name="Tokens"
                        fill="#7c3aed"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p style={styles.note}>
                  Service chart data is not yet provided by the backend.
                  The status chart above uses the returned database totals.
                </p>
              )}
            </div>
          </section>

          <section style={{ ...styles.card, marginTop: 24 }}>
            <h2>Recent Token Activity</h2>

            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Token</th>
                    <th style={styles.th}>Customer</th>
                    <th style={styles.th}>Service</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTokens.map((item) => (
                    <tr key={item._id}>
                      <td style={styles.td}>
                        <Ticket size={15} style={{ verticalAlign: "middle" }} />
                        {" "}{item.tokenNumber || "—"}
                      </td>
                      <td style={styles.td}>
                        {item.userId?.name || "Unknown"}
                      </td>
                      <td style={styles.td}>{item.service || "—"}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          color: statusColor(item.status)
                        }}>
                          {item.status || "—"}
                        </span>
                      </td>
                      <td style={styles.td}>{formatDate(item.createdAt)}</td>
                    </tr>
                  ))}

                  {recentTokens.length === 0 && (
                    <tr>
                      <td colSpan="5" style={styles.td}>
                        No token activity found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

function statusColor(status) {
  const colors = {
    Waiting: "#d97706",
    Serving: "#2563eb",
    Completed: "#16a34a",
    Cancelled: "#dc2626"
  };

  return colors[status] || "#64748b";
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: 32,
    boxSizing: "border-box",
    background: "#f5f6ff",
    fontFamily: "Arial, sans-serif",
    color: "#172033"
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 18px",
    border: 0,
    borderRadius: 10,
    background: "#6547f5",
    color: "white",
    cursor: "pointer",
    fontWeight: 600
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    flexWrap: "wrap",
    margin: "32px 0"
  },
  icon: {
    padding: 18,
    borderRadius: 16,
    background: "#fce7f3",
    color: "#db2777"
  },
  refreshButton: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginLeft: "auto",
    padding: "11px 16px",
    border: "1px solid #ddd6fe",
    borderRadius: 10,
    background: "white",
    cursor: "pointer"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 16,
    marginBottom: 24
  },
  statCard: {
    background: "white",
    padding: 22,
    borderRadius: 16,
    boxShadow: "0 8px 30px rgba(30,40,90,.06)"
  },
  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 350px), 1fr))",
    gap: 20
  },
  card: {
    background: "white",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 8px 30px rgba(30,40,90,.06)",
    minWidth: 0
  },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { padding: 14, background: "#f1f5f9", whiteSpace: "nowrap" },
  td: { padding: 14, borderBottom: "1px solid #e2e8f0" },
  badge: {
    padding: "5px 10px",
    borderRadius: 16,
    background: "#f1f5f9",
    fontWeight: 700
  },
  note: {
    padding: 15,
    background: "#f1f5f9",
    borderRadius: 12,
    color: "#475569"
  },
  error: {
    padding: 14,
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 10
  }
};

export default AdminAnalytics;
