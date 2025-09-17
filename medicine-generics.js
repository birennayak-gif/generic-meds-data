// medicine-generics.js
(function () {
  var $ = function(id){ return document.getElementById(id); };
  var norm = function(s){ return (s||"").toLowerCase().replace(/[+&,\/()%-]/g," ").replace(/\s+/g," ").trim(); };

  var DATA = [];
  var INDEXED = false;
  var active = [];

 function ensureIndex(){
  if (INDEXED) return;
  for (var i=0; i<DATA.length; i++){
    var it = DATA[i], labels = "";

    if (it.dosages && it.dosages.length){
      var tmp=[];
      for (var j=0; j<it.dosages.length; j++){
        var d = it.dosages[j];
        var txt = "";

        if (typeof d === "string") txt = d;
        else if (d && typeof d === "object") txt = d.label || d.name || d.dosage || d.text || "";

        tmp.push(txt);
      }
      labels = tmp.join(" ");
    }

    // 👇 add dosage text into normalized string
    it._norm = norm((it.name||it.generic||"") + " " + labels);
  }
  INDEXED = true;
}


  function buildRow(it){
  var wrap = document.createElement("div");
  wrap.className = "generic-item";

  // Generic title
  var h2 = document.createElement("h2");
  h2.className = "generic-title";
  h2.textContent = it.name || it.generic || "";
  wrap.appendChild(h2);

  // Dosages
  var ul = document.createElement("ul");
  ul.className = "dosage-list";

  if (it.dosages && it.dosages.length){
    for (var k=0; k<it.dosages.length; k++){
      var d = it.dosages[k];
      var li = document.createElement("li");
      var a = document.createElement("a");

      // Normalization
      var text = "";
      if (typeof d === "string") {
        text = d;
        a.href = "#";
      } else if (d && typeof d === "object") {
        text = d.label || d.name || d.dosage || d.text || "";
        a.href = d.url || d.link || "#";
      }

      a.target = "_blank";
      a.textContent = text;

      li.appendChild(a);
      ul.appendChild(li);
    }
  }

  wrap.appendChild(ul);
  return wrap;
}


  function renderList(){
    var list = $("genericList");
    if (!list) return;
    list.innerHTML = "";

    if (!active.length){
      list.style.display = "none";
      return;
    }

    var frag = document.createDocumentFragment();
    for (var i=0; i<active.length; i++){
      frag.appendChild(buildRow(active[i]));
    }
    list.appendChild(frag);
    list.style.display = "block";
  }

  function onSearch(){
    var input = $("genericSearch");
    if (!input) return;
    var q = norm(input.value||"");

    if (q.length < 2){
      active = [];       // hide list if query too short
      renderList();
      return;
    }

    ensureIndex();
    var words = q.split(" "), res = [];
    for (var i=0; i<DATA.length; i++){
      var hay = DATA[i]._norm, ok = true;
      for (var w=0; w<words.length; w++){
        if (hay.indexOf(words[w]) === -1){ ok=false; break; }
      }
      if (ok) res.push(DATA[i]);
    }
    active = res;
    renderList();
  }

  function init(){
    var input = $("genericSearch"), list = $("genericList");
    if (!input || !list || !window.MEDICINE_GENERICS) return false;

    DATA = window.MEDICINE_GENERICS;
    active = [];

    // Hide list initially
    list.style.display = "none";

    // Bind search
    input.oninput = onSearch;
    input.onkeyup = onSearch;

    return true;
  }

  // Boot when DOM + data ready
  (function boot(){
    var tries=0, t=setInterval(function(){
      tries++;
      if (init()) { clearInterval(t); }
      if (tries>400) clearInterval(t); // ~20s safety
    },50);
  })();
})();
