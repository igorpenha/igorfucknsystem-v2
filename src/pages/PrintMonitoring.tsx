import { useEffect, useState } from "react";

interface SourceFile {
  path: string;
  content: string;
}

const MONITORING_FILES = [
  "src/components/NetworkDeviceMonitor.tsx",
  "src/config/api.ts",
  "src/services/fileSystemApi.ts",
  "src/components/HudPanel.tsx",
  "src/components/ToolProjection.tsx",
  "src/components/InfoWidgets.tsx",
  "src/components/SecurityCameraPanel.tsx",
  "src/pages/Index.tsx",
  "src/index.css",
  "server.js",
  "tailwind.config.ts",
  "vite.config.ts",
];

const SECTION_COMMENTS: Record<string, string> = {
  "src/components/NetworkDeviceMonitor.tsx": `
╔══════════════════════════════════════════════════════════════════╗
║  COMPONENTE PRINCIPAL — NetworkDeviceMonitor                     ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Este é o CORAÇÃO do sistema de monitoramento de rede.           ║
║                                                                  ║
║  COMO FUNCIONA:                                                  ║
║  1. Ao montar, dispara um fetch para o endpoint /api/network/scan║
║  2. O backend executa o comando "arp -a" no servidor local       ║
║  3. Os resultados (IP, MAC, tipo) são parseados e retornados     ║
║  4. O frontend renderiza cada dispositivo em cards estilizados   ║
║                                                                  ║
║  PARA O SISTEMA STANDALONE:                                      ║
║  - Este componente deve ocupar a TELA INTEIRA (100vh)            ║
║  - Deve ter auto-refresh a cada 15 segundos                      ║
║  - Adicionar gráfico de histórico de dispositivos ao longo do dia║
║  - Implementar alertas sonoros para novos dispositivos            ║
║  - Criar sistema de "whitelist" para dispositivos conhecidos      ║
║  - Dispositivos desconhecidos devem ser destacados em VERMELHO    ║
║  - Adicionar geolocalização do IP via API externa                 ║
║                                                                  ║
║  ESTADOS DO COMPONENTE:                                          ║
║  - scanning: true/false — controla animação de loading            ║
║  - devices: array de {ip, mac, type}                              ║
║  - error: true/false — fallback quando backend está offline       ║
║  - hasScanned: evita renderizar lista vazia antes do 1º scan      ║
║                                                                  ║
║  PROP "asContent":                                               ║
║  - Quando true, renderiza SÓ o conteúdo (sem wrapper HudPanel)   ║
║  - Usado quando embutido dentro de outro painel (ToolProjection)  ║
╚══════════════════════════════════════════════════════════════════╝`,

  "src/config/api.ts": `
╔══════════════════════════════════════════════════════════════════╗
║  CONFIGURAÇÃO DA API BASE                                        ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Define a URL base para TODAS as chamadas de API do sistema.      ║
║                                                                  ║
║  PARA O SISTEMA STANDALONE:                                      ║
║  - Mover para variável de ambiente (VITE_API_URL)                ║
║  - Adicionar health-check automático na inicialização             ║
║  - Implementar fallback para localhost em modo de desenvolvimento ║
║  - Criar endpoint dedicado: /api/monitoring/status                ║
╚══════════════════════════════════════════════════════════════════╝`,

  "src/services/fileSystemApi.ts": `
╔══════════════════════════════════════════════════════════════════╗
║  CAMADA DE SERVIÇOS — API do Sistema de Arquivos                 ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Módulo de abstração HTTP para comunicação com o backend.         ║
║                                                                  ║
║  PARA O SISTEMA STANDALONE DE MONITORAMENTO:                     ║
║  - Criar arquivo separado: src/services/networkApi.ts             ║
║  - Endpoints necessários:                                         ║
║    GET  /api/monitoring/scan      — Executa scan de rede          ║
║    GET  /api/monitoring/history   — Histórico de scans            ║
║    POST /api/monitoring/whitelist — Gerencia dispositivos seguros  ║
║    GET  /api/monitoring/alerts    — Lista alertas ativos           ║
║    WS   /ws/monitoring/live       — WebSocket para scan real-time  ║
║                                                                  ║
║  - Implementar retry automático com backoff exponencial            ║
║  - Cache local dos últimos resultados (localStorage)              ║
║  - Interceptor global para tratamento de erros                    ║
╚══════════════════════════════════════════════════════════════════╝`,

  "src/components/HudPanel.tsx": `
╔══════════════════════════════════════════════════════════════════╗
║  COMPONENTE UI — HudPanel (Painel HUD)                           ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Container visual estilizado com estética Cyberpunk/HUD.          ║
║                                                                  ║
║  PARA O SISTEMA STANDALONE:                                      ║
║  - Reutilizar como container principal do dashboard               ║
║  - Adicionar variantes: "alert" (vermelho), "safe" (verde)        ║
║  - Implementar modo fullscreen por painel                         ║
║  - Adicionar animação de "pulse" quando houver alertas            ║
╚══════════════════════════════════════════════════════════════════╝`,

  "src/components/ToolProjection.tsx": `
╔══════════════════════════════════════════════════════════════════╗
║  COMPONENTE UI — ToolProjection (Projeção de Ferramenta)         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Modal/overlay animado que projeta ferramentas sobre o dashboard. ║
║                                                                  ║
║  PARA O SISTEMA STANDALONE:                                      ║
║  - Usar como container para visualização detalhada de dispositivo ║
║  - Ao clicar em um IP, abrir ToolProjection com:                  ║
║    • Informações detalhadas do dispositivo                        ║
║    • Histórico de conexão                                         ║
║    • Opção de bloquear/desbloquear                                ║
║    • Ping em tempo real                                           ║
╚══════════════════════════════════════════════════════════════════╝`,

  "src/components/InfoWidgets.tsx": `
╔══════════════════════════════════════════════════════════════════╗
║  COMPONENTE — InfoWidgets (Widgets de Informação)                ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  PARA O SISTEMA STANDALONE:                                      ║
║  - Substituir widgets genéricos por métricas de rede:             ║
║    • Total de dispositivos online/offline                         ║
║    • Largura de banda consumida                                   ║
║    • Latência média da rede                                       ║
║    • Uptime do servidor de monitoramento                          ║
║    • Último scan executado (timestamp)                             ║
╚══════════════════════════════════════════════════════════════════╝`,

  "src/components/SecurityCameraPanel.tsx": `
╔══════════════════════════════════════════════════════════════════╗
║  COMPONENTE — SecurityCameraPanel (Câmeras de Segurança)         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  PARA O SISTEMA STANDALONE:                                      ║
║  - SUBSTITUIR câmeras por MAPA VISUAL DA REDE                    ║
║  - Renderizar topologia da rede com nós (dispositivos) e links    ║
║  - Usar canvas ou SVG para desenhar a topologia                   ║
║  - Dispositivos ativos = nó verde pulsante                        ║
║  - Dispositivos inativos = nó vermelho                            ║
║  - Gateway/Router = nó central maior                              ║
╚══════════════════════════════════════════════════════════════════╝`,

  "src/pages/Index.tsx": `
╔══════════════════════════════════════════════════════════════════╗
║  PÁGINA PRINCIPAL — Index (Dashboard)                            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Layout Grid 12 colunas com divisão 50/50 vertical.               ║
║                                                                  ║
║  PARA O SISTEMA STANDALONE DE MONITORAMENTO:                     ║
║  - Remover painéis não relacionados (Rádio, Calculadora, Pastas)  ║
║  - Reorganizar grid para 3 seções:                                ║
║    • TOPO (30%): Header + Métricas resumidas + Alertas            ║
║    • CENTRO (50%): Mapa de topologia da rede + Lista de IPs       ║
║    • RODAPÉ (20%): Gráfico histórico + Logs de atividade          ║
║  - Implementar tema dark-only (já existente no design system)     ║
║  - Adicionar notificações push para alertas críticos              ║
╚══════════════════════════════════════════════════════════════════╝`,

  "src/index.css": `
╔══════════════════════════════════════════════════════════════════╗
║  ESTILOS GLOBAIS — Design System Cyberpunk                       ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  PARA O SISTEMA STANDALONE:                                      ║
║  - Manter paleta ciano/neon como identidade visual                ║
║  - Adicionar classes utilitárias para status:                     ║
║    .status-safe { color: hsl(140 80% 55%); }                      ║
║    .status-warn { color: hsl(45 100% 55%); }                      ║
║    .status-danger { color: hsl(0 80% 55%); }                      ║
║  - Criar animação @keyframes para "pulse-alert"                   ║
║  - Adicionar variáveis CSS para cores de dispositivos             ║
╚══════════════════════════════════════════════════════════════════╝`,

  "server.js": `
╔══════════════════════════════════════════════════════════════════╗
║  BACKEND — Servidor Express (Node.js)                            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  PARA O SISTEMA STANDALONE:                                      ║
║  - Endpoint principal: GET /api/network/scan                      ║
║    • Executa "arp -a" via child_process                            ║
║    • Parseia saída para extrair IP, MAC, tipo                     ║
║    • Retorna JSON: { devices: [...], timestamp, scanDuration }    ║
║                                                                  ║
║  NOVOS ENDPOINTS NECESSÁRIOS:                                    ║
║  - GET  /api/monitoring/health     — Status do servidor           ║
║  - GET  /api/monitoring/history    — Histórico (SQLite/JSON)      ║
║  - POST /api/monitoring/whitelist  — CRUD de whitelist             ║
║  - GET  /api/monitoring/bandwidth  — Métricas de tráfego          ║
║  - WS   /ws/live                   — WebSocket para push updates  ║
║                                                                  ║
║  SEGURANÇA:                                                      ║
║  - Autenticação JWT obrigatória                                   ║
║  - Rate limiting (máx 10 scans/minuto)                            ║
║  - Sanitização de inputs                                          ║
║  - CORS restrito ao domínio do frontend                           ║
╚══════════════════════════════════════════════════════════════════╝`,

  "tailwind.config.ts": `
╔══════════════════════════════════════════════════════════════════╗
║  CONFIGURAÇÃO — Tailwind CSS                                     ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  PARA O SISTEMA STANDALONE:                                      ║
║  - Adicionar cores semânticas de status de rede                   ║
║  - Criar plugin para classes de animação de alerta                ║
║  - Manter design system cyberpunk existente                       ║
╚══════════════════════════════════════════════════════════════════╝`,

  "vite.config.ts": `
╔══════════════════════════════════════════════════════════════════╗
║  CONFIGURAÇÃO — Vite (Build Tool)                                ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  PARA O SISTEMA STANDALONE:                                      ║
║  - Configurar proxy para backend em desenvolvimento               ║
║  - Adicionar variáveis de ambiente para API URL                   ║
║  - Habilitar PWA (service worker) para monitoramento offline      ║
╚══════════════════════════════════════════════════════════════════╝`,
};

