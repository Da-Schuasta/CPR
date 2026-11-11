/* ============================================================
   CYBERPUNK RED – Charaktererschaffung
   data.js: alle Regeldaten aus dem Core Rulebook
   (STATs S. 72–79, Skills S. 81–90, Presets S. 98/103/117,
    Waffen/Rüstung/Gear/Fashion S. 91–105, Cyberware S. 110–118)
   ============================================================ */
"use strict";

const CPR = {};

/* ---------- STATs (S. 72) ---------- */
CPR.STATS = ["INT","REF","DEX","TECH","COOL","WILL","LUCK","MOVE","BODY","EMP"];

CPR.STAT_INFO = {
  INT:  "Intelligence – Intelligenz, Cleverness, Wahrnehmung, Lernfähigkeit",
  REF:  "Reflexes – Reaktionszeit & Koordination (trifft mit Fernkampf)",
  DEX:  "Dexterity – Körperliche Gewandtheit (trifft mit Nahkampf, Ausweichen)",
  TECH: "Technique – Umgang mit Werkzeugen & Instrumenten",
  COOL: "Cool – Charisma, Einschüchtern, soziale Interaktion",
  WILL: "Willpower – Entschlossenheit, Durchhaltevermögen (HP)",
  LUCK:"Luck – Glückspunkte (1× pro Session auffüllen)",
  MOVE:"Movement – Bewegungsgeschwindigkeit",
  BODY: "Body – Zähigkeit & Masse (HP, Death Save)",
  EMP:  "Empathy – Einfühlung (bildet Humanity ab)"
};

/* ---------- Rollen (S. 29–39, Role Abilities S. 142ff) ---------- */
CPR.ROLES = {
  rockerboy:{ name:"Rockerboy", ability:"Charismatic Impact",
    blurb:"Rock-and-roll-Rebellen, die mit Performance, Kunst und Rhetorik gegen die Autorität kämpfen.",
    ra:"Beeinflusst andere durch pure Präsenz der Persönlichkeit – Musik, Poesie, Kunst, Tanz oder bloße physische Ausstrahlung." },
  solo:{ name:"Solo", ability:"Combat Awareness",
    blurb:"Assassinen, Bodyguards, Killer und Söldner in einer gesetzlosen Welt.",
    ra:"Erhöhte Situationsbewusstheit im Kampf: Punkte auf Kampf-Fähigkeiten verteilen (z. B. Initiative, Awareness, Marksman …)." },
  netrunner:{ name:"Netrunner", ability:"Interface",
    blurb:"Cybernetische Meister-Hacker der Post-NET-Welt und gehirnverbrennende Geheimnis-Diebe.",
    ra:"Erlaubt Netrunning: Steuerung von Cyberdecks, Hacken von NET-Architekturen, Programme & Black-ICE-Abwehr." },
  tech:{ name:"Tech", ability:"Maker",
    blurb:"Renegate Mechaniker und Erfinder – die Leute, die die Dark Future am Laufen halten.",
    ra:"Reparieren, verbessern, modifizieren, bauen und erfinden. Pro Rang 2 Maker-Spezialitäten (Field Tech, Upgrade, Fabricate, Inventor)." },
  medtech:{ name:"Medtech", ability:"Medicine",
    blurb:"Nicht lizenzierte Straßendokatoren und Cyberware-Medics – flicken Fleisch und Metall.",
    ra:"Menschen am Leben erhalten: Pro Rang 1 Punkt in Chirurgie (Surgery), Pharma oder Kryotechnik (Cryosystems)." },
  media:{ name:"Media", ability:"Credibility",
    blurb:"Reporter, Medienstars und soziale Influencer, die alles für die Wahrheit (oder den Ruhm) riskieren.",
    ra:"Publikum von der Wahrheit überzeugen, größere Reichweite, Zugang zu Quellen und Informationen." },
  exec:{ name:"Exec", ability:"Teamwork",
    blurb:"Corporate Power-Broker und Firmen-Überfall-Kommandanten der Megacorp-Ära.",
    ra:"Ein Team mit offiziellen und verdeckten Rollen (z. B. Sekretärin, Netrunner, Bodyguard). Gratis Wohnung & Kleidung." },
  lawman:{ name:"Lawman", ability:"Backup",
    blurb:"Maximale Gesetzeshüter auf den mean streets und beyond.",
    ra:"Bei Gefahr Verstärkung rufen: ein Einsatztrupp, dessen Stärke mit dem Rang wächst." },
  fixer:{ name:"Fixer", ability:"Streetdeal",
    blurb:"Deal-Macher, Organisatoren und Informations-Broker der Nachkriegs-Night-Markets.",
    ra:"Favours und Rollen-Punkte: Zugang zu Kontakten, Services, Wissen und Waren über die Street." },
  nomad:{ name:"Nomad", ability:"Moto",
    blurb:"Transport-Experten, ultimative Road Warriors, Piraten und Schmuggler – sie halten die Welt verbunden.",
    ra:"Familien-Boosts: Zugang zu Transport, versteckten Lagern und Mods für Fahrzeuge; Moto erlaubt Alternative Housing." }
};
CPR.ROLE_ORDER = ["rockerboy","solo","netrunner","tech","medtech","media","lawman","exec","fixer","nomad"];
CPR.ROLE_ABILITY_START = 4; // S. 29: Role Ability startet bei 4

/* ---------- STAT-Templates (S. 73–77, Streetrat & Edgerunner) ----------
   Spaltenreihenfolge: INT REF DEX TECH COOL WILL LUCK MOVE BODY EMP */
CPR.STAT_TEMPLATES = {
  rockerboy:[
    [7,6,6,5,6,8,7,7,3,8],[3,7,7,7,7,6,7,7,5,8],[4,5,7,7,6,6,7,7,5,8],
    [4,5,7,7,6,8,7,6,3,8],[3,7,7,7,6,8,6,5,4,7],[5,6,7,5,7,8,5,7,3,7],
    [5,6,6,7,7,8,7,6,3,6],[5,7,7,5,6,6,6,6,4,8],[3,5,5,6,7,8,7,5,5,7],
    [4,5,6,5,8,8,7,6,4,7]],
  solo:[
    [6,7,7,3,8,6,5,5,6,5],[7,8,6,3,6,6,7,5,6,6],[5,8,7,4,7,7,6,7,8,5],
    [5,8,6,4,6,7,6,5,7,6],[6,6,7,5,7,6,7,6,8,4],[7,7,6,5,7,6,6,7,7,5],
    [7,7,6,5,6,7,7,6,6,6],[7,8,7,5,6,6,5,6,8,4],[7,7,6,4,6,6,6,5,6,5],
    [6,6,8,5,6,6,5,6,6,5]],
  netrunner:[
    [5,8,7,7,7,4,8,7,7,4],[5,6,7,5,8,3,8,7,5,5],[5,6,8,6,6,4,7,6,7,4],
    [5,7,7,7,7,5,8,6,5,5],[5,8,8,5,7,3,7,5,5,6],[6,6,6,7,8,4,7,7,6,6],
    [6,6,6,7,6,5,7,7,7,6],[5,7,8,6,8,4,8,5,7,4],[7,6,7,7,6,3,6,5,6,5],
    [7,8,6,6,6,4,7,7,5,6]],
  tech:[
    [6,7,7,8,4,4,5,5,7,6],[7,6,6,7,5,3,7,7,5,5],[8,6,5,7,5,4,7,7,5,7],
    [7,8,7,8,4,4,6,5,6,7],[6,6,7,6,4,3,7,7,6,6],[8,7,5,6,3,3,7,6,6,7],
    [8,6,7,8,4,4,7,6,7,6],[8,8,7,8,5,4,6,5,6,6],[6,6,7,8,3,3,5,7,7,7],
    [8,8,5,6,4,4,6,5,6,6]],
  medtech:[
    [7,5,6,7,5,3,8,5,5,7],[6,7,7,7,4,4,6,7,7,7],[6,5,5,8,5,3,8,5,7,8],
    [8,7,6,8,3,5,6,6,5,7],[6,7,5,7,5,5,8,7,6,8],[8,5,5,8,5,5,6,6,5,6],
    [8,6,5,8,5,4,8,5,7,7],[6,5,7,7,3,5,8,5,5,8],[6,6,7,7,5,4,6,6,5,6],
    [8,7,6,6,3,4,8,7,6,7]],
  media:[
    [6,6,5,5,8,7,5,7,5,7],[8,7,7,3,6,6,6,5,6,8],[6,7,7,5,6,8,5,5,5,7],
    [6,5,7,5,6,7,5,5,6,6],[6,6,7,4,8,7,6,7,5,8],[7,5,5,4,8,7,6,7,5,8],
    [8,5,6,3,7,6,6,5,6,7],[6,5,6,5,6,8,6,6,7,8],[7,7,5,4,6,7,6,5,6,7],
    [7,6,6,3,7,6,7,6,7,6]],
  lawman:[
    [5,6,7,5,7,8,5,6,5,6],[6,6,6,5,6,8,5,7,5,5],[5,7,7,7,6,7,5,5,7,6],
    [6,6,7,6,6,8,5,7,7,6],[6,6,7,6,7,7,6,5,5,6],[7,6,5,5,7,8,5,6,7,4],
    [7,8,7,5,6,8,7,6,5,4],[5,6,6,5,6,8,5,7,6,4],[7,7,5,5,7,7,6,5,5,6],
    [6,6,5,6,8,7,5,7,6,6]],
  exec:[
    [8,5,5,3,8,6,6,5,5,7],[8,6,6,4,7,6,7,7,5,7],[8,7,6,3,8,6,7,6,4,5],
    [8,5,7,5,6,5,6,5,5,7],[7,7,6,5,8,5,7,7,5,6],[5,7,7,3,6,7,6,5,5,7],
    [6,6,7,5,8,7,6,7,4,6],[6,7,7,3,7,5,7,5,5,7],[7,6,7,5,7,5,7,6,5,5],
    [7,7,5,5,8,6,6,7,4,7]],
  fixer:[
    [8,5,7,4,6,5,8,5,5,8],[8,5,5,5,6,7,8,7,5,7],[6,6,6,4,5,6,8,6,3,8],
    [7,7,5,5,7,6,7,7,5,8],[8,6,6,3,6,5,8,7,5,6],[8,7,5,5,6,7,7,5,3,6],
    [8,6,6,5,6,5,6,7,5,8],[6,6,7,4,7,6,7,7,4,7],[8,7,7,5,5,5,7,6,5,7],
    [6,5,6,5,5,6,8,6,4,7]],
  nomad:[
    [6,6,8,3,6,7,6,6,6,4],[5,7,6,5,8,8,8,7,5,4],[5,8,6,3,8,7,6,5,6,5],
    [5,8,7,4,8,6,7,7,7,5],[6,6,6,3,6,7,6,7,7,4],[7,6,8,4,6,7,6,5,6,5],
    [6,7,8,4,6,6,7,5,7,5],[5,7,8,3,8,6,7,5,5,5],[6,7,6,4,8,6,6,6,6,6],
    [5,6,7,4,7,8,7,7,7,4]]
};

