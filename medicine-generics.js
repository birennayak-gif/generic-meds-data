// medicine-generics.js
document.addEventListener("DOMContentLoaded", function () {
  const input  = document.getElementById("genericSearch");
  const listEl = document.getElementById("genericList");

  // If data didn't load, show a helpful message
  if (!window.MEDICINE_GENERICS || !Array.isArray(window.MEDICINE_GENERICS)) {
    listEl.innerHTML = "<p>⚠️ Data not available. Ensure medicine-generics-data.js loads before this script.</p>";
    return;
  }

  const data = window.MEDICINE_GENERICS;

  function render(items){
    const frag = document.createDocumentFragment();
    items.forEach(item=>{
      const wrap = document.createElement("div");
      wrap.className = "generic-item";

      const h2 = document.createElement("h2");
      h2.className = "generic-title";
      h2.textContent = item.name || item.generic || "";
      wrap.appendChild(h2);

      const ul = document.createElement("ul");
      ul.className = "dosage-list";

      (item.dosages || []).forEach(d=>{
        const li = document.createElement("li");
        const a  = document.createElement("a");
        a.href = (d.url || d.link || "#");
        a.target = "_blank";
        a.textContent = (d.label || d.name || d.dosage || d.text || "");
        li.appendChild(a);
        ul.appendChild(li);
      });

      wrap.appendChild(ul);
      frag.appendChild(wrap);
    });
    listEl.innerHTML = "";
    listEl.appendChild(frag);
  }

  function norm(s){return s.toLowerCase().replace(/[+&,\/()%-]/g," ").replace(/\s+/g," ").trim();}

  // initial render
  render(data);

  // title-only search (fast); change to include dosages if needed
  input.addEventListener("input", function(){
    const q = norm(this.value);
    const words = q ? q.split(" ") : [];
    document.querySelectorAll(".generic-item").forEach(el=>{
      const title = norm(el.querySelector(".generic-title").textContent);
      const match = !q || words.every(w=>title.includes(w));
      el.style.display = match ? "" : "none";
    });
  });
});
