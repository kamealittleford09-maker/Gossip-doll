const loginBox = document.querySelector("#loginBox");
const dashboard = document.querySelector("#dashboard");
const loginForm = document.querySelector("#loginForm");
const blastForm = document.querySelector("#blastForm");
const adminList = document.querySelector("#adminList");
const loginMsg = document.querySelector("#loginMsg");
const blastMsg = document.querySelector("#blastMsg");

async function check() {
  const me = await fetch("/api/me").then(r => r.json());
  setView(me.admin);
  if (me.admin) loadAdmin();
}
function setView(loggedIn) {
  loginBox.classList.toggle("hidden", loggedIn);
  dashboard.classList.toggle("hidden", !loggedIn);
}
loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  const r = await fetch("/api/login", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ email: email.value, password: password.value })
  });
  const data = await r.json();
  if (!r.ok) return loginMsg.textContent = data.error || "Login failed.";
  loginMsg.textContent = "";
  setView(true);
  loadAdmin();
});
document.querySelector("#logout").addEventListener("click", async () => {
  await fetch("/api/logout", {method:"POST"});
  setView(false);
});
blastForm.addEventListener("submit", async e => {
  e.preventDefault();
  const r = await fetch("/api/blasts", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ title:title.value, body:body.value, category:category.value || "Gossip" })
  });
  const data = await r.json();
  blastMsg.textContent = r.ok ? "Published! 💋" : (data.error || "Could not publish.");
  if (r.ok) { blastForm.reset(); loadAdmin(); }
});
async function loadAdmin() {
  const blasts = await fetch("/api/blasts").then(r=>r.json());
  document.querySelector("#count").textContent = `${blasts.length} ${blasts.length === 1 ? "blast" : "blasts"}`;
  adminList.innerHTML = blasts.map(b => `
    <div class="admin-item">
      <div><strong>${esc(b.title)}</strong><small>${new Date(b.date).toLocaleString()}</small></div>
      <button data-id="${b.id}" class="delete">Delete</button>
    </div>`).join("");
  document.querySelectorAll(".delete").forEach(btn => btn.onclick = async () => {
    await fetch("/api/blasts/" + btn.dataset.id, {method:"DELETE"});
    loadAdmin();
  });
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
check();