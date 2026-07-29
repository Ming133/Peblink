"use client";

import { useMemo, useState } from "react";

type PageKey = "overview" | "exploration" | "licenses";

const navigation = [
  ["overview", "▦", "National Overview"],
  ["exploration", "⌖", "Exploration Intelligence"],
  ["licenses", "▤", "Licenses & Operators"],
  ["ownership", "◎", "Ownership & Compliance"],
  ["production", "▥", "Production Intelligence"],
  ["export", "↗", "Export & Corridors"],
  ["revenue", "₣", "Pricing & Revenue"],
  ["infrastructure", "⌁", "Infrastructure & Supply Chain"],
  ["environment", "♧", "Environmental & Social"],
  ["alerts", "△", "Alerts & Risk Center"],
  ["quality", "◫", "Data Quality & Sources"],
  ["reports", "⇩", "Reports & Exports"],
  ["administration", "⚙", "Administration"],
] as const;

const kpis = [
  { label: "Active licenses", value: "146", delta: "+8 this year", icon: "▤", tone: "blue" },
  { label: "Active operators", value: "38", delta: "6 under review", icon: "◎", tone: "teal" },
  { label: "Reported production", value: "68.4Mt", delta: "↑ 4.8% vs prior year", icon: "▥", tone: "green" },
  { label: "Recorded exports", value: "63.1Mt", delta: "7.8% reconciliation gap", icon: "↗", tone: "blue" },
  { label: "Government revenue", value: "GNF 4.2T", delta: "91.6% collected", icon: "₣", tone: "green" },
  { label: "Compliance rate", value: "84.7%", delta: "32 reports overdue", icon: "✓", tone: "amber" },
  { label: "Critical alerts", value: "12", delta: "3 require action", icon: "!", tone: "red" },
  { label: "Exploration targets", value: "27", delta: "8 high evidence", icon: "⌖", tone: "purple" },
];

const alerts = [
  { level: "Critical", title: "Export exceeds reported production", meta: "Forest Belt Gold · Kankan", age: "2h", color: "red" },
  { level: "High", title: "License expires within 60 days", meta: "GUI-MIN-014 · Boké", age: "6h", color: "amber" },
  { level: "High", title: "Expected royalty payment missing", meta: "North Ridge Bauxite · Kindia", age: "1d", color: "amber" },
  { level: "Medium", title: "Ownership record incomplete", meta: "West Africa Minerals · Conakry", age: "2d", color: "blue" },
];

const licenses = [
  ["GUI-MIN-014", "North Ridge Bauxite", "Alpha Mining Guinea", "Bauxite", "Boké", "Active", "88"],
  ["GUI-EXP-001", "Forest Belt Gold", "West Africa Minerals", "Gold", "Kankan", "Expiring", "72"],
  ["GUI-EXP-027", "Fouta Lithium", "Koba Resources", "Lithium", "Labé", "Active", "91"],
  ["GUI-MIN-042", "Simandou North", "Guinea Ferrous Ltd.", "Iron ore", "Nzérékoré", "Pending", "80"],
  ["GUI-REC-118", "Coastal Graphite", "Atlantic Minerals", "Graphite", "Kindia", "Suspended", "54"],
];

const targets = [
  ["01", "Fouta Central", "Lithium", "Level 3", "Strong", "Drill validation"],
  ["02", "Kankan East", "Gold · Copper", "Level 3", "Strong", "Surface sampling"],
  ["03", "Forest Belt CM-07", "Nickel · Cobalt", "Level 2", "Moderate", "Geophysical survey"],
  ["04", "Beyla Ridge", "REE", "Level 2", "Moderate", "Additional mapping"],
];

function AppIcon({ children }: { children: React.ReactNode }) {
  return <span className="app-icon" aria-hidden>{children}</span>;
}

function Sparkline({ tone = "blue" }: { tone?: string }) {
  return (
    <div className={`sparkline ${tone}`}>
      {[35, 51, 42, 60, 55, 74, 67, 82].map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}
    </div>
  );
}

