"use client";

import { useMemo, useState } from "react";

type PageKey = "overview" | "exploration" | "licenses" | "ownership" | "production" | "export" | "revenue" | "infrastructure" | "environment" | "alerts" | "quality" | "reports" | "administration";

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

type OverviewLayer = "mines" | "farms" | "rivers" | "pollution" | "alerts";

type OverviewMapFeature = {
  id: string;
  name: string;
  type: string;
  detail: string;
  coordinates: string;
  x: number;
  y: number;
  width?: number;
  angle?: number;
  size?: "small" | "medium" | "large";
};

const overviewLayerOptions: Array<{ id: OverviewLayer; label: string; count: number }> = [
  { id: "mines", label: "Mines", count: 4 },
  { id: "farms", label: "Farmland", count: 3 },
  { id: "rivers", label: "Rivers", count: 4 },
  { id: "pollution", label: "Pollution zones", count: 3 },
  { id: "alerts", label: "Alerts", count: 3 },
];

const overviewMapData: Record<"mines" | "farms" | "rivers" | "pollution", OverviewMapFeature[]> = {
  mines: [
    { id: "north-ridge", name: "North Ridge Bauxite Mine", type: "Mine · Bauxite", detail: "Active operation · Boké monitoring zone", coordinates: "11.17° N, 14.05° W", x: 27, y: 23 },
    { id: "fouta-lithium", name: "Fouta Central Lithium Project", type: "Mine · Lithium", detail: "Development-stage demonstration site", coordinates: "10.96° N, 12.31° W", x: 48, y: 31 },
    { id: "kankan-gold", name: "Kankan East Gold Mine", type: "Mine · Gold", detail: "Active operation · water sampling nearby", coordinates: "10.12° N, 9.34° W", x: 70, y: 49 },
    { id: "simandou-north", name: "Simandou North Iron Mine", type: "Mine · Iron ore", detail: "Development corridor · sediment watch", coordinates: "8.91° N, 8.91° W", x: 66, y: 76 },
  ],
  farms: [
    { id: "kamsar-rice", name: "Kamsar Rice Fields", type: "Farmland · Rice", detail: "Potential downstream exposure area", coordinates: "10.78° N, 14.09° W", x: 19, y: 39, size: "large" },
    { id: "kindia-farms", name: "Kindia Pineapple Cooperative", type: "Farmland · Fruit", detail: "Irrigated agricultural demonstration area", coordinates: "10.01° N, 12.88° W", x: 43, y: 54, size: "medium" },
    { id: "milo-farms", name: "Upper Milo Farmland", type: "Farmland · Mixed crops", detail: "Potential river-water exposure area", coordinates: "10.03° N, 9.18° W", x: 72, y: 61, size: "large" },
  ],
  rivers: [
    { id: "rio-nunez", name: "Rio Nunez", type: "River · Coastal basin", detail: "Downstream of the Boké mining corridor", coordinates: "10.91° N, 14.34° W", x: 12, y: 31, width: 28, angle: 18 },
    { id: "konkoure", name: "Konkouré River", type: "River · National waterway", detail: "Agricultural and community water-use corridor", coordinates: "10.39° N, 13.14° W", x: 30, y: 43, width: 34, angle: 9 },
    { id: "milo", name: "Milo River", type: "River · Niger tributary", detail: "Runs beside the Kankan monitoring area", coordinates: "10.17° N, 9.39° W", x: 60, y: 43, width: 25, angle: 58 },
    { id: "niandan", name: "Niandan River", type: "River · Upper Guinea basin", detail: "Downstream sediment monitoring route", coordinates: "9.26° N, 9.02° W", x: 52, y: 69, width: 27, angle: -18 },
  ],
  pollution: [
    { id: "boke-runoff", name: "Boké Runoff Watch Zone", type: "Potential pollution · Critical", detail: "Illustrative red zone: mine runoff may reach river and rice fields", coordinates: "10.84° N, 14.11° W", x: 27, y: 34, size: "large" },
    { id: "kankan-tailings", name: "Kankan Tailings Watch Zone", type: "Potential pollution · High", detail: "Illustrative red zone: tailings-water pathway under review", coordinates: "10.08° N, 9.29° W", x: 68, y: 54, size: "medium" },
    { id: "simandou-sediment", name: "Simandou Sediment Watch Zone", type: "Potential pollution · Medium", detail: "Illustrative red zone: elevated sediment exposure scenario", coordinates: "8.96° N, 8.96° W", x: 63, y: 72, size: "medium" },
  ],
};

