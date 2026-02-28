import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal as TerminalIcon, X, Play, Loader2 } from "lucide-react";
import { triggerRemoteCommand } from "@/services/CommandService";

interface HostTerminalModalProps {
    onClose: () => void;
}

const HostTerminalModal = ({ onClose }: HostTerminalModalProps) => {
    const [command, setCommand] = useState("");
    const [secret, setSecret] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);
    const outputEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of output
    useEffect(() => {
        outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [output]);

    const handleExecute = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!command.trim() || !secret.trim()) return;

        setLoading(true);
        setOutput(prev => prev + `\n> ${command}\n[Executando...]`);

        const res = await triggerRemoteCommand(command, secret);

        const resultText = res.success
            ? `\n${res.stdout || "Comando executado com sucesso (sem output)."}`
            : `\n[ERRO]: ${res.stderr || res.error || "Falha desconhecida"}`;

        setOutput(prev => prev.replace("[Executando...]", "") + resultText);
        setCommand("");
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-2xl overflow-hidden border border-primary/40 rounded-md shadow-2xl flex flex-col"
                style={{
                    background: "hsl(230 20% 6% / 0.95)",
                    boxShadow: "0 0 40px hsl(var(--primary)/0.15), inset 0 0 20px hsl(var(--primary)/0.05)"
                }}
            >
                {/* Decorative lines */}
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)" }} />
                <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)/0.5), transparent)" }} />

                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-primary/20 bg-primary/5">
                    <div className="flex items-center gap-2">
                        <TerminalIcon className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-display tracking-[0.2em] text-primary">HOST TERMINAL // ROOT ACCESS</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-4">
                    <form onSubmit={handleExecute} className="flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <input
                                    type="password"
                                    placeholder="SECRET KEY"
                                    value={secret}
                                    onChange={e => setSecret(e.target.value)}
                                    className="w-full px-3 py-2 text-xs font-mono tracking-widest bg-black/40 border border-primary/30 rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-primary placeholder:text-primary/30 transition-all"
                                />
                            </div>
                            <div className="flex-[2] relative">
                                <input
                                    type="text"
                                    placeholder="COMANDO (ex: dir, ipconfig)"
                                    value={command}
                                    onChange={e => setCommand(e.target.value)}
                                    disabled={loading}
                                    className="w-full px-3 py-2 text-xs font-mono bg-black/40 border border-primary/30 rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all disabled:opacity-50"
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !command.trim() || !secret.trim()}
                                className="px-4 py-2 flex items-center justify-center gap-2 bg-primary/10 border border-primary/40 text-primary hover:bg-primary/20 hover:border-primary rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed font-display text-[9px] tracking-[0.2em]"
                            >
                                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                                EXECUTAR
                            </button>
                        </div>
                    </form>

                    {/* Output Area */}
                    <div className="relative rounded-sm border border-primary/20 bg-black overflow-hidden h-64 sm:h-80 flex flex-col">
                        <div className="absolute top-0 right-0 p-1.5 opacity-30 pointer-events-none">
                            <TerminalIcon className="w-16 h-16 text-primary" />
                        </div>
                        <pre className="flex-1 p-3 overflow-y-auto text-xs font-mono text-[hsl(var(--primary))] whitespace-pre-wrap word-break hud-scroll relative z-10 leading-relaxed">
                            <span className="opacity-50 text-muted-foreground">{`IGOR FUCKN SYSTEM [Versão 2.0.0]\n(c) 2026 Todos os direitos reservados.\n\nPronto para receber entrada de comando...\n`}</span>
                            {output}
                            <div ref={outputEndRef} />
                        </pre>

                        {/* Scanline overlay */}
                        <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay z-20"
                            style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.8) 2px, rgba(0,0,0,0.8) 4px)" }} />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default HostTerminalModal;
