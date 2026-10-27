/* global React */
const { useState, useMemo } = React;

// ────────────────────────────────────────────────────────────────
// Shared design tokens — original palette tuned for dev-tooling feel
// ────────────────────────────────────────────────────────────────
const T = {
  // surfaces
  bg0: "#0B0E14",         // outer
  bg1: "#11151D",         // panel
  bg2: "#161B25",         // raised
  bg3: "#1E2531",         // input
  line: "#222A38",
  lineSoft: "#1A212C",
  // text
  text: "#E6EAF2",
  textDim: "#8A93A6",
  textFaint: "#5C6577",
  // accents
  cyan: "#5BC8FF",        // services
  violet: "#9D8CFF",      // networks
  amber: "#F5B454",       // volumes
  green: "#5BD4A4",       // healthy
  rose: "#FF7A8A",        // dependency / warn
  // light theme
  lbg0: "#F6F7F9",
  lbg1: "#FFFFFF",
  lline: "#E5E8EE",
};

// ────────────────────────────────────────────────────────────────
// Sample compose model used across all mockups
// ────────────────────────────────────────────────────────────────
const SERVICES = [
  { id: "mosquitto", name: "mosquitto", image: "eclipse-mosquitto:2.0", icon: "🦟", port: "1883", net: "iot-net", health: "running", deps: [], comm: ["telegraf", "nodered"] },
  { id: "nodered",   name: "nodered",   image: "nodered/node-red:3.1",   icon: "🔴", port: "1880", net: "iot-net", health: "running", deps: ["mosquitto"], comm: ["influxdb"] },
  { id: "telegraf",  name: "telegraf",  image: "telegraf:1.28",          icon: "📡", port: "8125", net: "iot-net", health: "running", deps: ["mosquitto","redis"], comm: ["influxdb"] },
  { id: "influxdb",  name: "influxdb",  image: "influxdb:2.7",           icon: "🌊", port: "8086", net: "iot-net", health: "warn",    deps: [], comm: [] },
  { id: "grafana",   name: "grafana",   image: "grafana/grafana:10.2",   icon: "📊", port: "3000", net: "iot-net", health: "running", deps: ["influxdb","redis"], comm: ["influxdb"] },
];
const NETWORKS = [{ id: "iot-net", name: "iot-netiot-net", driver: "bridge", subnet: "172.20.0.0/16" }];
const VOLUMES = [
  { id: "influxdb_data", name: "influxdb_data", size: "1.4 GB", mount: "influxdb:/var/lib/influxdb2" },
  { id: "grafana_data",  name: "grafana_data",  size: "84 MB",  mount: "grafana:/var/lib/grafana" },
];

const HEALTH_DOT = (h) => h === "running" ? T.green : h === "warn" ? T.amber : T.rose;

// ────────────────────────────────────────────────────────────────
// Tiny atoms
// ────────────────────────────────────────────────────────────────
function Pill({ children, color = T.textDim, bg = "transparent", border = T.line, mono = true }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "2px 8px", borderRadius: 999,
      border: `1px solid ${border}`, background: bg, color,
      fontFamily: mono ? "ui-monospace,Menlo,monospace" : "inherit",
      fontSize: 11, lineHeight: 1.4, letterSpacing: 0.2,
    }}>{children}</span>
  );
}
function Dot({ color, size = 8 }) {
  return <span style={{ width: size, height: size, borderRadius: 999, background: color, display: "inline-block", boxShadow: `0 0 0 3px ${color}22` }} />;
}
function Divider({ vertical, color = T.line }) {
  return vertical
    ? <div style={{ width: 1, alignSelf: "stretch", background: color }} />
    : <div style={{ height: 1, background: color, width: "100%" }} />;
}
function IconBtn({ children, active, title }) {
  return (
    <button title={title} style={{
      width: 30, height: 30, display: "grid", placeItems: "center",
      background: active ? T.bg3 : "transparent",
      border: `1px solid ${active ? T.line : "transparent"}`,
      borderRadius: 8, color: active ? T.text : T.textDim, cursor: "pointer",
      fontSize: 14,
    }}>{children}</button>
  );
}

// Generic header used in mockups (1, 3, 4)
function AppHeader({ filename = "docker-compose.iot.yml", theme = "dark" }) {
  const dark = theme === "dark";
  return (
    <div style={{
      height: 52, display: "flex", alignItems: "center", padding: "0 16px",
      background: dark ? T.bg1 : T.lbg1,
      borderBottom: `1px solid ${dark ? T.line : T.lline}`,
      gap: 14,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: `linear-gradient(135deg, ${T.cyan}, ${T.violet})`,
          display: "grid", placeItems: "center", color: "#0B0E14", fontWeight: 800, fontSize: 13,
        }}>D</div>
        <div style={{ fontWeight: 700, color: dark ? T.text : "#0B0E14", letterSpacing: -0.2 }}>
          docker<span style={{ color: dark ? T.cyan : T.violet }}>·</span>deck
        </div>
        <Pill color={T.violet} border={`${T.violet}55`} bg={`${T.violet}11`} mono={false}>alpha</Pill>
        <Pill color={T.green} border={`${T.green}55`} bg={`${T.green}11`}>v0.0.20</Pill>
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "6px 14px", borderRadius: 10,
          background: dark ? T.bg2 : "#F2F4F8",
          border: `1px solid ${dark ? T.line : T.lline}`,
          fontFamily: "ui-monospace,Menlo,monospace", fontSize: 12,
          color: dark ? T.text : "#0B0E14",
        }}>
          <span style={{ color: T.cyan }}>↑</span>
          <span style={{ color: dark ? T.textDim : "#5C6577" }}>{filename}</span>
          <span style={{ color: dark ? T.textFaint : "#A8B0BF" }}>· 5 services · 1 network · 2 volumes</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <IconBtn title="Validate">✓</IconBtn>
        <IconBtn title="Search">⌕</IconBtn>
        <IconBtn title="Share">↗</IconBtn>
        <div style={{ width: 1, height: 22, background: dark ? T.line : T.lline, margin: "0 4px" }} />
        <button style={{
          height: 30, padding: "0 12px", borderRadius: 8,
          background: T.cyan, color: "#0B0E14", border: "none", fontWeight: 600, fontSize: 12,
          cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
        }}>↓ Export</button>
      </div>
    </div>
  );
}

