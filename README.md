# Cyberpunk RED – Charaktererschaffung (Core Rules)

Offline-fähiges Fan-Werkzeug zur Charaktererschaffung nach dem
**Cyberpunk RED Core Rulebook**. Der Ablauf folgt exakt den Flowcharts auf
**Buchseite 41** (Streetrat / Edgerunner – 8 Schritte) und **Buchseite 42**
(Complete Package – 6 Schritte).

## Benutzung

Einfach `index.html` im Browser öffnen – **kein Server, kein Build-Step,
kein Internet nötig** (Google-Fonts sind nur progressive Enhancement).
Fortschritt wird automatisch im `localStorage` gespeichert (Autosave).

### Die drei Methoden

| Methode | STATS | Skills | Ausrüstung |
|---|---|---|---|
| 🎲 **Streetrat** | 1d10 auf dem Rollen-Template (S. 73–77) | fix (S. 86–87) | Presets S. 98/103/117 + 500 eb Extra |
| ⚡ **Edgerunner** | 1d10 je STAT gegen das Template (S. 77) | 86 Punkte auf 20 Rollen-Skills (2–6, x2 doppelt) | wie Streetrat |
| 💰 **Complete Package** | 62 Punkte kaufen (je STAT 2–8) | 86 Punkte frei (13 Basic-Skills min. 2) | 2.550 eb + 800 eb nur Fashion |

### Besonderheiten

- **Kultursprache**: aus dem Lifepath immer gratis auf **Language 4** (S. 45/85).
- **Streetrat/Edgerunner**: „oder“-Preset-Optionen per Radio wählen; 500 eb
  Extra-Budget, aber **keine Cyberware** kaufbar (S. 98/117).
- **Complete Package**:
  - 800 eb **nur** für Fashion/Fashionware (Rest verfällt; Überschuss zieht vom Hauptbudget).
  - Optional **„Seele verkaufen“** (S. 118): +1.500 eb nur für Cyberware +
    gratis Neural Link + Employer-Wahl.
  - Cyberware-Slots/Foundational-Voraussetzungen werden nur **gewarnt**, nicht blockiert.
  - **Humanity unter 0 = Cyberpsychose** → Weiter zum Bogen wird blockiert.
- **Granaten** haben im Grundbuch keinen Preis → nur in Presets, sonst Night
  Market (S. 344). **Exotic Weapons** nur mit SL-Freigabe (S. 95).
- **EMP effektiv** = ⌊Humanity/10⌋ (S. 80); Rüstungsmalus = höchster Malus
  getragener (gekaufter) Rüstung auf REF/DEX/MOVE (MOVE min 0).
- **HP** = 10 + 5×⌈(BODY+WILL)/2⌉, Seriously Wounded = ⌈HP/2⌉, Death Save = BODY.

### Charakterbogen

Drucken (Strg+P), JSON exportieren/importieren – alles ohne Internet.

**📄 Offiziellen RTG-Bogen befüllen:** Der Button auf dem Bogen-Screen lädt
den offiziellen `RTG-CPR-CharacterSheet-Fillable.pdf` (in `js/sheet-pdf-b64.js`
eingebettet), befüllt alle passenden Formularfelder per `pdf-lib` und lädt
das fertige PDF herunter – ebenfalls **komplett offline**.

**🎨 Alternativer Bogen (getrennt):** Für **Solo** und **Medtech** bietet der
Bogen-Screen zusätzlich das Design „Cyberpunk-Sheet (getrennt)“ (Quelle:
`cyberpunk_sheets_getrennt/`). Er wird direkt aus dem Charakterzustand im
Browser gerendert (Original-Hintergründe + Formularfelder, inkl.
nachgerechneter BASE/SUM-Werte und Checkboxen) und kann gedruckt (Querformat,
„Hintergrundgrafiken“ aktivieren) oder als JSON exportiert werden. Über
**„📄 PDF (ausfüllbar)“** erzeugt derselbe Screen außerdem ein echtes
AcroForm-PDF mit denselben Hintergründen und Formularfeldern – bereits
vorbefüllt, aber am PC weiter bearbeitbar. Auch dieses Design funktioniert
**komplett offline**; die Felddaten liegen eingebettet in
`js/sheet-alt-data.js`, die Hintergrundbilder in `js/sheet-alt-bg-b64.js`.
Für die übrigen acht Rollen bleibt nur der offizielle RTG-Bogen verfügbar
(mit Hinweis in der Design-Auswahl).

Was wohin gefüllt wird:

