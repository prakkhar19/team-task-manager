import React, { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { FolderKanban } from "lucide-react";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export const Login = () => {
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
      const { data } = await api.post("/auth/login", { email, password });
      setUser(data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred during login");
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
          <h1>Welcome back</h1>
          <p>Enter your credentials to access your account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
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
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting} style={{ marginTop: "0.5rem", padding: "0.8rem" }}>
            {isSubmitting ? <span className="spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }}></span> : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
};
