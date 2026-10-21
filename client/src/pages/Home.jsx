import { Link } from "react-router-dom";
import {
  Ticket,
  Clock,
  Brain,
  Users,
  ArrowRight
} from "lucide-react";

import "./../styles/home.css";

function Home() {
  return (
    <div className="home">

      {/* ================= NAVBAR ================= */}
      <nav className="navbar">

        <div className="logo">
          <Ticket size={30} />
          <span>SmartQueue</span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>

          <Link to="/login" className="login-btn">
            Login
          </Link>
        </div>

      </nav>


      {/* ================= HERO ================= */}
      <section className="hero" id="home">

        <div className="hero-content">

          <div className="badge">
            🤖 AI Powered Queue Management
          </div>

          <h1>
            Smart Tokens.
            <br />
            <span>Smarter Queues.</span>
          </h1>

          <p>
            Generate your token, track your queue in real time,
            and get AI-powered waiting time predictions.
          </p>

          <div className="hero-buttons">

            <Link to="/register" className="primary-btn">
              Get Your Token
              <ArrowRight size={20} />
            </Link>

            <a
              href="#how-it-works"
              className="secondary-btn"
            >
              Learn More
            </a>

          </div>

        </div>


        {/* ================= QUEUE PREVIEW ================= */}
        <div className="queue-preview">

          <div className="preview-header">

            <div>
              <p>LIVE QUEUE</p>
              <h3>Service Center</h3>
            </div>

            <span className="live">
              ● LIVE
            </span>

          </div>


          <div className="current-token">

            <p>NOW SERVING</p>

            <h2>A-105</h2>

            <span>
              Counter 03
            </span>

          </div>


          <div className="queue-info">

            <div>
              <Users />

              <span>
                <b>12</b>
                People Waiting
              </span>
            </div>


            <div>
              <Clock />

              <span>
                <b>18 min</b>
                Estimated Wait
              </span>
            </div>

          </div>

        </div>

      </section>


      {/* ================= FEATURES ================= */}
      <section
        className="features"
        id="features"
      >

        <div className="section-title">

          <p>POWERFUL FEATURES</p>

          <h2>
            Everything You Need
          </h2>

          <span>
            A smarter way to manage waiting lines.
          </span>

        </div>


        <div className="feature-grid">

          {/* Feature 1 */}
          <div className="feature-card purple">

            <Ticket size={35} />

            <h3>
              Smart Token
            </h3>

            <p>
              Generate your digital token without
              standing in a physical queue.
            </p>

          </div>


          {/* Feature 2 */}
          <div className="feature-card blue">

            <Brain size={35} />

            <h3>
              AI Prediction
            </h3>

            <p>
              Predict your approximate waiting time
              using queue and service information.
            </p>

          </div>


          {/* Feature 3 */}
          <div className="feature-card cyan">

            <Clock size={35} />

            <h3>
              Live Queue
            </h3>

            <p>
              Track your current position and queue
              status in real time.
            </p>

          </div>


          {/* Feature 4 */}
          <div className="feature-card pink">

            <Users size={35} />

            <h3>
              Smart Counters
            </h3>

            <p>
              Dynamically manage counters and assign
              tokens efficiently.
            </p>

          </div>

        </div>

      </section>


      {/* ================= HOW IT WORKS ================= */}
      <section
        className="how-it-works"
        id="how-it-works"
      >

        <div className="section-title">

          <p>SIMPLE PROCESS</p>

          <h2>
            How It Works
          </h2>

        </div>


        <div className="steps">

          {/* Step 1 */}
          <div className="step">

            <div className="step-number">
              01
            </div>

            <h3>
              Generate Token
            </h3>

            <p>
              Select a service and generate your token.
            </p>

          </div>


          {/* Step 2 */}
          <div className="step">

            <div className="step-number">
              02
            </div>

            <h3>
              AI Prediction
            </h3>

            <p>
              AI estimates your waiting time based on
              current queue conditions.
            </p>

          </div>


          {/* Step 3 */}
          <div className="step">

            <div className="step-number">
              03
            </div>

            <h3>
              Track Queue
            </h3>

            <p>
              Monitor your position using the live queue.
            </p>

          </div>


          {/* Step 4 */}
          <div className="step">

            <div className="step-number">
              04
            </div>

            <h3>
              Get Served
            </h3>

            <p>
              Reach the counter when your token is called.
            </p>

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer>

        <div className="logo">

          <Ticket size={25} />

          <span>
            SmartQueue
          </span>

        </div>

        <p>
          AI-Driven Smart Token and Queue Management System
        </p>

        <span>
          © 2026 SmartQueue
        </span>

      </footer>

    </div>
  );
}

export default Home;