import { useState, type FormEvent } from "react";
import { useAuth, type Role } from "../auth/AuthContext";
import { ApiError, verifyLogin } from "../api/client";

export function LoginPage() {
  const { login } = useAuth();
  const [subdomain, setSubdomain] = useState("stjohns");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const candidate = { subdomain, username, password };
    try {
      const identity = await verifyLogin(candidate);
      login({ ...candidate, role: identity.role as Role });
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? "Invalid username or password." : "Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <span className="avatar">HMS</span>
          <span className="login-title">Hospital Management System</span>
        </div>
        <h1>Staff Login</h1>
        <label>
          Hospital subdomain
          <input
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            placeholder="leave blank for a platform/developer login"
          />
        </label>
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