const ARCHITECTURE_DOC = `
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║           IGOR FUCKN SYSTEM — MÓDULO DE MONITORAMENTO DE REDE          ║
║                    DOCUMENTAÇÃO TÉCNICA COMPLETA                        ║
║                                                                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║  Versão: 2.0.0                                                         ║
║  Data: ${new Date().toLocaleDateString("pt-BR")}                                                      ║
║  Autor: Igor Fuckn System Engineering                                   ║
╚══════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. VISÃO GERAL DO SISTEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

O Sistema de Monitoramento de Rede é um módulo do IGOR FUCKN SYSTEM
responsável por:

  • Descobrir todos os dispositivos conectados à rede local
  • Exibir informações de IP, MAC Address e tipo de dispositivo
  • Atualizar em tempo real via polling ou WebSocket
  • Alertar sobre dispositivos desconhecidos (intrusos)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. ARQUITETURA STANDALONE (PÁGINA WEB INTEIRA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ┌─────────────────────────────────────────────────────────┐
  │                    BROWSER (Frontend)                    │
  │                                                         │
  │  ┌───────────────────────────────────────────────────┐  │
  │  │  HEADER: Logo + Status + Relógio + Alertas        │  │
  │  ├───────────────────────────────────────────────────┤  │
  │  │          BARRA DE MÉTRICAS (30% topo)              │  │
  │  │  [Devices Online] [Bandwidth] [Latência] [Uptime] │  │
  │  ├──────────────────────┬────────────────────────────┤  │
  │  │   LISTA DE IPs       │   MAPA DE TOPOLOGIA        │  │
  │  │   (Scroll + Filter)  │   (Canvas/SVG)             │  │
  │  │                      │                            │  │
  │  │   192.168.1.1  ●     │      [Router]              │  │
  │  │   192.168.1.10 ●     │     /   |   \\              │  │
  │  │   192.168.1.15 ●     │   [PC] [TV] [Phone]       │  │
  │  │   192.168.1.20 ⚠     │                            │  │
  │  │                      │                            │  │
  │  ├──────────────────────┴────────────────────────────┤  │
  │  │          HISTÓRICO + LOGS (20% rodapé)             │  │
  │  │  [Gráfico temporal de dispositivos conectados]     │  │
  │  └───────────────────────────────────────────────────┘  │
  │                          │                              │
  │                     HTTP / WebSocket                    │
  │                          │                              │
  │  ┌───────────────────────▼───────────────────────────┐  │
  │  │              BACKEND (Node.js/Express)             │  │
  │  │                                                    │  │
  │  │  GET /api/network/scan    → executa "arp -a"       │  │
  │  │  GET /api/monitoring/hist → consulta SQLite         │  │
  │  │  POST /api/whitelist      → gerencia whitelist      │  │
  │  │  WS  /ws/live             → push de novos devices   │  │
  │  └───────────────────────────────────────────────────┘  │
  └─────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. FLUXO DE DADOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [Usuário abre página]
       │
       ▼
  [Frontend monta NetworkDeviceMonitor]
       │
       ▼
  [useEffect dispara fetchDevices()]
       │
       ▼
  [fetch(GET /api/network/scan)]  ──timeout 10s──▶  [Error State]
       │
       ▼
  [Backend executa: child_process.exec("arp -a")]
       │
       ▼
  [Parse regex: IP, MAC, tipo]
       │
       ▼
  [Retorna JSON { devices: [...] }]
       │
       ▼
  [Frontend atualiza state: setDevices(data)]
       │
       ▼
  [Renderiza lista de dispositivos com estilo HUD/Cyberpunk]
       │
       ▼
  [Auto-refresh via setInterval a cada 30s]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. TECNOLOGIAS UTILIZADAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  FRONTEND:
  • React 18 + TypeScript
  • Vite (bundler)
  • Tailwind CSS (design system cyberpunk)
  • Framer Motion (animações)
  • Lucide React (ícones)

  BACKEND:
  • Node.js + Express 5
  • child_process (execução de "arp -a")
  • CORS habilitado

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. REQUISITOS PARA SISTEMA STANDALONE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  MUST HAVE (Obrigatório):
  ✓ Dashboard fullscreen (100vh) com monitoramento de rede
  ✓ Auto-scan a cada 15 segundos
  ✓ Lista de dispositivos com IP, MAC, tipo
  ✓ Indicador visual de status (online/offline)
  ✓ Botão de scan manual
  ✓ Tratamento de erro (backend offline)

  SHOULD HAVE (Importante):
  ○ Sistema de whitelist (dispositivos conhecidos)
  ○ Alerta visual/sonoro para dispositivos desconhecidos
  ○ Histórico de scans (gráfico temporal)
  ○ Filtro e busca por IP/MAC
  ○ WebSocket para updates em tempo real

  COULD HAVE (Desejável):
  ○ Mapa de topologia visual da rede
  ○ Geolocalização de IPs externos
  ○ Exportação de relatórios (CSV/PDF)
  ○ Notificações push do navegador
  ○ PWA com monitoramento offline

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. SEGURANÇA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  • Autenticação JWT para acesso ao dashboard
  • Rate limiting no endpoint de scan (máx 10/min)
  • CORS restrito ao domínio do frontend
  • Sanitização de todos os inputs
  • Logs de acesso e auditoria
  • Execução de "arp -a" sem privilégios elevados

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FIM DA DOCUMENTAÇÃO — IGOR FUCKN SYSTEM v2.0.0
`;

