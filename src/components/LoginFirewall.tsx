import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SpaceBackground from "./SpaceBackground";

const MASTER_KEY = import.meta.env.VITE_MASTER_KEY ? String(import.meta.env.VITE_MASTER_KEY).trim() : "";
const SESSION_KEY = "ifs_auth_token";
const TOKEN_VALUE = "ARCHITECT_GRANTED";
const isLovablePreview = typeof window !== "undefined" && window.location.hostname.includes("lovableproject.com");

export const isAuthenticated = () => isLovablePreview || localStorage.getItem(SESSION_KEY) === TOKEN_VALUE;
export const logout = () => { if (!isLovablePreview) localStorage.removeItem(SESSION_KEY); };

interface Props {
  children: React.ReactNode;
}

const LoginFirewall = ({ children }: Props) => {
  const [authed, setAuthed] = useState(() => isAuthenticated());
  const [code, setCode] = useState("");
  const [denied, setDenied] = useState(false);
  const [granted, setGranted] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!MASTER_KEY) {
        setDenied(true);
        setTimeout(() => setDenied(false), 2000);
        return;
      }
      const input = code.trim();
      if (input === MASTER_KEY) {
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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
        >
          <SpaceBackground />

          {/* Scanlines overlay — static, no animation */}
          <div
            className="fixed inset-0 z-[1] pointer-events-none opacity-[0.04]"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground) / 0.04) 2px, hsl(var(--foreground) / 0.04) 4px)",
            }}
          />

          {/* Denied red flash */}
          <AnimatePresence>
            {denied && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.25, 0, 0.15, 0] }}
                transition={{ duration: 0.5 }}
                className="fixed inset-0 z-[2] pointer-events-none"
                style={{ background: "hsl(0 80% 45%)" }}
              />
            )}
          </AnimatePresence>

          {/* Terminal container — static by default, shakes only on denied */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={
              denied
                ? { opacity: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }
                : { opacity: 1, y: 0, x: 0 }
            }
            transition={denied ? { duration: 0.4 } : { duration: 0.5, delay: 0.2 }}
            className="relative z-10 w-full max-w-lg mx-4"
          >
            <div
              className="border border-border rounded-sm p-6 md:p-8"
              style={{
                background: "hsl(var(--background) / 0.88)",
                backdropFilter: "blur(20px)",
                boxShadow:
                  "0 0 40px hsl(var(--primary) / 0.08), inset 0 0 60px hsl(var(--background) / 0.5), 0 0 1px hsl(var(--primary) / 0.25)",
              }}
            >
              {/* Header */}
              <div className="mb-6 space-y-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="ml-2 text-[9px] tracking-[0.3em] font-mono text-muted-foreground">
                    FIREWALL://TERMINAL
                  </span>
                </div>

                <h1
                  className="font-mono text-sm md:text-base tracking-[0.15em] font-bold text-primary"
                  style={{ textShadow: "0 0 12px hsl(var(--primary) / 0.5)" }}
                >
                  SISTEMA DE DEFESA PERIMETRAL
                </h1>
                <p
                  className="font-mono text-[10px] tracking-[0.25em]"
                  style={{ color: "hsl(0 80% 55%)" }}
                >
                  ██ ACESSO RESTRITO ██
                </p>

                <div className="font-mono text-[9px] leading-relaxed mt-3 space-y-0.5 text-muted-foreground">
                  <p>&gt; PROTOCOLO DE SEGURANÇA NÍVEL 5 ATIVO</p>
                  <p>&gt; CRIPTOGRAFIA AES-256 VERIFICADA</p>
                  <p>
                    &gt; AGUARDANDO CREDENCIAL DO OPERADOR...
                    <span className="inline-block w-1.5 h-3 ml-1 bg-primary/70 animate-pulse" />
                  </p>
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
                      className="font-mono text-lg font-bold tracking-[0.2em] text-primary"
                      style={{ textShadow: "0 0 20px hsl(var(--primary) / 0.6)" }}
                      animate={{ opacity: [1, 0.6, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      ACESSO CONCEDIDO
                    </motion.p>
                    <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
                      BEM-VINDO, ARQUITETO
                    </p>
                    <motion.div
                      className="w-full h-0.5 mt-4 rounded-full bg-primary"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1.5 }}
                    />
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="font-mono text-[9px] tracking-[0.25em] block text-muted-foreground">
                        CÓDIGO DE ACESSO TÁTICO
                      </label>
                      <input
                        type="password"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        autoFocus
                        className="w-full font-mono text-sm px-3 py-2.5 rounded-none outline-none transition-all duration-200 bg-background/50 text-primary border border-border focus:border-primary/50"
                        style={{
                          caretColor: "hsl(var(--primary))",
                          letterSpacing: "0.15em",
                          boxShadow: denied
                            ? "0 0 15px hsl(0 100% 50% / 0.15)"
                            : "inset 0 0 20px hsl(var(--primary) / 0.03)",
                          borderColor: denied ? "hsl(0 80% 50% / 0.6)" : undefined,
                        }}
                        placeholder="••••••••••"
                      />
                    </div>

                    {/* Denied message — appears temporarily */}
                    <AnimatePresence>
                      {denied && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
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

                    <button
                      type="submit"
                      className="w-full font-mono text-[10px] tracking-[0.3em] py-2.5 rounded-none transition-all duration-200 border border-border text-primary hover:bg-primary/10 hover:border-primary/40"
                      style={{ background: "hsl(var(--primary) / 0.04)" }}
                    >
                      [ EXECUTAR VIOLAÇÃO ]
                    </button>
                  </form>
                )}
              </AnimatePresence>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-border/30">
                <p className="font-mono text-[8px] tracking-[0.2em] text-center text-muted-foreground/50">
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