/* ---------- Skill-Master-Liste (S. 81–85) ---------- */
/* x2 = doppelte Punktekosten */
CPR.SKILLS = [
  /* Awareness */
  {n:"Concentration",s:"WILL"},{n:"Conceal/Reveal Object",s:"INT"},
  {n:"Lip Reading",s:"INT"},{n:"Perception",s:"INT"},{n:"Tracking",s:"INT"},
  /* Body */
  {n:"Athletics",s:"DEX"},{n:"Contortionist",s:"DEX"},{n:"Dance",s:"DEX"},
  {n:"Endurance",s:"WILL"},{n:"Resist Torture/Drugs",s:"WILL"},{n:"Stealth",s:"DEX"},
  /* Control */
  {n:"Drive Land Vehicle",s:"REF"},{n:"Pilot Air Vehicle",s:"REF",x2:true},
  {n:"Pilot Sea Vehicle",s:"REF"},{n:"Riding",s:"REF"},
  /* Education */
  {n:"Accounting",s:"INT"},{n:"Animal Handling",s:"INT"},{n:"Bureaucracy",s:"INT"},
  {n:"Business",s:"INT"},{n:"Composition",s:"INT"},{n:"Criminology",s:"INT"},
  {n:"Cryptography",s:"INT"},{n:"Deduction",s:"INT"},{n:"Education",s:"INT"},
  {n:"Gamble",s:"INT"},{n:"Language",s:"INT"},{n:"Library Search",s:"INT"},
  {n:"Local Expert",s:"INT"},{n:"Science",s:"INT"},{n:"Tactics",s:"INT"},
  {n:"Wilderness Survival",s:"INT"},
  /* Fighting */
  {n:"Brawling",s:"DEX"},{n:"Evasion",s:"DEX"},{n:"Martial Arts",s:"DEX",x2:true},
  {n:"Melee Weapon",s:"DEX"},
  /* Performance */
  {n:"Acting",s:"COOL"},{n:"Play Instrument",s:"TECH"},
  /* Ranged */
  {n:"Archery",s:"REF"},{n:"Autofire",s:"REF",x2:true},{n:"Handgun",s:"REF"},
  {n:"Heavy Weapons",s:"REF",x2:true},{n:"Shoulder Arms",s:"REF"},
  /* Social */
  {n:"Bribery",s:"COOL"},{n:"Conversation",s:"EMP"},{n:"Human Perception",s:"EMP"},
  {n:"Interrogation",s:"COOL"},{n:"Persuasion",s:"COOL"},{n:"Personal Grooming",s:"COOL"},
  {n:"Streetwise",s:"COOL"},{n:"Trading",s:"COOL"},{n:"Wardrobe & Style",s:"COOL"},
  /* Technique */
  {n:"Air Vehicle Tech",s:"TECH"},{n:"Basic Tech",s:"TECH"},{n:"Cybertech",s:"TECH"},
  {n:"Demolitions",s:"TECH",x2:true},{n:"Electronics/Security Tech",s:"TECH",x2:true},
  {n:"First Aid",s:"TECH"},{n:"Forgery",s:"TECH"},{n:"Land Vehicle Tech",s:"TECH"},
  {n:"Paint/Draw/Sculpt",s:"TECH"},{n:"Paramedic",s:"TECH",x2:true},
  {n:"Photography/Film",s:"TECH"},{n:"Pick Lock",s:"TECH"},{n:"Pick Pocket",s:"TECH"},
  {n:"Sea Vehicle Tech",s:"TECH"},{n:"Weaponstech",s:"TECH"}
];
CPR.SKILL_BY_NAME = {};
CPR.SKILLS.forEach(sk=>CPR.SKILL_BY_NAME[sk.n]=sk);

/* Basic Skills (S. 85) – müssen mindestens Level 2 haben */
CPR.BASIC_SKILLS = ["Athletics","Brawling","Concentration","Conversation","Education",
  "Evasion","First Aid","Human Perception","Language (Streetslang)",
  "Local Expert (Your Home)","Perception","Persuasion","Stealth"];
CPR.CULTURAL_LANG_RANK = 4; /* gratis (S. 45/85) */