const PrintMonitoring = () => {
  const [files, setFiles] = useState<SourceFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFiles = async () => {
      const loaded: SourceFile[] = [];
      const allFiles = import.meta.glob(
        [
          "/src/**/*.{tsx,ts,css}",
          "/server.js",
          "/tailwind.config.ts",
          "/vite.config.ts",
        ],
        { query: "?raw", import: "default" }
      );

      for (const filePath of MONITORING_FILES) {
        const key = `/${filePath}`;
        const loader = allFiles[key];
        if (loader) {
          try {
            const content = (await loader()) as string;
            loaded.push({ path: filePath, content });
          } catch {
            loaded.push({ path: filePath, content: "// Erro ao carregar arquivo" });
          }
        }
      }
      setFiles(loaded);
      setLoading(false);
    };
    loadFiles();
  }, []);

  useEffect(() => {
    if (!loading && files.length > 0) {
      const timer = setTimeout(() => window.print(), 800);
      return () => clearTimeout(timer);
    }
  }, [loading, files]);

  if (loading) {
    return (
      <div style={{ padding: "40px", fontFamily: "monospace", textAlign: "center", background: "#0a0a0a", color: "#00ff88", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>
          <div style={{ fontSize: "32px", marginBottom: "10px" }}>⟳</div>
          <h1 style={{ fontSize: "16px", letterSpacing: "0.3em" }}>CARREGANDO CÓDIGO-FONTE...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="print-monitoring">
      <style>{`
        @media screen {
          .print-monitoring {
            max-width: 960px;
            margin: 0 auto;
            padding: 24px;
            background: #0a0a0a;
            color: #d0d0d0;
            font-family: 'Courier New', monospace;
            min-height: 100vh;
          }
          .print-monitoring .action-bar {
            position: sticky; top: 0; z-index: 50;
            background: #0a0a0aee; backdrop-filter: blur(8px);
            padding: 10px 0; margin-bottom: 20px;
            border-bottom: 1px solid #00ff8833;
            display: flex; gap: 10px;
          }
          .print-monitoring .action-btn {
            padding: 8px 18px;
            background: #111;
            color: #00ff88;
            border: 1px solid #00ff88;
            cursor: pointer;
            font-family: monospace;
            font-size: 13px;
            transition: background 0.2s;
          }
          .print-monitoring .action-btn:hover { background: #00ff8822; }
        }
        @media print {
          * { color: #000 !important; background: #fff !important; }
          .print-monitoring { padding: 0; max-width: 100%; }
          .print-monitoring .action-bar { display: none !important; }
          .file-block { page-break-inside: avoid; break-inside: avoid; }
          .section-comment { border: 2px solid #000 !important; background: #f5f5f5 !important; }
          pre {
            white-space: pre-wrap !important;
            word-wrap: break-word !important;
            font-size: 8px !important;
            line-height: 1.3 !important;
          }
          .cover-page, .arch-page { page-break-after: always; }
        }
      `}</style>

      {/* Action Bar */}
      <div className="action-bar">
        <button className="action-btn" onClick={() => window.history.back()}>← VOLTAR</button>
        <button className="action-btn" onClick={() => window.print()}>🖨️ IMPRIMIR / SALVAR PDF</button>
      </div>

      {/* === COVER PAGE === */}
      <div className="cover-page" style={{ textAlign: "center", paddingTop: "80px", minHeight: "90vh" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.5em", color: "#00ff88", marginBottom: "30px" }}>
          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
        </div>
        <h1 style={{ fontSize: "28px", letterSpacing: "0.15em", marginBottom: "8px", color: "#00ff88" }}>
          🖧 SISTEMA DE MONITORAMENTO DE REDE
        </h1>
        <h2 style={{ fontSize: "14px", opacity: 0.6, letterSpacing: "0.3em" }}>
          IGOR FUCKN SYSTEM — MÓDULO STANDALONE
        </h2>
        <div style={{ fontSize: "11px", letterSpacing: "0.5em", color: "#00ff88", margin: "30px 0" }}>
          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
        </div>

        <div style={{ margin: "50px auto", maxWidth: "500px", textAlign: "left", fontSize: "12px", lineHeight: "2" }}>
          <p><strong>Build:</strong> 2.0.0</p>
          <p><strong>Data:</strong> {new Date().toLocaleDateString("pt-BR")}</p>
          <p><strong>Tipo:</strong> Documentação Técnica + Código-Fonte Completo</p>
          <p><strong>Objetivo:</strong> Extrair o módulo de monitoramento de rede para operar como sistema web independente (fullscreen)</p>
          <p><strong>Arquivos incluídos:</strong> {files.length}</p>
        </div>

        <div style={{ marginTop: "40px", textAlign: "left", padding: "0 30px" }}>
          <h3 style={{ fontSize: "14px", marginBottom: "12px", color: "#00ff88", letterSpacing: "0.2em" }}>📑 ÍNDICE</h3>
          <div style={{ fontSize: "11px", lineHeight: "2.2", columns: 2 }}>
            <div style={{ marginBottom: "8px", fontWeight: "bold" }}>0. Documentação Técnica / Arquitetura</div>
            {files.map((f, i) => (
              <div key={i}>{i + 1}. {f.path}</div>
            ))}
          </div>
        </div>
      </div>

      {/* === ARCHITECTURE DOC === */}
      <div className="arch-page" style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "16px", color: "#00ff88", letterSpacing: "0.2em", marginBottom: "16px", borderBottom: "1px solid #00ff8866", paddingBottom: "8px" }}>
          📐 DOCUMENTAÇÃO TÉCNICA — ARQUITETURA DO SISTEMA
        </h2>
        <pre style={{ fontSize: "11px", lineHeight: "1.5", whiteSpace: "pre-wrap", padding: "16px", background: "#111", borderRadius: "4px", border: "1px solid #00ff8833" }}>
          {ARCHITECTURE_DOC}
        </pre>
      </div>

      {/* === SOURCE FILES === */}
      {files.map((file, i) => (
        <div key={i} className="file-block" style={{ marginBottom: "30px" }}>
          {/* Section comment */}
          {SECTION_COMMENTS[file.path] && (
            <pre
              className="section-comment"
              style={{
                fontSize: "10px",
                lineHeight: "1.4",
                whiteSpace: "pre-wrap",
                padding: "12px",
                background: "#0d1a0d",
                border: "1px solid #00ff8844",
                borderRadius: "4px",
                marginBottom: "8px",
                color: "#00ff88",
              }}
            >
              {SECTION_COMMENTS[file.path]}
            </pre>
          )}

          {/* File header */}
          <div style={{
            borderBottom: "1px solid #00ff8866",
            paddingBottom: "4px",
            marginBottom: "6px",
            fontSize: "13px",
            fontWeight: "bold",
            color: "#00ff88",
            display: "flex",
            justifyContent: "space-between",
          }}>
            <span>📁 {file.path}</span>
            <span style={{ fontSize: "10px", opacity: 0.5 }}>Arquivo {i + 1} de {files.length}</span>
          </div>

          {/* Code */}
          <pre style={{
            fontSize: "10px",
            lineHeight: "1.4",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            padding: "12px",
            background: "#111",
            borderRadius: "4px",
            border: "1px solid #ffffff11",
            overflow: "hidden",
          }}>
            {file.content}
          </pre>
        </div>
      ))}

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "40px 0", fontSize: "11px", opacity: 0.4, borderTop: "1px solid #00ff8833" }}>
        — FIM DO DOCUMENTO — IGOR FUCKN SYSTEM v2.0.0 — MONITORAMENTO DE REDE —
      </div>
    </div>
  );
};

export default PrintMonitoring;
