document.addEventListener("DOMContentLoaded", function() {
  const input = document.getElementById("genericSearch");
  const container = document.getElementById("genericList");

  fetch("https://birennayak-gif.github.io/generic-meds-data/medicine-generics.json")
    .then(res => res.json())
    .then(data => {
      let html = "";
      data.forEach(item => {
        html += `<div class="generic-item"><h2 class="generic-title">${item.generic}</h2><ul class="dosage-list">`;
        item.dosages.forEach(d => {
          html += `<li><a href="${d.url}" target="_blank">${d.name}</a></li>`;
        });
        html += "</ul></div>";
      });
      container.innerHTML = html;
    })
    .catch(() => {
      container.innerHTML = "<p>Couldn't load medicines. Please try again.</p>";
    });

  function normalize(str) {
    return str.toLowerCase().replace(/[+&,\/()-]/g, " ").replace(/\s+/g, " ").trim();
  }

  input.addEventListener("input", function() {
    const q = normalize(input.value);
    const words = q ? q.split(" ") : [];
    document.querySelectorAll(".generic-item").forEach(item => {
      const text = normalize(item.textContent);
      const match = words.every(w => text.includes(w));
      item.style.display = match || !q ? "" : "none";
    });
  });
});
