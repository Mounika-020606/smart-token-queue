
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Ticket, Clock, Users, ArrowLeft, RefreshCw } from "lucide-react";

import "../../styles/dashboard.css";

function MyToken() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchTokens() {
    setLoading(true);
    setError("");

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id || user._id;

      if (!userId) {
        throw new Error("Please log in again to view your tokens.");
      }

      const response = await fetch(
        `http://localhost:5000/api/tokens/my-tokens/${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load tokens.");
      }

      setTokens(data.tokens || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTokens();
  }, []);

  return (
    <div className="dashboard">
      <nav className="dashboard-navbar">
        <div className="dashboard-logo">
          <Ticket size={30} />
          <span>SmartQueue</span>
        </div>

        <Link to="/user/dashboard" className="generate-btn">
          <ArrowLeft size={18} />
          Dashboard
        </Link>
      </nav>

      <main className="dashboard-content">
        <section className="welcome-section">
          <div>
            <p className="dashboard-label">TOKEN HISTORY</p>
            <h1>My Tokens 🎟️</h1>
            <p>View all your saved queue tokens in one place.</p>
          </div>

          <button className="generate-btn" onClick={fetchTokens}>
            <RefreshCw size={18} />
            Refresh
          </button>
        </section>

        {loading && <p>Loading your tokens...</p>}

        {error && (
          <div role="alert">
            <p>{error}</p>
            <button onClick={fetchTokens}>Try again</button>
          </div>
        )}

        {!loading && !error && tokens.length === 0 && (
          <section className="queue-card">
            <h2>No tokens yet</h2>
            <p>Generate a token to see it listed here.</p>
            <Link to="/user/generate-token" className="generate-btn">
              Generate New Token
            </Link>
          </section>
        )}

        {!loading && !error && tokens.length > 0 && (
          <section className="dashboard-stats">
            {tokens.map((token) => (
              <article className="stat-card purple-card" key={token._id}>
                <div className="stat-icon">
                  <Ticket size={28} />
                </div>

                <div>
                  <p>Token Number</p>
                  <h2>{token.tokenNumber}</h2>
                  <p>Service: {token.service}</p>

                  <p>
                    <Clock size={15} /> Wait: {token.waitTime} minutes
                  </p>

                  <p>
                    <Users size={15} /> People ahead: {token.peopleAhead}
                  </p>

                  <p>Status: {token.status}</p>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default MyToken;
