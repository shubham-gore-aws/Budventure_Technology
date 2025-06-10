import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Sticky() {
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteId, setNoteId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [full_name, Setfull_name] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewNote, setViewNote] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (res.ok) Setfull_name(data.full_name);
    } catch (err) {
      console.error("User fetch failed:", err);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setNotes(data);
      }
    } catch (err) {
      console.error("Note fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchNotes();

    const preventGoBack = () => {
      window.history.pushState(null, "", window.location.href);
    };

    preventGoBack();
    window.addEventListener("popstate", preventGoBack);

    return () => {
      window.removeEventListener("popstate", preventGoBack);
    };
  }, []);

  const saveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) return alert("Fill both fields");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title: noteTitle, content: noteContent }),
      });

      if (res.ok) {
        setNoteTitle("");
        setNoteContent("");
        setShowModal(false);
        fetchNotes();
      } else {
        alert("Failed to save note");
      }
    } catch (err) {
      console.error("Save error:", err);
    }
    setLoading(false);
  };

  const updateNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) return alert("Fill both fields");
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title: noteTitle, content: noteContent }),
      });

      if (res.ok) {
        setNoteTitle("");
        setNoteContent("");
        setNoteId(null);
        setEditMode(false);
        setShowModal(false);
        fetchNotes();
      } else {
        alert("Failed to update note");
      }
    } catch (err) {
      console.error("Update error:", err);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const deleteNote = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/notes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        fetchNotes();
        setViewNote(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const openEditModal = (note) => {
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteId(note.id);
    setEditMode(true);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      {/* Navbar */}
      <nav className="bg-slate-800 text-white p-4 flex justify-between items-center flex-wrap">
        <h1 className="text-xl sm:text-2xl font-bold">Sticky Notes</h1>
        <div className="flex gap-4 mt-2 sm:mt-0 items-center text-sm sm:text-base">
          {full_name && <span>{full_name}</span>}
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm sm:text-base"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Add Note Button */}
      <div className="text-center mt-8 px-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-base sm:text-lg"
          onClick={() => {
            setNoteTitle("");
            setNoteContent("");
            setNoteId(null);
            setEditMode(false);
            setShowModal(true);
          }}
        >
          + Add Note
        </button>
      </div>

      {/* Notes Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-10">
        <h2 className="text-lg sm:text-xl font-semibold text-center mb-6">Your Notes</h2>
        {notes.length === 0 ? (
          <p className="text-center text-gray-500">No notes found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-yellow-200 p-4 rounded shadow hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <h3 className="font-bold text-lg truncate">{note.title}</h3>
                <p className="text-sm line-clamp-4">{note.content}</p>
                <div className="flex justify-between mt-2">
                  <button
                    onClick={() => setViewNote(note)}
                    className="text-blue-700 underline text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => openEditModal(note)}
                    className="text-green-700 underline text-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto px-4 py-10">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">{editMode ? "Edit Note" : "Add Note"}</h2>
            <input
              type="text"
              placeholder="Title"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full mb-3 p-2 border rounded text-sm"
              disabled={loading}
            />
            <textarea
              rows="5"
              placeholder="Content"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full mb-3 p-2 border rounded text-sm"
              disabled={loading}
            />
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded text-sm"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                onClick={editMode ? updateNote : saveNote}
                disabled={loading}
              >
                {editMode ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto px-4 py-10">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 break-words">{viewNote.title}</h2>
            <p className="mb-4 whitespace-pre-wrap break-words">{viewNote.content}</p>
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded text-sm"
                onClick={() => setViewNote(null)}
              >
                Close
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                onClick={() => deleteNote(viewNote.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
