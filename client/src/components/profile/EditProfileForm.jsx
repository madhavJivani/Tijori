import React, { useState } from "react";
import api from "../../api/api";

export default function EditProfileForm({ user, refresh }) {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user.avatar);
  const [saving, setSaving] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", name);
      if (avatar) formData.append("avatar", avatar);

      await api.put("/user/update", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      refresh();
    } catch (err) {
      console.error("Update failed:", err);
    }
    setSaving(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-sm max-w-lg"
    >
      <div className="flex flex-col items-center mb-6">
        <img
          src={preview || "https://via.placeholder.com/120"}
          alt="Avatar"
          className="w-28 h-28 rounded-full object-cover border-2 border-blue-400"
        />
        <label className="mt-3 cursor-pointer text-blue-600 text-sm font-medium hover:underline">
          Change Photo
          <input type="file" className="hidden" onChange={handleImageChange} />
        </label>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1 font-medium">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
