import React from "react";
import dayjs from "dayjs";

export default function ProfileDetails({ user }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <img
          src={user.avatar || "https://via.placeholder.com/120"}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-2 border-blue-400"
        />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-500 mt-2">
            Joined on {dayjs(user.createdAt).format("MMM D, YYYY")}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-gray-700 mb-2">Recent Activity</h3>
        {user.recentActivity?.length ? (
          <ul className="space-y-2">
            {user.recentActivity.map((a, i) => (
              <li
                key={i}
                className="text-sm text-gray-600 border-b pb-2 last:border-0"
              >
                {a}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No recent activity.</p>
        )}
      </div>
    </div>
  );
}
