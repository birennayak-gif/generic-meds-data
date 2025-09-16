// medicine-generics.js
(function () {
  var $ = function(id){ return document.getElementById(id); };
  var norm = function(s){ return (s||"").toLowerCase().replace(/[+&,\/()%-]/g," ").replace(/\s+/g," ").trim(); };

  var DATA=[], INDEXED=false, active=[], cursor=0;
  var PAGE_SIZE=60, BATCH_SIZE=30; // tune as needed

  function ensureIndex(){
    if (INDEXED) return;
    for (var i=0;i<DATA.length;i++){
      var it=DATA[i], labels="";
      if (it.dosages && it.dosages.length){
        var tmp=[];
        for (var j=0;j<it.dosages.length;j++){
          var d=it.dosages[j]; tmp.push(d.label||d.name||d.dosage||d.text||"");
        }
        labels = tmp.join(" ");
      }
      it._norm = norm((it.name||it.generic||"") + " " + labels);
    }
    INDEXED=true;
  }

  function buildRow(it){
  var wrap = document.createElement("div");
  wrap.className = "generic-item";

  var h2 = document.createElement("h2");
  h2.className = "generic-title";
  h2.textContent = it.name || it.generic || "";
  wrap.appendChild(h2);

  var ul = document.createElement("ul");
  ul.className = "dosage-list";

  if (it.dosages && it.dosages.length){
    for (var k = 0; k < it.dosages.length; k++){
      var d = it.dosages[k];
      var li = document.createElement("li");
      var a = document.createElement("a");

      // Normalize dosage
      var text = "";
      if (typeof d === "string") {
        text = d;
      } else if (typeof d === "object" && d) {
        text = d.label || d.name || d.dosage || d.text || "";
      }

      a.href = (d.url || d.link || "#");
      a.target = "_blank";
      a.textContent = text;
      li.appendChild(a);
      ul.appendChild(li);
    }
  }

  wrap.appendChild(ul);
  return wrap;
}


  function renderNext(){
    var list=$("genericList");
    if (!list) return;
    var end=Math.min(cursor+PAGE_SIZE, active.length);
    if (cursor>=end) return;

    var i=cursor;
    function frame(){
      var frag=document.createDocumentFragment();
      for (var cnt=0; cnt<BATCH_SIZE && i<end; cnt++, i++){
        frag.appendChild(buildRow(active[i]));
      }
      list.appendChild(frag);
      if (i<end){ requestAnimationFrame(frame); }
      else { cursor=end; updateMore(); }
    }
    requestAnimationFrame(frame);
  }

  function updateMore(){
    var btn=$("showMoreBtn");
    if (!btn) return;
    btn.style.display = cursor < active.length ? "block" : "none";
  }

 function resetAndRender(){
  var list = $("genericList");
  if (!list) return;
  list.innerHTML = "";
  cursor = 0;

  // Render everything at once
  var frag = document.createDocumentFragment();
  for (var i = 0; i < active.length; i++){
    frag.appendChild(buildRow(active[i]));
  }
  list.appendChild(frag);
}


  function onSearch(){
    var input=$("genericSearch");
    if (!input) return;
    var q=norm(input.value||"");
    if (q.length<2){
      active=DATA;            // default view when query is short/empty
      resetAndRender();
      return;
    }
    ensureIndex();
    var words=q.split(" "), res=[];
    for (var i=0;i<DATA.length;i++){
      var hay=DATA[i]._norm, ok=true;
      for (var w=0; w<words.length; w++){
        if (hay.indexOf(words[w])===-1){ ok=false; break; }
      }
      if (ok) res.push(DATA[i]);
    }
    active=res;
    resetAndRender();
  }

  function init(){
    var input=$("genericSearch"), list=$("genericList");
    if (!input || !list || !window.MEDICINE_GENERICS) return false;

    DATA = window.MEDICINE_GENERICS;
    active = DATA;

    

    // Initial render (first page only)
    resetAndRender();

    // Search bindings (some CMS block 'input'—bind keyup too)
    input.oninput = onSearch;
    input.onkeyup = onSearch;

    // Optional: auto-load more on scroll near bottom
    window.addEventListener("scroll", function(){
      if (cursor>=active.length) return;
      var nearBottom = window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 200;
      if (nearBottom) renderNext();
    });

    return true;
  }

  // Boot without DOMContentLoaded (poll until DOM + data exist)
  (function boot(){
    var tries=0, t=setInterval(function(){
      tries++;
      if (init()) { clearInterval(t); }
      if (tries>400) clearInterval(t); // ~20s safety
    },50);
  })();
})();
