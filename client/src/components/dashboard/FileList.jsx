import React from "react";
import FileCard from "./FileCard";

export default function FileList({ files, refresh }) {
  if (files.length === 0)
    return (
      <p className="text-center text-gray-500 py-8">No files uploaded yet.</p>
    );

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
      {files.map((file) => (
        <FileCard key={file._id} file={file} refresh={refresh} />
      ))}
    </div>
  );
}
