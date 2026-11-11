/* ============================================================
   app.js – Cyberpunk RED Charaktererschaffung (Logik)
   Folgt den Flowcharts S. 41 (Streetrat/Edgerunner, 8 Schritte)
   und S. 42 (Complete Package, 6 Schritte).
   ============================================================ */
"use strict";

/* =============== Utilities =============== */
const $ = (sel)=>document.querySelector(sel);
const $$ = (sel)=>Array.from(document.querySelectorAll(sel));
const esc = (s)=>String(s==null?"":s).replace(/[&<>"']/g,c=>
  ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const eb = (n)=> (n===0?"0" : Number(n).toLocaleString("de-DE")) + "eb";

function d(n){ // Würfeln + loggen
  const r = 1 + Math.floor(Math.random()*n);
  diceLog(`1d${n} → <b>${r}</b>`);
  return r;
}
let _diceEntries = [];
function diceLog(html){
  _diceEntries.unshift(`<div>${new Date().toLocaleTimeString("de-DE")} · ${html}</div>`);
  if(_diceEntries.length>60) _diceEntries.pop();
  const box = $("#dicelog-entries");
  if(box) box.innerHTML = _diceEntries.join("");
}
function toast(msg){
  const t=$("#toast"); t.innerHTML=msg; t.classList.remove("hidden");
  clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.add("hidden"),2600);
}

/* =============== State =============== */
const SAVE_KEY = "cpr-chargen-v1";
let S = null; // Character State

function freshState(method){
  return {
    v:1, method, name:"", handle:"",
    role:null, roleAbility:CPR.ROLE_ABILITY_START,
    stats:{}, statMode:null, statRolls:null, statPointsUsed:0,
    skills:{}, skillChoices:{}, culturalLang:null, culturalRegion:null,
    lp:{}, // Lifepath-Ergebnisse
    presetChoices:{weapons:{},outfit:{},cyber:{}}, // Index der „oder“-Wahl
    buys:[], // Einkäufe {cat,name,cost,qty,loc,hl,slots,req,cyber}
    sellSoul:false, soulEmployer:null,
    step:"start", visited:{}
  };
}
function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(S)); }catch(e){} }
function load(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return false;
    S = JSON.parse(raw);
    return !!(S && S.method);
  }catch(e){ return false; }
}

/* =============== Abgeleitete Werte =============== */
function cyberList(){
  /* alle installierten Cyberware-Teile: Preset-Auswahlen + Einkäufe */
  const out = [];
  if(S.role && (S.method==="streetrat"||S.method==="edgerunner")){
    const pre = CPR.PRESET_CYBER[S.role];
    pre.items.forEach((it,idx)=>{
      let n = it.n;
      if(it.opt){ n = it.opt[S.presetChoices.cyber[idx]||0]; }
      const def = CPR.CYBER_BY_NAME[n];
      out.push({name:n, def, src:"Preset", hl:def?def.hl:0});
    });
  }
  (S.buys||[]).forEach(b=>{
    if(b.cat==="cyberware"||b.cat==="fashionware"){
      out.push({name:b.name, def:CPR.CYBER_BY_NAME[b.name], src:"gekauft", hl:b.hl||0, cost:b.cost*b.qty});
    }
  });
  return out;
}
function presetCyberHL(){
  if(!(S.method==="streetrat"||S.method==="edgerunner")||!S.role) return 0;
  return CPR.PRESET_CYBER[S.role].hl;
}
function derived(){
  if(!S.stats||!S.stats.BODY) return null;
  const base = CPR.derived(S.stats);
  const hl = presetCyberHL() + cyberList()
    .filter(c=>c.src==="gekauft").reduce((a,c)=>a+(c.hl||0),0);
  const hum = base.humanity - hl;
  const empEff = Math.max(0, Math.floor(hum/10));
  const cyberpsycho = hum<0;
  /* Rüstungsmalus */
  let pen = 0, armorBody = null, armorHead = null;
  const worn = [];
  if(S.method==="streetrat"||S.method==="edgerunner"){
    // Preset-Rüstung: Light Armorjack Body+Head = kein Malus; Bulletproof Shield keiner
  }
  (S.buys||[]).forEach(b=>{
    if(b.cat==="armor"){
      const a = CPR.ARMOR.find(x=>x.n===b.name);
      if(!a) return;
      if(a.shield) return; /* Bulletproof Shield: belegt nur einen Arm, kein Malus, kein Körper-SP */
      if(b.loc==="Head"){ armorHead={...a, name:b.name}; }
      else { armorBody={...a, name:b.name}; }
      if(a.pen<pen) pen=a.pen;
    }
  });
  const effStats = {};
  CPR.STATS.forEach(st=>effStats[st]=S.stats[st]);
  ["REF","DEX","MOVE"].forEach(st=>{
    effStats[st] = Math.max(st==="MOVE"?0:1, effStats[st]+pen);
  });
  return {
    hp:base.hp, sw:base.seriouslyWounded, deathSave:base.deathSave,
    humanity:hum, humMax:base.humanity, hl, empEff, empBase:base.emp,
    cyberpsycho, armorPen:pen, armorBody, armorHead, effStats
  };
}

/* =============== Navigation / Stepper =============== */
function stepList(){
  if(!S||!S.method) return [];
  if(S.method==="complete"){
    return [
      {id:"role",  no:1, label:"Rolle wählen", page:"S. 29"},
      {id:"lifepath", no:2, label:"Lifepath", page:"S. 43"},
      {id:"stats", no:3, label:"STATS kaufen", page:"S. 78"},
      {id:"derived", no:4, label:"Abgeleitete Werte", page:"S. 79"},
      {id:"skills", no:5, label:"Skills setzen", page:"S. 90"},
      {id:"shop", no:6, label:"Stuff kaufen", page:"S. 104"},
      {id:"sheet", no:"★", label:"Charakterbogen", page:""}
    ];
  }
  return [
    {id:"role",  no:1, label:"Rolle wählen", page:"S. 29"},
    {id:"lifepath", no:2, label:"Lifepath", page:"S. 43"},
    {id:"stats", no:3, label:"STATS würfeln", page:"S. 73/77"},
    {id:"derived", no:4, label:"Abgeleitete Werte", page:"S. 79"},
    {id:"skills", no:5, label:"Skills setzen", page:"S. 86/88"},
    {id:"equip", no:6, label:"Waffen & Rüstung", page:"S. 98", tab:"weapons"},
    {id:"equip", no:7, label:"Outfit", page:"S. 103", tab:"outfit"},
    {id:"equip", no:8, label:"Cyberware", page:"S. 117", tab:"cyber"},
    {id:"sheet", no:"★", label:"Charakterbogen", page:""}
  ];
}
function equipTab(){ return S&&S.equipTab||"weapons"; }

function renderStepper(){
  const steps = stepList();
  $("#stepper").innerHTML = steps.map(st=>{
    const cls = [
      "step",
      (S&&S.step===st.id&&(!st.tab||equipTab()===st.tab))?"active":"",
      S&&isStepDone(st)?"done":""
    ].join(" ");
    const tabAttr = st.tab?` data-tab="${st.tab}"`:"";
    return `<button class="${cls}" data-goto="${st.id}"${tabAttr} type="button">
      ${typeof st.no==="number"?("Schritt "+st.no):"★"} · ${esc(st.label)}</button>`;
  }).join("");
  $$("#stepper .step").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const id = btn.dataset.goto, tab = btn.dataset.tab;
      if(id==="start"||!S||!S.method) return;
      if(id==="equip"){ S.equipTab=tab; go("equip"); }
      else go(id);
    });
  });
}
function isStepDone(st){
  if(!S||!S.role) return false;
  switch(st.id){
    case "role": return !!S.role;
    case "lifepath": return !!S.lpDone;
    case "stats": return CPR.STATS.every(k=>S.stats[k]>=1);
    case "derived": return CPR.STATS.every(k=>S.stats[k]>=1);
    case "skills": return !!S.skillsDone;
    case "equip": return st.tab? !!S.visited["equip-"+st.tab] : false;
    case "shop": return !!S.shopDone;
    case "sheet": return false;
  }
  return false;
}
function go(step){
  S.step = step;
  if(step==="equip") S.visited["equip-"+equipTab()]=true;
  renderAll();
  window.scrollTo({top:0,behavior:"auto"});
  save();
}
function renderAll(){
  $$(".screen").forEach(sc=>sc.classList.add("hidden"));
  const map = {start:"screen-start",role:"screen-role",lifepath:"screen-lifepath",
    stats:"screen-stats",derived:"screen-derived",skills:"screen-skills",
    equip:"screen-equip",shop:"screen-shop",sheet:"screen-sheet"};
  const id = map[S.step]||"screen-start";
  $("#"+id).classList.remove("hidden");
  renderStepper();
  const R = {start:renderStart, role:renderRole, lifepath:renderLifepath,
    stats:renderStats, derived:renderDerived, skills:renderSkills,
    equip:renderEquip, shop:renderShop, sheet:renderSheet};
  R[S.step]();
}

/* =============== Screen: Start =============== */
function renderStart(){
  const hasSave = !!S.role;
  const flow41 = `<ol class="flow">
    <li><b>#1 Pick a Role</b> – Role Ability auf 4</li>
    <li><b>#2 Run Your Lifepath</b> – allgemein + Rollen-Lifepath; Kultursprache Rang 4</li>
    <li><b>#3 Roll Your STATs</b> – Streetrat: 1d10 auf Template · Edgerunner: 1d10 je STAT</li>
    <li><b>#4 Calculate Derived Statistics</b> – HP, Humanity</li>
    <li><b>#5 Set Your Skills</b> – Streetrat: fix · Edgerunner: 86 Punkte</li>
    <li><b>#6 Record Weapons, Armor</b> – Preset + 500eb Extra</li>
    <li><b>#7 Record Outfit</b> – Preset + Lifestyle & Housing</li>
    <li><b>#8 Record Cyberware</b> – Preset, Humanity abziehen</li>
  </ol>`;
  const flow42 = `<ol class="flow">
    <li><b>#1 Pick a Role</b> – Role Ability auf 4</li>
    <li><b>#2 Run Your Lifepath</b> – allgemein + Rollen-Lifepath; Kultursprache Rang 4</li>
    <li><b>#3 Buy Your STATs</b> – 62 Punkte, min 2 / max 8</li>
    <li><b>#4 Calculate Derived Statistics</b> – HP, Humanity</li>
    <li><b>#5 Set Your Skills</b> – 86 Punkte, Basic Skills min 2, max 6</li>
    <li><b>#6 Buy Your Stuff</b> – 2.550eb + 800eb Fashion; optional: Seele verkaufen</li>
  </ol>`;
  $("#start-content").innerHTML = `
    <h1>Willkommen in Night City, Choomba.</h1>
    <p class="dim">Charaktererschaffung nach dem <em>Cyberpunk RED Core Rulebook</em>.
    Wähle deine Methode – der Ablauf folgt exakt den Flowcharts auf Buchseite&nbsp;41
    (Streetrat&nbsp;/&nbsp;Edgerunner) und 42 (Complete Package).</p>
    ${hasSave?`
    <div class="panel green">
      <h3>Gespeicherten Charakter gefunden</h3>
      <p>${esc(S.name||"Unbenannt")} · ${S.role?esc(CPR.ROLES[S.role].name):"keine Rolle"} ·
      Methode: ${S.method==="streetrat"?"Streetrat":S.method==="edgerunner"?"Edgerunner":"Complete Package"}</p>
      <div class="btn-row">
        <button class="btn btn-primary" id="btn-resume" type="button">▶ Fortsetzen</button>
        <button class="btn btn-danger" id="btn-discard" type="button">Verwerfen &amp; neu beginnen</button>
      </div>
    </div>`:""}
    <div class="grid g3">
      <div class="card" data-method="streetrat">
        <h4>🎲 Streetrat (Templates)</h4>
        <p>Schnellste Methode: 1d10 auf dem Rollen-Template – STATs, Skills und Ausrüstung
        stehen fest. Perfekt für Einsteiger und Runden mit wenig Zeit.<br><br>
        <b>Flowchart S. 41 – 8 Schritte</b></p>
        ${flow41}
      </div>
      <div class="card" data-method="edgerunner">
        <h4>⚡ Edgerunner (Fast &amp; Dirty)</h4>
        <p>STATs per 1d10 je STAT aus dem Rollen-Template, Skills mit 86 Punkten frei
        verteilt (2–6). Ausrüstung wie beim Streetrat.<br><br>
        <b>Flowchart S. 41 – 8 Schritte</b></p>
        ${flow41}
      </div>
      <div class="card" data-method="complete">
        <h4>💰 Complete Package (Calculated)</h4>
        <p>Vollste Kontrolle: 62 Punkte für STATs, 86 für Skills, 2.550eb Einkauf +
        800eb nur für Fashion. Zeitaufwendig, aber frei.<br><br>
        <b>Flowchart S. 42 – 6 Schritte</b></p>
        ${flow42}
      </div>
    </div>
    <div class="panel cyan">
      <h3>Beachte</h3>
      <ul>
        <li>Die Kultursprache aus dem Lifepath bekommst du immer <b>gratis auf Rang 4</b> (S. 45).</li>
        <li><b>Streetrat/Edgerunner</b> bekommen zusätzlich <b>500eb</b> zum Einkaufen oder Sparen (S. 98).</li>
        <li><b>Complete Package</b>: 2.550eb für alles + 800eb nur Fashion/Fashionware (S. 104/105).
        Rest aus dem Hauptbudget bleibt; Fashion-Rest verfällt.</li>
        <li>Cyberware senkt deine <b>Humanity</b> – unter 0 heißt Cyberpsychose. EMP-Wert sinkt
        entsprechend (S. 80).</li>
      </ul>
    </div>`;
  $$("[data-method]").forEach(card=>{
    card.addEventListener("click",()=>{
      const m = card.dataset.method;
      S = freshState(m);
      save();
      toast("Neuer Charakter – Methode: "+card.querySelector("h4").textContent);
      go("role");
    });
  });
  const res = $("#btn-resume");
  if(res) res.addEventListener("click",()=>{ go(S.step&&S.step!=="start"?S.step:"role"); });
  const dis = $("#btn-discard");
  if(dis) dis.addEventListener("click",()=>{
    if(confirm("Gespeicherten Charakter wirklich verwerfen?")){
      try{ localStorage.removeItem(SAVE_KEY); }catch(e){}
      S=freshState(null); renderAll();
    }
  });
}