// Footer status bar
function StatusBar({ theme = "dark" }) {
  const dark = theme === "dark";
  return (
    <div style={{
      height: 32, display: "flex", alignItems: "center", padding: "0 14px", gap: 14,
      background: dark ? T.bg1 : T.lbg1,
      borderTop: `1px solid ${dark ? T.line : T.lline}`,
      fontFamily: "ui-monospace,Menlo,monospace", fontSize: 11,
      color: dark ? T.textDim : "#5C6577",
    }}>
      <span><Dot color={T.cyan} /> &nbsp;Networks 1</span>
      <span><Dot color={T.violet} /> &nbsp;Services 5</span>
      <span><Dot color={T.amber} /> &nbsp;Volumes 2</span>
      <div style={{ flex: 1 }} />
      <span>parsed in 42ms</span>
      <span>·</span>
      <span>iot-net 172.20.0.0/16</span>
      <span>·</span>
      <span>made with ♥ in Bengaluru 🇮🇳</span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Service node card (shared building block)
// ────────────────────────────────────────────────────────────────
function ServiceCard({ s, accent = T.cyan, compact, selected, theme = "dark" }) {
  const dark = theme === "dark";
  return (
    <div style={{
      width: compact ? 168 : 208,
      background: dark ? T.bg2 : T.lbg1,
      border: `1px solid ${selected ? accent : (dark ? T.line : T.lline)}`,
      borderRadius: 12,
      padding: compact ? 10 : 12,
      boxShadow: selected ? `0 0 0 3px ${accent}25, 0 8px 24px rgba(0,0,0,0.35)` : "0 4px 14px rgba(0,0,0,0.25)",
      position: "relative",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: 12, pointerEvents: "none",
        background: `linear-gradient(180deg, ${accent}10, transparent 40%)`,
      }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: `${accent}1F`, border: `1px solid ${accent}44`,
          display: "grid", placeItems: "center", fontSize: 14,
        }}>{s.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 600,
            color: dark ? T.text : "#0B0E14",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{s.name}</div>
          <div style={{
            fontSize: 10.5, color: dark ? T.textFaint : "#8A93A6",
            fontFamily: "ui-monospace,Menlo,monospace",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{s.image}</div>
        </div>
        <Dot color={HEALTH_DOT(s.health)} />
      </div>
      {!compact && (
        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap", position: "relative" }}>
          <Pill color={T.textDim}>:{s.port}</Pill>
          <Pill color={accent} border={`${accent}55`} bg={`${accent}10`}>{s.net}</Pill>
          {s.deps.length > 0 && <Pill color={T.rose} border={`${T.rose}44`}>↳ {s.deps.length}</Pill>}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MOCKUP 1 — "Studio"  (three-pane IDE layout)
// ════════════════════════════════════════════════════════════════
function Mockup1Studio() {
  return (
    <div style={{ width: 1280, height: 800, background: T.bg0, color: T.text, display: "flex", flexDirection: "column", fontFamily: "Inter, system-ui, sans-serif" }}>
      <AppHeader />

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* LEFT: Outline tree */}
        <div style={{ width: 260, background: T.bg1, borderRight: `1px solid ${T.line}`, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <input placeholder="Filter resources…" style={{
              flex: 1, height: 30, padding: "0 10px", borderRadius: 8,
              background: T.bg3, border: `1px solid ${T.line}`, color: T.text,
              fontSize: 12, outline: "none",
            }} />
          </div>
          <Divider />
          <div style={{ padding: "10px 14px 4px", fontSize: 10.5, fontWeight: 700, color: T.textFaint, letterSpacing: 1.2 }}>SERVICES · 5</div>
          {SERVICES.map((s, i) => (
            <div key={s.id} style={{
              padding: "8px 14px", display: "flex", alignItems: "center", gap: 10,
              background: i === 1 ? `${T.cyan}10` : "transparent",
              borderLeft: `2px solid ${i === 1 ? T.cyan : "transparent"}`,
              cursor: "pointer",
            }}>
              <span style={{ fontSize: 13 }}>{s.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: T.text }}>{s.name}</div>
                <div style={{ fontSize: 10.5, fontFamily: "ui-monospace,Menlo,monospace", color: T.textFaint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.image}</div>
              </div>
              <Dot color={HEALTH_DOT(s.health)} size={7} />
            </div>
          ))}
          <div style={{ padding: "16px 14px 4px", fontSize: 10.5, fontWeight: 700, color: T.textFaint, letterSpacing: 1.2 }}>NETWORKS · 1</div>
          {NETWORKS.map(n => (
            <div key={n.id} style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, background: `${T.violet}22`, border: `1px solid ${T.violet}55` }} />
              <div style={{ fontSize: 12.5 }}>{n.name}</div>
              <div style={{ flex: 1 }} />
              <Pill color={T.violet}>{n.driver}</Pill>
            </div>
          ))}
          <div style={{ padding: "16px 14px 4px", fontSize: 10.5, fontWeight: 700, color: T.textFaint, letterSpacing: 1.2 }}>VOLUMES · 2</div>
          {VOLUMES.map(v => (
            <div key={v.id} style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, background: `${T.amber}22`, border: `1px solid ${T.amber}55` }} />
              <div style={{ fontSize: 12.5, fontFamily: "ui-monospace,Menlo,monospace" }}>{v.name}</div>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 10.5, color: T.textFaint, fontFamily: "ui-monospace,Menlo,monospace" }}>{v.size}</span>
            </div>
          ))}
        </div>

        {/* CENTER: Canvas */}
        <div style={{ flex: 1, position: "relative", background:
          `radial-gradient(circle at 1px 1px, ${T.line} 1px, transparent 0) 0 0/22px 22px, ${T.bg0}` }}>
          {/* Canvas toolbar */}
          <div style={{ position: "absolute", top: 14, left: 14, right: 14, display: "flex", alignItems: "center", gap: 8, zIndex: 5 }}>
            <div style={{ display: "flex", gap: 2, padding: 3, background: T.bg1, border: `1px solid ${T.line}`, borderRadius: 10 }}>
              <IconBtn title="Graph" active>◇</IconBtn>
              <IconBtn title="Layers">≡</IconBtn>
              <IconBtn title="Code">{"</>"}</IconBtn>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", gap: 2, padding: 3, background: T.bg1, border: `1px solid ${T.line}`, borderRadius: 10 }}>
              <IconBtn title="Auto layout" active>⇲</IconBtn>
              <IconBtn title="Fit">⛶</IconBtn>
              <IconBtn title="Lock">🔒</IconBtn>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: T.bg1, border: `1px solid ${T.line}`, borderRadius: 10, fontSize: 11.5, fontFamily: "ui-monospace,Menlo,monospace", color: T.textDim }}>
              <span style={{ color: T.text }}>78%</span>
            </div>
          </div>

          {/* Graph (hand-laid) */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <defs>
              <marker id="ah-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={T.cyan} />
              </marker>
              <marker id="ah-rose" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={T.rose} />
              </marker>
            </defs>
            {/* network → services (network bus) */}
            <path d="M 480 130 C 480 200, 280 220, 280 280" stroke={T.violet} strokeWidth="1.5" fill="none" strokeDasharray="4 4" opacity="0.55" />
            <path d="M 510 130 C 510 200, 520 230, 520 280" stroke={T.violet} strokeWidth="1.5" fill="none" strokeDasharray="4 4" opacity="0.55" />
            <path d="M 540 130 C 540 200, 760 230, 760 280" stroke={T.violet} strokeWidth="1.5" fill="none" strokeDasharray="4 4" opacity="0.55" />
            {/* deps (rose dashed) */}
            <path d="M 380 380 C 470 380, 480 480, 380 540" stroke={T.rose} strokeWidth="1.6" fill="none" strokeDasharray="6 4" markerEnd="url(#ah-rose)" />
            <path d="M 600 380 C 540 460, 460 470, 400 540" stroke={T.rose} strokeWidth="1.6" fill="none" strokeDasharray="6 4" markerEnd="url(#ah-rose)" />
            {/* comm (cyan solid) */}
            <path d="M 600 320 C 700 360, 720 360, 760 360" stroke={T.cyan} strokeWidth="2" fill="none" markerEnd="url(#ah-cyan)" />
            <path d="M 380 360 C 480 420, 600 420, 760 380" stroke={T.cyan} strokeWidth="2" fill="none" markerEnd="url(#ah-cyan)" />
            <path d="M 820 380 C 840 460, 720 540, 600 560" stroke={T.cyan} strokeWidth="2" fill="none" markerEnd="url(#ah-cyan)" />
            {/* edge label chip */}
            <g transform="translate(680 372)">
              <rect x="-30" y="-9" width="60" height="18" rx="9" fill={T.bg1} stroke={T.line} />
              <text x="0" y="3" textAnchor="middle" fontSize="10" fill={T.textDim} fontFamily="ui-monospace,Menlo,monospace">:8086</text>
            </g>
          </svg>

          {/* Network "lane" pill */}
          <div style={{ position: "absolute", top: 80, left: 380, width: 280, padding: "10px 14px", borderRadius: 14, background: `${T.violet}10`, border: `1px dashed ${T.violet}55`, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: `${T.violet}22`, border: `1px solid ${T.violet}66`, display: "grid", placeItems: "center", fontSize: 10, color: T.violet }}>⌗</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>iot-net</div>
              <div style={{ fontSize: 10.5, color: T.textFaint, fontFamily: "ui-monospace,Menlo,monospace" }}>bridge · 172.20.0.0/16</div>
            </div>
          </div>

          {/* Service cards positioned */}
          <div style={{ position: "absolute", left: 200, top: 280 }}><ServiceCard s={SERVICES[0]} accent={T.cyan} /></div>
          <div style={{ position: "absolute", left: 440, top: 280, zIndex: 2 }}><ServiceCard s={SERVICES[2]} accent={T.cyan} selected /></div>
          <div style={{ position: "absolute", left: 680, top: 280 }}><ServiceCard s={SERVICES[4]} accent={T.cyan} /></div>
          <div style={{ position: "absolute", left: 200, top: 540 }}><ServiceCard s={SERVICES[1]} accent={T.cyan} /></div>
          <div style={{ position: "absolute", left: 680, top: 540 }}><ServiceCard s={SERVICES[3]} accent={T.cyan} /></div>

          {/* Volume chip */}
          <div style={{ position: "absolute", left: 740, top: 670, padding: "8px 12px", borderRadius: 10, background: T.bg2, border: `1px solid ${T.line}`, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, background: `${T.amber}22`, border: `1px solid ${T.amber}55`, display: "grid", placeItems: "center", color: T.amber, fontSize: 10 }}>▤</div>
            <span style={{ fontSize: 11.5, fontFamily: "ui-monospace,Menlo,monospace" }}>influxdb_data</span>
            <Pill color={T.amber}>1.4 GB</Pill>
          </div>

          {/* Minimap */}
          <div style={{ position: "absolute", right: 14, bottom: 14, width: 180, height: 110, background: T.bg1, border: `1px solid ${T.line}`, borderRadius: 10, padding: 8 }}>
            <div style={{ width: "100%", height: "100%", borderRadius: 6, background: T.bg0, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: "20%", top: "10%", width: 10, height: 10, borderRadius: 999, background: T.violet }} />
              {[[18,38],[42,38],[64,38],[18,68],[64,68]].map(([x,y],i) => (
                <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: 8, height: 8, borderRadius: 999, background: T.cyan }} />
              ))}
              <div style={{ position: "absolute", left: "8%", top: "20%", width: "60%", height: "60%", border: `1.5px solid ${T.cyan}`, borderRadius: 4 }} />
            </div>
          </div>
        </div>

        {/* RIGHT: Inspector */}
        <div style={{ width: 320, background: T.bg1, borderLeft: `1px solid ${T.line}`, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${T.cyan}1F`, border: `1px solid ${T.cyan}44`, display: "grid", placeItems: "center", fontSize: 18 }}>📡</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>telegraf</div>
              <div style={{ fontSize: 11, color: T.textFaint, fontFamily: "ui-monospace,Menlo,monospace" }}>telegraf:1.28</div>
            </div>
            <Pill color={T.green} border={`${T.green}55`} bg={`${T.green}10`}>● running</Pill>
          </div>
          <Divider />

          <div style={{ display: "flex", gap: 4, padding: "8px 12px" }}>
            {["Overview","Config","Env","Logs"].map((t,i) => (
              <button key={t} style={{
                padding: "6px 10px", borderRadius: 7, fontSize: 11.5,
                background: i === 0 ? T.bg3 : "transparent", color: i === 0 ? T.text : T.textDim,
                border: `1px solid ${i === 0 ? T.line : "transparent"}`, cursor: "pointer",
              }}>{t}</button>
            ))}
          </div>
          <Divider />

          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16, overflow: "auto" }}>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: T.textFaint, letterSpacing: 1.2, marginBottom: 8 }}>PORTS</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Pill color={T.text} border={T.line} bg={T.bg2}>8125/udp → 8125</Pill>
                <Pill color={T.text} border={T.line} bg={T.bg2}>8092/tcp → 8092</Pill>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: T.textFaint, letterSpacing: 1.2, marginBottom: 8 }}>DEPENDS ON</div>
              {["mosquitto","redis"].map(d => (
                <div key={d} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 7, background: T.bg2, marginBottom: 6 }}>
                  <span style={{ color: T.rose }}>↳</span>
                  <span style={{ fontSize: 12, fontFamily: "ui-monospace,Menlo,monospace" }}>{d}</span>
                  <div style={{ flex: 1 }} />
                  <Pill color={T.rose}>service_started</Pill>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: T.textFaint, letterSpacing: 1.2, marginBottom: 8 }}>NETWORKS</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 7, background: T.bg2 }}>
                <span style={{ width: 8, height: 8, borderRadius: 3, background: T.violet }} />
                <span style={{ fontSize: 12 }}>iot-net</span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: T.textFaint, fontFamily: "ui-monospace,Menlo,monospace" }}>172.20.0.5</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: T.textFaint, letterSpacing: 1.2, marginBottom: 8 }}>RAW</div>
              <pre style={{
                margin: 0, padding: 12, borderRadius: 8,
                background: T.bg0, border: `1px solid ${T.line}`,
                fontSize: 10.5, lineHeight: 1.6,
                fontFamily: "ui-monospace,Menlo,monospace",
                color: T.textDim, overflow: "auto",
              }}>
{`telegraf:
  image: telegraf:1.28
  depends_on:
    - mosquitto
    - redis
  networks:
    - iot-net`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <StatusBar />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MOCKUP 2 — "Layered Topology" (lanes: networks → services → volumes)
// ════════════════════════════════════════════════════════════════
function Mockup2Layered() {
  return (
    <div style={{ width: 1280, height: 800, background: T.bg0, color: T.text, display: "flex", flexDirection: "column", fontFamily: "Inter, system-ui, sans-serif" }}>
      <AppHeader filename="docker-compose.iot.yml" />

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* Left rail: layer toggles */}
        <div style={{ width: 56, background: T.bg1, borderRight: `1px solid ${T.line}`, padding: "14px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <IconBtn title="Topology" active>≡</IconBtn>
          <IconBtn title="Tree">⌬</IconBtn>
          <IconBtn title="Code">{"</>"}</IconBtn>
          <IconBtn title="Diff">⇄</IconBtn>
          <div style={{ flex: 1 }} />
          <IconBtn title="Settings">⚙</IconBtn>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden",
          background: `linear-gradient(${T.lineSoft} 1px, transparent 1px) 0 0/100% 28px, ${T.bg0}` }}>

          {/* Top toolbar floating */}
          <div style={{ position: "absolute", top: 14, left: 18, display: "flex", gap: 8, zIndex: 5 }}>
            <Pill color={T.text} bg={T.bg1} border={T.line} mono={false}>Auto layout · Layered</Pill>
            <Pill color={T.textDim} bg={T.bg1} border={T.line} mono={false}>Group by network</Pill>
          </div>
          <div style={{ position: "absolute", top: 14, right: 18, zIndex: 5, display: "flex", gap: 8 }}>
            <Pill color={T.cyan} bg={T.bg1} border={T.line}><Dot color={T.cyan} size={6} /> communicates</Pill>
            <Pill color={T.rose} bg={T.bg1} border={T.line}><Dot color={T.rose} size={6} /> depends_on</Pill>
            <Pill color={T.amber} bg={T.bg1} border={T.line}><Dot color={T.amber} size={6} /> mounts</Pill>
          </div>

          {/* LAYER 1: Networks */}
          <div style={{ position: "absolute", top: 70, left: 40, right: 40, padding: "16px 20px", borderRadius: 16, background: `${T.violet}0A`, border: `1px dashed ${T.violet}44` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: T.violet, letterSpacing: 1.2 }}>NETWORKS</span>
              <Divider color={`${T.violet}33`} />
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{
                padding: "10px 18px", borderRadius: 12, background: T.bg2, border: `1px solid ${T.violet}55`,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${T.violet}22`, border: `1px solid ${T.violet}55`, display: "grid", placeItems: "center", color: T.violet }}>⌗</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>iot-net</div>
                  <div style={{ fontSize: 10.5, color: T.textFaint, fontFamily: "ui-monospace,Menlo,monospace" }}>bridge · 172.20.0.0/16 · 5 attached</div>
                </div>
              </div>
            </div>
          </div>

          {/* LAYER 2: Services */}
          <div style={{ position: "absolute", top: 240, left: 40, right: 40, padding: "16px 20px", borderRadius: 16, background: `${T.cyan}0A`, border: `1px dashed ${T.cyan}33` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: T.cyan, letterSpacing: 1.2 }}>SERVICES</span>
              <Divider color={`${T.cyan}33`} />
            </div>
            <div style={{ display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap" }}>
              {SERVICES.map((s, i) => (
                <ServiceCard key={s.id} s={s} accent={T.cyan} compact selected={i === 2} />
              ))}
            </div>
          </div>

          {/* LAYER 3: Volumes */}
          <div style={{ position: "absolute", top: 540, left: 40, right: 40, padding: "16px 20px", borderRadius: 16, background: `${T.amber}0A`, border: `1px dashed ${T.amber}33` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: T.amber, letterSpacing: 1.2 }}>VOLUMES</span>
              <Divider color={`${T.amber}33`} />
            </div>
            <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
              {VOLUMES.map(v => (
                <div key={v.id} style={{ padding: "10px 14px", borderRadius: 10, background: T.bg2, border: `1px solid ${T.line}`, display: "flex", alignItems: "center", gap: 10, minWidth: 220 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: `${T.amber}22`, border: `1px solid ${T.amber}55`, display: "grid", placeItems: "center", color: T.amber }}>▤</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "ui-monospace,Menlo,monospace" }}>{v.name}</div>
                    <div style={{ fontSize: 10.5, color: T.textFaint, fontFamily: "ui-monospace,Menlo,monospace" }}>{v.mount}</div>
                  </div>
                  <Pill color={T.amber}>{v.size}</Pill>
                </div>
              ))}
            </div>
          </div>

          {/* Connections (orthogonal) */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            {/* Network → each service (drop down) */}
            {[180, 365, 555, 745, 935].map((x, i) => (
              <path key={i}
                d={`M 640 168 V 215 H ${x + 90} V 290`}
                stroke={T.violet} strokeWidth="1.4" fill="none"
                strokeDasharray="4 4" opacity="0.5" />
            ))}
            {/* Service ↔ service (comm) — over the services lane */}
            <path d="M 270 360 H 460" stroke={T.cyan} strokeWidth="2" fill="none" />
            <path d="M 460 350 H 645 V 380 H 830" stroke={T.cyan} strokeWidth="2" fill="none" />
            {/* Volume mounts */}
            <path d="M 745 460 V 560" stroke={T.amber} strokeWidth="2" fill="none" strokeDasharray="2 4" />
            <path d="M 935 460 V 560 H 720" stroke={T.amber} strokeWidth="2" fill="none" strokeDasharray="2 4" />
          </svg>
        </div>
      </div>

      <StatusBar />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MOCKUP 3 — "Compose Canvas" (split YAML editor ↔ live graph)
// ════════════════════════════════════════════════════════════════
function Mockup3Editor() {
  return (
    <div style={{ width: 1280, height: 800, background: T.bg0, color: T.text, display: "flex", flexDirection: "column", fontFamily: "Inter, system-ui, sans-serif" }}>
      <AppHeader filename="docker-compose.iot.yml" />

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* LEFT — YAML editor */}
        <div style={{ width: 540, background: T.bg1, borderRight: `1px solid ${T.line}`, display: "flex", flexDirection: "column" }}>
          <div style={{ height: 36, display: "flex", alignItems: "center", padding: "0 12px", borderBottom: `1px solid ${T.line}`, gap: 6 }}>
            <Pill color={T.text} bg={T.bg2} border={T.line} mono={false}>docker-compose.yml</Pill>
            <Pill color={T.textDim} bg="transparent" border="transparent" mono={false}>+ override</Pill>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 10.5, color: T.textFaint, fontFamily: "ui-monospace,Menlo,monospace" }}>YAML · 122 lines</span>
          </div>

          <pre style={{
            flex: 1, margin: 0, padding: "14px 0 14px 0",
            background: T.bg1, fontSize: 12, lineHeight: 1.7,
            fontFamily: "ui-monospace,Menlo,monospace",
            overflow: "auto",
          }}>
{[
  ["1","version: \"3.9\""],
  ["2",""],
  ["3","services:"],
  ["4","  mosquitto:", "service"],
  ["5","    image: eclipse-mosquitto:2.0", "img"],
  ["6","    ports: [\"1883:1883\"]", "port"],
  ["7","    networks: [iot-net]", "net"],
  ["8",""],
  ["9","  telegraf:", "service-sel"],
  ["10","    image: telegraf:1.28", "img"],
  ["11","    depends_on:", "dep"],
  ["12","      - mosquitto", "dep"],
  ["13","      - redis", "dep"],
  ["14","    networks: [iot-net]", "net"],
  ["15",""],
  ["16","  influxdb:", "service"],
  ["17","    image: influxdb:2.7", "img"],
  ["18","    volumes:", "vol"],
  ["19","      - influxdb_data:/var/lib/influxdb2", "vol"],
  ["20",""],
  ["21","  grafana:", "service"],
  ["22","    image: grafana/grafana:10.2", "img"],
  ["23","    depends_on: [influxdb, redis]", "dep"],
  ["24",""],
  ["25","networks:", "k"],
  ["26","  iot-net: { driver: bridge }", "net"],
  ["27","volumes:", "k"],
  ["28","  influxdb_data: {}", "vol"],
].map(([n, txt, kind]) => {
  const colors = {
    "service": T.cyan, "service-sel": T.cyan,
    "img": T.green, "port": T.amber, "net": T.violet,
    "dep": T.rose, "vol": T.amber, "k": T.text,
  };
  return (
    <div key={n} style={{
      display: "flex", padding: "0 14px",
      background: kind === "service-sel" ? `${T.cyan}10` : "transparent",
      borderLeft: `3px solid ${kind === "service-sel" ? T.cyan : "transparent"}`,
    }}>
      <span style={{ width: 32, color: T.textFaint, textAlign: "right", paddingRight: 12, userSelect: "none" }}>{n}</span>
      <span style={{ color: colors[kind] || T.text }}>{txt}</span>
    </div>
  );
})}
          </pre>

          <div style={{ height: 32, borderTop: `1px solid ${T.line}`, display: "flex", alignItems: "center", padding: "0 12px", gap: 12, fontSize: 11, color: T.textDim, fontFamily: "ui-monospace,Menlo,monospace" }}>
            <span style={{ color: T.green }}>● valid</span>
            <span>Ln 9, Col 3</span>
            <div style={{ flex: 1 }} />
            <span>UTF-8 · LF · YAML</span>
          </div>
        </div>

        {/* RIGHT — Live graph */}
        <div style={{ flex: 1, position: "relative",
          background: `radial-gradient(circle at 1px 1px, ${T.line} 1px, transparent 0) 0 0/22px 22px, ${T.bg0}` }}>

          {/* sync banner */}
          <div style={{ position: "absolute", top: 14, left: 14, right: 14, display: "flex", alignItems: "center", gap: 10, zIndex: 5 }}>
            <Pill color={T.cyan} bg={T.bg1} border={T.line} mono={false}>
              <Dot color={T.cyan} size={6} /> Selected in YAML → telegraf highlighted
            </Pill>
            <div style={{ flex: 1 }} />
            <Pill color={T.textDim} bg={T.bg1} border={T.line}>⌥ ↔ jump</Pill>
          </div>

          {/* graph nodes */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <defs>
              <marker id="m3-rose" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={T.rose} />
              </marker>
              <marker id="m3-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={T.cyan} />
              </marker>
            </defs>
            <path d="M 110 380 C 200 380, 220 280, 320 280" stroke={T.rose} strokeWidth="2" fill="none" markerEnd="url(#m3-rose)" strokeDasharray="6 4" />
            <path d="M 510 280 C 580 320, 580 380, 660 380" stroke={T.cyan} strokeWidth="2" fill="none" markerEnd="url(#m3-cyan)" />
            <path d="M 110 460 C 220 460, 240 280, 320 280" stroke={T.rose} strokeWidth="2" fill="none" markerEnd="url(#m3-rose)" strokeDasharray="6 4" opacity="0.5" />
          </svg>

          <div style={{ position: "absolute", left: 30, top: 200 }}><ServiceCard s={SERVICES[0]} accent={T.cyan} /></div>
          <div style={{ position: "absolute", left: 320, top: 200, zIndex: 2 }}><ServiceCard s={SERVICES[2]} accent={T.cyan} selected /></div>
          <div style={{ position: "absolute", left: 30, top: 420 }}><ServiceCard s={SERVICES[1]} accent={T.cyan} /></div>
          <div style={{ position: "absolute", left: 660, top: 320 }}><ServiceCard s={SERVICES[3]} accent={T.cyan} /></div>
          <div style={{ position: "absolute", left: 460, top: 480 }}><ServiceCard s={SERVICES[4]} accent={T.cyan} /></div>

          {/* HUD */}
          <div style={{ position: "absolute", left: 14, bottom: 14, display: "flex", gap: 6 }}>
            <IconBtn title="zoom-">−</IconBtn>
            <IconBtn title="zoom+">+</IconBtn>
            <IconBtn title="fit">⛶</IconBtn>
            <IconBtn title="lock">🔒</IconBtn>
          </div>
        </div>
      </div>

      <StatusBar />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MOCKUP 4 — "Atlas" (light, editorial dashboard view)
// ════════════════════════════════════════════════════════════════
function Mockup4Atlas() {
  const dark = false;
  return (
    <div style={{ width: 1280, height: 800, background: T.lbg0, color: "#0B0E14", display: "flex", flexDirection: "column", fontFamily: "Inter, system-ui, sans-serif" }}>
      <AppHeader theme="light" />

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* Stats column */}
        <div style={{ width: 260, background: T.lbg1, borderRight: `1px solid ${T.lline}`, padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#8A93A6", letterSpacing: 1.2 }}>STACK</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, letterSpacing: -0.5 }}>iot pipeline</div>
            <div style={{ fontSize: 12, color: "#5C6577" }}>5 services · 1 network · 2 volumes</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "running", val: "4", color: T.green },
              { label: "warning", val: "1", color: T.amber },
              { label: "ports", val: "7", color: T.cyan },
              { label: "deps",   val: "5", color: T.rose },
            ].map(s => (
              <div key={s.label} style={{ padding: 12, border: `1px solid ${T.lline}`, borderRadius: 10, background: "#FAFBFC" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: -1 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "#5C6577" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#8A93A6", letterSpacing: 1.2, marginBottom: 8 }}>HEALTH TIMELINE</div>
            <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 44 }}>
              {Array.from({length: 28}, (_, i) => {
                const h = 12 + ((i * 13) % 28);
                const c = i === 22 ? T.amber : i > 24 ? T.green : T.cyan;
                return <div key={i} style={{ width: 6, height: h, background: c, borderRadius: 2, opacity: 0.65 }} />;
              })}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#8A93A6", letterSpacing: 1.2, marginBottom: 8 }}>RECENT</div>
            {[
              ["Added grafana", "2m"],
              ["telegraf v1.28", "14m"],
              ["bumped subnet", "1h"],
            ].map(([t,when]) => (
              <div key={t} style={{ display: "flex", padding: "6px 0", fontSize: 12, borderBottom: `1px dashed ${T.lline}` }}>
                <span style={{ flex: 1 }}>{t}</span>
                <span style={{ color: "#8A93A6", fontFamily: "ui-monospace,Menlo,monospace" }}>{when}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center — Atlas grid */}
        <div style={{ flex: 1, padding: 22, overflow: "hidden", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#8A93A6", letterSpacing: 1.4 }}>TOPOLOGY · iot-net</div>
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", gap: 6 }}>
              <Pill color="#0B0E14" bg={T.lbg1} border={T.lline} mono={false}>Architect view</Pill>
              <Pill color="#5C6577" bg="transparent" border={T.lline} mono={false}>Runtime</Pill>
              <Pill color="#5C6577" bg="transparent" border={T.lline} mono={false}>Cost</Pill>
            </div>
          </div>

          {/* atlas card */}
          <div style={{
            position: "relative", height: 600, borderRadius: 16, padding: 24,
            background: `radial-gradient(ellipse at 50% 0%, #EEF2F7 0%, #F6F7F9 60%)`,
            border: `1px solid ${T.lline}`, overflow: "hidden",
          }}>
            {/* Network arc title */}
            <div style={{ position: "absolute", top: 16, left: 24, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: 999, background: T.violet }} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>iot-net</span>
              <span style={{ fontSize: 11, color: "#8A93A6", fontFamily: "ui-monospace,Menlo,monospace" }}>172.20.0.0/16</span>
            </div>

            {/* connections */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              <defs>
                <marker id="m4-rose" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={T.rose} />
                </marker>
              </defs>
              {/* main backbone */}
              <path d="M 90 300 L 920 300" stroke="#D8DDE5" strokeWidth="3" fill="none" strokeDasharray="2 6" />
              {/* drop lines */}
              {[160, 340, 520, 700, 880].map((x, i) => (
                <line key={i} x1={x} y1="300" x2={x} y2="220" stroke="#D8DDE5" strokeWidth="2" />
              ))}
              {/* deps overlay */}
              <path d="M 200 280 C 280 460, 380 460, 480 280" stroke={T.rose} strokeWidth="1.6" strokeDasharray="5 4" fill="none" markerEnd="url(#m4-rose)" />
              <path d="M 540 280 C 620 460, 700 460, 760 280" stroke={T.rose} strokeWidth="1.6" strokeDasharray="5 4" fill="none" markerEnd="url(#m4-rose)" />
            </svg>

            {/* services along backbone */}
            {SERVICES.map((s, i) => (
              <div key={s.id} style={{ position: "absolute", left: 90 + i * 180, top: 130 }}>
                <ServiceCard s={s} accent={T.violet} compact selected={i === 2} theme="light" />
              </div>
            ))}

            {/* volume callouts */}
            {VOLUMES.map((v, i) => (
              <div key={v.id} style={{ position: "absolute", left: 200 + i * 360, top: 380, padding: "10px 14px", background: T.lbg1, border: `1px solid ${T.lline}`, borderRadius: 12, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 6px 24px rgba(11,14,20,0.06)" }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: `${T.amber}22`, border: `1px solid ${T.amber}55`, display: "grid", placeItems: "center", color: T.amber, fontSize: 12 }}>▤</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "ui-monospace,Menlo,monospace" }}>{v.name}</div>
                  <div style={{ fontSize: 10.5, color: "#8A93A6", fontFamily: "ui-monospace,Menlo,monospace" }}>{v.size} · {v.mount.split(":")[0]}</div>
                </div>
              </div>
            ))}

            {/* legend */}
            <div style={{ position: "absolute", right: 18, bottom: 18, display: "flex", gap: 8 }}>
              <Pill color="#0B0E14" bg={T.lbg1} border={T.lline}><Dot color={T.violet} size={6} /> network</Pill>
              <Pill color="#0B0E14" bg={T.lbg1} border={T.lline}><Dot color={T.cyan} size={6} /> service</Pill>
              <Pill color="#0B0E14" bg={T.lbg1} border={T.lline}><Dot color={T.amber} size={6} /> volume</Pill>
              <Pill color="#0B0E14" bg={T.lbg1} border={T.lline}><Dot color={T.rose} size={6} /> depends_on</Pill>
            </div>
          </div>
        </div>
      </div>

      <StatusBar theme="light" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MOCKUP 5 — Annotated "what we changed" overlay on current screen
// ════════════════════════════════════════════════════════════════
function Mockup0Annotated() {
  const ann = (n, txt, x, y, w = 220) => (
    <div style={{ position: "absolute", left: x, top: y, width: w, zIndex: 10 }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "8px 12px", borderRadius: 10,
        background: T.bg2, border: `1px solid ${T.cyan}55`,
        boxShadow: `0 8px 24px rgba(0,0,0,0.4)`,
      }}>
        <div style={{ width: 22, height: 22, borderRadius: 999, background: T.cyan, color: "#0B0E14", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11 }}>{n}</div>
        <div style={{ fontSize: 12, color: T.text, lineHeight: 1.35 }}>{txt}</div>
      </div>
    </div>
  );
  return (
    <div style={{ width: 1280, height: 800, background: T.bg0, color: T.text, position: "relative", fontFamily: "Inter, system-ui, sans-serif" }}>
      <AppHeader />
      {/* fake graph behind */}
      <div style={{ position: "absolute", inset: "52px 0 32px 0",
        background: `radial-gradient(circle at 1px 1px, ${T.line} 1px, transparent 0) 0 0/22px 22px, ${T.bg0}`, opacity: 0.85 }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5 }}>
          <circle cx="640" cy="160" r="36" fill={`${T.violet}22`} stroke={T.violet} />
          {[[300,360],[500,400],[800,360],[300,560],[800,560]].map(([x,y],i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="32" fill={T.bg2} stroke={T.line} />
              <line x1="640" y1="180" x2={x} y2={y - 30} stroke={T.violet} strokeDasharray="4 4" strokeWidth="1" />
            </g>
          ))}
          <path d="M 300 360 C 400 400, 450 400, 500 400" stroke={T.cyan} strokeWidth="1.5" />
          <text x="380" y="395" fill={T.text} opacity="0.4" fontSize="11" fontFamily="ui-monospace,Menlo,monospace">cdepeudisxommunicates</text>
        </svg>
      </div>

      {/* dim overlay */}
      <div style={{ position: "absolute", inset: "52px 0 32px 0", background: "rgba(11,14,20,0.55)" }} />

      <div style={{ position: "absolute", left: 40, top: 76, fontSize: 11, fontWeight: 700, color: T.cyan, letterSpacing: 1.6 }}>WHAT THE CURRENT SCREEN STRUGGLES WITH</div>
      <div style={{ position: "absolute", left: 40, top: 96, fontSize: 30, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.15, maxWidth: 700 }}>
        Strong bones, but the canvas does all the work alone.
      </div>
      <div style={{ position: "absolute", left: 40, top: 170, fontSize: 14, color: T.textDim, maxWidth: 540, lineHeight: 1.55 }}>
        Five problems show up before a user even reads a label. The mockups that follow each take a different swing at fixing them while staying inside React Flow + Ant Design + Tailwind.
      </div>

      {ann(1, "Edge labels collide ('cdepeudisxommunicates'). Auto-layout + label chips on the edge midpoint.", 360, 350)}
      {ann(2, "Generic cube icons hide what each service actually is. Use image-aware icons + name + tag.", 60, 520)}
      {ann(3, "Right panel is a single 'Export' dropdown — wasted real estate. Make it an inspector.", 980, 200)}
      {ann(4, "Network is a floating node, not a container. Group services inside their network.", 600, 78, 240)}
      {ann(5, "Footer counters duplicate left-rail tree. One source of truth.", 60, 720, 280)}

      <div style={{ position: "absolute", left: 40, bottom: 60, display: "flex", gap: 8 }}>
        <Pill color={T.cyan} bg={T.bg1} border={`${T.cyan}66`} mono={false}>→ scroll right for 4 directions</Pill>
      </div>
      <StatusBar />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Mount via design canvas
// ════════════════════════════════════════════════════════════════
function App() {
  const sections = [
    { id: "audit", title: "00 · Audit", subtitle: "Critique of the current screen" },
    { id: "studio", title: "01 · Studio", subtitle: "Three-pane IDE — tree • graph • inspector" },
    { id: "layered", title: "02 · Layered topology", subtitle: "Networks → services → volumes lanes" },
    { id: "editor", title: "03 · Compose canvas", subtitle: "YAML editor synced to live graph" },
    { id: "atlas", title: "04 · Atlas (light)", subtitle: "Architect dashboard with stats" },
  ];
  const boards = {
    audit: <Mockup0Annotated />,
    studio: <Mockup1Studio />,
    layered: <Mockup2Layered />,
    editor: <Mockup3Editor />,
    atlas: <Mockup4Atlas />,
  };
  return (
    <DesignCanvas title="DockerDeck — UI directions" subtitle="Same stack (React Flow · Ant Design · Tailwind), four very different framings.">
      {sections.map(sec => (
        <DCSection key={sec.id} id={sec.id} title={sec.title} subtitle={sec.subtitle}>
          <DCArtboard id={sec.id + "-1280"} label={sec.title.replace(/^\d+ · /, "")} width={1280} height={800}>
            {boards[sec.id]}
          </DCArtboard>
        </DCSection>
      ))}
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
