// Program 1 - Blood Donor Registry (HTML + CSS + JavaScript)
// Demonstrates: DOM manipulation, event handling, Fetch API + async/await,
// HTTP methods (GET / POST / DELETE) with JSON, search, filter and validation.

const API_URL = "donors.json"; // sample data retrieved with Fetch (GET)
let donors = [];

const $ = (id) => document.getElementById(id);
const list = $("list"), statusEl = $("status"), formError = $("formError");

// ---------- Fetch API + async/await ----------
async function loadDonors() {
  statusEl.textContent = "Loading donors...";
  try {
    const res = await fetch(API_URL, { method: "GET", headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    donors = await res.json();
    logHttp("GET", API_URL, null, res.status, donors);
    statusEl.textContent = "";
    buildFilter();
    render();
  } catch (err) {
    statusEl.textContent = "Could not load donors: " + err.message;
  }
}

// Simulated POST / DELETE (a static page has no backend) - request and response are JSON
async function postDonor(donor) {
  const body = JSON.stringify(donor);
  await new Promise((r) => setTimeout(r, 150));
  const created = { id: Date.now(), ...donor };
  logHttp("POST", "/api/donors", donor, 201, created);
  return created;
}
async function deleteDonor(id) {
  await new Promise((r) => setTimeout(r, 100));
  logHttp("DELETE", `/api/donors/${id}`, null, 200, { deleted: id });
}

function logHttp(method, url, reqBody, status, resBody) {
  $("httpLog").textContent =
    `${method} ${url}\n` +
    (reqBody ? `Request JSON:\n${JSON.stringify(reqBody, null, 2)}\n` : "") +
    `Status: ${status} ${status === 201 ? "Created" : "OK"}\n` +
    `Response JSON:\n${JSON.stringify(resBody, null, 2).slice(0, 400)}${JSON.stringify(resBody).length > 400 ? "\n..." : ""}`;
}

// ---------- Rendering (DOM manipulation) ----------
function buildFilter() {
  const groups = [...new Set(donors.map((d) => d.bloodGroup))].sort();
  const sel = $("filter");
  sel.innerHTML = '<option value="all">All blood groups</option>';
  groups.forEach((g) => sel.add(new Option(g, g)));
}

function render() {
  const q = $("search").value.trim().toLowerCase();
  const g = $("filter").value;
  const visible = donors.filter(
    (d) => (g === "all" || d.bloodGroup === g) &&
           (d.name.toLowerCase().includes(q) || d.city.toLowerCase().includes(q))
  );
  list.innerHTML = "";
  visible.forEach((d) => {
    const card = document.createElement("article");
    card.className = "donor";
    card.innerHTML = `<span class="bg">${d.bloodGroup}</span><h4></h4><p></p><p></p>`;
    card.querySelector("h4").textContent = d.name;           // textContent prevents XSS
    card.querySelectorAll("p")[0].textContent = `${d.city} • Age ${d.age}`;
    card.querySelectorAll("p")[1].textContent = `Phone: ${d.phone}`;
    const btn = document.createElement("button");
    btn.textContent = "Remove";
    btn.addEventListener("click", async () => {
      await deleteDonor(d.id);
      donors = donors.filter((x) => x.id !== d.id);
      buildFilter(); render();
    });
    card.appendChild(btn);
    list.appendChild(card);
  });
  statusEl.textContent = visible.length ? `${visible.length} donor(s) found` : "No donors match your search.";
  $("statsBtn").textContent = `Donors (${donors.length})`;
}

// ---------- Validation ----------
function validate(d) {
  const errors = {};
  if (d.name.length < 3) errors.name = "Name must be at least 3 characters.";
  if (!(d.age >= 18 && d.age <= 65)) errors.age = "Age must be between 18 and 65.";
  if (!d.bloodGroup) errors.bloodGroup = "Select a blood group.";
  if (!d.city) errors.city = "City is required.";
  if (!/^[6-9]\d{9}$/.test(d.phone)) errors.phone = "Enter a valid 10-digit Indian mobile number.";
  return errors;
}

// ---------- Event handling ----------
$("donorForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const donor = {
    name: $("name").value.trim(),
    age: Number($("age").value),
    bloodGroup: $("bloodGroup").value,
    city: $("city").value.trim(),
    phone: $("phone").value.trim(),
  };
  ["name", "age", "bloodGroup", "city", "phone"].forEach((f) => $(f).classList.remove("invalid"));
  const errors = validate(donor);
  const keys = Object.keys(errors);
  if (keys.length) {
    keys.forEach((k) => $(k).classList.add("invalid"));
    formError.textContent = errors[keys[0]];
    return;
  }
  formError.textContent = "";
  const created = await postDonor(donor);
  donors.unshift(created);
  e.target.reset();
  buildFilter(); render();
});
$("search").addEventListener("input", render);
$("filter").addEventListener("change", render);

loadDonors();
