// Program 4 - Express.js REST API for the Blood Donor Registry
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3004;
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret"; // set a real secret via environment variable
const GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// In-memory data stores
const users = [];
let donors = [
  { id: 1, name: "Aarav Mehta", age: 28, bloodGroup: "O+", city: "Mumbai", phone: "9820012345" },
  { id: 2, name: "Priya Nair", age: 34, bloodGroup: "A+", city: "Pune", phone: "9876543210" },
];
let nextId = 3;

// ---------- Middleware ----------
app.use(express.json());

// 1. Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`));
  next();
});

// 2. Input validation for donor payloads
function validateDonor(req, res, next) {
  const { name, age, bloodGroup, city, phone } = req.body;
  const errors = [];
  if (typeof name !== "string" || name.trim().length < 3) errors.push("name must be at least 3 characters");
  if (!Number.isInteger(age) || age < 18 || age > 65) errors.push("age must be an integer between 18 and 65");
  if (!GROUPS.includes(bloodGroup)) errors.push("bloodGroup must be one of " + GROUPS.join(", "));
  if (typeof city !== "string" || !city.trim()) errors.push("city is required");
  if (!/^[6-9]\d{9}$/.test(phone || "")) errors.push("phone must be a valid 10-digit mobile number");
  if (errors.length) return next(Object.assign(new Error(errors.join("; ")), { status: 400 }));
  next();
}

// 3. JWT authentication middleware (protects routes)
function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(Object.assign(new Error("Authentication token missing"), { status: 401 }));
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    next(Object.assign(new Error("Invalid or expired token"), { status: 401 }));
  }
}

// ---------- Auth routes (bcrypt-hashed passwords) ----------
app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password || password.length < 6)
      throw Object.assign(new Error("username and a password of at least 6 characters are required"), { status: 400 });
    if (users.find((u) => u.username === username))
      throw Object.assign(new Error("username already exists"), { status: 409 });
    users.push({ id: users.length + 1, username, passwordHash: await bcrypt.hash(password, 10) });
    res.status(201).json({ message: "registered" });
  } catch (e) { next(e); }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = users.find((u) => u.username === username);
    if (!user || !(await bcrypt.compare(password || "", user.passwordHash)))
      throw Object.assign(new Error("Invalid credentials"), { status: 401 });
    const token = jwt.sign({ id: user.id, username }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (e) { next(e); }
});

// ---------- CRUD routes ----------
app.get("/api/donors", (req, res) => {                         // READ all (+ optional filters)
  const { bloodGroup, city } = req.query;
  res.json(donors.filter((d) => (!bloodGroup || d.bloodGroup === bloodGroup) &&
                                (!city || d.city.toLowerCase() === city.toLowerCase())));
});

app.get("/api/donors/:id", (req, res, next) => {                // READ one
  const donor = donors.find((d) => d.id === Number(req.params.id));
  if (!donor) return next(Object.assign(new Error("Donor not found"), { status: 404 }));
  res.json(donor);
});

app.post("/api/donors", authenticate, validateDonor, (req, res) => {   // CREATE (protected)
  const { name, age, bloodGroup, city, phone } = req.body;
  const donor = { id: nextId++, name: name.trim(), age, bloodGroup, city: city.trim(), phone };
  donors.push(donor);
  res.status(201).json(donor);
});

app.put("/api/donors/:id", authenticate, validateDonor, (req, res, next) => {  // UPDATE (protected)
  const i = donors.findIndex((d) => d.id === Number(req.params.id));
  if (i === -1) return next(Object.assign(new Error("Donor not found"), { status: 404 }));
  donors[i] = { ...donors[i], ...req.body, id: donors[i].id };
  res.json(donors[i]);
});

app.delete("/api/donors/:id", authenticate, (req, res, next) => {      // DELETE (protected)
  const before = donors.length;
  donors = donors.filter((d) => d.id !== Number(req.params.id));
  if (donors.length === before) return next(Object.assign(new Error("Donor not found"), { status: 404 }));
  res.json({ message: "Donor deleted" });
});

// ---------- 404 + centralized error handler ----------
app.use((req, res, next) => next(Object.assign(new Error("Route not found"), { status: 404 })));
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") err.status = 400, err.message = "Invalid JSON body";
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => console.log(`Express API: http://localhost:${PORT}`));
