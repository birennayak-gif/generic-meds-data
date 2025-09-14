// medicine-generics.js
document.addEventListener("DOMContentLoaded", function () {
  const input   = document.getElementById("genericSearch");
  const listEl  = document.getElementById("genericList");

  // Try three sources (primary + fallbacks)
  const SOURCES = [
    "https://birennayak-gif.github.io/generic-meds-data/medicine-generics.json",
    "https://raw.githubusercontent.com/birennayak-gif/generic-meds-data/main/medicine-generics.json",
    "https://cdn.jsdelivr.net/gh/birennayak-gif/generic-meds-data@main/medicine-generics.json"
  ];

  const norm = s => s.toLowerCase().replace(/[+&,\/()%-]/g," ").replace(/\s+/g," ").trim();

  function render(data){
    const frag = document.createDocumentFragment();

    data.forEach(item=>{
      // tolerate both {name: "..."} and {generic: "..."}
      const gName = item.name || item.generic || "";
      const doses = Array.isArray(item.dosages) ? item.dosages : [];

      const wrap = document.createElement("div");
      wrap.className = "generic-item";

      const h2 = document.createElement("h2");
      h2.className = "generic-title";
      h2.textContent = gName;
      wrap.appendChild(h2);

      const ul = document.createElement("ul");
      ul.className = "dosage-list";

      doses.forEach(d=>{
        // tolerate {label,url} OR {name,url} OR {dosage,link}
        const label = d.label || d.name || d.dosage || d.text || "";
        const url   = d.url   || d.link || "#";

        const li = document.createElement("li");
        const a  = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.textContent = label;

        li.appendChild(a);
        ul.appendChild(li);
      });

      wrap.appendChild(ul);
      frag.appendChild(wrap);
    });

    listEl.innerHTML = "";
    listEl.appendChild(frag);
  }

  function enableSearch(){
    input.addEventListener("input", function(){
      const q = norm(this.value);
      const words = q ? q.split(" ") : [];
      document.querySelectorAll(".generic-item").forEach(el=>{
        const title = norm(el.querySelector(".generic-title").textContent);
        const match = !q || words.every(w=>title.includes(w));
        el.style.display = match ? "" : "none";
      });
    });
  }

  async function load(){
    let lastErr;
    for (const u of SOURCES){
      try{
        const res = await fetch(u, {cache:"no-store", mode:"cors"});
        if(!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        render(data);
        enableSearch();
        return;
      }catch(e){
        lastErr = e;
        console.warn("Fetch failed:", u, e);
      }
    }
    listEl.innerHTML = "<p>⚠️ Could not load medicine list. Please try again later.</p>";
    console.error(lastErr);
  }

  load();
});
