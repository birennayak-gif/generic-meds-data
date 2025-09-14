// medicine-generics.js
(function () {
  // normalize: lower, remove special chars, collapse spaces
  function norm(s){return (s||"").toLowerCase().replace(/[+&,\/()%-]/g," ").replace(/\s+/g," ").trim();}

  function buildItem(item){
    const wrap=document.createElement("div"); wrap.className="generic-item";
    const h2=document.createElement("h2"); h2.className="generic-title"; h2.textContent=item.name||item.generic||"";
    wrap.appendChild(h2);
    const ul=document.createElement("ul"); ul.className="dosage-list";
    (item.dosages||[]).forEach(d=>{
      const li=document.createElement("li");
      const a=document.createElement("a");
      a.href=(d.url||d.link||"#"); a.target="_blank";
      a.textContent=(d.label||d.name||d.dosage||d.text||"");
      li.appendChild(a); ul.appendChild(li);
    });
    wrap.appendChild(ul);
    return wrap;
  }

  function renderMatches(data, words, limit){
    const listEl=document.getElementById("genericList");
    if(!listEl) return false;
    listEl.innerHTML="";
    const frag=document.createDocumentFragment();
    let shown=0;

    for(let i=0;i<data.length;i++){
      const item=data[i];
      const hay=norm((item.name||item.generic||"") + " " + (item._norm||""));
      if(words.every(w=>hay.includes(w))){
        frag.appendChild(buildItem(item));
        if(++shown>=limit) break;
      }
    }

    if(shown===0){
      listEl.innerHTML="<p>No matches found.</p>";
    }else{
      listEl.appendChild(frag);
      if(shown===limit) {
        const note=document.createElement("p");
        note.style.marginTop="8px";
        note.style.fontSize="12px";
        note.style.color="#666";
        note.textContent="Showing first "+limit+" results. Refine your search to see fewer.";
        listEl.appendChild(note);
      }
    }
    return true;
  }

  function prepareData(raw){
    // Precompute a normalized string per item (title + all dosage labels) for fast matching
    raw.forEach(it=>{
      const labels=(it.dosages||[]).map(d=>d.label||d.name||d.dosage||d.text||"").join(" ");
      it._norm = norm((it.name||it.generic||"")+" "+labels);
    });
    return raw;
  }

  // Public init the data file will call (no DOMContentLoaded)
  window.initGenerics=function(raw){
    // Wait for the inputs to exist in strict CMS loaders
    function tryInit(){
      const input=document.getElementById("genericSearch");
      const listEl=document.getElementById("genericList");
      if(!input || !listEl){ setTimeout(tryInit,50); return; }

      const data=prepareData(raw);

      // Don’t render all items on load (too heavy) – prompt to search
      listEl.innerHTML = "<p>Type at least 2 characters to search generics.</p>";

      input.oninput=function(){
        const q=norm(this.value);
        if(q.length<2){ listEl.innerHTML="<p>Type at least 2 characters to search generics.</p>"; return; }
        const words=q.split(" ");
        renderMatches(data, words, 200); // cap results for performance
      };
    }
    tryInit();
  };
})();
