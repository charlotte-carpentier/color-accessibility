/* ===========================================================
   @SCRIPT - COLOR ACCESSIBILITY EXCEL v2.0
   - Generate Excel table for palette accessibility
   - WCAG contrast checks (AA / AAA)
   - APCA scores (WCAG 3.0 future standard)
   - Daltonism checks (8 types)
=========================================================== */

import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import tinycolor from "tinycolor2";
import colorBlind from "color-blind";
import { APCAcontrast, sRGBtoY } from "apca-w3";

// =========================
// UTILS
// =========================

function luminance(hex) {
  const c = tinycolor(hex).toRgb();
  const rgb = [c.r, c.g, c.b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrast(fg, bg) {
  const L1 = luminance(fg);
  const L2 = luminance(bg);
  return L1 > L2 ? (L1 + 0.05) / (L2 + 0.05) : (L2 + 0.05) / (L1 + 0.05);
}

function wcagCheck(ratio, level = "AA") {
  if (level === "AA") {
    const pass = ratio >= 4.5 ? "✅" : "❌";
    return `${ratio.toFixed(1)} ${pass}`;
  }
  if (level === "AAA") {
    const pass = ratio >= 7 ? "✅" : "❌";
    return `${ratio.toFixed(1)} ${pass}`;
  }
  return `${ratio.toFixed(1)} ❌`;
}

function daltonPass(fg, bg) {
  const types = [
    "protanopia",
    "deuteranopia",
    "tritanopia",
    "achromatopsia",
    "achromatomaly",
    "protanomaly",
    "deuteranomaly",
    "tritanomaly"
  ];
  return types.every((type) => {
    const simFg = colorBlind[type](fg);
    const ratio = contrast(simFg, bg);
    return ratio >= 4.5;
  }) ? "✅" : "❌";
}

function apcaCheck(fg, bg) {
  const fgRgb = tinycolor(fg).toRgb();
  const bgRgb = tinycolor(bg).toRgb();
  const fgArray = [fgRgb.r, fgRgb.g, fgRgb.b];
  const bgArray = [bgRgb.r, bgRgb.g, bgRgb.b];
  const score = Math.abs(APCAcontrast(sRGBtoY(fgArray), sRGBtoY(bgArray)));
  const pass = score >= 75 ? "✅" : "❌";
  return `${score.toFixed(1)} ${pass}`;
}

// =========================
// EXCEL GENERATION
// =========================

async function generateExcel(palette) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Palette");

  const headers = [
    "Original (Text / Background)",
    "AA (≥4.5)",
    "AAA (≥7.0)",
    "Daltonism (8 types)",
    "APCA (≥75) - Future"
  ];
  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  const colors = palette.colors;
  const colorNames = Object.keys(colors);

  const referenceColors = {
    "black": "#000000",
    "white": "#FFFFFF"
  };

  // Generate palette combinations
  const paletteRows = [];
  for (const fgName of colorNames) {
    for (const bgName of colorNames) {
      if (fgName === bgName) continue;
      const fg = colors[fgName];
      const bg = colors[bgName];
      const ratio = contrast(fg, bg);
      const aa = wcagCheck(ratio, "AA");
      const aaa = wcagCheck(ratio, "AAA");
      const dalton = daltonPass(fg, bg);
      const apca = apcaCheck(fg, bg);

      let qualityScore = 0;
      if (aa.includes("✅")) qualityScore += 4;
      if (aaa.includes("✅")) qualityScore += 3;
      if (dalton === "✅") qualityScore += 2;
      if (apca.includes("✅")) qualityScore += 1;

      paletteRows.push([
        `${fg} / ${bg}`,
        aa,
        aaa,
        dalton,
        apca,
        ratio,
        qualityScore
      ]);
    }
  }
  paletteRows.sort((a, b) => {
    const qualityA = a[6] || 0;
    const qualityB = b[6] || 0;
    const ratioA = a[5] || 0;
    const ratioB = b[5] || 0;
    return qualityB - qualityA || ratioB - ratioA;
  });

  // Generate reference combinations (palette vs black/white)
  const referenceRows = [];
  const allColors = { ...colors, ...referenceColors };
  for (const fgName of Object.keys(allColors)) {
    for (const bgName of Object.keys(allColors)) {
      if (fgName === bgName) continue;
      if (!referenceColors[fgName] && !referenceColors[bgName]) continue;
      if ((fgName === "black" && bgName === "white") || (fgName === "white" && bgName === "black")) continue;
      const fg = allColors[fgName];
      const bg = allColors[bgName];
      const ratio = contrast(fg, bg);
      const aa = wcagCheck(ratio, "AA");
      const aaa = wcagCheck(ratio, "AAA");
      const dalton = daltonPass(fg, bg);
      const apca = apcaCheck(fg, bg);

      let qualityScore = 0;
      if (aa.includes("✅")) qualityScore += 4;
      if (aaa.includes("✅")) qualityScore += 3;
      if (dalton === "✅") qualityScore += 2;
      if (apca.includes("✅")) qualityScore += 1;

      referenceRows.push([
        `${fg} / ${bg}`,
        aa,
        aaa,
        dalton,
        apca,
        ratio,
        qualityScore
      ]);
    }
  }
  referenceRows.sort((a, b) => {
    const qualityA = a[6] || 0;
    const qualityB = b[6] || 0;
    const ratioA = a[5] || 0;
    const ratioB = b[5] || 0;
    return qualityB - qualityA || ratioB - ratioA;
  });

  const paletteHeaderRow = worksheet.addRow(["=== PALETTE COMBINATIONS ==="]);
  paletteHeaderRow.font = { bold: true, italic: true };
  worksheet.mergeCells(`A${paletteHeaderRow.number}:E${paletteHeaderRow.number}`);

  paletteRows.forEach((row) => {
    const excelRow = worksheet.addRow(row.slice(0, 5));
    excelRow.alignment = { horizontal: "center", vertical: "middle" };
    const originalCell = excelRow.getCell("A");
    const [origFg, origBg] = row[0].split(" / ");
    originalCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: origBg.replace("#", "") }
    };
    originalCell.font = { color: { argb: origFg.replace("#", "") } };
  });

  const refHeaderRow = worksheet.addRow(["=== TESTS WITH BLACK/WHITE ==="]);
  refHeaderRow.font = { bold: true, italic: true };
  worksheet.mergeCells(`A${refHeaderRow.number}:E${refHeaderRow.number}`);

  referenceRows.forEach((row) => {
    const excelRow = worksheet.addRow(row.slice(0, 5));
    excelRow.alignment = { horizontal: "center", vertical: "middle" };
    const originalCell = excelRow.getCell("A");
    const [origFg, origBg] = row[0].split(" / ");
    originalCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: origBg.replace("#", "") }
    };
    originalCell.font = { color: { argb: origFg.replace("#", "") } };
  });

  const footerText = [
    "For reference:",
    "WCAG contrast ratios calculated using WCAG 2.1 formula (current legal standard).",
    "APCA scores calculated using WCAG 3.0 algorithm (future standard, not yet legally binding).",
    "Daltonism includes 8 types: protanopia, deuteranopia, tritanopia, achromatopsia, achromatomaly, protanomaly, deuteranomaly, tritanomaly.",
    `Generated with Color Accessibility Tool v2.0 on ${new Date().toLocaleDateString()}`
  ].join("\n");
  const footerRow = worksheet.addRow([footerText]);
  footerRow.alignment = { horizontal: "left", wrapText: true };
  footerRow.height = 100;
  worksheet.mergeCells(`A${footerRow.number}:E${footerRow.number}`);

  worksheet.columns.forEach((col) => { col.width = 30; });

  const fileName = `color_accessibility_${palette.name.replace(/\s+/g, "_")}.xlsx`;
  await workbook.xlsx.writeFile(fileName);
  console.log(`Excel file generated: ${fileName}`);
}

// =========================
// MAIN
// =========================

async function main() {
  const paletteDir = path.resolve("./palettes");
  const files = fs.readdirSync(paletteDir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const palettePath = path.join(paletteDir, file);
    const palette = JSON.parse(fs.readFileSync(palettePath, "utf-8"));
    await generateExcel(palette);
  }
}

main().catch(console.error);