function MapVisual({ exploration = false, onSelect }: { exploration?: boolean; onSelect: (name: string) => void }) {
  const points = exploration
    ? [["target t1", "Fouta Central"], ["target t2", "Kankan East"], ["target t3", "Forest Belt CM-07"], ["target t4", "Beyla Ridge"]]
    : [["mine m1", "North Ridge Bauxite"], ["mine m2", "Forest Belt Gold"], ["mine m3", "Simandou North"], ["alert-point m4", "GUI-MIN-014"]];
  return (
    <div className={`map-visual ${exploration ? "exploration-map" : ""}`}>
      <div className="map-tools">
        <button>＋</button><button>−</button><button title="Reset map">⌂</button>
      </div>
      <div className="map-mode"><span>Map</span><span>Satellite</span></div>
      <div className="map-label ml1">BOKÉ</div><div className="map-label ml2">LABÉ</div>
      <div className="map-label ml3">KANKAN</div><div className="map-label ml4">NZÉRÉKORÉ</div>
      <div className="guinea-shape">
        <div className="region-line r1" /><div className="region-line r2" /><div className="region-line r3" />
        <div className="license-poly p1" /><div className="license-poly p2" /><div className="license-poly p3" />
        {exploration && <><div className="geo-band g1" /><div className="geo-band g2" /><div className="geo-band g3" /></>}
        <div className="corridor c1" /><div className="corridor c2" />
        {points.map(([cls, name]) => <button key={name} className={cls} onClick={() => onSelect(name)} aria-label={`Open ${name}`}><span /></button>)}
      </div>
      <div className="port-label"><b>◉</b> Conakry Port</div>
      <div className="map-legend">
        {exploration ? <><span><i className="lg-purple" /> Target area</span><span><i className="lg-dot" /> Occurrence</span><span><i className="lg-drill" /> Drill evidence</span></> :
          <><span><i className="lg-green" /> Active license</span><span><i className="lg-mine" /> Mine</span><span><i className="lg-line" /> Corridor</span><span><i className="lg-red" /> Alert</span></>}
      </div>
      <div className="map-scale">0&nbsp;&nbsp;&nbsp;&nbsp;50&nbsp;&nbsp;&nbsp;&nbsp;100 km</div>
    </div>
  );
}

function DetailDrawer({ name, onClose, exploration = false }: { name: string; onClose: () => void; exploration?: boolean }) {
  return (
    <aside className="detail-drawer">
      <div className="drawer-head">
        <span className={`eyebrow ${exploration ? "purple-text" : ""}`}>{exploration ? "EXPLORATION TARGET" : "SELECTED RECORD"}</span>
        <button onClick={onClose} aria-label="Close details">×</button>
      </div>
      <h2>{name}</h2>
      <p className="muted">{exploration ? "Target CM-07 · Nzérékoré Region" : "GUI-MIN-014 · Boké Region"}</p>
      <div className="drawer-status"><span className={exploration ? "purple-chip" : "green-chip"}>{exploration ? "Level 2 — Surface supported" : "Active"}</span><span>Confidence: {exploration ? "Moderate" : "High"}</span></div>
      {exploration ? (
        <>
          <section><h4>Interpretation</h4><p>This area contains geological indicators that may justify additional exploration.</p></section>
          <section><h4>Supporting evidence</h4><ul><li>Nickel-cobalt stream sediment anomaly</li><li>Mapped ultramafic lithology</li><li>Regional magnetic anomaly</li></ul></section>
          <section><h4>Limitations</h4><p>No modern drilling data. Geochemical coverage last updated in 2019.</p></section>
          <section><h4>Recommended next action</h4><p><b>Targeted geophysical survey</b>, followed by field verification and surface sampling.</p></section>
        </>
      ) : (
        <div className="record-grid">
          <span>Operator<b>Alpha Mining Guinea</b></span><span>Commodity<b>Bauxite</b></span>
          <span>Area<b>242 km²</b></span><span>Expiry<b>18 Sep 2026</b></span>
          <span>Latest production<b>4.8 Mt</b></span><span>Compliance score<b>88 / 100</b></span>
        </div>
      )}
      <button className="primary full">{exploration ? "Export evidence summary" : "View full record"} <span>→</span></button>
      <p className="drawer-foot">Prototype — demonstration data only</p>
    </aside>
  );
}

