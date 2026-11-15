import { useEffect, useMemo, useState } from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import DonorForm from "./components/DonorForm.jsx";
import DonorList from "./components/DonorList.jsx";

// Sample records used as the initial data
const initialDonors = [
  { id: 1, name: "Aarav Mehta", age: 28, bloodGroup: "O+", city: "Mumbai", phone: "9820012345" },
  { id: 2, name: "Priya Nair", age: 34, bloodGroup: "A+", city: "Pune", phone: "9876543210" },
  { id: 3, name: "Rohan Shah", age: 25, bloodGroup: "B+", city: "Mumbai", phone: "9967012345" },
  { id: 4, name: "Sneha Kulkarni", age: 41, bloodGroup: "AB-", city: "Nashik", phone: "9922334455" },
  { id: 5, name: "Imran Qureshi", age: 30, bloodGroup: "O-", city: "Thane", phone: "9011223344" },
];

export default function App() {
  // ---- state ----
  const [donors, setDonors] = useState([]);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [loading, setLoading] = useState(true);

  // ---- useEffect: simulate loading data on first render ----
  useEffect(() => {
    const timer = setTimeout(() => {
      setDonors(initialDonors);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer); // cleanup
  }, []);

  // ---- useEffect: keep document title in sync with state ----
  useEffect(() => {
    document.title = `Blood Donor Registry (${donors.length})`;
  }, [donors]);

  const groups = useMemo(() => ["all", ...new Set(donors.map((d) => d.bloodGroup))], [donors]);

  const visible = donors.filter(
    (d) =>
      (group === "all" || d.bloodGroup === group) &&
      (d.name + " " + d.city).toLowerCase().includes(query.toLowerCase())
  );

  const addDonor = (donor) => setDonors((prev) => [{ id: Date.now(), ...donor }, ...prev]);
  const removeDonor = (id) => setDonors((prev) => prev.filter((d) => d.id !== id));

  return (
    <>
      <header className="topbar">
        <h1>
          Donor<span>Registry</span> <em>React</em>
        </h1>
        <nav>
          <NavLink to="/donors">Donors ({donors.length})</NavLink>
          <NavLink to="/register">Register</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/donors" replace />} />
          <Route
            path="/donors"
            element={
              loading ? (
                <p className="status">Loading donors…</p> // conditional rendering
              ) : (
                <DonorList
                  donors={visible}
                  groups={groups}
                  query={query}
                  onQuery={setQuery}
                  group={group}
                  onGroup={setGroup}
                  onRemove={removeDonor}
                />
              )
            }
          />
          <Route path="/register" element={<DonorForm onAdd={addDonor} />} />
          <Route path="*" element={<p className="status">Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}
