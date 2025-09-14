(function () {
  var $ = id => document.getElementById(id);
  var norm = s => (s||"").toLowerCase().replace(/[+&,\/()%-]/g," ").replace(/\s+/g," ").trim();

  var DATA = window.MEDICINE_GENERICS || [];
  var INDEXED = false;
  var PAGE_SIZE = 50;
  var currentPage = 0;
  var activeResults = [];

  function buildIndex() {
    if (INDEXED) return;
    DATA.forEach(it => {
      const labels = (it.dosages||[]).map(d => d.label||"").join(" ");
      it._norm = norm((it.name||"")+" "+labels);
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
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = d.url || "#";
      a.target = "_blank";
      a.textContent = d.label || "";
      li.appendChild(a);
      ul.appendChild(li);
    });
    wrap.appendChild(ul);

    return wrap;
  }

  function renderNextPage() {
    var listEl = $("genericList");
    var start = currentPage * PAGE_SIZE;
    var end = Math.min(start + PAGE_SIZE, activeResults.length);

    if (start >= activeResults.length) return;

    var frag = document.createDocumentFragment();
    for (var i = start; i < end; i++) {
      frag.appendChild(buildRow(activeResults[i]));
    }
    listEl.appendChild(frag);

    currentPage++;
    updateShowMore();
  }

  function updateShowMore() {
    var btn = $("showMoreBtn");
    if (!btn) return;
    btn.style.display = (currentPage * PAGE_SIZE < activeResults.length) ? "block" : "none";
  }

  function runSearch(query) {
    buildIndex();
    const words = norm(query).split(" ");
    activeResults = DATA.filter(it => words.every(w => it._norm.includes(w)));
    currentPage = 0;
    $("genericList").innerHTML = "";
    if (activeResults.length === 0) {
      $("genericList").innerHTML = "<p>No matches found.</p>";
      $("showMoreBtn").style.display = "none";
      return;
    }
    renderNextPage();
  }

  function init() {
    var input = $("genericSearch");
    var listEl = $("genericList");
    var btn = document.createElement("button");
    btn.id = "showMoreBtn";
    btn.textContent = "Show more";
    btn.style.display = "none";
    btn.style.margin = "16px auto";
    btn.style.padding = "8px 16px";
    btn.style.border = "1px solid #ccc";
    btn.style.borderRadius = "6px";
    btn.style.background = "#fff";
    btn.style.cursor = "pointer";
    btn.onclick = renderNextPage;
    listEl.insertAdjacentElement("afterend", btn);

    // Initial default load (first PAGE_SIZE items)
    activeResults = DATA;
    renderNextPage();

    // Wire up search
    input.addEventListener("input", function () {
      const q = this.value.trim();
      if (q.length < 2) {
        activeResults = DATA;
        currentPage = 0;
        $("genericList").innerHTML = "";
        renderNextPage();
      } else {
        runSearch(q);
      }
    });
  }

  // Wait until DOM is ready
  document.addEventListener("DOMContentLoaded", init);
})();