- Identität (Handle, Rolle, Role Ability + Rang), alle STATs inkl.
  LUCK MAX/CURRENT und EMP/EMP MAX (EMP = effektiv nach Humanity-Verlust),
  HP/Seriously Wounded/Death Save, Humanity, Reputation/IP = 0 (S. 194).
- Alle Skills mit Rang + Total (STAT + Rang); STAT-Kästchen werden über die
  gemeinsam genutzten Feldnamen automatisch mitgefüllt. Choose-Skills als
  „Basis (Spezialisierung)“, Kultur-Sprache in eine freie Language-Zeile.
- Waffen (max. 6 Zeilen, DMG/Mag/ROF aus dem Grundbuch), Armor Body/Head/Shield
  mit SP + PENALTY (gekaufte überschreiben Presets), Ammo & Fashion als
  Sammelzeile, Gear (max. 18 Zeilen), Cash = Restbudget je Methode.
- Kompletter Lifepath (Persönlichkeit, Stil, Werte, Familie, Freunde/Feinde/
  Liebschaften, Ziele) + Rollen-Lifepath, Housing/Rent/Lifestyle.
- Cyberware-Seite 3: Verteilung nach Kategorie auf die Bogenzeilen
  (Fashionware FW1–7, Neuralware, Optics/Audio je Seite, Limbs je Seite,
  Internal/External/Borgware), Foundational-Häkchen (Link/Audio/Eye/Arm/Leg),
  Überlauf rechts → links.
- Bekannte Grenzen: nur 6 Waffen- und 18 Gear-Zeilen, je 2 freie
  Language/Local-Expert-Zeilen; Überzähliges erzeugt Warnungen (Konsole +
  Hinweiszähler im Notes-Feld). `∑` wird als „(Sigma)“ geschrieben, da der
  Bogen die Standard-PDF-Schrift WinAnsi nutzt.

## Dateien

```
index.html        – Screen-Gerüst (9 Screens, Stepper, Würfellog, Toast)
css/style.css     – Cyberpunk-Dark-Theme + Print-CSS für den Bogen
js/data.js        – alle Regeldaten (STATs, Rollen, Skills, Waffen, Cyberware, Budgets …)
js/lifepath.js    – Lifepath-Tabellen S. 45–69 (allgemein + alle 10 Rollen)
js/app.js         – komplette Logik (Flow, Budgets, Validierung, Bogen)
js/sheet-pdf.js   – Mapping State → RTG-Bogen-Felder + PDF-Befüllung
js/sheet-pdf-b64.js – der offizielle RTG-Bogen als Base64 (~1,9 MB)
js/sheet-alt.js   – Mapping State → alternativer Bogen (Solo/Medtech) + Rendering
js/sheet-alt-data.js – Feld-/Seiten-/Berechnungsdaten der getrennten Bögen (eingebettet)
js/sheet-alt-bg-b64.js – Hintergrundseiten der getrennten Bögen als JPEG/Base64
js/sheet-alt-pdf.js – erzeugt daraus ein vorbefülltes, ausfüllbares AcroForm-PDF
js/vendor/pdf-lib.min.js – pdf-lib 1.17.1 (MIT), UMD-Bundle, offline
test-harness.html – 85 automatisierte Tests (Regressionsschutz)
```

## Tests

`test-harness.html` im Browser öffnen – die 85 Tests laufen automatisch
(alle drei Methoden komplett, Budgetrechnungen, Humanity, Preset-Auswahl,
Shop-Käufe, Save/Load, PDF-Feld-Mapping inkl. eingebettetem Bogen sowie
alternativer Solo-/Medtech-Bogen inkl. Verfügbarkeits-Fallback und
PDF-Erzeugung). Kopfzeile muss am Ende **„85 PASS / 0 FAIL“** zeigen.
Headless-Check (PDF-Erzeugung braucht etwas Zeit):

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new `
  --virtual-time-budget=30000 --dump-dom `
  "file:///C:/.../CPR/test-harness.html" | Select-String "PASS |FAIL "
```

## Rechtliches

Inoffizielles Fan-Werkzeug. *Cyberpunk RED* © R. Talsorian Games – alle
Regelbegriffe in Englisch wie im Original. Keine Regeltexte 1:1 abgedruckt,
nur Werte/Tabellen für die Charaktererschaffung. Der eingebettete
Charakterbogen ist das offizielle, frei von R. Talsorian Games vertriebene
`RTG-CPR-CharacterSheet-Fillable.pdf` (unverändert). Die PDF-Befüllung nutzt
[pdf-lib](https://github.com/Hopding/pdf-lib) (MIT-Lizenz).
