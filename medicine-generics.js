// medicine-generics.js
(function () {
  var $ = id => document.getElementById(id);
  var norm = s => (s||"").toLowerCase().replace(/[+&,\/()%-]/g," ").replace(/\s+/g," ").trim();

  var DATA = null;
  var INDEXED = false;
  var SHOW_LIMIT = 120;
  var BATCH_SIZE = 40;

  function buildIndex() {
    if (!DATA || INDEXED) return;
    DATA.forEach(it => {
      var labels = (it.dosages||[]).map(d => d.label||"").join(" ");
      it._norm = norm((it.name||"") + " " + labels);
    });
    INDEXED = true;
  }

  function buildRow(item) {
    var wrap = document.createElement("div");
    wrap.className = "generic-item";

    var h2 = document.createElement("h2");
    h2.className = "generic-title";
    h2.textContent = item.name || "";
    wrap.appendChild(h2);

    var ul = document.createElement("ul");
    ul.className = "dosage-list";
    (item.dosages||[]).forEach(d => {
      var li=document.createElement("li");
      var a=document.createElement("a");
      a.href = d.url||"#";
      a.target = "_blank";
      a.textContent = d.label||"";
      li.appendChild(a);
      ul.appendChild(li);
    });
    wrap.appendChild(ul);

    return wrap;
  }

  function renderList(listEl, items) {
    listEl.innerHTML = "";
    if (!items.length) { listEl.innerHTML = "<p>No matches found.</p>"; return; }

    let i = 0;
    function step() {
      var frag = document.createDocumentFragment();
      for (var c=0; c<BATCH_SIZE && i<items.length; c++, i++) {
        frag.appendChild(buildRow(items[i]));
      }
      listEl.appendChild(frag);
      if (i < items.length) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function wireSearch() {
    var input = $("genericSearch");
    var listEl = $("genericList");
    if (!input || !listEl) return false;

    listEl.innerHTML = "<p>Type at least 2 characters to search generics.</p>";

    input.oninput = function () {
      var q = norm(this.value);
      if (q.length < 2) {
        listEl.innerHTML = "<p>Type at least 2 characters to search generics.</p>";
        return;
      }

      buildIndex();

      var words = q.split(" ");
      var results = [];
      for (var i=0; i<DATA.length; i++) {
        var hay = DATA[i]._norm;
        if (words.every(w => hay.includes(w))) {
          results.push(DATA[i]);
          if (results.length >= SHOW_LIMIT) break;
        }
      }

      renderList(listEl, results);

      if (results.length === SHOW_LIMIT) {
        var note = document.createElement("p");
        note.style.marginTop = "8px";
        note.style.fontSize = "12px";
        note.style.color = "#666";
        note.textContent = "Showing first " + SHOW_LIMIT + " results. Refine your search.";
        listEl.appendChild(note);
      }
    };

    return true;
  }

  (function boot() {
    var tries = 0;
    var t = setInterval(function(){
      tries++;
      var ok = $("genericSearch") && $("genericList") && window.MEDICINE_GENERICS;
      if (ok) {
        clearInterval(t);
        DATA = window.MEDICINE_GENERICS;
        wireSearch();
      }
      if (tries > 400) clearInterval(t);
    }, 50);
  })();
})();