/* =============== Screen: Rolle (Schritt #1) =============== */
function renderRole(){
  const cur = S.role;
  $("#role-content").innerHTML = `
    <h1>Schritt 1 · Pick a Role <span class="dim">(S. 29)</span></h1>
    <p class="dim">Zehn Rollen, zehn Arten, in der Dark Future zu überleben.
    Deine <b>Role Ability startet auf Rang 4</b> – das sind deine Jahre auf der Street.</p>
    <label class="fld"><span>Name des Charakters (optional, jederzeit änderbar)</span>
      <input type="text" id="inp-name" value="${esc(S.name||"")}" placeholder="z. B. Johnny"></label>
    <div class="grid g2">
      ${CPR.ROLE_ORDER.map(k=>{
        const r=CPR.ROLES[k];
        return `<div class="card ${cur===k?"selected":""}" data-role="${k}">
          <h4>${esc(r.name)}</h4>
          <p>${esc(r.blurb)}</p>
          <p><b style="color:var(--cyan)">Role Ability:</b> ${esc(r.ability)} – ${esc(r.ra)}</p>
        </div>`;
      }).join("")}
    </div>
    <div class="nav-row">
      <button class="btn" type="button" onclick="go('start')">◀ Zurück</button>
      <button class="btn btn-primary" id="btn-role-next" type="button" ${cur?"":"disabled"}>Weiter zu Schritt 2 ▶</button>
    </div>`;
  const nameEl=$("#inp-name");
  nameEl.addEventListener("input",()=>{S.name=nameEl.value;save();});
  $$("[data-role]").forEach(card=>{
    card.addEventListener("click",()=>{
      S.role = card.dataset.role;
      /* Rollenwechsel: Presets/Skills/Lifepath zurücksetzen; STAT-Bezug bei SR/ER ebenfalls */
      S.skills={}; S.skillChoices={}; S.skillsDone=false;
      S.lp={}; S.lpDone=false;
      S.presetChoices={weapons:{},outfit:{},cyber:{}};
      if(S.method!=="complete"){ S.stats={}; S.statRolls=null; S.statTplIdx=null; }
      save(); renderRole();
    });
  });
  $("#btn-role-next").addEventListener("click",()=>go("lifepath"));
}

/* =============== Screen: Lifepath (Schritt #2) =============== */
/* Generic-Reihenfolge wie im Buch S. 45–53 */
function lpTable(key,title,sub,dieSides,opts,selected,onPick,rollLabel){
  const selIdx = selected!=null?selected:-1;
  return `<div class="lp-item" data-lp="${key}">
    <div class="lp-label"><b>${esc(title)}</b><small>${esc(sub||"")} – würfle ${dieSides?"1d"+dieSides:"oder wähle"}</small></div>
    <div class="lp-controls">
      ${dieSides?`<button class="btn-dice" data-roll="${key}" type="button" title="Würfeln">🎲</button>`:""}
      <select data-pick="${key}">
        <option value="-1">– wählen –</option>
        ${opts.map((o,i)=>`<option value="${i}" ${i===selIdx?"selected":""}>${esc(o)}</option>`).join("")}
      </select>
    </div>
  </div>`;
}

function renderLifepath(){
  const lp = S.lp;
  const set=(k,v)=>{lp[k]=v;save();};
  const rollFor=(k,dieSides,opts)=>{
    const r=d(dieSides); set(k,r-1); renderLifepath();
    toast(`🎲 1d${dieSides}: ${opts[r-1]}`);
  };

  /* --- Cultural Origins --- */
  const coIdx = lp.culturalRegion!=null?lp.culturalRegion:-1;
  const langList = coIdx>=0?LP.culturalOrigins[coIdx].langs:[];
  const langSel = lp.culturalLang||"";
  /* --- Friends/Enemies/Love counts --- */
  const friendCount = lp.friendCount!=null?lp.friendCount:null;
  const enemyCount = lp.enemyCount!=null?lp.enemyCount:null;
  const loveCount = lp.loveCount!=null?lp.loveCount:null;

  let html = `
    <h1>Schritt 2 · Run Your Lifepath <span class="dim">(S. 43)</span></h1>
    <p class="dim">Würfle (🎲) oder wähle direkt. Der Lifepath ist ein Abenteuer-Generator –
    wenn ein Ergebnis nicht passt, darfst du laut Buch frei wählen. Du läufst sowohl den
    <b>allgemeinen</b> als auch den <b>Rollen-Lifepath</b>.</p>

    <div class="panel">
      <h2>Cultural Origins <span class="dim">(S. 45)</span></h2>
      ${lpTable("culturalRegion","Woher stammt deine Familie?","1d10 Region – dann Sprache wählen",10,
        LP.culturalOrigins.map(c=>c.region),coIdx,null,"Region")}
      <div class="lp-item">
        <div class="lp-label"><b>Deine Kultursprache</b>
          <small>Du bekommst diese Language auf <b>Rang 4 – gratis</b> (S. 45/85)</small></div>
        <div class="lp-controls">
          <select data-lang>
            <option value="">– Sprache wählen –</option>
            ${langList.map(l=>`<option ${l===langSel?"selected":""}>${esc(l)}</option>`).join("")}
            ${langSel&&!langList.includes(langSel)?`<option selected>${esc(langSel)}</option>`:""}
          </select>
        </div>
      </div>
    </div>

    <div class="panel">
      <h2>Your Personality <span class="dim">(S. 46)</span></h2>
      ${lpTable("personality","What are you like?","1d10",10,LP.personality,lp.personality)}
    </div>

    <div class="panel">
      <h2>Dress and Personal Style <span class="dim">(S. 47)</span></h2>
      ${lpTable("clothingStyle","Clothing Style","1d10",10,LP.clothingStyle,lp.clothingStyle)}
      ${lpTable("hairstyle","Hairstyle","1d10",10,LP.hairstyle,lp.hairstyle)}
      ${lpTable("affectation","Affectation – nie ohne","1d10",10,LP.affectation,lp.affectation)}
    </div>

    <div class="panel">
      <h2>Motivations &amp; Relationships <span class="dim">(S. 48)</span></h2>
      ${lpTable("values","What do you value most?","1d10",10,LP.values,lp.values)}
      ${lpTable("feelings","How do you feel about most people?","1d10",10,LP.feelings,lp.feelings)}
      ${lpTable("valuedPerson","Most valued person in your life?","1d10",10,LP.valuedPerson,lp.valuedPerson)}
      ${lpTable("valuedPossession","Most valued possession you own?","1d10",10,LP.valuedPossession,lp.valuedPossession)}
    </div>

    <div class="panel">
      <h2>Your Background <span class="dim">(S. 49)</span></h2>
      ${lpTable("familyBackground","Original family background","1d10",10,LP.familyBackground,lp.familyBackground)}
      ${lpTable("environment","Childhood environment","1d10",10,LP.environment,lp.environment)}
      ${lpTable("familyCrisis","Your family crisis","1d10",10,LP.familyCrisis,lp.familyCrisis)}
    </div>`;

  /* --- Friends --- */
  html += `<div class="panel green">
    <h2>Your Friends <span class="dim">(S. 51)</span></h2>
    <div class="lp-item">
      <div class="lp-label"><b>Anzahl Freunde</b><small>1d10 − 7 (mindestens 0)</small></div>
      <div class="lp-controls">
        <button class="btn-dice" id="roll-friends" type="button">🎲</button>
        <b style="font-family:var(--mono)">${friendCount!=null?friendCount:"–"}</b>
        ${friendCount!=null?`<button class="btn btn-ghost btn-small" id="clear-friends" type="button">reset</button>`:""}
      </div>
    </div>
    ${friendCount?Array.from({length:friendCount}).map((_,i)=>`
      ${lpTable("friend_"+i,"Freund #"+(i+1)+" – Beziehung","1d10",10,LP.friendRelation,
        lp["friend_"+i])}`).join(""):""}
  </div>`;

  /* --- Enemies --- */
  html += `<div class="panel red">
    <h2>Your Enemies <span class="dim">(S. 51)</span></h2>
    <div class="lp-item">
      <div class="lp-label"><b>Anzahl Feinde</b><small>1d10 − 7 (mindestens 0)</small></div>
      <div class="lp-controls">
        <button class="btn-dice" id="roll-enemies" type="button">🎲</button>
        <b style="font-family:var(--mono)">${enemyCount!=null?enemyCount:"–"}</b>
        ${enemyCount!=null?`<button class="btn btn-ghost btn-small" id="clear-enemies" type="button">reset</button>`:""}
      </div>
    </div>
    ${enemyCount?Array.from({length:enemyCount}).map((_,i)=>`
      <div class="lp-sub">
        <h3>Feind #${i+1}</h3>
        ${lpTable("enemyType_"+i,"Wer ist er/sie?","1d10",10,LP.enemyType,lp["enemyType_"+i])}
        ${lpTable("enemyCause_"+i,"Was war die Ursache?","1d10",10,LP.enemyCause,lp["enemyCause_"+i])}
        <div class="lp-item choice">
          <div class="lp-label"><b>Who's been wronged?</b><small>Wahl laut Buch (choose)</small></div>
          <div class="lp-controls">
            <select data-enemywronged="${i}">
              <option value="">– wählen –</option>
              <option value="me" ${lp["enemyWronged_"+i]==="me"?"selected":""}>Ich wurde übergangen/falsch behandelt</option>
              <option value="them" ${lp["enemyWronged_"+i]==="them"?"selected":""}>Der Feind wurde übergangen/falsch behandelt</option>
            </select>
          </div>
        </div>
        ${lpTable("enemyRes_"+i,"Was können sie dir entgegenwerfen?","1d10",10,LP.enemyResources,lp["enemyRes_"+i])}
        ${lpTable("enemyRevenge_"+i,"Sweet Revenge – was passiert beim Wiedersehen?","1d10",10,LP.sweetRevenge,lp["enemyRevenge_"+i])}
      </div>`).join(""):""}
  </div>`;

  /* --- Love affairs --- */
  html += `<div class="panel">
    <h2>Tragic Love Affair(s) <span class="dim">(S. 52)</span></h2>
    <div class="lp-item">
      <div class="lp-label"><b>Anzahl tragische Liebschaften</b><small>1d10 − 7 (mindestens 0)</small></div>
      <div class="lp-controls">
        <button class="btn-dice" id="roll-love" type="button">🎲</button>
        <b style="font-family:var(--mono)">${loveCount!=null?loveCount:"–"}</b>
        ${loveCount!=null?`<button class="btn btn-ghost btn-small" id="clear-love" type="button">reset</button>`:""}
      </div>
    </div>
    ${loveCount?Array.from({length:loveCount}).map((_,i)=>`
      ${lpTable("love_"+i,"Liebschaft #"+(i+1)+" – wie endete sie?","1d10",10,LP.loveAffairEndings,lp["love_"+i])}`).join(""):""}
  </div>`;

  /* --- Life goals --- */
  html += `<div class="panel">
    <h2>The Wrap Up – Life Goals <span class="dim">(S. 53)</span></h2>
    ${lpTable("lifeGoal","Your life goals","1d10",10,LP.lifeGoals,lp.lifeGoal)}
  </div>`;

  /* --- Role-based Lifepath --- */
  const rl = S.role?LP.roleLifepath[S.role]:[];
  html += `<div class="panel cyan">
    <h2>Role-Based Lifepath: ${S.role?esc(CPR.ROLES[S.role].name):"–"} <span class="dim">(S. 54–69)</span></h2>
    ${rl.map((tbl,i)=>{
      if(tbl.onlyIfGroup && lp["role_"+i+"_choice"]!=="In a Group" && lp["role_"+i+"_choice"]!=="Got a Partner") return "";
      if(tbl.onlyIfPartner && lp["role_"+i+"_choice"]!=="Got a Partner") return "";
      if(tbl.onlyIfLand && lp.role_nomad_base!=="Land") return "";
      if(tbl.onlyIfAir && lp.role_nomad_base!=="Air") return "";
      if(tbl.onlyIfSea && lp.role_nomad_base!=="Sea") return "";
      const key = "role_"+i;
      if(tbl.choice){
        return `<div class="lp-item choice" data-lp="${key}">
          <div class="lp-label"><b>${esc(tbl.t)}</b><small>Wahl (choose one)</small></div>
          <div class="lp-controls">
            <select data-rolechoice="${key}">
              <option value="">– wählen –</option>
              ${tbl.choice.map((o,j)=>`<option value="${esc(o)}" ${lp[key+"_choice"]===o?"selected":""}>${esc(o)}</option>`).join("")}
            </select>
          </div>
        </div>`;
      }
      return lpTable(key,tbl.t,"1d"+tbl.die,tbl.die,tbl.opts,lp[key]);
    }).join("")}
  </div>

  <div class="nav-row">
    <button class="btn" type="button" onclick="go('role')">◀ Zurück</button>
    <button class="btn btn-primary" id="btn-lp-next" type="button">Weiter zu Schritt 3 ▶</button>
  </div>`;

  $("#lifepath-content").innerHTML = html;

  /* --- Events --- */
  $$("#lifepath-content [data-pick]").forEach(sel=>{
    sel.addEventListener("change",()=>{
      set(sel.dataset.pick, sel.value==="-1"?null:Number(sel.value));
      renderLifepath();
    });
  });
  $$("#lifepath-content [data-roll]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const key=btn.dataset.roll;
      /* Tabellendaten ermitteln */
      let opts=null,die=10;
      if(key.startsWith("friend_")) opts=LP.friendRelation;
      else if(key.startsWith("enemyType_")) opts=LP.enemyType;
      else if(key.startsWith("enemyCause_")) opts=LP.enemyCause;
      else if(key.startsWith("enemyRes_")) opts=LP.enemyResources;
      else if(key.startsWith("enemyRevenge_")) opts=LP.sweetRevenge;
      else if(key.startsWith("love_")) opts=LP.loveAffairEndings;
      else if(key.startsWith("role_")){
        const idx=Number(key.slice(5));
        const t=LP.roleLifepath[S.role][idx]; opts=t.opts; die=t.die;
      }
      else { const m={culturalRegion:LP.culturalOrigins.map(c=>c.region),personality:LP.personality,
        clothingStyle:LP.clothingStyle,hairstyle:LP.hairstyle,affectation:LP.affectation,
        values:LP.values,feelings:LP.feelings,valuedPerson:LP.valuedPerson,
        valuedPossession:LP.valuedPossession,familyBackground:LP.familyBackground,
        environment:LP.environment,familyCrisis:LP.familyCrisis,lifeGoal:LP.lifeGoals};
        opts=m[key]; }
      if(opts){ const r=d(die); set(key,r-1); renderLifepath(); toast(`🎲 1d${die}: ${opts[r-1]}`); }
    });
  });
  $$("#lifepath-content [data-lang]").forEach(sel=>{
    sel.addEventListener("change",()=>{ S.culturalLang=sel.value||null; set("culturalLang",S.culturalLang); });
  });
  $$("#lifepath-content [data-enemywronged]").forEach(sel=>{
    sel.addEventListener("change",()=>set("enemyWronged_"+sel.dataset.enemywronged, sel.value||null));
  });
  $$("#lifepath-content [data-rolechoice]").forEach(sel=>{
    sel.addEventListener("change",()=>{
      const key=sel.dataset.rolechoice;
      set(key+"_choice", sel.value||null);
      if(key==="role_1" && S.role==="nomad") set("role_nomad_base",sel.value);
      if(key==="role_1" && (S.role==="netrunner"||S.role==="tech"||S.role==="medtech"||S.role==="fixer")) {}
      renderLifepath();
    });
  });
  const rf=$("#roll-friends"); if(rf) rf.addEventListener("click",()=>{
    const r=d(10); const n=Math.max(0,r-7); set("friendCount",n);
    for(let i=0;i<n;i++){ if(lp["friend_"+i]==null) lp["friend_"+i]=d(10)-1; }
    renderLifepath(); toast(`🎲 1d10−7 → ${n} Freunde`);
  });
  const re=$("#roll-enemies"); if(re) re.addEventListener("click",()=>{
    const r=d(10); const n=Math.max(0,r-7); set("enemyCount",n);
    for(let i=0;i<n;i++){
      if(lp["enemyType_"+i]==null) lp["enemyType_"+i]=d(10)-1;
      if(lp["enemyCause_"+i]==null) lp["enemyCause_"+i]=d(10)-1;
      if(lp["enemyRes_"+i]==null) lp["enemyRes_"+i]=d(10)-1;
      if(lp["enemyRevenge_"+i]==null) lp["enemyRevenge_"+i]=d(10)-1;
      if(lp["enemyWronged_"+i]==null) lp["enemyWronged_"+i]="me";
    }
    renderLifepath(); toast(`🎲 1d10−7 → ${n} Feinde (Tabellen gewürfelt)`);
  });
  const rl2=$("#roll-love"); if(rl2) rl2.addEventListener("click",()=>{
    const r=d(10); const n=Math.max(0,r-7); set("loveCount",n);
    for(let i=0;i<n;i++){ if(lp["love_"+i]==null) lp["love_"+i]=d(10)-1; }
    renderLifepath(); toast(`🎲 1d10−7 → ${n} tragische Liebschaften`);
  });
  [["clear-friends","friendCount","friend_"],["clear-enemies","enemyCount","enemy"],
    ["clear-love","loveCount","love_"]].forEach(([idcnt,cnt,prefix])=>{
    const el=document.getElementById(idcnt);
    if(el) el.addEventListener("click",()=>{
      Object.keys(lp).filter(k=>k===cnt||k.startsWith(prefix)).forEach(k=>delete lp[k]);
      save(); renderLifepath();
    });
  });
  $("#btn-lp-next").addEventListener("click",()=>{
    if(!S.culturalLang){ toast("⚠ Wähle noch deine Kultursprache (Cultural Origins)!"); return; }
    S.lpDone=true; go("stats");
  });
}