/* Streetrat-Skillwerte (S. 86–87) – fix */
CPR.STREETRAT_SKILLS = {
  rockerboy:[["Athletics",2],["Brawling",6],["Concentration",2],["Conversation",2],
    ["Education",2],["Evasion",6],["First Aid",6],["Human Perception",6],
    ["Language (Streetslang)",2],["Local Expert (Your Home)",4],["Perception",2],
    ["Persuasion",6],["Stealth",2],["Composition",6],["Handgun",6],["Melee Weapon",6],
    ["Personal Grooming",4],["Play Instrument (choose 1)",6],["Streetwise",6],
    ["Wardrobe & Style",4]],
  solo:[["Athletics",2],["Brawling",2],["Concentration",2],["Conversation",2],
    ["Education",2],["Evasion",6],["First Aid",6],["Human Perception",2],
    ["Language (Streetslang)",2],["Local Expert (Your Home)",2],["Perception",6],
    ["Persuasion",2],["Stealth",2],["Autofire",6],["Handgun",6],["Interrogation",6],
    ["Melee Weapon",6],["Resist Torture/Drugs",6],["Shoulder Arms",6],["Tactics",6]],
  netrunner:[["Athletics",2],["Brawling",2],["Concentration",2],["Conversation",2],
    ["Education",6],["Evasion",6],["First Aid",2],["Human Perception",2],
    ["Language (Streetslang)",2],["Local Expert (Your Home)",2],["Perception",2],
    ["Persuasion",2],["Stealth",6],["Basic Tech",6],["Conceal/Reveal Object",6],
    ["Cryptography",6],["Cybertech",6],["Electronics/Security Tech",6],["Handgun",6],
    ["Library Search",6]],
  tech:[["Athletics",2],["Brawling",2],["Concentration",2],["Conversation",2],
    ["Education",6],["Evasion",6],["First Aid",6],["Human Perception",2],
    ["Language (Streetslang)",2],["Local Expert (Your Home)",2],["Perception",2],
    ["Persuasion",2],["Stealth",2],["Basic Tech",6],["Cybertech",6],
    ["Electronics/Security Tech",6],["Land Vehicle Tech",6],["Science (choose 1)",6],
    ["Shoulder Arms",6],["Weaponstech",6]],
  medtech:[["Athletics",2],["Brawling",2],["Concentration",2],["Conversation",6],
    ["Education",6],["Evasion",6],["First Aid",2],["Human Perception",6],
    ["Language (Streetslang)",2],["Local Expert (Your Home)",2],["Perception",2],
    ["Persuasion",2],["Stealth",2],["Basic Tech",6],["Cybertech",4],["Deduction",6],
    ["Paramedic",6],["Resist Torture/Drugs",4],["Science (choose 1)",6],
    ["Shoulder Arms",6]],
  media:[["Athletics",2],["Brawling",2],["Concentration",2],["Conversation",6],
    ["Education",2],["Evasion",6],["First Aid",2],["Human Perception",6],
    ["Language (Streetslang)",2],["Local Expert (Your Home)",6],["Perception",6],
    ["Persuasion",6],["Stealth",2],["Bribery",6],["Composition",6],["Deduction",6],
    ["Handgun",6],["Library Search",4],["Lip Reading",4],["Photography/Film",4]],
  lawman:[["Athletics",2],["Brawling",6],["Concentration",2],["Conversation",6],
    ["Education",2],["Evasion",6],["First Aid",2],["Human Perception",2],
    ["Language (Streetslang)",2],["Local Expert (Your Home)",2],["Perception",2],
    ["Persuasion",2],["Stealth",2],["Autofire",6],["Criminology",6],["Deduction",6],
    ["Handgun",6],["Interrogation",6],["Shoulder Arms",6],["Tracking",6]],
  exec:[["Athletics",2],["Brawling",2],["Concentration",2],["Conversation",6],
    ["Education",6],["Evasion",6],["First Aid",2],["Human Perception",6],
    ["Language (Streetslang)",2],["Local Expert (Your Home)",2],["Perception",2],
    ["Persuasion",6],["Stealth",2],["Accounting",6],["Bureaucracy",6],["Business",6],
    ["Deduction",6],["Handgun",6],["Lip Reading",6],["Personal Grooming",4]],
  fixer:[["Athletics",2],["Brawling",2],["Concentration",2],["Conversation",6],
    ["Education",2],["Evasion",6],["First Aid",2],["Human Perception",6],
    ["Language (Streetslang)",4],["Local Expert (Your Home)",6],["Perception",2],
    ["Persuasion",4],["Stealth",2],["Bribery",6],["Business",6],["Forgery",6],
    ["Handgun",6],["Pick Lock",4],["Streetwise",6],["Trading",6]],
  nomad:[["Athletics",2],["Brawling",6],["Concentration",2],["Conversation",2],
    ["Education",2],["Evasion",6],["First Aid",6],["Human Perception",2],
    ["Language (Streetslang)",2],["Local Expert (Your Home)",2],["Perception",4],
    ["Persuasion",2],["Stealth",6],["Animal Handling",6],["Drive Land Vehicle",6],
    ["Handgun",6],["Melee Weapon",6],["Tracking",6],["Trading",6],
    ["Wilderness Survival",6]]
};

/* Edgerunner-Skill-Listen (S. 88–89): 13 Basic + 7 Rollen-Skills = 20 */
CPR.EDGERUNNER_SKILLS = {
  rockerboy:["Composition","Handgun","Melee Weapon","Personal Grooming",
    "Play Instrument (choose 1)","Streetwise","Wardrobe & Style"],
  solo:["Autofire","Handgun","Interrogation","Melee Weapon","Resist Torture/Drugs",
    "Shoulder Arms","Tactics"],
  netrunner:["Basic Tech","Conceal/Reveal Object","Cryptography","Cybertech",
    "Electronics/Security Tech","Handgun","Library Search"],
  tech:["Basic Tech","Cybertech","Electronics/Security Tech","Land Vehicle Tech",
    "Science (choose 1)","Shoulder Arms","Weaponstech"],
  medtech:["Basic Tech","Cybertech","Deduction","Paramedic","Resist Torture/Drugs",
    "Science (choose 1)","Shoulder Arms"],
  media:["Bribery","Composition","Deduction","Handgun","Library Search","Lip Reading",
    "Photography/Film"],
  lawman:["Autofire","Criminology","Deduction","Handgun","Interrogation",
    "Shoulder Arms","Tracking"],
  exec:["Accounting","Bureaucracy","Business","Deduction","Handgun","Lip Reading",
    "Personal Grooming"],
  fixer:["Bribery","Business","Forgery","Handgun","Pick Lock","Streetwise","Trading"],
  nomad:["Animal Handling","Drive Land Vehicle","Handgun","Melee Weapon","Tracking",
    "Trading","Wilderness Survival"]
};

/* Skill-Punkte (S. 88/90) */
CPR.EDGERUNNER_POINTS = 86;
CPR.COMPLETE_POINTS = 86;
CPR.SKILL_MAX = 6;
CPR.SKILL_MIN = 2; /* für vorhandene Skills bei ER; Basic-Skills min 2 bei CP */

/* Complete Package STAT-Punkte (S. 78) */
CPR.CP_STAT_POINTS = 62;
CPR.STAT_MAX = 8;
CPR.STAT_MIN = 2;

/* „choose 1"-Optionen (S. 83/86) */
CPR.CHOOSE_SKILLS = {
  "Play Instrument (choose 1)":["Singing","Guitar","Drums","Violin","Piano",
    "Synthesizer","Bass","Trumpet","Saxophone","DJ-Deck"],
  "Science (choose 1)":["Geology","Mathematics","Physics","Zoology","Anthropology",
    "Biology","Chemistry","History","Astronomy","Medicine (Theoretical)"]
};

/* ---------- Melee Weapons (S. 92) ---------- */
CPR.MELEE = [
  {n:"Light Melee Weapon",dmg:"1d6",rof:2,hands:1,conceal:true,cost:50,ex:"Combat Knife, Tomahawk"},
  {n:"Medium Melee Weapon",dmg:"2d6",rof:2,hands:"1–2",conceal:false,cost:50,ex:"Baseball Bat, Crowbar, Machete"},
  {n:"Heavy Melee Weapon",dmg:"3d6",rof:2,hands:"1–2",conceal:false,cost:100,ex:"Lead Pipe, Sword, Spiked Bat"},
  {n:"Very Heavy Melee Weapon",dmg:"4d6",rof:1,hands:2,conceal:false,cost:500,ex:"Chainsaw, Sledgehammer, Naginata"}
];

/* ---------- Ranged Weapons (S. 94) ---------- */
CPR.RANGED = [
  {n:"Medium Pistol",skill:"Handgun",dmg:"2d6",mag:"12 (M Pistol)",rof:2,hands:1,conceal:true,cost:50,alt:"–"},
  {n:"Heavy Pistol",skill:"Handgun",dmg:"3d6",mag:"8 (H Pistol)",rof:2,hands:1,conceal:true,cost:100,alt:"–"},
  {n:"Very Heavy Pistol",skill:"Handgun",dmg:"4d6",mag:"8 (VH Pistol)",rof:1,hands:1,conceal:false,cost:100,alt:"–"},
  {n:"SMG",skill:"Handgun",dmg:"2d6",mag:"30 (M Pistol)",rof:1,hands:1,conceal:true,cost:100,alt:"Autofire (3) · Suppressive Fire"},
  {n:"Heavy SMG",skill:"Handgun",dmg:"3d6",mag:"40 (H Pistol)",rof:1,hands:1,conceal:false,cost:100,alt:"Autofire (3) · Suppressive Fire"},
  {n:"Shotgun",skill:"Shoulder Arms",dmg:"5d6",mag:"4 (Slug)",rof:1,hands:2,conceal:false,cost:500,alt:"Shotgun Shell"},
  {n:"Assault Rifle",skill:"Shoulder Arms",dmg:"5d6",mag:"25 (Rifle)",rof:1,hands:2,conceal:false,cost:500,alt:"Autofire (4) · Suppressive Fire"},
  {n:"Sniper Rifle",skill:"Shoulder Arms",dmg:"5d6",mag:"4 (Rifle)",rof:1,hands:2,conceal:false,cost:500,alt:"–"},
  {n:"Bows & Crossbows",skill:"Archery",dmg:"4d6",mag:"N/A (Arrow)",rof:1,hands:2,conceal:false,cost:100,alt:"Arrows"},
  {n:"Grenade Launcher",skill:"Heavy Weapons",dmg:"6d6",mag:"2 (Grenade)",rof:1,hands:2,conceal:false,cost:500,alt:"Explosive"},
  {n:"Rocket Launcher",skill:"Heavy Weapons",dmg:"8d6",mag:"1 (Rocket)",rof:1,hands:2,conceal:false,cost:500,alt:"Explosive"}
];

