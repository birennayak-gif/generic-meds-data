// medicine-generics.js
(function () {
  // ---- tiny utils ----
  var $ = function (id) { return document.getElementById(id); };
  var norm = function (s) { return (s||"").toLowerCase().replace(/[+&,\/()%-]/g," ").replace(/\s+/g," ").trim(); };

  var DATA = null;        // window.MEDICINE_GENERICS
  var INDEXED = false;    // whether _norm is prepared
  var SHOW_LIMIT = 120;   // max results per search
  var BATCH_SIZE = 40;    // render in chunks to avoid main-thread stalls

  // Build a normalized haystack for each item (title + all dosage labels)
  function buildIndex() {
    if (!DATA || INDEXED) return;
    DATA.forEach(function (it) {
      var labels = (it.dosages||[]).map(function (d) { return d.label||d.name||d.dosage||d.text||""; }).join(" ");
      it._norm = norm((it.name||it.generic||"") + " " + labels);
    });
    INDEXED = true;
  }

  // Render a single result row (title only; dosages lazy-added on click)
  function buildRow(item) {
    var wrap = document.createElement("div");
    wrap.className = "generic-item";

    var h2 = document.createElement("h2");
    h2.className = "generic-title";
    h2.textContent = item.name || item.generic || "";
    wrap.appendChild(h2);

    // toggle button
    var toggle = document.createElement("a");
    toggle.href = "javascript:void(0)";
    toggle.setAttribute("aria-expanded", "false");
    toggle.style.display = "inline-block";
    toggle.style.margin = "0 0 10px 12px";
    toggle.style.fontSize = "13px";
    toggle.style.color = "#1e7b74";
    toggle.textContent = "Show dosages";
    wrap.appendChild(toggle);

    // container for dosages (created on first toggle)
    var ul = null;
    var open = false;

    toggle.onclick = function () {
      open = !open;
      if (!ul) {
        ul = document.createElement("ul");
        ul.className = "dosage-list";
        (item.dosages||[]).forEach(function(d){
          var li=document.createElement("li");
          var a=document.createElement("a");
          a.href = d.url||d.link||"#";
          a.target = "_blank";
          a.textContent = d.label||d.name||d.dosage||d.text||"";
          li.appendChild(a);
          ul.appendChild(li);
        });
        wrap.appendChild(ul);
      }
      ul.style.display = open ? "" : "none";
      toggle.textContent = open ? "Hide dosages" : "Show dosages";
      toggle.setAttribute("aria-expanded", String(open));
    };

    return wrap;
  }

  // Batched render for smoothness
  function renderList(listEl, items) {
    listEl.innerHTML = "";
    if (!items.length) { listEl.innerHTML = "<p>No matches found.</p>"; return; }

    var i = 0;
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

  // Handle search input; filter against prebuilt index; cap results
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

      buildIndex(); // ensure index exists

      var words = q.split(" ");
      var results = [];
      for (var i=0; i<DATA.length; i++) {
        var hay = DATA[i]._norm;
        var ok = true;
        for (var w=0; w<words.length; w++) {
          if (hay.indexOf(words[w]) === -1) { ok = false; break; }
        }
        if (ok) {
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
        note.textContent = "Showing first " + SHOW_LIMIT + " results. Refine your search to narrow.";
        listEl.appendChild(note);
      }
    };

    return true;
  }

  // Init when both DOM nodes and DATA exist (no DOMContentLoaded reliance)
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
      if (tries > 400) clearInterval(t); // ~20s safety
    }, 50);
  })();
})();
