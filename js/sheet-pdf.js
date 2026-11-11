"use strict";
/* ============================================================
   sheet-pdf.js – befüllt den offiziellen RTG-Bogen
   (RTG-CPR-CharacterSheet-Fillable.pdf, 3 Seiten, 413 Formularfelder)

   Benötigt zusätzlich:
     js/vendor/pdf-lib.min.js   (PDF-Lib, UMD-Bundle)
     js/sheet-pdf-b64.js        (der Bogen als Base64)

   Die Feldnamen wurden per pdfjs-Positionsanalyse aus dem
   Original-PDF ermittelt (Skill-STAT-Kästchen teilen sich die
   Feldnamen INT/REF/… mit dem Haupt-STAT-Block – einmal setzen
   füllt automatisch alle passenden Kästchen).
   Bekannte Tippfehler im Original übernommen:
     "LVLPilor Air Vehicle x2 REF"   (Pilot)
     "LVLWardrobe  Style COOL"       (Doppel-Leerzeichen)
     "Seriously Wounded Threshhold"
   ============================================================ */

/* ---------- Skill-Feld-Mapping: Basisname -> [LVL-Feld, TOTAL-Feld] ---------- */
const SP_SKILL_FIELDS = {
  /* Awareness */
  "Concentration":["Concentration Level","Concentration Total"],
  "Conceal/Reveal Object":["Conceal/Reveal LVL","Conceal/Reveal Total"],
  "Lip Reading":["LVLLip Reading INT","Lip Reading Total"],
  "Perception":["LVLPerception INT","Perception Total"],
  "Tracking":["LVLTracking INT","Tracking Total"],
  /* Body */
  "Athletics":["LVLAthletics DEX","Athletics Total"],
  "Contortionist":["LVLContortionist DEX","Contortionist Total"],
  "Dance":["LVLDance DEX","Dance Total"],
  "Endurance":["LVLEndurance WILL","Endurance Total"],
  "Resist Torture/Drugs":["LVLResist TortureDrugs WILL","Resist Total"],
  "Stealth":["LVLStealth DEX","Stealth Total"],
  /* Control */
  "Drive Land Vehicle":["LVLDrive Land Vehicle REF","Drive Land Total"],
  "Pilot Air Vehicle":["LVLPilor Air Vehicle x2 REF","Pilot Air Total"],
  "Pilot Sea Vehicle":["LVLPilot Sea Vehicle REF",null],
  "Riding":["LVLRiding REF",null],
  /* Education */
  "Accounting":["LVLAccounting INT","Accounting Total"],
  "Animal Handling":["LVLAnimal Handling INT","Animal Handling Total"],
  "Bureaucracy":["LVLBureaucracy INT","Bureaucracy Total"],
  "Business":["LVLBusiness INT","Business Total"],
  "Composition":["LVLComposition INT","Composition Total"],
  "Criminology":["LVLCriminology INT","Criminology Total"],
  "Cryptography":["LVLCryptography INT","Cryptography Total"],
  "Deduction":["LVLDeduction INT","Deduction Total"],
  "Education":["LVLEducation INT","Education Total"],
  "Gamble":["Gamble","Gamble Total"],
  "Library Search":["LVLLibrary Search INT","Library Search Total"],
  "Tactics":["LVLTactics INT","Tactics Total"],
  "Wilderness Survival":["LVLWilderness Survival INT","Wilderness Survival Total"],
  /* Fighting */
  "Brawling":["LVLBrawling DEX","Brawling Total"],
  "Evasion":["LVLEvasion DEX","Evasion Total"],
  "Martial Arts":["LVLMartial Arts x2 DEX","Martial Arts Total"],
  "Melee Weapon":["LVLMelee Weapon DEX","Melee Weapon Total"],
  /* Performance */
  "Acting":["LVLActing COOL","Acting Total"],
  /* Ranged */
  "Archery":["LVLArchery REF","Archery Total"],
  "Autofire":["LVLAutofire x2 REF","Autofire Total"],
  "Handgun":["Handgun","Handgun Total"],
  "Heavy Weapons":["LVLHeavy Weapons x2 REF","HW Total"],
  "Shoulder Arms":["LVLShoulder Arms REF","Shoulder Arms Total"],
  /* Social */
  "Bribery":["LVLBribery COOL","Bribery Total"],
  "Conversation":["LVLConversation EMP","Conversation Total"],
  "Human Perception":["LVLHuman Perception EMP","Human Perception Total"],
  "Interrogation":["LVLInterrogation COOL","Interrogation Total"],
  "Persuasion":["LVLPersuasion COOL","Persuasion Total"],
  "Personal Grooming":["LVLPersonal Grooming COOL","Personal Grooming Total"],
  "Streetwise":["LVLStreetwise COOL","Streetwise Total"],
  "Trading":["LVLTrading COOL","Trading Total"],
  "Wardrobe & Style":["LVLWardrobe  Style COOL","W&S Total"],
  /* Technique */
  "Air Vehicle Tech":["LVLAir Vehicle Tech TECH","Air V Tech Total"],
  "Basic Tech":["LVLBasic Tech TECH","Basic Tech Total"],
  "Cybertech":["LVLCybertech TECH","Cybertech Total"],
  "Demolitions":["LVLDemolitions x2 TECH","Demolitions Total"],
  "Electronics/Security Tech":["LVLElectronicsSecurity Tech x2 TECH","E/S Total"],
  "First Aid":["LVLFirst Aid TECH","First Aid Total"],
  "Forgery":["LVLForgery TECH","Forgery Total"],
  "Land Vehicle Tech":["LVLLand Vehicle Tech TECH","Land Vehicle Tech Total"],
  "Paint/Draw/Sculpt":["LVLPaintDrawSculpt TECH","P/D/S Total"],
  "Paramedic":["LVLParamedic x2 TECH","Paramedic Total"],
  "Photography/Film":["LVLPhotographyFilm TECH","Photograph/Film Total"],
  "Pick Lock":["LVLPick Lock TECH","Pick Lock Total"],
  "Pick Pocket":["LVLPick Pocket TECH","Pick Pocket Total"],
  "Sea Vehicle Tech":["LVLSea Vehicle Tech TECH","Sea Vehicle Tech Total"],
  "Weaponstech":["Weaponstech","Weaponstech Total"]
};

