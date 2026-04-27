/* ┌─────────────────────────────────────────────────────────┐
   │ TOOL › Color Accessibility                              │
   │ WCAG 2.2 contrast checks (AA / AA Large+UI / AAA)       │
   │ Daltonism simulation (8 types)                          │
   └─────────────────────────────────────────────────────────┘ */

/**
 * @fileoverview Excel accessibility report generator for color palettes.
 * @see {@link https://www.w3.org/TR/WCAG22/#contrast-minimum|SC 1.4.3}
 * @see {@link https://www.w3.org/TR/WCAG22/#non-text-contrast|SC 1.4.11}
 *
 * TODO v3.0 — APCA: directional algorithm (fg/bg not symmetric).
 * Removed from WCAG 3.0 draft July 2023 — not legally binding as of 2026.
 */

import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import tinycolor from "tinycolor2";
import colorBlind from "color-blind";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Configuration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const REFERENCE_COLORS  = { black: "#000000", white: "#FFFFFF" };
const COL_WIDTHS        = [20, 20, 20, 26, 20, 26];
const WCAG_THRESHOLDS   = { AA: 4.5, AA_LARGE: 3, AAA: 7 };
const PASS_FILL         = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD6F5D6" } };
const FAIL_FILL         = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFD6D6" } };
const DALTONISM_TYPES   = [
  "protanopia", "deuteranopia", "tritanopia", "achromatopsia",
  "achromatomaly", "protanomaly", "deuteranomaly", "tritanomaly",
];
const HEADERS = ["", "", "AA (≥4.5)", "AA Grand texte/UI (≥3.0)", "AAA (≥7.0)", "Daltonisme (8 types)"];
const FOOTER  = `Pour référence :
Les ratios de contraste sont calculés selon la formule WCAG 2.2, standard légal en vigueur.
AA (≥4.5) : texte courant. AA Grand texte/UI (≥3.0) : grands textes (18pt+ normal, 14pt+ gras) et composants d'interface (boutons, icônes, bordures de champs), SC 1.4.3 et SC 1.4.11.
AAA (≥7.0) : confort maximal, non obligatoire.
Daltonisme : 8 types testés : protanopie, deutéranopie, tritanopie, achromatopsie, achromatomalie, protanomalie, deutéranomalie, tritanomalie. Indicatif, non requis par la réglementation en vigueur.
Généré avec HAT, Color Accessibility Tool v2.1, le ${new Date().toLocaleDateString()}`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Utils
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const luminance = (hex) => {
  const { r, g, b } = tinycolor(hex).toRgb();
  return [r, g, b]
    .map((v) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; })
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
};

const contrast = (a, b) => {
  const [L1, L2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (L1 + 0.05) / (L2 + 0.05);
};

const wcagCheck = (ratio, level) => {
  const pass = ratio >= WCAG_THRESHOLDS[level];
  return { text: `${ratio.toFixed(1)} ${pass ? "✓" : "✗"}`, fill: pass ? PASS_FILL : FAIL_FILL };
};

// Simulates both colors — not just fg — for accurate pair testing
const daltonCheck = (a, b) => {
  const pass = DALTONISM_TYPES.every((t) => contrast(colorBlind[t](a), colorBlind[t](b)) >= 4.5);
  return { text: pass ? "✓" : "✗", fill: pass ? PASS_FILL : FAIL_FILL };
};

const buildRow = (hex1, hex2) => {
  const ratio = contrast(hex1, hex2);
  const aa    = wcagCheck(ratio, "AA");
  const aaLarge = wcagCheck(ratio, "AA_LARGE");
  const aaa   = wcagCheck(ratio, "AAA");
  const dalton = daltonCheck(hex1, hex2);
  const qualityScore =
    (aa.text.includes("✓") ? 4 : 0) +
    (aaa.text.includes("✓") ? 3 : 0) +
    (dalton.text === "✓" ? 2 : 0);
  return { hex1, hex2, aa, aaLarge, aaa, dalton, ratio, qualityScore };
};

// Deduplicated unique pairs, sorted by quality then ratio
const buildPairs = (colors) => {
  const seen = new Set();
  return colors
    .flatMap((a, i) => colors.slice(i + 1).map((b) => ({ a, b, key: [a, b].sort().join("/") })))
    .filter(({ key }) => !seen.has(key) && seen.add(key))
    .map(({ a, b }) => buildRow(a, b))
    .sort((a, b) => (b.qualityScore - a.qualityScore) || (b.ratio - a.ratio));
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Excel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const generateExcel = async (palette) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Palette");

  const headerRow = ws.addRow(HEADERS);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  const addSection = (label, rows) => {
    const h = ws.addRow([label]);
    h.font = { bold: true, italic: true };
    ws.mergeCells(`A${h.number}:F${h.number}`);

    rows.forEach(({ hex1, hex2, aa, aaLarge, aaa, dalton }) => {
      const lbl = `${hex1} / ${hex2}`;
      const r   = ws.addRow([lbl, lbl, aa.text, aaLarge.text, aaa.text, dalton.text]);
      r.alignment = { horizontal: "center", vertical: "middle" };
      r.getCell("A").fill = { type: "pattern", pattern: "solid", fgColor: { argb: hex2.replace("#", "") } };
      r.getCell("A").font = { color: { argb: hex1.replace("#", "") } };
      r.getCell("B").fill = { type: "pattern", pattern: "solid", fgColor: { argb: hex1.replace("#", "") } };
      r.getCell("B").font = { color: { argb: hex2.replace("#", "") } };
      [["C", aa], ["D", aaLarge], ["E", aaa], ["F", dalton]].forEach(([col, check]) => {
        r.getCell(col).fill = check.fill;
      });
    });
  };

  const paletteHexes   = Object.values(palette.colors);
  const referenceHexes = Object.values(REFERENCE_COLORS);

  addSection("=== RATIO PALETTE ===", buildPairs(paletteHexes));

  const refPairs = paletteHexes
    .flatMap((hex) => referenceHexes.map((ref) => buildRow(hex, ref)))
    .sort((a, b) => (b.qualityScore - a.qualityScore) || (b.ratio - a.ratio));
  addSection("=== RATIO NOIR/BLANC ===", refPairs);

  const footerRow = ws.addRow([FOOTER]);
  footerRow.alignment = { horizontal: "left", wrapText: true };
  footerRow.height = 140;
  ws.mergeCells(`A${footerRow.number}:F${footerRow.number}`);

  ws.columns.forEach((col, i) => { col.width = COL_WIDTHS[i] ?? 14; });

  const fileName = `color_accessibility_${palette.name.replace(/\s+/g, "_")}.xlsx`;
  await wb.xlsx.writeFile(fileName);
  console.log(`Excel file generated: ${fileName}`);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Init
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const main = async () => {
  const paletteDir = path.resolve("./palettes");
  const files = fs.readdirSync(paletteDir).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    const palette = JSON.parse(fs.readFileSync(path.join(paletteDir, file), "utf-8"));
    await generateExcel(palette);
  }
};

main().catch(console.error);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// May your bugs be forever exiled to the shadow realm ✦
// HAT · 2026
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━