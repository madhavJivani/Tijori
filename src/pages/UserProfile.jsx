// import React, { useEffect, useState } from "react";
// import Navbar from "../components/Navbar";
// import Loader from "../components/Loader";
// import ProfileDetails from "../components/profile/ProfileDetails";
// import EditProfileForm from "../components/profile/EditProfileForm";
// import ChangePasswordForm from "../components/profile/ChangePasswordForm";
// import Modal from "../components/Modal";
// import api from "../api/api";

// export default function UserProfile() {
//   const [user, setUser] = useState(null);
//   const [activeTab, setActiveTab] = useState("details");
//   const [loading, setLoading] = useState(true);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);

//   const fetchProfile = async () => {
//     setLoading(true);
//     try {
//       const token =
//         localStorage.getItem("token") || sessionStorage.getItem("token");
//       const res = await api.get("/user/profile", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setUser(res.data.user);
//     } catch (err) {
//       console.error("Error loading profile:", err);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const handleDeleteAccount = async () => {
//     try {
//       const token =
//         localStorage.getItem("token") || sessionStorage.getItem("token");
//       await api.delete("/user/delete", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       localStorage.clear();
//       sessionStorage.clear();
//       window.location.href = "/login";
//     } catch (err) {
//       console.error("Error deleting account:", err);
//     }
//   };

//   if (loading) return <Loader />;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
//       <div className="max-w-5xl mx-auto p-6">
//         <h1 className="text-3xl font-bold text-gray-800 mb-6">
//           Account Settings
//         </h1>

//         {/* Tabs */}
//         <div className="flex gap-4 mb-6 border-b">
//           {["details", "edit", "password"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-4 py-2 font-medium transition border-b-2 ${
//                 activeTab === tab
//                   ? "border-blue-600 text-blue-600"
//                   : "border-transparent text-gray-600 hover:text-blue-500"
//               }`}
//             >
//               {tab === "details"
//                 ? "Profile"
//                 : tab === "edit"
//                 ? "Edit Profile"
//                 : "Change Password"}
//             </button>
//           ))}
//         </div>

//         {/* Content */}
//         {activeTab === "details" && <ProfileDetails user={user} />}
//         {activeTab === "edit" && (
//           <EditProfileForm user={user} refresh={fetchProfile} />
//         )}
//         {activeTab === "password" && <ChangePasswordForm />}

//         {/* Danger Zone */}
//         <div className="mt-10 border-t pt-6">
//           <h2 className="text-lg font-semibold text-red-600 mb-2">
//             Danger Zone
//           </h2>
//           <p className="text-gray-600 mb-4">
//             Deleting your account will permanently remove all files and data.
//           </p>
//           <button
//             onClick={() => setShowDeleteModal(true)}
//             className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition"
//           >
//             Delete Account
//           </button>
//         </div>

//         {showDeleteModal && (
//           <Modal
//             title="Delete Account"
//             message="Are you sure you want to permanently delete your account?"
//             onCancel={() => setShowDeleteModal(false)}
//             onConfirm={handleDeleteAccount}
//           />
//         )}
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import ProfileDetails from "../components/profile/ProfileDetails";
import EditProfileForm from "../components/profile/EditProfileForm";
import ChangePasswordForm from "../components/profile/ChangePasswordForm";
import Modal from "../components/Modal";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Simulated user data (mocked)
  const mockUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "User",
    joinedAt: "2024-05-10",
  };

  // Simulate API fetch delay
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 1000);
  }, []);

  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    alert("This is a demo. Account deletion is disabled.");
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Account Settings
        </h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          {["details", "edit", "password"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition border-b-2 ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-blue-500"
              }`}
            >
              {tab === "details"
                ? "Profile"
                : tab === "edit"
                ? "Edit Profile"
                : "Change Password"}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "details" && <ProfileDetails user={user} />}
        {activeTab === "edit" && (
          <EditProfileForm
            user={user}
            refresh={() => alert("Profile updated (frontend only).")}
          />
        )}
        {activeTab === "password" && (
          <ChangePasswordForm
            onChange={() => alert("Password changed (frontend only).")}
          />
        )}

        {/* Danger Zone */}
        <div className="mt-10 border-t pt-6">
          <h2 className="text-lg font-semibold text-red-600 mb-2">
            Danger Zone
          </h2>
          <p className="text-gray-600 mb-4">
            Deleting your account will permanently remove all files and data.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Delete Account
          </button>
        </div>

        {/* Modal */}
        {showDeleteModal && (
          <Modal
            title="Delete Account"
            message="Are you sure you want to permanently delete your account?"
            onCancel={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteAccount}
          />
        )}
      </div>
    </div>
  );
}
