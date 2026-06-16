import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "motion/react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useApp } from "../../store/AppContext";
import logoImg from "figma:asset/db23158a97674c4fe48dc9d4281a185fc5cf6a4b.png";

export default function LoginPage() {
  const { login, cartCount } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const result = login(email, password);
    setLoading(false);
    if (result.success) {
      if (result.role === "owner") navigate("/owner");
      else if (result.role === "employee") navigate("/employee");
      else if (result.role === "motoboy") navigate("/motoboy");
      else if (cartCount > 0) navigate("/cart");
      else navigate("/menu");
    } else {
      setError(result.message);
    }
  };

  const demoAccounts = [
    { label: "Dono", email: "dono@dahorta.com" },
    { label: "Funcionário", email: "func@dahorta.com" },
    { label: "Motoboy", email: "moto@dahorta.com" },
    { label: "Cliente", email: "cliente@email.com" },
  ];

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: "var(--background-soft)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full"
        style={{ maxWidth: 420 }}
      >
        {/* Card */}
        <div
          className="rounded-xl p-8"
          style={{
            background: "var(--background)",
            boxShadow: "var(--shadow-default)",
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center justify-center gap-3 mb-8">
            <div 
              style={{ 
                width: 80, 
                height: 80, 
                borderRadius: "50%", 
                background: "white", 
                padding: 10, 
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--border-light)"
              }}
            >
              <img src={logoImg} alt="DaHorta" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 24,
                fontWeight: 800,
                color: "var(--primary)",
                letterSpacing: "-0.02em"
              }}
            >
              DaHorta
            </span>
          </div>

          {/* Título */}
          <h2 className="text-center mb-2" style={{ color: "var(--text-primary)" }}>
            Bem-vindo de volta
          </h2>
          <p 
            className="text-center mb-8"
            style={{ 
              color: "var(--text-secondary)", 
              fontSize: 14 
            }}
          >
            Faça login para acessar o sistema
          </p>

          {/* Contas Demo */}
          <div
            className="rounded-lg p-4 mb-6"
            style={{
              background: "var(--secondary)",
              border: "1px solid var(--border-light)",
            }}
          >
            <p
              className="mb-3"
              style={{
                color: "var(--muted-foreground)",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Contas demo — senha: 123456
            </p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword("123456");
                  }}
                  className="text-left rounded-lg px-3 py-2 transition-all"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.background = "var(--background)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.background = "var(--background)";
                  }}
                >
                  <div
                    style={{
                      color: "var(--primary)",
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 2,
                    }}
                  >
                    {acc.label}
                  </div>
                  <div
                    style={{
                      color: "var(--muted-foreground)",
                      fontSize: 10,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {acc.email}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--muted-foreground)",
                }}
              >
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 outline-none transition-all"
                style={{
                  height: 48,
                  borderRadius: "var(--radius-input)",
                  background: "var(--input-background)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary)";
                  e.target.style.boxShadow = "0 0 0 3px var(--ring)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--muted-foreground)",
                }}
              >
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 pr-12 outline-none transition-all"
                  style={{
                    height: 48,
                    borderRadius: "var(--radius-input)",
                    background: "var(--input-background)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    fontSize: 14,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--primary)";
                    e.target.style.boxShadow = "0 0 0 3px var(--ring)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{
                    color: "var(--muted-foreground)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                style={{
                  color: "var(--primary)",
                  fontSize: 13,
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                Esqueceu a senha?
              </Link>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 rounded-lg px-4 py-3"
                style={{
                  background: "rgba(230,57,70,0.1)",
                  border: "1px solid var(--destructive)",
                }}
              >
                <span style={{ color: "var(--destructive)", fontSize: 13 }}>
                  {error}
                </span>
              </motion.div>
            )}

            {/* Button Primary */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 transition-all"
              style={{
                height: 48,
                borderRadius: "var(--radius-input)",
                background: loading ? "var(--primary-hover)" : "var(--primary)",
                color: "var(--primary-foreground)",
                border: "none",
                cursor: loading ? "wait" : "pointer",
                fontSize: 15,
                fontWeight: 600,
              }}
              onMouseEnter={(e) =>
                !loading && (e.currentTarget.style.background = "var(--primary-hover)")
              }
              onMouseLeave={(e) =>
                !loading && (e.currentTarget.style.background = "var(--primary)")
              }
            >
              {loading ? (
                <div
                  className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"
                />
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Entrar</span>
                </>
              )}
            </button>
          </form>

          {/* Link secundário */}
          <p
            className="text-center mt-6"
            style={{
              color: "var(--text-secondary)",
              fontSize: 14,
            }}
          >
            Não tem uma conta?{" "}
            <Link
              to="/register"
              style={{
                color: "var(--primary)",
                textDecoration: "none",
                fontWeight: 600,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              Criar conta
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p
            style={{
              color: "var(--muted-foreground)",
              fontSize: 12,
            }}
          >
            DaHorta © 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
}