/* Gedruckte Standard-Zeilen (fester Skill auf dem Bogen) */
const SP_FIXED_ROWS = {
  "Language (Streetslang)":["LVLStreetslang","Lang Street Slang Total"],
  "Local Expert (Your Home)":["LVLYour Home","Local Expert 1 Total"]
};

/* Zeilen mit eigenem Namensfeld: Basisname -> [[Namensfeld, LVL, TOTAL], …] */
const SP_SPECIAL_ROWS = {
  "Language":[["Language 2","LVL","Lang 2 Total"],["Language 3","LVL_2","Lang 3 Total"]],
  "Local Expert":[["Local Expert 2","LVL_3","Local Expert 2 Total"],
                  ["Local Expert 3","LVL_4","Local Expert 3 Total"]],
  "Science":[["Science 1","LVL_5","Science 1 Total"],["Science 2","LVL_6","Science 2 Total"]],
  "Play Instrument":[["Instrument 1","LVL_7","Play I 1 Total"],["Instrument 2","LVL_8","Play I 2 Total"]]
};

/* ---------- kleine Helfer (bewusst ohne app.js-Abhängigkeit) ---------- */
function spBase(n){ return String(n).replace(/\s*\(.*\)\s*$/,""); }
function spParens(n){ const m=String(n).match(/\(([^)]*)\)\s*$/); return m?m[1]:null; }
function spStat(base){ const b=CPR.SKILL_BY_NAME[base]; return b?b.s:"INT"; }
function spDisplay(n){
  const ck=spBase(n)+" (choose 1)";
  if(CPR.CHOOSE_SKILLS[ck]&&S.skillChoices&&S.skillChoices[n])
    return spBase(n)+" ("+S.skillChoices[n]+")";
  return n;
}
/* WinAnsi-Sicherung: Zeichen, die Helvetica/WinAnsi nicht darstellen kann */
function spSan(s){
  return String(s)
    .replace(/\u2211/g,"(Sigma)")   /* ∑ in „Linear Frame ∑ (Sigma)“ */
    .replace(/\u26A0/g,"[!]")
    .replace(/\r/g,"");
}

