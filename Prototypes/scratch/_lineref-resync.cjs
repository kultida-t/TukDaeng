/* FSP-040 helper — refresh `~NNNN` prototype line refs in FrontOffice spec docs.
 * Usage: node Prototypes/scratch/_lineref-resync.cjs [--apply]
 * Default = dry-run report. --apply rewrites the spec files.
 */
const fs = require("fs");
const cp = require("child_process");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const IDX = path.join(ROOT, "Prototypes/fo-flow/index.html");
const SPEC_DIR = path.join(ROOT, "FrontOffice");
const APPLY = process.argv.includes("--apply");

const SRC = fs.readFileSync(IDX, "utf8").split("\n");
const SCRIPT_START = SRC.findIndex(l => l.includes("<script")) + 1; // 1-based-ish boundary CSS|JS

function buildMap(fromCommit) {
  const diff = cp.execSync(
    `git -C "${ROOT}" diff -U0 ${fromCommit} HEAD -- Prototypes/fo-flow/index.html`,
    { maxBuffer: 128 * 1024 * 1024 }
  ).toString();
  const hunks = [];
  for (const m of diff.matchAll(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/g)) {
    hunks.push({ oa: +m[1], oc: +(m[2] ?? 1), na: +m[3], nc: +(m[4] ?? 1) });
  }
  hunks.sort((x, y) => x.oa - y.oa);
  return function mapLine(L) {
    let shift = 0;
    for (const h of hunks) {
      if (L < h.oa) break;
      if (L <= h.oa + h.oc - 1) return h.na + shift;
      shift += h.nc - h.oc;
    }
    return L + shift;
  };
}
const mapFrom4f0 = buildMap("4f0e0ad");
const mapFrom7a2 = buildMap("7a255ee");

function normToken(raw) {
  let t = raw.trim();
  if (t.includes("(")) t = t.slice(0, t.indexOf("("));
  if (/^[A-Za-z_$][\w$]*$/.test(t)) return { kind: "ident", t };
  if (/^\.[\w-]{2,}$/.test(t)) return { kind: "class", t };
  if (/^\[.*\]$/.test(t)) return { kind: "literal", t: t.slice(1, -1) };
  if (t.includes("{")) t = t.slice(0, t.indexOf("{")).trim();           // report:pick:{u} -> report:pick:
  if (/^[A-Za-z_$][\w$]*\.[\w$.]+$/.test(t)) return { kind: "dotident", t }; // state.feedTab
  if (/^[\w-]+="[^"]*"$/.test(t) || t.length >= 4) return { kind: "literal", t };
  return { kind: "weak", t };
}

function hitsFor(re, isDef) {
  const hits = [];
  for (let i = 0; i < SRC.length; i++) if (re.test(SRC[i])) hits.push(i + 1);
  return hits;
}
function litHits(t) {
  const hits = [];
  for (let i = 0; i < SRC.length; i++) if (SRC[i].includes(t)) hits.push(i + 1);
  return hits;
}

/* returns {hits, def} — def=true when resolved via definition pattern */
function occurrences(nt) {
  const t = nt.t, esc = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (nt.kind === "weak") return { hits: [] };
  if (nt.kind === "ident") {
    for (const [re, def] of [
      [new RegExp(`function ${esc}\\s*\\(`), true],
      [new RegExp(`(?:const|let|var)\\s+${esc}\\b`), true],
      [new RegExp(`\\b${esc}\\s*=`), false],
      [new RegExp(`\\b${esc}\\(`), false],
    ]) {
      const h = hitsFor(re, def); if (h.length) return { hits: h, def };
    }
    return { hits: litHits(t) };
  }
  if (nt.kind === "dotident") {
    const h = litHits(t); if (h.length) return { hits: h };
    return { hits: litHits(t.split(".")[0]) };
  }
  if (nt.kind === "class") {
    const bare = t.slice(1);
    const re = new RegExp(`[.\\s"']${bare.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s"'.:)]`);
    const h = hitsFor(re); if (h.length) return { hits: h };
    return { hits: litHits(bare) };
  }
  // literal — tolerant: collapse flex spacing around : and =
  let h = litHits(t);
  if (h.length) return { hits: h };
  const flex = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\?\s*[:=]\s*/g, m => `\\s*${m.includes(":") ? ":" : "="}\\s*`));
  h = hitsFor(flex); if (h.length) return { hits: h };
  const lastAttr = t.match(/([\w-]+="[^"]*")(?!.*[\w-]+=")/);
  if (lastAttr) { h = litHits(lastAttr[1]); if (h.length) return { hits: h }; }
  const noBraces = t.replace(/\{[^}]*\}/g, "");
  if (noBraces !== t && noBraces.length > 3) { h = litHits(noBraces); if (h.length) return { hits: h }; }
  return { hits: [] };
}

