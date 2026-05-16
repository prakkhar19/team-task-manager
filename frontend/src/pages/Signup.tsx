import React, { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { FolderKanban } from "lucide-react";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      setUser(data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred during registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card glass-panel">
        <div className="auth-header">
          <div className="brand flex-center" style={{ justifyContent: "center" }}>
            <FolderKanban className="brand-icon" size={32} />
          </div>
          <h1>Create an account</h1>
          <p>Get started with TeamTask today</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password (min 8 chars)</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={8}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting} style={{ marginTop: "0.5rem", padding: "0.8rem" }}>
            {isSubmitting ? <span className="spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }}></span> : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};