function Overview({ onOpen }: { onOpen: (name: string) => void }) {
  return (
    <>
      <header className="page-heading">
        <div><div className="breadcrumb">NATIONAL OVERVIEW <span>/</span> EXECUTIVE VIEW</div><h1>National Mining Overview</h1><p>Integrated national visibility across mining activity, critical minerals, infrastructure, revenue, and compliance.</p></div>
        <div className="heading-actions"><button className="select-btn">All regions⌄</button><button className="select-btn">All commodities⌄</button><button className="primary">⇩ Export report</button></div>
      </header>
      <div className="kpi-grid">
        {kpis.map(k => <article className="kpi-card" key={k.label}><div className="kpi-top"><AppIcon>{k.icon}</AppIcon><Sparkline tone={k.tone} /></div><p>{k.label}</p><div className="kpi-value">{k.value}</div><small className={k.tone}>{k.delta}</small></article>)}
      </div>
      <section className="main-grid">
        <article className="panel map-panel">
          <div className="panel-head"><div><span className="section-kicker">NATIONAL ACTIVITY</span><h3>Mining activity & infrastructure</h3></div><div className="panel-actions"><button>☷ Layers <b>7</b></button><button>↗</button></div></div>
          <MapVisual onSelect={onOpen} />
        </article>
        <div className="right-stack">
          <article className="panel commodity-panel">
            <div className="panel-head"><div><span className="section-kicker">PRODUCTION</span><h3>By commodity</h3></div><button className="text-btn">Volume⌄</button></div>
            {[["Bauxite", 74, "48.7 Mt"], ["Iron ore", 39, "10.6 Mt"], ["Gold", 24, "7.2 Mt"], ["Diamond", 12, "1.4 Mt"], ["Other", 7, "0.5 Mt"]].map(([n,w,v],i)=><div className="bar-row" key={n}><span>{n}</span><div><i style={{width:`${w}%`}} className={`bar b${i}`}/></div><b>{v}</b></div>)}
            <div className="commodity-foot"><span><i/> Production volume</span><button>View intelligence →</button></div>
          </article>
          <article className="panel alert-panel">
            <div className="panel-head"><div><span className="section-kicker red">ACTION REQUIRED</span><h3>Priority alerts</h3></div><button className="text-btn">View all 12 →</button></div>
            {alerts.map(a=><button className="alert-row" onClick={()=>onOpen(a.meta.split(" · ")[0])} key={a.title}><i className={a.color}>{a.level === "Critical" ? "!" : "△"}</i><span><b>{a.title}</b><small>{a.meta}</small></span><time>{a.age}</time></button>)}
          </article>
        </div>
      </section>
      <section className="lower-grid">
        <article className="panel trend-panel"><div className="panel-head"><div><span className="section-kicker">RECONCILIATION</span><h3>Production vs. exports</h3></div><span className="variance">7.8% gap</span></div><div className="chart"><div className="y-labels"><span>8M</span><span>6M</span><span>4M</span><span>2M</span><span>0</span></div><div className="chart-grid">{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i)=><div key={m}><i className="prod" style={{height:`${38+((i*17)%46)}%`}}/><i className="exp" style={{height:`${32+((i*13)%40)}%`}}/><span>{m}</span></div>)}</div></div></article>
        <article className="panel revenue-card"><div className="panel-head"><div><span className="section-kicker">REVENUE ALIGNMENT</span><h3>Collection performance</h3></div></div><div className="revenue-number"><b>91.6%</b><span>collection rate</span></div><div className="revenue-track"><i style={{width:"91.6%"}}/></div><div className="revenue-values"><span>Expected<b>GNF 4.58T</b></span><span>Recorded<b>GNF 4.20T</b></span><span>Variance<b className="amber">− GNF 385B</b></span></div></article>
        <article className="panel coverage-card"><div className="panel-head"><div><span className="section-kicker">DATA COVERAGE</span><h3>National freshness</h3></div><b className="score">86</b></div><div className="coverage-bars"><span>Sources current <b>18 / 22</b><i><em style={{width:"82%"}}/></i></span><span>Records validated <b>94.1%</b><i><em style={{width:"94%"}}/></i></span><span>Metadata complete <b>81.5%</b><i><em style={{width:"81%"}}/></i></span></div><p><i className="amber-dot"/> 4 sources delayed · 23 issues awaiting review</p></article>
      </section>
    </>
  );
}

