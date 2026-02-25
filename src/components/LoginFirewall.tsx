import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MatrixRain from "./MatrixRain";

const MASTER_KEY = import.meta.env.VITE_MASTER_KEY ?? "";
const SESSION_KEY = "ifs_auth_token";
const TOKEN_VALUE = "ARCHITECT_GRANTED";

export const isAuthenticated = () => localStorage.getItem(SESSION_KEY) === TOKEN_VALUE;
export const logout = () => localStorage.removeItem(SESSION_KEY);

interface Props {
  children: React.ReactNode;
}

const LoginFirewall = ({ children }: Props) => {
  const [authed, setAuthed] = useState(() => isAuthenticated());
  const [code, setCode] = useState("");
  const [denied, setDenied] = useState(false);
  const [granted, setGranted] = useState(false);
  const [scanline, setScanline] = useState(true);

  // Blinking scanline
  useEffect(() => {
    const id = setInterval(() => setScanline((v) => !v), 80);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!MASTER_KEY) {
        setDenied(true);
        setTimeout(() => setDenied(false), 2000);
        return;
      }
      if (code === MASTER_KEY) {
        setGranted(true);
        localStorage.setItem(SESSION_KEY, TOKEN_VALUE);
        setTimeout(() => setAuthed(true), 1800);
      } else {
        setDenied(true);
        setCode("");
        setTimeout(() => setDenied(false), 2000);
      }
    },
    [code],
  );

  if (authed) return <>{children}</>;

  return (
    <AnimatePresence>
      {!authed && (
        <motion.div
          key="firewall"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: "#000" }}
        >
          <MatrixRain />

          {/* Scanlines overlay */}
          <div
            className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03]"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
            }}
          />

          {/* Denied flash */}
          <AnimatePresence>
            {denied && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0, 0.2, 0] }}
                transition={{ duration: 0.6 }}
                className="fixed inset-0 z-[2] bg-red-600 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Terminal container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative z-10 w-full max-w-lg mx-4"
          >
            <div
              className="border rounded-sm p-6 md:p-8"
              style={{
                background: "rgba(0, 0, 0, 0.85)",
                borderColor: "hsl(140 60% 30% / 0.5)",
                boxShadow:
                  "0 0 40px hsl(140 100% 30% / 0.1), inset 0 0 60px rgba(0,0,0,0.5), 0 0 1px hsl(140 100% 50% / 0.3)",
              }}
            >
              {/* Header */}
              <div className="mb-6 space-y-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span
                    className="ml-2 text-[9px] tracking-[0.3em] font-mono"
                    style={{ color: "hsl(140 60% 45%)" }}
                  >
                    FIREWALL://TERMINAL
                  </span>
                </div>

                <h1
                  className="font-mono text-sm md:text-base tracking-[0.15em] font-bold"
                  style={{
                    color: "hsl(140 100% 55%)",
                    textShadow: "0 0 12px hsl(140 100% 50% / 0.5)",
                  }}
                >
                  SISTEMA DE DEFESA PERIMETRAL
                </h1>
                <p
                  className="font-mono text-[10px] tracking-[0.25em]"
                  style={{ color: "hsl(0 80% 55%)" }}
                >
                  ██ ACESSO RESTRITO ██
                </p>

                <div
                  className="font-mono text-[9px] leading-relaxed mt-3 space-y-0.5"
                  style={{ color: "hsl(140 40% 40%)" }}
                >
                  <p>&gt; PROTOCOLO DE SEGURANÇA NÍVEL 5 ATIVO</p>
                  <p>&gt; CRIPTOGRAFIA AES-256 VERIFICADA</p>
                  <p>&gt; AGUARDANDO CREDENCIAL DO OPERADOR...</p>
                  {scanline && <span className="inline-block w-1.5 h-3 bg-green-500/70" />}
                </div>
              </div>

              {/* Granted state */}
              <AnimatePresence>
                {granted ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 space-y-3"
                  >
                    <motion.p
                      className="font-mono text-lg font-bold tracking-[0.2em]"
                      style={{
                        color: "hsl(140 100% 55%)",
                        textShadow: "0 0 20px hsl(140 100% 50% / 0.6)",
                      }}
                      animate={{ opacity: [1, 0.6, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      ACESSO CONCEDIDO
                    </motion.p>
                    <p
                      className="font-mono text-[10px] tracking-[0.3em]"
                      style={{ color: "hsl(140 60% 45%)" }}
                    >
                      BEM-VINDO, ARQUITETO
                    </p>
                    <motion.div
                      className="w-full h-0.5 mt-4 rounded-full"
                      style={{ background: "hsl(140 100% 50%)" }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1.5 }}
                    />
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Input */}
                    <div className="space-y-1.5">
                      <label
                        className="font-mono text-[9px] tracking-[0.25em] block"
                        style={{ color: "hsl(140 50% 45%)" }}
                      >
                        CÓDIGO DE ACESSO TÁTICO
                      </label>
                      <input
                        type="password"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        autoFocus
                        className="w-full font-mono text-sm px-3 py-2.5 rounded-none outline-none transition-all duration-200"
                        style={{
                          background: "rgba(0, 255, 100, 0.03)",
                          border: `1px solid ${denied ? "hsl(0 80% 50% / 0.7)" : "hsl(140 60% 30% / 0.4)"}`,
                          color: "hsl(140 100% 65%)",
                          caretColor: "hsl(140 100% 55%)",
                          boxShadow: denied
                            ? "0 0 15px hsl(0 100% 50% / 0.2)"
                            : "inset 0 0 20px rgba(0,255,100,0.02)",
                          letterSpacing: "0.15em",
                        }}
                        placeholder="••••••••••"
                      />
                    </div>

                    {/* Denied message */}
                    <AnimatePresence>
                      {denied && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: [0, -4, 4, -3, 3, 0] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.4 }}
                          className="font-mono text-[10px] tracking-[0.2em] text-center py-1"
                          style={{
                            color: "hsl(0 100% 55%)",
                            textShadow: "0 0 10px hsl(0 100% 50% / 0.5)",
                          }}
                        >
                          ⚠ ACESSO NEGADO — RASTREAMENTO INICIADO ⚠
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="w-full font-mono text-[10px] tracking-[0.3em] py-2.5 rounded-none transition-all duration-200 border"
                      style={{
                        background: "rgba(0, 255, 100, 0.05)",
                        borderColor: "hsl(140 60% 30% / 0.4)",
                        color: "hsl(140 100% 55%)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(0, 255, 100, 0.12)";
                        e.currentTarget.style.boxShadow = "0 0 20px hsl(140 100% 50% / 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(0, 255, 100, 0.05)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      [ EXECUTAR VIOLAÇÃO ]
                    </button>
                  </form>
                )}
              </AnimatePresence>

              {/* Footer */}
              <div className="mt-6 pt-4" style={{ borderTop: "1px solid hsl(140 30% 20% / 0.3)" }}>
                <p
                  className="font-mono text-[8px] tracking-[0.2em] text-center"
                  style={{ color: "hsl(140 30% 30%)" }}
                >
                  IGOR FUCKN SYSTEM // FIREWALL v2.0 // ENCRYPTED TUNNEL ACTIVE
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginFirewall;
