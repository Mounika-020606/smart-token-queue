import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, ArrowRight } from "lucide-react";
import "../styles/register.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! 🎉");
        navigate("/login");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to server. Make sure backend is running.");
    }
  };

  return (
    <div className="register-page">

      {/* Logo */}
      <div className="register-logo">
        🤖 SmartQueue
      </div>

      {/* Registration Card */}
      <div className="register-card">

        {/* Header */}
        <div className="register-header">
          <h1>Create Account</h1>
          <p>
            Register to start using SmartQueue and manage your queue
            effortlessly.
          </p>
        </div>

        <form onSubmit={handleRegister}>

          {/* Name */}
          <div className="register-input-group">
            <label>Full Name</label>

            <div className="register-input-box">
              <User size={20} />

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="register-input-group">
            <label>Email Address</label>

            <div className="register-input-box">
              <Mail size={20} />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="register-input-group">
            <label>Password</label>

            <div className="register-input-box">
              <Lock size={20} />

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Register Button */}
          <button type="submit" className="register-submit">
            Create Account
            <ArrowRight size={20} />
          </button>

        </form>

        {/* Login Link */}
        <div className="login-link">
          <p>
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>
        </div>

        {/* Back Home */}
        <div className="register-back-home">
          <Link to="/">
            ← Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Register;