/* ---------- Exotic Weapons (S. 95, optional mit SL-Erlaubnis) ---------- */
CPR.EXOTIC = [
  {n:"Air Pistol",d:"Medium Pistol, feuert Paint-(und Säure-)Bälle",cost:100},
  {n:"Battleglove",d:"Schwerer Handschuh, 3 Cyberarm/Cyberlimb-Optionsslots",cost:1000},
  {n:"Constitution Arms Hurricane Assault Weapon",d:"Shotgun mit ROF 2, benötigt BODY 11+",cost:5000},
  {n:"Dartgun",d:"Very Heavy Pistol für Non-Basic Arrows",cost:100},
  {n:"Flamethrower",d:"Shotgun mit Brandmunition, Heavy Weapons Skill",cost:500},
  {n:"Kendachi Mono-Three",d:"Zweihändige Very Heavy Melee Weapon, ignoriert Rüstung unter SP11",cost:5000},
  {n:"Malorian Arms 3516",d:"Excellent Quality VH Pistol (5d6) – Johnny Silverhands Waffe",cost:10000},
  {n:"Microwaver",d:"VH Pistol, schaltet Cyberware/Elektronik aus",cost:500},
  {n:"Militech “Cowboy” U-56 Grenade Launcher",d:"Grenade Launcher mit ROF 2, benötigt BODY 11+",cost:5000},
  {n:"Rhinemetall EMG-86 Railgun",d:"Assault Rifle, ignoriert Rüstung unter SP11, Heavy Weapons, BODY 11+",cost:5000},
  {n:"Shrieker",d:"VH Pistol, verursacht Damaged Ear Critical Injury",cost:500},
  {n:"Stun Baton",d:"„Less lethal“ Medium Melee Weapon",cost:100},
  {n:"Stun Gun",d:"„Less lethal“ Heavy Pistol",cost:100},
  {n:"Tsunami Arms Helix",d:"Assault Rifle nur im Autofire-Modus, BODY 11+",cost:5000}
];

/* ---------- Armor (S. 97) ---------- */
CPR.ARMOR = [
  {n:"Leathers",sp:4,pen:0,cost:20,d:"Lederkluft, beliebt bei Nomads und Bikern"},
  {n:"Kevlar®",sp:7,pen:0,cost:50,d:"Kann Kleidung, Westen, Anzüge … sein"},
  {n:"Light Armorjack",sp:11,pen:0,cost:100,d:"Kevlar®/Plastik-Mesh im Stoff"},
  {n:"Bodyweight Suit",sp:11,pen:0,cost:1000,d:"Hautanzug mit Armorgel; Platz für Cyberdeck & Interface Plugs (S. 350)"},
  {n:"Medium Armorjack",sp:12,pen:-2,cost:100,d:"Dickeres Armorjack mit Platten"},
  {n:"Heavy Armorjack",sp:13,pen:-2,cost:500,d:"Dichtestes Armorjack"},
  {n:"Flak",sp:15,pen:-4,cost:500,d:"Flakweste + -hose"},
  {n:"Metalgear®",sp:18,pen:-4,cost:5000,d:"Stoppt fast alles – aber unbeweglich"},
  {n:"Bulletproof Shield",sp:10,pen:0,cost:100,d:"Schild mit 10 HP; belegt immer einen Arm (S. 183)",shield:true}
];

/* ---------- Basis-Munition (S. 94) ---------- */
CPR.AMMO_COST_PER_10 = 10;
CPR.AMMO_TYPES = ["Medium Pistol Bullet","Heavy Pistol Bullet","Very Heavy Pistol Bullet",
  "Slug","Rifle","Shotgun Shell","Arrow"];

/* ---------- Gear (S. 99–101) ---------- */
CPR.GEAR = [
  {n:"Agent",c:100,d:"KI-Smartphone. +2 Library Search, +2 Wardrobe & Style (S. 352)"},
  {n:"Airhypo",c:50,d:"Einfache Medikamenten-Applikation"},
  {n:"Anti-Smog Breathing Mask",c:20,d:"Filtert Luftgifte"},
  {n:"Audio Recorder",c:100,d:"24h Ton auf einem Memory Chip"},
  {n:"Auto Level Dampening Ear Protectors",c:1000,d:"Immunität gegen gefährlich laute Geräusche"},
  {n:"Binoculars",c:50,d:"x2/x3-Zoom"},
  {n:"Braindance Viewer",c:1000,d:"Erleben von Braindances"},
  {n:"Bug Detector",c:500,d:"Piept bei Abhörgeräten im 2m-Radius"},
  {n:"Carryall",c:20,d:"Tasche für Kram"},
  {n:"Chemical Analyzer",c:1000,d:"Testet chemische Zusammensetzung"},
  {n:"Computer",c:50,d:"Laptop oder Desktop"},
  {n:"Cyberdeck",c:500,d:"Basis-Deck für Netrunning, 7 Slots (S. 353)"},
  {n:"Disposable Cell Phone",c:50,d:"Wegwerf-Handy"},
  {n:"Drum Synthesizer",c:500,d:"Braucht Verstärker"},
  {n:"Duct Tape",c:20,d:"Klebeband, auch Leuchtfarben"},
  {n:"Electric Guitar/Other Instrument",c:500,d:"Braucht bei E-Version Verstärker"},
  {n:"Flashlight",c:20,d:"100m Lichtstrahl, 10h Akku"},
  {n:"Food Stick",c:10,d:"Eine schreckliche Mahlzeit in Riegelform"},
  {n:"Glow Paint",c:20,d:"Leuchtfarbe als Spraydose"},
  {n:"Glow Stick",c:10,d:"Leuchtet 4m weit, 10 Stunden"},
  {n:"Grapple Gun",c:100,d:"Seil bis 30m, keine Waffe"},
  {n:"Handcuffs",c:50,d:"Fesseln, BODY >10 zum Sprengen"},
  {n:"Homing Tracer",c:500,d:"Folgt Sender bis 1 Meile"},
  {n:"Inflatable Bed & Sleep-bag",c:20,d:"Selbstaufblasende Matte + Schlafsack"},
  {n:"Kibble Pack",c:10,d:"Eine Mahlzeit Kibble"},
  {n:"Lock Picking Set",c:20,d:"Für mechanische Schlösser"},
  {n:"Medscanner",c:1000,d:"+2 First Aid und Paramedic"},
  {n:"Medtech Bag",c:100,d:"Komplettes medizinisches Set"},
  {n:"Memory Chip",c:10,d:"Standard-Datenspeicher"},
  {n:"MRE",c:10,d:"Selbsterhitzender Essbeutel"},
  {n:"Personal CarePak",c:20,d:"Hygiene-Set"},
  {n:"Pocket Amplifier",c:50,d:"Für bis zu 2 Instrumente, 6h Akku"},
  {n:"Radar Detector",c:500,d:"Warnt vor Radar im 100m-Radius"},
  {n:"Radiation Suit",c:1000,d:"Schützt vor Strahlung"},
  {n:"Radio Communicator",c:100,d:"Ohrstück, 1 Meile Reichweite"},
  {n:"Radio Scanner/Music Player",c:50,d:"Musik & Radio im 1-Meilen-Radius"},
  {n:"Road Flare",c:10,d:"Beleuchtet 100m für 1 Stunde"},
  {n:"Rope (60m/yd)",c:20,d:"Nylonseil"},
  {n:"Scrambler/Descrambler",c:500,d:"Verschlüsselt/entschlüsselt Kommunikation"},
  {n:"Smart Glasses",c:500,d:"2 Slots für Cyberoptic-Optionen"},
  {n:"Tech Bag",c:500,d:"Werkzeugtasche"},
  {n:"Techscanner",c:1000,d:"+2 auf mehrere TECH-Skills"},
  {n:"Techtool",c:100,d:"Multifunktions-Werkzeug"},
  {n:"Tent and Camping Equipment",c:50,d:"Camping-Set für eine Person"},
  {n:"Vial of Biotoxin",c:500,d:"3d6 Schaden, widerstanden mit Resist Torture/Drugs, ignoriert Rüstung"},
  {n:"Vial of Poison",c:100,d:"2d6 Schaden, widerstanden mit Resist Torture/Drugs, ignoriert Rüstung"},
  {n:"Video Camera",c:100,d:"12h Audio/Video auf einem Memory Chip"},
  {n:"Virtuality Goggles",c:100,d:"Projiziert Cyberspace über das reale Bild"}
];