/* =============== Screen: STATS (Schritt #3) =============== */
function statBlockHTML(){
  return `<div class="statblock">`+CPR.STATS.map(st=>{
    const v=S.stats[st];
    return `<div class="statbox"><div class="lbl">${st}</div><div class="val">${v!=null?v:"–"}</div>
      <div class="sub">${esc(CPR.STAT_INFO[st].split(" – ")[0])}</div></div>`;
  }).join("")+`</div>`;
}
function statsComplete(){
  if(!CPR.STATS.every(st=>(S.stats[st]||0)>=1)) return false;
  if(S.method==="streetrat") return S.statTplIdx!=null;
  if(S.method==="edgerunner") return CPR.STATS.every(st=>S.statRolls&&S.statRolls[st]>=1);
  const used=CPR.STATS.reduce((a,st)=>a+(S.stats[st]||0),0);
  return used<=CPR.CP_STAT_POINTS;
}

function renderStats(){
  const role=S.role, tpl=CPR.STAT_TEMPLATES[role];
  let body="";

  if(S.method==="streetrat"){
    const sel=S.statTplIdx;
    body=`
    <div class="panel">
      <h2>Roll Your STATs – Template <span class="dim">(S. 73–77)</span></h2>
      <p class="dim">Würfle <b>1d10</b> auf dem STAT-Template deiner Rolle und übernimm die ganze Zeile
      in deinen STAT-Block. (Wenn deine Gruppe Wählen statt Würfeln erlaubt: einfach unten eine Zeile wählen.)</p>
      <div class="lp-item">
        <div class="lp-label"><b>Template-Wurf</b><small>${esc(CPR.ROLES[role].name)} · STAT-Template S. 73–77</small></div>
        <div class="lp-controls">
          <button class="btn-dice" id="btn-tpl-roll" type="button">🎲 würfeln</button>
          <select id="sel-tpl">
            <option value="">– Zeile wählen –</option>
            ${tpl.map((_,i)=>`<option value="${i}" ${sel===i?"selected":""}>Wurf ${i+1}</option>`).join("")}
          </select>
        </div>
      </div>
      <table class="tbl">
        <tr><th>1d10</th>${CPR.STATS.map(s=>`<th>${s}</th>`).join("")}</tr>
        ${tpl.map((row,i)=>`<tr${sel===i?' style="background:rgba(255,212,42,.14)"':""}>
          <td class="num"><b>${i+1}</b></td>${row.map(v=>`<td class="num">${v}</td>`).join("")}</tr>`).join("")}
      </table>
    </div>
    ${sel!=null?`<div class="panel green"><h2>Dein STAT-Block</h2>${statBlockHTML()}</div>`
      :`<div class="warnbox">Noch keine Template-Zeile gewürfelt oder gewählt – würfle oben 🎲.</div>`}`;
  }
  else if(S.method==="edgerunner"){
    const complete=S.statRolls&&CPR.STATS.every(st=>S.statRolls[st]>=1);
    body=`
    <div class="panel">
      <h2>Roll Your STATs – 1d10 je STAT <span class="dim">(S. 77)</span></h2>
      <p class="dim">Würfle für <b>jeden STAT einzeln</b> 1d10 und lies den Wert aus der Spalte deines STAT ab
      (Zeile = Wurfergebnis aus dem Template deiner Rolle).</p>
      <div class="btn-row"><button class="btn btn-primary" id="btn-roll-all" type="button">🎲 Alle 10 STATs würfeln</button></div>
      <table class="tbl">
        <tr><th>STAT</th><th>1d10</th><th class="num">Wert</th><th>Was ist das?</th></tr>
        ${CPR.STATS.map((st,i)=>{
          const roll=S.statRolls?S.statRolls[st]:null;
          return `<tr><td><b>${st}</b></td>
            <td><span class="lp-controls"><button class="btn-dice" data-statroll="${st}" type="button">🎲</button>
            <input type="number" min="1" max="10" data-statin="${st}" value="${roll!=null?roll:""}" placeholder="–"></span></td>
            <td class="num"><b>${roll!=null?tpl[roll-1][i]:"–"}</b></td>
            <td class="dim">${esc(CPR.STAT_INFO[st])}</td></tr>`;
        }).join("")}
      </table>
    </div>
    ${complete?`<div class="panel green"><h2>Dein STAT-Block</h2>${statBlockHTML()}</div>`
      :`<div class="warnbox">Es fehlen noch STATs – würfle oder tippe die 1d10-Ergebnisse (1–10) ein.</div>`}`;
  }
  else{ /* Complete Package: kaufen */
    if(!S.statMode){ CPR.STATS.forEach(st=>{ if(!(st in S.stats)) S.stats[st]=CPR.STAT_MIN; }); S.statMode="buy"; save(); }
    const used=CPR.STATS.reduce((a,st)=>a+(S.stats[st]||0),0);
    const left=CPR.CP_STAT_POINTS-used, over=used>CPR.CP_STAT_POINTS;
    body=`
    <div class="panel">
      <h2>Buy Your STATs <span class="dim">(S. 78)</span></h2>
      <p class="dim">Verteile <b>62 Punkte</b> auf deine zehn STATs. Jeder STAT: mindestens 2, höchstens 8
      (im Schnitt ca. 6 pro STAT). Nicht ausgegebene Punkte verfallen.</p>
      <div class="budget ${over?"over":""}"><span>Punkte</span><b>${used} / ${CPR.CP_STAT_POINTS} · übrig ${left}</b></div>
      ${over?`<div class="errbox">Zu viele Punkte vergeben! Baue wieder ab, bevor du weitergehst.</div>`:""}
      <div class="statblock">
        ${CPR.STATS.map(st=>{
          const v=S.stats[st]||CPR.STAT_MIN;
          const canInc=v<CPR.STAT_MAX&&used<CPR.CP_STAT_POINTS;
          const canDec=v>CPR.STAT_MIN;
          return `<div class="statbox"><div class="lbl">${st}</div>
            <div class="stepper-widget">
              <button type="button" data-stdec="${st}" ${canDec?"":"disabled"}>−</button>
              <span class="val">${v}</span>
              <button type="button" data-stinc="${st}" ${canInc?"":"disabled"}>+</button>
            </div>
            <div class="sub">${esc(CPR.STAT_INFO[st].split(" – ")[0])}</div></div>`;
        }).join("")}
      </div>
    </div>`;
  }

  $("#stats-content").innerHTML=`
    <h1>Schritt 3 · ${S.method==="complete"?"Buy":"Roll"} Your STATs
      <span class="dim">(${S.method==="complete"?"S. 78":S.method==="streetrat"?"S. 73–77":"S. 77"})</span></h1>
    <p class="dim">Rolle: <b>${esc(CPR.ROLES[role].name)}</b> – das Template gehört zu dieser Rolle.</p>
    ${body}
    <div class="nav-row">
      <button class="btn" type="button" onclick="go('lifepath')">◀ Zurück</button>
      <button class="btn btn-primary" id="btn-stats-next" type="button" ${statsComplete()?"":"disabled"}>Weiter zu Schritt 4 ▶</button>
    </div>`;

  /* --- Events --- */
  if(S.method==="streetrat"){
    const setIdx=(i)=>{
      S.statTplIdx=i;
      if(i!=null){ const row=tpl[i]; CPR.STATS.forEach((st,j)=>S.stats[st]=row[j]); }
      save();
    };
    const rb=$("#btn-tpl-roll");
    if(rb) rb.addEventListener("click",()=>{
      const r=d(10); setIdx(r-1); renderStats(); toast(`🎲 1d10 → Template-Zeile ${r}`);
    });
    $("#sel-tpl").addEventListener("change",(e)=>{
      setIdx(e.target.value===""?null:Number(e.target.value)); renderStats();
    });
  }
  if(S.method==="edgerunner"){
    if(!S.statRolls) S.statRolls={};
    const applyRoll=(st,r)=>{
      r=Math.max(1,Math.min(10,Math.round(r)));
      S.statRolls[st]=r;
      S.stats[st]=tpl[r-1][CPR.STATS.indexOf(st)];
      save();
    };
    const all=$("#btn-roll-all");
    if(all) all.addEventListener("click",()=>{
      CPR.STATS.forEach(st=>applyRoll(st,d(10)));
      renderStats(); toast("🎲 Alle 10 STATs gewürfelt");
    });
    $$("#stats-content [data-statroll]").forEach(b=>b.addEventListener("click",()=>{
      const st=b.dataset.statroll, r=d(10);
      applyRoll(st,r); renderStats(); toast(`🎲 ${st}: 1d10 → ${r} (Wert ${S.stats[st]})`);
    }));
    $$("#stats-content [data-statin]").forEach(inp=>inp.addEventListener("change",()=>{
      const st=inp.dataset.statin, v=Number(inp.value);
      if(!v||v<1||v>10){ toast("Bitte eine Zahl von 1 bis 10 eingeben."); renderStats(); return; }
      applyRoll(st,v); renderStats();
    }));
  }
  if(S.method==="complete"){
    $$("#stats-content [data-stinc]").forEach(b=>b.addEventListener("click",()=>{
      const st=b.dataset.stinc;
      if((S.stats[st]||0)<CPR.STAT_MAX) S.stats[st]=(S.stats[st]||0)+1;
      save(); renderStats();
    }));
    $$("#stats-content [data-stdec]").forEach(b=>b.addEventListener("click",()=>{
      const st=b.dataset.stdec;
      if((S.stats[st]||0)>CPR.STAT_MIN) S.stats[st]=(S.stats[st]||0)-1;
      save(); renderStats();
    }));
  }
  $("#btn-stats-next").addEventListener("click",()=>go("derived"));
}

