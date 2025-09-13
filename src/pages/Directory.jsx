// src/pages/Directory.jsx
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  updateDoc,
  query,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function Directory() {
  const { role, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedProfession, setSelectedProfession] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [sortBy, setSortBy] = useState({ field: "name", dir: "asc" });

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    search,
    selectedRole,
    selectedProfession,
    selectedCollege,
    selectedLocation,
    selectedCompany,
    users,
  ]);

  // ---- FETCH + NORMALIZE ----
  async function fetchUsers() {
    setLoading(true);
    try {
      const q = query(collection(db, "users"));
      const snap = await getDocs(q);

      const list = snap.docs.map((d) => {
        const data = d.data() || {};

        // normalize fields
        const rawGrad =
          data.gradYear ??
          data.graduateYear ??
          data.yearToGraduate ??
          data.year_to_graduate ??
          data.graduationYear ??
          data.grad_year ??
          "";

        const rawCollege =
          data.college ?? data.collegeName ?? data.college_name ?? data.institution ?? "";

        const rawProfession =
          data.profession ?? data.job ?? data.occupation ?? data.title ?? "";

        const rawBatch =
          data.batch ?? data.batchYear ?? data.yearBatch ?? data.batch_name ?? "";

        const rawLocation = data.location ?? data.city ?? "";
        const rawCompany = data.company ?? data.organization ?? "";

        return {
          id: d.id,
          ...data,
          gradYear: rawGrad !== null && rawGrad !== undefined ? String(rawGrad) : "",
          college: rawCollege || "",
          profession: rawProfession || "",
          batch: rawBatch || "",
          location: rawLocation || "-",
          company: rawCompany || "-",
        };
      });

      setUsers(list);
      setFiltered(list);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }

  // ---- FILTER / SEARCH ----
  function applyFilters() {
    let data = [...users];

    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(
        (u) =>
          (u.name || "").toLowerCase().includes(s) ||
          (u.email || "").toLowerCase().includes(s) ||
          (u.profession || "").toLowerCase().includes(s) ||
          (u.college || "").toLowerCase().includes(s) ||
          (u.batch || "").toLowerCase().includes(s) ||
          (u.gradYear || "").toLowerCase().includes(s) ||
          (u.location || "").toLowerCase().includes(s) ||
          (u.company || "").toLowerCase().includes(s)
      );
    }

    if (selectedRole) data = data.filter((u) => u.role === selectedRole);
    if (selectedProfession) data = data.filter((u) => u.profession === selectedProfession);
    if (selectedCollege) data = data.filter((u) => u.college === selectedCollege);
    if (selectedLocation) data = data.filter((u) => u.location === selectedLocation);
    if (selectedCompany) data = data.filter((u) => u.company === selectedCompany);

    setFiltered(data);
  }

  function sortUsers(field) {
    const dir = sortBy.field === field && sortBy.dir === "asc" ? "desc" : "asc";
    setSortBy({ field, dir });

    const sorted = [...filtered].sort((a, b) => {
      const va = (a[field] || "").toString().toLowerCase();
      const vb = (b[field] || "").toString().toLowerCase();
      if (va < vb) return dir === "asc" ? -1 : 1;
      if (va > vb) return dir === "asc" ? 1 : -1;
      return 0;
    });
    setFiltered(sorted);
  }

  function handleFormChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSaveUser(e) {
    e.preventDefault();
    setError("");

    if (!user || role !== "admin") {
      setError("Only admins can manage users.");
      return;
    }

    if (!form.name || !form.email || !form.role) {
      setError("Name, Email, and Role are required.");
      return;
    }

    try {
      if (editingUser) {
        await updateDoc(doc(db, "users", editingUser.id), form);
      } else {
        const id = Date.now().toString();
        await setDoc(doc(db, "users", id), {
          ...form,
          createdAt: new Date().toISOString(),
          createdBy: user.uid,
        });
      }

      await fetchUsers();
      setShowModal(false);
      setForm({});
      setEditingUser(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save user.");
    }
  }

  async function handleDeleteUser(id) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  }

  // dropdown lists
  const roles = [...new Set(users.map((u) => u.role).filter(Boolean))];
  const professions = [...new Set(users.map((u) => u.profession).filter(Boolean))];
  const colleges = [...new Set(users.map((u) => u.college).filter(Boolean))];
  const locations = [...new Set(users.map((u) => u.location).filter(Boolean))];
  const companies = [...new Set(users.map((u) => u.company).filter(Boolean))];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Directory</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-64 text-black"
        />

        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="border p-2 rounded text-black">
          <option value="">All Roles</option>
          {roles.map((r, i) => <option key={i} value={r}>{r}</option>)}
        </select>

        <select value={selectedProfession} onChange={(e) => setSelectedProfession(e.target.value)} className="border p-2 rounded text-black">
          <option value="">All Professions</option>
          {professions.map((p, i) => <option key={i} value={p}>{p}</option>)}
        </select>

        <select value={selectedCollege} onChange={(e) => setSelectedCollege(e.target.value)} className="border p-2 rounded text-black">
          <option value="">All Colleges</option>
          {colleges.map((c, i) => <option key={i} value={c}>{c}</option>)}
        </select>

        <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="border p-2 rounded text-black">
          <option value="">All Locations</option>
          {locations.map((l, i) => <option key={i} value={l}>{l}</option>)}
        </select>

        <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} className="border p-2 rounded text-black">
          <option value="">All Companies</option>
          {companies.map((c, i) => <option key={i} value={c}>{c}</option>)}
        </select>

        {/* Sorting buttons */}
        <div className="ml-auto flex gap-2">
          <button className="underline" onClick={() => sortUsers("name")}>Sort by Name</button>
          <button className="underline" onClick={() => sortUsers("college")}>Sort by College</button>
          <button className="underline" onClick={() => sortUsers("profession")}>Sort by Profession</button>
          <button className="underline" onClick={() => sortUsers("location")}>Sort by Location</button>
          <button className="underline" onClick={() => sortUsers("company")}>Sort by Company</button>
        </div>

        {role === "admin" && (
          <button className="ml-auto bg-blue-600 text-white px-3 py-1 rounded" onClick={() => { setEditingUser(null); setForm({}); setShowModal(true); }}>
            + Add Member
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-auto border rounded">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-black">Name</th>
                <th className="p-2 text-black">Email</th>
                <th className="p-2 text-black">Role</th>
                <th className="p-2 text-black">Profession</th>
                <th className="p-2 text-black">College</th>
                <th className="p-2 text-black">Batch</th>
                <th className="p-2 text-black">Grad Year</th>
                <th className="p-2 text-black">Location</th>
                <th className="p-2 text-black">Company</th>
                {role === "admin" && <th className="p-2 text-black">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2">{u.profession || "-"}</td>
                  <td className="p-2">{u.college || "-"}</td>
                  <td className="p-2">{u.batch || "-"}</td>
                  <td className="p-2">{u.gradYear || "-"}</td>
                  <td className="p-2">{u.location || "-"}</td>
                  <td className="p-2">{u.company || "-"}</td>
                  {role === "admin" && (
                    <td className="p-2 flex gap-2">
                      <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => { setEditingUser(u); setForm(u); setShowModal(true); }}>Edit</button>
                      <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded w-96 text-black">
            <h2 className="text-lg font-bold mb-3">{editingUser ? "Edit User" : "Add User"}</h2>

            <input name="name" value={form.name || ""} placeholder="Name" onChange={handleFormChange} className="w-full mb-2 p-2 border" />
            <input name="email" value={form.email || ""} placeholder="Email" onChange={handleFormChange} className="w-full mb-2 p-2 border" />
            <select name="role" value={form.role || ""} onChange={handleFormChange} className="w-full mb-2 p-2 border">
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
              <option value="admin">Admin</option>
            </select>
            <input name="profession" value={form.profession || ""} placeholder="Profession" onChange={handleFormChange} className="w-full mb-2 p-2 border" />
            <input name="college" value={form.college || ""} placeholder="College" onChange={handleFormChange} className="w-full mb-2 p-2 border" />
            <input name="batch" value={form.batch || ""} placeholder="Batch" onChange={handleFormChange} className="w-full mb-2 p-2 border" />
            <input name="gradYear" value={form.gradYear || ""} placeholder="Grad Year" onChange={handleFormChange} className="w-full mb-2 p-2 border" />
            <input name="location" value={form.location || ""} placeholder="Location" onChange={handleFormChange} className="w-full mb-2 p-2 border" />
            <input name="company" value={form.company || ""} placeholder="Company" onChange={handleFormChange} className="w-full mb-2 p-2 border" />

            {error && <p className="text-red-500 mb-2">{error}</p>}

            <div className="flex gap-2">
              <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={handleSaveUser}>Save</button>
              <button className="bg-gray-300 px-3 py-1 rounded" onClick={() => { setShowModal(false); setEditingUser(null); setForm({}); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