/* ---------- Fashion (S. 102) ---------- */
/* Matrix: Style × Kleidungsstück; Preise in eb */
CPR.FASHION_STYLES = [
  "Bag Lady Chic","Gang Colors","Generic Chic","Bohemian","Leisurewear",
  "Nomad Leathers","Asia Pop","Urban Flash","Businesswear","High Fashion"
];
CPR.FASHION_STYLE_DESC = {
  "Bag Lady Chic":"Homeless, Ragged, Vagrant",
  "Gang Colors":"Dangerous, Violent, Rebellious",
  "Generic Chic":"Standard, Colorful, Modular",
  "Bohemian":"Folksy, Retro, Free-spirited",
  "Leisurewear":"Comfort, Agility, Athleticism",
  "Nomad Leathers":"Western, Rugged, Tribal",
  "Asia Pop":"Bright, Costume-like, Youthful",
  "Urban Flash":"Flashy, Technological, Streetwear",
  "Businesswear":"Leadership, Presence, Authority",
  "High Fashion":"Exclusive, Designer, Couture"
};
CPR.FASHION_PIECES = ["Bottoms","Top","Jacket","Footwear","Jewelry","Mirrorshades","Glasses","Contact Lenses","Hats"];
CPR.FASHION_PRICES = {
  "Bag Lady Chic":[20,10,20,20,20,20,10,10,10],
  "Gang Colors":[50,20,50,20,50,20,20,10,10],
  "Generic Chic":[50,20,50,20,50,20,20,10,10],
  "Bohemian":[50,20,50,50,100,50,50,10,10],
  "Leisurewear":[100,20,100,50,100,50,50,20,50],
  "Nomad Leathers":[100,20,100,100,100,50,50,20,100],
  "Asia Pop":[100,20,100,100,100,100,100,100,100],
  "Urban Flash":[100,20,100,100,100,100,100,100,100],
  "Businesswear":[500,50,500,500,5000,500,500,100,500],
  "High Fashion":[1000,500,1000,5000,50000,1000,1000,1000,5000]
};

/* ---------- Cyberware (S. 110–116) ----------
   cat: Kategorie · cost: eb · hl: Humanity Loss bei Erstellung (fest, S. 111)
   slots: belegte Optionsslots · req: benötigte Foundational-Cyberware
   found: ist Foundational (Anzahl Optionsslots in foundSlots) */
