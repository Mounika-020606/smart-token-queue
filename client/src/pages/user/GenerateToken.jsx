
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Ticket,
  ArrowLeft,
  Building2,
  Clock,
  Users,
  Brain,
  CheckCircle
} from "lucide-react";

import "../../styles/generate-token.css";

function GenerateToken() {
  const navigate = useNavigate();

  const [service, setService] = useState("");
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!service) {
      setError("Please select a service.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Your login session is missing. Please log in again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/tokens/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          // The backend gets the user ID from the verified JWT.
          body: JSON.stringify({ service })
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
          state: {
            message: "Your session expired. Please log in again."
          }
        });
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Token generation failed.");
      }

      if (!data.token) {
        throw new Error("The server did not return token details.");
      }

      setTokenData(data.token);
    } catch (err) {
      console.error("Generate token error:", err);

      setError(
        err.message ||
        "Cannot connect to the backend. Check that your server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const goToDashboard = () => {
    if (!tokenData) return;

    navigate("/user/dashboard", {
      state: {
        token: tokenData.token,
        service: tokenData.service,
        peopleAhead: tokenData.peopleAhead,
        waitTime: tokenData.waitTime
      }
    });
  };

  return (
    <div className="generate-page">
      {/* Navbar */}
      <nav className="generate-navbar">
        <Link
          to="/user/dashboard"
          className="back-dashboard"
        >
          <ArrowLeft size={20} />
          Dashboard
        </Link>

        <div className="generate-logo">
          <Ticket size={30} />
          <span>SmartQueue</span>
        </div>

        <div></div>
      </nav>

      {/* Main */}
      <main className="generate-container">
        <div className="generate-heading">
          <p>SMART TOKEN GENERATOR</p>
          <h1>Get Your Token 🎟️</h1>

          <span>
            Select a service and generate your digital queue token.
          </span>
        </div>

        {!tokenData ? (
          <div className="generate-card">
            <div className="service-icon">
              <Building2 size={40} />
            </div>

            <h2>Select Your Service</h2>

            <p className="card-description">
              Choose the service you want to access today.
            </p>

            <form onSubmit={handleGenerate}>
              <label>Service</label>

              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                required
                disabled={loading}
              >
                <option value="">Select a service</option>
                <option value="Banking">Banking Services</option>
                <option value="Government">Government Services</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Healthcare">Healthcare Services</option>
              </select>

              {error && (
                <p role="alert" style={{ color: "red" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="generate-token-btn"
                disabled={loading}
              >
                <Ticket size={21} />
                {loading ? "Generating..." : "Generate My Token"}
              </button>
            </form>
          </div>
        ) : (
          <div className="token-success">
            <div className="success-icon">
              <CheckCircle size={55} />
            </div>

            <p className="success-title">TOKEN GENERATED!</p>

            <h2>Your Token Number</h2>

            <div className="token-number">
              {tokenData.token}
            </div>

            <p className="service-name">
              {tokenData.service}
            </p>

            <div className="token-info">
              <div>
                <Users size={24} />
                <span>People Ahead</span>
                <strong>{tokenData.peopleAhead}</strong>
              </div>

              <div>
                <Clock size={24} />
                <span>Estimated Wait</span>
                <strong>{tokenData.waitTime} min</strong>
              </div>

              <div>
                <Brain size={24} />
                <span>Queue Status</span>
                <strong>{tokenData.status || "Waiting"}</strong>
              </div>
            </div>

            <p className="waiting-message">
              Your token has been saved. Please wait for your token
              to be called. You can track your queue from the dashboard.
            </p>

            <button
              className="dashboard-btn"
              onClick={goToDashboard}
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default GenerateToken;
