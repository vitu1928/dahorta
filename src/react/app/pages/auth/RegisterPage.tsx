import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "motion/react";
import { Eye, EyeOff, AlertCircle, CheckCircle2, UserPlus } from "lucide-react";
import { useApp } from "../../store/AppContext";
import logoImg from "figma:asset/db23158a97674c4fe48dc9d4281a185fc5cf6a4b.png";

export default function RegisterPage() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (form.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const result = register(form.name, form.email, form.password, form.phone);
    setLoading(false);
    if (result.success) {
      navigate("/menu");
    } else {
      setError(result.message);
    }
  };

  const strength =
    form.password.length >= 8
      ? "forte"
      : form.password.length >= 6
      ? "médio"
      : form.password.length > 0
      ? "fraco"
      : "";
  const strengthColor =
    strength === "forte"
      ? "var(--success)"
      : strength === "médio"
      ? "var(--warning)"
      : "var(--destructive)";

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
                width: 72, 
                height: 72, 
                borderRadius: "50%", 
                background: "white", 
                padding: 8, 
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
                fontSize: 22,
                fontWeight: 800,
                color: "var(--primary)",
                letterSpacing: "-0.01em"
              }}
            >
              DaHorta
            </span>
          </div>

          {/* Título */}
          <h2 className="text-center mb-2" style={{ color: "var(--text-primary)" }}>
            Criar sua conta
          </h2>
          <p
            className="text-center mb-8"
            style={{
              color: "var(--text-secondary)",
              fontSize: 14,
            }}
          >
            Cadastre-se para pedir seus bowls favoritos
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
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
                Nome completo
              </label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Seu nome"
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

            {/* Email */}
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
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
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

            {/* Telefone */}
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
                Telefone
              </label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="(11) 99999-0000"
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

            {/* Senha */}
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
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
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
              {strength && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-1">
                    {["fraco", "médio", "forte"].map((s, i) => (
                      <div
                        key={s}
                        className="h-1 w-10 rounded-full transition-all"
                        style={{
                          background:
                            (strength === "fraco" && i === 0) ||
                            (strength === "médio" && i <= 1) ||
                            (strength === "forte" && i <= 2)
                              ? strengthColor
                              : "var(--muted)",
                        }}
                      />
                    ))}
                  </div>
                  <span
                    style={{
                      color: strengthColor,
                      fontSize: 11,
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  >
                    {strength}
                  </span>
                </div>
              )}
            </div>

            {/* Confirmar Senha */}
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
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  name="confirm"
                  type={showPass ? "text" : "password"}
                  value={form.confirm}
                  onChange={handleChange}
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
                {form.confirm && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {form.password === form.confirm ? (
                      <CheckCircle2 size={18} color="var(--success)" />
                    ) : (
                      <AlertCircle size={18} color="var(--destructive)" />
                    )}
                  </div>
                )}
              </div>
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
                <AlertCircle size={16} color="var(--destructive)" />
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
                !loading &&
                (e.currentTarget.style.background = "var(--primary-hover)")
              }
              onMouseLeave={(e) =>
                !loading && (e.currentTarget.style.background = "var(--primary)")
              }
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Criar conta</span>
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
            Já tem uma conta?{" "}
            <Link
              to="/login"
              style={{
                color: "var(--primary)",
                textDecoration: "none",
                fontWeight: 600,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.textDecoration = "underline")
              }
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              Fazer login
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