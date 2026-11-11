"use strict";
/* ============================================================
   sheet-alt-pdf.js – alternativer Bogen als ausfüllbares PDF
   (Solo / Medtech, Hintergründe aus sheet-alt-bg-b64.js)

   Erzeugt mit pdf-lib ein echtes AcroForm-PDF: Hintergrundseiten
   plus Formularfelder an denselben Positionen wie im HTML-Bogen,
   bereits mit den Charakterwerten befüllt – aber weiter editierbar.
   ============================================================ */

(function(){
  function hexToRgb(hex){
    const m = String(hex||"#ffffff").trim().match(/^#?([0-9a-f]{6})$/i);
    if(!m) return {r:1,g:1,b:1};
    const n = parseInt(m[1],16);
    return {r:((n>>16)&255)/255, g:((n>>8)&255)/255, b:(n&255)/255};
  }
  function num(n){ return String(Math.round(n*10000)/10000); }
  function colorOp(hex){
    const c = hexToRgb(hex);
    return num(c.r)+" "+num(c.g)+" "+num(c.b)+" rg";
  }
  function fontSizeFor(f){
    const h = f.rect_pt ? Math.abs(f.rect_pt[3]-f.rect_pt[1]) : 0;
    let fs = f.font_size_pt>0 ? f.font_size_pt : Math.min(14, h*0.62);
    /* Mehrzeilige Felder statisch etwas kleiner, damit der Text nicht
       am Feldrand abgeschnitten wird (im HTML kann man scrollen). */
    if(f.type==="textarea") fs = Math.min(fs, 9);
    return Math.max(4, Math.min(24, fs));
  }
  function alignFor(a){
    if(a==="center") return PDFLib.TextAlignment.Center;
    if(a==="right") return PDFLib.TextAlignment.Right;
    return PDFLib.TextAlignment.Left;
  }
  function lastWidget(field){
    const ws = field.acroField.getWidgets();
    return ws.length ? ws[ws.length-1] : null;
  }
  /* Unsichtbarer Kasten: nur der Text/das Häkchen soll erscheinen. */
  function stripBox(widget){
    if(!widget) return;
    try{
      const ac = widget.getAppearanceCharacteristics();
      if(ac && ac.dict){
        ac.dict.delete(PDFLib.PDFName.of("BG"));
        ac.dict.delete(PDFLib.PDFName.of("BC"));
      }
    }catch(e){}
    try{ widget.getOrCreateBorderStyle().setWidth(0); }catch(e){}
  }
  function pdfText(v){
    return String(v==null?"":v).replace(/\r\n?/g,"\n");
  }

  /* Eigene Checkbox-Optik: nur das X, kein weißer Kasten/Rahmen. */
  function checkboxAppearance(doc, w, h, hex, checked){
    const dict = doc.context.obj({
      Type:"XObject", Subtype:"Form", BBox:[0,0,w,h],
      Resources: doc.context.obj({})
    });
    if(!checked) return doc.context.register(doc.context.stream("", dict));
    const c = hexToRgb(hex);
    const lw = Math.max(0.8, Math.min(w,h)*0.12);
    const content = [
      "q",
      num(c.r)+" "+num(c.g)+" "+num(c.b)+" RG",
      num(lw)+" w 1 J 1 j",
      num(w*0.22)+" "+num(h*0.22)+" m",
      num(w*0.78)+" "+num(h*0.78)+" l",
      num(w*0.78)+" "+num(h*0.22)+" m",
      num(w*0.22)+" "+num(h*0.78)+" l",
      "S Q"
    ].join("\n");
    return doc.context.register(doc.context.stream(content, dict));
  }
  function overrideCheckboxAppearance(doc, cb, w, h, hex, checked){
    const widget = lastWidget(cb);
    if(!widget || !widget.dict) return;
    const onRef = checkboxAppearance(doc, w, h, hex, true);
    const offRef = checkboxAppearance(doc, w, h, hex, false);
    const states = doc.context.obj({});
    states.set(PDFLib.PDFName.of("Yes"), onRef);
    states.set(PDFLib.PDFName.of("Off"), offRef);
    const ap = doc.context.obj({});
    ap.set(PDFLib.PDFName.of("N"), states);
    widget.dict.set(PDFLib.PDFName.of("AP"), ap);
  }

  async function buildAltSheetPDF(role){
    if(typeof PDFLib==="undefined" || !PDFLib.PDFDocument)
      throw new Error("pdf-lib ist nicht geladen.");
    if(typeof CPR.altSheetAllValues!=="function")
      throw new Error("sheet-alt.js ist nicht geladen.");
    const all = CPR.altSheetAllValues(role);
    if(!all) throw new Error("Für diese Rolle gibt es keinen getrennten Bogen.");

    const data = all.data;
    const backgrounds = (window.CPR_ALT_BG && window.CPR_ALT_BG[role]) || [];
    const {PDFDocument, StandardFonts, PDFName, PDFBool} = PDFLib;

    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Courier);
    const pages = {};

    for(let i=0; i<data.pages.length; i++){
      const pg = data.pages[i];
      const page = doc.addPage([pg.width_pt, pg.height_pt]);
      pages[pg.page] = page;
      if(backgrounds[i]){
        try{
          const img = await doc.embedJpg(backgrounds[i]);
          page.drawImage(img, {x:0, y:0, width:pg.width_pt, height:pg.height_pt});
        }catch(e){
          console.warn("[sheet-alt-pdf] Hintergrund "+(i+1)+" fehlt:", e);
        }
      }
    }

    const form = doc.getForm();
    let added = 0, skipped = 0;
    const checkboxes = [];

    data.fields.forEach(f=>{
      const page = pages[f.page];
      if(!page || !f.rect_pt) { skipped++; return; }
      const x = Math.min(f.rect_pt[0], f.rect_pt[2]);
      const y = Math.min(f.rect_pt[1], f.rect_pt[3]);
      const w = Math.abs(f.rect_pt[2] - f.rect_pt[0]);
      const h = Math.abs(f.rect_pt[3] - f.rect_pt[1]);
      if(w<=0 || h<=0) { skipped++; return; }
      const rect = {x:x, y:y, width:w, height:h};
      const val = all.values[f.name] || {};

      try{
        if(f.type==="checkbox"){
          const cb = form.createCheckBox(f.name);
          cb.addToPage(page, rect);
          stripBox(lastWidget(cb));
          cb.acroField.setDefaultAppearance("/Courier 12 Tf "+colorOp(f.color));
          if(val.checked) cb.check(); else cb.uncheck();
          checkboxes.push({cb:cb, w:w, h:h, color:f.color, checked:!!val.checked});
        } else if(f.type==="text" || f.type==="textarea"){
          const tf = form.createTextField(f.name);
          tf.addToPage(page, rect);
          stripBox(lastWidget(tf));
          if(f.type==="textarea") tf.enableMultiline();
          if(f.max_len) tf.setMaxLength(f.max_len);
          if(f.readonly) tf.enableReadOnly();
          const txt = pdfText(val.value);
          if(txt!=="") tf.setText(txt);
          tf.setAlignment(alignFor(f.align));
          const fs = fontSizeFor(f);
          tf.setFontSize(fs);
          tf.acroField.setDefaultAppearance(
            "/Courier "+num(fs)+" Tf "+colorOp(f.color));
        } else {
          skipped++; /* Button-/Bildfelder */
          return;
        }
        added++;
      }catch(e){
        skipped++;
        console.warn("[sheet-alt-pdf] Feld "+f.name+" übersprungen:", e);
      }
    });

    /* Erscheinungsbilder einmalig erzeugen (weiße Schrift auf dunklem Bogen) */
    try{ form.updateFieldAppearances(font); }
    catch(e){ console.warn("[sheet-alt-pdf] Appearance-Update:", e); }
    /* Checkboxen ohne weißen Kasten: nur das X in der Bogenfarbe. */
    checkboxes.forEach(c=>{
      overrideCheckboxAppearance(doc, c.cb, c.w, c.h, c.color, c.checked);
    });
    /* Eigene Appearance-Streams sollen nicht vom Viewer überschrieben werden. */
    try{ form.acroForm.dict.set(PDFName.of("NeedAppearances"), PDFBool.False); }
    catch(e){}
    /* Schrift für spätere Bearbeitung im AcroForm hinterlegen. */
    try{
      const dr = doc.context.obj({});
      dr.set(PDFName.of("Font"), doc.context.obj({}));
      dr.get(PDFName.of("Font")).set(PDFName.of("Courier"), font.ref);
      form.acroForm.dict.set(PDFName.of("DR"), dr);
      form.acroForm.dict.set(PDFName.of("DA"), PDFLib.PDFString.of("/Courier 12 Tf 0 g"));
    }catch(e){}

    try{
      doc.setTitle("Cyberpunk RED – "+role+" (getrennt)");
      doc.setCreator("Cyberpunk RED Charaktererschaffung");
      doc.setProducer("pdf-lib");
    }catch(e){}

    const bytes = await doc.save();
    return {bytes:bytes, role:role, pages:data.pages.length,
      fields:added, skipped:skipped};
  }

  CPR.buildAltSheetPDF = buildAltSheetPDF;
  CPR.altSheetPDFBytes = async function(role){
    return (await buildAltSheetPDF(role)).bytes;
  };

  CPR.downloadAltSheetPDF = async function(role){
    try{
      toast("📄 Ausfüllbares PDF wird erzeugt …");
      const res = await buildAltSheetPDF(role);
      const blob = new Blob([res.bytes], {type:"application/pdf"});
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${(S.name||"charakter")}-${role}-getrennt.pdf`.toLowerCase()
        .replace(/[^a-z0-9äöüß.\-]+/gi,"-");
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(a.href), 3000);
      toast("📄 PDF erzeugt: "+res.pages+" Seiten, "+res.fields+" Felder"+
        (res.skipped?" ("+res.skipped+" übersprungen)":"")+".");
    }catch(e){
      console.error("[sheet-alt-pdf]", e);
      toast("[!] PDF-Erzeugung fehlgeschlagen: "+e.message);
    }
  };
})();