/* =============== Screen: Abgeleitete Werte (Schritt #4) =============== */
function renderDerived(){
  const dv=derived();
  if(!dv){
    $("#derived-content").innerHTML=`
      <h1>Schritt 4 · Calculate Derived Statistics <span class="dim">(S. 79)</span></h1>
      <div class="warnbox">Deine STATs sind noch nicht vollständig – erst Schritt 3 abschließen.</div>
      <div class="nav-row"><button class="btn" type="button" onclick="go('stats')">◀ Zu Schritt 3</button></div>`;
    return;
  }
  $("#derived-content").innerHTML=`
    <h1>Schritt 4 · Calculate Derived Statistics <span class="dim">(S. 79–80)</span></h1>
    <div class="statblock">
      <div class="statbox"><div class="lbl">Hit Points</div><div class="val">${dv.hp}</div>
        <div class="sub">10 + 5×⌈(BODY+WILL)/2⌉</div></div>
      <div class="statbox"><div class="lbl">Seriously Wounded</div><div class="val">${dv.sw}</div>
        <div class="sub">⌈HP/2⌉ – Wund-Schwelle</div></div>
      <div class="statbox"><div class="lbl">Death Save</div><div class="val">${dv.deathSave}</div>
        <div class="sub">= BODY (S. 186)</div></div>
      <div class="statbox ${dv.humanity<0?"warn":""}"><div class="lbl">Humanity</div><div class="val">${dv.humanity}</div>
        <div class="sub">EMP ${dv.empBase}×10${dv.hl?` − ${dv.hl} HL`:""}</div></div>
      <div class="statbox"><div class="lbl">EMP effektiv</div><div class="val">${dv.empEff}</div>
        <div class="sub">⌊Humanity/10⌋ (S. 80)</div></div>
    </div>
    <div class="panel">
      <h2>Was bedeuten die Werte?</h2>
      <ul class="clean">
        <li><b>Hit Points (HP):</b> Wie viel Schaden du wegsteckst. Bei 0 HP: Death Save.</li>
        <li><b>Seriously Wounded:</b> Ab dieser Schwelle bist du schwer verwundet (−2 auf die meisten Rolls).</li>
        <li><b>Death Save:</b> Bei 0 HP musst du BODY oder darunter würfeln, um nicht zu sterben.</li>
        <li><b>Humanity:</b> EMP×10 minus Humanity Loss durch Cyberware. Unter 0 = Cyberpsycho.</li>
        <li><b>EMP (effektiv):</b> Dein echter EMP-Wert im Spiel, wenn Cyberware installiert ist.</li>
        <li><b>LUCK:</b> kannst du 1× pro Session ausgeben, um einen Wurf zu wiederholen (S. 72).</li>
      </ul>
    </div>
    ${(S.method==="streetrat"||S.method==="edgerunner")?`
    <div class="panel cyan">
      <h2>Vorschau Cyberware (Schritt 8)</h2>
      <p>Deine Rollen-Preset-Cyberware kostet <b>${presetCyberHL()} Humanity</b> – Humanity danach:
      <b>${dv.humMax-presetCyberHL()}</b>, EMP effektiv: <b>${Math.max(0,Math.floor((dv.humMax-presetCyberHL())/10))}</b>.</p>
    </div>`:""}
    ${dv.hl>0?`<div class="warnbox">Aktuell installierte Cyberware: −${dv.hl} Humanity.
      Humanity: <b>${dv.humanity}</b>${dv.humanity<0?" – <b>CYBERPSYCHOSE!</b>":""}</div>`:""}
    ${dv.armorPen<0?`<div class="warnbox">Rüstungsmalus ${dv.armorPen} auf REF/DEX/MOVE –
      effektive Werte stehen auf dem Charakterbogen.</div>`:""}
    <div class="panel green">
      <h2>Role Ability</h2>
      <p><b>${esc(CPR.ROLES[S.role].name)}</b>: <b>${esc(CPR.ROLES[S.role].ability)} ${S.roleAbility}</b> – ${esc(CPR.ROLES[S.role].ra)}</p>
    </div>
    <div class="nav-row">
      <button class="btn" type="button" onclick="go('stats')">◀ Zurück</button>
      <button class="btn btn-primary" id="btn-derived-next" type="button">Weiter zu Schritt 5 ▶</button>
    </div>`;
  $("#btn-derived-next").addEventListener("click",()=>go("skills"));
}

/* =============== Screen: SKILLS (Schritt #5) =============== */
function skillBase(n){ return n.replace(/\s*\(.*\)\s*$/,""); }
function skillX2(n){ const b=CPR.SKILL_BY_NAME[skillBase(n)]; return !!(b&&b.x2); }
function skillCost(n,rank){ return rank*(skillX2(n)?2:1); }
function skillStat(n){ const b=CPR.SKILL_BY_NAME[skillBase(n)]; return b?b.s:"?"; }
function chooseKeyFor(n){ const k=skillBase(n)+" (choose 1)"; return CPR.CHOOSE_SKILLS[k]?k:null; }
function skillPts(list){ return list.reduce((a,n)=>a+skillCost(n,S.skills[n]||0),0); }
function displaySkillName(n){
  const ck=chooseKeyFor(n);
  if(ck&&S.skillChoices&&S.skillChoices[n]) return `${skillBase(n)} (${S.skillChoices[n]})`;
  return n;
}
function chooseSelectHTML(n){
  const ck=chooseKeyFor(n); if(!ck) return "";
  const cur=S.skillChoices[n];
  return `<br><select data-choose="${esc(n)}"><option value="">– Spezialisierung wählen –</option>
    ${CPR.CHOOSE_SKILLS[ck].map(o=>`<option ${cur===o?"selected":""}>${esc(o)}</option>`).join("")}
  </select>`;
}
function skillsBudgetBar(used,budget){
  const over=used>budget;
  return `<div class="budget ${over?"over":""}"><span>Skill-Punkte</span>
    <b>${used} / ${budget} · übrig ${budget-used}</b></div>
    ${over?`<div class="errbox">Zu viele Punkte vergeben! Baue wieder ab.</div>`:""}`;
}

