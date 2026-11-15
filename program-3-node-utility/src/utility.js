// Utility module: file-based storage for blood donors using fs, path, streams and EventEmitter
const fs = require("fs");
const path = require("path");
const { EventEmitter } = require("events");

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "donors.json");
const LOG_FILE = path.join(DATA_DIR, "notifications.log");

const updates = new EventEmitter(); // emits donorCreated / donorUpdated / donorDeleted

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");

// Append every notification to a log file through a writable STREAM
const logStream = fs.createWriteStream(LOG_FILE, { flags: "a" });
["donorCreated", "donorUpdated", "donorDeleted"].forEach((evt) =>
  updates.on(evt, (d) => {
    const line = `${new Date().toISOString()} ${evt} id=${d.id} name=${d.name}`;
    console.log("Notification:", line);
    logStream.write(line + "\n");
  })
);

// Read records using a readable STREAM (efficient for large files)
function readDonors() {
  return new Promise((resolve, reject) => {
    let raw = "";
    fs.createReadStream(DATA_FILE, { encoding: "utf8" })
      .on("data", (chunk) => (raw += chunk))
      .on("end", () => {
        try { resolve(JSON.parse(raw || "[]")); } catch (e) { reject(e); }
      })
      .on("error", reject);
  });
}

const writeDonors = (list) => fs.promises.writeFile(DATA_FILE, JSON.stringify(list, null, 2));

const VALID_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
function validate(d) {
  if (!d || typeof d.name !== "string" || d.name.trim().length < 3) throw new Error("name must be at least 3 characters");
  if (!Number.isInteger(d.age) || d.age < 18 || d.age > 65) throw new Error("age must be an integer between 18 and 65");
  if (!VALID_GROUPS.includes(d.bloodGroup)) throw new Error("bloodGroup must be one of " + VALID_GROUPS.join(", "));
  if (typeof d.city !== "string" || !d.city.trim()) throw new Error("city is required");
}

async function createDonor(input) {
  validate(input);
  const list = await readDonors();
  const donor = { id: list.reduce((m, x) => Math.max(m, x.id), 0) + 1, name: input.name.trim(),
                  age: input.age, bloodGroup: input.bloodGroup, city: input.city.trim() };
  list.push(donor);
  await writeDonors(list);
  updates.emit("donorCreated", donor);
  return donor;
}

async function updateDonor(id, input) {
  const list = await readDonors();
  const i = list.findIndex((d) => d.id === id);
  if (i === -1) return null;
  const merged = { ...list[i], ...input, id };
  validate(merged);
  list[i] = merged;
  await writeDonors(list);
  updates.emit("donorUpdated", merged);
  return merged;
}

async function deleteDonor(id) {
  const list = await readDonors();
  const donor = list.find((d) => d.id === id);
  if (!donor) return false;
  await writeDonors(list.filter((d) => d.id !== id));
  updates.emit("donorDeleted", donor);
  return true;
}

module.exports = { readDonors, createDonor, updateDonor, deleteDonor, updates };
