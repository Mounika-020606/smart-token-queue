
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ticket, Mail, Lock, ArrowRight } from "lucide-react";
import "./../styles/login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed. Please try again.");
        return;
      }

      // Ensure the backend returned both the JWT and user details.
      if (!data.token || !data.user) {
        alert(
          "Login response is missing the authentication token. Check authRoutes.js."
        );
        return;
      }

      // Save the JWT for protected API requests.
      localStorage.setItem("token", data.token);

      // Save user details for dashboard navigation.
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login successful! 🎉");

      // Navigate according to the user's role.
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.user.role === "staff") {
        navigate("/staff/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Cannot connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Logo */}
      <div className="login-logo">
        <Ticket size={35} />
        <span>SmartQueue</span>
      </div>

      {/* Login Card */}
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back!</h1>
          <p>Login to manage your queue easily.</p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="input-group">
            <label htmlFor="login-email">Email Address</label>

            <div className="input-box">
              <Mail size={20} />

              <input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="input-group">
            <label htmlFor="login-password">Password</label>

            <div className="input-box">
              <Lock size={20} />

              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        {/* Register */}
        <div className="register-link">
          <p>
            Don't have an account?{" "}
            <Link to="/register">Create Account</Link>
          </p>
        </div>

        {/* Back Home */}
        <div className="back-home">
          <Link to="/">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
