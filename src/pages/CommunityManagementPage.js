import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "../styles/components/CommunityManagementPage.css";

const CommunityManagementPage = () => {
  const { communityId } = useParams(); // Get community ID from URL
  const [communityName, setCommunityName] = useState(""); // State for community name
  const [communityDescription, setCommunityDescription] = useState(""); // State for community description
  const [activeSection, setActiveSection] = useState("General");

  // States for Security Section
  const [visibility, setVisibility] = useState("Public");
  const [visibilityDropdownOpen, setVisibilityDropdownOpen] = useState(false);
  const [entranceCode, setEntranceCode] = useState("");
  
  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const communityRef = doc(db, "communities", communityId);
        const communityDoc = await getDoc(communityRef);

        if (communityDoc.exists()) {
          const data = communityDoc.data();
          setCommunityName(data.communityName || "Unnamed Community");
          setCommunityDescription(data.communityDescription || "");
          setEntranceCode(data.communityEntranceCode||"")
        } else {
          console.warn("Community document not found.");
        }
      } catch (error) {
        console.error("Error fetching community data:", error);
      }
    };

    fetchCommunityData();
  }, [communityId]);

  const handleSaveChanges = async () => {
    try {
      const communityRef = doc(db, "communities", communityId);
      await updateDoc(communityRef, {
        communityName,
        communityDescription,
      });
      alert("Community details updated successfully!");
    } catch (error) {
      console.error("Error updating community details:", error);
      alert("Failed to update community details.");
    }
  };

  const generateEntranceCode = async () => {
    // Generate a random entrance code
    const code = Math.random().toString(36).substr(2, 8);
    setEntranceCode(code); // Update state with generated code
  
    try {
      // Update the Firestore document with the new entrance code
      const communityRef = doc(db, "communities", communityId);
      await updateDoc(communityRef, {
        communityEntranceCode: code, // Store the entrance code in the communityDescription field
      });
      alert("Entrance code generated and saved!");
    } catch (error) {
      console.error("Error updating entrance code in Firestore:", error);
      alert("Failed to save the entrance code.");
    }
  };
  

  const handleDisableCommunity = () => {
    // Logic to disable the community
    alert("Community has been disabled.");
  };

  const handleDeleteCommunity = () => {
    // Logic to delete the community
    alert("Community has been deleted.");
  };
  const sidebarOptions = ["General", "Security", "Notifications"];

  return (
    <div className="community-management-page">
      {/* Sidebar */}
      <aside className="community-management-sidebar">
        <h2>Community Management</h2>
        {sidebarOptions.map((option) => (
          <div
            key={option}
            className={`community-management-sidebar-item ${activeSection === option ? "active" : ""}`}
            onClick={() => setActiveSection(option)}
          >
            {option}
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <main className="community-management-content">
        <h3>{activeSection}</h3>
        {activeSection === "General" && (
          <div className="community-management-general-section">
            <h4>Community Details</h4>

            <div className="community-management-form-group">
              <label htmlFor="community-management-community-name">Community Name:</label>
              <input
                type="text"
                id="community-name"
                value={communityName}
                onChange={(e) => setCommunityName(e.target.value)}
                className="community-management-input"
              />
            </div>

            <div className="community-management-form-group">
              <label htmlFor="community-management-community-description">Community Description:</label>
              <textarea
                id="community-description"
                value={communityDescription}
                onChange={(e) => setCommunityDescription(e.target.value)}
                className="community-management-textarea"
              ></textarea>
            </div>

            <button onClick={handleSaveChanges} className="community-management-save-changes-btn">Save Changes</button>
          </div>
        )}
        {activeSection === "Security" && (
  <div className="community-management-security-section">
    <h4>Security Settings</h4>

    <div className="community-management-form-group">
      <label className="community-management-label" htmlFor="community-id">Community ID:</label>
      <input
        type="text"
        id="community-id"
        value={communityId}
        readOnly
        className="community-management-input"
      />
    </div>

    <div className="community-management--form-group">
      <label className="community-management-label" htmlFor="entrance-code">Entrance Code:</label>
      <input
        type="text"
        id="entrance-code"
        value={entranceCode|| 'No entrance code available'}
        readOnly
        className="community-management-input"
      />
      {entranceCode === "" && (
        <button className="community-management-generate-code-button" onClick={generateEntranceCode}>
          Generate Entrance Code
        </button>
      )}
    </div>

    <div className="community-management-form-group">
      <label className="community-management-label" htmlFor="visibility">Visibility:</label>
      <input
        type="text"
        id="visibility"
        value={visibility || "Public"}
        onClick={() => setVisibilityDropdownOpen(!visibilityDropdownOpen)}
        readOnly
        className="community-management-input"
      />
      {visibilityDropdownOpen && (
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          className="community-management-visibility-select"
        >
          <option className="community-management-select-option" value="Public">Public</option>
          <option className="community-management-select-option" value="Private">Private</option>
        </select>
      )}
    </div>

    <div className="community-management-form-actions">
      <button className="community-management-disable-community-btn" onClick={handleDisableCommunity}>
        Disable Community
      </button>
      <button className="community-management-delete-community-btn" onClick={handleDeleteCommunity}>
        Delete Community
      </button>
    </div>
  </div>
)}

        {activeSection === "Notifications" && <p>Manage notification settings here.</p>}
      </main>
    </div>
  );
};

export default CommunityManagementPage;