function Exploration({ onOpen }: { onOpen: (name: string) => void }) {
  return (
    <>
      <header className="page-heading exploration-heading"><div><div className="breadcrumb purple-text">EXPLORATION INTELLIGENCE <span>/</span> NATIONAL VIEW</div><h1>Critical Minerals Exploration Intelligence</h1><p>Evidence-based evaluation of geological opportunity, data confidence, and exploration maturity.</p></div><button className="primary purple-bg">⇩ Export evidence</button></header>
      <div className="disclaimer"><b>i</b><span><strong>Exploration interpretation notice</strong> Indicators represent evidence for further investigation and do not confirm an economically viable mineral deposit.</span><button>Methodology</button></div>
      <section className="exploration-grid">
        <aside className="panel filter-panel"><div className="panel-head"><h3>Evidence filters</h3><button>Reset</button></div><label>Commodity</label><button className="field">Lithium, Nickel +2 <span>⌄</span></button><label>Region</label><button className="field">All regions <span>⌄</span></button><label>Evidence level</label>{["Level 4 — Appraised","Level 3 — Drill supported","Level 2 — Surface supported","Level 1 — Speculative"].map((x,i)=><label className="check" key={x}><input type="checkbox" defaultChecked={i<3}/><i className={`ev e${4-i}`}/>{x}</label>)}<label>Evidence type</label><div className="chips"><button>Geochemistry ×</button><button>Drilling ×</button><button>Geophysics ×</button><button>+ Add</button></div><label>Minimum confidence</label><input className="range" type="range" defaultValue="58"/><div className="range-labels"><span>Low</span><b>Moderate</b><span>High</span></div><button className="primary full purple-bg">Apply filters</button></aside>
        <article className="panel exploration-map-panel"><div className="panel-head"><div><span className="section-kicker purple-text">MULTI-LAYER EVIDENCE MAP</span><h3>National exploration context</h3></div><div className="panel-actions"><button>☷ Layers <b>5</b></button><button>Opacity</button></div></div><MapVisual exploration onSelect={onOpen}/></article>
        <aside className="panel evidence-panel"><div className="panel-head"><div><span className="section-kicker purple-text">EVIDENCE SUMMARY</span><h3>Forest Belt CM-07</h3></div><button>⋯</button></div><div className="evidence-level"><span>LEVEL 2</span><b>Surface supported</b><small>Overall confidence · Moderate</small></div>{[["Geological favorability",78],["Mineral evidence",64],["Subsurface evidence",18],["Infrastructure access",71],["Metadata completeness",58]].map(([n,v])=><div className="evidence-score" key={n}><span>{n}<b>{v}%</b></span><i><em style={{width:`${v}%`}}/></i></div>)}<div className="gap-box"><b>Key data gap</b><p>No modern drilling records within the target boundary.</p></div><button className="primary full purple-bg" onClick={()=>onOpen("Forest Belt CM-07")}>Inspect target →</button></aside>
      </section>
      <article className="panel table-panel"><div className="panel-head"><div><span className="section-kicker purple-text">RANKED REVIEW QUEUE</span><h3>Areas requiring further evaluation</h3></div><button className="text-btn">Scoring method ⓘ</button></div><table><thead><tr><th>Rank</th><th>Area</th><th>Commodity</th><th>Evidence</th><th>Confidence</th><th>Recommended action</th><th></th></tr></thead><tbody>{targets.map(t=><tr key={t[0]}><td><b className="rank">{t[0]}</b></td><td><b>{t[1]}</b></td><td>{t[2]}</td><td><span className="purple-chip">{t[3]}</span></td><td>{t[4]}</td><td>{t[5]}</td><td><button onClick={()=>onOpen(t[1])}>→</button></td></tr>)}</tbody></table></article>
    </>
  );
}

