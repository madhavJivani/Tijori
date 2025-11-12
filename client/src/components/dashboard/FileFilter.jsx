import React from "react";

export default function FileFilter({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
    >
      <option value="all">All Files</option>
      <option value="image">Images</option>
      <option value="video">Videos</option>
      <option value="pdf">PDFs</option>
      <option value="doc">Documents</option>
    </select>
  );
}