CPR.CYBERWARE = [
  /* Fashionware – 7 Optionsslots gesamt, keine Foundational (S. 111) */
  {n:"Biomonitor",cat:"Fashionware",cost:100,hl:0,d:"Subkutaner Implantat mit Vitalwerten; kann mit Agent gekoppelt werden"},
  {n:"Chemskin",cat:"Fashionware",cost:100,hl:0,d:"Farbpigmente in der Haut; +2 Personal Grooming mit Techhair"},
  {n:"EMP Threading",cat:"Fashionware",cost:10,hl:0,d:"Silberne Schaltkreis-Linien auf dem Körper"},
  {n:"Light Tattoo",cat:"Fashionware",cost:100,hl:0,d:"Lichtprojizierende Tattoos; +2 Wardrobe & Style ab 3 Tattoos"},
  {n:"Shift Tacts",cat:"Fashionware",cost:100,hl:0,d:"Farbwechselnde Linsen im Auge"},
  {n:"Skinwatch",cat:"Fashionware",cost:100,hl:0,d:"LED-Uhr unter der Haut"},
  {n:"Techhair",cat:"Fashionware",cost:100,hl:0,d:"Farbleuchtendes Kunsthaar; +2 Personal Grooming mit Chemskin"},
  /* Neuralware – Foundational: Neural Link (S. 112) */
  {n:"Neural Link",cat:"Neuralware",cost:500,hl:7,found:true,foundSlots:5,d:"Künstliches Nervensystem. Nötig für Neuralware & Subdermal Grip"},
  {n:"Braindance Recorder",cat:"Neuralware",cost:500,hl:7,slots:1,req:"Neural Link",d:"Zeichnet Erlebnisse auf Memory Chip/extern auf"},
  {n:"Chipware Socket",cat:"Neuralware",cost:500,hl:7,slots:1,req:"Neural Link",d:"Buchse im Nacken; nötig für Chipware"},
  {n:"Interface Plugs",cat:"Neuralware",cost:500,hl:7,slots:1,req:"Neural Link",d:"Stecker in Handgelenk/Kopf für Maschinen"},
  {n:"Kerenzikov",cat:"Neuralware",cost:500,hl:14,slots:1,req:"Neural Link",d:"Speedware: +2 Initiative (immer aktiv). Nur 1 Speedware"},
  {n:"Sandevistan",cat:"Neuralware",cost:500,hl:7,slots:1,req:"Neural Link",d:"Speedware: als Aktion +3 Initiative für 1 Minute, 1h Abklingzeit"},
  {n:"Chemical Analyzer (Chipware)",cat:"Neuralware",cost:500,hl:3,slots:1,req:"Chipware Socket",d:"Analysiert Substanzen präzise"},
  {n:"Memory Chip",cat:"Neuralware",cost:10,hl:0,slots:1,req:"Chipware Socket",d:"Datenspeicher"},
  {n:"Olfactory Boost (Chipware)",cat:"Neuralware",cost:100,hl:7,slots:1,req:"Chipware Socket",d:"Verfolgen per Geruch (Tracking-Skill)"},
  {n:"Pain Editor (Chipware)",cat:"Neuralware",cost:1000,hl:14,slots:1,req:"Chipware Socket",d:"Ignoriert Seriously-Wounded-Malus"},
  {n:"Skill Chip (Chipware)",cat:"Neuralware",cost:500,hl:7,slots:1,req:"Chipware Socket",d:"Gibt einen Skill auf Level 3 (x2-Skills: 1.000eb)"},
  {n:"Tactile Boost (Chipware)",cat:"Neuralware",cost:100,hl:7,slots:1,req:"Chipware Socket",d:"Spürt Bewegung durch Auflegen der Hand (20m)"},
  /* Cyberoptics – Foundational: Cybereye (S. 112–113) */
  {n:"Cybereye",cat:"Cyberoptics",cost:100,hl:7,found:true,foundSlots:3,d:"Kunstauge mit 3 Optionsslots; einige Optionen nur paarweise"},
  {n:"Anti-Dazzle",cat:"Cyberoptics",cost:100,hl:2,slots:1,req:"Cybereye",paired:true,d:"Immun gegen Blendeffekte – braucht 2 Cybereyes (2× kaufen)"},
  {n:"Chyron",cat:"Cyberoptics",cost:100,hl:2,slots:1,req:"Cybereye",d:"Projiziert Bildschirmeinschübe ins Sichtfeld"},
  {n:"Color Shift",cat:"Cyberoptics",cost:100,hl:2,slots:1,req:"Cybereye",d:"Unbegrenzte Farb-/Musterwechsel des Auges"},
  {n:"Dartgun (Cyberoptics)",cat:"Cyberoptics",cost:500,hl:2,slots:3,req:"Cybereye",d:"Einzelschuss-Dartgun im Auge (Exotic Weapon)"},
  {n:"Image Enhance",cat:"Cyberoptics",cost:500,hl:3,slots:1,req:"Cybereye",paired:true,d:"+2 Perception/Lip Reading/Conceal-Reveal – braucht 2 Cybereyes"},
  {n:"Low Light / Infrared / UV",cat:"Cyberoptics",cost:500,hl:3,slots:2,req:"Cybereye",paired:true,d:"Ignoriert Dunkelheits-/Nebel-/Rauch-Malus – 2 Slots pro Auge, 2 Cybereyes"},
  {n:"MicroOptics",cat:"Cyberoptics",cost:100,hl:2,slots:1,req:"Cybereye",d:"400-fache Vergrößerung"},
  {n:"MicroVideo",cat:"Cyberoptics",cost:500,hl:2,slots:2,req:"Cybereye",d:"Kamera im Auge, 2 Slots"},
  {n:"Radiation Detector",cat:"Cyberoptics",cost:1000,hl:3,slots:1,req:"Cybereye",d:"Strahlungswerte als blaues Glühen (100m)"},
  {n:"Targeting Scope",cat:"Cyberoptics",cost:500,hl:3,slots:1,req:"Cybereye",d:"+1 bei Aimed Shots"},
  {n:"TeleOptics",cat:"Cyberoptics",cost:500,hl:3,slots:1,req:"Cybereye",d:"Details auf 800m; +1 Aimed Shot ab 51m"},
  {n:"Virtuality (Cyberoptics)",cat:"Cyberoptics",cost:100,hl:2,slots:1,req:"Cybereye",paired:true,d:"Cyberspace-Overlay – braucht 2 Cybereyes"},
  /* Cyberaudio – Foundational: Cyberaudio Suite (S. 113) */
  {n:"Cyberaudio Suite",cat:"Cyberaudio",cost:500,hl:7,found:true,foundSlots:3,max:1,d:"Gehör-Grundimplantat mit 3 Optionsslots; max. 1"},
  {n:"Amplified Hearing",cat:"Cyberaudio",cost:100,hl:3,slots:1,req:"Cyberaudio Suite",d:"+2 Perception bei Hören"},
  {n:"Audio Recorder (Cyberaudio)",cat:"Cyberaudio",cost:100,hl:2,slots:1,req:"Cyberaudio Suite",d:"Ton auf Memory Chip/Agent"},
  {n:"Bug Detector (Cyberaudio)",cat:"Cyberaudio",cost:100,hl:2,slots:1,req:"Cyberaudio Suite",d:"Piept bei Abhörgeräten (2m)"},
  {n:"Homing Tracer (Cyberaudio)",cat:"Cyberaudio",cost:100,hl:2,slots:1,req:"Cyberaudio Suite",d:"Folgt Sender bis 1 Meile"},
  {n:"Internal Agent",cat:"Cyberaudio",cost:100,hl:3,slots:1,req:"Cyberaudio Suite",d:"Vollständiger Agent intern (Audio, ggf. mit Chyron)"},
  {n:"Level Damper",cat:"Cyberaudio",cost:100,hl:2,slots:1,req:"Cyberaudio Suite",d:"Immun gegen laute Geräusche"},
  {n:"Radio Communicator (Cyberaudio)",cat:"Cyberaudio",cost:100,hl:2,slots:1,req:"Cyberaudio Suite",d:"Funk, 1 Meile"},
  {n:"Radio Scanner/Music Player (Cyberaudio)",cat:"Cyberaudio",cost:50,hl:2,slots:1,req:"Cyberaudio Suite",d:"Musik & Radio (1 Meile)"},
  {n:"Radar Detector (Cyberaudio)",cat:"Cyberaudio",cost:500,hl:2,slots:1,req:"Cyberaudio Suite",d:"Warnt vor Radar (100m)"},
  {n:"Scrambler/Descrambler (Cyberaudio)",cat:"Cyberaudio",cost:100,hl:2,slots:1,req:"Cyberaudio Suite",d:"Ver-/Entschlüsseln von Kommunikation"},
  {n:"Voice Stress Analyzer",cat:"Cyberaudio",cost:100,hl:3,slots:1,req:"Cyberaudio Suite",d:"+2 Human Perception und Interrogation"},
  /* Internal Body Cyberware – 7 Optionsslots gesamt (S. 114) */
  {n:"AudioVox",cat:"Internal Body Cyberware",cost:500,hl:3,d:"Stimm-Synthesizer: +2 Acting & Play Instrument (Gesang)"},
  {n:"Contraceptive Implant",cat:"Internal Body Cyberware",cost:10,hl:0,d:"Verhütung"},
  {n:"Enhanced Antibodies",cat:"Internal Body Cyberware",cost:500,hl:2,d:"Heilt nach Stabilisierung BODY×2 pro Ruhetag"},
  {n:"Cybersnake",cat:"Internal Body Cyberware",cost:1000,hl:14,d:"Very Heavy Melee Weapon in der Speiseröhre, verbergbar"},
  {n:"Gills",cat:"Internal Body Cyberware",cost:1000,hl:7,d:"Atmen unter Wasser"},
  {n:"Grafted Muscle and Bone Lace",cat:"Internal Body Cyberware",cost:1000,hl:14,bodyNote:"Erhöht BODY um 2 (ändert HP, Wound Threshold, Death Save; stapelbar, max BODY 10)",d:"Verstärkte Muskeln & Knochen"},
  {n:"Independent Air Supply",cat:"Internal Body Cyberware",cost:1000,hl:2,d:"30 Minuten Sauerstoff, 1h zum Wiederauffüllen"},
  {n:"Midnight Lady™ Sexual Implant",cat:"Internal Body Cyberware",cost:100,hl:7,d:"Sexualimplantat"},
  {n:"Mr. Studd™ Sexual Implant",cat:"Internal Body Cyberware",cost:100,hl:7,d:"Sexualimplantat"},
  {n:"Nasal Filters",cat:"Internal Body Cyberware",cost:100,hl:2,d:"Immun gegen giftige Gase/Dämpfe"},
  {n:"Radar/Sonar Implant",cat:"Internal Body Cyberware",cost:1000,hl:7,d:"Scannt 50m Gelände, nicht durch Deckung"},
  {n:"Toxin Binders",cat:"Internal Body Cyberware",cost:100,hl:2,d:"+2 Resist Torture/Drugs"},
  {n:"Vampyres",cat:"Internal Body Cyberware",cost:500,hl:14,d:"Excellent Quality Light Melee Weapon im Mund; Gift/Biotoxin möglich"},
  /* External Body Cyberware – 7 Optionsslots gesamt (S. 114) */
  {n:"Hidden Holster",cat:"External Body Cyberware",cost:500,hl:7,d:"Verwahrt verbergbare Waffe im Körper"},
  {n:"Skin Weave",cat:"External Body Cyberware",cost:500,hl:7,bodyNote:"Körper & Kopf SP7 (stackt nicht mit getragener Rüstung, ablatiert, +1 SP pro Ruhetag)",d:"Panzernde Haut"},
  {n:"Subdermal Armor",cat:"External Body Cyberware",cost:1000,hl:14,bodyNote:"Körper & Kopf SP11 (stackt nicht mit getragener Rüstung, ablatiert, +1 SP pro Ruhetag)",d:"Subkutane Panzerung"},
  {n:"Subdermal Pocket",cat:"External Body Cyberware",cost:100,hl:3,d:"2\"×4\" Stauraum unter der Haut mit Realskinn™-Reißverschluss"},
  /* Cyberlimbs (S. 115–116) */
  {n:"Cyberarm",cat:"Cyberlimbs",cost:500,hl:7,found:true,foundSlots:4,d:"Kunstarm mit 4 Optionsslots (Standard Hand inklusive, ohne HL/Slot)"},
  {n:"Cyberleg",cat:"Cyberlimbs",cost:100,hl:3,found:true,foundSlots:3,d:"Kunstbein mit 3 Optionsslots (Standard Foot inklusive); viele Optionen paarweise"},
  {n:"Standard Hand",cat:"Cyberlimbs",cost:100,hl:2,slots:1,d:"Standard-Hand; auch in Fleisch-Arm installierbar"},
  {n:"Big Knucks",cat:"Cyberlimbs",cost:100,hl:3,slots:1,d:"Panzerknöchel: Medium Melee Weapon, verbergbar; auch allein im Fleisch-Arm"},
  {n:"Cyberdeck (Cyberarm)",cat:"Cyberlimbs",cost:500,hl:3,slots:3,req:"Cyberarm",d:"Cyberdeck im Arm, 3 Slots"},
  {n:"Grapple Hand",cat:"Cyberlimbs",cost:100,hl:3,slots:1,req:"Cyberarm",d:"Feuert Hand mit Greifseil bis 30m; keine Waffe"},
  {n:"Medscanner (Cyberarm)",cat:"Cyberlimbs",cost:500,hl:7,slots:2,req:"Cyberarm",d:"+2 First Aid & Paramedic, 2 Slots"},
  {n:"Popup Grenade Launcher",cat:"Cyberlimbs",cost:500,hl:7,slots:2,req:"Cyberarm",d:"Einzelschuss-Granatwerfer im Arm, verbergbar"},
  {n:"Popup Melee Weapon",cat:"Cyberlimbs",cost:500,hl:7,slots:2,req:"Cyberarm",d:"Beliebige Light/Medium/Heavy Melee Weapon im Arm, verbergbar"},
  {n:"Popup Shield",cat:"Cyberlimbs",cost:500,hl:7,slots:3,req:"Cyberarm",d:"Bulletproof Shield im Arm, 3 Slots"},
  {n:"Popup Ranged Weapon",cat:"Cyberlimbs",cost:500,hl:7,slots:2,req:"Cyberarm",d:"Beliebige einhändige Fernkampfwaffe im Arm, verbergbar"},
  {n:"Quick Change Mount",cat:"Cyberlimbs",cost:100,hl:7,slots:1,req:"Cyberarm",d:"Cyberarm als Action ab-/anmontieren"},
  {n:"Rippers",cat:"Cyberlimbs",cost:500,hl:3,slots:1,d:"Carbo-Glas-Klauen: Medium Melee Weapon, verbergbar; auch allein im Fleisch-Arm"},
  {n:"Scratchers",cat:"Cyberlimbs",cost:100,hl:2,slots:1,d:"Carbo-Glas-Fingernägel: Light Melee Weapon, verbergbar; auch allein im Fleisch-Arm"},
  {n:"Shoulder Cam",cat:"Cyberlimbs",cost:500,hl:7,slots:2,req:"Cyberarm",d:"Videokamera in der Schulter, verbergbar"},
  {n:"Slice ‘N Dice",cat:"Cyberlimbs",cost:500,hl:3,slots:1,d:"Monofilament-Peitsche im Daumen: Medium Melee Weapon, verbergbar; auch allein im Fleisch-Arm"},
  {n:"Subdermal Grip",cat:"Cyberlimbs",cost:100,hl:3,slots:1,req:"Neural Link",d:"Smartgun-Nutzung ohne Interface Plugs; auch allein im Fleisch-Arm"},
  {n:"Techscanner (Cyberarm)",cat:"Cyberlimbs",cost:500,hl:7,slots:2,req:"Cyberarm",d:"+2 auf mehrere TECH-Skills, 2 Slots"},
  {n:"Tool Hand",cat:"Cyberlimbs",cost:100,hl:3,slots:1,d:"Werkzeug-Finger; auch allein im Fleisch-Arm"},
  {n:"Wolvers",cat:"Cyberlimbs",cost:500,hl:7,slots:1,d:"Lange Klauen: Heavy Melee Weapon, verbergbar; auch allein im Fleisch-Arm"},
  {n:"Standard Foot",cat:"Cyberlimbs",cost:100,hl:2,slots:1,d:"Standard-Fuß; auch in Fleisch-Bein"},
  {n:"Grip Foot",cat:"Cyberlimbs",cost:500,hl:3,slots:1,req:"Cyberleg",paired:true,d:"Hafttritt (Klettern ohne Malus) – braucht 2 Cyberlegs"},
  {n:"Jump Booster",cat:"Cyberlimbs",cost:500,hl:3,slots:2,req:"Cyberleg",paired:true,d:"Hydraulik: Springen ohne Malus – 2 Slots, 2 Cyberlegs"},
  {n:"Skate Foot",cat:"Cyberlimbs",cost:500,hl:3,slots:1,req:"Cyberleg",paired:true,d:"Inline-Skates: +6m beim Run – 2 Cyberlegs"},
  {n:"Talon Foot",cat:"Cyberlimbs",cost:500,hl:3,slots:1,req:"Cyberleg",d:"Klinge im Fuß: Light Melee Weapon, verbergbar; auch allein im Fleisch-Bein"},
  {n:"Web Foot",cat:"Cyberlimbs",cost:500,hl:3,slots:1,req:"Cyberleg",paired:true,d:"Schwimmen ohne Malus – 2 Cyberlegs"},
  {n:"Hardened Shielding",cat:"Cyberlimbs",cost:1000,hl:3,slots:1,req:"Cyberarm",d:"Cyberlimb + Optionen immun gegen EMP/Non-Black-ICE (auch für Cyberleg)"},
  {n:"Plastic Covering",cat:"Cyberlimbs",cost:100,hl:0,d:"Kunststoff-Beschichtung für Cyberlimb (kein Optionsslot)"},
  {n:"Realskinn™ Covering",cat:"Cyberlimbs",cost:500,hl:0,d:"Kunst-Haut für Cyberlimb (kein Optionsslot)"},
  {n:"Superchrome® Covering",cat:"Cyberlimbs",cost:1000,hl:0,d:"Metall-Glanz: +2 Wardrobe & Style (kein Optionsslot)"},
  /* Borgware (S. 116) */
  {n:"Artificial Shoulder Mount",cat:"Borgware",cost:1000,hl:14,bodyNote:"Erlaubt 2 zusätzliche Cyberarms unter dem ersten Armpaar",d:"Zusatz-Arme"},
  {n:"Implanted Linear Frame ∑ (Sigma)",cat:"Borgware",cost:1000,hl:14,bodyNote:"BODY wird 12 (ändert HP, Wound Threshold, Death Save). Voraussetzung: BODY 6 + Grafted Muscle and Bone Lace",d:"Verstärktes Skelett"},
  {n:"Implanted Linear Frame ß (Beta)",cat:"Borgware",cost:5000,hl:14,bodyNote:"BODY wird 14 (ändert HP, Wound Threshold, Death Save). Voraussetzung: BODY 8 + 2× Grafted Muscle and Bone Lace",d:"Schwer verstärktes Skelett"},
  {n:"MultiOptic Mount",cat:"Borgware",cost:1000,hl:14,bodyNote:"Erlaubt bis zu 5 zusätzliche Cybereyes",d:"Augen-Aufsatz"},
  {n:"Sensor Array",cat:"Borgware",cost:1000,hl:14,bodyNote:"Bis zu 5 zusätzliche Cyberaudio-Optionen (kein Audio-Slot). Braucht Cyberaudio Suite",d:"Audio-Erweiterung"}
];
CPR.CYBER_BY_NAME = {};
CPR.CYBERWARE.forEach(cw=>CPR.CYBER_BY_NAME[cw.n]=cw);

