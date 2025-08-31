# Color Accessibility Tool

This Node.js tool generates a **complete Excel table** for any color palette to check accessibility.

It includes:

* WCAG contrast ratios (AA and AAA)
* Text color readability against background colors
* Daltonism simulation (Protanopia, Deuteranopia, Tritanopia) summarized in one column

This tool is intended for designers and developers to quickly validate color accessibility and generate a shareable report for graphic teams.

## Project Structure

```text
color-accessibility/
├─ palettes/           # JSON files with your color palettes
│   └─ palette1.json
├─ scripts/
│   └─ generateTable.js
├─ package.json
├─ README.md
└─ LICENSE.md
```

## Adding Palettes

Create a JSON file in `palettes/` with your palette. Example:

```json
{
  "name": "Palette Graphiste",
  "colors": {
    "primary": "#0055FF",
    "secondary": "#FF5500",
    "text": "#111111",
    "background": "#FFFFFF",
    "accent": "#00FFAA"
  }
}
```

You can create as many palettes as needed.

## Running the Script

1. Install dependencies:

  ```bash
  npm install tinycolor2 exceljs color-blind
  ```

2. Run the generator:

  ```bash
  npm start
  ```

3. Excel output:

* An Excel file is generated in the project root folder, named:

```text
color_accessibility_<palette_name>.xlsx

```

* Each row includes:

  * Foreground and background color names
  * Contrast ratio
  * WCAG AA / AAA compliance (✅/❌)
  * Daltonism column: ✅ if all types (Protanopia, Deuteranopia, Tritanopia) pass AA, ❌ otherwise

## Accessibility Calculations

* **Contrast ratio** follows WCAG 2.1:

$$
\text{Contrast ratio} = \frac{L1 + 0.05}{L2 + 0.05}
$$

* L1 = relative luminance of lighter color

* L2 = relative luminance of darker color

* **WCAG AA**: ratio ≥ 4.5

* **WCAG AAA**: ratio ≥ 7

* **Daltonism**: the foreground color is simulated for each type, then contrast with the actual background is recalculated; ✅ if all types pass AA, ❌ if any fails.

## Notes

* This tool is for **design/testing purposes only**. Do not include it in production templates.
* Focus on text vs. background combinations first; decorative or icon colors can be tested secondarily.
* You can extend the script to simulate all 8 types of color blindness if needed.
* For quick visual checking, you can also use plugins like **Stark** for Figma or online tools like Accessible Colors: [https://accessible-colors.com](https://accessible-colors.com)

## References

* [WCAG Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)
* [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
* [Color Blindness Simulator](https://www.color-blindness.com/coblis-color-blindness-simulator/)
