import { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!username || !password) {
      setError("Username dan Password wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const user = await window.api.login({
        username,
        password,
      });

      if (user) {
        localStorage.setItem("race_user", JSON.stringify(user));
        onLogin(user);
      } else {
        setError("Username atau password salah");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div style={container}>
      <div style={overlay}></div>

      <div style={card}>
        <div style={logoSection}>
          <div style={logoIcon}>🏁</div>
          <h1 style={title}>Race System</h1>
          <p style={subText}>Silakan login untuk melanjutkan</p>
        </div>

        <div style={formGroup}>
          <div style={inputWrapper}>
            <span style={icon}>👤</span>
            <input
              style={input}
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>

          <div style={inputWrapper}>
            <span style={icon}>🔒</span>
            <input
              style={input}
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <span style={eye} onClick={() => setShowPass(!showPass)}>
              {showPass ? "🙈" : "👁️"}
            </span>
          </div>

          {error && <div style={errorBox}>⚠ {error}</div>}

          <button
            style={{
              ...button,
              opacity: loading ? 0.7 : 1,
            }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <div style={spinner}></div> : "Login"}
          </button>
        </div>

        <div style={footer}>© 2026 Race System • Event Manager</div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg,#0f172a,#1e3a8a,#0f172a)",
  position: "relative",
  overflow: "hidden",
};

const overlay = {
  position: "absolute",
  width: "600px",
  height: "600px",
  background:
    "radial-gradient(circle at center, rgba(37,99,235,0.3), transparent 70%)",
  borderRadius: "50%",
};

const card = {
  backdropFilter: "blur(20px)",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.2)",
  padding: "45px",
  borderRadius: "20px",
  width: "380px",
  display: "flex",
  flexDirection: "column",
  gap: "25px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
  color: "white",
  zIndex: 2,
};

const logoSection = {
  textAlign: "center",
};

const logoIcon = {
  fontSize: "40px",
  marginBottom: "10px",
};

const title = {
  margin: 0,
  fontSize: "26px",
  fontWeight: "600",
};

const subText = {
  fontSize: "14px",
  color: "#cbd5e1",
};

const formGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const inputWrapper = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const icon = {
  position: "absolute",
  left: "12px",
  fontSize: "14px",
};

const eye = {
  position: "absolute",
  right: "12px",
  cursor: "pointer",
};

const input = {
  width: "100%",
  padding: "12px 40px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.3)",
  background: "rgba(255,255,255,0.1)",
  color: "white",
  fontSize: "14px",
  outline: "none",
};

const button = {
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  fontWeight: "600",
  background: "linear-gradient(90deg,#2563eb,#1d4ed8)",
  color: "white",
  transition: "0.3s",
};

const errorBox = {
  background: "rgba(239,68,68,0.2)",
  padding: "10px",
  borderRadius: "8px",
  fontSize: "13px",
  border: "1px solid rgba(239,68,68,0.5)",
};

const footer = {
  fontSize: "11px",
  textAlign: "center",
  color: "#94a3b8",
};

const spinner = {
  width: "18px",
  height: "18px",
  border: "3px solid rgba(255,255,255,0.3)",
  borderTop: "3px solid white",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};
