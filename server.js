import express from "express";
import session from "express-session";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "gossipdoll.xoxo1@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "CHANGE_THIS_TO_A_STRONG_PASSWORD";

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET || "CHANGE_THIS_SESSION_SECRET",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: false, maxAge: 1000 * 60 * 60 * 8 }
}));

const dataFile = path.join(__dirname, "data", "blasts.json");
fs.mkdirSync(path.dirname(dataFile), { recursive: true });
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "[]");

function readBlasts() {
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}
function writeBlasts(blasts) {
  fs.writeFileSync(dataFile, JSON.stringify(blasts, null, 2));
}
function requireAdmin(req, res, next) {
  if (req.session?.admin) return next();
  res.status(401).json({ error: "Unauthorized" });
}

app.get("/api/config", (_req, res) => res.json({ tipEmail: ADMIN_EMAIL }));
app.get("/api/blasts", (_req, res) => res.json(readBlasts()));

app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    req.session.admin = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ error: "Invalid login" });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/api/me", (req, res) => res.json({ admin: !!req.session?.admin }));

app.post("/api/blasts", requireAdmin, (req, res) => {
  const { title, body, category } = req.body || {};
  if (!title?.trim() || !body?.trim()) return res.status(400).json({ error: "Title and blast are required." });

  const blasts = readBlasts();
  const blast = {
    id: Date.now().toString(),
    title: title.trim(),
    body: body.trim(),
    category: (category || "Gossip").trim(),
    date: new Date().toISOString()
  };
  blasts.unshift(blast);
  writeBlasts(blasts);
  res.json(blast);
});

app.delete("/api/blasts/:id", requireAdmin, (req, res) => {
  const blasts = readBlasts().filter(b => b.id !== req.params.id);
  writeBlasts(blasts);
  res.json({ ok: true });
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => console.log(`Gossip Doll running on port ${PORT}`));