const overviewEnvironmentalAlerts = [
  { id: "env-001", level: "Critical", title: "Possible mine runoff entering Rio Nunez", affected: "Rio Nunez · Kamsar Rice Fields", coordinates: "10.84° N, 14.11° W", cause: "North Ridge drainage corridor", age: "18 min", color: "red" },
  { id: "env-002", level: "High", title: "Tailings-water pathway requires sampling", affected: "Milo River · Upper Milo Farmland", coordinates: "10.08° N, 9.29° W", cause: "Kankan East monitoring area", age: "2 h", color: "amber" },
  { id: "env-003", level: "Medium", title: "Sediment plume could move downstream", affected: "Niandan River · Nzérékoré Valley farms", coordinates: "8.96° N, 8.96° W", cause: "Simandou corridor earthworks", age: "1 d", color: "blue" },
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

const moduleSpecs: Record<Exclude<PageKey, "overview" | "exploration" | "licenses">, {
  title: string; subtitle: string; kicker: string; accent: string;
  kpis: [string, string, string][]; primary: string; secondary: string;
  columns: string[]; rows: string[][]; notice?: string;
}> = {
  ownership: {
    title: "Ownership & Company Intelligence",
    subtitle: "Corporate structures, beneficial ownership, investor relationships, license connections, and compliance risk.",
    kicker: "COMPANY & BENEFICIAL OWNERSHIP REGISTER", accent: "teal",
    kpis: [["Registered companies","84","12 newly verified"],["Active license holders","38","45.2% of registry"],["Ownership completed","71%","↑ 6.4%"],["Records incomplete","24","Action required"],["Foreign controlled","31","8 jurisdictions"],["Under compliance review","9","3 high risk"],["Conflict flags","4","Restricted review"],["Complex structures","13","Manual review"]],
    primary: "Ownership relationship network", secondary: "Beneficial ownership completeness",
    columns: ["Company","Registration","Country","Parent company","BO status","Licenses","Commodities","Risk"],
    rows: [["Alpha Mining Guinea","GN-C-10842","Guinea","Alpha Resources SA","Verified","6","Bauxite","Low"],["West Africa Minerals","GN-C-20218","Guinea","WAM Holdings","Incomplete","3","Gold · Copper","High"],["Koba Resources","GN-C-19403","Guinea","Koba International","Verified","4","Lithium","Low"],["Guinea Ferrous Ltd.","GN-C-15107","Guinea","Ferrous Global","Under review","2","Iron ore","Medium"]],
  },
  production: {
    title: "Production Intelligence",
    subtitle: "Production volumes, plans, performance, reporting consistency, and operational changes across mines and commodities.",
    kicker: "NATIONAL PRODUCTION MONITORING", accent: "green",
    kpis: [["Reported production","68.4 Mt","↑ 4.8% YoY"],["Producing mines","22","4 commodities"],["Reports received","91%","118 / 130"],["Reports overdue","12","4 high priority"],["Production vs plan","−3.2%","2.3 Mt below"],["Year-over-year","+4.8%","Positive trend"],["Largest commodity","Bauxite","71.2% output"],["Unusual changes","7","Review required"]],
    primary: "Actual, planned & previous-year production", secondary: "Production by commodity",
    columns: ["Mine","Operator","License","Commodity","Region","Plan","Reported","Variance","Validation","Risk"],
    rows: [["North Ridge","Alpha Mining","GUI-MIN-014","Bauxite","Boké","5.1 Mt","4.8 Mt","−5.9%","Validated","Low"],["Simandou North","Guinea Ferrous","GUI-MIN-042","Iron ore","Nzérékoré","2.2 Mt","2.5 Mt","+13.6%","Review","High"],["Forest Belt","WAM","GUI-EXP-001","Gold","Kankan","428 koz","401 koz","−6.3%","Validated","Medium"]],
    notice: "7 anomaly rules triggered: unexpected changes, missing submissions, unit inconsistency, capacity exceedance, duplicate reports, and production–export mismatch.",
  },
  export: {
    title: "Export & Corridor Intelligence",
    subtitle: "Mineral movement from mine sites through transport corridors to ports and international markets.",
    kicker: "MINE-TO-PORT TRACEABILITY", accent: "blue",
    kpis: [["Export tonnage","63.1 Mt","↑ 3.9%"],["Export value","USD 4.8B","Demo data"],["Active shipments","47","8 in transit"],["Main export port","Conakry","42% volume"],["Main destination","China","51% volume"],["Production variance","7.8%","Material gap"],["Delayed shipments","6","Avg. 2.3 days"],["Corridor alerts","5","2 high priority"]],
    primary: "Mine-to-port flow map", secondary: "Port utilization & corridor capacity",
    columns: ["Shipment ID","Export date","Operator","Mine","Commodity","Quantity","Declared value","Port","Destination","Customs"],
    rows: [["SHP-260728-04","28 Jul 2026","Alpha Mining","North Ridge","Bauxite","214 kt","USD 12.8M","Conakry","China","Cleared"],["SHP-260726-11","26 Jul 2026","Guinea Ferrous","Simandou North","Iron ore","168 kt","USD 18.1M","Port A","UAE","Review"],["SHP-260725-08","25 Jul 2026","WAM","Forest Belt","Gold","18.4 koz","USD 43.2M","Conakry","Switzerland","Cleared"]],
    notice: "Reconciliation: Opening stock + production − domestic use − processing losses − closing stock = expected exports. Current material difference: 4.9 Mt.",
  },
  revenue: {
    title: "Pricing & Revenue Alignment",
    subtitle: "Comparison of production, exports, global benchmarks, expected government payments, and recorded receipts.",
    kicker: "FISCAL ALIGNMENT & COLLECTION", accent: "green",
    kpis: [["Recorded export value","USD 4.8B","Demo data"],["Benchmark value","USD 5.1B","Adjusted estimate"],["Recorded revenue","GNF 4.20T","91.6% collected"],["Expected revenue","GNF 4.58T","Current period"],["Collection rate","91.6%","↑ 2.1%"],["Outstanding","GNF 385B","12 obligations"],["Declared price","USD 61.4/t","Weighted avg."],["Benchmark variance","−5.9%","Review context"]],
    primary: "Benchmark vs. declared export price", secondary: "Revenue composition",
    columns: ["Company","Period","Payment type","Basis","Expected","Recorded","Difference","Due date","Status","Source"],
    rows: [["Alpha Mining","Q2 2026","Royalty","Export value","GNF 442B","GNF 421B","−21B","31 Jul","Partial","Finance"],["WAM","Q2 2026","Corporate tax","Tax return","GNF 188B","GNF 188B","—","15 Jul","Paid","Tax authority"],["Koba Resources","Q2 2026","License fee","Area","GNF 12B","—","−12B","30 Jun","Overdue","Cadastre"]],
    notice: "Benchmark differences may reflect grade, quality, moisture, processing, transport, contract terms, timing, and currency. A difference is not automatically evidence of misconduct.",
  },
  infrastructure: {
    title: "Infrastructure & Supply Chain Intelligence",
    subtitle: "Rail, road, port, energy, and logistics dependencies supporting mining operations.",
    kicker: "NATIONAL LOGISTICS DEPENDENCIES", accent: "amber",
    kpis: [["Active corridors","7","3 multimodal"],["Rail utilization","82%","Near threshold"],["Port utilization","76%","Conakry highest"],["Limited road access","8 mines","Seasonal risk"],["Energy dependency","11 mines","Single-source"],["Bottlenecks","6","2 critical"],["Planned projects","9","USD 2.1B"],["Critical alerts","4","Action required"]],
    primary: "Infrastructure dependency network", secondary: "Bottleneck analysis",
    columns: ["Asset","Type","Owner / operator","Capacity","Utilization","Condition","Connected mines","Commodity","Updated","Risk"],
    rows: [["North Rail","Railway","National Rail Agency","42 Mt/y","91%","Operational","7","Bauxite","27 Jul","High"],["Conakry Mineral Terminal","Port","Port Authority","36 Mt/y","84%","Operational","9","Mixed","28 Jul","Medium"],["Kankan Substation","Power","Energy Guinea","220 MW","78%","At risk","4","Gold","25 Jul","High"]],
    notice: "Single points of failure: North Rail segment 4, Kankan Substation, and the Forest Belt seasonal road crossing.",
  },
  environment: {
    title: "Environmental & Social Monitoring",
    subtitle: "Environmental permits, inspections, obligations, community impacts, and social commitments related to mining activity.",
    kicker: "PERMITS, IMPACTS & COMMITMENTS", accent: "green",
    kpis: [["Valid permits","39","82% coverage"],["Expiring soon","7","Within 90 days"],["Inspections overdue","11","4 high priority"],["Active violations","8","2 severe"],["Commitments overdue","19","Across 7 projects"],["Resettlement cases","6","312 households"],["Local employment","67%","Reported average"],["Data coverage","74%","3 agencies delayed"]],
    primary: "Environmental constraints & monitoring map", secondary: "Social commitments",
    columns: ["Project","Operator","Permit","Issue date","Expiry","Latest inspection","Water monitoring","Rehabilitation","Incidents","Status"],
    rows: [["North Ridge","Alpha Mining","ENV-2023-044","12 May 2023","11 May 2027","18 Jun 2026","Current","Approved","0","Compliant"],["Forest Belt","WAM","ENV-2021-018","08 Feb 2021","07 Aug 2026","Overdue","Delayed","Review","2","Action required"],["Fouta Central","Koba Resources","ENV-2025-071","24 Mar 2025","23 Mar 2028","02 Jul 2026","Current","Draft","0","Compliant"]],
    notice: "Environmental and social information may be incomplete or held by separate agencies. Coverage and source limitations are shown with every conclusion.",
  },
  alerts: {
    title: "Alerts & Risk Center",
    subtitle: "Cross-module identification, prioritization, assignment, and resolution of mining-sector risks.",
    kicker: "CROSS-MODULE RISK MANAGEMENT", accent: "red",
    kpis: [["Critical","12","3 new"],["High","28","8 action required"],["Medium","46","19 under review"],["Low","31","Monitoring"],["Informational","18","No action"],["Assigned","89%","120 / 135"],["Overdue actions","17","6 agencies"],["Resolved this month","42","↑ 18%"]],
    primary: "Risk distribution by module & region", secondary: "Alert category coverage",
    columns: ["Alert ID","Severity","Category","Record","Operator","Region","Detected","Rule","Agency","Officer","Due","Status"],
    rows: [["ALT-2607-104","Critical","Production & Export","GUI-MIN-014","Alpha Mining","Boké","28 Jul","Exports > production","Mines / Customs","M. Diallo","30 Jul","Action required"],["ALT-2607-098","High","License","GUI-EXP-001","WAM","Kankan","27 Jul","Expires ≤60 days","Cadastre","A. Camara","05 Aug","Under review"],["ALT-2607-087","High","Revenue","PAY-1442","Koba Resources","Labé","25 Jul","Expected payment missing","Finance","F. Sylla","01 Aug","Waiting for data"]],
  },
  quality: {
    title: "Data Quality, Validation & Source Registry",
    subtitle: "Visibility into data origin, completeness, consistency, validation, freshness, and limitations.",
    kicker: "NATIONAL DATA TRUST LAYER", accent: "blue",
    kpis: [["Expected sources","22","National register"],["Sources current","18","81.8%"],["Records validated","94.1%","↑ 1.7%"],["Validation errors","23","7 severe"],["Awaiting review","41","12 assigned"],["Average age","18 days","Target ≤30"],["Completeness","86%","National score"],["Traceability","92%","Source linked"]],
    primary: "12-step validation workflow", secondary: "Data quality score components",
    columns: ["Source","Agency","Data type","Method","Frequency","Last received","Next expected","Validation","Completeness","License","Access"],
    rows: [["Mining cadastre","Cadastre Office","Licenses","API","Daily","28 Jul","29 Jul","Validated","98%","Government","Restricted"],["Customs exports","Customs Authority","Shipments","Database","Daily","28 Jul","29 Jul","7 issues","91%","Government","Restricted"],["Geological survey","Geological Survey","GIS / samples","GIS files","Quarterly","31 Mar","30 Jun","Delayed","72%","Mixed","Restricted"],["Company submissions","Operators","Production","Excel / CSV","Monthly","25 Jul","31 Jul","Review","84%","Submission","Confidential"]],
    notice: "Visible limitations: missing and restricted data, outdated datasets, inconsistent classifications, uncertain coordinates, unverified ownership, and differences between agency records.",
  },
  reports: {
    title: "Reports & Export Center",
    subtitle: "Create management reports, evidence summaries, operational registers, and data appendices.",
    kicker: "AUTHORIZED REPORT GENERATION", accent: "blue",
    kpis: [["Templates","10","National catalogue"],["Generated this month","47","12 scheduled"],["Awaiting approval","6","Executive review"],["PDF exports","31","Most used"],["Data exports","22","CSV / Excel"],["Map exports","9","PNG / GeoJSON"],["Saved views","18","Across 9 users"],["Source appendices","84%","Included"]],
    primary: "Report template library", secondary: "Report configuration",
    columns: ["Template","Primary audience","Latest run","Owner","Sources","Limitations appendix","Formats","Status"],
    rows: [["National mining overview","Executive","28 Jul 2026","Policy Unit","18","Included","PDF · Excel","Ready"],["License expiry report","Cadastre","27 Jul 2026","Cadastre Office","4","Included","PDF · CSV","Ready"],["Exploration evidence summary","Geological analysts","25 Jul 2026","Geological Survey","7","Required","PDF · PNG","Ready"],["Data-quality report","System administrators","28 Jul 2026","Data Office","22","Included","PDF · Excel","Draft"]],
  },
  administration: {
    title: "Administration & System Architecture",
    subtitle: "Manage data sources, validation rules, classifications, user access, and audit logs.",
    kicker: "AUTHORIZED ADMINISTRATION", accent: "slate",
    kpis: [["Active users","124","7 role groups"],["Data connectors","22","18 current"],["Validation rules","64","5 changed"],["Classifications","17","National standards"],["Audit events","1,842","Last 30 days"],["Access reviews","9","Due this month"],["System health","99.8%","30-day uptime"],["Pending approvals","14","Admin queue"]],
    primary: "National visibility-layer architecture", secondary: "Access & governance controls",
    columns: ["Administrative area","Owner","Last change","Changed by","Pending items","Status"],
    rows: [["Data source connections","National Data Office","28 Jul 2026","System Admin","4","Operational"],["Validation rule library","Data Quality Team","27 Jul 2026","M. Diallo","5","Review"],["User roles & permissions","Security Office","24 Jul 2026","A. Camara","3","Controlled"],["Commodity classifications","Ministry of Mines","18 Jul 2026","Policy Admin","2","Published"]],
  },
};

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
          <div className="record-grid exploration-record">
            <span>Target ID<b>CM-07</b></span><span>Region<b>Nzérékoré</b></span>
            <span>Commodities<b>Nickel · Cobalt</b></span><span>Stage<b>Early exploration</b></span>
            <span>Last update<b>18 July 2026</b></span><span>Data coverage<b>58%</b></span>
          </div>
          <section><h4>Interpretation</h4><p>This area contains geological indicators that may justify additional exploration.</p></section>
          <section><h4>Geological setting</h4><p>Mapped ultramafic lithology intersected by a regional shear-zone corridor.</p></section>
          <section><h4>Supporting evidence</h4><ul><li>Known historic nickel occurrence</li><li>Nickel-cobalt stream-sediment anomaly</li><li>Regional magnetic anomaly</li><li>Remote-sensing alteration indicator</li></ul></section>
          <section><h4>Drill evidence</h4><p><b>Missing.</b> No validated drill-hole, core-log, assay interval, grade, or mineralized-thickness records.</p></section>
          <section><h4>Sources & related records</h4><p>National Geological Survey · Regional Geochemistry Survey · Satellite Alteration Index. Related license: GUI-EXP-071. North Rail: 46 km; grid substation: 73 km.</p></section>
          <section><h4>Environmental & land constraints</h4><p>Partial community-use overlap and elevated watershed sensitivity in the target’s south-east area.</p></section>
          <section><h4>Limitations & missing evidence</h4><p>No modern drilling data. Geochemical coverage is incomplete and was last collected in 2019. Analytical metadata are unavailable for 11% of samples.</p></section>
          <section><h4>Recommended next investigation</h4><p><b>Targeted geophysical survey</b>, followed by field verification, surface sampling, and data verification before any drill decision.</p></section>
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

function OverviewRiskMap() {
  const [zoom, setZoom] = useState(1);
  const [layers, setLayers] = useState<Record<OverviewLayer, boolean>>({
    mines: true,
    farms: true,
    rivers: true,
    pollution: true,
    alerts: true,
  });
  const [hoveredFeature, setHoveredFeature] = useState<OverviewMapFeature | null>(null);
  const activeLayerCount = Object.values(layers).filter(Boolean).length;
  const alertPositions = [{ x: 31, y: 30 }, { x: 74, y: 51 }, { x: 70, y: 70 }];

  const toggleLayer = (layer: OverviewLayer) => {
    setLayers(current => ({ ...current, [layer]: !current[layer] }));
  };

  const setAllLayers = (visible: boolean) => {
    setLayers({ mines: visible, farms: visible, rivers: visible, pollution: visible, alerts: visible });
  };

  const changeZoom = (amount: number) => {
    setZoom(current => Math.min(2, Math.max(0.8, Number((current + amount).toFixed(1)))));
  };

  const focusFeature = (feature: OverviewMapFeature) => setHoveredFeature(feature);
  const clearFeature = () => setHoveredFeature(null);

  return (
    <div className="overview-risk-map">
      <div className="overview-layer-controls" aria-label="Map layer filters">
        <div className="layer-filter-title"><b>FILTER MAP</b><span>{activeLayerCount} of 5 layers visible</span></div>
        <div className="layer-filter-options">
          {overviewLayerOptions.map(option => (
            <button
              key={option.id}
              className={`overview-layer-toggle layer-${option.id} ${layers[option.id] ? "active" : ""}`}
              aria-pressed={layers[option.id]}
              onClick={() => toggleLayer(option.id)}
            >
              <i /> {option.label} <b>{option.count}</b>
            </button>
          ))}
        </div>
        <div className="layer-filter-actions"><button onClick={() => setAllLayers(true)}>Show all</button><button onClick={() => setAllLayers(false)}>Clear</button></div>
      </div>

      <div className="overview-map-stage">
        <div className="overview-zoom-tools" aria-label="Map zoom controls">
          <button onClick={() => changeZoom(0.2)} disabled={zoom >= 2} aria-label="Zoom in">＋</button>
          <button onClick={() => changeZoom(-0.2)} disabled={zoom <= 0.8} aria-label="Zoom out">−</button>
          <button onClick={() => setZoom(1)} aria-label="Reset zoom">⌂</button>
          <span>{Math.round(zoom * 100)}%</span>
        </div>
        <div className="overview-demo-badge"><i /> DEMONSTRATION MAP</div>

        <div className="overview-map-canvas" style={{ transform: `scale(${zoom})` }}>
          <div className="overview-country-mass" />
          <div className="overview-terrain terrain-1" /><div className="overview-terrain terrain-2" /><div className="overview-terrain terrain-3" />
          <div className="overview-region-boundary boundary-1" /><div className="overview-region-boundary boundary-2" /><div className="overview-region-boundary boundary-3" />
          <span className="overview-region-label region-boke">BOKÉ</span><span className="overview-region-label region-labe">LABÉ</span>
          <span className="overview-region-label region-kindia">KINDIA</span><span className="overview-region-label region-kankan">KANKAN</span>
          <span className="overview-region-label region-nzerekore">NZÉRÉKORÉ</span>

          {layers.rivers && overviewMapData.rivers.map(feature => (
            <button
              key={feature.id}
              className="overview-river-feature"
              style={{ left: `${feature.x}%`, top: `${feature.y}%`, width: `${feature.width}%`, transform: `rotate(${feature.angle}deg)` }}
              onMouseEnter={() => focusFeature(feature)} onMouseLeave={clearFeature}
              onFocus={() => focusFeature(feature)} onBlur={clearFeature}
              aria-label={`${feature.name}, ${feature.coordinates}`}
            >
              <i />
              <span className="overview-feature-tooltip" style={{ transform: `translate(-50%, -100%) rotate(${-(feature.angle || 0)}deg)` }}>
                <b>{feature.name}</b><small>{feature.type}</small><em>{feature.coordinates}</em>
              </span>
            </button>
          ))}

          {layers.farms && overviewMapData.farms.map(feature => (
            <button
              key={feature.id}
              className={`overview-farm-feature ${feature.size || "medium"}`}
              style={{ left: `${feature.x}%`, top: `${feature.y}%` }}
              onMouseEnter={() => focusFeature(feature)} onMouseLeave={clearFeature}
              onFocus={() => focusFeature(feature)} onBlur={clearFeature}
              aria-label={`${feature.name}, ${feature.coordinates}`}
            >
              <i />
              <span className="overview-feature-tooltip"><b>{feature.name}</b><small>{feature.type}</small><em>{feature.coordinates}</em></span>
            </button>
          ))}

          {layers.pollution && overviewMapData.pollution.map(feature => (
            <button
              key={feature.id}
              className={`overview-pollution-feature ${feature.size || "medium"}`}
              style={{ left: `${feature.x}%`, top: `${feature.y}%` }}
              onMouseEnter={() => focusFeature(feature)} onMouseLeave={clearFeature}
              onFocus={() => focusFeature(feature)} onBlur={clearFeature}
              aria-label={`${feature.name}, ${feature.coordinates}`}
            >
              <i />
              <span className="overview-feature-tooltip"><b>{feature.name}</b><small>{feature.type}</small><em>{feature.coordinates}</em></span>
            </button>
          ))}

          {layers.mines && overviewMapData.mines.map(feature => (
            <button
              key={feature.id}
              className="overview-mine-feature"
              style={{ left: `${feature.x}%`, top: `${feature.y}%` }}
              onMouseEnter={() => focusFeature(feature)} onMouseLeave={clearFeature}
              onFocus={() => focusFeature(feature)} onBlur={clearFeature}
              aria-label={`${feature.name}, ${feature.coordinates}`}
            >
              <i>◆</i>
              <span className="overview-feature-tooltip"><b>{feature.name}</b><small>{feature.type}</small><em>{feature.coordinates}</em></span>
            </button>
          ))}

          {layers.alerts && overviewEnvironmentalAlerts.map((alert, index) => {
            const feature: OverviewMapFeature = { id: alert.id, name: alert.title, type: `${alert.level} alert`, detail: `Potentially affected: ${alert.affected}`, coordinates: alert.coordinates, ...alertPositions[index] };
            return (
              <button
                key={alert.id}
                className={`overview-alert-marker alert-${alert.color}`}
                style={{ left: `${alertPositions[index].x}%`, top: `${alertPositions[index].y}%` }}
                onMouseEnter={() => focusFeature(feature)} onMouseLeave={clearFeature}
                onFocus={() => focusFeature(feature)} onBlur={clearFeature}
                aria-label={`${alert.level} alert: ${alert.title}`}
              >
                !
                <span className="overview-feature-tooltip"><b>{alert.title}</b><small>{alert.affected}</small><em>{alert.coordinates}</em></span>
              </button>
            );
          })}
        </div>

        <div className="overview-map-legend">
          <span><i className="legend-mine" /> Mine</span><span><i className="legend-farm" /> Farmland</span><span><i className="legend-river" /> River</span><span><i className="legend-pollution" /> Potential pollution</span><span><i className="legend-alert" /> Alert</span>
        </div>
        <div className="overview-map-scale">0&nbsp;&nbsp;&nbsp;50&nbsp;&nbsp;&nbsp;100 km</div>
      </div>

      <div className="overview-map-readout" aria-live="polite">
        <span className={`readout-icon ${hoveredFeature ? "active" : ""}`}>⌖</span>
        {hoveredFeature ? (
          <><div><b>{hoveredFeature.name}</b><small>{hoveredFeature.detail}</small></div><strong>{hoveredFeature.coordinates}</strong></>
        ) : (
          <><div><b>Hover over a map feature</b><small>Names, feature details, and coordinates appear here automatically.</small></div><strong>Demo coordinates</strong></>
        )}
      </div>
    </div>
  );
}

function Overview() {
  return (
    <>
      <header className="page-heading">
        <div><div className="breadcrumb">NATIONAL OVERVIEW <span>/</span> EXECUTIVE VIEW</div><h1>National Mining Overview</h1><p>Integrated national visibility across mining activity, critical minerals, infrastructure, revenue, and compliance.</p></div>
        <div className="heading-actions"><button className="select-btn">All regions⌄</button><button className="select-btn">All commodities⌄</button><button className="primary">⇩ Export report</button></div>
      </header>
      <div className="kpi-grid">
        {kpis.map(k => <article className="kpi-card" key={k.label}><div className="kpi-top"><AppIcon>{k.icon}</AppIcon><Sparkline tone={k.tone} /></div><p>{k.label}</p><div className="kpi-value">{k.value}</div><small className={k.tone}>{k.delta}</small></article>)}
      </div>
      <section className="overview-intelligence-grid">
        <article className="panel overview-map-panel">
          <div className="panel-head"><div><span className="section-kicker">NATIONAL ENVIRONMENTAL INTELLIGENCE</span><h3>Mining, farmland, rivers & potential pollution</h3></div><div className="panel-actions"><button>Live layers <b>5</b></button><button aria-label="Open map options">•••</button></div></div>
          <OverviewRiskMap />
        </article>
        <div className="overview-side-stack">
          <article className="panel overview-environment-alerts">
            <div className="panel-head"><div><span className="section-kicker red">ENVIRONMENTAL EXPOSURE</span><h3>Potential contamination alerts</h3></div><button className="text-btn">3 active</button></div>
            <div className="overview-alert-summary"><b>1</b><span>critical scenario</span><i /><b>2</b><span>areas require sampling</span></div>
            {overviewEnvironmentalAlerts.map(alert => (
              <button className="overview-environment-alert" key={alert.id}>
                <i className={alert.color}>{alert.level === "Critical" ? "!" : "△"}</i>
                <span><b>{alert.title}</b><small><strong>Potentially affected:</strong> {alert.affected}</small><small><strong>Coordinates:</strong> {alert.coordinates}</small><em>{alert.cause}</em></span>
                <time>{alert.age}</time>
              </button>
            ))}
            <p className="overview-alert-disclaimer"><b>i</b> Illustrative alerts only. They are not real environmental findings and require field sampling before any conclusion.</p>
          </article>
          <article className="panel commodity-panel">
            <div className="panel-head"><div><span className="section-kicker">PRODUCTION</span><h3>By commodity</h3></div><button className="text-btn">Volume⌄</button></div>
            {[["Bauxite", 74, "48.7 Mt"], ["Iron ore", 39, "10.6 Mt"], ["Gold", 24, "7.2 Mt"], ["Diamond", 12, "1.4 Mt"], ["Other", 7, "0.5 Mt"]].map(([n,w,v],i)=><div className="bar-row" key={n}><span>{n}</span><div><i style={{width:`${w}%`}} className={`bar b${i}`}/></div><b>{v}</b></div>)}
            <div className="commodity-foot"><span><i/> Production volume</span><button>View intelligence →</button></div>
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
  const [activeTab,setActiveTab] = useState<"ranking"|"matrix"|"metadata">("ranking");
  const commodities = ["Bauxite","Iron ore","Gold","Lithium","Nickel","Cobalt","Copper","Graphite","Rare earth elements","Vanadium","Tungsten","Manganese","Other critical minerals"];
  const layerGroups: Array<[string, string[]]> = [
    ["Geological Context",["Bedrock geology","Surficial geology","Lithological units","Faults","Folds","Shear zones","Intrusions","Volcanic belts","Sedimentary basins","Metamorphic belts","Alteration zones","Tectonic structures"]],
    ["Mineral & Element Evidence",["Known mineral occurrences","Historic mines","Historic prospects","Outcrop samples","Rock geochemistry","Soil geochemistry","Stream-sediment geochemistry","Water chemistry","Mineralogical observations","Commodity concentrations"]],
    ["Geophysics & Remote Sensing",["Magnetic anomalies","Gravity anomalies","Radiometric surveys","Electromagnetic surveys","Remote-sensing anomalies","Satellite alteration indicators"]],
    ["Subsurface Evidence",["Drill-hole locations","Core-log availability","Assay intervals","Drill intercepts","Estimated grade","Mineralized thickness","Resource-stage projects"]],
    ["Constraints & Access",["Roads","Rail","Ports","Energy infrastructure","License areas","Land status","Protected areas","Communities","Water access","Environmental sensitivity"]],
  ];
  const matrix = [
    ["Fouta Central","Strong","Moderate","Strong","Moderate","Weak","Strong","Missing","82%","2025","Strong"],
    ["Kankan East","Strong","Strong","Strong","Moderate","Moderate","Moderate","Missing","76%","2024","Strong"],
    ["Forest Belt CM-07","Strong","Moderate","Moderate","Strong","Moderate","Missing","Missing","58%","2019","Moderate"],
    ["Beyla Ridge","Moderate","Weak","Moderate","Weak","Strong","Missing","Missing","63%","2021","Moderate"],
  ];
  return (
    <>
      <header className="page-heading exploration-heading"><div><div className="breadcrumb purple-text">EXPLORATION INTELLIGENCE <span>/</span> NATIONAL VIEW</div><h1>Critical Minerals Exploration Intelligence</h1><p>Geological context, mineral evidence, exploration maturity, data confidence, and source transparency.</p></div><div className="heading-actions"><button className="select-btn">Save view</button><button className="primary purple-bg">⇩ Export Evidence Summary</button></div></header>
      <div className="disclaimer"><b>i</b><span><strong>Exploration interpretation notice</strong> Exploration indicators represent evidence for further investigation and do not confirm the existence of an economically viable mineral deposit.</span><button>View methodology</button></div>
      <div className="commodity-strip"><b>Commodity focus</b><div>{commodities.map((x,i)=><button className={i===3||i===4||i===5?"selected":""} key={x}>{x}{i===3||i===4||i===5?" ✓":""}</button>)}</div></div>
      <section className="exploration-grid expanded">
        <aside className="panel filter-panel">
          <div className="panel-head"><div><span className="section-kicker purple-text">ANALYSIS CONTROLS</span><h3>Evidence filters</h3></div><button>Reset</button></div>
          {[["Region","All regions"],["Evidence type","All evidence types"],["Data source","All source agencies"],["Confidence","Moderate or higher"],["Data age","Any age"],["Infrastructure access","Within 100 km"]].map(x=><label className="compact-field" key={x[0]}>{x[0]}<button className="field">{x[1]} <span>⌄</span></button></label>)}
          <label>Evidence level</label>{["Level 4 — Appraised or resource stage","Level 3 — Drill supported","Level 2 — Surface supported","Level 1 — Speculative"].map((x,i)=><label className="check" key={x}><input type="checkbox" defaultChecked={i<3}/><i className={`ev e${4-i}`}/>{x}</label>)}
          <button className="primary full purple-bg">Apply filters</button>
        </aside>
        <article className="panel exploration-map-panel">
          <div className="panel-head"><div><span className="section-kicker purple-text">65–75% MAP WORKSPACE</span><h3>National multi-layer evidence map</h3></div><div className="panel-actions"><button>Basemap⌄</button><button>Opacity 72%</button></div></div>
          <MapVisual exploration onSelect={onOpen}/>
          <div className="map-footer"><span>Visible: Bedrock geology · Known occurrences · Geochemistry · Drill holes · Exploration targets</span><button>□ Full screen</button><button>↗ Export map</button></div>
        </article>
        <aside className="panel layer-panel">
          <div className="panel-head"><div><span className="section-kicker purple-text">MAP CONTROL</span><h3>Evidence layers</h3></div><b>18 on</b></div>
          <div className="layer-scroll">{layerGroups.map((g,gi)=><details key={g[0]} open={gi<2}><summary><span>{g[0]}</span><b>{gi===0?"6":gi===1?"5":"0"} on</b></summary><div>{g[1].map((x,i)=><label key={x}><input type="checkbox" defaultChecked={gi<2&&i<6}/><span>{x}</span>{(i===0||i===2)&&<small>ⓘ</small>}</label>)}</div></details>)}</div>
        </aside>
      </section>
      <section className="exploration-summary-grid">
        <article className="panel target-summary"><div className="panel-head"><div><span className="section-kicker purple-text">SELECTED TARGET</span><h3>Forest Belt CM-07</h3></div><button onClick={()=>onOpen("Forest Belt CM-07")}>Full details →</button></div><div className="target-facts"><span>Target ID<b>CM-07</b></span><span>Region<b>Nzérékoré</b></span><span>Commodities<b>Nickel · Cobalt</b></span><span>Stage<b>Early exploration</b></span><span>Evidence level<b>Level 2 — Surface supported</b></span><span>Overall confidence<b>Moderate</b></span></div><div className="responsible-copy"><b>Interpretation</b><p>This area contains geological indicators that may justify additional exploration.</p><b>Supporting evidence</b><p>Mapped ultramafic lithology, stream-sediment anomalies, a historic occurrence, and a regional magnetic anomaly.</p><b>Limitations</b><p>No modern drill records; geochemical coverage is incomplete and last updated in 2019.</p></div></article>
        <article className="panel structured-summary"><div className="panel-head"><div><span className="section-kicker purple-text">AUTOMATED STRUCTURED SUMMARY</span><h3>Five-part evidence summary</h3></div><button>PDF⌄</button></div>{[["1","Geological favorability","Ultramafic units and regional structures are mapped within the target."],["2","Mineral or elemental evidence","Moderate Ni–Co surface anomaly and one historic occurrence."],["3","Subsurface evidence","No validated drill or assay interval records available."],["4","Infrastructure and access","Road access within 24 km; grid connection within 73 km."],["5","Uncertainty and data gaps","Modern drilling, analytical metadata, and field verification are missing."]].map(x=><div key={x[0]}><i>{x[0]}</i><span><b>{x[1]}</b><p>{x[2]}</p></span></div>)}</article>
        <article className="panel evidence-panel"><div className="panel-head"><div><span className="section-kicker purple-text">EVIDENCE SCORES</span><h3>Transparent components</h3></div></div><div className="evidence-level"><span>LEVEL 2</span><b>Surface supported</b><small>Not a discovery probability</small></div>{[["Geological favorability",78],["Mineral evidence",64],["Subsurface evidence",18],["Infrastructure access",71],["Metadata completeness",58]].map(([n,v])=><div className="evidence-score" key={n}><span>{n}<b>{v}%</b></span><i><em style={{width:`${v}%`}}/></i></div>)}</article>
      </section>
      <div className="exploration-tabs"><button className={activeTab==="ranking"?"active":""} onClick={()=>setActiveTab("ranking")}>Areas Requiring Further Evaluation</button><button className={activeTab==="matrix"?"active":""} onClick={()=>setActiveTab("matrix")}>Evidence Matrix</button><button className={activeTab==="metadata"?"active":""} onClick={()=>setActiveTab("metadata")}>Data Sources & Metadata</button></div>
      {activeTab==="ranking"&&<article className="panel table-panel exploration-table"><div className="panel-head"><div><span className="section-kicker purple-text">RANKED REVIEW QUEUE</span><h3>Areas Requiring Further Evaluation</h3></div><button className="text-btn">Scoring method: evidence 45% · confidence 25% · access 15% · constraints 15% ⓘ</button></div><div className="table-scroll"><table><thead><tr><th>Rank</th><th>Area</th><th>Commodity</th><th>Evidence level</th><th>Geological favorability</th><th>Surface evidence</th><th>Drill evidence</th><th>Data confidence</th><th>Infrastructure access</th><th>Environmental constraint</th><th>Recommended action</th></tr></thead><tbody>{targets.map((t,i)=><tr key={t[0]} onClick={()=>onOpen(t[1])}><td><b className="rank">{t[0]}</b></td><td><b>{t[1]}</b></td><td>{t[2]}</td><td><span className="purple-chip">{t[3]}</span></td><td>{["Strong","Strong","Strong","Moderate"][i]}</td><td>{["Moderate","Strong","Moderate","Weak"][i]}</td><td>{["Strong","Moderate","Missing","Missing"][i]}</td><td>{t[4]}</td><td>{["Good","Good","Moderate","Limited"][i]}</td><td>{["Low","Medium","High","Medium"][i]}</td><td><b>{t[5]}</b></td></tr>)}</tbody></table></div><p className="table-note">Ranking supports review prioritization and is not an objective probability of discovery.</p></article>}
      {activeTab==="matrix"&&<article className="panel table-panel exploration-table"><div className="panel-head"><div><span className="section-kicker purple-text">COMPARATIVE EVIDENCE</span><h3>Exploration target evidence matrix</h3></div><div className="matrix-legend"><span>● Strong</span><span>● Moderate</span><span>● Weak</span><span>○ Missing</span><span>⊘ Restricted</span></div></div><div className="table-scroll"><table><thead><tr>{["Target","Geological context","Known occurrence","Surface geochemistry","Geophysics","Remote sensing","Drilling","Resource appraisal","Metadata completeness","Data recency","Overall confidence"].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{matrix.map(r=><tr key={r[0]}>{r.map((x,i)=><td key={i} className={["Strong","Moderate","Weak","Missing","Restricted"].includes(x)?`matrix-${x.toLowerCase()}`:""}>{i===0?<b>{x}</b>:x}</td>)}</tr>)}</tbody></table></div></article>}
      {activeTab==="metadata"&&<article className="panel metadata-panel"><div className="panel-head"><div><span className="section-kicker purple-text">SOURCE TRANSPARENCY</span><h3>Selected layer metadata — Stream-sediment geochemistry</h3></div><span className="status active">Validated</span></div><div className="metadata-grid">{[["Source agency","National Geological Survey"],["Dataset name","Guinea Regional Stream Sediment Survey"],["Publication date","14 June 2020"],["Collection date","2017–2019"],["Analytical method","ICP-MS multi-element assay"],["Coordinate system","WGS 84 / UTM Zone 28N"],["Spatial precision","±25 metres"],["Detection limit","Ni 0.2 ppm · Co 0.1 ppm"],["Data license","Government analytical use"],["Access status","Restricted — aggregated display"],["Validation status","Validated with 3 exceptions"],["Confidence level","Moderate"],["Source reference","NGS-GEO-2020-SS-14"],["Known limitations","Incomplete eastern coverage; inconsistent legacy sample spacing"]].map(x=><span key={x[0]}><small>{x[0]}</small><b>{x[1]}</b></span>)}</div><div className="limitations"><b>Visible data gap</b><p>Coverage ends 18 km east of target CM-07. Conclusions for that area rely on regional interpolation and require field verification.</p></div></article>}
      <section className="evidence-classes">{[["1","Speculative","Broad favorable setting; limited regional indicators; no confirmed surface or subsurface evidence."],["2","Surface Supported","Geochemical anomaly, mineralized outcrop, historic occurrence, or remote/geophysical indication."],["3","Drill Supported","Drill records, repeated mineralized intervals, core or assay evidence, and indication of continuity."],["4","Appraised or Resource Stage","Geological model, resource estimate, advanced assessment, and repeated project-level drilling."]].map(x=><article className={`level-card level-${x[0]}`} key={x[0]}><span>LEVEL {x[0]}</span><b>{x[1]}</b><p>{x[2]}</p></article>)}</section>
    </>
  );
}

function Licenses({ onOpen }: { onOpen: (name: string) => void }) {
  const stats = [["Active","146","green"],["Pending","19","blue"],["Expiring ≤90d","11","amber"],["Expired","27","gray"],["Suspended","6","red"],["Reports overdue","32","amber"]];
  return <><header className="page-heading"><div><div className="breadcrumb">LICENSES & OPERATORS <span>/</span> NATIONAL REGISTER</div><h1>License & Operator Intelligence</h1><p>National visibility into mining rights, operators, locations, validity, reporting status, and compliance.</p></div><div className="heading-actions"><button className="select-btn">＋ New record</button><button className="primary">⇩ Export register</button></div></header><div className="license-stats">{stats.map(s=><article className="panel" key={s[0]}><i className={s[2]}/><span>{s[0]}</span><b>{s[1]}</b></article>)}</div><section className="license-main"><article className="panel mini-license-map"><div className="panel-head"><div><span className="section-kicker">SPATIAL REGISTER</span><h3>License areas</h3></div><button>☷ Layers</button></div><MapVisual onSelect={onOpen}/></article><article className="panel expiry"><div className="panel-head"><div><span className="section-kicker amber">RENEWAL WORKFLOW</span><h3>Upcoming expiries</h3></div></div>{[["Aug","3","GUI-EXP-001"],["Sep","5","GUI-MIN-014"],["Oct","2","GUI-REC-087"],["Nov","1","GUI-EXP-103"]].map(x=><button onClick={()=>onOpen(x[2])} key={x[0]}><time>{x[0]}<b>{x[1]}</b></time><span>{x[2]}<small>Review required</small></span><b>→</b></button>)}</article></section><article className="panel table-panel license-table"><div className="panel-head"><div><span className="section-kicker">NATIONAL REGISTER</span><h3>License records <small>208 total</small></h3></div><div className="table-tools"><input placeholder="⌕ Search license or operator"/><button>☷ Filters <b>2</b></button></div></div><table><thead><tr><th>License ID</th><th>Name / Operator</th><th>Commodity</th><th>Region</th><th>Status</th><th>Compliance</th><th></th></tr></thead><tbody>{licenses.map(l=><tr key={l[0]} onClick={()=>onOpen(l[1])}><td><b className="id">{l[0]}</b></td><td><b>{l[1]}</b><small>{l[2]}</small></td><td>{l[3]}</td><td>{l[4]}</td><td><span className={`status ${l[5].toLowerCase()}`}>{l[5]}</span></td><td><span className="score-pill">{l[6]}</span></td><td><button>→</button></td></tr>)}</tbody></table></article></>;
}

function RelationshipNetwork({ kind }: { kind: PageKey }) {
  const labels = kind === "ownership"
    ? ["Parent company","Beneficial owner","Alpha Mining Guinea","GUI-MIN-014","North Ridge Mine","Government contract"]
    : kind === "infrastructure"
      ? ["North Rail","Conakry Port","North Ridge","Power Substation","Forest Belt","Seasonal Road"]
      : ["Mine","Production","Export","Declared price","Expected royalty","Recorded payment"];
  return <div className={`relationship-network ${kind}`}>
    <i className="net-line nl1"/><i className="net-line nl2"/><i className="net-line nl3"/><i className="net-line nl4"/><i className="net-line nl5"/>
    {labels.map((label,i)=><button key={label} className={`net-node nn${i+1}`}><span>{i===2?"◎":i===3?"▤":"◇"}</span><b>{label}</b><small>{i===2?"Selected record":i===3?"Linked record":"Verified link"}</small></button>)}
  </div>;
}

function MetricVisual({ page }: { page: PageKey }) {
  if (page === "ownership" || page === "infrastructure" || page === "revenue") return <RelationshipNetwork kind={page}/>;
  if (page === "export" || page === "environment") return <MapVisual onSelect={()=>{}}/>;
  if (page === "quality") return <div className="workflow">{["Data submitted","File & format check","Required fields","Unit & date standardization","Coordinate validation","Duplicate detection","Entity matching","Cross-source comparison","Human review","Approval","Central database","Dashboard publication"].map((x,i)=><div key={x}><b>{String(i+1).padStart(2,"0")}</b><span>{x}</span>{i<11&&<i>→</i>}</div>)}</div>;
  if (page === "reports") return <div className="template-grid">{["National mining overview","License expiry","Operator compliance","Production report","Production–export reconciliation","Revenue collection","Infrastructure dependency","Exploration evidence summary","Data-quality report","Critical alert report"].map((x,i)=><button key={x}><i>{["▦","▤","◎","▥","↗","₣","⌁","⌖","◫","△"][i]}</i><b>{x}</b><small>PDF · Excel · CSV</small><span>Generate →</span></button>)}</div>;
  if (page === "administration") return <div className="architecture-flow">{[["DATA INPUT","Government databases · APIs · spreadsheets · GIS · company reports"],["VALIDATE & INTEGRATE","Schema mapping · unit standardization · entity matching · human approval"],["CENTRAL DATABASE","Companies · licenses · mines · production · exports · payments · evidence"],["ANALYTICS","KPIs · reconciliation · alerts · forecasting · evidence ranking"],["PRESENTATION","Maps · charts · records · reports · executive summaries"]].map((x,i)=><div key={x[0]}><b>{x[0]}</b><span>{x[1]}</span>{i<4&&<i>→</i>}</div>)}</div>;
  if (page === "alerts") return <div className="risk-categories">{["License risks","Reporting risks","Production & export risks","Revenue risks","Infrastructure risks","Environmental & social risks","Exploration & data risks"].map((x,i)=><button key={x}><i className={i<2?"red":i<5?"amber":"purple"}>{i<2?"!":"△"}</i><span><b>{x}</b><small>{[17,24,19,12,9,14,21][i]} active alerts</small></span><em style={{width:`${[62,78,66,49,37,52,71][i]}%`}}/></button>)}</div>;
  return <div className="generic-chart"><div className="chart-legend"><span><i/>Actual</span><span><i/>Planned</span><span><i/>Previous year</span></div>{[62,48,71,56,82,68,89,74,91,79,86,96].map((v,i)=><div key={i}><i style={{height:`${v}%`}}/><i style={{height:`${Math.max(v-8,30)}%`}}/><i style={{height:`${Math.max(v-15,24)}%`}}/><span>{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i]}</span></div>)}</div>;
}

function SecondaryVisual({ page, spec }: { page: PageKey; spec: typeof moduleSpecs[keyof typeof moduleSpecs] }) {
  if (page === "ownership") return <div className="checklist">{["Legal entity identified","Registration number verified","Direct shareholders disclosed","Ownership percentages disclosed","Ultimate beneficial owner identified","Nationality provided","Control mechanism described","Last verification available","Supporting document available"].map((x,i)=><span key={x}><i className={i===4||i===8?"pending":"done"}>{i===4||i===8?"!":"✓"}</i>{x}</span>)}</div>;
  if (page === "reports") return <div className="report-config">{["Reporting period","Commodities","Regions","Agency logo","Notes","Data-source appendix","Limitations","Output format"].map((x,i)=><label key={x}>{x}<button>{i===5||i===6?"Included":i===7?"PDF":i===0?"Current year":"All"}⌄</button></label>)}<button className="primary full">Generate report</button></div>;
  if (page === "administration") return <div className="governance-list">{["Executive Viewer","Ministry Analyst","Cadastre Officer","Geological Analyst","Compliance Inspector","Finance Officer","System Administrator"].map((x,i)=><span key={x}><i>{i+1}</i><b>{x}</b><small>{[18,31,12,14,21,16,12][i]} users</small><button>Review access</button></span>)}</div>;
  const bars = spec.kpis.slice(0,6);
  return <div className="component-bars">{bars.map((x,i)=><div key={x[0]}><span>{x[0]}<b>{x[1]}</b></span><i><em style={{width:`${[82,68,91,55,76,63][i]}%`}}/></i><small>{x[2]}</small></div>)}</div>;
}

function GenericModule({ page, onOpen }: { page: Exclude<PageKey,"overview"|"exploration"|"licenses">; onOpen: (name:string)=>void }) {
  const spec = moduleSpecs[page];
  return <>
    <header className="page-heading"><div><div className={`breadcrumb ${spec.accent}`}>{spec.kicker} <span>/</span> NATIONAL VIEW</div><h1>{spec.title}</h1><p>{spec.subtitle}</p></div><div className="heading-actions"><button className="select-btn">Current year⌄</button><button className="select-btn">All regions⌄</button><button className="primary">⇩ Export view</button></div></header>
    <div className="module-kpis">{spec.kpis.map((x,i)=><article className="panel" key={x[0]}><span>{x[0]}</span><b>{x[1]}</b><small className={i===3||i===6?"amber":spec.accent}>{x[2]}</small></article>)}</div>
    <section className="module-main">
      <article className="panel"><div className="panel-head"><div><span className={`section-kicker ${spec.accent}`}>{spec.kicker}</span><h3>{spec.primary}</h3></div><div className="panel-actions"><button>Compare</button><button>☷ Filters</button></div></div><MetricVisual page={page}/></article>
      <article className="panel"><div className="panel-head"><div><span className="section-kicker">ANALYSIS</span><h3>{spec.secondary}</h3></div><button>Details →</button></div><SecondaryVisual page={page} spec={spec}/></article>
    </section>
    {spec.notice&&<div className={`module-notice ${page==="alerts"?"red-note":""}`}><b>i</b><span>{spec.notice}</span></div>}
    <article className="panel table-panel module-table"><div className="panel-head"><div><span className={`section-kicker ${spec.accent}`}>SOURCE RECORDS</span><h3>{page==="reports"?"Report templates":page==="quality"?"National data source registry":page==="alerts"?"Active alert register":"National record register"}</h3></div><div className="table-tools"><input placeholder="⌕ Search records"/><button>☷ Filters <b>3</b></button></div></div><div className="table-scroll"><table><thead><tr>{spec.columns.map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{spec.rows.map((r,i)=><tr key={i} onClick={()=>onOpen(r[0])}>{r.map((c,j)=><td key={j}>{j===0?<b>{c}</b>:c}</td>)}</tr>)}</tbody></table></div></article>
  </>;
}

export default function Home() {
  const [page, setPage] = useState<PageKey>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const pageTitle = useMemo(() => navigation.find(n => n[0] === page)?.[2], [page]);
  function navigate(key: string) { setPage(key as PageKey); setSelected(""); window.scrollTo({top:0,behavior:"smooth"}); }
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
        {page==="overview" && <Overview />}
        {page==="exploration" && <Exploration onOpen={setSelected}/>}
        {page==="licenses" && <Licenses onOpen={setSelected}/>}
        {!["overview","exploration","licenses"].includes(page) && <GenericModule page={page as Exclude<PageKey,"overview"|"exploration"|"licenses">} onOpen={setSelected}/>}
      </main>
      {selected && <><button className="drawer-backdrop" onClick={()=>setSelected("")} aria-label="Close detail panel"/><DetailDrawer name={selected} onClose={()=>setSelected("")} exploration={page==="exploration"}/></>}
      {query && <div className="search-results">Searching national records for “{query}”</div>}
      <button className="floating-search" onClick={()=>{const q=prompt("Search licenses, operators, mines, targets or regions"); if(q){setQuery(q); setTimeout(()=>setQuery(""),2200)}}}>⌕</button>
    </div>
  );
}
