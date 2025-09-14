// medicine-generics.js
(function(){
  function norm(s){return (s||"").toLowerCase().replace(/[+&,\/()%-]/g," ").replace(/\s+/g," ").trim();}

  function render(items){
    const listEl=document.getElementById("genericList");
    if(!listEl) return false; // DOM not ready yet
    const frag=document.createDocumentFragment();
    (items||[]).forEach(item=>{
      const name=item.name||item.generic||"";
      const doses=Array.isArray(item.dosages)?item.dosages:[];
      const wrap=document.createElement("div"); wrap.className="generic-item";
      const h2=document.createElement("h2"); h2.className="generic-title"; h2.textContent=name; wrap.appendChild(h2);
      const ul=document.createElement("ul"); ul.className="dosage-list";
      doses.forEach(d=>{
        const li=document.createElement("li");
        const a=document.createElement("a");
        a.href=(d.url||d.link||"#"); a.target="_blank";
        a.textContent=(d.label||d.name||d.dosage||d.text||"");
        li.appendChild(a); ul.appendChild(li);
      });
      wrap.appendChild(ul); frag.appendChild(wrap);
    });
    listEl.innerHTML=""; listEl.appendChild(frag);

    const input=document.getElementById("genericSearch");
    if(input){
      input.oninput=function(){
        const q=norm(this.value), w=q?q.split(" "):[];
        document.querySelectorAll(".generic-item").forEach(el=>{
          const title=norm(el.querySelector(".generic-title").textContent);
          el.style.display=(!q||w.every(x=>title.includes(x)))?"":"none";
        });
      };
    }
    return true;
  }

  // Public API the data file will call
  window.initGenerics=function(data){
    // if DOM not ready, retry until present
    if(!render(data)){
      var tries=0, t=setInterval(function(){
        tries++; if(render(data)||tries>200) clearInterval(t); // retry up to ~10s
      },50);
    }
  };
})();