function renderSkills(){
  const role=S.role;
  const lang4=`Language (${S.culturalLang||"Kultursprache"})`;
  let body="";

  if(S.method==="streetrat"){
    const list=CPR.STREETRAT_SKILLS[role];
    body=`
    <div class="panel">
      <h2>Streetrat Skills – fix <span class="dim">(S. 86–87)</span></h2>
      <p class="dim">Beim Streetrat stehen die Skillwerte deines Rollen-Templates fest.
      Nur „(choose 1)“-Skills brauchen eine Spezialisierung. Die Kultursprache aus dem Lifepath
      bekommst du <b>gratis auf Rang 4</b> (S. 45/85).</p>
      <table class="tbl">
        <tr><th>Skill</th><th class="num">Rang</th><th class="num">STAT</th><th>Note</th></tr>
        <tr><td><b>${esc(lang4)}</b></td><td class="num">4</td><td class="num">INT</td>
          <td class="dim">gratis aus dem Lifepath (S. 45/85)</td></tr>
        ${list.map(([n,v])=>{
          const ck=chooseKeyFor(n);
          if(ck) return `<tr><td><b>${esc(n)}</b></td><td class="num">${v}</td>
            <td class="num">${skillStat(n)}</td><td>${chooseSelectHTML(n)}</td></tr>`;
          return `<tr><td>${esc(n)}</td><td class="num">${v}</td><td class="num">${skillStat(n)}</td>
            <td class="dim">${CPR.BASIC_SKILLS.includes(n)?"Basic Skill":""}</td></tr>`;
        }).join("")}
      </table>
    </div>`;
  }
  else if(S.method==="edgerunner"){
    const list=CPR.BASIC_SKILLS.concat(CPR.EDGERUNNER_SKILLS[role]);
    if(!Object.keys(S.skills).length&&!S.skillsDone){ list.forEach(n=>S.skills[n]=CPR.SKILL_MIN); save(); }
    const used=skillPts(list);
    body=`
    <div class="panel">
      <h2>Edgerunner Skills – 86 Punkte <span class="dim">(S. 88)</span></h2>
      <p class="dim">13 Basic Skills + 7 Rollen-Skills = 20 Skills. Jeder Skill: min Rang 2, max Rang 6.
      <b>(x2)-Skills kosten pro Rang doppelt.</b> Nicht ausgegebene Punkte verfallen.</p>
      ${skillsBudgetBar(used,CPR.EDGERUNNER_POINTS)}
      <table class="tbl">
        <tr><th>Skill</th><th>Rang</th><th class="num">STAT</th><th class="num">Punkte</th><th></th></tr>
        <tr><td><b>${esc(lang4)}</b></td><td class="num">4</td><td class="num">INT</td>
          <td class="num">0</td><td class="dim">gratis aus dem Lifepath (S. 45/85)</td></tr>
        ${list.map(n=>{
          const rank=S.skills[n]!=null?S.skills[n]:CPR.SKILL_MIN, x2=skillX2(n);
          const basic=CPR.BASIC_SKILLS.includes(n);
          const incCost=x2?2:1;
          const canInc=rank<CPR.SKILL_MAX&&used+incCost<=CPR.EDGERUNNER_POINTS;
          const canDec=rank>CPR.SKILL_MIN;
          return `<tr><td>${basic?`<b>${esc(n)}</b>`:esc(n)}${chooseSelectHTML(n)}</td>
            <td><div class="stepper-widget">
              <button type="button" data-erskill="${esc(n)}" data-dir="-1" ${canDec?"":"disabled"}>−</button>
              <span class="val">${rank}</span>
              <button type="button" data-erskill="${esc(n)}" data-dir="1" ${canInc?"":"disabled"}>+</button>
            </div></td>
            <td class="num">${skillStat(n)}</td>
            <td class="num">${skillCost(n,rank)}</td>
            <td class="dim">${basic?"Basic":"Rollen-Skill"}${x2?" · (x2)":""}</td></tr>`;
        }).join("")}
      </table>
    </div>`;
  }
  else{ /* Complete Package */
    if(!Object.keys(S.skills).length&&!S.skillsDone){
      CPR.BASIC_SKILLS.forEach(b=>S.skills[b]=CPR.SKILL_MIN); save();
    }
    const owned=Object.keys(S.skills);
    const used=skillPts(owned);
    const groups={};
    CPR.SKILLS.forEach(sk=>{ (groups[sk.s]=groups[sk.s]||[]).push(sk.n); });
    const addSel=`<select id="sel-addskill"><option value="">– Skill wählen –</option>
      ${Object.keys(groups).map(st=>`<optgroup label="${st}">
        ${groups[st].map(n=>`<option value="${esc(n)}" ${S._addSkill===n?"selected":""}>${esc(n)}${CPR.SKILL_BY_NAME[n].x2?" (x2)":""}</option>`).join("")}
      </optgroup>`).join("")}</select>`;
    let spec="";
    const picked=S._addSkill||"";
    if(picked==="Language"||picked==="Local Expert"){
      spec=`<input type="text" id="inp-spec" placeholder="${picked==="Language"?"z. B. Spanish":"z. B. Watson District"}">`;
    } else if(chooseKeyFor(picked)){
      spec=`<select id="sel-spec"><option value="">– wählen –</option>
        ${CPR.CHOOSE_SKILLS[chooseKeyFor(picked)].map(o=>`<option>${esc(o)}</option>`).join("")}</select>`;
    }
    body=`
    <div class="panel">
      <h2>Complete Package Skills – 86 Punkte <span class="dim">(S. 90)</span></h2>
      <p class="dim">Fast freie Wahl aus der Master Skill List (S. 81–85): max Rang 6,
      (x2)-Skills kosten doppelt. Die <b>13 Basic Skills brauchen mindestens Rang 2</b>
      (schon vorausgefüllt – darfst du erhöhen). Kultursprache Rang 4 gratis.</p>
      ${skillsBudgetBar(used,CPR.COMPLETE_POINTS)}
      <div class="lp-item">
        <div class="lp-label"><b>Skill hinzufügen</b><small>Language &amp; Local Expert brauchen eine Spezialisierung</small></div>
        <div class="lp-controls">${addSel}${spec||`<span class="dim">keine Spezialisierung nötig</span>`}
          <button class="btn btn-primary btn-small" id="btn-addskill" type="button">+ Skill</button></div>
      </div>
      <table class="tbl">
        <tr><th>Skill</th><th>Rang</th><th class="num">STAT</th><th class="num">Punkte</th><th></th></tr>
        <tr><td><b>${esc(lang4)}</b></td><td class="num">4</td><td class="num">INT</td>
          <td class="num">0</td><td class="dim">gratis aus dem Lifepath (S. 45/85)</td></tr>
        ${owned.map(n=>{
          const rank=S.skills[n], x2=skillX2(n), basic=CPR.BASIC_SKILLS.includes(n);
          const min=basic?CPR.SKILL_MIN:1;
          const incCost=x2?2:1;
          const canInc=rank<CPR.SKILL_MAX&&used+incCost<=CPR.COMPLETE_POINTS;
          const canDec=rank>min;
          return `<tr><td>${basic?`<b>${esc(n)}</b>`:esc(n)}</td>
            <td><div class="stepper-widget">
              <button type="button" data-cpskill="${esc(n)}" data-dir="-1" ${canDec?"":"disabled"}>−</button>
              <span class="val">${rank}</span>
              <button type="button" data-cpskill="${esc(n)}" data-dir="1" ${canInc?"":"disabled"}>+</button>
            </div></td>
            <td class="num">${skillStat(n)}</td>
            <td class="num">${skillCost(n,rank)}</td>
            <td>${basic?`<span class="dim">Basic (min 2)</span>`
              :`<button class="btn btn-ghost btn-small" type="button" data-rm="${esc(n)}">✕ entfernen</button>`}</td></tr>`;
        }).join("")}
      </table>
    </div>`;
  }

  $("#skills-content").innerHTML=`
    <h1>Schritt 5 · Set Your Skills <span class="dim">(${S.method==="streetrat"?"S. 86–87":S.method==="edgerunner"?"S. 88–89":"S. 90"})</span></h1>
    <p class="dim">Rolle: <b>${esc(CPR.ROLES[role].name)}</b> · Gesamt-Punkte:
    ${S.method==="streetrat"?"fix (Template)":S.method==="edgerunner"?"86 auf 20 Rollen-Skills":"86 frei verteilt"}.</p>
    ${body}
    <div class="nav-row">
      <button class="btn" type="button" onclick="go('derived')">◀ Zurück</button>
      <button class="btn btn-primary" id="btn-skills-next" type="button">Weiter zu ${S.method==="complete"?"Schritt 6 (Einkauf)":"Schritt 6 (Ausrüstung)"} ▶</button>
    </div>`;

  /* --- Events --- */
  $$("#skills-content [data-choose]").forEach(sel=>sel.addEventListener("change",()=>{
    S.skillChoices[sel.dataset.choose]=sel.value||null; save();
  }));
  const erList=CPR.BASIC_SKILLS.concat(CPR.EDGERUNNER_SKILLS[role]);
  $$("#skills-content [data-erskill]").forEach(b=>b.addEventListener("click",()=>{
    const n=b.dataset.erskill, dir=Number(b.dataset.dir);
    const cur=S.skills[n]!=null?S.skills[n]:CPR.SKILL_MIN;
    const next=cur+dir;
    if(next<CPR.SKILL_MIN||next>CPR.SKILL_MAX) return;
    const cost=skillCost(n,next)-skillCost(n,cur);
    if(skillPts(erList)+cost>CPR.EDGERUNNER_POINTS){ toast("Keine Skill-Punkte mehr!"); return; }
    S.skills[n]=next; save(); renderSkills();
  }));
  $$("#skills-content [data-cpskill]").forEach(b=>b.addEventListener("click",()=>{
    const n=b.dataset.cpskill, dir=Number(b.dataset.dir);
    const cur=S.skills[n], next=cur+dir;
    const basic=CPR.BASIC_SKILLS.includes(n);
    const min=basic?CPR.SKILL_MIN:1;
    if(next<min||next>CPR.SKILL_MAX) return;
    const cost=skillCost(n,next)-skillCost(n,cur);
    if(skillPts(Object.keys(S.skills))+cost>CPR.COMPLETE_POINTS){ toast("Keine Skill-Punkte mehr!"); return; }
    S.skills[n]=next; save(); renderSkills();
  }));
  $$("#skills-content [data-rm]").forEach(b=>b.addEventListener("click",()=>{
    delete S.skills[b.dataset.rm]; save(); renderSkills();
  }));
  const selAdd=$("#sel-addskill");
  if(selAdd) selAdd.addEventListener("change",()=>{ S._addSkill=selAdd.value||""; renderSkills(); });
  const addBtn=$("#btn-addskill");
  if(addBtn) addBtn.addEventListener("click",()=>{
    const n=$("#sel-addskill").value; if(!n){ toast("Bitte einen Skill wählen."); return; }
    let name=n;
    if(n==="Language"||n==="Local Expert"){
      const sp=($("#inp-spec")||{}).value||"";
      if(!sp.trim()){ toast("Bitte eine Spezialisierung eingeben."); return; }
      name=`${n} (${sp.trim()})`;
    } else {
      const ck=chooseKeyFor(n);
      if(ck){
        const sp=$("#sel-spec")?$("#sel-spec").value:"";
        if(!sp){ toast("Bitte eine Spezialisierung wählen."); return; }
        name=`${skillBase(n)} (${sp})`;
      }
    }
    if(S.skills[name]!=null){ toast("Diesen Skill hast du schon."); return; }
    const cost=skillX2(name)?2:1;
    if(skillPts(Object.keys(S.skills))+cost>CPR.COMPLETE_POINTS){ toast("Keine Skill-Punkte mehr!"); return; }
    S.skills[name]=1; save(); renderSkills();
  });
  $("#btn-skills-next").addEventListener("click",()=>{
    if(S.method==="streetrat"){
      const missing=CPR.STREETRAT_SKILLS[S.role].map(x=>x[0])
        .filter(n=>chooseKeyFor(n)&&!S.skillChoices[n]);
      if(missing.length){ toast("⚠ Bitte Spezialisierung wählen: "+missing.join(", ")); return; }
    }
    if(S.method==="edgerunner"){
      const missing=CPR.BASIC_SKILLS.concat(CPR.EDGERUNNER_SKILLS[S.role])
        .filter(n=>chooseKeyFor(n)&&!S.skillChoices[n]);
      if(missing.length){ toast("⚠ Bitte Spezialisierung wählen: "+missing.join(", ")); return; }
    }
    if(S.method==="complete"){
      const missing=CPR.BASIC_SKILLS.filter(b=>(S.skills[b]||0)<CPR.SKILL_MIN);
      if(missing.length){ toast("⚠ Basic Skills brauchen min. Rang 2: "+missing.join(", ")); return; }
    }
    S.skillsDone=true; go(S.method==="complete"?"shop":"equip");
  });
}

/* =============== Shop: gemeinsame Bausteine =============== */
const TAB_LABELS={weapon:"Waffen",ammo:"Munition",armor:"Rüstung",gear:"Gear",
  fashion:"Fashion",exotic:"Exotic (SL!)",cyber:"Cyberware"};
function catalogFor(tab){
  switch(tab){
    case "weapon": return CPR.MELEE.map(w=>({cat:"weapon",name:w.n,cost:w.cost,
        info:`${w.dmg} Schaden · ROF ${w.rof} · ${w.hands===2?"zweihändig":"einhändig"}${w.conceal?" · verbergbar":""} · z. B. ${w.ex}`}))
      .concat(CPR.RANGED.map(w=>({cat:"weapon",name:w.n,cost:w.cost,
        info:`${w.dmg} Schaden · ${w.skill} · Mag ${w.mag} · ROF ${w.rof}${w.alt&&w.alt!=="–"?" · "+w.alt:""}`})));
    case "exotic": return CPR.EXOTIC.map(x=>({cat:"weapon",name:x.n,cost:x.cost,
        info:`${x.d} · Nur mit SL-Erlaubnis (S. 95)`}));
    case "ammo": return CPR.AMMO_TYPES.map(t=>({cat:"ammo",name:t,cost:CPR.AMMO_COST_PER_10,
        info:"Bündel = 10 Schuss (S. 94)"}));
    case "armor": return CPR.ARMOR.map(a=>({cat:"armor",name:a.n,cost:a.cost,
        info:`SP ${a.sp} · ${a.pen<0?`Malus ${a.pen} auf REF/DEX/MOVE`:"kein Malus"}${a.shield?" · belegt immer einen Arm":""} · ${a.d}`}));
    case "gear": return CPR.GEAR.map(g=>({cat:"gear",name:g.n,cost:g.c,info:g.d}));
    case "cyber": return CPR.CYBERWARE.map(cw=>({
        cat:cw.cat==="Fashionware"?"fashionware":"cyberware",name:cw.n,cost:cw.cost,
        hl:cw.hl,slots:cw.slots,req:cw.req,
        info:`${cw.cat}${cw.found?` · Foundational (${cw.foundSlots} Slots)`:""}${cw.paired?" · paarweise":""} – ${cw.d}${cw.cat==="Fashionware"?" · zählt aufs 800eb-Fashion-Budget":""}`}));
    case "fashion": return [];
  }
  return [];
}
function shopTabsHTML(tabs,cur){
  return `<div class="tabs">${tabs.map(t=>
    `<button class="tab ${t===cur?"active":""}" data-shoptab="${t}" type="button">${TAB_LABELS[t]||t}</button>`).join("")}</div>`;
}
function shopItemsHTML(tab){
  if(tab==="fashion"){
    return `
    <div class="lp-item">
      <div class="lp-label"><b>Fashion kaufen</b><small>Style × Kleidungsstück (S. 102) – Preis aus der Matrix unten</small></div>
      <div class="lp-controls">
        <select id="sel-fstyle">${CPR.FASHION_STYLES.map((s,i)=>`<option value="${i}">${esc(s)}</option>`).join("")}</select>
        <select id="sel-fpiece">${CPR.FASHION_PIECES.map((p,i)=>`<option value="${i}">${esc(p)}</option>`).join("")}</select>
        <button class="btn btn-primary btn-small" id="btn-addfashion" type="button">+ kaufen</button>
      </div>
    </div>
    <table class="tbl">
      <tr><th>Style (S. 102)</th>${CPR.FASHION_PIECES.map(p=>`<th class="num">${esc(p)}</th>`).join("")}</tr>
      ${CPR.FASHION_STYLES.map(st=>`<tr><td><b>${esc(st)}</b><br><small class="dim">${esc(CPR.FASHION_STYLE_DESC[st])}</small></td>
        ${CPR.FASHION_PRICES[st].map(c=>`<td class="price">${c}</td>`).join("")}</tr>`).join("")}
    </table>`;
  }
  const items=catalogFor(tab);
  const note=tab==="exotic"?`<div class="warnbox">Exotic Weapons nur mit SL-Erlaubnis (S. 95).</div>`:"";
  return `${note}<table class="tbl">
    <tr><th>Name</th><th>Info</th><th class="num">Preis</th><th></th></tr>
    ${items.map((it,i)=>{
      let addBtns=`<button class="btn btn-primary btn-small" type="button" data-addidx="${i}" data-tab="${tab}">+ kaufen</button>`;
      if(tab==="armor"){
        const a=CPR.ARMOR[i];
        addBtns=a.shield
          ?`<button class="btn btn-primary btn-small" type="button" data-addidx="${i}" data-tab="${tab}" data-loc="Arm">+ kaufen (Arm)</button>`
          :`<button class="btn btn-primary btn-small" type="button" data-addidx="${i}" data-tab="${tab}" data-loc="Body">+ Körper</button>
            <button class="btn btn-primary btn-small" type="button" data-addidx="${i}" data-tab="${tab}" data-loc="Head">+ Kopf</button>`;
      }
      return `<tr><td><b>${esc(it.name)}</b>${it.hl!=null?`<br><small class="dim">HL ${it.hl}${it.slots?` · ${it.slots} Slots`:""}${it.req?` · braucht ${it.req}`:""}</small>`:""}</td>
        <td class="dim">${esc(it.info||"")}</td><td class="price">${eb(it.cost)}</td><td style="white-space:nowrap">${addBtns}</td></tr>`;
    }).join("")}
  </table>`;
}
const CAT_LABEL={weapon:"Waffen",ammo:"Munition",armor:"Rüstung",gear:"Gear",
  fashion:"Fashion",cyberware:"Cyberware",fashionware:"Fashionware"};
