import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import "../styles/auth.css";

export default function AuthPage() {
  const { signIn } = useAuthActions();
  const setDisplayName = useMutation(api.users.setDisplayName);
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayNameState] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        sessionStorage.setItem("pendingDisplayName", displayName || email.split("@")[0]);
        console.log("[AUTH] signUp en cours...");
        const result = await signIn("password", { email, password, flow: "signUp" });
        console.log("[AUTH] signUp résultat:", result);
      } else {
        console.log("[AUTH] signIn en cours...");
        const result = await signIn("password", { email, password, flow: "signIn" });
        console.log("[AUTH] signIn résultat:", result);
      }
    } catch (err) {
      console.error("[AUTH] Erreur complète:", err);
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-container">
        <div className="auth-logo">
          <div className="auth-logo-icon">💬</div>
          <h1>SkypeChat</h1>
          <p>Chattez avec vos amis</p>
        </div>
        <div className="auth-tabs">
          <button
            className={mode === "login" ? "auth-tab active" : "auth-tab"}
            onClick={() => { setMode("login"); setError(""); }}
          >
            Connexion
          </button>
          <button
            className={mode === "register" ? "auth-tab active" : "auth-tab"}
            onClick={() => { setMode("register"); setError(""); }}
          >
            Inscription
          </button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="auth-field">
              <label>Pseudo</label>
              <input
                type="text"
                placeholder="Votre pseudo"
                value={displayName}
                onChange={(e) => setDisplayNameState(e.target.value)}
                required
              />
            </div>
          )}
          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <label>Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer un compte"}
          </button>
        </form>
      </div>
    </div>
  );
}