const REF_RE = /~(\d+)(?:\s*[–—-]\s*(\d+))?/g;
const TOK_RE = /`([^`]+)`/g;
const tokensOf = line => [...line.matchAll(TOK_RE)].map(m => ({ t: m[1], i: m.index }));

function anchorCandidates(line, refIdx) {
  const lp = line.lastIndexOf("(", refIdx);
  const rp = line.indexOf(")", refIdx);
  const inParen = lp !== -1 && rp !== -1 && lp < refIdx && refIdx < rp;
  // clause start: after previous ")" or "; " or ", " — tokens in clause, in order
  let cs = 0;
  for (const sep of [")", "; ", ", "]) {
    const p = line.lastIndexOf(sep, refIdx);
    if (p !== -1 && p + sep.length > cs && p < refIdx) cs = p + sep.length;
  }
  if (inParen) {
    const inner = line.slice(lp + 1, rp);
    const k = (inner.match(/~\d+/g) || []).length;
    if (k > 1) {
      const rank = (inner.slice(0, refIdx - lp - 1).match(/~\d+/g) || []).length;
      const toks = tokensOf(line).filter(t => t.i >= cs && t.i < lp);
      if (toks.length >= k) return [toks[toks.length - k + rank].t];
      if (toks.length) return [toks[toks.length - 1].t];
      return [];
    }
  }
  const toks = tokensOf(line).filter(t => t.i >= cs && t.i < refIdx);
  return toks.map(t => t.t);
}

const DUR_SKIP = /^\d+(\.\d+)?\s*(ms|s|px|%|x|min|hr|ชม|วิ|ตัว|วินาที|นาที)/;
const FILES = fs.readdirSync(SPEC_DIR).filter(f => f.endsWith(".md"));
const report = [], review = [];
for (const f of FILES) {
  const fp = path.join(SPEC_DIR, f);
  const lines = fs.readFileSync(fp, "utf8").split("\n");
  const map = f === "11_SOCIAL_MODULE.md" ? mapFrom7a2 : mapFrom4f0;
  let changed = 0;
  const out = lines.map((line, li) => {
    REF_RE.lastIndex = 0;
    if (!REF_RE.test(line)) return line;
    REF_RE.lastIndex = 0;
    const parts = [];
    let cur = 0;
    const usedLines = new Set();
    for (const m of line.matchAll(REF_RE)) {
      const [whole, a, b] = m;
      const oldA = +a, oldB = b ? +b : null;
      const after = line.slice(m.index + whole.length);
      if (oldA < 100 || /^\s*(ms\b|s\b|%|px\b|x\b|min\b|ชม|วิ|ตัว|วินาที|นาที|\.)/.test(after)) {
        parts.push(line.slice(cur, m.index + whole.length));
        cur = m.index + whole.length;
        continue;
      }
      const mapA = map(oldA), mapB = oldB ? map(oldB) : null;
      let newA = mapA, how = "map", info = "", flag = false;
      const cands = anchorCandidates(line, m.index);
      let resolved = null, usedTok = null;
      // score every candidate by its closest-hit distance to mapA — pick the
      // token whose occurrences land nearest the mapped region (least drift)
      let bestScore = Infinity;
      for (const raw of cands) {
        const nt = normToken(raw);
        if (nt.kind === "weak") continue;
        const occ = occurrences(nt);
        if (!occ.hits.length) continue;
        const sameSide = occ.hits.filter(h => mapA >= SCRIPT_START ? h >= SCRIPT_START : h < SCRIPT_START);
        const pool = sameSide.length ? sameSide : occ.hits;
        let best = pool[0], bd = Math.abs(pool[0] - mapA);
        for (const h of pool) { const d = Math.abs(h - mapA); if (d < bd) { bd = d; best = h; } }
        if (bd < bestScore) { bestScore = bd; resolved = { line: best, pool, hits: occ.hits.length, def: occ.def }; usedTok = raw; }
      }
      if (resolved && usedLines.has(resolved.line)) {
        // anchor already used by an earlier ref on this line — try the next unused hit, else map
        const alt = resolved.pool.filter(h => !usedLines.has(h)).sort((x, y) => Math.abs(x - mapA) - Math.abs(y - mapA))[0];
        if (alt) { resolved = { ...resolved, line: alt }; info = "alt-hit"; flag = true; }
        else { resolved = null; info = "dup-anchor->map"; flag = true; }
      }
      if (resolved) {
        const far = Math.abs(resolved.line - mapA) > 250;
        if (far) { flag = true; info += ` FAR(${resolved.line} vs map ${mapA}, hits=${resolved.hits}${resolved.def ? ",def" : ""})`; }
        newA = resolved.line; how = "anchor";
        usedLines.add(resolved.line);
      } else if (cands.length) { flag = true; if (!info) info = `MISSING(${cands[0]})`; }
      let newB = null;
      if (oldB) {
        const wOld = oldB - oldA, wMap = mapB - mapA;
        if (wMap >= 0 && wMap <= Math.max(400, wOld * 3)) newB = newA + wMap;
        else { newB = newA + wOld; info += " end-clamped"; flag = true; }
      }
      const drift = newA - oldA;
      const rec = `${f}:${li + 1}  ~${a}${b ? "–" + b : ""} -> ~${newA}${newB ? "–" + newB : ""}  [${how} ${usedTok || cands[0] || "-"}] ${info} drift=${drift}`;
      report.push(rec);
      if (flag) review.push(rec + `\n     spec: ${line.trim().slice(0, 160)}\n     @anchor ${resolved ? resolved.line : "-"}: ${resolved ? SRC[resolved.line - 1].trim().slice(0, 110) : "-"}\n     @map ${mapA}: ${SRC[mapA - 1] ? SRC[mapA - 1].trim().slice(0, 110) : "?"}`);
      parts.push(line.slice(cur, m.index), `~${newA}${newB ? "–" + newB : ""}`);
      cur = m.index + whole.length;
    }
    parts.push(line.slice(cur));
    const nl = parts.join("");
    if (nl !== line) changed++;
    return nl;
  });
  if (APPLY && changed) fs.writeFileSync(fp, out.join("\n"));
  if (changed) report.push(`--- ${f}: ${changed} lines updated ${APPLY ? "(written)" : "(dry)"}`);
}
console.log("===== REVIEW (flagged) =====\n" + review.join("\n"));
console.log("\n===== ALL =====\n" + report.join("\n"));
