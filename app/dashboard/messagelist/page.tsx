"use client";

import { useState, useEffect } from "react";
import { getCookie } from "@/utils/cookie";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Mail, User, Clock } from "lucide-react";

export default function MessagesGrid() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = getCookie("token");
      const res = await fetch("/api/messages/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMessages(data.data);
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this message?")) return;
    try {
      const token = getCookie("token");
      const res = await fetch(`/api/messages/all/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success)
        setMessages((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Filtering + Pagination
  const filteredMessages = messages.filter(
    (m) =>
      m.sender.toLowerCase().includes(search.toLowerCase()) ||
      m.receiver.toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📩 Incoming Messages</h2>

      {/* 🔍 Search Bar */}
      <input
        type="text"
        placeholder="🔍 Search sender, receiver or text..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        className="mb-4 p-2 border rounded w-full max-w-md dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
      />

      {loading ? (
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      ) : (
        <>
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedMessages.map((msg) => (
              <div
                key={msg._id}
                className="p-4 border rounded-xl shadow-md bg-white hover:shadow-lg transition dark:bg-gray-900 dark:border-gray-700"
              >
                {/* Header Row */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <User className="text-blue-500" size={18} />
                    <span className="font-semibold dark:text-gray-100">
                      {msg.sender}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                    {msg.port || "N/A"}
                  </span>
                </div>

                {/* Receiver */}
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <Mail size={16} className="text-green-500" />
                  <span>{msg.receiver}</span>
                </div>

                {/* Message Body */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                  {msg.message}
                </p>

                {/* Footer */}
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>
                      {msg.createdAt
                        ? formatDistanceToNow(new Date(msg.createdAt), {
                            addSuffix: true,
                          })
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600 dark:text-gray-200"
            >
              Prev
            </button>
            <span className="text-sm dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600 dark:text-gray-200"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
