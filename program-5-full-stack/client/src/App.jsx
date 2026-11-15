import { useEffect, useState } from "react";
import { getDonors, createDonor, updateDonor, deleteDonor } from "./api.js";

const GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const empty = { name: "", age: "", bloodGroup: "", city: "", phone: "" };

export default function App() {
  const [donors, setDonors] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("Loading donors…");
  const [error, setError] = useState("");

  async function load() {
    try { setDonors(await getDonors()); setMessage(""); }
    catch { setMessage("Start the API server to load donors."); }
  }
  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = { ...form, age: Number(form.age) };
    try {
      if (editingId) await updateDonor(editingId, payload); else await createDonor(payload);
      setForm(empty); setEditingId(null); load();
    } catch (err) { setError(err.message); }
  }
  const startEdit = (d) => { setEditingId(d.id); setForm({ name: d.name, age: d.age, bloodGroup: d.bloodGroup, city: d.city, phone: d.phone }); };
  const remove = async (id) => { await deleteDonor(id); load(); };

  return (
    <>
      <header className="topbar"><h1>DonorRegistry</h1><span>Integrated React + Express + Sequelize</span></header>
      <main>
        <form className="card form" onSubmit={onSubmit}>
          <h3>{editingId ? "Edit donor" : "Register a donor"}</h3>
          <div className="row">
            <input name="name" placeholder="Name" value={form.name} onChange={onChange} />
            <input name="age" type="number" placeholder="Age" value={form.age} onChange={onChange} />
            <select name="bloodGroup" value={form.bloodGroup} onChange={onChange}>
              <option value="">Blood group</option>{GROUPS.map((g) => <option key={g}>{g}</option>)}
            </select>
            <input name="city" placeholder="City" value={form.city} onChange={onChange} />
            <input name="phone" placeholder="Phone" value={form.phone} onChange={onChange} />
          </div>
          {error && <p className="error">{error}</p>}
          <button className="pill" type="submit">{editingId ? "Update" : "Add donor"}</button>
          {editingId && <button type="button" className="link" onClick={() => { setEditingId(null); setForm(empty); }}>Cancel</button>}
        </form>
        <h2>Registered donors</h2>
        {message && <p className="status">{message}</p>}
        <div className="grid">
          {donors.map((d) => (
            <article className="donor" key={d.id}>
              <span className="bg">{d.bloodGroup}</span>
              <h4>{d.name}</h4><p>{d.city} • Age {d.age}</p><p>Phone: {d.phone}</p>
              <button onClick={() => startEdit(d)}>Edit</button>
              <button className="del" onClick={() => remove(d.id)}>Delete</button>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
