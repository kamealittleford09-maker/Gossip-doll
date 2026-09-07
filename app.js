const list = document.querySelector("#blastList");
const empty = document.querySelector("#empty");
const search = document.querySelector("#search");
const tipLink = document.querySelector("#tipLink");
let blasts = [];

async function load() {
  const config = await fetch("/api/config").then(r => r.json());
  tipLink.href = `mailto:${encodeURIComponent(config.tipEmail)}?subject=${encodeURIComponent("Gossip Doll Tip")}`;
  blasts = await fetch("/api/blasts").then(r => r.json());
  render();
}
function render() {
  const q = (search.value || "").toLowerCase();
  const shown = blasts.filter(b => `${b.title} ${b.body} ${b.category}`.toLowerCase().includes(q));
  list.innerHTML = shown.map(b => `
    <article class="blast">
      <div class="blast-top"><span>${escapeHtml(b.category)}</span><time>${new Date(b.date).toLocaleString()}</time></div>
      <h3>${escapeHtml(b.title)}</h3>
      <p>${escapeHtml(b.body).replace(/\n/g,"<br>")}</p>
      <div class="signature">XOXO, Gossip Doll 💋</div>
    </article>`).join("");
  empty.style.display = shown.length ? "none" : "block";
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
}
search.addEventListener("input", render);
load();