# Cyberpunk RED Sheets – Bilder und Felddaten getrennt

Pro Sheet (medtech / solo):

| Datei | Inhalt |
|---|---|
| `*_page-N.webp` / `.png` | Hintergrundbild pro Seite (200 dpi, ohne Formularfelder, ohne eingetragene Werte) |
| `*_background.pdf` | Vektor-Hintergrund ohne Formularfelder (falls du lieber PDF statt Bild willst) |
| `*_fields.json` | Alle Felder: Name, Seite, Position/Größe in % (Ursprung oben links), Typ, Ausrichtung, Schriftgröße, Farbe, Checkbox-Wert |
| `*_sheet.html` | Fertiger Beispiel-Renderer, der Bilder + JSON zusammensetzt |

## fields.json
- `pages[]`: Seitengröße in pt und Dateiname des Hintergrunds
- `fields[]`: `x_pct, y_pct, w_pct, h_pct` -> direkt als CSS `left/top/width/height` in Prozent nutzbar
- `calculations[]`: aus den PDF-JavaScripts übernommen, z. B. `{"target":"CON BASE","op":"SUM","inputs":["CON LVL","CON MOD","CON STAT"]}`
  (`SUM` = Summe, `PRD` = Produkt; bei einem Eingang ist PRD ein Kopieren, z. B. `CON STAT` = `WILL`)

## Automatisch befüllen
In `*_sheet.html` (Pfad zu den Bildern über `BG_DIR` anpassen):
```js
sheet.setValues({ "NAME1": "V", "INT": 6, "REF": 7, "NEURALINK CHECK1": true });
sheet.getValues();   // alle Eingaben als JSON (ohne berechnete Felder)
```
Die Feldnamen entsprechen 1:1 den PDF-Feldnamen.
