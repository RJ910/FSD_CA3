import { useState } from "react";
import { useNavigate } from "react-router-dom";

const empty = { name: "", age: "", bloodGroup: "", city: "", phone: "" };
const GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function DonorForm({ onAdd }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function validate() {
    const e = {};
    if (form.name.trim().length < 3) e.name = "Name must be at least 3 characters";
    if (!(Number(form.age) >= 18 && Number(form.age) <= 65)) e.age = "Age must be 18-65";
    if (!form.bloodGroup) e.bloodGroup = "Select a blood group";
    if (!form.city.trim()) e.city = "City is required";
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Enter a valid 10-digit mobile number";
    return e;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    onAdd({ ...form, age: Number(form.age), name: form.name.trim(), city: form.city.trim() });
    setForm(empty);
    setSaved(true);
    setTimeout(() => navigate("/donors"), 800);
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2>Register a donor</h2>
      {saved && <p className="success">Donor added! Redirecting…</p>}
      <label>Name<input name="name" value={form.name} onChange={handleChange} />
        {errors.name && <small className="error">{errors.name}</small>}</label>
      <label>Age<input name="age" type="number" value={form.age} onChange={handleChange} />
        {errors.age && <small className="error">{errors.age}</small>}</label>
      <label>Blood group
        <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
          <option value="">Select</option>
          {GROUPS.map((g) => <option key={g}>{g}</option>)}
        </select>
        {errors.bloodGroup && <small className="error">{errors.bloodGroup}</small>}</label>
      <label>City<input name="city" value={form.city} onChange={handleChange} />
        {errors.city && <small className="error">{errors.city}</small>}</label>
      <label>Phone<input name="phone" value={form.phone} onChange={handleChange} />
        {errors.phone && <small className="error">{errors.phone}</small>}</label>
      <button type="submit" className="pill">Add donor</button>
    </form>
  );
}
