// Program 5 - Express + Sequelize (PostgreSQL / SQLite) backend with CORS and environment variables
import "dotenv/config";
import express from "express";
import cors from "cors";
import { sequelize, Donor } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3005;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN.split(","), methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json());
app.use((req, res, next) => { console.log(`${req.method} ${req.originalUrl}`); next(); });

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.get("/api/donors", async (req, res, next) => {
  try {
    const where = {};
    if (req.query.bloodGroup) where.bloodGroup = req.query.bloodGroup;
    res.json(await Donor.findAll({ where, order: [["createdAt", "DESC"]] }));
  } catch (e) { next(e); }
});

app.post("/api/donors", async (req, res, next) => {
  try { res.status(201).json(await Donor.create(req.body)); } catch (e) { next(e); }
});

app.put("/api/donors/:id", async (req, res, next) => {
  try {
    const donor = await Donor.findByPk(req.params.id);
    if (!donor) return res.status(404).json({ error: "Donor not found" });
    res.json(await donor.update(req.body));
  } catch (e) { next(e); }
});

app.delete("/api/donors/:id", async (req, res, next) => {
  try {
    const n = await Donor.destroy({ where: { id: req.params.id } });
    if (!n) return res.status(404).json({ error: "Donor not found" });
    res.json({ message: "Donor deleted" });
  } catch (e) { next(e); }
});

// centralized error handler
app.use((err, req, res, next) => {
  if (err.name?.startsWith("Sequelize") && err.errors)
    return res.status(400).json({ error: err.errors.map((x) => x.message).join("; ") });
  console.error(err);
  res.status(500).json({ error: "database or server error" });
});

sequelize.sync()
  .then(async () => {
    if ((await Donor.count()) === 0)
      await Donor.bulkCreate([
        { name: "Aarav Mehta", age: 28, bloodGroup: "O+", city: "Mumbai", phone: "9820012345" },
        { name: "Priya Nair", age: 34, bloodGroup: "A+", city: "Pune", phone: "9876543210" },
        { name: "Rohan Shah", age: 25, bloodGroup: "B+", city: "Mumbai", phone: "9967012345" },
      ]);
    app.listen(PORT, () => console.log(`Full-stack API: http://localhost:${PORT}`));
  })
  .catch((e) => { console.error("Database connection failed:", e.message); process.exit(1); });
