
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Ticket,
  Users,
  Clock,
  Activity,
  CheckCircle,
  XCircle,
  Play,
  RefreshCw,
  Brain,
  LogOut,
} from "lucide-react";
import "../../styles/staff-dashboard.css";

const API = "http://localhost:5000/api";

function StaffDashboard() {
  const navigate = useNavigate();

  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load the queue with the saved authentication token.
  const loadQueue = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);

    try {
      const jwt = localStorage.getItem("token");

      if (!jwt) {
        setTokens([]);
        setError("Please log in again. Your authentication token is missing.");
        return;
      }

      const response = await fetch(`${API}/tokens/staff/queue`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
        return;
      }

      if (response.status === 403) {
        throw new Error(
          "Access denied. Your account must have the staff or admin role."
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to load the queue.");
      }

      const queue = Array.isArray(data) ? data : data.tokens || [];

      setTokens(queue);
      setError("");
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Queue error:", err);
      setError(err.message || "Cannot connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Refresh every 10 seconds.
  useEffect(() => {
    loadQueue(true);

    const timer = setInterval(() => {
      loadQueue(false);
    }, 10000);

    return () => clearInterval(timer);
  }, [loadQueue]);

  const waitingTokens = tokens.filter(
    (token) => token.status === "Waiting"
  );

  const servingTokens = tokens.filter(
    (token) => token.status === "Serving"
  );

  const completedCount = tokens.filter(
    (token) => token.status === "Completed"
  ).length;

  const cancelledCount = tokens.filter(
    (token) => token.status === "Cancelled"
  ).length;

  const currentToken = servingTokens[0] || null;

  const getTokenId = (token) => token?._id || token?.id;

  // Update token status using the authentication token.
  const updateStatus = async (token, newStatus) => {
    const tokenId = getTokenId(token);

    if (!tokenId) {
      setError("Token ID is missing from the queue response.");
      return;
    }

    const jwt = localStorage.getItem("token");

    if (!jwt) {
      setError("Please log in again. Your authentication token is missing.");
      navigate("/login", { replace: true });
      return;
    }

    setUpdating(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/tokens/${tokenId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to update token status.");
      }

      setMessage(
        `Token ${token.tokenNumber || ""} is now ${newStatus}.`
      );

      await loadQueue(false);
    } catch (err) {
      console.error("Status update error:", err);
      setError(err.message || "Unable to update token status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCallNext = async () => {
    if (currentToken) {
      setError("Complete the current service before calling the next token.");
      return;
    }

    if (waitingTokens.length === 0) {
      setError("There are no waiting tokens right now.");
      return;
    }

    await updateStatus(waitingTokens[0], "Serving");
  };

  const handleComplete = async () => {
    if (!currentToken) {
      setError("There is no token currently being served.");
      return;
    }

    await updateStatus(currentToken, "Completed");
  };

  const handleCancel = async (token) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel token ${token.tokenNumber || ""}?`
    );

    if (confirmed) {
      await updateStatus(token, "Cancelled");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const formatTime = (date) => {
    if (!date) return "Not updated yet";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="staff-dashboard">
      <nav className="staff-navbar">
        <div className="staff-logo">
          <Ticket size={28} />
          SmartQueue
        </div>

        <div className="staff-nav-right">
          <span className="staff-welcome">Staff Control Center</span>

          <button
            type="button"
            className="staff-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </nav>

      <main className="staff-content">
        <section className="staff-header">
          <div>
            <p className="staff-label">QUEUE OPERATIONS</p>
            <h1>Staff Dashboard</h1>
            <p>Manage customer tokens and serve customers efficiently.</p>
            <p style={{ color: "#777", fontSize: "13px" }}>
              Last updated: {formatTime(lastUpdated)}
            </p>
          </div>

          <button
            type="button"
            className="staff-refresh-btn"
            onClick={() => loadQueue(true)}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh Queue
          </button>
        </section>

        {error && (
          <div
            role="alert"
            style={{
              background: "#fff0f3",
              color: "#c02f50",
              padding: "14px",
              borderRadius: "12px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "9px",
            }}
          >
            <XCircle size={20} />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              style={{
                marginLeft: "auto",
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        )}

        {message && (
          <div
            role="status"
            style={{
              background: "#e8fff2",
              color: "#07844a",
              padding: "14px",
              borderRadius: "12px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "9px",
            }}
          >
            <CheckCircle size={20} />
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage("")}
              style={{
                marginLeft: "auto",
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        )}

        <section className="staff-stats">
          <div className="staff-stat purple">
            <div className="staff-stat-icon"><Users size={28} /></div>
            <div><p>Waiting</p><h2>{waitingTokens.length}</h2></div>
          </div>

          <div className="staff-stat blue">
            <div className="staff-stat-icon"><Activity size={28} /></div>
            <div><p>Currently Serving</p><h2>{servingTokens.length}</h2></div>
          </div>

          <div className="staff-stat cyan">
            <div className="staff-stat-icon"><CheckCircle size={28} /></div>
            <div><p>Completed</p><h2>{completedCount}</h2></div>
          </div>

          <div className="staff-stat pink">
            <div className="staff-stat-icon"><XCircle size={28} /></div>
            <div><p>Cancelled</p><h2>{cancelledCount}</h2></div>
          </div>
        </section>

        <section className="staff-main-grid">
          <div className="current-service">
            <div className="service-header">
              <div>
                <p className="small-title">NOW SERVING</p>
                <h2>Current Service</h2>
              </div>
              <Ticket className="service-icon" size={32} />
            </div>

            {loading ? (
              <div className="current-token" style={{ fontSize: "30px" }}>
                Loading...
              </div>
            ) : currentToken ? (
              <>
                <div className="current-token">
                  {currentToken.tokenNumber || "—"}
                </div>
                <p className="customer-service">
                  {currentToken.service || "General Service"}
                </p>
                <p style={{ textAlign: "center", color: "#777", marginTop: "12px" }}>
                  Status: <strong>{currentToken.status}</strong>
                </p>
                <div className="service-actions">
                  <button
                    type="button"
                    className="complete-btn"
                    onClick={handleComplete}
                    disabled={updating}
                  >
                    <CheckCircle size={18} />
                    {updating ? "Updating..." : "Complete Service"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="current-token" style={{ fontSize: "36px" }}>
                  No Active Token
                </div>
                <p className="customer-service">
                  Call the next customer when you are ready.
                </p>
                <div className="service-actions">
                  <button
                    type="button"
                    className="call-next-btn"
                    onClick={handleCallNext}
                    disabled={updating || loading || waitingTokens.length === 0}
                  >
                    <Play size={18} />
                    {updating ? "Updating..." : "Call Next"}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="waiting-card">
            <div className="waiting-header">
              <h2>Waiting Queue</h2>
              <span className="queue-count">
                {waitingTokens.length} tokens
              </span>
            </div>

            {loading ? (
              <p style={{ color: "#777", marginTop: "25px" }}>
                Loading waiting queue...
              </p>
            ) : waitingTokens.length === 0 ? (
              <div className="token-list">
                <div className="waiting-token">
                  <span>No waiting tokens</span>
                  <small>Queue is clear</small>
                </div>
              </div>
            ) : (
              <div className="token-list">
                {waitingTokens.map((token, index) => (
                  <div
                    className={`waiting-token ${index === 0 ? "active-token" : ""}`}
                    key={token._id || token.id || `${token.tokenNumber}-${index}`}
                  >
                    <div>
                      <span>{token.tokenNumber || "—"}</span>
                      <br />
                      <small>{token.service || "General Service"}</small>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <small>
                        <Clock
                          size={13}
                          style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }}
                        />
                        {token.waitTime ?? 0} min
                      </small>
                      <br />
                      <button
                        type="button"
                        onClick={() => handleCancel(token)}
                        disabled={updating}
                        style={{
                          marginTop: "8px",
                          padding: "6px 9px",
                          border: "none",
                          borderRadius: "7px",
                          color: "#c83c59",
                          background: "#ffe8ee",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              className="call-next-btn"
              onClick={handleCallNext}
              disabled={
                updating || loading || waitingTokens.length === 0 || !!currentToken
              }
              style={{
                width: "100%",
                marginTop: "20px",
                padding: "13px",
                border: "none",
                borderRadius: "12px",
                fontWeight: "700",
                cursor: "pointer",
                opacity:
                  updating || loading || waitingTokens.length === 0 || currentToken
                    ? 0.6
                    : 1,
              }}
            >
              <Play size={17} />
              Call Next Customer
            </button>
          </div>
        </section>

        <section className="staff-info">
          <div className="info-icon"><Brain size={34} /></div>
          <div>
            <p className="small-title">SMARTQUEUE LIVE SYSTEM</p>
            <h2>Keep Your Queue Moving</h2>
            <p>
              Queue data refreshes every 10 seconds. Complete the current
              service before calling the next waiting customer.
            </p>
          </div>
        </section>
      </main>

      <footer className="staff-footer">
        <div><Ticket size={21} /> SmartQueue</div>
        <span>Staff Queue Management · Live data</span>
        <span>Updated: {formatTime(lastUpdated)}</span>
      </footer>
    </div>
  );
}

export default StaffDashboard;