function cartHTML(){
  const buys=S.buys||[];
  if(!buys.length) return `<p class="dim">Noch nichts gekauft.</p>`;
  const groups={};
  buys.forEach((b,i)=>{ (groups[b.cat]=groups[b.cat]||[]).push({...b,i}); });
  return Object.keys(groups).map(cat=>`
    <h3>${CAT_LABEL[cat]||cat}</h3>
    ${groups[cat].map(b=>`
      <div class="cart-item">
        <span>${esc(b.name)}${b.loc?` <span class="dim">(${b.loc==="Head"?"Kopf":b.loc==="Body"?"Körper":b.loc})</span>`:""}</span>
        <span class="qty">
          <button type="button" data-qtydec="${b.i}">−</button><b>${b.qty}</b><button type="button" data-qtyinc="${b.i}">+</button>
        </span>
        <span class="price">${eb(b.cost*b.qty)}</span>
        <span class="x" data-rmbuy="${b.i}" title="entfernen">✕</span>
      </div>`).join("")}`).join("");
}
function addBuy(e){
  const sig=e.cat+"|"+e.name+"|"+(e.loc||"");
  const b=(S.buys||[]).find(x=>(x.cat+"|"+x.name+"|"+(x.loc||""))===sig);
  if(b) b.qty++;
  else{ e.qty=1; (S.buys=S.buys||[]).push(e); }
  save();
}
function bindShopCommon(rootSel,canAfford,rerender,setTab){
  $$(rootSel+" [data-shoptab]").forEach(b=>b.addEventListener("click",()=>{ setTab(b.dataset.shoptab); rerender(); }));
  $$(rootSel+" [data-addidx]").forEach(b=>b.addEventListener("click",()=>{
    const items=catalogFor(b.dataset.tab); const it=items[Number(b.dataset.addidx)];
    if(!it) return;
    const entry={...it};
    if(b.dataset.loc) entry.loc=b.dataset.loc;
    if(!canAfford(entry)){ toast("💸 Das passt nicht mehr ins Budget!"); return; }
    addBuy(entry); rerender();
  }));
  const af=$(rootSel+" #btn-addfashion");
  if(af) af.addEventListener("click",()=>{
    const si=Number($(rootSel+" #sel-fstyle").value), pi=Number($(rootSel+" #sel-fpiece").value);
    const style=CPR.FASHION_STYLES[si], piece=CPR.FASHION_PIECES[pi];
    const entry={cat:"fashion",name:style+": "+piece,cost:CPR.FASHION_PRICES[style][pi]};
    if(!canAfford(entry)){ toast("💸 Das passt nicht mehr ins Budget!"); return; }
    addBuy(entry); rerender();
  });
  $$(rootSel+" [data-qtyinc]").forEach(b=>b.addEventListener("click",()=>{
    const bu=S.buys[Number(b.dataset.qtyinc)];
    if(bu){ if(!canAfford(bu)){ toast("💸 Budget überschritten!"); return; } bu.qty++; save(); rerender(); }
  }));
  $$(rootSel+" [data-qtydec]").forEach(b=>b.addEventListener("click",()=>{
    const i=Number(b.dataset.qtydec), bu=S.buys[i];
    if(!bu) return;
    bu.qty--; if(bu.qty<=0) S.buys.splice(i,1);
    save(); rerender();
  }));
  $$(rootSel+" [data-rmbuy]").forEach(x=>x.addEventListener("click",()=>{
    S.buys.splice(Number(x.dataset.rmbuy),1); save(); rerender();
  }));
}

/* Budgets */
function eqBudgetUsed(){ return (S.buys||[]).reduce((a,b)=>a+b.cost*b.qty,0); }
function eqCanAfford(e){ return eqBudgetUsed()+e.cost<=CPR.SR_BUDGET; }
function cpBudgets(){
  let fash=0, cyber=0, main=0;
  (S.buys||[]).forEach(b=>{
    const c=b.cost*b.qty;
    if(b.cat==="fashion"||b.cat==="fashionware") fash+=c;
    else if(b.cat==="cyberware") cyber+=c;
    else main+=c;
  });
  const soulAvail=S.sellSoul?CPR.SOUL_BONUS:0;
  const fromSoul=Math.min(soulAvail,cyber);
  const mainSpent=main+(cyber-fromSoul)+Math.max(0,fash-CPR.CP_FASHION_BUDGET);
  return {
    fashionRem:CPR.CP_FASHION_BUDGET-Math.min(fash,CPR.CP_FASHION_BUDGET),
    soulRem:soulAvail-fromSoul,
    mainRem:CPR.CP_BUDGET-mainSpent
  };
}
function cpCanAfford(e){
  const b=cpBudgets();
  if(e.cat==="fashion"||e.cat==="fashionware") return e.cost<=b.fashionRem+b.mainRem;
  if(e.cat==="cyberware") return e.cost<=b.soulRem+b.mainRem;
  return e.cost<=b.mainRem;
}

/* =============== Preset-Darstellung (SR/ER) =============== */
function presetInfo(name){
  const clean=name.replace(/\s*\(.*\)\s*$/,"");
  const w=CPR.MELEE.find(x=>x.n===clean)||CPR.RANGED.find(x=>x.n===clean);
  if(w) return `${w.dmg} Schaden · ROF ${w.rof}${w.conceal?" · verbergbar":""}`;
  const a=CPR.ARMOR.find(x=>x.n===clean);
  if(a) return `SP ${a.sp}${a.pen<0?` · Malus ${a.pen}`:""}${a.shield?" · belegt einen Arm":""}`;
  if(/^Basic .* Ammunition/.test(name)) return "Basis-Munition (S. 94)";
  if(/Grenade/i.test(name)) return "Sprengkörper – Granaten nur auf dem Night Market (S. 344)";
  if(/^Program:/.test(name)) return "Netrunner-Programm (S. 123ff)";
  const g=CPR.GEAR.find(x=>x.n===name||x.n===clean);
  if(g) return g.d;
  const cw=CPR.CYBER_BY_NAME[name];
  if(cw) return `${cw.cat} · HL ${cw.hl}${cw.slots?` · ${cw.slots} Slots`:""}${cw.req?` · braucht ${cw.req}`:""} – ${cw.d}`;
  return "";
}
function presetListHTML(preset,choicesKey){
  return preset.map((it,idx)=>{
    if(it.opt){
      const sel=S.presetChoices[choicesKey][idx]||0;
      return `<div class="lp-item choice">
        <div class="lp-label"><b>Auswahl ${idx+1}</b><small>oder-Option – eine wählen${it.tag?` · ${esc(it.tag)}`:""}</small></div>
        <div class="lp-controls radio-line">
          ${it.opt.map((o,j)=>`<label><input type="radio" name="p_${choicesKey}_${idx}" data-pk="${choicesKey}" data-pi="${idx}"
            value="${j}" ${j===sel?"checked":""}> ${esc(o)}</label>`).join("")}
        </div>
        <div class="dim" style="flex-basis:100%;font-size:.8rem">${esc(presetInfo(it.opt[sel]))}</div>
      </div>`;
    }
    const qty=it.q?` × ${it.q}`:"";
    if(it.fashion) return `<div class="lp-item"><div class="lp-label">
      <b><span class="tag cyber">Fashion</span> ${esc(it.n)}</b></div></div>`;
    return `<div class="lp-item"><div class="lp-label"><b>${esc(it.n)}${qty}</b>
      <small>${it.sp?`SP ${it.sp}`:esc(presetInfo(it.n))}</small></div></div>`;
  }).join("");
}
function humanityPanelHTML(){
  const dv=derived();
  if(!dv) return "";
  const boughtHL=dv.hl-presetCyberHL();
  return `<div class="panel ${dv.humanity<0?"red":"cyan"}">
    <h2>Humanity &amp; EMP <span class="dim">(S. 80/111)</span></h2>
    <p>EMP ${dv.empBase} × 10 = <b>${dv.humMax}</b> · Cyberware-HL: <b>−${dv.hl}</b>
    (Preset ${presetCyberHL()}${boughtHL>0?` + gekauft ${boughtHL}`:""})</p>
    <p>Humanity: <b>${dv.humanity}</b> · EMP effektiv: <b>${dv.empEff}</b></p>
    ${dv.humanity<0?`<div class="errbox">Humanity unter 0 – CYBERPSYCHOSE! Cyberware ablegen oder mit dem SL reden.</div>`:""}
  </div>`;
}

