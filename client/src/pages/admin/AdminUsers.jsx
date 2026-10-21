
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, RefreshCw } from "lucide-react";

const API_URL = "http://localhost:5000/api/admin";

function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/users`, {
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
            : "Unable to load users."
        );
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div style={styles.page}>
      <button
        style={styles.backButton}
        onClick={() => navigate("/admin/dashboard")}
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div style={styles.header}>
        <div style={styles.icon}>
          <Users size={34} />
        </div>
        <div>
          <h1>User Management</h1>
          <p>View all registered SmartQueue accounts.</p>
        </div>
        <button style={styles.refreshButton} onClick={loadUsers}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div style={styles.summary}>
        <h2>{users.length}</h2>
        <p>Total registered accounts</p>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.tableCard}>
        <div style={styles.tableTitle}>Registered Accounts</div>

        {loading ? (
          <p style={styles.message}>Loading users...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Registered</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td style={styles.td}>{user.name || "—"}</td>
                    <td style={styles.td}>{user.email || "—"}</td>
                    <td style={styles.td}>
                      <span style={roleStyle(user.role)}>
                        {user.role || "user"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" style={styles.td}>
                      No accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function roleStyle(role) {
  const colors = {
    admin: { background: "#ede9fe", color: "#6d28d9" },
    staff: { background: "#dbeafe", color: "#1d4ed8" },
    user: { background: "#dcfce7", color: "#166534" }
  };

  return {
    ...colors[role] || colors.user,
    padding: "6px 12px",
    borderRadius: 20,
    fontWeight: 700,
    fontSize: 13
  };
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px",
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
    color: "#6547f5",
    background: "#ede9fe"
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
  summary: {
    padding: 24,
    marginBottom: 24,
    borderRadius: 18,
    background: "linear-gradient(120deg, #6547f5, #3478ff)",
    color: "white",
    maxWidth: 280
  },
  tableCard: {
    background: "white",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 8px 30px rgba(30,40,90,.06)"
  },
  tableTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 18
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left"
  },
  th: {
    padding: 14,
    background: "#f1f5f9",
    whiteSpace: "nowrap"
  },
  td: {
    padding: 14,
    borderBottom: "1px solid #e2e8f0"
  },
  message: { padding: 20 },
  error: {
    padding: 14,
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 10
  }
};

export default AdminUsers;
