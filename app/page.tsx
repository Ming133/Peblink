"use client";

import { useEffect, useMemo, useState } from "react";

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

type EvidenceStrength = "Strong" | "Moderate" | "Weak" | "Missing" | "Restricted";

type ExplorationTargetRecord = {
  id: string;
  name: string;
  region: string;
  coordinates: string;
  commodities: string[];
  stage: string;
  evidenceLevel: 1 | 2 | 3 | 4;
  evidenceLabel: string;
  confidence: "Low" | "Moderate" | "High";
  x: number;
  y: number;
  dataYear: number;
  evidenceTypes: string[];
  sourceIds: string[];
  access: "Good" | "Moderate" | "Limited";
  geologicalSetting: string;
  knownOccurrences: string;
  surfaceEvidence: string;
  geophysicalEvidence: string;
  drillEvidence: string;
  coverage: string;
  lastUpdate: string;
  missingEvidence: string;
  limitations: string;
  recommendation: string;
  relatedLicenses: string;
  infrastructure: string;
  environmentalConstraint: string;
  favorability: EvidenceStrength;
  validation: string;
  scores: [string, number][];
  matrix: EvidenceStrength[];
};

type ExplorationSourceRecord = {
  id: string;
  agency: string;
  name: string;
  publication: string;
  collection: string;
  method: string;
  coordinateSystem: string;
  precision: string;
  detectionLimit: string;
  license: string;
  access: string;
  validation: string;
  confidence: string;
  reference: string;
  limitation: string;
};

type ExplorationLayerItem = { key: string; label: string; sourceId: string };

const explorationSources: ExplorationSourceRecord[] = [
  { id: "ngs-bedrock", agency: "National Geological Survey", name: "Guinea National Bedrock Compilation", publication: "18 March 2025", collection: "1988–2024", method: "Field mapping and harmonized geological interpretation", coordinateSystem: "WGS 84 / UTM Zone 28N", precision: "1:100,000 national compilation", detectionLimit: "Not applicable — interpreted geology", license: "Government analytical use", access: "Public generalized view", validation: "Validated · 4 legacy boundaries flagged", confidence: "High nationally; moderate in legacy areas", reference: "NGS-GEO-2025-BR-01", limitation: "Legacy sheets use inconsistent lithological classifications and require field verification." },
  { id: "geo-stream", agency: "National Geological Survey", name: "Regional Stream-Sediment Geochemistry", publication: "14 June 2020", collection: "2017–2019", method: "ICP-MS multi-element assay", coordinateSystem: "WGS 84 / UTM Zone 28N", precision: "±25 metres", detectionLimit: "Ni 0.2 ppm · Co 0.1 ppm · Li 0.5 ppm", license: "Government analytical use", access: "Restricted — aggregated display", validation: "Validated with 3 exceptions", confidence: "Moderate", reference: "NGS-GEO-2020-SS-14", limitation: "Incomplete eastern coverage and inconsistent legacy sample spacing." },
  { id: "airborne-geo", agency: "Geoscience and Mapping Directorate", name: "National Airborne Geophysics Survey", publication: "09 November 2024", collection: "2022–2024", method: "Magnetic, radiometric and gravity interpretation", coordinateSystem: "WGS 84 geographic", precision: "Flight lines 200–500 metres", detectionLimit: "Survey-specific", license: "Government restricted", access: "Restricted analytical layer", validation: "Validated", confidence: "High", reference: "GMD-AIR-2024-09", limitation: "Resolution decreases in two southern survey blocks." },
  { id: "drill-archive", agency: "Ministry of Mines and Geology", name: "Historical Drill-Hole and Assay Archive", publication: "Continuous register", collection: "1972–2026", method: "Operator submissions and archive digitization", coordinateSystem: "Mixed; standardized to WGS 84", precision: "±10–250 metres depending on source", detectionLimit: "Varies by laboratory and year", license: "Confidential government record", access: "Restricted", validation: "Partially validated", confidence: "Moderate", reference: "MMG-DRILL-ARCHIVE", limitation: "Many historic logs lack collar-survey metadata, analytical method, or validated assay certificates." },
  { id: "cadastre", agency: "National Mining Cadastre", name: "License Areas and Status Register", publication: "Daily service", collection: "Current", method: "Authoritative cadastral database", coordinateSystem: "WGS 84 / UTM Zone 28N", precision: "Authoritative license geometry", detectionLimit: "Not applicable", license: "Government record", access: "Public status · restricted documents", validation: "Validated daily", confidence: "High", reference: "NMC-LIVE-LICENSE", limitation: "Pending applications may not include final approved geometry." },
  { id: "environment", agency: "Environmental Assessment Authority", name: "Protected Areas and Environmental Sensitivity", publication: "22 February 2026", collection: "2020–2026", method: "Protected-area registry, watershed and land-sensitivity overlay", coordinateSystem: "WGS 84 geographic", precision: "50–250 metres", detectionLimit: "Not applicable", license: "Government planning use", access: "Public generalized view", validation: "Validated · community layers partial", confidence: "Moderate", reference: "EAA-ENV-2026-02", limitation: "Community-use and seasonal water-access information is incomplete in several prefectures." },
];

const explorationLayerGroups: Array<{ name: string; items: ExplorationLayerItem[] }> = [
  { name: "Analysis Results", items: [{ key: "exploration_targets", label: "Exploration targets", sourceId: "ngs-bedrock" }] },
  { name: "Geological Context", items: [
    ["bedrock", "Bedrock geology"], ["surficial", "Surficial geology"], ["lithology", "Lithological units"], ["faults", "Faults"], ["folds", "Folds"], ["shear", "Shear zones"], ["intrusions", "Intrusions"], ["volcanic", "Volcanic belts"], ["basins", "Sedimentary basins"], ["metamorphic", "Metamorphic belts"], ["alteration", "Alteration zones"], ["tectonic", "Tectonic structures"],
  ].map(([key,label]) => ({ key, label, sourceId: "ngs-bedrock" })) },
  { name: "Mineral & Element Evidence", items: [
    ["occurrences", "Known mineral occurrences"], ["historic_mines", "Historic mines"], ["historic_prospects", "Historic prospects"], ["outcrops", "Outcrop samples"], ["rock_geochem", "Rock geochemistry"], ["soil_geochem", "Soil geochemistry"], ["stream_geochem", "Stream-sediment geochemistry"], ["water_chem", "Water chemistry"], ["mineralogy", "Mineralogical observations"], ["concentrations", "Commodity-specific concentrations"],
  ].map(([key,label]) => ({ key, label, sourceId: "geo-stream" })) },
  { name: "Geophysics & Remote Sensing", items: [
    ["magnetic", "Magnetic anomalies"], ["gravity", "Gravity anomalies"], ["radiometric", "Radiometric surveys"], ["electromagnetic", "Electromagnetic surveys"], ["remote", "Remote-sensing anomalies"], ["satellite", "Satellite alteration indicators"],
  ].map(([key,label]) => ({ key, label, sourceId: "airborne-geo" })) },
  { name: "Subsurface Evidence", items: [
    ["drill_holes", "Drill-hole locations"], ["core_logs", "Core-log availability"], ["assay_intervals", "Assay intervals"], ["drill_intercepts", "Drill intercepts"], ["estimated_grade", "Estimated grade"], ["mineralized_thickness", "Mineralized thickness"], ["resource_projects", "Resource-stage projects"],
  ].map(([key,label]) => ({ key, label, sourceId: "drill-archive" })) },
  { name: "Constraints & Access", items: [
    ["roads", "Roads"], ["rail", "Rail"], ["ports", "Ports"], ["energy", "Energy infrastructure"], ["licenses", "License areas"], ["land", "Land status"], ["protected", "Protected areas"], ["communities", "Communities"], ["water", "Water access"], ["environmental", "Environmental sensitivity"],
  ].map(([key,label]) => ({ key, label, sourceId: ["licenses"].includes(key) ? "cadastre" : "environment" })) },
];

const defaultExplorationLayers = new Set(["bedrock", "occurrences", "stream_geochem", "drill_holes", "exploration_targets"]);

