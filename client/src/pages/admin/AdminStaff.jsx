
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserCheck, RefreshCw } from "lucide-react";

const API_URL = "http://localhost:5000/api/admin";

function AdminStaff() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStaff() {
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
            : "Unable to load staff."
        );
      }

      const data = await response.json();
      setStaff((data.users || []).filter(
        (person) => person.role === "staff"
      ));
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStaff();
  }, []);

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
          <UserCheck size={34} />
        </div>
        <div>
          <h1>Staff Management</h1>
          <p>View staff members and their assigned accounts.</p>
        </div>
        <button style={styles.refreshButton} onClick={loadStaff}>
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <div style={styles.summary}>
        <h2>{staff.length}</h2>
        <p>Registered staff members</p>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <section style={styles.card}>
        <h2>Staff Directory</h2>

        {loading ? (
          <p>Loading staff...</p>
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
                {staff.map((person) => (
                  <tr key={person._id}>
                    <td style={styles.td}>{person.name || "—"}</td>
                    <td style={styles.td}>{person.email || "—"}</td>
                    <td style={styles.td}>
                      <span style={styles.badge}>STAFF</span>
                    </td>
                    <td style={styles.td}>
                      {person.createdAt
                        ? new Date(person.createdAt).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                  </tr>
                ))}

                {staff.length === 0 && (
                  <tr>
                    <td colSpan="4" style={styles.td}>
                      No staff accounts found. Set an account's role to
                      {" "}staff in MongoDB Atlas to list it here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
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
    background: "#dbeafe",
    color: "#2563eb"
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
    background: "linear-gradient(120deg, #2563eb, #06b6d4)",
    color: "white",
    maxWidth: 280
  },
  card: {
    background: "white",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 8px 30px rgba(30,40,90,.06)"
  },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { padding: 14, background: "#f1f5f9", whiteSpace: "nowrap" },
  td: { padding: 14, borderBottom: "1px solid #e2e8f0" },
  badge: {
    padding: "6px 12px",
    borderRadius: 20,
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: 700,
    fontSize: 13
  },
  error: {
    padding: 14,
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 10
  }
};

export default AdminStaff;
