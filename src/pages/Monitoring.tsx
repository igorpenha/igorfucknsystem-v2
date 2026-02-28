import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MonitorPlay } from "lucide-react";
import SecurityCameraPanel from "@/components/SecurityCameraPanel";
import HeaderGlitchLogo from "@/components/HeaderGlitchLogo";
import HudClock from "@/components/HudClock";
import SpaceBackground from "@/components/SpaceBackground";

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
    }),
};

const Monitoring = () => {
    const [activeServer, setActiveServer] = useState<'debian' | 'zorin'>('debian');
    const navigate = useNavigate();

    return (
        <div className="bg-background relative overflow-hidden w-screen h-screen flex flex-col">
            <SpaceBackground />

            <header className="border-b border-border px-4 md:px-6 py-2 flex items-center justify-between relative z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <HeaderGlitchLogo />
                    <div>
                        <h1 className="font-display text-sm md:text-base tracking-[0.2em] flex gap-2 items-center header-shine-container">
                            <span className="header-shine-word" style={{ color: "hsl(50 100% 55%)", textShadow: "0 0 8px hsl(50 100% 50% / 0.5)" }}>IGOR</span>
                            <span className="header-shine-word" style={{ color: "hsl(320 100% 55%)", textShadow: "0 0 8px hsl(320 100% 50% / 0.5)" }}>FUCKN</span>
                            <span className="header-shine-word" style={{ color: "hsl(190 100% 55%)", textShadow: "0 0 8px hsl(190 100% 50% / 0.5)" }}>SYSTEM</span>
                        </h1>
                        <p className="text-[10px] text-muted-foreground tracking-widest text-primary/70">
                            MÓDULO DE MONITORAMENTO // VIGILÂNCIA
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border transition-all duration-200 text-[9px] font-display tracking-[0.2em] group"
                        style={{
                            borderColor: "hsl(var(--primary)/0.4)",
                            color: "hsl(var(--primary))",
                            background: "hsl(var(--primary)/0.05)",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "hsl(var(--primary)/0.15)"; e.currentTarget.style.boxShadow = "0 0 12px hsl(var(--primary)/0.3)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "hsl(var(--primary)/0.05)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                        VOLTAR AO PAINEL
                    </button>
                    <div className="w-px h-5 bg-border/50 hidden md:block" />
                    <div className="hidden md:block">
                        <HudClock />
                    </div>
                </div>
            </header>

            <main className="p-4 md:p-6 relative z-10 flex-1 min-h-0 overflow-hidden flex flex-col">
                <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="flex-1 w-full max-w-7xl mx-auto min-h-0 flex flex-col">
                    <SecurityCameraPanel activeServer={activeServer} setActiveServer={setActiveServer} />
                </motion.div>
            </main>

            <footer className="border-t border-border px-4 md:px-6 py-2 flex items-center justify-between relative z-10 shrink-0">
                <span className="text-[10px] text-muted-foreground tracking-widest">© 2026 IGOR FUCKN SYSTEM</span>
                <span className="text-[10px] text-muted-foreground tracking-widest flex items-center gap-2">
                    <MonitorPlay className="w-3 h-3 text-primary animate-pulse" />
                    VIGILÂNCIA ATIVA
                </span>
            </footer>
        </div>
    );
};

export default Monitoring;