const explorationTargets: ExplorationTargetRecord[] = [
  { id: "CM-01", name: "Fouta Central", region: "Labé", coordinates: "11.30° N, 12.29° W", commodities: ["Lithium"], stage: "Advanced exploration", evidenceLevel: 3, evidenceLabel: "Drill Supported", confidence: "High", x: 47, y: 29, dataYear: 2025, evidenceTypes: ["Geology", "Geochemistry", "Geophysics", "Drilling"], sourceIds: ["ngs-bedrock", "geo-stream", "airborne-geo", "drill-archive"], access: "Good", geologicalSetting: "Pegmatite-bearing granitic corridor within a mapped structural intersection.", knownOccurrences: "Two historic pegmatite occurrences within 12 km.", surfaceEvidence: "Lithium-bearing rock-chip and soil anomalies across three traverses.", geophysicalEvidence: "Radiometric contrast and interpreted structural lineament.", drillEvidence: "Six drill holes; three contain repeated mineralized intervals requiring validation.", coverage: "82% of target area", lastUpdate: "18 May 2025", missingEvidence: "Validated density measurements and modern mineralogical characterization.", limitations: "Assay certificates for two historic holes remain under review.", recommendation: "Drill validation", relatedLicenses: "GUI-EXP-027 · GUI-EXP-071", infrastructure: "Road 18 km · substation 41 km · rail 64 km", environmentalConstraint: "Low — watershed buffer review required", favorability: "Strong", validation: "Validated with two assay exceptions", scores: [["Geological favorability",88],["Mineral evidence",82],["Subsurface evidence",74],["Infrastructure access",79],["Metadata completeness",82]], matrix: ["Strong","Moderate","Strong","Moderate","Moderate","Strong","Missing","Strong"] },
  { id: "CM-02", name: "Kankan East", region: "Kankan", coordinates: "10.12° N, 9.34° W", commodities: ["Gold", "Copper"], stage: "Advanced exploration", evidenceLevel: 3, evidenceLabel: "Drill Supported", confidence: "High", x: 71, y: 49, dataYear: 2024, evidenceTypes: ["Geology", "Geochemistry", "Geophysics", "Drilling"], sourceIds: ["ngs-bedrock", "geo-stream", "airborne-geo", "drill-archive"], access: "Good", geologicalSetting: "Shear-hosted mineralized corridor near a granitic contact.", knownOccurrences: "Historic gold workings and copper-bearing float recorded locally.", surfaceEvidence: "Strong gold-in-soil anomaly with supporting copper pathfinders.", geophysicalEvidence: "Magnetic break and electromagnetic conductor coincide with surface trend.", drillEvidence: "Four historic holes; one mineralized interval is supported by partial assay records.", coverage: "76% of target area", lastUpdate: "03 December 2024", missingEvidence: "Complete drill logs, QA/QC records and down-hole surveys.", limitations: "Historic coordinate precision varies from 25 to 120 metres.", recommendation: "Surface sampling", relatedLicenses: "GUI-EXP-001 · GUI-EXP-094", infrastructure: "National road 11 km · power 33 km", environmentalConstraint: "Medium — seasonal river crossing", favorability: "Strong", validation: "Under geological review", scores: [["Geological favorability",84],["Mineral evidence",86],["Subsurface evidence",61],["Infrastructure access",83],["Metadata completeness",76]], matrix: ["Strong","Strong","Strong","Moderate","Moderate","Moderate","Missing","Strong"] },
  { id: "CM-07", name: "Forest Belt CM-07", region: "Nzérékoré", coordinates: "7.76° N, 8.82° W", commodities: ["Nickel", "Cobalt"], stage: "Early exploration", evidenceLevel: 2, evidenceLabel: "Surface Supported", confidence: "Moderate", x: 56, y: 72, dataYear: 2019, evidenceTypes: ["Geology", "Geochemistry", "Geophysics"], sourceIds: ["ngs-bedrock", "geo-stream", "airborne-geo", "environment"], access: "Moderate", geologicalSetting: "Mapped ultramafic lithology within a regionally deformed greenstone corridor.", knownOccurrences: "One historic nickel occurrence 9 km north-west.", surfaceEvidence: "Moderate Ni–Co stream-sediment anomaly and two mineralized outcrops.", geophysicalEvidence: "Regional magnetic anomaly follows the mapped ultramafic unit.", drillEvidence: "No validated drill-hole, core-log or assay interval records.", coverage: "58% of target area", lastUpdate: "21 August 2019", missingEvidence: "Modern drilling, complete geochemical coverage and analytical metadata.", limitations: "Eastern coverage is incomplete and 11% of samples lack analytical metadata.", recommendation: "Geophysical survey", relatedLicenses: "GUI-EXP-071", infrastructure: "Road 24 km · rail 46 km · substation 73 km", environmentalConstraint: "High — watershed and community-use overlap", favorability: "Strong", validation: "Validated regional interpretation", scores: [["Geological favorability",78],["Mineral evidence",64],["Subsurface evidence",18],["Infrastructure access",71],["Metadata completeness",58]], matrix: ["Strong","Moderate","Moderate","Strong","Moderate","Missing","Missing","Moderate"] },
  { id: "CM-11", name: "Beyla Ridge", region: "Nzérékoré", coordinates: "8.68° N, 8.65° W", commodities: ["Rare earth elements"], stage: "Reconnaissance", evidenceLevel: 2, evidenceLabel: "Surface Supported", confidence: "Moderate", x: 68, y: 78, dataYear: 2021, evidenceTypes: ["Geology", "Geochemistry", "Remote sensing"], sourceIds: ["ngs-bedrock", "geo-stream", "airborne-geo", "environment"], access: "Limited", geologicalSetting: "Alkaline intrusive complex with satellite-derived alteration signatures.", knownOccurrences: "No confirmed REE occurrence; two regional mineralogical observations.", surfaceEvidence: "Weak-to-moderate rare-earth pathfinder anomaly in stream sediment.", geophysicalEvidence: "Strong radiometric response with moderate spatial resolution.", drillEvidence: "No drilling records available.", coverage: "63% of target area", lastUpdate: "12 October 2021", missingEvidence: "Mineralogical confirmation, detailed mapping and drilling.", limitations: "Regional sampling density is too low for target-scale conclusions.", recommendation: "Additional mapping", relatedLicenses: "No active overlap · GUI-APP-042 nearby", infrastructure: "Seasonal road 39 km · no grid connection", environmentalConstraint: "Medium — forest-use consultation required", favorability: "Moderate", validation: "Interpretation requires field verification", scores: [["Geological favorability",69],["Mineral evidence",43],["Subsurface evidence",0],["Infrastructure access",38],["Metadata completeness",63]], matrix: ["Moderate","Weak","Moderate","Weak","Strong","Missing","Missing","Moderate"] },
  { id: "CM-14", name: "Boké Plateau North", region: "Boké", coordinates: "11.16° N, 14.08° W", commodities: ["Bauxite", "Manganese"], stage: "Appraised project area", evidenceLevel: 4, evidenceLabel: "Appraised or Resource Stage", confidence: "High", x: 26, y: 23, dataYear: 2026, evidenceTypes: ["Geology", "Geochemistry", "Drilling", "Resource appraisal"], sourceIds: ["ngs-bedrock", "drill-archive", "cadastre", "environment"], access: "Good", geologicalSetting: "Lateritic plateau developed over mapped mafic basement.", knownOccurrences: "Multiple mapped bauxite occurrences and historical pits.", surfaceEvidence: "Continuous lateritic profile supported by mapping and channel sampling.", geophysicalEvidence: "Terrain and radiometric data support plateau continuity.", drillEvidence: "Repeated drilling, validated core logs and resource-stage documentation.", coverage: "94% of target area", lastUpdate: "07 July 2026", missingEvidence: "Independent reconciliation of two operator resource models.", limitations: "Resource figures remain confidential and are shown only as evidence category.", recommendation: "Data verification", relatedLicenses: "GUI-MIN-014 · GUI-EXP-122", infrastructure: "Haul road 4 km · rail 16 km · port 52 km", environmentalConstraint: "Medium — downstream water monitoring", favorability: "Strong", validation: "Resource documentation under review", scores: [["Geological favorability",92],["Mineral evidence",90],["Subsurface evidence",91],["Infrastructure access",94],["Metadata completeness",87]], matrix: ["Strong","Strong","Strong","Moderate","Moderate","Strong","Strong","Strong"] },
  { id: "CM-18", name: "Kindia Graphite Corridor", region: "Kindia", coordinates: "10.01° N, 12.88° W", commodities: ["Graphite"], stage: "Concept generation", evidenceLevel: 1, evidenceLabel: "Speculative", confidence: "Low", x: 40, y: 53, dataYear: 2018, evidenceTypes: ["Geology", "Remote sensing"], sourceIds: ["ngs-bedrock", "airborne-geo", "cadastre"], access: "Moderate", geologicalSetting: "Graphitic metasedimentary units interpreted from legacy mapping.", knownOccurrences: "One unverified historic graphite mention.", surfaceEvidence: "No validated modern surface samples.", geophysicalEvidence: "Regional electromagnetic conductor; source is not uniquely interpreted.", drillEvidence: "No drilling records available.", coverage: "41% of target area", lastUpdate: "09 April 2018", missingEvidence: "Field mapping, mineralogical confirmation, sampling and all subsurface evidence.", limitations: "Interpretation relies on legacy mapping and a non-unique geophysical response.", recommendation: "Desktop review", relatedLicenses: "GUI-REC-118 nearby", infrastructure: "Road 19 km · grid 31 km", environmentalConstraint: "Low — preliminary screening only", favorability: "Moderate", validation: "Low-confidence interpretation", scores: [["Geological favorability",55],["Mineral evidence",18],["Subsurface evidence",0],["Infrastructure access",68],["Metadata completeness",41]], matrix: ["Moderate","Weak","Missing","Moderate","Weak","Missing","Missing","Weak"] },
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

type ExplorationReadout = {
  name: string;
  type: string;
  detail: string;
  coordinates: string;
  source: string;
  updated: string;
  validation: string;
};

type ExplorationLayerExample = ExplorationReadout & {
  key: string;
  label: string;
  group: string;
  kind: "analysis" | "geology" | "mineral" | "geophysics" | "subsurface" | "constraint";
  x: number;
  y: number;
};

const explorationLayerExampleSeeds: Array<[string,string,string,string]> = [
  ["exploration_targets","Fouta Central target area","A combined geological, geochemical and drilling target used for further review.","11.30° N, 12.29° W"],
  ["bedrock","Kankan Birimian bedrock unit","Mapped volcanic and sedimentary basement compiled from national geological sheets.","10.18° N, 9.42° W"],
  ["surficial","Boké lateritic cover","Thick surface laterite interpreted from mapping and terrain data.","11.09° N, 14.02° W"],
  ["lithology","Fouta granite–pegmatite unit","Granite and pegmatite lithologies mapped within the Fouta corridor.","11.24° N, 12.36° W"],
  ["faults","Kankan East fault trace","Interpreted regional fault crossing the Kankan target corridor.","10.10° N, 9.38° W"],
  ["folds","Labé regional fold axis","Mapped fold axis showing the direction of deformed rock units.","11.18° N, 12.54° W"],
  ["shear","Nzérékoré shear corridor","Deformed rock corridor that may have controlled fluid movement.","7.83° N, 8.91° W"],
  ["intrusions","Beyla alkaline intrusion","Interpreted intrusive body associated with a radiometric response.","8.68° N, 8.65° W"],
  ["volcanic","Siguiri volcanic belt","Regional volcanic sequence mapped from geological compilation.","11.34° N, 9.19° W"],
  ["basins","Coastal sedimentary basin","Sedimentary basin boundary shown for national geological context.","10.31° N, 13.48° W"],
  ["metamorphic","Forest Belt metamorphic domain","Metamorphic rock domain interpreted from legacy mapping.","7.72° N, 8.77° W"],
  ["alteration","Beyla alteration zone","Possible alteration pattern requiring field verification.","8.73° N, 8.71° W"],
  ["tectonic","Guinea regional lineament","Large interpreted structural line crossing several geological units.","10.44° N, 10.73° W"],
  ["occurrences","Forest Belt historic nickel occurrence","Historic record of nickel-bearing material near the CM-07 target.","7.79° N, 8.86° W"],
  ["historic_mines","Siguiri historic gold working","Location of a recorded historic small-scale gold working.","11.43° N, 9.17° W"],
  ["historic_prospects","Kankan copper prospect","Historic prospect record with copper-bearing float observations.","10.14° N, 9.31° W"],
  ["outcrops","Fouta pegmatite outcrop sample","Rock-chip sample collected from a mapped pegmatite outcrop.","11.27° N, 12.32° W"],
  ["rock_geochem","Kindia graphite rock sample","Rock sample with a graphite-bearing mineralogical observation.","10.01° N, 12.88° W"],
  ["soil_geochem","Kankan gold-in-soil anomaly","Cluster of elevated gold and copper pathfinder values in soil.","10.08° N, 9.29° W"],
  ["stream_geochem","Forest Belt Ni–Co stream anomaly","Moderate nickel and cobalt anomaly in stream sediment.","7.76° N, 8.82° W"],
  ["water_chem","Boké drainage water sample","Water-chemistry sample used to screen downstream element levels.","10.84° N, 14.11° W"],
  ["mineralogy","Fouta spodumene observation","Mineralogical observation requiring laboratory confirmation.","11.29° N, 12.27° W"],
  ["concentrations","Boké aluminium concentration zone","Aggregated aluminium concentration values across a lateritic plateau.","11.16° N, 14.08° W"],
  ["magnetic","Forest Belt magnetic high","Regional magnetic response following an interpreted ultramafic unit.","7.81° N, 8.84° W"],
  ["gravity","Kankan gravity gradient","Gravity change interpreted near a major geological contact.","10.22° N, 9.47° W"],
  ["radiometric","Beyla radiometric anomaly","Elevated radiometric response over an interpreted intrusive complex.","8.70° N, 8.67° W"],
  ["electromagnetic","Kindia electromagnetic conductor","Regional conductor with more than one possible geological explanation.","10.04° N, 12.82° W"],
  ["remote","Fouta remote-sensing lineament","Linear satellite feature aligned with mapped geological structure.","11.21° N, 12.41° W"],
  ["satellite","Beyla satellite alteration indicator","Satellite-derived spectral response that may represent altered rock.","8.66° N, 8.62° W"],
  ["drill_holes","Fouta drill hole FC-DDH-03","Validated collar location for a demonstration exploration drill hole.","11.31° N, 12.25° W"],
  ["core_logs","Boké core log BK-14","Digitized geological log describing lithology down the drill core.","11.18° N, 14.04° W"],
  ["assay_intervals","Fouta assay interval 82–96 m","Laboratory assay interval recorded between 82 and 96 metres depth.","11.32° N, 12.24° W"],
  ["drill_intercepts","Kankan drill intercept KE-04","Historic mineralized interval supported by partial assay records.","10.12° N, 9.34° W"],
  ["estimated_grade","Boké estimated-grade block","Generalized grade category from restricted project documentation.","11.15° N, 14.06° W"],
  ["mineralized_thickness","Boké mineralized-thickness section","Demonstration section showing repeated mineralized thickness records.","11.14° N, 14.03° W"],
  ["resource_projects","Boké appraised project area","Project with repeated drilling and resource-stage documentation under review.","11.16° N, 14.08° W"],
  ["roads","Kankan target access road","Road segment used to estimate access to the Kankan target.","10.09° N, 9.44° W"],
  ["rail","Boké mineral railway","Rail corridor connecting plateau operations toward the coast.","10.98° N, 13.91° W"],
  ["ports","Kamsar export port","Coastal port used in infrastructure-distance analysis.","10.66° N, 14.61° W"],
  ["energy","Kindia grid substation","Electricity substation used for preliminary access screening.","9.99° N, 12.91° W"],
  ["licenses","GUI-EXP-071 license area","Active exploration license boundary from the mining cadastre.","8.01° N, 8.97° W"],
  ["land","Nzérékoré community-use land","Generalized community-use area requiring local verification.","7.85° N, 8.79° W"],
  ["protected","Forest watershed protection area","Protected watershed overlay used for early constraint screening.","7.69° N, 8.73° W"],
  ["communities","Beyla community","Community location used for consultation and access planning.","8.69° N, 8.64° W"],
  ["water","Milo River access point","Potential water-access point subject to environmental review.","10.17° N, 9.39° W"],
  ["environmental","Forest Belt sensitivity zone","Combined watershed, forest and community sensitivity overlay.","7.74° N, 8.80° W"],
];

const explorationLayerExamples: ExplorationLayerExample[] = explorationLayerExampleSeeds.map(([key,name,detail,coordinates], index) => {
  const group = explorationLayerGroups.find(layerGroup => layerGroup.items.some(item => item.key === key))!;
  const layer = group.items.find(item => item.key === key)!;
  const source = explorationSources.find(record => record.id === layer.sourceId) || explorationSources[0];
  const kind: ExplorationLayerExample["kind"] = group.name === "Analysis Results" ? "analysis" : group.name === "Geological Context" ? "geology" : group.name === "Mineral & Element Evidence" ? "mineral" : group.name === "Geophysics & Remote Sensing" ? "geophysics" : group.name === "Subsurface Evidence" ? "subsurface" : "constraint";
  return { key, label:layer.label, group:group.name, kind, name, type:layer.label, detail, coordinates, source:source.agency, updated:source.publication, validation:source.validation, x:14 + ((index * 19) % 73), y:13 + ((index * 23) % 72) };
});

const explorationLayerExampleByKey = new Map(explorationLayerExamples.map(example => [example.key, example]));

function EvidenceHoverCard({ item }: { item: ExplorationReadout }) {
  return <span className="exploration-floating-tooltip"><b>{item.name}</b><small>{item.type}</small><em>{item.detail}</em><strong>{item.coordinates}</strong></span>;
}

function InteractiveExplorationMap({
  targets,
  selectedTargetId,
  onSelectTarget,
  activeLayers,
  onToggleLayer,
  onSelectSource,
  opacity,
  onOpacityChange,
}: {
  targets: ExplorationTargetRecord[];
  selectedTargetId: string;
  onSelectTarget: (id: string) => void;
  activeLayers: Set<string>;
  onToggleLayer: (key: string, sourceId: string) => void;
  onSelectSource: (sourceId: string) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [showLayers, setShowLayers] = useState(false);
  const [hovered, setHovered] = useState<ExplorationReadout | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<ExplorationReadout | null>(null);
  const [basemapIndex, setBasemapIndex] = useState(0);
  const basemaps = ["Geology", "Terrain", "Muted"] as const;
  const basemap = basemaps[basemapIndex];
  const selectedTarget = explorationTargets.find(target => target.id === selectedTargetId) || explorationTargets[0];
  const activeCount = activeLayers.size;
  const geologicalActive = ["bedrock","surficial","lithology","intrusions","volcanic","basins","metamorphic","alteration"].some(key => activeLayers.has(key));
  const structureActive = ["faults","folds","shear","tectonic"].some(key => activeLayers.has(key));
  const geochemistryActive = ["rock_geochem","soil_geochem","stream_geochem","water_chem","mineralogy","concentrations"].some(key => activeLayers.has(key));
  const geophysicsActive = ["magnetic","gravity","radiometric","electromagnetic","remote","satellite"].some(key => activeLayers.has(key));
  const drillActive = ["drill_holes","core_logs","assay_intervals","drill_intercepts","estimated_grade","mineralized_thickness","resource_projects"].some(key => activeLayers.has(key));
  const accessActive = ["roads","rail","ports","energy","licenses","land","protected","communities","water","environmental"].some(key => activeLayers.has(key));
  const customExampleKeys = new Set(["exploration_targets","occurrences","stream_geochem","drill_holes"]);
  const visibleLayerExamples = explorationLayerExamples.filter(example => activeLayers.has(example.key) && !customExampleKeys.has(example.key));
  const geochemicalMapExamples: Array<{ className:string; layerKey:string; readout:ExplorationReadout }> = [
    { className:"geochem-a", layerKey:"stream_geochem", readout:{name:"Fouta lithium anomaly",type:"Stream-sediment geochemistry",detail:"Li pathfinder index: 82 · demonstration value",coordinates:"11.24° N, 12.36° W",source:"Regional Stream-Sediment Geochemistry",updated:"2020",validation:"Validated with exceptions"} },
    { className:"geochem-b", layerKey:"soil_geochem", readout:{name:"Kankan Au–Cu anomaly",type:"Soil geochemistry",detail:"Composite anomaly index: 76 · demonstration value",coordinates:"10.10° N, 9.38° W",source:"Regional Stream-Sediment Geochemistry",updated:"2020",validation:"Validated"} },
    { className:"geochem-c", layerKey:"stream_geochem", readout:{name:"Forest Belt Ni–Co anomaly",type:"Stream-sediment geochemistry",detail:"Ni–Co anomaly index: 64 · demonstration value",coordinates:"7.79° N, 8.86° W",source:"Regional Stream-Sediment Geochemistry",updated:"2019",validation:"Moderate confidence"} },
  ];
  const currentReadout = hovered || selectedEvidence;

  const changeZoom = (amount: number) => setZoom(current => Math.min(2, Math.max(0.8, Number((current + amount).toFixed(1)))));
  const showReadout = (item: ExplorationReadout) => setHovered(item);
  const clearReadout = () => setHovered(null);
  const handleLayerToggle = (item: ExplorationLayerItem) => {
    const becomingVisible = !activeLayers.has(item.key);
    const example = explorationLayerExampleByKey.get(item.key);
    onToggleLayer(item.key, item.sourceId);
    if (example) setSelectedEvidence({ ...example, type:`${item.label} · layer ${becomingVisible ? "shown" : "hidden"}`, detail:becomingVisible ? `Example added to the map: ${example.detail}` : `Layer hidden. Example: ${example.detail}` });
  };
  const exportMapImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 800;
    const context = canvas.getContext("2d");
    if (!context) return;
    const backgrounds = ["#e6e8e3", "#dce5da", "#edf0f1"];
    context.fillStyle = backgrounds[basemapIndex];
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#9ba9a3";
    context.lineWidth = 1;
    for (let x = 80; x < canvas.width; x += 100) { context.beginPath(); context.moveTo(x, 100); context.lineTo(x, 730); context.stroke(); }
    for (let y = 130; y < 730; y += 80) { context.beginPath(); context.moveTo(60, y); context.lineTo(1340, y); context.stroke(); }
    context.fillStyle = basemapIndex === 0 ? "#cfc7b5" : basemapIndex === 1 ? "#bdcdb8" : "#d6dcde";
    context.beginPath();
    context.moveTo(120, 235); context.lineTo(275, 130); context.lineTo(500, 155); context.lineTo(675, 225); context.lineTo(905, 185); context.lineTo(1195, 330); context.lineTo(1110, 515); context.lineTo(1205, 650); context.lineTo(925, 700); context.lineTo(685, 625); context.lineTo(430, 710); context.lineTo(230, 590); context.lineTo(105, 430); context.closePath(); context.fill();
    context.fillStyle = "#102a43";
    context.font = "bold 30px Georgia";
    context.fillText("National Multi-layer Exploration Evidence Map", 55, 58);
    context.font = "17px Arial";
    context.fillStyle = "#536977";
    context.fillText(`${basemap} basemap · ${activeCount} visible layers · ${targets.length} matching targets`, 55, 88);
    if (activeLayers.has("exploration_targets")) targets.forEach(target => {
      const colors = ["#bfb4c9", "#a98295", "#6941a5", "#315f50"];
      const x = 70 + (target.x / 100) * 1260;
      const y = 105 + (target.y / 100) * 590;
      context.fillStyle = colors[target.evidenceLevel - 1];
      context.beginPath(); context.arc(x, y, 13, 0, Math.PI * 2); context.fill();
      context.fillStyle = "#263f50"; context.font = "bold 16px Arial"; context.fillText(target.name, x + 20, y - 3);
      context.fillStyle = "#667b88"; context.font = "13px Arial"; context.fillText(`${target.commodities.join(" · ")} · Level ${target.evidenceLevel}`, x + 20, y + 16);
    });
    context.fillStyle = "#ffffffdd"; context.fillRect(45, 742, 1310, 38);
    context.fillStyle = "#657684"; context.font = "14px Arial"; context.fillText("Demonstration data only · Targets indicate evidence for further investigation, not confirmed deposits.", 62, 767);
    canvas.toBlob(blob => { if (!blob) return; const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "national-exploration-evidence-map.png"; link.click(); URL.revokeObjectURL(link.href); }, "image/png");
  };

  return (
    <div className="exploration-map-workspace">
      <div className="exploration-map-toolbar">
        <button className={`exploration-layer-button ${showLayers ? "active" : ""}`} onClick={() => setShowLayers(value => !value)} aria-expanded={showLayers}><span>☷</span> Evidence layers <b>{activeCount}</b></button>
        <label className="exploration-opacity-control"><span>Layer opacity</span><input type="range" min="25" max="100" value={Math.round(opacity * 100)} onChange={event => onOpacityChange(Number(event.target.value) / 100)} /><b>{Math.round(opacity * 100)}%</b></label>
        <span className="exploration-result-count"><b>{targets.length}</b> targets match current filters</span>
        <button className="exploration-map-action" onClick={() => setBasemapIndex(index => (index + 1) % basemaps.length)}>Basemap: {basemap}⌄</button><button className="exploration-map-action" onClick={exportMapImage}>↗ Export map</button>
      </div>

      <div className={`exploration-map-stage-v2 basemap-${basemap.toLowerCase()}`}>
        <div className="exploration-zoom-tools">
          <button onClick={() => changeZoom(.2)} disabled={zoom >= 2} aria-label="Zoom exploration map in">＋</button>
          <button onClick={() => changeZoom(-.2)} disabled={zoom <= .8} aria-label="Zoom exploration map out">−</button>
          <button onClick={() => setZoom(1)} aria-label="Reset exploration map zoom">⌂</button>
          <span>{Math.round(zoom * 100)}%</span>
        </div>
        <div className="exploration-demo-badge"><i /> DEMONSTRATION GEOLOGY</div>

        <div className={`exploration-layer-drawer ${showLayers ? "open" : ""}`}>
          <div className="exploration-layer-drawer-head"><div><b>Evidence layers</b><span>{activeCount} visible · click ⓘ for source</span></div><button onClick={() => setShowLayers(false)} aria-label="Close evidence layers">×</button></div>
          <div className="exploration-layer-drawer-scroll">
            {explorationLayerGroups.map((group, groupIndex) => {
              const groupCount = group.items.filter(item => activeLayers.has(item.key)).length;
              return <details key={group.name} open={groupIndex < 3}><summary><span>{group.name}</span><b>{groupCount}/{group.items.length}</b></summary><div>{group.items.map(item => { const example = explorationLayerExampleByKey.get(item.key); return <label key={item.key} title={example ? `Example: ${example.name} — ${example.detail}` : item.label}><input type="checkbox" checked={activeLayers.has(item.key)} onChange={() => handleLayerToggle(item)} /><span>{item.label}</span><button type="button" onClick={event => { event.preventDefault(); onSelectSource(item.sourceId); }} aria-label={`View source for ${item.label}`}>ⓘ</button></label>; })}</div></details>;
            })}
          </div>
        </div>

        <div className="exploration-map-canvas-v2" style={{ transform: `scale(${zoom})` }}>
          <div className="exploration-country-v2" />
          {geologicalActive && <div className="exploration-geology-overlays" style={{ opacity }}><i className="geology-v2-unit unit-a"/><i className="geology-v2-unit unit-b"/><i className="geology-v2-unit unit-c"/><i className="geology-v2-unit unit-d"/></div>}
          {structureActive && <div className="exploration-structure-overlays" style={{ opacity }}><i className="structure-v2-line structure-a"/><i className="structure-v2-line structure-b"/><i className="structure-v2-line structure-c"/></div>}
          {geochemistryActive && <div className="exploration-geochem-overlays" style={{ opacity }}>{geochemicalMapExamples.filter(example => activeLayers.has(example.layerKey)).map(example => <button key={example.className} className={`geochem-v2-spot ${example.className}`} aria-label={example.readout.name} onMouseEnter={() => showReadout(example.readout)} onMouseLeave={clearReadout} onFocus={() => showReadout(example.readout)} onBlur={clearReadout}><EvidenceHoverCard item={example.readout}/></button>)}</div>}
          {geophysicsActive && <div className="exploration-geophysics-overlays" style={{ opacity }}><i className="geophysics-v2-band geophysics-a"/><i className="geophysics-v2-band geophysics-b"/></div>}
          {accessActive && <div className="exploration-access-overlays" style={{ opacity }}><i className="access-v2-line road-v2"/><i className="access-v2-line rail-v2"/><i className="protected-v2-area"/><span className="exploration-port-v2">◉ Conakry Port</span></div>}

          <span className="exploration-region-v2 region-v2-boke">BOKÉ</span><span className="exploration-region-v2 region-v2-labe">LABÉ</span><span className="exploration-region-v2 region-v2-kindia">KINDIA</span><span className="exploration-region-v2 region-v2-kankan">KANKAN</span><span className="exploration-region-v2 region-v2-nzerekore">NZÉRÉKORÉ</span>

          {visibleLayerExamples.map(example => <button key={`example-${example.key}`} className={`exploration-evidence-example example-${example.kind}`} style={{ left:`${example.x}%`, top:`${example.y}%` }} aria-label={`${example.label} example: ${example.name}`} onMouseEnter={() => showReadout(example)} onMouseLeave={clearReadout} onFocus={() => showReadout(example)} onBlur={clearReadout}><i/><EvidenceHoverCard item={example}/></button>)}

          {activeLayers.has("occurrences") && explorationTargets.map((target, index) => { const readout = {name:`Historic occurrence near ${target.name}`,type:"Known mineral occurrence",detail:`Recorded commodity: ${target.commodities.join(" · ")}`,coordinates:target.coordinates,source:"National Geological Survey",updated:String(target.dataYear),validation:target.validation}; return <button key={`occ-${target.id}`} className={`exploration-occurrence-v2 occurrence-${index % 3}`} style={{ left: `${target.x - 3}%`, top: `${target.y + 4}%` }} aria-label={readout.name} onMouseEnter={() => showReadout(readout)} onMouseLeave={clearReadout} onFocus={() => showReadout(readout)} onBlur={clearReadout}><i/><EvidenceHoverCard item={readout}/></button>; })}

          {drillActive && explorationTargets.filter(target => target.evidenceLevel >= 3).map((target, index) => { const readout = {name:`Drill evidence — ${target.name}`,type:"Subsurface evidence",detail:target.drillEvidence,coordinates:target.coordinates,source:"Historical Drill-Hole and Assay Archive",updated:target.lastUpdate,validation:target.validation}; return <button key={`drill-${target.id}`} className="exploration-drill-v2" style={{ left: `${Math.min(target.x + 10, 90)}%`, top: `${Math.min(target.y + 7 + index, 90)}%` }} aria-label={readout.name} onMouseEnter={() => showReadout(readout)} onMouseLeave={clearReadout} onFocus={() => showReadout(readout)} onBlur={clearReadout}><i/><EvidenceHoverCard item={readout}/></button>; })}

          {activeLayers.has("exploration_targets") && targets.map(target => { const readout = {name:target.name,type:`Level ${target.evidenceLevel} · ${target.evidenceLabel}`,detail:`${target.commodities.join(" · ")} · ${target.confidence} confidence`,coordinates:target.coordinates,source:explorationSources.find(source => source.id === target.sourceIds[0])?.agency || "National Geological Survey",updated:target.lastUpdate,validation:target.validation}; return <button key={target.id} className={`exploration-target-v2 level-${target.evidenceLevel} ${selectedTargetId === target.id ? "selected" : ""}`} style={{ left: `${target.x}%`, top: `${target.y}%` }} onClick={() => { onSelectTarget(target.id); setSelectedEvidence(readout); }} onMouseEnter={() => showReadout(readout)} onMouseLeave={clearReadout} onFocus={() => showReadout(readout)} onBlur={clearReadout} aria-pressed={selectedTargetId === target.id} aria-label={`Select exploration target ${target.name}`}><i/><span><b>{target.name}</b><small>{target.commodities.join(" · ")}</small></span><EvidenceHoverCard item={readout}/></button>; })}

          {activeLayers.has("exploration_targets") && targets.length === 0 && <div className="exploration-map-empty"><b>No targets match these filters</b><span>Adjust commodity, evidence level, data age, or region.</span></div>}
        </div>

        <div className="exploration-map-legend-v2"><span><i className="legend-v2-geology"/> Geology</span><span><i className="legend-v2-geochem"/> Geochemistry</span><span><i className="legend-v2-occurrence"/> Occurrence</span><span><i className="legend-v2-drill"/> Drill evidence</span><span><i className="legend-v2-target"/> Target area</span></div>
        <div className="exploration-scale-v2">0&nbsp;&nbsp;&nbsp;50&nbsp;&nbsp;&nbsp;100 km</div>
      </div>

      <div className="exploration-map-readout-v2" aria-live="polite">
        <span className={`readout-v2-icon ${currentReadout ? "active" : ""}`}>⌖</span>
        {currentReadout ? <><div><b>{currentReadout.name}</b><small>{currentReadout.type} · {currentReadout.detail}</small></div><span><small>Source</small><b>{currentReadout.source}</b></span><span><small>Updated</small><b>{currentReadout.updated}</b></span><span><small>Validation</small><b>{currentReadout.validation}</b></span><strong>{currentReadout.coordinates}</strong></> : <><div><b>{selectedTarget.name}</b><small>Click a layer or hover over an evidence example to inspect it.</small></div><span><small>Visible layers</small><b>{activeCount}</b></span><span><small>Map zoom</small><b>{Math.round(zoom * 100)}%</b></span><strong>{selectedTarget.coordinates}</strong></>}
      </div>
    </div>
  );
}

function ExplorationCompareModal({
  open,
  selectedIds,
  onToggle,
  onClear,
  onClose,
  onViewTarget,
}: {
  open: boolean;
  selectedIds: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
  onViewTarget: (id: string) => void;
}) {
  if (!open) return null;
  const selectedTargets = selectedIds.map(id => explorationTargets.find(target => target.id === id)).filter(Boolean) as ExplorationTargetRecord[];
  const comparisonRows: Array<[string, (target: ExplorationTargetRecord) => string]> = [
    ["Commodity", target => target.commodities.join(" · ")],
    ["Evidence level", target => `Level ${target.evidenceLevel} — ${target.evidenceLabel}`],
    ["Confidence", target => target.confidence],
    ["Geological setting", target => target.geologicalSetting],
    ["Surface evidence", target => target.surfaceEvidence],
    ["Drill evidence", target => target.drillEvidence],
    ["Infrastructure", target => target.infrastructure],
    ["Environmental constraints", target => target.environmentalConstraint],
    ["Missing evidence", target => target.missingEvidence],
    ["Recommended next action", target => target.recommendation],
  ];

  return (
    <div className="exploration-compare-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="exploration-compare-modal" role="dialog" aria-modal="true" aria-labelledby="exploration-compare-title">
        <header className="exploration-compare-modal-head">
          <div><span className="section-kicker purple-text">SIMPLE COMPARE MODE</span><h2 id="exploration-compare-title">Compare two exploration areas</h2><p>Choose Area A and Area B below. The comparison appears immediately.</p></div>
          <div><span className={selectedIds.length === 2 ? "ready" : ""}>{selectedIds.length}/2 selected</span><button onClick={onClose} aria-label="Close comparison">×</button></div>
        </header>

        <div className="exploration-compare-modal-body">
          <aside className="exploration-compare-picker">
            <div className="exploration-compare-slots">
              {[0,1].map(index => {
                const target = selectedTargets[index];
                return <div className={target ? "filled" : ""} key={index}><i>{index === 0 ? "A" : "B"}</i>{target ? <><span><b>{target.name}</b><small>{target.region} · {target.commodities.join(" · ")}</small></span><button onClick={() => onToggle(target.id)} aria-label={`Remove ${target.name} from comparison`}>×</button></> : <span><b>Choose Area {index === 0 ? "A" : "B"}</b><small>Select an area from the list</small></span>}</div>;
              })}
            </div>
            <div className="exploration-compare-picker-head"><b>Available areas</b><span>{selectedIds.length === 2 ? "Remove one area to choose another" : "Click an area to add it"}</span></div>
            <div className="exploration-compare-target-list">
              {explorationTargets.map(target => {
                const selectedIndex = selectedIds.indexOf(target.id);
                const selected = selectedIndex >= 0;
                const disabled = selectedIds.length === 2 && !selected;
                return <button key={target.id} className={selected ? "selected" : ""} disabled={disabled} aria-pressed={selected} onClick={() => onToggle(target.id)}><i>{selected ? (selectedIndex === 0 ? "A" : "B") : "+"}</i><span><b>{target.name}</b><small>{target.id} · {target.region} · {target.commodities.join(" · ")}</small></span><em>Level {target.evidenceLevel}</em></button>;
              })}
            </div>
          </aside>

          <main className="exploration-compare-results">
            {selectedTargets.length < 2 ? <div className="exploration-compare-empty"><i>⇄</i><h3>{selectedTargets.length === 0 ? "Choose the first area" : "Now choose the second area"}</h3><p>Once Area A and Area B are selected, their evidence will be shown side by side here.</p></div> : <>
              <div className="exploration-compare-result-head"><span>Comparison results</span><b>Evidence supports review prioritization — not a discovery probability.</b></div>
              <div className="exploration-compare-grid">
                <div className="compare-grid-label compare-grid-top">Area</div>
                {selectedTargets.map((target,index) => <div className="compare-grid-target" key={target.id}><i>{index === 0 ? "A" : "B"}</i><span><b>{target.name}</b><small>{target.id} · {target.coordinates}</small></span><button onClick={() => onViewTarget(target.id)}>View on map</button></div>)}
                {comparisonRows.map(([label,getValue]) => <div className="compare-grid-row" key={label}><b>{label}</b>{selectedTargets.map(target => <span className={label === "Recommended next action" ? "recommended" : ""} key={target.id}>{getValue(target)}</span>)}</div>)}
              </div>
            </>}
          </main>
        </div>

        <footer className="exploration-compare-modal-foot"><button onClick={onClear} disabled={selectedIds.length === 0}>Clear both</button><span>{selectedIds.length === 2 ? "Comparison ready" : `Select ${2-selectedIds.length} more area${selectedIds.length === 0 ? "s" : ""}`}</span><button className="primary" onClick={onClose}>Done</button></footer>
      </section>
    </div>
  );
}

function ExplorationV2() {
  const [activeTab, setActiveTab] = useState<"ranking"|"matrix"|"metadata">("ranking");
  const [selectedTargetId, setSelectedTargetId] = useState("CM-07");
  const [selectedCommodities, setSelectedCommodities] = useState<string[]>(["Lithium","Nickel","Cobalt"]);
  const [selectedLevels, setSelectedLevels] = useState<Set<number>>(new Set([2,3,4]));
  const [filters, setFilters] = useState({ region: "All regions", evidenceType: "All evidence types", source: "All source agencies", confidence: "Moderate or higher", age: "Any age", access: "Any access" });
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(defaultExplorationLayers));
  const [layerOpacity, setLayerOpacity] = useState(.72);
  const [selectedSourceId, setSelectedSourceId] = useState("geo-stream");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [notice, setNotice] = useState("");
  const commodities = ["Bauxite","Iron ore","Gold","Lithium","Nickel","Cobalt","Copper","Graphite","Rare earth elements","Vanadium","Tungsten","Manganese","Other critical minerals"];
  const confidenceRank = { Low: 1, Moderate: 2, High: 3 };

  const filteredTargets = explorationTargets.filter(target => {
    const commodityMatch = selectedCommodities.length === 0 || target.commodities.some(commodity => selectedCommodities.includes(commodity));
    const regionMatch = filters.region === "All regions" || target.region === filters.region;
    const typeMatch = filters.evidenceType === "All evidence types" || target.evidenceTypes.includes(filters.evidenceType);
    const sourceRecord = explorationSources.find(source => source.id === filters.source);
    const sourceMatch = filters.source === "All source agencies" || (sourceRecord ? target.sourceIds.includes(sourceRecord.id) : true);
    const confidenceMatch = filters.confidence === "Any confidence" || (filters.confidence === "High only" ? target.confidence === "High" : confidenceRank[target.confidence] >= 2);
    const ageMatch = filters.age === "Any age" || (filters.age === "Current — 3 years" ? target.dataYear >= 2023 : target.dataYear <= 2021);
    const accessMatch = filters.access === "Any access" || target.access === filters.access;
    return commodityMatch && regionMatch && typeMatch && sourceMatch && confidenceMatch && ageMatch && accessMatch && selectedLevels.has(target.evidenceLevel);
  });
  const selectedTarget = explorationTargets.find(target => target.id === selectedTargetId) || explorationTargets[0];
  const selectedSource = explorationSources.find(source => source.id === selectedSourceId) || explorationSources[0];
  useEffect(() => {
    if (!showCompareModal) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setShowCompareModal(false); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [showCompareModal]);

  const toggleCommodity = (commodity: string) => setSelectedCommodities(current => current.includes(commodity) ? current.filter(item => item !== commodity) : [...current, commodity]);
  const toggleLevel = (level: number) => setSelectedLevels(current => { const next = new Set(current); if (next.has(level)) next.delete(level); else next.add(level); return next; });
  const updateFilter = (key: keyof typeof filters, value: string) => setFilters(current => ({ ...current, [key]: value }));
  const toggleLayer = (key: string, sourceId: string) => { setActiveLayers(current => { const next = new Set(current); if (next.has(key)) next.delete(key); else next.add(key); return next; }); setSelectedSourceId(sourceId); };
  const resetFilters = () => { setSelectedCommodities([]); setSelectedLevels(new Set([1,2,3,4])); setFilters({ region: "All regions", evidenceType: "All evidence types", source: "All source agencies", confidence: "Any confidence", age: "Any age", access: "Any access" }); };
  const selectTarget = (id: string) => { setSelectedTargetId(id); const target = explorationTargets.find(item => item.id === id); if (target?.sourceIds[0]) setSelectedSourceId(target.sourceIds[0]); };
  const toggleCompare = (id: string) => setCompareIds(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 2 ? [...current, id] : current);
  const openCompare = (id?: string) => { if (id) setCompareIds(current => current.includes(id) || current.length === 2 ? current : [...current,id]); setShowCompareModal(true); };
  const flashNotice = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2200); };

  const saveView = () => {
    window.localStorage.setItem("peblink-exploration-view", JSON.stringify({ selectedCommodities, selectedLevels:[...selectedLevels], filters, activeLayers:[...activeLayers], layerOpacity, selectedTargetId }));
    flashNotice("Exploration view saved on this device");
  };

  const downloadText = (filename: string, content: string, mime: string) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([content], { type: mime }));
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportEvidence = (format: "PDF"|"CSV"|"Image"|"Memo") => {
    const safeName = selectedTarget.name.toLowerCase().replace(/[^a-z0-9]+/g,"-");
    const lines = ["Exploration Evidence Summary", selectedTarget.name, `Target ID: ${selectedTarget.id}`, `Commodity: ${selectedTarget.commodities.join(" · ")}`, `Evidence level: Level ${selectedTarget.evidenceLevel} — ${selectedTarget.evidenceLabel}`, `Confidence: ${selectedTarget.confidence}`, `Interpretation: This area contains geological indicators that may justify additional exploration.`, `Geological favorability: ${selectedTarget.geologicalSetting}`, `Mineral evidence: ${selectedTarget.surfaceEvidence}`, `Subsurface evidence: ${selectedTarget.drillEvidence}`, `Infrastructure and access: ${selectedTarget.infrastructure}`, `Uncertainty and data gaps: ${selectedTarget.missingEvidence}`, `Recommended next action: ${selectedTarget.recommendation}`, "Disclaimer: This evidence does not confirm an economically viable mineral deposit."];
    if (format === "PDF") { window.print(); flashNotice("Print view opened — choose Save as PDF"); return; }
    if (format === "CSV") { downloadText(`${safeName}-evidence.csv`, `Section,Value\n${lines.slice(2).map(line => { const [label,...value] = line.split(": "); return `"${label}","${value.join(": ").replaceAll('"','""')}"`; }).join("\n")}`, "text/csv"); return; }
    if (format === "Memo") { downloadText(`${safeName}-technical-memo.txt`, lines.join("\n\n"), "text/plain"); return; }
    const canvas = document.createElement("canvas"); canvas.width = 1200; canvas.height = 630; const context = canvas.getContext("2d");
    if (context) { context.fillStyle="#102a43"; context.fillRect(0,0,1200,630); context.fillStyle="#d2ad53"; context.fillRect(0,0,1200,8); context.fillStyle="#ffffff"; context.font="bold 34px Georgia"; context.fillText("Exploration Evidence Summary",70,88); context.font="bold 46px Georgia"; context.fillText(selectedTarget.name,70,160); context.fillStyle="#cbb8e5"; context.font="22px Arial"; context.fillText(`${selectedTarget.commodities.join(" · ")}  |  Level ${selectedTarget.evidenceLevel} — ${selectedTarget.evidenceLabel}`,70,205); context.fillStyle="#ffffff"; context.font="20px Arial"; [selectedTarget.geologicalSetting,selectedTarget.surfaceEvidence,selectedTarget.drillEvidence,`Next: ${selectedTarget.recommendation}`].forEach((line,index) => { const clipped = line.length > 86 ? `${line.slice(0,83)}…` : line; context.fillText(clipped,90,290 + index * 62); }); context.fillStyle="#b8c8d5"; context.font="17px Arial"; context.fillText("Demonstration data · Evidence for further investigation only",70,585); canvas.toBlob(blob => { if (blob) { const link=document.createElement("a"); link.href=URL.createObjectURL(blob); link.download=`${safeName}-evidence.png`; link.click(); URL.revokeObjectURL(link.href); } },"image/png"); }
  };

  return (
    <>
      {notice && <div className="exploration-toast" role="status">✓ {notice}</div>}
      <ExplorationCompareModal open={showCompareModal} selectedIds={compareIds} onToggle={toggleCompare} onClear={() => setCompareIds([])} onClose={() => setShowCompareModal(false)} onViewTarget={id => { selectTarget(id); setShowCompareModal(false); }}/>
      <header className="page-heading exploration-heading"><div><div className="breadcrumb purple-text">EXPLORATION INTELLIGENCE <span>/</span> NATIONAL VIEW</div><h1>Critical Minerals Exploration Intelligence</h1><p>Evidence-based evaluation of geological opportunity, data confidence, and exploration maturity.</p></div><div className="heading-actions"><button className="select-btn" onClick={saveView}>Save view</button><button className="select-btn exploration-compare-open" onClick={() => openCompare()}>⇄ Compare areas <b>{compareIds.length}/2</b></button><details className="exploration-export-menu"><summary>⇩ Export evidence summary</summary><div>{(["PDF","CSV","Image","Memo"] as const).map(format => <button key={format} onClick={() => exportEvidence(format)}>{format === "Memo" ? "Technical memo" : format}</button>)}</div></details></div></header>
      <div className="disclaimer exploration-disclaimer-v2"><b>i</b><span><strong>Exploration interpretation notice</strong> Exploration indicators represent evidence for further investigation and do not confirm the existence of an economically viable mineral deposit.</span><button onClick={() => flashNotice("Methodology: evidence strength, confidence, recency, access and visible constraints")}>View methodology</button></div>

      <div className="commodity-strip exploration-commodity-v2"><b>Commodity focus</b><div><button className={selectedCommodities.length === 0 ? "selected" : ""} onClick={() => setSelectedCommodities([])}>All commodities{selectedCommodities.length === 0 ? " ✓" : ""}</button>{commodities.map(commodity => <button className={selectedCommodities.includes(commodity) ? "selected" : ""} aria-pressed={selectedCommodities.includes(commodity)} onClick={() => toggleCommodity(commodity)} key={commodity}>{commodity}{selectedCommodities.includes(commodity) ? " ✓" : ""}</button>)}</div><span>{filteredTargets.length} target areas</span></div>

      <section className="exploration-workspace-v2">
        <aside className="panel exploration-filter-v2">
          <div className="panel-head"><div><span className="section-kicker purple-text">ANALYSIS CONTROLS</span><h3>Evidence filters</h3></div><button onClick={resetFilters}>Reset all</button></div>
          <div className="exploration-filter-scroll">
            <label>Region<select value={filters.region} onChange={event => updateFilter("region",event.target.value)}>{["All regions","Boké","Labé","Kindia","Kankan","Nzérékoré"].map(value => <option key={value}>{value}</option>)}</select></label>
            <label>Evidence type<select value={filters.evidenceType} onChange={event => updateFilter("evidenceType",event.target.value)}>{["All evidence types","Geology","Geochemistry","Geophysics","Remote sensing","Drilling","Resource appraisal"].map(value => <option key={value}>{value}</option>)}</select></label>
            <label>Data source<select value={filters.source} onChange={event => updateFilter("source",event.target.value)}><option>All source agencies</option>{explorationSources.map(source => <option value={source.id} key={source.id}>{source.agency} — {source.name}</option>)}</select></label>
            <label>Confidence<select value={filters.confidence} onChange={event => updateFilter("confidence",event.target.value)}>{["Any confidence","Moderate or higher","High only"].map(value => <option key={value}>{value}</option>)}</select></label>
            <label>Data age<select value={filters.age} onChange={event => updateFilter("age",event.target.value)}>{["Any age","Current — 3 years","Legacy — over 5 years"].map(value => <option key={value}>{value}</option>)}</select></label>
            <label>Infrastructure access<select value={filters.access} onChange={event => updateFilter("access",event.target.value)}>{["Any access","Good","Moderate","Limited"].map(value => <option key={value}>{value}</option>)}</select></label>
            <fieldset><legend>Evidence level</legend>{([4,3,2,1] as const).map(level => { const labels = {4:"Appraised or resource stage",3:"Drill supported",2:"Surface supported",1:"Speculative"}; return <label className="exploration-level-check" key={level}><input type="checkbox" checked={selectedLevels.has(level)} onChange={() => toggleLevel(level)} /><i className={`evidence-dot-v2 level-${level}`}/><span><b>Level {level}</b>{labels[level]}</span></label>; })}</fieldset>
          </div>
          <div className="exploration-filter-result"><span>Matching targets</span><b>{filteredTargets.length}</b><small>Filters update the map, summaries and tables immediately.</small></div>
        </aside>

        <article className="panel exploration-map-panel-v2">
          <div className="panel-head"><div><span className="section-kicker purple-text">DOMINANT MAP WORKSPACE</span><h3>National multi-layer exploration evidence map</h3></div><span className="exploration-map-status"><i/> {activeLayers.size} layers visible</span></div>
          <InteractiveExplorationMap targets={filteredTargets} selectedTargetId={selectedTargetId} onSelectTarget={selectTarget} activeLayers={activeLayers} onToggleLayer={toggleLayer} onSelectSource={sourceId => { setSelectedSourceId(sourceId); setActiveTab("metadata"); }} opacity={layerOpacity} onOpacityChange={setLayerOpacity}/>
        </article>

        <aside className="panel exploration-target-panel-v2">
          <div className="panel-head"><div><span className="section-kicker purple-text">SELECTED TARGET</span><h3>{selectedTarget.name}</h3></div><button onClick={() => openCompare(selectedTarget.id)}>{compareIds.includes(selectedTarget.id) ? "Open comparison" : "+ Compare this area"}</button></div>
          <div className="exploration-target-scroll-v2">
            <div className="exploration-target-identity"><span className={`evidence-level-v2 level-${selectedTarget.evidenceLevel}`}>LEVEL {selectedTarget.evidenceLevel}</span><b>{selectedTarget.evidenceLabel}</b><small>{selectedTarget.id} · {selectedTarget.region} · {selectedTarget.coordinates}</small><div>{selectedTarget.commodities.map(commodity => <i key={commodity}>{commodity}</i>)}</div></div>
            <div className="exploration-target-metrics-v2"><span>Stage<b>{selectedTarget.stage}</b></span><span>Confidence<b>{selectedTarget.confidence}</b></span><span>Coverage<b>{selectedTarget.coverage}</b></span><span>Last update<b>{selectedTarget.lastUpdate}</b></span></div>
            {[['Geological setting',selectedTarget.geologicalSetting],['Known occurrences',selectedTarget.knownOccurrences],['Surface evidence',selectedTarget.surfaceEvidence],['Geophysical evidence',selectedTarget.geophysicalEvidence],['Drill evidence',selectedTarget.drillEvidence]].map(([label,value]) => <section key={label}><b>{label}</b><p>{value}</p></section>)}
            <section className="target-gap-v2"><b>Missing evidence & limitations</b><p>{selectedTarget.missingEvidence} {selectedTarget.limitations}</p></section>
            <section><b>Related licenses</b><p>{selectedTarget.relatedLicenses}</p></section><section><b>Nearby infrastructure</b><p>{selectedTarget.infrastructure}</p></section><section><b>Environmental or land constraints</b><p>{selectedTarget.environmentalConstraint}</p></section>
            <div className="next-action-v2"><span>RECOMMENDED NEXT INVESTIGATION</span><b>{selectedTarget.recommendation}</b><small>Requires human geological review before action.</small></div>
          </div>
          <div className="exploration-target-actions-v2"><button onClick={() => { setSelectedSourceId(selectedTarget.sourceIds[0]); setActiveTab("metadata"); }}>View sources</button><button className="purple-bg" onClick={() => exportEvidence("Memo")}>Export summary</button></div>
        </aside>
      </section>

      <section className="exploration-summary-grid-v2">
        <article className="panel exploration-interpretation-v2"><div className="panel-head"><div><span className="section-kicker purple-text">RESPONSIBLE INTERPRETATION</span><h3>{selectedTarget.name}</h3></div><span className={`evidence-level-v2 level-${selectedTarget.evidenceLevel}`}>LEVEL {selectedTarget.evidenceLevel}</span></div><div><b>Interpretation</b><p>This area contains geological indicators that may justify additional exploration.</p><b>Supporting evidence</b><p>{selectedTarget.geologicalSetting} {selectedTarget.surfaceEvidence}</p><b>Limitations</b><p>{selectedTarget.limitations}</p></div></article>
        <article className="panel structured-summary structured-summary-v2"><div className="panel-head"><div><span className="section-kicker purple-text">STRUCTURED EVIDENCE SUMMARY</span><h3>Five-part evidence summary</h3></div><button onClick={() => exportEvidence("CSV")}>CSV ↗</button></div>{[["1","Geological favorability",selectedTarget.geologicalSetting],["2","Mineral or elemental evidence",selectedTarget.surfaceEvidence],["3","Subsurface evidence",selectedTarget.drillEvidence],["4","Infrastructure and access",selectedTarget.infrastructure],["5","Uncertainty and data gaps",selectedTarget.missingEvidence]].map(item => <div key={item[0]}><i>{item[0]}</i><span><b>{item[1]}</b><p>{item[2]}</p></span></div>)}</article>
        <article className="panel evidence-panel evidence-panel-v2"><div className="panel-head"><div><span className="section-kicker purple-text">TRANSPARENT COMPONENTS</span><h3>Evidence components</h3></div></div><div className="evidence-level"><span>LEVEL {selectedTarget.evidenceLevel}</span><b>{selectedTarget.evidenceLabel}</b><small>Not a discovery probability</small></div>{selectedTarget.scores.map(([name,value]) => <div className="evidence-score" key={name}><span>{name}<b>{value}%</b></span><i><em style={{width:`${value}%`}}/></i></div>)}</article>
      </section>

      <div className="exploration-tabs exploration-tabs-v2"><button className={activeTab==="ranking"?"active":""} onClick={() => setActiveTab("ranking")}>Areas Requiring Further Evaluation <b>{filteredTargets.length}</b></button><button className={activeTab==="matrix"?"active":""} onClick={() => setActiveTab("matrix")}>Evidence Matrix</button><button className={activeTab==="metadata"?"active":""} onClick={() => setActiveTab("metadata")}>Data Sources & Metadata</button></div>
      {activeTab === "ranking" && <article className="panel table-panel exploration-table exploration-table-v2"><div className="panel-head"><div><span className="section-kicker purple-text">RANKED REVIEW QUEUE</span><h3>Areas Requiring Further Evaluation</h3></div><button className="text-btn">Evidence 45% · confidence 25% · access 15% · constraints 15% ⓘ</button></div><div className="table-scroll"><table><thead><tr><th>Rank</th><th>Area</th><th>Commodity</th><th>Evidence level</th><th>Geological favorability</th><th>Surface evidence</th><th>Drill evidence</th><th>Data confidence</th><th>Infrastructure</th><th>Environmental constraint</th><th>Recommended action</th><th>Compare</th></tr></thead><tbody>{filteredTargets.map((target,index) => <tr key={target.id} className={selectedTargetId === target.id ? "selected-row" : ""} onClick={() => selectTarget(target.id)}><td><b className="rank">{String(index+1).padStart(2,"0")}</b></td><td><b>{target.name}</b><small>{target.id} · {target.region}</small></td><td>{target.commodities.join(" · ")}</td><td><span className={`evidence-table-level level-${target.evidenceLevel}`}>Level {target.evidenceLevel}</span></td><td>{target.favorability}</td><td>{target.matrix[2]}</td><td>{target.matrix[5]}</td><td>{target.confidence}</td><td>{target.access}</td><td>{target.environmentalConstraint.split(" — ")[0]}</td><td><b>{target.recommendation}</b></td><td><button className={compareIds.includes(target.id) ? "compare-added" : ""} onClick={event => { event.stopPropagation(); openCompare(target.id); }}>{compareIds.includes(target.id) ? "Open" : "Compare"}</button></td></tr>)}</tbody></table></div>{filteredTargets.length === 0 ? <div className="exploration-empty-table">No target areas match the current filters.</div> : <p className="table-note">Ranking supports review prioritization. It is explainable and is not an objective probability of discovery.</p>}</article>}
      {activeTab === "matrix" && <article className="panel table-panel exploration-table exploration-table-v2"><div className="panel-head"><div><span className="section-kicker purple-text">COMPARATIVE EVIDENCE</span><h3>Exploration target evidence matrix</h3></div><div className="matrix-legend"><span>● Strong</span><span>● Moderate</span><span>● Weak</span><span>○ Missing</span><span>⊘ Restricted</span></div></div><div className="table-scroll"><table><thead><tr>{["Target","Geological context","Known occurrence","Surface geochemistry","Geophysics","Remote sensing","Drilling","Resource appraisal","Metadata completeness","Data recency","Overall confidence"].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{filteredTargets.map(target => <tr key={target.id} onClick={() => selectTarget(target.id)}><td><b>{target.name}</b></td>{target.matrix.map((value,index) => <td key={index} className={`matrix-${value.toLowerCase()}`}>{value}</td>)}<td>{target.dataYear}</td><td>{target.confidence}</td></tr>)}</tbody></table></div></article>}
      {activeTab === "metadata" && <article className="panel exploration-metadata-v2"><div className="panel-head"><div><span className="section-kicker purple-text">SOURCE TRANSPARENCY</span><h3>Data sources and selected-layer metadata</h3></div><span className="status active">{selectedSource.validation}</span></div><div className="exploration-source-layout-v2"><aside>{explorationSources.map(source => <button key={source.id} className={selectedSourceId === source.id ? "active" : ""} onClick={() => setSelectedSourceId(source.id)}><b>{source.name}</b><small>{source.agency}</small><span>{source.confidence} confidence</span></button>)}</aside><div><h4>{selectedSource.name}</h4><p>{selectedSource.agency} · {selectedSource.reference}</p><div className="metadata-grid metadata-grid-v2">{[["Source agency",selectedSource.agency],["Dataset name",selectedSource.name],["Publication date",selectedSource.publication],["Collection date",selectedSource.collection],["Analytical method",selectedSource.method],["Coordinate system",selectedSource.coordinateSystem],["Spatial precision",selectedSource.precision],["Detection limit",selectedSource.detectionLimit],["Data license",selectedSource.license],["Access status",selectedSource.access],["Validation status",selectedSource.validation],["Confidence level",selectedSource.confidence],["Source reference",selectedSource.reference]].map(([label,value]) => <span key={label}><small>{label}</small><b>{value}</b></span>)}</div><div className="limitations"><b>Known limitation — visible to users</b><p>{selectedSource.limitation}</p></div></div></div></article>}

      <section className="evidence-classes evidence-classes-v2">{[["1","Speculative","Broad favorable setting; limited regional indicators; no confirmed surface or subsurface evidence."],["2","Surface Supported","Geochemical anomaly, mineralized outcrop, historic occurrence, or remote/geophysical indication."],["3","Drill Supported","Drill records, repeated mineralized intervals, core or assay evidence, and indication of continuity."],["4","Appraised or Resource Stage","Geological model, resource estimate, advanced assessment, and repeated project-level drilling."]].map(item => <article className={`level-card level-${item[0]}`} key={item[0]}><span>LEVEL {item[0]}</span><b>{item[1]}</b><p>{item[2]}</p></article>)}</section>
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
        {page==="exploration" && <ExplorationV2 />}
        {page==="licenses" && <Licenses onOpen={setSelected}/>}
        {!["overview","exploration","licenses"].includes(page) && <GenericModule page={page as Exclude<PageKey,"overview"|"exploration"|"licenses">} onOpen={setSelected}/>}
      </main>
      {selected && <><button className="drawer-backdrop" onClick={()=>setSelected("")} aria-label="Close detail panel"/><DetailDrawer name={selected} onClose={()=>setSelected("")} exploration={page==="exploration"}/></>}
      {query && <div className="search-results">Searching national records for “{query}”</div>}
      <button className="floating-search" onClick={()=>{const q=prompt("Search licenses, operators, mines, targets or regions"); if(q){setQuery(q); setTimeout(()=>setQuery(""),2200)}}}>⌕</button>
    </div>
  );
}