/* ---------- Waffen-Zeilen (max. 6) ---------- */
function spWeaponRows(warn){
  const weapons=[];
  const push=(name,qty,note)=>{
    const clean=String(name).replace(/\s*\(.*\)\s*$/,"");
    const w=CPR.MELEE.find(x=>x.n===clean)||CPR.RANGED.find(x=>x.n===clean);
    weapons.push({name:name+(qty>1?" ×"+qty:""),
      dmg:w?String(w.dmg):"", ammo:w&&w.mag?String(w.mag):"",
      rof:w?String(w.rof):"", note:note||""});
  };
  if(S.role&&(S.method==="streetrat"||S.method==="edgerunner")){
    (CPR.PRESET_WEAPONS[S.role]||[]).forEach((it,idx)=>{
      const n=it.opt?it.opt[(S.presetChoices.weapons||{})[idx]||0]:it.n;
      const q=it.q||1;
      if(/Ammunition|Armorjack|Shield/i.test(n)) return; /* → Ammo-/Armor-Felder */
      push(n,q,"Preset");
    });
  }
  (S.buys||[]).forEach(b=>{
    if(b.cat==="weapon") push(b.name,b.qty||1,b.cost?b.cost+"eb":"");
  });
  if(weapons.length>6) warn(weapons.length-6+" weitere Waffen passen nicht in die 6 Zeilen des Bogens.");
  return weapons.slice(0,6);
}

/* ---------- Rüstung (Preset ersetzt, gekaufte überschreiben) ---------- */
function spArmor(){
  let body=null, head=null, shield=null;
  const isSRER=S.role&&(S.method==="streetrat"||S.method==="edgerunner");
  if(isSRER){
    (CPR.PRESET_WEAPONS[S.role]||[]).forEach((it,idx)=>{
      const n=it.opt?it.opt[(S.presetChoices.weapons||{})[idx]||0]:it.n;
      if(/Ammunition/i.test(n)) return;
      const clean=String(n).replace(/\s*\(.*\)\s*$/,"");
      const a=CPR.ARMOR.find(x=>x.n===clean);
      if(a&&a.shield){ shield={name:clean,sp:a.sp,pen:a.pen}; return; }
      if(/Shield/i.test(n)){ shield={name:clean,sp:10,pen:0}; return; }
      if(a){
        const rec={name:clean,sp:a.sp!=null?a.sp:(it.sp||11),pen:a.pen||0};
        if(/Head/i.test(n)) head=rec; else body=rec;
      }
    });
  }
  (S.buys||[]).forEach(b=>{
    if(b.cat!=="armor") return;
    const a=CPR.ARMOR.find(x=>x.n===b.name); if(!a) return;
    if(a.shield){ shield={name:b.name,sp:a.sp,pen:a.pen}; return; }
    const rec={name:b.name,sp:a.sp,pen:a.pen};
    if(b.loc==="Head") head=rec; else body=rec;
  });
  return {body,head,shield};
}

