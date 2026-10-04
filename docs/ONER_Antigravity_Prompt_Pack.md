# ONER UI Rebuild: Antigravity Prompt Pack

How this pack is organised:

- **PART 0 — MASTER BRIEF.** Save it into the repo as `docs/ONER_DESIGN_SPEC.md` and paste it as the first message. It is the single source of truth.
- **PART 1 — PHASE PROMPTS (Phase 0 to Phase 6).** Paste one at a time, only after the previous phase passes its acceptance checks.
- Reference file for the agent: `design-reference/oner-directions.html` (the approved mockups, boards A and C). The agent must read it for the exact Convergence Chain geometry and animation.

---

# PART 0 — MASTER BRIEF (paste first)

## 0.1 Role and objective

You are the lead product designer and senior front-end engineer for **ONER**, a Community-to-Industry Environmental Intelligence & Accountability Network (hackathon prototype). Your job is to **completely redesign the UI/UX and visual language** of the existing app so it looks like a new category of premium environmental intelligence software, not a generic AI dashboard.

The approved direction is a combination of two mockups in `design-reference/oner-directions.html`:

- **Board A "Horizon":** a daylight "Field" top half (citizen world, serif headline), a single 1px Horizon line, and a dark "Control" bottom half (instrument world) containing the **Convergence Chain**.
- **Board C "Instrument":** starts from the result. The **Reduction Wedge** with the big number, plus a case register where each row has a mini evidence bar.

The combined product is called **Evidence Intelligence OS** and has one core object, the **Case**, one core shape, the **Convergence Chain**, and one core line, the **Horizon**.

**The story the UI must tell within 30 seconds of a judge seeing it:**
A citizen sees pollution → reports it → ONER fuses six independent evidence signals → AI identifies the likely cause → industry takes action → MRV verifies the measured result → the environmental impact returns to the community.

## 0.2 Hard constraints (do not break)

1. **Do not change backend behaviour or API contracts.** FastAPI + the ML layer stay as they are. Existing endpoints must keep working: `/api/overview`, `/api/analytics`, `/api/anomalies`, `/api/forecast`, `/api/root-cause/{id}`, `/api/simulate`, `/api/recommendations`, `/api/carbon`, `/api/climate`.
2. **Keep every existing route and feature reachable.** You may restyle, restructure layouts and add routes (e.g. `/case/[id]`), but nothing that works today may disappear. This includes the 3D Twin, Sync Telemetry, the report flow, the Environmental Pact, the Intervention simulator and Ask ONER.
3. Stack stays: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Recharts (only where a custom SVG is not specified), Framer Motion. **GSAP and Lenis only on `/experience`.** Three.js stays only for the existing 3D Twin and `/experience`. Do not add component libraries.
4. **Honesty rules (non-negotiable):** the product is a prototype using seeded/simulated data. See §0.15.
5. Work on a **new git branch**. Commit after each phase. Run typecheck, lint and build after each phase.

## 0.3 What is wrong with the current UI (fix all of this)

The current UI is a dark dashboard of bordered cards. Specific problems to remove:

- **Card inside card inside card.** Almost every section is a bordered rounded panel containing more bordered panels (see Overview, Facility Operations, Carbon & MRV, Government).
- **ALL-CAPS monospace micro-labels on almost everything** (eyebrows like "COMMUNITY-TO-INDUSTRY ACCOUNTABILITY NETWORK", "CASE LIFECYCLE & PUBLIC OUTCOME SUMMARY"). This reads as templated.
- **Uppercase mono buttons** ("FILE CITIZEN REPORT", "INSPECT SEEDED CASE →", "SIMULATE SETPOINT →"). Use sentence-case sans buttons.
- **Many equal-weight KPI cards in a row** (four-up and six-up rows). No hierarchy: nothing is the hero.
- **Too many pills and badges** (status chips on nearly every row).
- **The Convergence Chain is currently a stack of cards** (Overview). It must become the actual converging **SVG shape** specified in §0.8.
- **Charts are decorative filled area charts** with no meaning (Analytics, Overview). Every chart must show a normal band, an anomaly point, or a projected region.
- **A long sidebar with seven groups** and a facility status box that competes with the content.
- **A debug "FPS" counter overlay is visible in the bottom-left.** Remove it from all builds. It may only appear when the URL contains `?debug=1`.
- The same dark atmosphere is used for citizens and operators. Citizens must get the **Field** atmosphere (§0.9).

## 0.4 Design principles

1. **One screen, one question, one number, one action.** Each screen has a single hero object.
2. **Shape carries meaning.** If a visual does not encode data or state, delete it.
3. **Lime is earned.** The accent `#A8C83A` appears only on confirmed/verified/healthy things and the primary action (plus the Wedge). It must cover roughly 5% of any viewport or less.
4. **Structure from hairlines and spacing, not boxes.** Panels are allowed only at the top level. Never nest a bordered panel inside a bordered panel. Use a 1px rule or whitespace to subdivide.
5. **Restraint is the luxury.** No gradients as decoration, no glows, no glassmorphism, no purple, no cyberpunk, no particles, no decorative 3D, no emoji.
6. **Sentence case everywhere.** Mono is for numbers, IDs and units only. No uppercase eyebrow labels, no "A · B · C" meta strings, no trailing "→" on buttons.
7. Photography and numbers are the interface. Prefer a big, clear number with a plain-language sentence over a dense grid of tiles.

## 0.5 Design tokens

Create `src/styles/tokens.css` (imported in the global stylesheet) and expose them to Tailwind v4 via `@theme`. Components must use **semantic tokens only**, never raw hex values.

