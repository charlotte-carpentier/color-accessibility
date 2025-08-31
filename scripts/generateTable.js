/* ===========================================================
   @SCRIPT - COLOR ACCESSIBILITY EXCEL GENERATOR
   - Generate Excel files for color accessibility testing
   - Includes WCAG AA/AAA checks
   - Daltonism simulation condensed into one column
   - Ready-to-send format for designers
=========================================================== */

import fs from "fs";
import path from "path";
import tinycolor from "tinycolor2";
import ExcelJS from "exceljs";
import colorBlind from "color-blind"; // Daltonism simulation

/* ===========================================================
   CONFIGURATION
=========================================================== */
const palettesDir = path.resolve("palettes"); // Folder containing JSON palettes
const daltonismTypes = ["protanopia", "deuteranopia", "tritanopia"]; // Daltonism types to test

/* ===========================================================
   MAIN FUNCTION
=========================================================== */
async function generateAccessibilityExcel() {
  const files = fs.readdirSync(palettesDir).filter(f => f.endsWith(".json"));

  if (files.length === 0) {
    console.error("No palette JSON files found in 'palettes/' folder.");
    process.exit(1);
  }

  for (const file of files) {
    const palettePath = path.join(palettesDir, file);
    const paletteData = JSON.parse(fs.readFileSync(palettePath, "utf-8"));
    const colors = paletteData.colors;
    const colorKeys = Object.keys(colors);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Accessibility");

    /* ===========================================================
       DEFINE COLUMNS
    ============================================================ */
    sheet.columns = [
      { header: "Foreground", key: "foreground", width: 20 },
      { header: "Background", key: "background", width: 20 },
      { header: "Contrast", key: "contrast", width: 10 },
      { header: "AA", key: "aa", width: 5 },
      { header: "AAA", key: "aaa", width: 5 },
      { header: "Daltonisme", key: "daltonisme", width: 10 }
    ];

    /* ===========================================================
       GENERATE ROWS FOR EACH COMBINATION
    ============================================================ */
    for (let i = 0; i < colorKeys.length; i++) {
      for (let j = 0; j < colorKeys.length; j++) {
        if (i === j) continue;

        const fgKey = colorKeys[i];
        const bgKey = colorKeys[j];
        const fg = colors[fgKey];
        const bg = colors[bgKey];

        const ratio = tinycolor.readability(fg, bg).toFixed(2);
        const wcag = {
          AA: ratio >= 4.5 ? "✅" : "❌",
          AAA: ratio >= 7 ? "✅" : "❌"
        };

        /* Daltonism simulation - single column ✅ if all types pass AA, ❌ if any fails */
        const daltonismResults = daltonismTypes.every(type => {
          if (typeof colorBlind[type] === "function") {
            const fgSim = colorBlind[type](fg);
            const simRatio = tinycolor.readability(fgSim, bg);
            return simRatio >= 4.5; // AA standard
          }
          return false;
        }) ? "✅" : "❌";

        sheet.addRow({
          foreground: fgKey,
          background: bgKey,
          contrast: ratio,
          aa: wcag.AA,
          aaa: wcag.AAA,
          daltonisme: daltonismResults
        });
      }
    }

    /* ===========================================================
       WRITE EXCEL FILE
    ============================================================ */
    const outputFileName = `color_accessibility_${paletteData.name.replace(/\s+/g, "_").toLowerCase()}.xlsx`;
    await workbook.xlsx.writeFile(outputFileName);
    console.log(`✅ Excel generated for palette: ${paletteData.name} -> ${outputFileName}`);
  }
}

/* ===========================================================
   RUN SCRIPT
=========================================================== */
generateAccessibilityExcel().catch(err => {
  console.error("Error generating accessibility Excel:", err);
});

/* ===========================================================
   EXPORT FOR TESTING OR EXTERNAL USE
=========================================================== */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateAccessibilityExcel };
}