/* ---------- Cyberware-Verteilung auf die Slots des Bogens ---------- */
function spCyberMap(warn){
  /* Zeilen pro Ort: [Namensfelder, Datenfelder] */
  const LOC={
    fw:  {names:["FW1","FW2","FW3","FW4","FW5","FW6","FW7"],
          data:["FWD1","FWD2","FWD3","FWD4","FWD5","FWD6","FWD7"],label:"Fashionware"},
    nlink:{names:["NLink 1","NLink 2","NLink 3","NLink 4","NLink 5"],
          data:["NLink Data 1","NLink Data 2","NLink Data 3","NLink Data 4","NLink Data 5"],label:"Neural Link"},
    audio:{names:["Audio 1","Audio 2","Audio 3"],
          data:["A Data 1","A Data 2","A Data 3"],label:"Cyberaudio"},
    reye:{names:["R Eye 1","R Eye 2","R Eye 3"],
          data:["RE Data 1","RE Data 2","RE Data 3"],label:"rechtes Cybereye"},
    leye:{names:["L Eye 1","L Eye 2","L Eye 3"],
          data:["LE Data 1","LE Data 2","LE Data 3"],label:"linkes Cybereye"},
    rarm:{names:["R Arm 1","R Arm 2","R Arm 3","R Arm 4"],
          data:["RArm Data 1","RArm Data 2","RArm Data 3","RArm Data 4"],label:"rechter Cyberarm"},
    larm:{names:["L Arm 1","L Arm 2","L Arm 3","L Arm 4"],
          data:["LArm Data 1","LArm Data 2","LArm Data 3","LArm Data 4"],label:"linker Cyberarm"},
    rleg:{names:["R Leg 1","R Leg 2","R Leg 3"],
          data:["R Leg Data 1","R Leg Data 2","R Leg Data 3"],label:"rechtes Cyberbein"},
    lleg:{names:["L Leg 1","L Leg 2","L Leg 3"],
          data:["L Leg Data 1","L Leg Data 2","L Leg Data 3"],label:"linkes Cyberbein"},
    ic:  {names:["IC 1","IC 2","IC 3","IC 4","IC 5","IC 6","IC 7"],
          data:["ICD1","ICD2","ICD3","ICD4","ICD5","ICD6","ICD7","ICD8"],label:"Internal Cyberware"},
    ec:  {names:["EC 1","EC2","EC3","EC4","EC5","EC6","EC7"],
          data:["ECD1","ECD2","ECD3","ECD4","ECD5","ECD6","ECD7"],label:"External Cyberware"},
    borg:{names:["Borg1","Borg2","Borg3","Borg4","Borg5","Borg6","Borg7"],
          data:["BorgD1","BorgD2","BorgD3","BorgD4","BorgD5","BorgD6","BorgD7"],label:"Borgware"}
  };
  const rows={}; Object.keys(LOC).forEach(k=>rows[k]=[]);
  let eyes=0, arms=0, legs=0, suites=0, links=0;

  const items=[];
  if(S.role&&(S.method==="streetrat"||S.method==="edgerunner")){
    (CPR.PRESET_CYBER[S.role].items||[]).forEach((it,idx)=>{
      const n=it.opt?it.opt[(S.presetChoices.cyber||{})[idx]||0]:it.n;
      items.push({name:n,def:CPR.CYBER_BY_NAME[n]||{},qty:1});
    });
  }
  (S.buys||[]).forEach(b=>{
    if(b.cat==="cyberware"||b.cat==="fashionware")
      items.push({name:b.name,def:CPR.CYBER_BY_NAME[b.name]||{},qty:b.qty||1});
  });

  items.forEach(it=>{ /* 1. Durchlauf: Foundational zählen */
    const d=it.def||{};
    if(d.n==="Neural Link") links+=it.qty;
    else if(d.n==="Cybereye"&&d.found) eyes+=it.qty;
    else if(d.n==="Cyberarm"&&d.found) arms+=it.qty;
    else if(d.n==="Cyberleg"&&d.found) legs+=it.qty;
    else if(d.n==="Cyberaudio Suite") suites+=it.qty;
  });
  items.forEach(it=>{ /* 2. Durchlauf: Optionen zuordnen */
    const d=it.def||{}; const cat=d.cat;
    if(cat==="Fashionware"){ rows.fw.push(it); }
    else if(cat==="Neuralware"){ if(!d.found) rows.nlink.push(it); }
    else if(cat==="Cyberaudio"){ if(!d.found) rows.audio.push(it); }
    else if(cat==="Cyberoptics"){
      if(d.found) return;
      if(d.paired&&it.qty>=2){ rows.reye.push(it); rows.leye.push({...it,qty:1}); }
      else rows.reye.push({...it,qty:1});
    }
    else if(cat==="Cyberlimbs"){
      if(d.found) return;
      const isLeg=d.req==="Cyberleg"||/Foot|Leg/.test(d.n)&&!/Arm/.test(d.n);
      if(isLeg) rows.rleg.push({...it,qty:1});
      else rows.rarm.push({...it,qty:1});
    }
    else if(cat==="Internal Body Cyberware"){ rows.ic.push(it); }
    else if(cat==="External Body Cyberware"){ rows.ec.push(it); }
    else if(cat==="Borgware"){ rows.borg.push(it); }
  });

  /* Überlauf: rechts vor links (reye→leye, rarm→larm, rleg→lleg) */
  ["reye","rarm","rleg"].forEach(k=>{
    const to=k.replace(/^r/,"l");
    const cap=LOC[k].names.length;
    if(rows[k].length>cap){
      const overflow=rows[k].slice(cap); rows[k]=rows[k].slice(0,cap);
      rows[to]=overflow.concat(rows[to]);
    }
  });

  const V={}, CHECKS=[];
  Object.keys(LOC).forEach(k=>{
    const loc=LOC[k], list=rows[k];
    if(list.length>loc.names.length)
      warn(list.length-loc.names.length+" weitere Teile passen nicht in "+loc.label+"-Zeilen.");
    list.slice(0,loc.names.length).forEach((it,i)=>{
      const d=it.def||{};
      V[loc.names[i]]=spSan(it.name+(it.qty>1?" ×"+it.qty:""));
      V[loc.data[i]]=spSan((d.slots?d.slots+" Slot"+(d.slots>1?"s":"")+" · ":"")+
        (d.hl!=null?"HL "+d.hl:"")+(d.cost?" · "+d.cost+"eb":""));
    });
  });
  if(links>=1) CHECKS.push("Link Box");
  if(suites>=1) CHECKS.push("Audio Box");
  if(eyes>=1) CHECKS.push("R Eye Box");
  if(eyes>=2) CHECKS.push("L Eye Box");
  if(arms>=1) CHECKS.push("R Arm Box");
  if(arms>=2) CHECKS.push("L Arm Box");
  if(legs>=1) CHECKS.push("R Leg Box");
  if(legs>=2) CHECKS.push("L Leg Box");
  return {V,CHECKS};
}

