
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, RefreshCw, Ticket } from "lucide-react";

const API_URL = "http://localhost:5000/api";

const SERVICE_NAMES = [
  "Banking",
  "Government",
  "Customer Support",
  "Healthcare"
];

function AdminServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadServices() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/tokens/active-queue`, {
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
            : "Unable to load active queue."
        );
      }

      const data = await response.json();
      const tokens = data.tokens || [];

      setServices(
        SERVICE_NAMES.map((service) => {
          const matching = tokens.filter(
            (item) => item.service === service
          );

          return {
            service,
            total: matching.length,
            waiting: matching.filter(
              (item) => item.status === "Waiting"
            ).length,
            serving: matching.filter(
              (item) => item.status === "Serving"
            ).length
          };
        })
      );
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
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
          <Building2 size={34} />
        </div>
        <div>
          <h1>Service Counters</h1>
          <p>Monitor active queue activity across services.</p>
        </div>
        <button style={styles.refreshButton} onClick={loadServices}>
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <div style={styles.note}>
        These figures show active tokens only (Waiting and Serving),
        based on your existing active-queue endpoint.
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {loading ? (
        <p>Loading service activity...</p>
      ) : (
        <div style={styles.grid}>
          {services.map((service, index) => (
            <div key={service.service} style={styles.card}>
              <div style={{
                ...styles.serviceIcon,
                background: ["#ede9fe", "#dbeafe", "#cffafe", "#fce7f3"][index],
                color: ["#7c3aed", "#2563eb", "#0891b2", "#db2777"][index]
              }}>
                <Building2 size={28} />
              </div>

              <h2>{service.service}</h2>

              <p style={styles.label}>Active tokens</p>
              <h1 style={styles.total}>{service.total}</h1>

              <div style={styles.details}>
                <span>🟠 Waiting: {service.waiting}</span>
                <span>🔵 Serving: {service.serving}</span>
              </div>

              <div style={styles.footer}>
                <Ticket size={16} />
                Live queue summary
              </div>
            </div>
          ))}
        </div>
      )}
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
    background: "#cffafe",
    color: "#0891b2"
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
  note: {
    padding: 16,
    marginBottom: 22,
    background: "#e0f2fe",
    color: "#075985",
    borderRadius: 12
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20
  },
  card: {
    background: "white",
    padding: 25,
    borderRadius: 20,
    boxShadow: "0 8px 30px rgba(30,40,90,.06)"
  },
  serviceIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    display: "grid",
    placeItems: "center"
  },
  label: { color: "#64748b", marginBottom: 0 },
  total: { fontSize: 42, margin: "8px 0 18px" },
  details: {
    display: "grid",
    gap: 10,
    padding: 15,
    borderRadius: 12,
    background: "#f8fafc"
  },
  footer: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    color: "#64748b",
    fontSize: 13
  },
  error: {
    padding: 14,
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 10
  }
};

export default AdminServices;