```css
[data-atmosphere="control"] {
  --bg:#080A09; --surface:#0E1110; --raised:#141817;
  --line:#242A27; --line-strong:#333B37;
  --ink:#F1F3EE; --ink-2:#929A95; --ink-3:#626A65;
  --accent:#A8C83A; --accent-hi:#C4DF61; --accent-ink:#A8C83A;
  --accent-dim:rgba(168,200,58,.16); --on-accent:#0B1105;
  --warn:#E0A63A; --crit:#E5584B; --info:#6FA3C7;
}
[data-atmosphere="field"] {
  --bg:#F4F3EC; --surface:#FBFAF5; --raised:#FFFFFF;
  --line:#DAD8CC; --line-strong:#B9B7A9;
  --ink:#1B211C; --ink-2:#4F5851; --ink-3:#7B837C;
  --accent:#A8C83A; --accent-hi:#C4DF61; --accent-ink:#4F6A0E;
  --accent-dim:rgba(168,200,58,.28); --on-accent:#121A0A;
  --warn:#8F5E0B; --crit:#B03A2E; --info:#2F6C99;
}
```

**Rules for colour use**
- Lime (`--accent`) = confirmed, verified, healthy, primary action. There is **no separate green**.
- `--warn`, `--crit`, `--info` only for state, as a 2px rule, a small mark or text colour. Never as large fills.
- Evidence types are told apart by **icon and position, never colour**.
- **Simulated/projected data = a 45° hatch** (4px pitch, `--ink-3` at ~35% opacity). Hatch means nothing else.
- On Field, use `--accent-ink` when the accent is used as text or a stroke on the paper background.

**Typography** (load with `next/font/google`)
- **Geist** (sans) for all UI, **Geist Mono** for numbers/IDs/units, **Newsreader** (serif) only for Field headlines and human sentences.
- Numerals are always mono with `font-variant-numeric: tabular-nums`.
- Control scale (px size/line-height): small 12/16, body 13/20, base 14/22, h3 16/24 (500), h2 20/28, h1 28/34 (light 300 where large), display 44/48, numeral-xl 72/72 (mono 300), numeral-hero 112/104 (mono 300, used for 14.2 only).
- Field scale: body 17/27, small 14/20, h2 28/34 Newsreader, h1 40/44 Newsreader, statement 56/60 Newsreader.
- No bold above weight 500. Line length under 75 characters for body text.

**Spacing, radii, borders**
- 4px base unit: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Radii: 2px for nodes/chips/buttons/inputs in Control, 4px for the few top-level panels, 12px for Field sheets, pill only for the camera shutter and toggles.
- Borders are 1px `--line`. Border vocabulary: **solid = real, dashed = awaiting, double rule = verified, hatch = simulated.**
- No shadows in Control. Field may use one soft shadow on the capture/consent sheet only.

## 0.6 The seven primitives (everything is composed from these)

1. **Horizon:** the 1px line. Divides Field from Control, carries the seed out and the impact back, and acts as the level switch on a case.
2. **Convergence Chain:** see §0.8.
3. **State:** one mark vocabulary used everywhere: **Awaiting** (dashed square), **Received** (half-filled), **Corroborated** (solid lime), **Verified** (double-rule). Plus a **Conflict** flag (amber slash). "Simulated" is a hatch overlay, not a state.
4. **Rail:** a row of stations with one current. One component, two scales: the Loop Spine (platform loop) and the ActionRail (Acknowledge → Investigate → Simulate → Apply → Verify → Resolve). The Investigation's five questions use it too.
5. **Signal:** a time series with a learned-normal band, an anomaly mark and a hatched projection. Modes: trace, bands (health), distribution (anomaly), wedge (MRV).
6. **Case:** the central object, with three levels on one URL: **Field · Control · Impact** (§0.10).
7. **Wedge:** the Reduction Wedge, the Impact mark and the only thing allowed to be large and lime.