function Licenses({ onOpen }: { onOpen: (name: string) => void }) {
  const stats = [["Active","146","green"],["Pending","19","blue"],["Expiring ≤90d","11","amber"],["Expired","27","gray"],["Suspended","6","red"],["Reports overdue","32","amber"]];
  return <><header className="page-heading"><div><div className="breadcrumb">LICENSES & OPERATORS <span>/</span> NATIONAL REGISTER</div><h1>License & Operator Intelligence</h1><p>National visibility into mining rights, operators, locations, validity, reporting status, and compliance.</p></div><div className="heading-actions"><button className="select-btn">＋ New record</button><button className="primary">⇩ Export register</button></div></header><div className="license-stats">{stats.map(s=><article className="panel" key={s[0]}><i className={s[2]}/><span>{s[0]}</span><b>{s[1]}</b></article>)}</div><section className="license-main"><article className="panel mini-license-map"><div className="panel-head"><div><span className="section-kicker">SPATIAL REGISTER</span><h3>License areas</h3></div><button>☷ Layers</button></div><MapVisual onSelect={onOpen}/></article><article className="panel expiry"><div className="panel-head"><div><span className="section-kicker amber">RENEWAL WORKFLOW</span><h3>Upcoming expiries</h3></div></div>{[["Aug","3","GUI-EXP-001"],["Sep","5","GUI-MIN-014"],["Oct","2","GUI-REC-087"],["Nov","1","GUI-EXP-103"]].map(x=><button onClick={()=>onOpen(x[2])} key={x[0]}><time>{x[0]}<b>{x[1]}</b></time><span>{x[2]}<small>Review required</small></span><b>→</b></button>)}</article></section><article className="panel table-panel license-table"><div className="panel-head"><div><span className="section-kicker">NATIONAL REGISTER</span><h3>License records <small>208 total</small></h3></div><div className="table-tools"><input placeholder="⌕ Search license or operator"/><button>☷ Filters <b>2</b></button></div></div><table><thead><tr><th>License ID</th><th>Name / Operator</th><th>Commodity</th><th>Region</th><th>Status</th><th>Compliance</th><th></th></tr></thead><tbody>{licenses.map(l=><tr key={l[0]} onClick={()=>onOpen(l[1])}><td><b className="id">{l[0]}</b></td><td><b>{l[1]}</b><small>{l[2]}</small></td><td>{l[3]}</td><td>{l[4]}</td><td><span className={`status ${l[5].toLowerCase()}`}>{l[5]}</span></td><td><span className="score-pill">{l[6]}</span></td><td><button>→</button></td></tr>)}</tbody></table></article></>;
}

export default function Home() {
  const [page, setPage] = useState<PageKey>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const pageTitle = useMemo(() => navigation.find(n => n[0] === page)?.[2], [page]);
  function navigate(key: string) { if (["overview","exploration","licenses"].includes(key)) setPage(key as PageKey); else setPage("overview"); setSelected(""); }
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><div className="crest"><span>★</span><i/><b>GN</b></div><div><strong>National Mineral Intelligence Dashboard</strong><small>Republic of Guinea</small></div></div>
        <div className="prototype">Prototype · Demonstration Data Only</div>
        <div className="top-actions">
          <button className="country"><span className="flag">🇬🇳</span><span><small>Country</small><b>Guinea</b></span><i>⌄</i></button>
          <button className="period"><small>Reporting period</small><b>Current year · 2026</b></button>
          <button className="freshness"><i/><span><small>Last updated 28 Jul 2026</small><b>18 of 22 sources current</b></span></button>
          <button className="icon-btn">⌕</button><button className="icon-btn notify">♢<i>3</i></button>
          <button className="language">EN⌄</button><button className="profile"><span>AM</span><i>⌄</i></button>
        </div>
      </header>
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="side-label">{collapsed ? "" : "INTELLIGENCE MODULES"}</div>
        <nav>{navigation.map(([key,icon,label])=><button key={key} className={page===key ? "active":""} onClick={()=>navigate(key)} title={label}><AppIcon>{icon}</AppIcon><span>{label}</span>{key==="alerts"&&<b className="nav-count">12</b>}</button>)}</nav>
        <div className="side-footer"><div className="coverage"><span>National data coverage<b>86%</b></span><i><em/></i><small>4 sources delayed</small></div><button onClick={()=>setCollapsed(!collapsed)}>{collapsed ? "›" : "‹ Collapse navigation"}</button></div>
      </aside>
      <main className={`content ${collapsed ? "wide" : ""}`}>
        <div className="mobile-title">{pageTitle}</div>
        {page==="overview" && <Overview onOpen={setSelected}/>}
        {page==="exploration" && <Exploration onOpen={setSelected}/>}
        {page==="licenses" && <Licenses onOpen={setSelected}/>}
      </main>
      {selected && <><button className="drawer-backdrop" onClick={()=>setSelected("")} aria-label="Close detail panel"/><DetailDrawer name={selected} onClose={()=>setSelected("")} exploration={page==="exploration"}/></>}
      {query && <div className="search-results">Searching national records for “{query}”</div>}
      <button className="floating-search" onClick={()=>{const q=prompt("Search licenses, operators, mines, targets or regions"); if(q){setQuery(q); setTimeout(()=>setQuery(""),2200)}}}>⌕</button>
    </div>
  );
}