/* =============== Screen: EQUIP (SR/ER, Schritte #6–8) =============== */
let EQ_TAB="weapon";
const SHOP_TABS_EQ=["weapon","ammo","armor","gear","fashion","exotic"];
function renderEquip(){
  if(!S.role){ go("role"); return; }
  const role=S.role, tab=equipTab();
  const stepTabs=[{id:"weapons",no:"Schritt 6",label:"Weapons & Armor"},
    {id:"outfit",no:"Schritt 7",label:"Outfit & Gear"},{id:"cyber",no:"Schritt 8",label:"Cyberware"}];
  let tabBody="";
  if(tab==="weapons"){
    tabBody=`
    <div class="panel">
      <h2>Preset: Weapons &amp; Armor <span class="dim">(S. 98)</span></h2>
      <p class="dim">Das Rollen-Preset steht dir gratis zu. „oder“-Zeilen per Radio wählen.
      Preset-Granaten gehören zum Startpaket – im normalen Handel gibt es keine (Night Market, S. 344).</p>
      ${presetListHTML(CPR.PRESET_WEAPONS[role],"weapons")}
    </div>`;
  } else if(tab==="outfit"){
    const ls=role==="exec"?CPR.LIFESTYLE.exec:CPR.LIFESTYLE.default;
    tabBody=`
    <div class="panel">
      <h2>Preset: Outfit &amp; Gear <span class="dim">(S. 103)</span></h2>
      ${presetListHTML(CPR.PRESET_OUTFIT[role],"outfit")}
    </div>
    <div class="panel green">
      <h2>Lifestyle &amp; Housing <span class="dim">(S. 105)</span></h2>
      <p><b>Wohnung:</b> ${esc(ls.housing)}</p>
      <p><b>Lifestyle:</b> ${esc(ls.lifestyle)}</p>
      <p class="dim">${esc(ls.note)}</p>
      ${role==="nomad"?`<p class="dim">${esc(CPR.LIFESTYLE.nomadNote)}</p>`:""}
    </div>`;
  } else {
    tabBody=`
    <div class="panel">
      <h2>Preset: Cyberware <span class="dim">(S. 117)</span></h2>
      <p class="dim">Humanity-Verlust bei der Erstellung ist pro Rolle fix. „oder“-Zeilen per Radio wählen.</p>
      ${presetListHTML(CPR.PRESET_CYBER[role].items,"cyber")}
    </div>
    ${humanityPanelHTML()}
    <div class="warnbox">Hinweis: Beim Streetrat/Edgerunner kannst du beim Start <b>keine zusätzliche Cyberware
    kaufen</b> – nur das Preset (S. 117). Body-verändernde Cyberware im Preset ändert HP/Death Save laut Buch.</div>`;
  }

  const budgetLeft=CPR.SR_BUDGET-eqBudgetUsed();
  $("#equip-content").innerHTML=`
    <h1>Schritte 6–8 · Record Your Gear <span class="dim">(S. 98–117)</span></h1>
    <p class="dim">Rolle: <b>${esc(CPR.ROLES[role].name)}</b> – Presets + ${eb(CPR.SR_BUDGET)} Extra-Einkauf (S. 98).</p>
    <div class="tabs">
      ${stepTabs.map(t=>`<button class="tab ${tab===t.id?"active":""}" data-eqtab="${t.id}" type="button">
        <span class="stepno">${t.no}</span>${t.label}</button>`).join("")}
    </div>
    <div class="tab-body">${tabBody}</div>
    <div class="panel">
      <h2>Extra-Einkauf – ${eb(CPR.SR_BUDGET)} <span class="dim">(S. 98)</span></h2>
      <p class="dim">Zusätzlich zum Preset darfst du ${eb(CPR.SR_BUDGET)} ausgeben – aber
      <b>keine Cyberware</b> (nur Preset). Nicht ausgegebenes Geld bleibt als Erspartnis.</p>
      <div class="budget ${budgetLeft<0?"over":""}"><span>Extra-Budget</span><b>${eb(budgetLeft)} übrig</b></div>
      ${shopTabsHTML(SHOP_TABS_EQ,EQ_TAB)}
      <div class="tab-body">${shopItemsHTML(EQ_TAB)}</div>
    </div>
    <div class="panel"><h2>Deine Einkäufe</h2>${cartHTML()}</div>
    <div class="nav-row">
      <button class="btn" type="button" onclick="go('skills')">◀ Zurück</button>
      <button class="btn btn-primary" id="btn-equip-next" type="button">Zum Charakterbogen ▶</button>
    </div>`;

  $$("#equip-content [data-eqtab]").forEach(b=>b.addEventListener("click",()=>{
    S.equipTab=b.dataset.eqtab; go("equip");
  }));
  $$("#equip-content input[type=radio][data-pk]").forEach(r=>r.addEventListener("change",()=>{
    S.presetChoices[r.dataset.pk][r.dataset.pi]=Number(r.value);
    save(); renderEquip();
  }));
  bindShopCommon("#equip-content",eqCanAfford,renderEquip,(t)=>{EQ_TAB=t;});
  $("#btn-equip-next").addEventListener("click",()=>go("sheet"));
}

/* =============== Cyberware-Warnungen (CP-Shop) =============== */
function cyberWarnings(){
  const installs=[];
  if(S.method!=="complete"&&S.role){
    CPR.PRESET_CYBER[S.role].items.forEach((it,idx)=>{
      const n=it.opt?it.opt[(S.presetChoices.cyber||{})[idx]||0]:it.n;
      installs.push({name:n,qty:1});
    });
  }
  (S.buys||[]).forEach(b=>{
    if(b.cat==="cyberware"||b.cat==="fashionware") installs.push({name:b.name,qty:b.qty||1});
  });
  const byName={};
  installs.forEach(i=>byName[i.name]=(byName[i.name]||0)+i.qty);
  const warns=[];
  const used={};
  installs.forEach(i=>{
    const def=CPR.CYBER_BY_NAME[i.name];
    if(!def) return;
    if(def.req){
      if(!byName[def.req]) warns.push(`⚠ ${i.name}: benötigt „${def.req}“ – noch nicht installiert.`);
      const reqDef=CPR.CYBER_BY_NAME[def.req];
      if(reqDef&&reqDef.found) used[def.req]=(used[def.req]||0)+(def.slots||0);
    }
    if(def.paired&&byName[i.name]<2) warns.push(`⚠ ${i.name}: nur paarweise wirksam – bitte 2× installieren.`);
  });
  Object.keys(used).forEach(f=>{
    const cap=(CPR.CYBER_BY_NAME[f].foundSlots||0)*(byName[f]||0);
    if((byName[f]||0)>0&&used[f]>cap) warns.push(`⚠ ${f}: ${used[f]} von ${cap} Optionsslots belegt.`);
  });
  if(byName["Kerenzikov"]&&byName["Sandevistan"])
    warns.push("⚠ Nur EINE Speedware erlaubt: Kerenzikov oder Sandevistan.");
  [["Fashionware"],["Internal Body Cyberware"],["External Body Cyberware"]].forEach(([cat])=>{
    let cnt=0;
    installs.forEach(i=>{ const def=CPR.CYBER_BY_NAME[i.name]; if(def&&def.cat===cat) cnt+=i.qty; });
    if(cnt>7) warns.push(`⚠ ${cat}: ${cnt} von max. 7 Optionsslots (S. 111/114).`);
  });
  installs.forEach(i=>{
    const def=CPR.CYBER_BY_NAME[i.name];
    if(def&&def.bodyNote) warns.push(`ℹ ${i.name}: ${def.bodyNote}`);
  });
  return warns;
}

/* =============== Screen: SHOP (Complete Package, Schritt #6) =============== */
let SHOP_TAB="weapon";
const SHOP_TABS_CP=["weapon","ammo","armor","gear","fashion","exotic","cyber"];
const SOUL_EMPLOYERS=["Arasaka","Militech","Kang Tao","Network 54","Zetatech",
  "Biotechnica","Trauma Team","Hotwire's 'borg Emporium","eine andere Firma (SL entscheidet)"];
function renderShop(){
  if(!S.role){ go("role"); return; }
  const b=cpBudgets();
  const dv=derived();
  const warns=cyberWarnings();
  const hasLink=(S.buys||[]).some(x=>x.name==="Neural Link");
  $("#shop-content").innerHTML=`
    <h1>Schritt 6 · Buy Your Stuff <span class="dim">(S. 104–118)</span></h1>
    <p class="dim">Complete Package: <b>${eb(CPR.CP_BUDGET)}</b> für alles außer Fashion +
    <b>${eb(CPR.CP_FASHION_BUDGET)}</b> nur für Fashion/Fashionware (Rest verfällt, Überschuss aufs Hauptbudget).
    Munition: 10eb/10 Stück. Granaten nur auf dem Night Market (S. 344).</p>
    <div class="panel">
      <div class="budget ${b.mainRem<0?"over":""}"><span>Hauptbudget (${eb(CPR.CP_BUDGET)})</span><b>${eb(b.mainRem)} übrig</b></div>
      <div class="budget ${b.fashionRem<=0?"":"green"}"><span>Fashion-Budget (${eb(CPR.CP_FASHION_BUDGET)}) · nur Fashion/Fashionware</span><b>${eb(b.fashionRem)} übrig</b></div>
      ${S.sellSoul?`<div class="budget"><span>Seele (${eb(CPR.SOUL_BONUS)}) · nur Cyberware</span><b>${eb(b.soulRem)} übrig</b></div>`:""}
      <p class="dim">Rest des Hauptbudgets bleibt als Erspartnis bestehen; Rest aus dem Fashion-Budget verfällt.</p>
    </div>
    <div class="panel cyan">
      <h2>Seele verkaufen? <span class="dim">(S. 118 – optional)</span></h2>
      <p class="dim">+${eb(CPR.SOUL_BONUS)}, <b>nur für Cyberware</b> ausgebbar, plus ein <b>gratis Neural Link</b>.
      Der Haken: Du schuldest einer Corporation etwas sehr Peinliches …</p>
      <div class="radio-line">
        <label><input type="checkbox" id="chk-soul" ${S.sellSoul?"checked":""}>
        Ja, ich verkaufe meine Seele (SL-Freigabe empfohlen)</label>
      </div>
      ${S.sellSoul?`
      <label class="fld"><span>An wen hast du sie verkauft?</span>
        <select id="sel-employer">${SOUL_EMPLOYERS.map(e=>`<option ${S.soulEmployer===e?"selected":""}>${esc(e)}</option>`).join("")}</select></label>
      ${!hasLink?`<div class="btn-row"><button class="btn btn-primary" id="btn-freelink" type="button">Neural Link gratis einbauen (HL 7)</button></div>`:""}`:""}
    </div>
    ${shopTabsHTML(SHOP_TABS_CP,SHOP_TAB)}
    <div class="tab-body">${shopItemsHTML(SHOP_TAB)}</div>
    ${SHOP_TAB==="cyber"||warns.length?`
    <div class="panel">
      <h2>Cyberware-Check <span class="dim">(nur Warnungen – kein Muss)</span></h2>
      ${warns.length?`<ul class="clean">${warns.map(w=>`<li>${esc(w)}</li>`).join("")}</ul>`
        :`<p class="dim">Keine Auffälligkeiten: Voraussetzungen und Slots passen.</p>`}
    </div>`:""}
    ${humanityPanelHTML()}
    <div class="panel"><h2>Deine Einkäufe</h2>${cartHTML()}</div>
    ${dv&&dv.humanity<0?`<div class="errbox">Humanity unter 0 – <b>CYBERPSYCHOSE</b>! Du kannst so nicht weitermachen:
    baue Cyberware ab oder wählereinen SL-Plan.</div>`:""}
    ${b.mainRem<0?`<div class="errbox">Hauptbudget überzogen!</div>`:""}
    <div class="nav-row">
      <button class="btn" type="button" onclick="go('skills')">◀ Zurück</button>
      <button class="btn btn-primary" id="btn-shop-next" type="button"
        ${dv&&dv.humanity<0||b.mainRem<0?"disabled":""}>Zum Charakterbogen ▶</button>
    </div>`;

  const chk=$("#chk-soul");
  if(chk) chk.addEventListener("change",()=>{
    S.sellSoul=chk.checked;
    if(S.sellSoul) toast("Seele verkauft… Choomba, das war vielleicht mutig.");
    save(); renderShop();
  });
  const emp=$("#sel-employer");
  if(emp) emp.addEventListener("change",()=>{ S.soulEmployer=emp.value; save(); });
  const fl=$("#btn-freelink");
  if(fl) fl.addEventListener("click",()=>{
    addBuy({cat:"cyberware",name:"Neural Link",cost:0,hl:7,slots:0});
    save(); renderShop(); toast("Neural Link eingebaut – gratis (S. 118).");
  });
  bindShopCommon("#shop-content",cpCanAfford,renderShop,(t)=>{SHOP_TAB=t;});
  $("#btn-shop-next").addEventListener("click",()=>{ S.shopDone=true; go("sheet"); });
}

