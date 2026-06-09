import React, { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { useApp } from "../../store/AppContext";
import logoImg from "figma:asset/db23158a97674c4fe48dc9d4281a185fc5cf6a4b.png";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

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
                width: 64, 
                height: 64, 
                borderRadius: "50%", 
                background: "white", 
                padding: 6, 
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
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 20,
                fontWeight: 800,
                color: "var(--primary)",
                letterSpacing: "-0.01em"
              }}
            >
              DaHorta
            </span>
          </div>

          {!sent ? (
            <>
              {/* Título */}
              <h2
                className="text-center mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Recuperar senha
              </h2>
              <p
                className="text-center mb-8"
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 14,
                }}
              >
                Digite seu e-mail cadastrado e enviaremos um link para redefinir sua
                senha.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="w-full px-4 pl-11 outline-none transition-all"
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
                    <Mail
                      size={16}
                      color="var(--muted-foreground)"
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>

                {/* Button Primary */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 transition-all"
                  style={{
                    height: 48,
                    borderRadius: "var(--radius-input)",
                    background: loading
                      ? "var(--primary-hover)"
                      : "var(--primary)",
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
                    !loading &&
                    (e.currentTarget.style.background = "var(--primary)")
                  }
                >
                  {loading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    "Enviar link de recuperação"
                  )}
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  background: "rgba(58,165,93,0.1)",
                  border: "2px solid var(--success)",
                }}
              >
                <CheckCircle2 size={36} color="var(--success)" />
              </div>
              <h3
                className="mb-3"
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                E-mail enviado!
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                Verifique sua caixa de entrada em{" "}
                <strong style={{ color: "var(--text-primary)" }}>{email}</strong>{" "}
                e siga as instruções para redefinir sua senha.
              </p>
            </motion.div>
          )}
        </div>

        {/* Link secundário */}
        <Link
          to="/login"
          className="flex items-center justify-center gap-2 mt-6 transition-colors"
          style={{
            color: "var(--muted-foreground)",
            fontSize: 14,
            textDecoration: "none",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--text-primary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--muted-foreground)")
          }
        >
          <ArrowLeft size={16} />
          Voltar para o login
        </Link>

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