// API helper - base URL comes from an environment variable (Vite: VITE_API_URL)
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3005";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" }, ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const getDonors = () => request("/api/donors");
export const createDonor = (d) => request("/api/donors", { method: "POST", body: JSON.stringify(d) });
export const updateDonor = (id, d) => request(`/api/donors/${id}`, { method: "PUT", body: JSON.stringify(d) });
export const deleteDonor = (id) => request(`/api/donors/${id}`, { method: "DELETE" });