/* ---------- Hauptfunktion: State -> Feldwerte ---------- */
/* dvOverride: nur für Tests (Node); im Browser wird derived() aus app.js genutzt */
CPR.sheetPDFValues=function(dvOverride){
  const dv=dvOverride!=null?dvOverride:(typeof derived==="function"?derived():null);
  const V={}, CHECKS=[], WARNS=[];
  const warn=m=>WARNS.push(m);
  const set=(f,v)=>{ if(v==null||v==="") return; V[f]=spSan(String(v)); };
  const isSRER=S.method==="streetrat"||S.method==="edgerunner";

  /* --- Identität --- */
  set("Handle",S.name);
  const role=S.role?CPR.ROLES[S.role]:null;
  set("Role",role?role.name:"");
  set("Role Ability",role?role.ability:"");
  set("Role Ability Rank",S.roleAbility!=null?S.roleAbility:4);

  /* --- STATs (skill-STAT-Kästchen teilen die Felder) ---
     Achtung: LUCK existiert nur als LUCK MAX/LUCK CURRENT, EMP nur als
     EMP (=aktueller Wert) + EMP MAX (=STAT) – siehe unten. */
  const st=S.stats||{};
  ["INT","REF","DEX","TECH","COOL","WILL","MOVE","BODY"].forEach(k=>{
    if(st[k]!=null) set(k,st[k]);
  });
  set("LUCK MAX",st.LUCK); set("LUCK CURRENT",st.LUCK);
  set("EMP MAX",st.EMP);
  set("EMP",dv?dv.empEff:st.EMP);

  /* --- Abgeleitete Werte / Kampfkasten --- */
  if(dv){
    set("Max HP",dv.hp); set("Current HP",dv.hp);
    set("Seriously Wounded Threshhold",dv.sw);
    set("Death Save",dv.deathSave);
    set("Current Humanity",dv.humanity);
    set("Max Humanity",dv.humMax);
  } else warn("STATs fehlen – abgeleitete Werte bleiben leer.");
  set("Reputation","0"); set("Current IP","0"); set("Total IP","0");

  /* --- Skills --- */
  const used={}; /* belegte Spezialzeilen pro Basis-Skill */
  const skillRows=[];
  if(S.method==="streetrat"&&S.role){
    (CPR.STREETRAT_SKILLS[S.role]||[]).forEach(([n,v])=>skillRows.push({n,v}));
  } else {
    Object.keys(S.skills||{}).forEach(n=>skillRows.push({n,v:S.skills[n]}));
  }
  if(S.culturalLang) skillRows.push({n:"Language ("+S.culturalLang+")",v:CPR.CULTURAL_LANG_RANK});
  skillRows.forEach(({n,v})=>{
    const disp=spDisplay(n), base=spBase(disp), spec=spParens(disp);
    let lvl=null,total=null,nameField=null;
    if(SP_FIXED_ROWS[n]||SP_FIXED_ROWS[disp]){
      const f=SP_FIXED_ROWS[n]||SP_FIXED_ROWS[disp]; lvl=f[0]; total=f[1];
    } else if(SP_SPECIAL_ROWS[base]){
      const list=SP_SPECIAL_ROWS[base];
      used[base]=used[base]||0;
      const row=list[used[base]++];
      if(row){ nameField=row[0]; lvl=row[1]; total=row[2]; }
      else { warn("Zu viele "+base+"-Skills für die Bogenzeilen."); return; }
    } else if(SP_SKILL_FIELDS[base]){
      const f=SP_SKILL_FIELDS[base]; lvl=f[0]; total=f[1];
    } else { warn("Skill „"+disp+"“ hat kein Feld auf dem RTG-Bogen."); return; }
    const stat=spStat(base);
    const statVal=stat==="EMP"?(dv?dv.empEff:st.EMP):(st[stat]!=null?st[stat]:0);
    set(lvl,v);
    if(total) set(total,(statVal||0)+v);
    if(nameField) set(nameField,spec||base);
  });

  /* --- Waffen --- */
  spWeaponRows(warn).forEach((w,i)=>{
    set("WEAPONRow"+(i+1),w.name); set("DMGRow"+(i+1),w.dmg);
    set("AMMORow"+(i+1),w.ammo); set("ROFRow"+(i+1),w.rof);
    set("NOTESRow"+(i+1),w.note);
  });

  /* --- Rüstung --- */
  const ar=spArmor();
  if(ar.head){ set("Head Armor",ar.head.name); set("SPHead",ar.head.sp); set("PENALTYHead",ar.head.pen); }
  if(ar.body){ set("Body Armor",ar.body.name); set("SPBody",ar.body.sp); set("PENALTYBody",ar.body.pen); }
  if(ar.shield){ set("Shield",ar.shield.name); set("SPShield",ar.shield.sp); set("PENALTYShield",ar.shield.pen); }

  /* --- Gear / Ammo / Cash / Fashion --- */
  const gears=[],fashions=[],ammos=[];
  if(S.role&&isSRER){
    (CPR.PRESET_OUTFIT[S.role]||[]).forEach((it,idx)=>{
      const n=it.opt?it.opt[(S.presetChoices.outfit||{})[idx]||0]:it.n;
      if(it.fashion) fashions.push(n);
      else gears.push({n,q:it.q||1,note:""});
    });
    (CPR.PRESET_WEAPONS[S.role]||[]).forEach((it,idx)=>{
      const n=it.opt?it.opt[(S.presetChoices.weapons||{})[idx]||0]:it.n;
      const q=it.q||1;
      if(/Ammunition/i.test(n)) ammos.push(n+(q>1?" ×"+q:""));
    });
  }
  (S.buys||[]).forEach(b=>{
    const q=b.qty>1?" ×"+b.qty:"";
    if(b.cat==="gear") gears.push({n:b.name,q:b.qty||1,note:b.cost?b.cost+"eb":""});
    else if(b.cat==="fashion") fashions.push(b.name+q);
    else if(b.cat==="ammo") ammos.push(b.name+" ("+(b.qty||1)*10+" Schuss)");
  });
  gears.slice(0,18).forEach((g,i)=>{
    set("Gear "+(i+1),g.n+(g.q>1?" ×"+g.q:""));
    if(g.note) set("Gear Notes "+(i+1),g.note);
  });
  if(gears.length>18) warn(gears.length-18+" weitere Gear-Teile passen nicht in die 18 Zeilen.");
  if(ammos.length) set("Ammo",ammos.join("; "));
  if(fashions.length) set("FASHION",fashions.join("; "));

  /* Bargeld */
  let cash=null;
  if(isSRER) cash=CPR.SR_BUDGET-(S.buys||[]).reduce((a,b)=>a+b.cost*b.qty,0);
  else if(S.method==="complete"){
    let fash=0,cyber=0,main=0;
    (S.buys||[]).forEach(b=>{
      const c=b.cost*b.qty;
      if(b.cat==="fashion"||b.cat==="fashionware") fash+=c;
      else if(b.cat==="cyberware") cyber+=c;
      else main+=c;
    });
    const soulAvail=S.sellSoul?CPR.SOUL_BONUS:0;
    const fromSoul=Math.min(soulAvail,cyber);
    cash=CPR.CP_BUDGET-(main+(cyber-fromSoul)+Math.max(0,fash-CPR.CP_FASHION_BUDGET));
  }
  if(cash!=null) set("Cash",cash+"eb");

  /* --- Lifepath --- */
  const lp=S.lp||{};
  const L=(k,arr)=>(lp[k]!=null&&arr&&arr[lp[k]]!=null)?arr[lp[k]]:null;
  const co=lp.culturalRegion!=null?LP.culturalOrigins[lp.culturalRegion]:null;
  set("Cultural Origins",co?(co.region+(S.culturalLang?" – "+S.culturalLang:"")):S.culturalLang);
  set("Personality",L("personality",LP.personality));
  const cs=L("clothingStyle",LP.clothingStyle), af=L("affectation",LP.affectation);
  set("Clothing Style",cs?(cs+(af?" · Affectation: "+af:"")):af);
  set("Hairstyle",L("hairstyle",LP.hairstyle));
  set("What Value Most",L("values",LP.values));
  set("Feelings About People",L("feelings",LP.feelings));
  set("Who Value Most",L("valuedPerson",LP.valuedPerson));
  set("Valued Possession",L("valuedPossession",LP.valuedPossession));
  set("Family Background",L("familyBackground",LP.familyBackground));
  set("Childhood Env",L("environment",LP.environment));
  set("Family Crisis",L("familyCrisis",LP.familyCrisis));
  set("Life Goals",L("lifeGoal",LP.lifeGoals));
  for(let i=0;i<3;i++){
    if(lp["friend_"+i]!=null) set("Friend "+(i+1),LP.friendRelation[lp["friend_"+i]]);
    if(lp["love_"+i]!=null) set("Love Affair "+(i+1),LP.loveAffairEndings[lp["love_"+i]]);
    if(lp["enemyType_"+i]!=null){
      set("Who "+(i+1),LP.enemyType[lp["enemyType_"+i]]);
      const cause=L("enemyCause_"+i,LP.enemyCause);
      const wronged=lp["enemyWronged_"+i];
      set(i===0?"What Caused It":"What Caused it "+(i+1),cause+
        (wronged?(wronged==="me"?" (you were wronged)":" (they were wronged)"):""));
      set("Throw At You "+(i+1),L("enemyRes_"+i,LP.enemyResources));
      set("Happen "+(i+1),L("enemyRevenge_"+i,LP.sweetRevenge));
    }
  }

  /* Housing / Rent / Lifestyle (S. 105) */
  const ls=S.role==="exec"?CPR.LIFESTYLE.exec:CPR.LIFESTYLE.default;
  set("Housing",ls.housing);
  set("Rent",S.role==="exec"?"0eb (Firma zahlt)":"1.100eb/Monat");
  set("Lifestyle",ls.lifestyle);

  /* Rollen-Lifepath */
  if(S.role){
    const lines=[];
    (LP.roleLifepath[S.role]||[]).forEach((tbl,i)=>{
      const val=tbl.choice?lp["role_"+i+"_choice"]
        :(lp["role_"+i]!=null?tbl.opts[lp["role_"+i]]:null);
      if(val) lines.push(tbl.t+" "+val);
    });
    if(lines.length) set("ROLE SPECIFIC LIFEPATH",lines.join("\n"));
  }

  /* --- Cyberware (Seite 3) --- */
  const cy=spCyberMap(warn);
  Object.keys(cy.V).forEach(k=>set(k,cy.V[k]));
  cy.CHECKS.forEach(c=>CHECKS.push(c));

  /* --- Notizen --- */
  const m=S.method==="streetrat"?"Streetrat":S.method==="edgerunner"?"Edgerunner":"Complete Package";
  let notes="Erstellt per "+m+"-Methode (Core Rules S. "+(S.method==="complete"?"42":"41")+").";
  if(S.sellSoul) notes+=" Seele verkauft an "+(S.soulEmployer||"Arbeitgeber")+" (+1.500eb, S. 118).";
  if(WARNS.length) notes+=" [!] "+WARNS.length+" Hinweis(e) in der Konsole.";
  set("Notes",notes);

  return {values:V,checks:CHECKS,warns:WARNS};
};

