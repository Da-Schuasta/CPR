"use strict";
/* ============================================================
   sheet-alt.js – alternativer Charakterbogen
   ("cyberpunk_sheets_getrennt": Hintergrundbilder + Felddaten)

   Baut den Bogen direkt im Sheet-Screen auf, befüllt ihn aus dem
   Charakter-State und lässt ihn drucken bzw. als JSON exportieren.
   Verfügbar für die Rollen, für die ein getrennter Bogen existiert
   (aktuell Solo und Medtech).
   ============================================================ */

(function(){
  var ALT_ROLES = ["solo", "medtech"];
  var _current = null; // {role, data, els, root}

  /* ---------- Helfer ---------- */
  function altBase(n){ return String(n).replace(/\s*\(.*\)\s*$/,""); }
  function altParens(n){ const m=String(n).match(/\(([^)]*)\)\s*$/); return m?m[1]:null; }
  function altHas(obj, key){ return Object.prototype.hasOwnProperty.call(obj, key); }
  function altRoleAvailable(role){
    return ALT_ROLES.indexOf(role)>=0 &&
      !!(window.CPR_ALT_SHEETS && window.CPR_ALT_SHEETS[role]);
  }
  function altGetData(role){
    return altRoleAvailable(role) ? window.CPR_ALT_SHEETS[role] : null;
  }

  CPR.altSheetRoles = ALT_ROLES.slice();
  CPR.altSheetAvailable = altRoleAvailable;

  /* ---------- Skill-Felder des alternativen Bogens ---------- */
  var ALT_SKILL_PREFIX = {
    "Concentration":"CON",
    "Lip Reading":"LIP READ",
    "Perception":"PERCEPTION",
    "Tracking":"TRACKING",
    "Athletics":"ATLETHICS",
    "Contortionist":"CONTORTIONIST",
    "Dance":"DANCE",
    "Endurance":"ENDURANCE",
    "Resist Torture/Drugs":"RESIST TORTURE",
    "Stealth":"STEALTH",
    "Drive Land Vehicle":"DRIVE LAND",
    "Pilot Air Vehicle":"PILOT AIR",
    "Pilot Sea Vehicle":"PILOT SEA",
    "Riding":"RIDING",
    "Accounting":"ACCOUNTING",
    "Animal Handling":"ANIMAL",
    "Bureaucracy":"BUREAUCRACY",
    "Business":"BUSINESS",
    "Composition":"COMPOSITION",
    "Criminology":"CRIMINOLOGY",
    "Cryptography":"CRYPTOLOGY",
    "Deduction":"DEDUCTION",
    "Education":"EDUCATION",
    "Gamble":"GAMBLE",
    "Library Search":"LIBRARY",
    "Tactics":"TACTICS",
    "Wilderness Survival":"WILDERNESS",
    "Brawling":"BRAWLING",
    "Evasion":"EVASION",
    "Melee Weapon":"MELEE WEP",
    "Acting":"ACT COOL",
    "Archery":"ARCHERY",
    "Autofire":"AUTOFIRE",
    "Handgun":"HANDGUN",
    "Heavy Weapons":"HEAVY WEP",
    "Shoulder Arms":"SHOULDER ARMS",
    "Bribery":"BRIBERY",
    "Conversation":"CONVERSATION",
    "Human Perception":"HUMAN PER",
    "Interrogation":"INTERROGATION",
    "Persuasion":"PERSUASION",
    "Personal Grooming":"PER GROOM",
    "Streetwise":"STREETWISE",
    "Trading":"TRADING",
    "Wardrobe & Style":"WARDROBE",
    "Air Vehicle Tech":"AIR VECH TECH",
    "Basic Tech":"BASIC TECH",
    "Cybertech":"CYBERTECH",
    "Demolitions":"DEMOLITION",
    "Electronics/Security Tech":"ELECTRONICS TECH",
    "First Aid":"FIRST AID",
    "Forgery":"FORGERY",
    "Land Vehicle Tech":"LAND VECH TECH",
    "Paint/Draw/Sculpt":"PAINT",
    "Paramedic":"PARAMEDIC",
    "Photography/Film":"PHOTO",
    "Pick Lock":"PICK LOCK",
    "Pick Pocket":"PICK POCKET",
    "Sea Vehicle Tech":"SEA VEHICLE TECH",
    "Weaponstech":"WEAPONSTECH"
  };

  /* Sonderfall: Feldnamen sind im Bogen unterschiedlich geschrieben */
  var ALT_SKILL_IRREGULAR = {
    "Conceal/Reveal Object":{
      lvl:"CONSEAL LVL", mod:"CONSEAL MOD", stat:"CONCEAL STAT", base:"CONSEAL BASE"
    }
  };

  /* Skills mit eigenen Namenszeilen: [Name, LVL, MOD, STAT, BASE] */
  var ALT_SPECIAL_ROWS = {
    "Language":[
      ["LANGUAGE 1","LANGUAGE LVL","LANGUAGE MOD","LANGUAGE STAT","LANGUAGE BASE"],
      ["LANGUAGE 2","LANGUAGE LVL 2","LANGUAGE MOD 2","LANGUAGE STAT 2","LANGUAGE BASE 2"],
      ["LANGUAGE 3","LANGUAGE LVL 3","LANGUAGE MOD 3","LANGUAGE STAT 3","LANGUAGE BASE 3"]
    ],
    "Local Expert":[
      ["LOCAL EXPERT 1","LOCAL EXPERT LVL","LOCAL EXPERT MOD","LOCAL EXPERT STAT","LOCAL EXPERT BASE"],
      ["LOCAL EXPERT 2","LOCAL EXPERT LVL 2","LOCAL EXPERT MOD 2","LOCAL EXPERT STAT 2","LOCAL EXPERT BASE 2"],
      ["LOCAL EXPERT 3","LOCAL EXPERT LVL 3","LOCAL EXPERT MOD 3","LOCAL EXPERT STAT 3","LOCAL EXPERT BASE 3"]
    ],
    "Science":[
      ["science 1","SCIENCE LVL","SCIENCE MOD","SCIENCE STAT","SCIENCE BASE"],
      ["science 2","SCIENCE LVL 2","SCIENCE MOD 2","SCIENCE STAT 2","SCIENCE BASE 2"]
    ],
    "Play Instrument":[
      ["INSTRUMENT 1","PLAY INSTRU LVL","PLAY INSTRU MOD","PLAY INSTRU STAT","PLAY INSTRU BASE"],
      ["INSTRUMENT 2","PLAY INSTRU LVL 2","PLAY INSTRU MOD 2","PLAY INSTRU STAT 2","PLAY INSTRU BASE 2"]
    ],
    "Martial Arts":[
      ["MARTIAL ARTS 1","MARTIAL ART LVL","MARTIAL ART MOD","MARTIAL ART STAT","MARTIAL ART BASE"]
    ]
  };

  /* ---------- Werte aus dem State ---------- */
  CPR.altSheetValues = function(role, dvOverride){
    const data = altGetData(role);
    if(!data) return null;
    const dv = dvOverride!=null ? dvOverride : (typeof derived==="function" ? derived() : null);
    const fields = data.fields || [];
    const names = Object.create(null);
    fields.forEach(f=>{ names[f.name]=true; });
    const has = n=>!!names[n];
    const stat = S.stats || {};

    const V = {}, CHECKS = [], WARNS = [];
    const warn = m=>WARNS.push(m);
    const set = (f,v)=>{
      if(v==null || v==="" || !has(f)) return;
      V[f] = String(v);
    };

    /* --- Identität / Kampfwerte --- */
    set("NAME1", S.name);
    set("ALIASES1", S.handle);
    set("RANK1", S.roleAbility!=null ? S.roleAbility : 4);
    const roleDef = S.role ? CPR.ROLES[S.role] : null;
    set("ROLE ABILITY DESCRIPTION1", roleDef ? roleDef.ra : "");
    if(dv){
      set("HP LEFT1", dv.hp);
      set("HP RIGHT1", dv.hp);
      set("HUMANITY LEFT1", dv.humanity);
      set("HUMANITY RIGHT1", dv.humMax);
      set("DEATH SAVE1", dv.deathSave);
      if(has("Seriously Wounded Number1")) set("Seriously Wounded Number1", dv.sw);
      else set("SERIOUSLY WOUNDED DESCRIPTION1", dv.sw);
      set("INITIATIVE1", dv.effStats ? dv.effStats.REF : stat.REF);
    } else {
      warn("STATs fehlen – abgeleitete Werte bleiben leer.");
    }

    /* --- STATs --- */
    ["INT","REF","DEX","TECH","COOL","WILL","MOVE","BODY"].forEach(k=>{
      if(stat[k]!=null) set(k, stat[k]);
    });
    if(stat.LUCK!=null){ set("LUCK LEFT", stat.LUCK); set("LUCK RIGHT", stat.LUCK); }
    /* Hauptkästchen = aktueller Wert, "out of"-Kästchen = Maximum. */
    const empVal = dv ? dv.empEff : stat.EMP;
    set("EMP  LEFT", empVal);
    set("EMP  RIGHT", stat.EMP!=null ? stat.EMP : empVal);

    set("REPUTATION1", "0");
    set("IMPROVEMENT POINTS LEFT1", "0");
    set("IMPROVEMENT POINTS RIGHT1", "0");

    /* --- Skills --- */
    const skillRows = [];
    if(S.method==="streetrat" && S.role){
      (CPR.STREETRAT_SKILLS[S.role]||[]).forEach(([n,v])=>skillRows.push({n,v}));
    } else {
      Object.keys(S.skills||{}).forEach(n=>skillRows.push({n,v:S.skills[n]}));
    }
    if(S.culturalLang) skillRows.push({n:"Language ("+S.culturalLang+")",v:CPR.CULTURAL_LANG_RANK});

    const specialUsed = {};
    const specials = [];
    const statValue = (name)=>{
      const def = CPR.SKILL_BY_NAME[altBase(name)];
      const s = def ? def.s : "INT";
      return s==="EMP" ? (dv?dv.empEff:(stat.EMP||0)) : (stat[s]||0);
    };
    const statLabel = (name)=>{
      const def = CPR.SKILL_BY_NAME[altBase(name)];
      return def ? def.s : "?";
    };

    skillRows.forEach(row=>{
      const disp = (typeof displaySkillName==="function") ? displaySkillName(row.n) : row.n;
      const base = altBase(disp);
      const spec = altParens(disp);
      const sVal = statValue(disp);
      const sLbl = statLabel(disp);
      const level = row.v;
      const list = ALT_SPECIAL_ROWS[base];
      if(list){
        specialUsed[base] = specialUsed[base] || 0;
        const r = list[specialUsed[base]++];
        if(!r){
          warn("Zu viele "+base+"-Skills für die Zeilen des alternativen Bogens.");
          return;
        }
        set(r[0], spec||base);
        set(r[1], level);
        set(r[2], 0);
        set(r[3], sVal);
        set(r[4], sVal+level);
        specials.push({name:spec||base, stat:sLbl, statVal:sVal, level:level});
      } else {
        const irr = ALT_SKILL_IRREGULAR[base];
        const prefix = irr ? null : ALT_SKILL_PREFIX[base];
        if(!irr && !prefix){
          warn("Skill „"+disp+"“ hat kein Feld auf dem alternativen Bogen.");
          return;
        }
        const f = irr || {
          lvl:prefix+" LVL", mod:prefix+" MOD", stat:prefix+" STAT", base:prefix+" BASE"
        };
        set(f.lvl, level);
        set(f.mod, 0);
        set(f.stat, sVal);
        set(f.base, sVal+level);
      }
    });

    /* Freie "Specialised Skills"-Box. Die Feldnummern sind im Bogen
       nicht in optischer Reihenfolge (2,1,4,3,6,5,8 – eine 7 fehlt). */
    const SPEC_ROWS = [2,1,4,3,6,5,8];
    specials.slice(0,SPEC_ROWS.length).forEach((r,i)=>{
      const n = SPEC_ROWS[i];
      set("SPEC SKILL NAME "+n, r.name);
      set("SPEC STAT LEFT "+n, r.stat);
      set("SPEC MOD "+n, 0);
      set("SPEC LVL "+n, r.level);
      set("SPEC STAT RIGHT "+n, r.statVal);
      set("SPEC BASE "+n, r.statVal+r.level);
    });
    if(specials.length>SPEC_ROWS.length)
      warn(specials.length-SPEC_ROWS.length+" weitere Spezialisierungen passen nicht in die Specialised-Skills-Box.");

    /* --- Waffen --- */
    if(typeof spWeaponRows==="function"){
      spWeaponRows(warn).forEach((w,i)=>{
        const n=i+1;
        set("WEAPON "+n, w.name);
        set("DMG "+n, w.dmg);
        set("MAG "+n, w.ammo);
        set("ROF "+n, w.rof);
        set("WEAPON NOTES "+n+" TOP1", w.note);
      });
    }

    /* --- Rüstung (Bogenzeilen: HEAD=2, BODY=1, SHIELD=4) --- */
    if(typeof spArmor==="function"){
      const ar = spArmor();
      if(ar.head){ set("ARMOR 2",ar.head.name); set("SP 2",ar.head.sp); set("PENALTY 2",ar.head.pen); }
      if(ar.body){ set("ARMOR 1",ar.body.name); set("SP 1",ar.body.sp); set("PENALTY 1",ar.body.pen); }
      if(ar.shield){ set("ARMOR 4",ar.shield.name); set("SP 4",ar.shield.sp); set("PENALTY 4",ar.shield.pen); }
    }

    /* --- Gear / Fashion / Ammo / Cash --- */
    const isSRER = S.method==="streetrat" || S.method==="edgerunner";
    const gears=[], fashions=[], ammos=[];
    if(S.role && isSRER){
      (CPR.PRESET_OUTFIT[S.role]||[]).forEach((it,idx)=>{
        const n = it.opt ? it.opt[(S.presetChoices.outfit||{})[idx]||0] : it.n;
        if(it.fashion) fashions.push(n);
        else gears.push({n:n, q:it.q||1, cost:null});
      });
      (CPR.PRESET_WEAPONS[S.role]||[]).forEach((it,idx)=>{
        const n = it.opt ? it.opt[(S.presetChoices.weapons||{})[idx]||0] : it.n;
        const q = it.q||1;
        if(/Ammunition/i.test(n)) ammos.push({n:n+(q>1?" ×"+q:""), cost:null});
      });
    }
    (S.buys||[]).forEach(b=>{
      const q = b.qty||1;
      if(b.cat==="gear") gears.push({n:b.name, q:q, cost:b.cost!=null?b.cost*q:null});
      else if(b.cat==="fashion") fashions.push(b.name+(q>1?" ×"+q:""));
      else if(b.cat==="ammo") ammos.push({n:b.name+" ("+q*10+" Schuss)", cost:b.cost!=null?b.cost*q:null});
    });
    const allGear = gears.concat(ammos);
    allGear.slice(0,18).forEach((g,i)=>{
      const n=i+1;
      set("GEAR "+n, g.n+(g.q>1?" ×"+g.q:""));
      if(g.cost!=null) set("COST "+n, g.cost);
    });
    if(allGear.length>18) warn(allGear.length-18+" weitere Gear-Teile passen nicht in die 18 Zeilen des alternativen Bogens.");
    if(fashions.length) set("Fashion1", fashions.join("; "));

    let cash = null;
    if(isSRER) cash = CPR.SR_BUDGET - (S.buys||[]).reduce((a,b)=>a+b.cost*b.qty,0);
    else if(S.method==="complete"){
      let fash=0, cyber=0, main=0;
      (S.buys||[]).forEach(b=>{
        const c=b.cost*b.qty;
        if(b.cat==="fashion"||b.cat==="fashionware") fash+=c;
        else if(b.cat==="cyberware") cyber+=c;
        else main+=c;
      });
      const soulAvail = S.sellSoul ? CPR.SOUL_BONUS : 0;
      const fromSoul = Math.min(soulAvail, cyber);
      cash = CPR.CP_BUDGET - (main + (cyber-fromSoul) + Math.max(0, fash-CPR.CP_FASHION_BUDGET));
    }
    if(cash!=null) set("CASH1", cash);

    /* --- Lifepath --- */
    const lp = S.lp || {};
    const L = (k,arr)=>(lp[k]!=null && arr && arr[lp[k]]!=null) ? arr[lp[k]] : null;
    const co = lp.culturalRegion!=null ? LP.culturalOrigins[lp.culturalRegion] : null;
    set("CULT ORIGINS1", co ? (co.region+(S.culturalLang?" – "+S.culturalLang:"")) : S.culturalLang);
    set("PERSONLITY1", L("personality",LP.personality));
    const cs = L("clothingStyle",LP.clothingStyle), af = L("affectation",LP.affectation);
    set("CLOTHING STYLES1", cs ? (cs+(af?" · Affectation: "+af:"")) : af);
    set("HAIRSTYLES1", L("hairstyle",LP.hairstyle));
    set("VALUE MOST1", L("values",LP.values));
    set("FEELIGNS ABOUT PEOPLE1", L("feelings",LP.feelings));
    set("MOST VALUED PERSON1", L("valuedPerson",LP.valuedPerson));
    set("MOST VALUED POSSESSION1", L("valuedPossession",LP.valuedPossession));
    set("FAMILY BACKGROUND1", L("familyBackground",LP.familyBackground));
    set("CHILDHOOD ENVIROMENT1", L("environment",LP.environment));
    set("FAMILY CRISIS1", L("familyCrisis",LP.familyCrisis));
    set("LIFE GOALS1", L("lifeGoal",LP.lifeGoals));

    for(let i=0;i<3;i++){
      if(lp["friend_"+i]!=null) set("FRIENDS "+(i+1), LP.friendRelation[lp["friend_"+i]]);
      if(lp["love_"+i]!=null) set("TRAGIC LOVE "+(i+1), LP.loveAffairEndings[lp["love_"+i]]);
      if(lp["enemyType_"+i]!=null){
        set("ENEMIES "+(i+1), LP.enemyType[lp["enemyType_"+i]]);
        const cause = L("enemyCause_"+i,LP.enemyCause);
        const wronged = lp["enemyWronged_"+i];
        set("CAUSE "+(i+1), cause+(wronged?(wronged==="me"?" (you were wronged)":" (they were wronged)"):""));
        set("THROW AT YOU "+(i+1), L("enemyRes_"+i,LP.enemyResources));
        set("WHAT GONNA HAPPEN "+(i+1), L("enemyRevenge_"+i,LP.sweetRevenge));
      }
    }

    const ls = S.role==="exec" ? CPR.LIFESTYLE.exec : CPR.LIFESTYLE.default;
    set("HOUSING1", ls.housing);
    set("RENT1", S.role==="exec" ? "0eb (Firma zahlt)" : "1.100eb/Monat");
    set("LIFESTYLE1", ls.lifestyle);

    if(S.role){
      const lines=[];
      (LP.roleLifepath[S.role]||[]).forEach((tbl,i)=>{
        const val = tbl.choice ? lp["role_"+i+"_choice"]
          : (lp["role_"+i]!=null ? tbl.opts[lp["role_"+i]] : null);
        if(val) lines.push(tbl.t+" "+val);
      });
      if(lines.length) set("ROLE LIFEPATH1", lines.join("\n"));
    }

    /* --- Cyberware --- */
    const cy = altCyberRows(warn);
    const byName = Object.create(null);
    fields.forEach(f=>{ byName[f.name]=true; });
    const seq = (prefix)=>{
      const out=[];
      for(let i=1;i<=40;i++){
        const n = prefix+" "+i;
        if(byName[n]) out.push(n);
      }
      return out;
    };
    const fillCat = (list, nameFields, dataFields, label)=>{
      list.slice(0,nameFields.length).forEach((it,i)=>{
        const d = it.def || {};
        const q = it.qty>1 ? " ×"+it.qty : "";
        set(nameFields[i], it.name+q);
        const parts=[];
        if(d.slots!=null) parts.push(d.slots+" S");
        if(d.hl!=null) parts.push("HL "+d.hl);
        if(d.cost) parts.push(d.cost+"eb");
        if(parts.length) set(dataFields[i], parts.join(" · "));
      });
      if(list.length>nameFields.length)
        warn(list.length-nameFields.length+" weitere Teile passen nicht in "+label+"-Zeilen.");
    };
    fillCat(cy.fw,    seq("FASHIONWARE"), seq("FASHIONWARE DATA"), "Fashionware");
    fillCat(cy.nlink, seq("NEURAL LINK"), seq("NEURAL LINK DATA"), "Neural Link");
    fillCat(cy.audio, seq("CYBERAUDIO"), seq("CYBERAUDIO DATA"), "Cyberaudio");
    fillCat(cy.reye,  seq("CYBERERE R"), seq("CYBERERE R DATA"), "rechtes Cybereye");
    fillCat(cy.leye,  seq("CYBERERE L"), seq("CYBERERE L DATA"), "linkes Cybereye");
    fillCat(cy.rarm,  seq("CYBERARM R"), seq("CYBERARM R DATA"), "rechter Cyberarm");
    fillCat(cy.larm,  seq("CYBERARM L"), seq("CYBERARM L DATA"), "linker Cyberarm");
    fillCat(cy.rleg,  seq("CYBERLEG R"), seq("CYBERLEG R LEG DATA"), "rechtes Cyberbein");
    fillCat(cy.lleg,  seq("CYBERLEG L"), seq("CYBERLEG L DATA"), "linkes Cyberbein");
    fillCat(cy.ic,    seq("INTERNAL"), seq("INTERNAL DATA"), "Internal Cyberware");
    fillCat(cy.ec,    seq("EXTERNAL"), seq("EXTERNAL  DATA"), "External Cyberware");
    fillCat(cy.borg,  seq("BORWARE"), seq("BORWARE DATA"), "Borgware");

    if(cy.links>=1) CHECKS.push("NEURALINK CHECK1");
    if(cy.suites>=1) CHECKS.push("CYBERAUDIO CHECK1");
    if(cy.eyes>=1) CHECKS.push("CYBEREYE R CHECK1");
    if(cy.eyes>=2) CHECKS.push("CYBEREYE L CHECK1");
    if(cy.arms>=1) CHECKS.push("CYBERARM R CHECK1");
    if(cy.arms>=2) CHECKS.push("CYBERARM L CHECK1");
    if(cy.legs>=1) CHECKS.push("CYBERLEG R CHECK1");
    if(cy.legs>=2) CHECKS.push("CYBERLEG L CHECK1");
    if(cy.ic.length) CHECKS.push("INTERNAL CHECK1");
    if(cy.ec.length) CHECKS.push("EXTERNAL CHECK1");
    if(cy.borg.length) CHECKS.push("BORGWARE CHECK1");
    if(cy.fw.length) CHECKS.push("FASHIONWARE CHECK1");

    return {values:V, checks:CHECKS, warns:WARNS};
  };

  /* ---------- Cyberware auf die Bogen-Kategorien verteilen ---------- */
  function altCyberRows(warn){
    const rows = {fw:[],nlink:[],audio:[],reye:[],leye:[],rarm:[],larm:[],rleg:[],lleg:[],ic:[],ec:[],borg:[]};
    let links=0, eyes=0, arms=0, legs=0, suites=0;
    const items = [];
    if(S.role && (S.method==="streetrat" || S.method==="edgerunner")){
      (CPR.PRESET_CYBER[S.role].items||[]).forEach((it,idx)=>{
        const n = it.opt ? it.opt[(S.presetChoices.cyber||{})[idx]||0] : it.n;
        items.push({name:n, def:CPR.CYBER_BY_NAME[n]||{}, qty:1});
      });
    }
    (S.buys||[]).forEach(b=>{
      if(b.cat==="cyberware" || b.cat==="fashionware")
        items.push({name:b.name, def:CPR.CYBER_BY_NAME[b.name]||{}, qty:b.qty||1});
    });

    items.forEach(it=>{
      const d=it.def||{};
      if(d.n==="Neural Link") links+=it.qty;
      else if(d.n==="Cybereye" && d.found) eyes+=it.qty;
      else if(d.n==="Cyberarm" && d.found) arms+=it.qty;
      else if(d.n==="Cyberleg" && d.found) legs+=it.qty;
      else if(d.n==="Cyberaudio Suite") suites+=it.qty;
    });
    items.forEach(it=>{
      const d=it.def||{};
      const cat=d.cat;
      if(cat==="Fashionware") rows.fw.push(it);
      else if(cat==="Neuralware"){ if(!d.found) rows.nlink.push(it); }
      else if(cat==="Cyberaudio"){ if(!d.found) rows.audio.push(it); }
      else if(cat==="Cyberoptics"){
        if(d.found) return;
        if(d.paired && it.qty>=2){ rows.reye.push(it); rows.leye.push(Object.assign({},it,{qty:1})); }
        else rows.reye.push(Object.assign({},it,{qty:1}));
      }
      else if(cat==="Cyberlimbs"){
        if(d.found) return;
        const isLeg = d.req==="Cyberleg" || (/Foot|Leg/.test(d.n) && !/Arm/.test(d.n));
        if(isLeg) rows.rleg.push(Object.assign({},it,{qty:1}));
        else rows.rarm.push(Object.assign({},it,{qty:1}));
      }
      else if(cat==="Internal Body Cyberware"){ rows.ic.push(it); }
      else if(cat==="External Body Cyberware"){ rows.ec.push(it); }
      else if(cat==="Borgware"){ rows.borg.push(it); }
    });

    ["reye","rarm","rleg"].forEach(k=>{
      const to = k.replace(/^r/,"l");
      const cap = 4; /* der Bogen bietet mindestens 4 Zeilen je Seite */
      if(rows[k].length>cap){
        const overflow = rows[k].slice(cap);
        rows[k] = rows[k].slice(0,cap);
        rows[to] = overflow.concat(rows[to]);
      }
    });
    return {fw:rows.fw,nlink:rows.nlink,audio:rows.audio,reye:rows.reye,leye:rows.leye,
      rarm:rows.rarm,larm:rows.larm,rleg:rows.rleg,lleg:rows.lleg,ic:rows.ic,ec:rows.ec,
      borg:rows.borg,links:links,eyes:eyes,arms:arms,legs:legs,suites:suites};
  }

  /* ---------- Renderer ---------- */
  CPR.renderAltSheet = function(container, role){
    const data = altGetData(role);
    if(!data) return null;
    const res = CPR.altSheetValues(role);
    const values = res ? res.values : {};
    const checks = res ? res.checks : [];
    const calcTargets = Object.create(null);
    (data.calculations||[]).forEach(c=>{ calcTargets[c.target]=true; });

    container.innerHTML = "";
    const root = document.createElement("div");
    root.className = "alt-sheet";
    const els = Object.create(null);

    data.pages.forEach(pg=>{
      const page = document.createElement("div");
      page.className = "alt-page";
      page.dataset.altW = pg.width_pt;
      page.style.aspectRatio = pg.width_pt+"/"+pg.height_pt;
      page.style.width = (pg.width_pt/1190.55*100)+"%";
      const img = document.createElement("img");
      img.src = (data.bgDir||"")+pg.background;
      img.alt = "";
      page.appendChild(img);

      data.fields.filter(f=>f.page===pg.page).forEach(f=>{
        let e;
        if(f.type==="checkbox"){
          e = document.createElement("input");
          e.type = "checkbox";
        } else if(f.type==="textarea"){
          e = document.createElement("textarea");
        } else if(f.type==="text"){
          e = document.createElement("input");
          e.type = "text";
        } else {
          return; /* Button/Bildfelder werden nicht gebraucht */
        }
        e.className = "alt-field";
        e.name = f.name;
        e.title = f.tooltip || f.name;
        e.style.left = f.x_pct+"%";
        e.style.top = f.y_pct+"%";
        e.style.width = f.w_pct+"%";
        e.style.height = f.h_pct+"%";
        e.style.textAlign = f.align || "left";
        if(f.color) e.style.setProperty("--alt-color", f.color);
        if(f.max_len) e.maxLength = f.max_len;
        if(f.readonly) e.readOnly = true;
        const hPt = f.rect_pt ? (f.rect_pt[3]-f.rect_pt[1]) : 0;
        const fsPt = f.font_size_pt>0 ? f.font_size_pt : Math.min(14, hPt*0.62);
        e.style.setProperty("--alt-fs", (fsPt/pg.width_pt*100).toFixed(4));
        e.style.setProperty("--alt-lh", (hPt/pg.width_pt*100).toFixed(4));
        e.dataset.altH = hPt;
        els[f.name] = e;
        page.appendChild(e);
      });
      root.appendChild(page);
    });

    container.appendChild(root);

    /* Werte setzen */
    for(const name in values){
      const e = els[name];
      if(!e) continue;
      if(e.type==="checkbox") e.checked = !!values[name];
      else e.value = values[name];
    }
    checks.forEach(name=>{ if(els[name] && els[name].type==="checkbox") els[name].checked = true; });

    /* Berechnungen des Bogens (SUM/PRD) ausführen */
    altRecalc(data, els, values);

    _current = {role:role, data:data, els:els, root:root};
    return {values:values, checks:checks, warns:res?res.warns:[], root:root, els:els};
  };

  function altRecalc(data, els, fixed){
    const done = fixed || {};
    /* Der Bogen nutzt für EMP-Skills das Max-Feld; wir wollen den aktuellen Wert. */
    const fieldFor = (n)=> (n==="EMP  RIGHT" && els["EMP  LEFT"]) ? "EMP  LEFT" : n;
    const num = (n)=>{
      const e = els[fieldFor(n)];
      if(!e) return 0;
      const v = parseFloat(String(e.value).replace(",","."));
      return isNaN(v) ? 0 : v;
    };
    for(let pass=0; pass<3; pass++){
      (data.calculations||[]).forEach(c=>{
        const e = els[c.target];
        if(!e) return;
        /* Bereits aus dem Charakter berechnete Werte nicht überschreiben. */
        if(done[c.target]!=null && done[c.target]!=="") return;
        const hasInput = c.inputs.some(n=>{
          const x = els[fieldFor(n)];
          return x && String(x.value).trim()!=="";
        });
        if(!hasInput){ e.value=""; return; }
        const r = c.op==="SUM"
          ? c.inputs.reduce((a,n)=>a+num(n),0)
          : c.inputs.reduce((a,n)=>a*num(n),1);
        e.value = r;
      });
    }
  }

  /* Werte inkl. nachgerechneter SUM/PRD-Felder (fuer den PDF-Export) */
  CPR.altSheetAllValues = function(role){
    const data = altGetData(role);
    if(!data) return null;
    const res = CPR.altSheetValues(role) || {values:{},checks:[],warns:[]};
    const els = Object.create(null);
    data.fields.forEach(f=>{
      if(f.type==="checkbox"){
        els[f.name] = {type:"checkbox",
          checked: !!(res.values[f.name] || res.checks.indexOf(f.name)>=0)};
      } else if(f.type==="text" || f.type==="textarea"){
        els[f.name] = {type:"text",
          value: res.values[f.name]!=null ? String(res.values[f.name]) : ""};
      }
    });
    altRecalc(data, els, res.values);
    const values = {};
    data.fields.forEach(f=>{
      if(f.type==="checkbox") values[f.name] = {checked:!!els[f.name].checked};
      else if(f.type==="text" || f.type==="textarea")
        values[f.name] = {value: String(els[f.name].value==null?"":els[f.name].value)};
    });
    return {data:data, values:values, checks:res.checks, warns:res.warns};
  };

  /* Aktuelle Bogenwerte als JSON (ohne berechnete Felder) */
  CPR.altSheetCurrentJSON = function(role){
    const data = altGetData(role);
    if(!data) return null;
    const cur = _current && _current.role===role ? _current : null;
    if(!cur){
      const res = CPR.altSheetValues(role);
      return res ? res.values : {};
    }
    const calcTargets = Object.create(null);
    (data.calculations||[]).forEach(c=>{ calcTargets[c.target]=true; });
    const out = {};
    Object.keys(cur.els).forEach(n=>{
      if(calcTargets[n]) return;
      const e = cur.els[n];
      out[n] = e.type==="checkbox" ? e.checked : e.value;
    });
    return out;
  };
})();