/* ---------- Presets Streetrat/Edgerunner ---------- */

/* Waffen & Rüstung (S. 98) – Optionen = „oder“-Auswahl */
CPR.PRESET_WEAPONS = {
  rockerboy:[{n:"Very Heavy Pistol"},{n:"Basic VH Pistol Ammunition",q:50},
    {opt:["Heavy Melee Weapon","Flashbang Grenade"]},{n:"Teargas Grenade",q:2},
    {n:"Light Armorjack (Body)",sp:11},{n:"Light Armorjack (Head)",sp:11}],
  solo:[{n:"Assault Rifle"},{n:"Very Heavy Pistol"},
    {opt:["Heavy Melee Weapon","Bulletproof Shield"]},
    {n:"Basic VH Pistol Ammunition",q:30},{n:"Basic Rifle Ammunition",q:70},
    {n:"Light Armorjack (Body)",sp:11},{n:"Light Armorjack (Head)",sp:11}],
  netrunner:[{n:"Very Heavy Pistol"},{n:"Basic VH Pistol Ammunition",q:30},
    {n:"Light Armorjack (Body)",sp:11},{n:"Light Armorjack (Head)",sp:11}],
  tech:[{opt:["Shotgun","Assault Rifle"]},
    {opt:["Basic Shotgun Shell Ammunition x100","Basic Rifle Ammunition x100"]},
    {n:"Flashbang Grenade"},
    {n:"Light Armorjack (Body)",sp:11},{n:"Light Armorjack (Head)",sp:11}],
  medtech:[{opt:["Shotgun","Assault Rifle"]},
    {opt:["Basic Shotgun Shell Ammunition x100","Basic Rifle Ammunition x100"]},
    {opt:["Incendiary Shotgun Shell Ammunition x10","Incendiary Rifle Ammunition x10"]},
    {n:"Smoke Grenade",q:2},
    {n:"Light Armorjack (Body)",sp:11},{n:"Light Armorjack (Head)",sp:11},
    {n:"Bulletproof Shield"}],
  media:[{opt:["Heavy Pistol","Very Heavy Pistol"]},
    {opt:["Basic H Pistol Ammunition x50","Basic VH Pistol Ammunition x50"]},
    {n:"Light Armorjack (Body)",sp:11},{n:"Light Armorjack (Head)",sp:11}],
  lawman:[{opt:["Assault Rifle","Shotgun"]},{n:"Heavy Pistol"},
    {opt:["Basic Rifle Ammunition x100","Basic Shotgun Shell Ammunition x100","Basic Slug Ammunition x100"]},
    {n:"Basic H Pistol Ammunition",q:30},
    {opt:["Bulletproof Shield","Smoke Grenade x2"]},
    {n:"Light Armorjack (Body)",sp:11},{n:"Light Armorjack (Head)",sp:11}],
  exec:[{n:"Very Heavy Pistol"},{n:"Basic VH Pistol Ammunition",q:50},
    {n:"Light Armorjack (Body)",sp:11},{n:"Light Armorjack (Head)",sp:11}],
  fixer:[{opt:["Heavy Pistol","Very Heavy Pistol"],tag:"1. Pistole"},
    {opt:["Heavy Pistol","Very Heavy Pistol"],tag:"2. Pistole"},
    {n:"Light Melee Weapon"},
    {opt:["Basic H Pistol Ammunition x100","Basic VH Pistol Ammunition x100"]},
    {n:"Light Armorjack (Body)",sp:11},{n:"Light Armorjack (Head)",sp:11}],
  nomad:[{opt:["Heavy Pistol","Very Heavy Pistol"]},
    {opt:["Basic H Pistol Ammunition x100","Basic VH Pistol Ammunition x100"]},
    {opt:["Heavy Melee Weapon","Heavy Pistol"]},
    {n:"Light Armorjack (Body)",sp:11},{n:"Light Armorjack (Head)",sp:11}]
};