/* ---------- PDF erzeugen & herunterladen ---------- */
async function fillSheetPDF(){
  if(typeof PDFLib==="undefined"||!window.CPR_SHEET_PDF_B64){
    toast("[!] PDF-Werkzeuge nicht geladen (js/vendor/pdf-lib.min.js, js/sheet-pdf-b64.js).");
    return;
  }
  try{
    toast("PDF wird befüllt …");
    const raw=atob(window.CPR_SHEET_PDF_B64);
    const bytes=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++) bytes[i]=raw.charCodeAt(i);
    const {PDFDocument,PDFName,PDFBool,PDFTextField}=PDFLib;
    const pdf=await PDFDocument.load(bytes);
    const form=pdf.getForm();
    const {values,checks,warns}=CPR.sheetPDFValues();

    let filled=0;
    for(const [f,v] of Object.entries(values)){
      try{
        const field=form.getField(f);
        if(field instanceof PDFTextField){
          let txt=String(v);
          try{ if(!field.isMultiline()) txt=txt.replace(/\n/g," | "); }catch(e){}
          field.setText(txt);
          filled++;
        }
      }catch(e){ warns.push("Feld nicht gefunden: "+f); }
    }
    checks.forEach(f=>{
      try{ form.getCheckBox(f).check(); filled++; }catch(e){ warns.push("Checkbox nicht gefunden: "+f); }
    });
    /* Viewer bitten, Erscheinungsbilder neu zu rendern */
    try{ form.acroForm.dict.set(PDFName.of("NeedAppearances"),PDFBool.True); }catch(e){}

    const out=await pdf.save();
    const blob=new Blob([out],{type:"application/pdf"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=((S.name||"charakter")+"-RTG-Bogen.pdf").toLowerCase()
      .replace(/[^a-z0-9äöüß.\-]+/gi,"-");
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),3000);
    toast("RTG-Bogen befüllt ("+filled+" Felder) und heruntergeladen."+
      (warns.length?" "+warns.length+" Warnung(en).":""));
    if(warns.length) console.warn("[sheet-pdf]",warns);
  }catch(e){
    console.error("[sheet-pdf]",e);
    toast("[!] PDF-Befüllung fehlgeschlagen: "+e.message);
  }
}

/* Button-Binding (delegiert, übersteht Re-Renders) */
if(typeof document!=="undefined"){
  document.addEventListener("click",ev=>{
    const btn=ev.target&&ev.target.closest?ev.target.closest("#btn-pdf"):null;
    if(btn){ ev.preventDefault(); fillSheetPDF(); }
  });
}
