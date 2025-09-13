import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function Events() {
  const { role, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [form, setForm] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, selectedType, selectedLocation, selectedDomain, events]);

  async function loadEvents() {
    const q = query(collection(db, "events"));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setEvents(list);
    setFiltered(list);
  }

  // 🔹 Normalization helper
  const normalize = (val) => (val ? val.toString().toLowerCase().trim() : "");

  function applyFilters() {
    let data = [...events];

    if (search.trim()) {
      const s = normalize(search);
      data = data.filter(
        (e) =>
          normalize(e.title).includes(s) ||
          normalize(e.organizer).includes(s) ||
          normalize(e.type).includes(s) ||
          normalize(e.location).includes(s) ||
          normalize(e.domain).includes(s)
      );
    }

    if (selectedType) {
      const t = normalize(selectedType);
      data = data.filter((e) => normalize(e.type) === t);
    }

    if (selectedLocation) {
      const loc = normalize(selectedLocation);
      data = data.filter((e) => normalize(e.location) === loc);
    }

    if (selectedDomain) {
      const d = normalize(selectedDomain);
      data = data.filter((e) => normalize(e.domain) === d);
    }

    setFiltered(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.date) {
      alert("Title and Date are required!");
      return;
    }

    if (editingId) {
      await updateDoc(doc(db, "events", editingId), form);
    } else {
      const id = form.title.replace(/\s+/g, "-").toLowerCase();
      await setDoc(doc(db, "events", id), form);
    }

    setForm({});
    setEditingId(null);
    setShowModal(false);
    loadEvents();
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this event?")) return;
    await deleteDoc(doc(db, "events", id));
    loadEvents();
  }

  const eventTypes = [...new Set(events.map((e) => normalize(e.type)).filter(Boolean))];
  const locations = [...new Set(events.map((e) => normalize(e.location)).filter(Boolean))];
  const domains = [...new Set(events.map((e) => normalize(e.domain)).filter(Boolean))];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Events</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-64 text-black"
        />

        {/* Type filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="border p-2 rounded text-black"
        >
          <option value="">All Types</option>
          {eventTypes.map((t, i) => (
            <option key={i} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Location filter */}
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="border p-2 rounded text-black"
        >
          <option value="">All Locations</option>
          {locations.map((loc, i) => (
            <option key={i} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        {/* Domain filter */}
        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          className="border p-2 rounded text-black"
        >
          <option value="">All Domains</option>
          {domains.map((d, i) => (
            <option key={i} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Reset button */}
        <button
          onClick={() => {
            setSearch("");
            setSelectedType("");
            setSelectedLocation("");
            setSelectedDomain("");
          }}
          className="bg-gray-300 text-black px-3 py-1 rounded"
        >
          Reset Filters
        </button>

        {role === "admin" && (
          <button
            className="ml-auto bg-blue-600 text-white px-3 py-1 rounded"
            onClick={() => {
              setForm({});
              setEditingId(null);
              setShowModal(true);
            }}
          >
            + Add Event
          </button>
        )}
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((e) => (
          <div key={e.id} className="border rounded p-4 shadow bg-white text-black">
            <h2 className="text-lg font-bold">{e.title}</h2>
            <p>
              <strong>Date:</strong> {e.date}
            </p>
            <p>
              <strong>Type:</strong> {e.type}
            </p>
            <p>
              <strong>Domain:</strong> {e.domain}
            </p>
            <p>
              <strong>Location:</strong> {e.location}
            </p>
            <p>
              <strong>Organizer:</strong> {e.organizer}
            </p>
            {role === "admin" && (
              <div className="mt-2 space-x-2">
                <button
                  className="bg-yellow-500 px-2 py-1 rounded"
                  onClick={() => {
                    setForm(e);
                    setEditingId(e.id);
                    setShowModal(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => handleDelete(e.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4 text-black">
              {editingId ? "Edit Event" : "Add Event"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                type="text"
                placeholder="Title"
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="border p-2 w-full text-black"
                required
              />
              <input
                type="date"
                value={form.date || ""}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="border p-2 w-full text-black"
                required
              />
              <input
                type="text"
                placeholder="Type"
                value={form.type || ""}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="border p-2 w-full text-black"
              />
              <input
                type="text"
                placeholder="Domain"
                value={form.domain || ""}
                onChange={(e) => setForm({ ...form, domain: e.target.value })}
                className="border p-2 w-full text-black"
              />
              <input
                type="text"
                placeholder="Location"
                value={form.location || ""}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="border p-2 w-full text-black"
              />
              <input
                type="text"
                placeholder="Organizer"
                value={form.organizer || ""}
                onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                className="border p-2 w-full text-black"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
