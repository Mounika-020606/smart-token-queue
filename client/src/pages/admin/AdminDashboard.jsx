
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Ticket,
  Users,
  Clock,
  Activity,
  LogOut,
  UserCheck,
  Building2,
  BarChart3,
  Settings,
  RefreshCw
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";

import "../../styles/admin-dashboard.css";

const API_URL = "http://localhost:5000/api/admin";

const COLORS = ["#7c3aed", "#2563eb", "#06b6d4", "#ec4899", "#16a34a"];

const EMPTY_STATS = {
  totalUsers: 0,
  totalStaff: 0,
  totalAdmins: 0,
  totalTokens: 0,
  waitingTokens: 0,
  servingTokens: 0,
  completedTokens: 0,
  cancelledTokens: 0
};

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(EMPTY_STATS);
  const [serviceStats, setServiceStats] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [recentTokens, setRecentTokens] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load statistics and user records from MongoDB through the backend.
  const loadDashboard = useCallback(async (showLoader = false) => {
    const jwt = localStorage.getItem("token");

    if (!jwt) {
      setError("Please log in as an administrator.");
      setLoading(false);
      navigate("/login");
      return;
    }

    if (showLoader) {
      setLoading(true);
    }

    try {
      setError("");

      const headers = {
        Authorization: `Bearer ${jwt}`
      };

      const [statsResponse, usersResponse] = await Promise.all([
        fetch(`${API_URL}/stats`, { headers }),
        fetch(`${API_URL}/users`, { headers })
      ]);

      if (
        statsResponse.status === 401 ||
        usersResponse.status === 401
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (
        statsResponse.status === 403 ||
        usersResponse.status === 403
      ) {
        throw new Error(
          "Access denied. Please log in using an account with the admin role."
        );
      }

      if (!statsResponse.ok || !usersResponse.ok) {
        throw new Error("Unable to load admin dashboard data.");
      }

      const statsData = await statsResponse.json();
      const usersData = await usersResponse.json();

      setStats({
        ...EMPTY_STATS,
        ...statsData.stats
      });

      setServiceStats(statsData.serviceStats || []);

      setDailyStats(
        (statsData.dailyStats || []).map((item) => ({
          ...item,
          day: new Date(
            `${item.date}T00:00:00`
          ).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short"
          })
        }))
      );

      setRecentTokens(statsData.recentTokens || []);
      setRegisteredUsers(usersData.users || []);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the backend. Make sure your server is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboard(true);

    const interval = setInterval(() => {
      loadDashboard(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [loadDashboard]);

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Navigate to a separate admin page.
  const openAdminPage = (path) => {
    navigate(path);
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const statusColor = (status) => {
    const colors = {
      Completed: "#16a34a",
      Waiting: "#d97706",
      Serving: "#2563eb",
      Cancelled: "#dc2626"
    };

    return colors[status] || "#64748b";
  };

  const statusData = [
    { name: "Waiting", value: stats.waitingTokens },
    { name: "Serving", value: stats.servingTokens },
    { name: "Completed", value: stats.completedTokens },
    { name: "Cancelled", value: stats.cancelledTokens }
  ];

  return (
    <div className="admin-dashboard">
      {/* Navigation bar */}
      <nav className="admin-navbar">
        <div className="admin-logo">
          <Ticket size={30} />
          <span>SmartQueue</span>
        </div>

        <div className="admin-nav-right">
          <span className="admin-welcome">
            👋 Admin Panel
          </span>

          <button
            type="button"
            className="admin-logout"
            onClick={logout}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </nav>

      <main className="admin-content">
        {/* Dashboard heading */}
        <section className="admin-header">
          <div>
            <p className="admin-label">
              ADMIN DASHBOARD
            </p>

            <h1>System Overview 📊</h1>

            <p>
              Monitor real token records, registered accounts,
              and queue activity. Dashboard refreshes every
              10 seconds.
            </p>
          </div>

          <div className="admin-live">
            <span />
            System Live
          </div>
        </section>

        {/* Refresh button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 20
          }}
        >
          <span>
            {loading
              ? "Loading dashboard data..."
              : "Dashboard data loaded"}
          </span>

          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              border: "none",
              borderRadius: 10,
              cursor: loading ? "wait" : "pointer"
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            style={{
              padding: 14,
              marginBottom: 20,
              borderRadius: 10,
              background: "#fee2e2",
              color: "#991b1b"
            }}
          >
            {error}

            <button
              type="button"
              onClick={() => loadDashboard(true)}
              style={{ marginLeft: 12 }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Main statistics */}
        <section className="admin-stats">
          <div className="admin-stat purple">
            <div className="admin-stat-icon">
              <Users size={28} />
            </div>

            <div>
              <p>Registered Customers</p>
              <h2>{loading ? "..." : stats.totalUsers}</h2>
            </div>
          </div>

          <div className="admin-stat blue">
            <div className="admin-stat-icon">
              <Ticket size={28} />
            </div>

            <div>
              <p>Total Tokens</p>
              <h2>{loading ? "..." : stats.totalTokens}</h2>
            </div>
          </div>

          <div className="admin-stat cyan">
            <div className="admin-stat-icon">
              <Clock size={28} />
            </div>

            <div>
              <p>Waiting Now</p>
              <h2>{loading ? "..." : stats.waitingTokens}</h2>
            </div>
          </div>

          <div className="admin-stat pink">
            <div className="admin-stat-icon">
              <Activity size={28} />
            </div>

            <div>
              <p>Currently Serving</p>
              <h2>{loading ? "..." : stats.servingTokens}</h2>
            </div>
          </div>
        </section>

        {/* Additional statistics */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 16,
            margin: "24px 0"
          }}
        >
          <div className="admin-management-card">
            <h3>✅ Completed</h3>
            <h2>{stats.completedTokens}</h2>
          </div>

          <div className="admin-management-card">
            <h3>❌ Cancelled</h3>
            <h2>{stats.cancelledTokens}</h2>
          </div>

          <div className="admin-management-card">
            <h3>👨‍💼 Staff Members</h3>
            <h2>{stats.totalStaff}</h2>
          </div>

          <div className="admin-management-card">
            <h3>🛡️ Administrators</h3>
            <h2>{stats.totalAdmins}</h2>
          </div>
        </section>

        {/* Analytics charts */}
        <section style={{ marginTop: 35 }}>
          <h2>📈 Queue Analytics</h2>

          <p>
            Charts use statistics retrieved from your MongoDB database.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
              gap: 20,
              marginTop: 20
            }}
          >
            {/* Status pie chart */}
            <div
              className="admin-management-card"
              style={{ minWidth: 0 }}
            >
              <h3>Token Status Distribution</h3>

              <div style={{ width: "100%", height: 290 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, value }) =>
                        `${name}: ${value}`
                      }
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

            {/* Service bar chart */}
            <div
              className="admin-management-card"
              style={{ minWidth: 0 }}
            >
              <h3>Tokens by Service</h3>

              <div style={{ width: "100%", height: 290 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={serviceStats}
                    margin={{
                      top: 15,
                      right: 10,
                      left: 0,
                      bottom: 35
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="service"
                      angle={-20}
                      textAnchor="end"
                      interval={0}
                      tick={{ fontSize: 11 }}
                    />

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
            </div>

            {/* Seven-day line chart */}
            <div
              className="admin-management-card"
              style={{ minWidth: 0 }}
            >
              <h3>Token Activity — Last 7 Days</h3>

              <div style={{ width: "100%", height: 290 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailyStats}
                    margin={{
                      top: 15,
                      right: 15,
                      left: 0,
                      bottom: 5
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Tokens Created"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Management cards: each opens a separate page */}
        <section
          className="admin-management"
          style={{ marginTop: 30 }}
        >
          {/* User management */}
          <div className="admin-management-card">
            <div className="management-icon purple-icon">
              <Users size={32} />
            </div>

            <h2>User Management</h2>

            <p>
              View registered accounts and their roles.
            </p>

            <button
              type="button"
              onClick={() => openAdminPage("/admin/users")}
            >
              <Users size={18} />
              Manage Users
            </button>
          </div>

          {/* Staff management */}
          <div className="admin-management-card">
            <div className="management-icon blue-icon">
              <UserCheck size={32} />
            </div>

            <h2>Staff Management</h2>

            <p>
              View staff members and their assigned roles.
            </p>

            <button
              type="button"
              onClick={() => openAdminPage("/admin/staff")}
            >
              <UserCheck size={18} />
              View Staff
            </button>
          </div>

          {/* Service counters */}
          <div className="admin-management-card">
            <div className="management-icon cyan-icon">
              <Building2 size={32} />
            </div>

            <h2>Service Counters</h2>

            <p>
              Monitor queue activity for each service.
            </p>

            <button
              type="button"
              onClick={() => openAdminPage("/admin/services")}
            >
              <Building2 size={18} />
              View Services
            </button>
          </div>

          {/* Queue analytics */}
          <div className="admin-management-card">
            <div className="management-icon pink-icon">
              <BarChart3 size={32} />
            </div>

            <h2>Queue Analytics</h2>

            <p>
              Review token status and recent queue activity.
            </p>

            <button
              type="button"
              onClick={() => openAdminPage("/admin/analytics")}
            >
              <BarChart3 size={18} />
              View Activity
            </button>
          </div>
        </section>

        {/* Registered users table remains on dashboard */}
        <section
          id="registered-users"
          style={{ marginTop: 35, overflowX: "auto" }}
        >
          <h2>👥 Registered Users and Staff</h2>

          <p>Account records retrieved from MongoDB.</p>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 16,
              background: "white"
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f1f5f9",
                  textAlign: "left"
                }}
              >
                <th style={{ padding: 12 }}>Name</th>
                <th style={{ padding: 12 }}>Email</th>
                <th style={{ padding: 12 }}>Role</th>
                <th style={{ padding: 12 }}>Registered</th>
              </tr>
            </thead>

            <tbody>
              {registeredUsers.map((user) => (
                <tr key={user._id}>
                  <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>
                    {user.name}
                  </td>

                  <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>
                    {user.email}
                  </td>

                  <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>
                    {user.role}
                  </td>

                  <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>
                    {formatDate(user.createdAt)}
                  </td>
                </tr>
              ))}

              {!loading && registeredUsers.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: 16 }}>
                    No registered accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Service summary */}
        <section
          id="service-analytics"
          style={{ marginTop: 35 }}
        >
          <h2>🏢 Service Summary</h2>

          <p>Token totals by service.</p>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 16
            }}
          >
            {serviceStats.map((service) => (
              <div
                key={service.service}
                className="admin-management-card"
              >
                <h3>{service.service}</h3>
                <h2>{service.total}</h2>
                <p>Tokens created</p>
              </div>
            ))}

            {!loading && serviceStats.length === 0 && (
              <p>No service records found.</p>
            )}
          </div>
        </section>

        {/* Recent token activity */}
        <section
          id="recent-activity"
          style={{ marginTop: 35, overflowX: "auto" }}
        >
          <h2>🎟️ Recent Token Activity</h2>

          <p>Latest token records from your database.</p>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 16,
              background: "white"
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f1f5f9",
                  textAlign: "left"
                }}
              >
                <th style={{ padding: 12 }}>Token</th>
                <th style={{ padding: 12 }}>Customer</th>
                <th style={{ padding: 12 }}>Service</th>
                <th style={{ padding: 12 }}>Status</th>
                <th style={{ padding: 12 }}>Created</th>
              </tr>
            </thead>

            <tbody>
              {recentTokens.map((token) => (
                <tr key={token._id}>
                  <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>
                    <strong>{token.tokenNumber || "—"}</strong>
                  </td>

                  <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>
                    {token.userId?.name || "Unknown"}
                  </td>

                  <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>
                    {token.service || "—"}
                  </td>

                  <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>
                    <span
                      style={{
                        color: statusColor(token.status),
                        fontWeight: 600
                      }}
                    >
                      {token.status}
                    </span>
                  </td>

                  <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>
                    {formatDate(token.createdAt)}
                  </td>
                </tr>
              ))}

              {!loading && recentTokens.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: 16 }}>
                    No token activity found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* System status */}
        <section
          className="admin-system-card"
          style={{ marginTop: 35 }}
        >
          <div className="system-icon">
            <Settings size={32} />
          </div>

          <div>
            <p className="small-title">SYSTEM STATUS</p>
            <h2>SmartQueue Admin Monitoring</h2>
            <p>
              Dashboard information is retrieved from the backend
              and MongoDB.
            </p>
          </div>

          <div className="system-status">
            <span />
            {error ? "Check Connection" : "Operational"}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="admin-footer">
        <div>
          <Ticket size={22} />
          <span>SmartQueue</span>
        </div>

        <p>
          AI-Driven Smart Token and Queue Management System
        </p>
      </footer>
    </div>
  );
}

export default AdminDashboard;