/* =============== Screen: CHARAKTERBOGEN =============== */
function methodLabel(m){
  return m==="streetrat"?"Streetrat (Templates)":m==="edgerunner"?"Edgerunner (Fast & Dirty)":
    m==="complete"?"Complete Package (Calculated)":"–";
}
function lpSummaryHTML(){
  const lp=S.lp||{}; const items=[];
  const P=(l,v)=>{ if(v!=null&&v!=="") items.push(`<li><b>${esc(l)}:</b> ${esc(v)}</li>`); };
  if(lp.culturalRegion!=null) P("Herkunft der Familie",LP.culturalOrigins[lp.culturalRegion].region);
  if(S.culturalLang) P("Kultursprache (Language 4, gratis)",S.culturalLang);
  if(lp.personality!=null) P("Persönlichkeit",LP.personality[lp.personality]);
  if(lp.clothingStyle!=null) P("Clothing Style",LP.clothingStyle[lp.clothingStyle]);
  if(lp.hairstyle!=null) P("Hairstyle",LP.hairstyle[lp.hairstyle]);
  if(lp.affectation!=null) P("Affectation",LP.affectation[lp.affectation]);
  if(lp.values!=null) P("Werte am meisten",LP.values[lp.values]);
  if(lp.feelings!=null) P("Gefühl über Menschen",LP.feelings[lp.feelings]);
  if(lp.valuedPerson!=null) P("Wichtigste Person",LP.valuedPerson[lp.valuedPerson]);
  if(lp.valuedPossession!=null) P("Wichtigster Besitz",LP.valuedPossession[lp.valuedPossession]);
  if(lp.familyBackground!=null) P("Familiärer Hintergrund",LP.familyBackground[lp.familyBackground]);
  if(lp.environment!=null) P("Kindheit",LP.environment[lp.environment]);
  if(lp.familyCrisis!=null) P("Familienkrise",LP.familyCrisis[lp.familyCrisis]);
  if(lp.friendCount!=null) P("Anzahl Freunde",String(lp.friendCount));
  for(let i=0;lp["friend_"+i]!=null;i++) P("Freund #"+(i+1),LP.friendRelation[lp["friend_"+i]]);
  if(lp.enemyCount!=null) P("Anzahl Feinde",String(lp.enemyCount));
  for(let i=0;lp["enemyType_"+i]!=null;i++){
    P("Feind #"+(i+1)+" – wer",LP.enemyType[lp["enemyType_"+i]]);
    if(lp["enemyCause_"+i]!=null) P("Feind #"+(i+1)+" – warum",LP.enemyCause[lp["enemyCause_"+i]]);
    if(lp["enemyWronged_"+i]) P("Feind #"+(i+1)+" – übergangen",
      lp["enemyWronged_"+i]==="me"?"ich wurde übergangen":"der Feind wurde übergangen");
    if(lp["enemyRes_"+i]!=null) P("Feind #"+(i+1)+" – Ressourcen",LP.enemyResources[lp["enemyRes_"+i]]);
    if(lp["enemyRevenge_"+i]!=null) P("Feind #"+(i+1)+" – Racheplan",LP.sweetRevenge[lp["enemyRevenge_"+i]]);
  }
  for(let i=0;lp["love_"+i]!=null;i++) P("Liebschaft #"+(i+1),LP.loveAffairEndings[lp["love_"+i]]);
  if(lp.lifeGoal!=null) P("Lebensziel",LP.lifeGoals[lp.lifeGoal]);
  if(S.role){
    (LP.roleLifepath[S.role]||[]).forEach((tbl,i)=>{
      const val=tbl.choice?lp["role_"+i+"_choice"]:(lp["role_"+i]!=null?tbl.opts[lp["role_"+i]]:null);
      if(val) P(tbl.t,val);
    });
  }
  return items.length?`<ul class="clean">${items.join("")}</ul>`
    :`<p class="dim">Lifepath noch nicht gelaufen.</p>`;
}
function sheetSkillRows(){
  const rows=[];
  if(S.method==="streetrat") CPR.STREETRAT_SKILLS[S.role].forEach(([n,v])=>rows.push({n:displaySkillName(n),v}));
  else Object.keys(S.skills).forEach(n=>rows.push({n:displaySkillName(n),v:S.skills[n]}));
  if(S.culturalLang) rows.push({n:`Language (${S.culturalLang})`,v:CPR.CULTURAL_LANG_RANK});
  rows.sort((a,b)=>b.v-a.v||a.n.localeCompare(b.n));
  return rows.map(r=>`<tr><td>${esc(r.n)}</td><td class="num">${skillStat(r.n)}</td>
    <td class="num">${r.v}</td><td class="num"><b>${(S.stats[skillStat(r.n)]||0)+r.v}</b></td></tr>`).join("");
}
function sheetEquipmentHTML(){
  const weapons=[],armors=[],ammo=[],gears=[],fashions=[],cybers=[];
  if(S.method==="streetrat"||S.method==="edgerunner"){
    CPR.PRESET_WEAPONS[S.role].forEach((it,idx)=>{
      const n=it.opt?it.opt[(S.presetChoices.weapons||{})[idx]||0]:it.n;
      const q=it.q||1;
      if(/Ammunition/.test(n)) ammo.push(`${esc(n)}${q>1?" × "+q:""}`);
      else if(/Armorjack/.test(n)) armors.push(`${esc(n.replace(/\(|\)/g,""))} – SP ${it.sp||11}`);
      else if(/Shield/.test(n)) armors.push(`${esc(n)} – SP 10 · belegt einen Arm`);
      else weapons.push(`${esc(n)}${q>1?" × "+q:""}`);
    });
    CPR.PRESET_OUTFIT[S.role].forEach((it,idx)=>{
      const n=it.opt?it.opt[(S.presetChoices.outfit||{})[idx]||0]:it.n;
      if(it.fashion) fashions.push(esc(n));
      else gears.push(`${esc(n)}${it.q&&it.q>1?" × "+it.q:""}`);
    });
    CPR.PRESET_CYBER[S.role].items.forEach((it,idx)=>{
      const n=it.opt?it.opt[(S.presetChoices.cyber||{})[idx]||0]:it.n;
      const def=CPR.CYBER_BY_NAME[n];
      cybers.push(`${esc(n)} <span class="dim">(HL ${def?def.hl:0})</span>`);
    });
  }
  (S.buys||[]).forEach(b=>{
    const q=b.qty>1?` × ${b.qty}`:"";
    if(b.cat==="weapon") weapons.push(`${esc(b.name)}${q}`);
    else if(b.cat==="ammo") ammo.push(`${esc(b.name)} (10 Schuss)${q}`);
    else if(b.cat==="armor"){
      const a=CPR.ARMOR.find(x=>x.n===b.name)||{};
      armors.push(`${esc(b.name)}${b.loc?` (${b.loc==="Head"?"Kopf":b.loc==="Body"?"Körper":b.loc})`:""} – SP ${a.sp!=null?a.sp:"?"}${q}`);
    }
    else if(b.cat==="gear") gears.push(`${esc(b.name)}${q}`);
    else if(b.cat==="fashion") fashions.push(`${esc(b.name)}${q}`);
    else if(b.cat==="cyberware"||b.cat==="fashionware") cybers.push(`${esc(b.name)} <span class="dim">(HL ${b.hl||0})</span>${q}`);
  });
  const ul=(arr)=>arr.length?`<ul class="clean">${arr.map(x=>`<li>${x}</li>`).join("")}</ul>`
    :`<p class="dim">–</p>`;
  return `
    <div class="sheet-section"><h2>Waffen &amp; Rüstung</h2>${ul(weapons)}${armors.length?ul(armors):""}</div>
    <div class="sheet-section"><h2>Munition</h2>${ul(ammo)}</div>
    <div class="sheet-section"><h2>Gear</h2>${ul(gears)}</div>
    <div class="sheet-section"><h2>Fashion</h2>${ul(fashions)}</div>
    <div class="sheet-section"><h2>Cyberware</h2>${ul(cybers)}</div>`;
}
function renderSheet(){
  const dv=derived();
  const role=S.role?CPR.ROLES[S.role]:{name:"–",ability:"–",ra:""};
  const ls=S.role==="exec"?CPR.LIFESTYLE.exec:CPR.LIFESTYLE.default;
  let budgetLine="";
  if(S.method==="streetrat"||S.method==="edgerunner")
    budgetLine=`Erspartnis aus dem Extra-Einkauf: <b>${eb(CPR.SR_BUDGET-eqBudgetUsed())}</b>`;
  else if(S.method==="complete"){
    const b=cpBudgets();
    budgetLine=`Hauptbudget übrig: <b>${eb(b.mainRem)}</b> · Fashion übrig (verfällt): <b>${eb(b.fashionRem)}</b>`
      +(S.sellSoul?` · Seele übrig: <b>${eb(b.soulRem)}</b>`:"");
  }
  $("#sheet-content").innerHTML=`
  <div class="sheet">
    <h1>Charakterbogen</h1>
    <div class="panel">
      <label class="fld"><span>Name</span><input type="text" id="inp-sheetname" value="${esc(S.name||"")}" placeholder="Unbenannter Edgerunner"></label>
      <p><b>${esc(role.name)}</b> · Role Ability: <b>${esc(role.ability)} ${S.roleAbility}</b> ·
      ${esc(methodLabel(S.method))}${S.sellSoul?` · <span class="tag cyber">Seele verkauft an ${esc(S.soulEmployer||"…")}</span>`:""}</p>
      <p class="dim">${esc(role.ra||"")}</p>
    </div>
    <div class="panel">
      <h2>STATs</h2>
      <div class="statblock">
        ${CPR.STATS.map(st=>{
          const v=S.stats[st]||"–";
          const e=dv&&dv.effStats?dv.effStats[st]:v;
          return `<div class="statbox"><div class="lbl">${st}</div><div class="val">${v}</div>
            <div class="sub">${e!==v&&e!=null?"effektiv: "+e:esc(CPR.STAT_INFO[st].split(" – ")[0])}</div></div>`;
        }).join("")}
      </div>
    </div>
    <div class="panel">
      <h2>Abgeleitete Werte</h2>
      <div class="statblock">
        <div class="statbox"><div class="lbl">HP</div><div class="val">${dv?dv.hp:"–"}</div><div class="sub">Hit Points</div></div>
        <div class="statbox"><div class="lbl">SW</div><div class="val">${dv?dv.sw:"–"}</div><div class="sub">Seriously Wounded</div></div>
        <div class="statbox"><div class="lbl">Death Save</div><div class="val">${dv?dv.deathSave:"–"}</div><div class="sub">= BODY</div></div>
        <div class="statbox"><div class="lbl">Humanity</div><div class="val">${dv?dv.humanity:"–"}</div><div class="sub">EMP ${dv?dv.empBase:"–"}×10${dv&&dv.hl?" − "+dv.hl+" HL":""}</div></div>
        <div class="statbox"><div class="lbl">EMP eff.</div><div class="val">${dv?dv.empEff:"–"}</div><div class="sub">⌊Humanity/10⌋</div></div>
      </div>
    </div>
    <div class="panel">
      <h2>Skills</h2>
      <table class="tbl">
        <tr><th>Skill</th><th class="num">STAT</th><th class="num">Rang</th><th class="num">STAT+Skill</th></tr>
        ${sheetSkillRows()}
      </table>
    </div>
    <div class="panel">
      <h2>Lifepath</h2>
      ${lpSummaryHTML()}
    </div>
    <div class="panel">
      <h2>Ausrüstung</h2>
      ${sheetEquipmentHTML()}
    </div>
    <div class="panel green">
      <h2>Lifestyle &amp; Housing <span class="dim">(S. 105)</span></h2>
      <p><b>Wohnung:</b> ${esc(ls.housing)}</p>
      <p><b>Lifestyle:</b> ${esc(ls.lifestyle)}</p>
      <p class="dim">${esc(ls.note)}</p>
      ${S.role==="nomad"?`<p class="dim">${esc(CPR.LIFESTYLE.nomadNote)}</p>`:""}
      ${budgetLine?`<p>${budgetLine}</p>`:""}
    </div>
    <div class="nav-row noprint">
      <button class="btn" type="button" onclick="go('${S.method==="complete"?"shop":"equip"}')">◀ Zurück zum Einkauf</button>
      <span class="btn-row">
        <button class="btn btn-primary" id="btn-print" type="button">🖨 Drucken</button>
        <button class="btn" id="btn-pdf" type="button" title="Befüllt RTG-CPR-CharacterSheet-Fillable.pdf mit deinen Daten">📄 Offiziellen RTG-Bogen befüllen</button>
        <button class="btn" id="btn-export" type="button">💾 JSON exportieren</button>
        <button class="btn" id="btn-import" type="button">📂 JSON importieren</button>
        <input type="file" id="inp-import" accept=".json,application/json" class="hidden">
      </span>
    </div>
  </div>`;

  const nm=$("#inp-sheetname");
  if(nm) nm.addEventListener("change",()=>{ S.name=nm.value; save(); });
  $("#btn-print").addEventListener("click",()=>window.print());
  $("#btn-export").addEventListener("click",()=>{
    const blob=new Blob([JSON.stringify(S,null,2)],{type:"application/json"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=`charakter-${(S.name||"ohne-namen").toLowerCase().replace(/[^a-z0-9äöüß]+/gi,"-")}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),2000);
    toast("💾 Charakter als JSON exportiert.");
  });
  $("#btn-import").addEventListener("click",()=>$("#inp-import").click());
  $("#inp-import").addEventListener("change",(ev)=>{
    const f=ev.target.files[0]; if(!f) return;
    const rd=new FileReader();
    rd.onload=()=>{
      try{
        const data=JSON.parse(rd.result);
        if(!data||!data.method||!data.role||!CPR.ROLES[data.role]) throw new Error("Das sieht nach keinem Charakter aus.");
        S=data; save();
        toast("📂 Charakter importiert!");
        const steps=["start","role","lifepath","stats","derived","skills","equip","shop","sheet"];
        go(steps.includes(S.step)?S.step:"sheet");
      }catch(e){ toast("⚠ Import fehlgeschlagen: "+e.message); }
    };
    rd.readAsText(f);
    ev.target.value="";
  });
}

/* =============== Init =============== */
function init(){
  if(!load()) S=freshState(null);
  const steps=["start","role","lifepath","stats","derived","skills","equip","shop","sheet"];
  if(!S.step||!steps.includes(S.step)) S.step="start";
  S.presetChoices=S.presetChoices||{weapons:{},outfit:{},cyber:{}};
  S.buys=S.buys||[]; S.skills=S.skills||{}; S.skillChoices=S.skillChoices||{};
  S.lp=S.lp||{}; S.visited=S.visited||{}; S.stats=S.stats||{};
  $("#btn-dicelog").addEventListener("click",()=>$("#dicelog").classList.toggle("hidden"));
  $("#btn-dicelog-close").addEventListener("click",()=>$("#dicelog").classList.add("hidden"));
  $("#btn-reset").addEventListener("click",()=>{
    if(confirm("Charakter wirklich verwerfen und neu starten?")){
      try{ localStorage.removeItem(SAVE_KEY); }catch(e){}
      S=freshState(null);
      renderAll(); toast("↺ Neu gestartet.");
    }
  });
  renderAll();
}
init();
