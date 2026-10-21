
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";

import {
  Ticket,
  Users,
  Clock,
  Brain,
  LogOut,
  Plus,
  Activity,
  RefreshCw,
  History,
  CheckCircle,
} from "lucide-react";

import "../../styles/dashboard.css";

const API = "http://localhost:5000/api";

function UserDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  const [tokens, setTokens] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const userName = user.name || "User";

  const fetchDashboardData = useCallback(async () => {
    const jwt = localStorage.getItem("token");

    let currentUser = {};
    try {
      currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      currentUser = {};
    }

    const userId = currentUser.id || currentUser._id;

    if (!jwt || !userId) {
      setError("Your session is missing. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${jwt}`,
      };

      // Load the user's token history and the read-only active queue.
      const [myResponse, queueResponse] = await Promise.all([
        fetch(`${API}/tokens/my-tokens/${userId}`, { headers }),
        fetch(`${API}/tokens/active-queue`, { headers }),
      ]);

      // Safely handle JSON or unexpected HTML error responses.
      const readResponse = async (response) => {
        const text = await response.text();
        try {
          return text ? JSON.parse(text) : {};
        } catch {
          throw new Error(
            "The server returned an unexpected response. Check that the backend is running."
          );
        }
      };

      const myData = await readResponse(myResponse);
      const queueData = await readResponse(queueResponse);

      if (myResponse.status === 401 || queueResponse.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError("Your session has expired. Please log in again.");
        setLoading(false);
        return;
      }

      if (!myResponse.ok) {
        throw new Error(myData.message || "Unable to load your tokens.");
      }

      if (!queueResponse.ok) {
        throw new Error(
          queueData.message || "Unable to load the active queue."
        );
      }

      const myTokens = Array.isArray(myData)
        ? myData
        : myData.tokens || [];

      const activeTokens = Array.isArray(queueData)
        ? queueData
        : queueData.tokens || [];

      setTokens(
        [...myTokens].sort(
          (a, b) =>
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        )
      );

      setQueue(activeTokens);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError(
        err.message ||
          "Unable to connect to SmartQueue. Check the backend."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const latestToken = tokens[0] || null;

  const token =
    latestToken?.tokenNumber ||
    latestToken?.token ||
    "No token yet";

  const service = latestToken?.service || "No service selected";
  const queueStatus = latestToken?.status || "No active token";
  const peopleAhead = latestToken?.peopleAhead ?? 0;
  const waitTime = latestToken?.waitTime ?? 0;

  // Find the token currently being served for the user's service.
  const nowServing = latestToken
    ? queue.find(
        (item) =>
          item.service === latestToken.service &&
          item.status === "Serving"
      )
    : null;

  // Show a useful message instead of "No active service".
  const nowServingLabel = !latestToken
    ? "Generate a token first"
    : nowServing
      ? nowServing.tokenNumber || "Customer being served"
      : queueStatus === "Serving"
        ? token
        : queueStatus === "Completed"
          ? "Service completed"
          : queueStatus === "Cancelled"
            ? "Token cancelled"
            : "Waiting for your turn";

  const progress =
    queueStatus === "Completed"
      ? 100
      : queueStatus === "Serving"
        ? 75
        : queueStatus === "Waiting"
          ? Math.max(10, Math.min(65, 65 - peopleAhead * 10))
          : 0;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-navbar">
        <div className="dashboard-logo">
          <Ticket size={30} />
          <span>SmartQueue</span>
        </div>

        <div className="dashboard-nav-right">
          <span className="dashboard-user">
            👋 Welcome, {userName}
          </span>

          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        <section className="welcome-section">
          <div>
            <p className="dashboard-label">USER DASHBOARD</p>
            <h1>Welcome Back, {userName}! 👋</h1>
            <p>Track your token and manage your queue easily.</p>
          </div>

          <div className="live-status">
            <span className="live-dot"></span>
            Queue Live
          </div>
        </section>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            margin: "16px 0",
          }}
        >
          <small>
            {lastUpdated
              ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
              : loading
                ? "Loading dashboard..."
                : "Waiting for dashboard data"}
            {" · Refreshes every 10 seconds"}
          </small>

          <button
            type="button"
            onClick={() => {
              setLoading(true);
              fetchDashboardData();
            }}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 14px",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: "12px",
              borderRadius: "8px",
              background: "#fee2e2",
              color: "#991b1b",
              marginBottom: "16px",
            }}
          >
            {error}
            {error.toLowerCase().includes("log in") && (
              <button
                type="button"
                onClick={() => navigate("/login")}
                style={{ marginLeft: "12px" }}
              >
                Go to Login
              </button>
            )}
          </div>
        )}

        {loading && <p role="status">Loading your token details...</p>}

        <section className="dashboard-stats">
          <div className="stat-card purple-card">
            <div className="stat-icon"><Ticket size={28} /></div>
            <div>
              <p>Your Latest Token</p>
              <h2>{token}</h2>
            </div>
          </div>

          <div className="stat-card blue-card">
            <div className="stat-icon"><Users size={28} /></div>
            <div>
              <p>People Ahead</p>
              <h2>{peopleAhead}</h2>
            </div>
          </div>

          <div className="stat-card cyan-card">
            <div className="stat-icon"><Clock size={28} /></div>
            <div>
              <p>Estimated Wait</p>
              <h2>{waitTime} min</h2>
            </div>
          </div>

          <div className="stat-card pink-card">
            <div className="stat-icon"><Activity size={28} /></div>
            <div>
              <p>Token Status</p>
              <h2>{queueStatus}</h2>
            </div>
          </div>
        </section>

        <section className="queue-section">
          <div className="queue-card">
            <div className="queue-card-header">
              <div>
                <p className="small-title">YOUR QUEUE STATUS</p>
                <h2>
                  {!latestToken
                    ? "Welcome to SmartQueue 🎟️"
                    : queueStatus === "Completed"
                      ? "Service Completed! ✅"
                      : queueStatus === "Serving"
                        ? "It's Your Turn! 🎉"
                        : queueStatus === "Cancelled"
                          ? "Token Cancelled"
                          : "Track Your Queue 🎯"}
                </h2>
              </div>
              <Brain className="brain-icon" size={35} />
            </div>

            <div className="queue-details">
              <div className="queue-item">
                <span>Now Serving</span>
                <strong>{nowServingLabel}</strong>
              </div>

              <div className="queue-item highlight">
                <span>Your Token</span>
                <strong>{token}</strong>
              </div>

              <div className="queue-item">
                <span>People Ahead</span>
                <strong>{peopleAhead}</strong>
              </div>

              <div className="queue-item">
                <span>Estimated Wait</span>
                <strong>{waitTime} min</strong>
              </div>
            </div>

            <p className="dashboard-service">
              Service: <strong>{service}</strong>
            </p>
            <p>Status: <strong>{queueStatus}</strong></p>

            <div className="progress-area">
              <div className="progress-label">
                <span>Queue Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="token-card">
            <div className="token-icon"><Plus size={35} /></div>
            <h2>Need Another Token?</h2>
            <p>Generate a token for another service.</p>

            <Link to="/user/generate-token" className="generate-btn">
              <Ticket size={20} />
              Generate New Token
            </Link>

            <Link
              to="/user/my-token"
              className="staff-dashboard-btn"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                textDecoration: "none",
                marginTop: "12px",
                padding: "12px",
                borderRadius: "10px",
              }}
            >
              <History size={18} />
              My Token History
            </Link>

            <Link
              to="/staff/dashboard"
              className="staff-dashboard-btn"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                textDecoration: "none",
                marginTop: "12px",
                padding: "12px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                color: "#ffffff",
                fontWeight: "600",
              }}
            >
              <Users size={18} />
              Staff Dashboard
            </Link>
          </div>
        </section>

        <section className="ai-card">
          <div className="ai-icon"><Brain size={32} /></div>

          <div className="ai-content">
            <p className="small-title">WAIT-TIME ESTIMATE</p>
            <h2>
              {!latestToken
                ? "Generate a token to see your estimated wait"
                : queueStatus === "Completed"
                  ? "Your service has been completed"
                  : queueStatus === "Serving"
                    ? "You are currently being served"
                    : queueStatus === "Cancelled"
                      ? "This token has been cancelled"
                      : `Your estimated waiting time is ${waitTime} minutes`}
            </h2>
            <p>
              Waiting-time estimates are based on the queue information
              stored in SmartQueue and can change as staff serve customers.
            </p>
          </div>

          <div className="prediction">
            <strong>
              {latestToken && queueStatus !== "Completed"
                ? waitTime
                : latestToken
                  ? "✓"
                  : "—"}
            </strong>
            <span>
              {latestToken && queueStatus === "Completed" ? "DONE" : "MINUTES"}
            </span>
          </div>
        </section>

        <section style={{ marginTop: "32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <h2>
              <History size={23} style={{ verticalAlign: "middle" }} /> Recent
              Tokens
            </h2>
            <Link to="/user/my-token">View all tokens →</Link>
          </div>

          {tokens.length === 0 && !loading ? (
            <p>
              You haven't generated any tokens yet. Generate your first token
              to see it here.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {tokens.slice(0, 5).map((item) => (
                <div
                  key={item._id || item.id || item.tokenNumber}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    padding: "16px",
                    borderRadius: "12px",
                    background: "white",
                    boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <div>
                    <strong>{item.tokenNumber || item.token}</strong>
                    <p style={{ margin: "5px 0" }}>{item.service}</p>
                    <small>{formatDate(item.createdAt)}</small>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <strong>{item.status}</strong>
                    <p style={{ margin: "5px 0" }}>
                      {item.status === "Completed" ? (
                        <CheckCircle
                          size={18}
                          style={{ verticalAlign: "middle" }}
                        />
                      ) : (
                        `${item.waitTime ?? 0} min estimated`
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="dashboard-footer">
        <div>
          <Ticket size={22} />
          <span>SmartQueue</span>
        </div>
        <p>AI-Driven Smart Token and Queue Management System</p>
      </footer>
    </div>
  );
}

export default UserDashboard;