Compositions built from these (not new primitives): Delta (two Signals plus a difference column), Reasoning Trace (the Chain's pipe grammar reused as an alluvial diagram), Register (a table of compact chains), Map Lens, Statement (Field sentence plus one number).

Target: about 20 reusable components in total. Do not create a large component zoo.

## 0.7 Layout shell and navigation

Replace the current seven-group sidebar with:

- **Top bar (56px):** ONER wordmark (the letters "ONER" with a hairline horizon through the baseline and a small lime dot on it), a **role switcher** (Community · Industry · Government), a compact **facility chip** (Orion Refining Complex, plain status text, no box), the demo tag, and small icon buttons for **Sync telemetry** and **3D Twin**. A quiet "Ask ONER" entry sits on the right.
- **Per-role primary navigation (max four items), as a text row under the top bar, not a sidebar:**
  - Community: Report · My reports · Impact
  - Industry: Facility · Cases · Signals · Ask ONER
  - Government: Region · Cases · Facilities · Ask ONER
- A **"More" menu** lists every other route so nothing is lost (Environmental Pact, Carbon & MRV, Intervention, AI Investigation, Analytics, Impact & Scale, Cinematic Experience).
- Every Control screen with a workflow shows a **Rail** directly under the nav.
- Keep all existing route paths working. Where a route becomes a section of the Case (Investigation, Intervention, Carbon & MRV), keep the route as a focus-mode deep link into that section.

**Existing route to new home mapping (confirm in Phase 0 against the real codebase):**

| Existing label | Role in the new design |
|---|---|
| Report Pollution | Field flow (`/report`) |
| Community | Field "My reports" list (`/community`) |
| Overview | Home for logged-in app (Facility/Region summary) plus the marketing Home `/` |
| Analytics | "Signals" tab (`/analytics`) |
| AI Investigation | Case → Cause section, focus mode (`/investigation`) |
| Intervention | Case → Options section, focus mode (`/intervention` or `/simulator`) |
| Facility Operations | Industry home (`/industry`) |
| Environmental Pact | `/government/pact` and linked from Industry |
| Carbon & MRV | Case → Verify section, focus mode (`/carbon`) |
| Command Center | Government home (`/government`) |
| Ask ONER | `/ask` |
| Impact & Scale | `/impact` (business model page, restyle only, see §0.14) |
| Cinematic Experience | `/experience` |

## 0.8 The Convergence Chain (core component)

Build one `<Chain>` component with three variants: **Full**, **Compact** (56px strip for registers) and **Vertical** (mobile, and the citizen's Simple Thread). The exact geometry and animation are in `design-reference/oner-directions.html` (function `chain()` and the `.p`, `.f`, `.late` CSS). **Read that file first and port the geometry exactly.** Re-implement it as a typed React component (pure SVG, Framer Motion for the draw/fill animation), not by pasting innerHTML.

**Six evidence nodes** (uniform height, fixed order), data from the seeded case COMM-2026-00421. Use the existing copy from the current UI for the readings:

| # | Node | Weight (possible) | Earned | Reading (use existing seed copy) |
|---|---|---|---|---|
| 1 | Resident photo | 10 | 4.2 | Flue stack smoke opacity >25% |
| 2 | Consensual GPS / facility proximity | 20 | 19.2 | 0.42 km from North Train (±4.2 m) |
| 3 | ISO timestamp / temporal alignment | 15 | 14.1 | within ±12 s synchronisation |
| 4 | Facility telemetry | 30 | 28.5 | Combustion temp +18.4 °C / NOx +31.4% |
| 5 | Ambient PM2.5 sensor | 15 | 13.8 | Downwind AQI spike +117% |
| 6 | Historical baseline | 10 | 9.6 | Exceeds 90-day seasonal percentile |

Earned values sum to **89.4**. The weakest link is the photo (4.2 of 10), and that is the point: **photo is not truth.** Never hide it.

**Geometry (viewBox 1180 × 330 for Full):**
- Each node is a 160 × 40 rectangle, 2px radius, at `x=0`, `y = i*54 + 4`. Outline = possible weight. A fill from the left, `width = 160 * earned/possible`, shows what was earned. Name on the first text line (12px sans), reading and `earned/possible` on the second (11px).
- Each node has a **pipe** (cubic Bézier) to the Event Core at `(440,166)`. **Stroke width = weight × 0.2px** (30 → 6px, 10 → 2px), so weighting is readable from the shape.
- **Event Core:** a 130 × 320 rectangle at `x=440`, outlined in accent, containing `89.4` (Geist Mono 300, 44px) and the label "corroborated". Below the number show the Weight Strip (a 100-unit bar segmented by weights with the earned portion filled).
- **Trunk:** a 3px line from the core to the terminal. It does not exist until the claim is corroborated.
- **Stations** (14px squares on the trunk): Likely cause (Burner refractory fouling), Action (Damper trim 1.042), Verified (four signals agree).
- **Terminal:** open brackets containing `14.2` and `tCO₂e per day`.

**States per node and station:** Awaiting (dashed outline, no fill), Received (partial fill in `--accent-dim`), Corroborated (lime left bar and fill), Verified (double rule), Conflict (amber slash, still counted in the score). Simulated data gets the 45° hatch over its fill.

**Interaction:** hover/focus a node dims the other five pipes to 30% and shows `+28.5 pts` at the junction with the core. Click/Enter opens a right-hand drawer with source, timestamp, raw value, how it was scored, and a simulated flag if relevant. Keyboard: Tab through the six nodes, then the core, then the stations; arrow keys move between nodes. State is always also a text label (never colour alone).

**Mobile (<720px) Vertical variant:** nodes become full-width rows (56px) where the **horizontal width of the fill** shows earned/possible, pipes become a vertical bus on the left merging into a **sticky Event Core bar at the bottom**, and the trunk continues downward.

**Data:** build an adapter `toChainState(case, evidence)`. Pull what the existing endpoints provide (anomaly score, root cause, corroboration) and fall back to the seed file (§0.15) for any field the API lacks. The chain's visual state must be a **pure function of the data**, derived by `deriveChainState`.

## 0.9 Two atmospheres: Field and Control

| | **Field** (citizen) | **Control** (industry, government, analyst) |
|---|---|---|
| Question | "What happened with my report?" | "What does the system know, and what do we do?" |
| Look | Paper `#F4F3EC`, Newsreader sentences, large photography | Dark `#080A09`, Geist + mono numbers, dense |
| Routes | `/report`, `/community`, citizen case view, citizen Impact level | `/industry`, `/government`, `/investigation`, `/intervention`, `/carbon`, `/analytics`, `/ask`, case Control level |

Rules:
1. Atmosphere follows **role and route** (set `data-atmosphere` on the root layout wrapper), not the OS dark-mode setting.
2. The two atmospheres meet in only **three moments:** the Home threshold, the Case level switch, and the report-submit handoff.
3. Transition along the Horizon with a **clip-path wipe**. Never cross-fade through grey, and never interpolate colour tokens.
4. Shared elements (the seed dot, the case ID, the chain) keep their geometry and swap skin (Framer Motion shared `layoutId`).
5. Field numerals use the same Geist Mono as Control, so a number looks the same on both sides of the Horizon.

## 0.10 The Case: one object, three levels

One route: `/case/[id]` with `?level=field|control|impact`. If a case dossier route already exists (e.g. "Open Case Dossier"), reuse and extend it.

**The level switch is on the Horizon** in the case header: a 1px line with three stops, `Field · Control · Impact`, and a lime dot on the current one. Click or drag the dot.

| Level | Content | Chain form |
|---|---|---|
| **Field** | The citizen's photo, one status sentence in Newsreader, a six-step Simple Thread (Received → Checked → Evidence found → Facility notified → Action taken → Result measured), and "What we checked" (3 plain rows). | Vertical, evidence collapsed |
| **Control** | The full Chain (pinned as Compact on scroll), then five sections tied to its stations: **Evidence · Cause · Options · Action · Verify**. Each section can open in focus mode. | Full |
| **Impact** | A Statement and the Wedge, the Return (reporter notified, +50 Community Impact Points), 14.2 tCO₂e/day and 5,183 tCO₂e/year. | Compact strip on top |

- Impact is a **level, not an atmosphere**: it renders in the viewer's atmosphere (a serif sentence plus one number for a citizen; the Wedge and verification rows for an operator).
- **Defaults:** citizens open at Field (and at Impact once verified). Industry and Government open at Control. A verified case opens at Impact for everyone.
- **Transitions:** Field ↔ Control uses the Horizon wipe (640 ms). Control → Impact has no wipe: the chain contracts to its strip and the Wedge expands from the Verify station (600 ms).
- The case header shows the Case ID in mono, a short title, one status chip, the current stage, and a **"T+ since report"** timer.

## 0.11 Score visualisations (no circular gauges anywhere)

| Score | Rendering |
|---|---|
| **Anomaly score 0.884** | **Isolation Strip:** horizontal strip 0–1 showing the distribution of the facility's own normal scores as 2px bars, with one tall lime tick at 0.884 and a hairline "flag line (demo)". No % sign. Caption: "How unusual this is compared with learned normal." |
| **Corroboration 89.4%** | **Weight Strip:** one bar of 100 units segmented by weights (30, 20, 15, 15, 10, 10), earned portion filled, with the exact `28.5 / 30` rows beneath. Caption: "How strongly independent evidence agrees. Not the probability that a report is true." |
| **Root-cause confidence 99.4%** | **Five State marks** in a row (Weak → Exceptional), rung reached filled, label "Very strong evidence support", the number secondary and muted. Caption: "Evidence support, not a calibrated probability." |
| **Environmental Health Index 87.3** | Index at 72px with **no % sign**, over a 90-day Signal in bands mode (faint labelled zones), plus a one-line "top contributors" text. |
| **Reporter trust 87%** | One sentence plus State marks (e.g. "4 of 5 recent reports were corroborated"). Visible to Industry and Government only. Citizens see a friendly version: "4 of your 5 reports helped investigators." |

## 0.12 Motion system (six motions only)

Everything else is instant or a 120 ms fade. Nothing loops. Respect `prefers-reduced-motion` (replace all with a 120 ms cross-fade and set final states instantly). Use transform, opacity, clip-path and SVG path only. Easings: standard `cubic-bezier(.2,0,0,1)`, emphasis `cubic-bezier(.16,1,.3,1)`. No springs or bounce.

| # | Motion | Spec |
|---|---|---|
| 1 | **Seed** | A 12px lime dot travels along the Horizon (800 ms, emphasis). Used for the report entering ONER and for the return line. |
| 2 | **Fill** | Evidence arriving / any State change: node fill grows from the left 900 ms; its pipe draws toward the core 1200 ms (`pathLength`); nodes arrive 300 ms apart; the core number counts up (tabular mono) from 0 to 89.4 over about 1.6 s. |
| 3 | **Seal** | Case becomes corroborated: pipes brighten together 200 ms and narrow by 1px, the core border turns solid lime, the trunk draws forward 600 ms. |
| 4 | **Branch** | Simulator fork morph 600 ms with values counting up from "Now". Investigation's Reasoning Trace ribbons draw left to right, then rejected causes settle to 35% opacity. |
| 5 | **Wedge** | MRV: verification rows close one by one (180 ms stagger); the wedge fills from the baseline mean down to the post-action mean over 900 ms; 14.2 and 5,183 count up over 1.2 s; the return line travels back along the Horizon to the original photo. |
| 6 | **Level** | Field ↔ Control Horizon wipe 640 ms; Control → Impact wedge expansion 600 ms; shared elements persist. |

**Home hero autoplay (about 7 s, plays once, then idle with a "Replay" text link):** 0–2 s headline and the photo seed on the Horizon; 2–4 s seed enters, six slots fill, core counts to 89.4; 4–5.5 s trunk draws, cause and action stations resolve; 5.5–7 s terminal closes at 14.2 and the return line travels back along the Horizon to the photo.

**Signature moment: report submit handoff (about 2.4 s):** on "File report" (a) the photo plate shrinks and its centre becomes a 12px lime seed (400 ms); (b) a Horizon line draws across the screen and the seed travels along it (800 ms), with a light haptic on mobile via `navigator.vibrate(10)` where supported; (c) the Field → Control wipe follows the seed (about 700 ms); (d) the seed lands in the Citizen report slot of the chain, which goes Awaiting → Received; (e) the other five slots shift to Received in a 250 ms stagger ("ONER is checking independent evidence"). The citizen rests in the Control view for about 4 s, then settles into the **Field level of the case**.

## 0.13 Responsive strategy (three layout modes)

- **Narrow (<720px):** Field is the primary design target (single column, bottom tab bar Report · My reports · Impact, bottom sheets, full-bleed camera, one decision per screen, ≥48px targets, offline-tolerant draft). Control on narrow is **read-and-act only**: case queue, Case with the Vertical chain, Acknowledge/Approve. No dense analytics.
- **Medium (720–1199px):** two-pane for Field; Control uses the Vertical chain or a horizontally scrollable Compact; Map becomes a link; drawers instead of side panels.
- **Wide (≥1200px, content max 1680px):** full layouts.

Test at 390, 768, 1280 and 1440px widths.

## 0.14 Screen specifications

For each screen: one hero object, one answer sentence above it, one primary action.

### Home `/` (first screen = the 30-second story)
Top to bottom (follow Board A in the reference file):
1. **Top bar**, transparent over the hero: wordmark, Experience, For industry, For government, lime button "Report pollution".
2. **Field band (daylight):** Newsreader 54–56px headline **"A community report becomes verified environmental action."** Definition line: "ONER turns community pollution reports into evidence-backed environmental action." A simple CSS/SVG scene (stacks, plume, hills) on the right with a small "Your photo, [time]" plate carrying a lime "location shared" dot. This is the seed.
3. **The Horizon**, with "Field" and "Control" labels at the ends.
4. **Control band:** an **actor line** directly above the chain: Community · ONER · Industry · Government · Community (positioned over the chain regions; the loop ends where it began). Then the **Full Chain** (autoplay), then six beats under it: **Seen · Fused · Explained · Acted · Verified · Returned**, each with one plain line (A resident photographs smoke / Six signals checked / Cause found / Facility applies the fix / Result measured / Impact reaches the resident).
5. A tag: "Representative case COMM-2026-00421. Demo data, simulated telemetry." Beneath the chain show **three ghost Compact chains** in different states (awaiting, partial, verified) labelled "Every report follows this path" so judges see it is one case of many.
6. A **return line** (thin lime) leaves the terminal and travels back along the Horizon to the photo.
7. Below the fold, only three things: the **fusion toggle** ("One photo is a claim. Six signals are evidence." Six weighted toggles that drive the core number live: photo only → 4.2, all six → 89.4), the **three doors** (I saw something → /report, I run a facility → /industry, I oversee a region → /government), and an **honesty footer**.
Primary CTA: Report pollution. Secondary: Watch the film (links to /experience).

### Report `/report` (Field atmosphere)
Five steps, full-screen on mobile, framed as writing a **field note** (a numbered note that gains one line per step). A slim five-tick progress thread at the top. Keep all existing functionality (categories, severity, camera/upload, GPS with consent, details, submit, reward). Steps:
1. **What did you see?** Six large tappable rows with glyphs: Smoke / Emissions, Water pollution, Chemical odour / fumes, Fugitive dust plume, Industrial noise / drone, Chemical leak / spill.
2. **Show us.** Full-bleed camera/upload. Photo plate with caption ("Plate 1 · Your photograph · time"). On-device three-pip quality check (sharpness, exposure, subject visible), replacing the current "Toggle Quality Flag" button. "Continue without a photo" is allowed and simply scores lower.
3. **Where.** Plain-language consent sheet before the browser permission prompt (what is captured, who sees it, you are in control; mark the policy as demo). Map with draggable pin, accuracy ring, and a **bearing wedge** the user can drag toward the source. Keep existing lat/long/accuracy/timestamp fields but show them as quiet mono metadata, not four boxed tiles.
4. **Details.** Severity as a four-step segmented control (Low, Medium, High, Critical, each with a plain description), "When" chips, landmark note, description with voice input, reporter identity. **Do not pre-fill a real-looking personal name by default**; keep "N. Sharma (verified resident)" only as a demo scenario.
5. **File it.** The finished note beside a miniature chain (three slots the citizen supplied are filled, the other three read "ONER will check"). Primary: **File report**. Secondary: Edit.
The existing "Demo scenarios #1 Smoke / #2 Water" switch moves into a small "Demo scenarios" menu in the top bar. On submit play the **seed handoff** (§0.12).
Language: never "complaint" or "ticket". Reward line: "Earn +50 Community Impact Points when investigators corroborate your report."

### Community `/community` (Field)
Greeting plus a quiet points counter. A **journal list** of reports (newest first): each row has a photo thumbnail, one plain status sentence, and a Compact Simple Thread. Existing cases to keep as seed rows: COMM-2026-00421 (Industry action, +50), 00398 (Government review, +30), 00405 (Resolved, +50), 00376 (Corroborating), 00412 (Industry action). A right column "Your area" shows local AQI (68, moderate) and the verified reduction in the neighbourhood. Replace the four KPI cards with one quiet line. Selecting a report opens `/case/[id]` at the Field level.
Points copy: "Points reward reports that help investigators."

### Case `/case/[id]`
See §0.10. Control level sections, in order: **Report** (photo, map with bearing wedge, time, category, severity, description), **Evidence** (the six-signal ledger with earned/possible), **Cause** (summary plus link to focus mode), **Action** (the ActionRail with owner and setpoint), **Verify** (MRV summary), then **Impact**. A left gutter with small station glyphs connected by a hairline so the page itself reads like the trunk. A collapsed Activity section replaces the right-hand ledger. Role-aware primary CTA: Industry = next ActionRail step; Government = Request update; Citizen = Show me the data.

### Industry `/industry` (Control)
Story: **Problem → Cause → Options → Action → Result → Value.**
- One facility line (Orion Refining Complex, Health trace for index 87.3 with a 90-day Signal in bands mode, no % sign, plus "Attention" as plain text).
- The **active case as a six-part reading** top to bottom: Problem (Compact chain plus "NOx is 31.4% above normal at F-101"), Cause (sentence plus five-mark support strip, with a small inline equipment drawing), Options (three aligned mini Delta rows: Do nothing, Damper trim, other), Action (the full-width **ActionRail**), Result (compact Wedge once measured, otherwise an empty outline), Value (CO₂e reduction, energy and cost savings as three inline numbers with "Potential creditable reduction" and the not-issued note).
- Below: a **Register** of other cases (compact chains) and a **Signals** section with three Signals (NOx, thermal deviation, energy) with normal band, anomaly mark and hatched forecast.
- The Pact thresholds table becomes a compact status line plus a link to `/government/pact`. Penalty values stay but tagged "illustrative".
- Tone is constructive: "Action requested", never "violation". Show a visibility line: "Visible to: you · regulator · reporter (summary)".
- Keep the "3D Twin" and "Sync telemetry" actions as small top-bar buttons.

### Government `/government` (Control)
Question as the page title: **"Which environmental cases need attention?"** with four inline numbers (Open, Stalled, Corroborated, Verified this period), not cards.
- Main row: **Case Register** (hero, 7 columns, rows are Compact chains with stage, stall time T+, facility, owner, sorted by stalled-longest, one-click Stalled filter) and **Map Lens** (5 columns, about 420px tall, restrained basemap, layers Reports / Corroborated / Facility risk, two-way hover linking with the register).
- Lower row, two columns: **Facility risk** (ranked list, a small Signal trend each; seed facilities: Orion Refining Complex, Apex Chemical Logistics, Tata Power Unit 3 Cogen, Deccan Clinker Grinding Terminal) and **Restoration** (aggregate Wedge, "Verified reduction this period").
- Selecting any case opens a right **Case Drawer** with the chain and activity. The audit trail lives in the drawer. Pact detail moves to `/government/pact`.
- Primary: Open case. Secondary: Request response.

### Investigation `/investigation` (flagship; Control)
Five questions as a Rail at the top; each section is **answer-first** (question small, answer in one large sentence, one visual, optional "why we think so"):
1. **What was unusual?** Answer: "NOx ran 31.4% above normal, with furnace temperature 18.4 °C off its usual pattern." Visual: Signal trace with normal band and anomaly mark, plus the 0.884 Isolation Strip. Optional expander "How ONER isolates it".
2. **Is the observation supported?** Answer: "Six independent signals agree: 89.4." Visual: the Full Chain with Weight Strip and one "what if" toggle (turn evidence off, watch the core recompute).
3. **How did ONER reason about it?** Visual: **Reasoning Trace**, an alluvial diagram: observations (left, text rows) → candidate causes (right, text rows), joined by ribbons whose thickness equals rule support. **No boxes or arrow nodes.** The winning cause's ribbons are lime; **rejected causes stay visible at 35% opacity with dashed ribbons and a one-line "why not"**. Tag: "Deterministic domain logic".
4. **What is the likely cause?** Statement: "Burner refractory fouling is reducing thermal efficiency." Support strip (99.4, labelled as evidence support, not probability), with three short lists: Supports this / Still unknown / Would change this.
5. **What should we do?** "Set the damper trim to 1.042." One-row Delta preview, primary **Simulate this**, secondary Assign to engineer.
Keep the existing detected-anomalies list as a quiet list on the left (or a drawer on narrow screens) and keep the "Score definitions & methodology" link.

### Intervention / Simulator (Control, a decision instrument)
- Top: a single row of six current readings (NOx, CO₂e, Energy, Cost, Payback, Abatement). Two thin lines fork from it into two columns headed **Do nothing** and **Damper trim 1.042**.
- Three columns × six aligned rows: left = do-nothing value and a small hatched trajectory (amber where it drifts out of the normal band); **centre = the Delta Rail** (differences at 72px mono, e.g. NOx −28.6 kg/day, CO₂e −14.2 t/day, with a hairline bar extending toward the better side; **this is the highest-contrast element**); right = intervention value and trajectory in lime.
- One setpoint slider above the Delta Rail (1.000–1.100, 1.042 marked recommended), recomputing through `/api/simulate`.
- Bottom verdict strip: one sentence, a hatched "Simulated, not yet measured" tag, **Apply intervention** (confirmation, written to the audit trail) and Save scenario.
- After the action is applied and measured, the hatched projections resolve to **solid measured values** on the same screen (the simulator's promise and the MRV result are the same numbers).
- The six-scenario portfolio (Peak-hour load shifting, Optimize furnace operation, Optimize compressor system, Renewable electricity procurement, Cooling system, Water leakage) stays as a ranked list below, with the bar chart replaced by aligned horizontal bars.

### Carbon & MRV `/carbon` (the Reduction Wedge)
Follow Board C in the reference file.
- Header with an MRV status chip: use **"MRV ready"** (never "Verified credits").
- **Hero chart (full width, about 380px):** one time series with a grey baseline window, a vertical rule labelled "Damper trim 1.042 applied", a lime post-action window, a dashed baseline-mean line, and the **lime area between the baseline mean and the post-action mean (the wedge)**. Four plain-sentence zone labels along the bottom: **Before: average level · Action: damper trim 1.042 applied · After: new average · Verified: four independent signals agree.**
- The number lives in the wedge: **14.2** at 112px mono with "tCO₂e per day, measured", then **5,183** at 72px with "tCO₂e per year, annualized", under the label **"Potential creditable reduction"**, with the disclosure "14.2 × 365 = 5,183. Assumes sustained operation at post-action levels." Secondary: NOx 28.6 kg/day.
- A verification list of five rows using State marks: optical CEMS, thermal camera, smoke opacity, telemetry agreement, third-party audit readiness, with one verdict line.
- Keep the existing "MRV data sources & sensor traceability" table (eight feeds with Available / Simulated / Pending) as a clean hairline table.
- **The Return** at the foot of the page: the seed dot back at the end of the Horizon, the citizen's photo thumbnail and one sentence: "Reported by a resident. Measured result: 14.2 tCO₂e less per day. Reporter notified · +50 Community Impact Points."
- Always-visible honesty line: "Potential creditable reduction is an estimate, not an issued carbon credit." The eligibility checklist (applicable methodology, eligibility assessment, independent third-party verification, registry process) is collapsed beneath it, all "Not started". Keep the illustrative valuation tagged "illustrative".
- Primary: Export MRV evidence pack (demo). Secondary: View case.

### Analytics `/analytics` ("Signals", Control)
Filter row (facility, signal group, 7/30/90 days). A large multi-signal Signal with linked brushing, anomaly overlay and forecast cone. Cross-sensor correlation shown as a **triangular heatmap** in a single lime-on-neutral scale (keep the r values: Energy→CO₂ 0.998, Production→Energy 0.969, Temperature→Cooling demand 0.852, Furnace temp→Natural gas 0.682, Compressor load→Electricity 0.562). Keep the stack emissions and cooling water charts but as Signals with a normal band. Remove the filled-area decoration. Every chart has a tag naming its place in the chain (e.g. "Telemetry · Evidence 4 of 6").

### Ask ONER `/ask`
Conversation in the centre. Each answer is **Answer + evidence references + highlighted nodes** in a pinned mini chain on the right (clicking a reference highlights the node). Keep the suggested-question chips (Primary risk, Priority fix, Intervention impact, Furnace F-101 anomaly, MRV readiness, Water cooling trend). Context pin at the top (case or facility). Primary: Send. Secondary: Open in simulator.

### Environmental Pact `/government/pact`
A clean hairline table of thresholds (NOx 100 limit / 131.4 active, SOx 80 / 64.2, PM2.5 60 / 73.6, PM10 100 / 92.1, Carbon intensity 450 / 468.5, Water recovery 75 / 81.2, Thermal 5 / 8.2) with plain status text (Conflict, Compliant, Stalled) instead of coloured pills, a three-party diagram (Community, Industry, Government) and an **"Illustrative"** tag on every penalty and incentive.

### Impact & Scale `/impact`
This is the business-model page. Restyle it only. Keep the four model blocks, the calculator and the INR figures, all tagged **"Illustrative economic model"**. Remove the four-up KPI card row styling: show the calculator outputs as a single line of large mono numbers separated by hairlines.

### Experience `/experience`
See Phase 6.

## 0.15 Data consistency and honesty rules

1. Create **one seed/constants file** (e.g. `src/lib/seed.ts`) that is the single source of truth for the demo case: case ID, timestamps, evidence weights/earned values, scores (0.884, 89.4, 99.4, 87.3, 87%), cause, setpoint (1.042), NOx and CO₂e deltas (28.6 kg/day, 14.2 tCO₂e/day, 5,183 tCO₂e/year). Every screen reads from it unless the API returns a value. **Do not silently change backend data.**
2. **Canonical report time:** pick one (default **03 Oct 2026, 09:42 IST**) and use it on every screen. Today the UI shows 09:42 IST, 14:02 IST, 14:28:10 UTC and 09:56 pm IST for the same case. The "14:07" in the reference mockup is a placeholder.
3. **Canonical equipment name:** Furnace F-101 (some Investigation text says "Furnace #2").
4. **Verification language:** the case is **"MRV ready"** with third-party verification **pending**. Remove "Verified annualized abatement", the "VERIFIED" badge on carbon claims, and the conflicting "Audit ready" vs "Audit pending". "Verified" may only describe the *measured* result in the demo (post-action CEMS agreement), never credits.
5. **Number reconciliation (report in Phase 0, do not guess):** the baseline of 104.2 tCO₂e/day does not agree with other screens (facility 124.6 t per 7 days on Overview, 544.6 t per 30 days on Analytics, "annual baseline 6,754 tCO₂e/yr" where 104.2 × 365 ≈ 38,033, and "Optimize furnace operation −245.4 t/yr" on Intervention vs the recommended −5,183 t/yr). List every mismatch you find in the Phase 0 report. For the demo, label the scope of each number (for example "Furnace F-101 train" vs "Facility dataset") and propose a fix. Do not change API data without approval.
6. Always-visible global tag: **"Demo data · Simulated telemetry · Prototype workflow"**. Simulated values are hatched. Penalties, incentives and the INR valuation are tagged "illustrative". Never imply live CEMS, live government systems, real facilities, enforcement or issued carbon credits.
7. Never call the corroboration score a probability, and never call the anomaly score a percentage.

## 0.16 Accessibility and performance

- Contrast at least 4.5:1 for text in both atmospheres; use `--accent-ink` for lime text on Field.
- Visible keyboard focus (2px lime outline, 2px offset) on every interactive element. Full keyboard operation of the chain and the level switch.
- State is never colour-only (always a mark or label).
- Respect `prefers-reduced-motion`. No layout shift on load. Lazy-load Three.js and GSAP only on the routes that use them.
- Remove the FPS overlay from non-debug builds.

## 0.17 Things you must not do

Generic SaaS cards in rows of four; cards inside cards; giant KPI tiles; circular gauges or donut charts; uppercase mono eyebrows; uppercase mono buttons; purple or blue-purple gradients; rainbow semantic colours; glow, neon or glassmorphism; floating particles; meaningless 3D; fade-and-slide-up on every section; hover-lift on every card; emoji; stock "AI sparkle" iconography; decorative charts with no normal band or anomaly meaning; copying the old UI's structure "but darker".

## 0.18 Definition of done

- A stranger shown the Home page for 30 seconds can narrate: *a resident reported smoke, ONER checked evidence, found a cause, the factory fixed it, it was measured and reported back.*
- The Convergence Chain is a real SVG with weighted pipes (not a list of cards) and plays the 7-second hero sequence.
- Every old route still works with real data; no console errors; typecheck, lint and build pass.
- Screenshots reviewed at 1440, 1280, 768 and 390px for every restyled screen.
- No uppercase mono eyebrows, no nested cards, no circular gauges, no FPS overlay.

---

# PART 1 — PHASE PROMPTS (paste one at a time)

> Before every phase: "Read `docs/ONER_DESIGN_SPEC.md` and `design-reference/oner-directions.html`. Follow them exactly. Do not change backend behaviour."
> After every phase: run typecheck, lint and build; start the app and capture screenshots at 1440px and 390px of every screen you touched; list deviations from the spec; commit.

## Phase 0 — Audit and plan (no code changes)

Goal: understand the existing codebase and produce a migration plan.

Tasks:
1. Map every route, layout, shared component and data hook in the repo. Note which API endpoint feeds which screen.
2. Confirm the existing-route mapping table in §0.7 (and the exact current paths of Intervention/Simulator, Impact & Scale, Pact, Experience and the case dossier).
3. Find the FPS overlay and where the sidebar/nav lives.
4. Produce the **number reconciliation report** from §0.15 item 5 (every mismatch, with file and line, and your proposed fix). Do not apply data changes.
5. List which current components can be reused and which will be replaced, and the planned new file structure (tokens, primitives, chain, case, field, control, motion).
6. Output the plan as `docs/MIGRATION_PLAN.md` and wait for approval.

## Phase 1 — Foundation

Goal: the design system and the shell, with no screen redesign yet.

Tasks:
1. Add fonts (Geist, Geist Mono, Newsreader) with `next/font`; add `tokens.css` and the Tailwind v4 `@theme` mapping from §0.5; implement `data-atmosphere` on the root layout with route-based assignment.
2. Build the seed constants file (§0.15) and an `AtmosphereProvider`.
3. Build the new shell: top bar with role switcher, facility chip, demo tag, Sync telemetry and 3D Twin icon buttons; per-role text navigation; the "More" menu listing every route. Remove the old sidebar. Remove the FPS overlay (debug only).
4. Build primitives: `Horizon`, `State` (marks), `Rail` (with Loop Spine and ActionRail variants), `DemoTag`, `Statement`.
5. Restyle buttons, inputs, tables and links to the new rules (sentence case sans, 2px radius, hairlines, lime primary button with `--on-accent` text).
Acceptance: every existing route still renders and works inside the new shell; no uppercase mono eyebrows remain in the shell; both atmospheres render correctly on a test route.

## Phase 2 — Convergence Chain and the Home page

Goal: the centrepiece and the 30-second story.

Tasks:
1. Build `<Chain>` (Full, Compact, Vertical) exactly as in §0.8 using the geometry and animation from `design-reference/oner-directions.html`; implement `deriveChainState`, `toChainState`, the evidence drawer, hover/focus behaviour, keyboard navigation, and the Weight Strip.
2. Implement the **Fill** and **Seal** motions and the 7-second autoplay with a Replay link and reduced-motion fallback.
3. Build the Home page per §0.14: Field band, Horizon, Control band with actor line, Full Chain, six beats, return line, three ghost chains, fusion toggle, three doors, honesty footer.
4. Build the score primitives from §0.11 (`IsolationStrip`, `WeightStrip`, support strip, health trace).
Acceptance: Home passes the 30-second narration test; the chain is a true SVG with pipe widths proportional to weight; the fusion toggle recomputes the core live (photo only 4.2, all six 89.4); the Compact chain renders correctly in a list.

## Phase 3 — Case, Report flow and Community

Goal: the central object and the citizen experience.

Tasks:
1. Build `/case/[id]` with the level switch on the Horizon (Field / Control / Impact), the Horizon wipe, the shared-element transitions, the pinned Compact chain on scroll, and the five Control sections.
2. Rebuild `/report` as the five-step field-note flow (§0.14) in the Field atmosphere, including the camera/upload step with photo quality pips, the consent sheet, the map with bearing wedge, and the Seed handoff animation into the case.
3. Rebuild `/community` as the journal list and wire it to the Field level of the case, including honest negative states ("We couldn't confirm this yet").
Acceptance: submitting a report plays the full seed handoff and lands on the case; Field ↔ Control ↔ Impact switching works on one URL; the mobile report flow is usable one-handed at 390px.

## Phase 4 — Investigation, Simulator and MRV

Goal: the three flagship analytical screens.

Tasks:
1. **Investigation:** the five-question Rail, answer-first sections, Signal with the Isolation Strip, the Reasoning Trace (alluvial; rejected causes visible and subdued), the support strip, the recommendation. Keep the anomalies list and methodology link.
2. **Simulator:** stem, fork, three-column balance with the Delta Rail as the focus, setpoint slider wired to `/api/simulate`, verdict strip, apply/confirm, and the hatched→solid transition once measured.
3. **Carbon & MRV:** the Reduction Wedge hero chart, number-in-wedge treatment (14.2, 5,183), verification rows, eligibility checklist, data-sources table, the Return, honesty line.
4. Implement the **Branch** and **Wedge** motions.
Acceptance: the Delta Rail is clearly the highest-contrast element; the Wedge sequence reads without documentation; no screen uses a circular gauge; all carbon language follows §0.15.

## Phase 5 — Industry, Government and remaining pages

Tasks:
1. **Industry** as the six-part narrative with the ActionRail as backbone, Signals section, Register of other cases.
2. **Government** with the Case Register and Map Lens (two-way hover), Facility risk, Restoration, the Case Drawer with the audit trail, and `/government/pact`.
3. Restyle **Analytics** (Signals + heatmap), **Ask ONER** (answer with evidence references and pinned mini chain), **Impact & Scale** (restyle only).
Acceptance: Government leads with the register and stalled cases, the map is a lens and not the page; Industry reads Problem → Value top to bottom; no nested cards remain anywhere.

## Phase 6 — Experience, responsive pass and polish

Tasks:
1. **`/experience`:** a scroll-driven cinematic sequence (GSAP ScrollTrigger + Lenis) of about 75–90 seconds: nature → industry → signals → pollution → citizen camera frame → intelligence → action → restoration. Use placeholder footage or CSS/SVG scenes if no video exists (leave clear slots for real footage). WebGL is limited to a subtle contour/heat overlay and sensor dots, with no particles. End by expanding the camera frame to full viewport and morphing it into the Case page's photo node, then navigating to `/case/COMM-2026-00421?from=experience`. Include a persistent "Skip to product" control, poster-frame fallback for reduced motion/no WebGL, and audio off by default.
2. **Responsive QA** at 390, 768, 1280, 1440px for every screen, fixing overflow, tap targets and the Vertical chain.
3. **Polish pass:** remove any leftover uppercase eyebrows, nested cards, stray borders, circular gauges or decorative glow; verify focus rings, contrast, reduced-motion behaviour and that lime stays under about 5% of each viewport.
4. Final report: a checklist against §0.18 with screenshots.

---

*End of pack.*