/* Outfit & Gear (S. 103) */
CPR.PRESET_OUTFIT = {
  rockerboy:[{n:"Agent"},{n:"Computer"},
    {opt:["Electric Guitar","Bug Detector"]},
    {n:"Glow Paint",q:5},{n:"Pocket Amp"},{n:"Radio Scanner/Music Player"},
    {n:"Video Camera"},
    {n:"Generic Chic: Jacket, Jewelry ×3, Top ×4",fashion:true},
    {n:"Leisurewear: Jewelry, Mirrorshades, Footwear",fashion:true},
    {n:"Urban Flash: Bottoms, Top",fashion:true}],
  solo:[{n:"Agent"},
    {n:"Leisurewear: Footwear ×2, Jacket ×3, Mirrorshades, Bottoms ×2, Top ×2",fashion:true}],
  netrunner:[{n:"Agent"},{n:"Cyberdeck (7 Slots)"},{n:"Virtuality Goggles"},
    {n:"Program: Armor"},{n:"Program: Sword"},
    {opt:["Program: See Ya","Program: Eraser"]},
    {opt:["Program: Sword","Program: Vrizzbolt"]},
    {opt:["Program: Worm","Program: Sword"]},
    {n:"Generic Chic: Top ×10",fashion:true},
    {n:"Leisurewear: Footwear ×2, Jewelry, Bottoms ×2",fashion:true},
    {n:"Urban Flash: Jacket",fashion:true}],
  tech:[{n:"Agent"},{n:"Anti-Smog Breathing Mask"},{n:"Disposable Cell Phone"},
    {n:"Duct Tape",q:5},{n:"Flashlight"},{n:"Road Flare",q:6},{n:"Tech Bag"},
    {n:"Generic Chic: Bottoms ×8, Tops ×10",fashion:true},
    {n:"Leisurewear: Footwear ×2",fashion:true}],
  medtech:[{n:"Agent"},{n:"Airhypo"},{n:"Handcuffs"},{n:"Flashlight"},
    {n:"Generic Chic Jacket ×3",fashion:true},{n:"Glow Paint"},{n:"Medtech Bag"},
    {n:"Leisurewear: Footwear, Bottoms ×3, Top ×5",fashion:true}],
  media:[{n:"Agent"},{n:"Audio Recorder"},{n:"Binoculars"},
    {opt:["Disposable Cellphone ×2","Grapple Gun"]},
    {n:"Flashlight"},{n:"Computer"},{n:"Radio Scanner/Music Player"},
    {n:"Scrambler/Descrambler"},{n:"Video Camera"},
    {n:"Generic Chic: Footwear, Bottoms, Top",fashion:true},
    {n:"Leisurewear: Jacket",fashion:true},
    {n:"Urban Flash: Mirrorshades",fashion:true}],
  lawman:[{n:"Agent"},{n:"Flashlight"},{n:"Handcuffs",q:2},{n:"Radio Communicator"},
    {n:"Road Flare",q:10},
    {n:"Generic Chic: Jacket, Bottoms ×2, Top ×3",fashion:true},
    {n:"Leisurewear: Footwear ×2, Jacket ×2, Bottoms ×2, Mirrorshades, Top ×2",fashion:true}],
  exec:[{n:"Radio Communicator",q:4},{n:"Scrambler/Descrambler"},
    {n:"Businesswear: Footwear, Jacket, Bottoms, Mirrorshades, Top, Jewelry ×2",fashion:true}],
  fixer:[{n:"Agent"},{n:"Bug Detector"},{n:"Computer"},{n:"Disposable Phone ×2"},
    {n:"Generic Chic: Contacts, Jewelry",fashion:true},
    {n:"Leisurewear: Mirrorshades",fashion:true},
    {n:"Urban Flash: Footwear, Jacket, Bottoms, Top",fashion:true}],
  nomad:[{n:"Agent"},{n:"Anti-Smog Breathing Mask"},{n:"Duct Tape"},{n:"Flashlight"},
    {n:"Grapple Gun"},{n:"Inflatable Bed & Sleep-Bag"},{n:"Medtech Bag"},
    {n:"Radio Communicator",q:2},{n:"Rope"},{n:"Techtool"},
    {n:"Tent and Camping Equipment"},
    {n:"Bohemian: Jewelry",fashion:true},
    {n:"Nomad Leathers: Top ×4, Bottom ×2, Footwear ×2, Jacket, Hat",fashion:true}]
};

/* Cyberware (S. 117) – HL gesamt je Rolle (fest bei Erstellung) */
CPR.PRESET_CYBER = {
  rockerboy:{hl:9,items:[{n:"Audio Recorder (Cyberaudio)"},{n:"Chemskin"},
    {n:"Cyberaudio Suite"},{n:"Techhair"}]},
  solo:{hl:14,items:[{n:"Biomonitor"},{n:"Neural Link"},
    {opt:["Sandevistan","Wolvers"]}]},
  netrunner:{hl:14,items:[{n:"Interface Plugs"},{n:"Neural Link"},{n:"Shift Tacts"}]},
  tech:{hl:12,items:[{n:"Cybereye"},{n:"MicroOptics"},{n:"Skinwatch"},{n:"Tool Hand"}]},
  medtech:{hl:12,items:[{n:"Biomonitor"},{n:"Cybereye"},
    {opt:["Nasal Filters","Toxin Binders"]},{n:"TeleOptics"}]},
  media:{hl:10,items:[{opt:["Amplified Hearing","Voice Stress Analyzer"]},
    {n:"Cyberaudio Suite"},{n:"Light Tattoo"}]},
  lawman:{hl:10,items:[{n:"Hidden Holster"},{n:"Subdermal Pocket"}]},
  exec:{hl:12,items:[{opt:["Biomonitor","Techhair"]},{n:"Cyberaudio Suite"},
    {n:"Internal Agent"},{opt:["Toxin Binders","Nasal Filters"]}]},
  fixer:{hl:16,items:[{n:"Cyberaudio Suite"},{n:"Internal Agent"},
    {n:"Subdermal Pocket"},{opt:["Voice Stress Analyzer","Amplified Hearing"]}]},
  nomad:{hl:14,items:[{opt:["Interface Plugs","Wolvers"]},{n:"Neural Link"}]}
};

/* ---------- Budgets ---------- */
CPR.SR_BUDGET = 500;        /* Streetrat/Edgerunner Extra-Einkauf (S. 98) */
CPR.CP_BUDGET = 2550;       /* Complete Package (S. 104) */
CPR.CP_FASHION_BUDGET = 800;/* nur Fashion/Fashionware (S. 105) */
CPR.SOUL_BONUS = 1500;      /* „Seele verkaufen“ (S. 118) */

/* ---------- Lifestyle & Housing (S. 105) ---------- */
CPR.LIFESTYLE = {
  default:{housing:"Cargo Container (gemietet, Overcrowded Suburbs oder Combat Zone)",
    lifestyle:"Kibble Lifestyle",note:"1. Monat frei; danach 1.100eb/Monat am 1. – räumung am 2.!"},
  exec:{housing:"Corporate Conapt in einem Corporate Zone",
    lifestyle:"Good Prepak Lifestyle",note:"Miete 0eb (bezahlt); Lifestyle kostet 600eb am 1. jedes Monats"},
  nomadNote:"Nomads haben über ihre Moto Role Ability eine zusätzliche Housing-Option (S. 165)."
};

/* ---------- Abgeleitete Werte (S. 79/80) ---------- */
CPR.derived = function(stats){
  const body = stats.BODY, will = stats.WILL, emp = stats.EMP;
  const hp = 10 + 5*Math.ceil((body+will)/2);
  return {
    hp: hp,
    seriouslyWounded: Math.ceil(hp/2),
    deathSave: body,
    humanity: emp*10,
    emp: emp
  };
};
