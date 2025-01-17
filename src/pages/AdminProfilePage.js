import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/components/AdminProfilePage.css";

const AdminProfilePage = () => {
  const [activeSidebar, setActiveSidebar] = useState("Profile");
  const navigate = useNavigate();

  const handleSidebarClick = (section) => {
    setActiveSidebar(section);
  };

  return (
    <div className="admin-page">
      {/* Sidebar */}
      <div className="admin-sidebar">
        {[
          "Profile",
          "Users",
          "Communities",
          "Reports",
          "Admin Settings",
        ].map((item) => (
          <div
            key={item}
            className={`sidebar-item ${activeSidebar === item ? "active" : ""}`}
            onClick={() => handleSidebarClick(item)}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="admin-content">
        <div className="admin-page-body">
        {activeSidebar === "Profile" && (
          <div className="profile-section">
            <h1>Admin Profile</h1>
            <p>Manage your profile information here.</p>
          </div>
        )}
        {activeSidebar === "Users" && (
          <div className="users-section">
            <h1>Users</h1>
            <p>View and manage all platform users.</p>
          </div>
        )}
        {activeSidebar === "Communities" && (
          <div className="communities-section">
            <h1>Communities</h1>
            <p>View and manage all communities.</p>
          </div>
        )}
        {activeSidebar === "Reports" && (
          <div className="reports-section">
            <h1>Reports</h1>
            <p>View user reports and take action.</p>
          </div>
        )}
        {activeSidebar === "Admin Settings" && (
          <div className="admin-settings-section">
            <h1>Admin Settings</h1>
            <p>Configure platform settings and preferences.</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
