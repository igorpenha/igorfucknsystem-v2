import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, SmilePlus, User, Terminal } from "lucide-react";

// ══════════════════════════════════════════════════════
// FIREBASE CONFIG PLACEHOLDER — Preencha com suas credenciais
// para conectar ao Firebase Realtime Database.
// ══════════════════════════════════════════════════════
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "000000000000",
  appId: "YOUR_APP_ID",
};

// TODO: Inicializar Firebase quando configurado
// import { initializeApp } from "firebase/app";
// import { getDatabase, ref, push, onValue } from "firebase/database";
// const app = initializeApp(firebaseConfig);
// const db = getDatabase(app);

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: number;
  color: string;
}

const USER_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(320 100% 55%)",
  "hsl(50 100% 55%)",
  "hsl(140 70% 50%)",
];

const EMOJIS = ["🔥", "💀", "⚡", "🎵", "👾", "🤖", "💎", "🚀", "☠️", "🎯", "💣", "🔮"];

const FucknChat = () => {
  const [identified, setIdentified] = useState(false);
  const [username, setUsername] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [userColor] = useState(() => USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleIdentify = useCallback(() => {
    const name = nameInput.trim();
    if (!name) return;
    setUsername(name);
    setIdentified(true);
    // System message
    setMessages([{
      id: `sys-${Date.now()}`,
      user: "SYSTEM",
      text: `${name.toUpperCase()} conectado ao canal.`,
      timestamp: Date.now(),
      color: "hsl(var(--muted-foreground))",
    }]);
  }, [nameInput]);

  const sendMessage = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      user: username,
      text,
      timestamp: Date.now(),
      color: userColor,
    };
    // TODO: Substituir por push para Firebase Realtime DB
    // push(ref(db, "chat/messages"), msg);
    setMessages(prev => [...prev, msg]);
    setInputText("");
    setShowEmojis(false);
    inputRef.current?.focus();
  }, [inputText, username, userColor]);

  const addEmoji = useCallback((emoji: string) => {
    setInputText(prev => prev + emoji);
    inputRef.current?.focus();
  }, []);

  // ══ TELA DE IDENTIFICAÇÃO ══
  if (!identified) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 w-full max-w-[280px]"
        >
          {/* Terminal icon */}
          <div className="w-12 h-12 border border-primary/40 bg-primary/10 flex items-center justify-center"
            style={{ clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)" }}>
            <Terminal className="w-6 h-6 text-primary" />
          </div>

          <p className="text-[10px] text-primary tracking-[0.3em] font-display">IDENTIFICAÇÃO OBRIGATÓRIA</p>
          <p className="text-[8px] text-muted-foreground/50 tracking-wider text-center">
            ACESSO AO CANAL REQUER AUTENTICAÇÃO
          </p>

          <div className="w-full flex flex-col gap-2 mt-2">
            <div className="relative">
              <User className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/50" />
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleIdentify()}
                placeholder="DIGITE SEU CALLSIGN..."
                maxLength={20}
                className="w-full bg-muted/20 border border-primary/30 text-foreground text-[11px] tracking-wider px-7 py-2.5 font-mono placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/60 focus:shadow-[0_0_12px_hsl(var(--primary)/0.2)] transition-all"
                style={{ clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)" }}
              />
            </div>
            <button
              onClick={handleIdentify}
              disabled={!nameInput.trim()}
              className="w-full border border-primary/50 bg-primary/10 hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed text-primary text-[10px] tracking-[0.3em] font-display py-2.5 transition-all hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
              style={{ clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)" }}
            >
              ACESSAR CANAL
            </button>
          </div>

          {/* Decorative line */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent mt-2" />
          <p className="text-[6px] text-muted-foreground/20 tracking-[0.4em]">FUCKN_CHAT // ENCRYPTED CHANNEL</p>
        </motion.div>
      </div>
    );
  }

  // ══ CHAT ATIVO ══
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 py-1.5 border-b border-border/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <motion.div className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <span className="text-[8px] text-primary/70 tracking-[0.3em] font-display">CANAL ATIVO</span>
        </div>
        <span className="text-[8px] text-muted-foreground/40 tracking-wider font-mono">{username.toUpperCase()}</span>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto hud-scroll px-3 py-2 space-y-1.5">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex flex-col gap-0.5 ${msg.user === "SYSTEM" ? "items-center" : ""}`}
            >
              {msg.user === "SYSTEM" ? (
                <p className="text-[8px] text-muted-foreground/40 tracking-wider text-center py-1">
                  ── {msg.text} ──
                </p>
              ) : (
                <div className="bg-muted/15 border border-border/20 px-2.5 py-1.5 max-w-[90%]"
                  style={{ clipPath: "polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)" }}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[8px] font-display tracking-wider" style={{ color: msg.color }}>
                      {msg.user.toUpperCase()}
                    </span>
                    <span className="text-[6px] text-muted-foreground/25 tabular-nums">
                      {new Date(msg.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[10px] text-foreground/80 leading-relaxed break-words">{msg.text}</p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {messages.length <= 1 && (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <p className="text-[9px] text-muted-foreground/20 tracking-wider">AGUARDANDO TRANSMISSÕES...</p>
          </div>
        )}
      </div>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojis && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-3 border-t border-border/20 overflow-hidden"
          >
            <div className="flex flex-wrap gap-1 py-2">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  className="w-7 h-7 flex items-center justify-center hover:bg-primary/10 rounded-sm transition-colors text-sm"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="px-3 py-2 border-t border-border/30 flex items-center gap-2 shrink-0">
        <button
          onClick={() => setShowEmojis(v => !v)}
          className={`w-7 h-7 shrink-0 flex items-center justify-center border transition-all ${showEmojis ? "border-accent/50 bg-accent/15 text-accent" : "border-border/30 bg-muted/10 text-muted-foreground/40 hover:text-accent/60"}`}
          style={{ clipPath: "polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)" }}
        >
          <SmilePlus className="w-3.5 h-3.5" />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Transmitir mensagem..."
          className="flex-1 min-w-0 bg-muted/10 border border-border/20 text-foreground text-[10px] tracking-wider px-3 py-2 font-mono placeholder:text-muted-foreground/25 focus:outline-none focus:border-primary/40 transition-all"
          style={{ clipPath: "polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)" }}
        />
        <button
          onClick={sendMessage}
          disabled={!inputText.trim()}
          className="w-8 h-8 shrink-0 flex items-center justify-center border border-primary/40 bg-primary/10 hover:bg-primary/20 disabled:opacity-20 disabled:cursor-not-allowed text-primary transition-all"
          style={{ clipPath: "polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)" }}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default FucknChat;
