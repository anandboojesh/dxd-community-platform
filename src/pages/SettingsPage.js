import React, { useState, useEffect, useRef } from "react";
import "../styles/components/SettingsPage.css";
import { auth, db } from "../services/firebase";
import { doc, getDoc, collection, getDocs, updateDoc, } from "firebase/firestore";
import {  sendEmailVerification, EmailAuthProvider, EmailAuthCredential, reauthenticateWithCredential } from "firebase/auth";
import { FaCheckCircle, FaSignOutAlt,} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const SettingsPage = () => {
  const [activeOption, setActiveOption] = useState("Profile Settings");
  const [userData, setUserData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isChangingUsername, setIsChangingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newDisplayname, setNewDisplayname] = useState("");
  const [newAboutme, setNewAboutme] = useState("");


  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login"); 
      setIsLoggingOut(true);
    } catch (error) {
      console.error("Error logging out: ", error);
      alert("An error occurred during logout. Please try again.");
    }
  };

  const handleSendVerification = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await sendEmailVerification(user);  // Send email verification using the modular approach
        alert('Verification email sent!');
        setIsModalOpen(false); // Close the modal after sending the email
      } catch (error) {
        console.error("Error sending verification code: ", error);
        alert('Failed to send verification email. Please try again.');
      }
    } else {
      alert('No user is signed in!');
    }
  };

  const settingsOptions = {
    General: ["Profile Settings", "Security", "Devices"],
    "App Settings": ["Appearance", "Notifications", "Language"],
    "Logout" :["Logout"],
  };

  const handleSaveUsername = async () => {
    if (!newUsername || !currentPassword) {
      alert("Please enter both the new username and current password.");
      return;
    }
  
    const user = auth.currentUser;
    if (!user) {
      alert("No user is currently signed in.");
      return;
    }
  
    try {
      // Create credentials for reauthentication
      const credentials = EmailAuthProvider.credential(user.email, currentPassword);
  
      // Reauthenticate the user
      await reauthenticateWithCredential(user, credentials);
  
      // Update username in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { username: newUsername });
  
      setUserData((prevData) => ({
        ...prevData,
        username: newUsername,
      }));
  
      setIsChangingUsername(false); // Close the modal
      alert("Username updated successfully.");
    } catch (error) {
      console.error("Error updating username: ", error);
      alert("Failed to update username. Please check your password and try again.");
    }
  };

   // Fetch user data from Firestore
   useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);  // Get current user from auth
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data());  // Set user data from Firestore
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    if (auth.currentUser) {
      fetchUserData();  // Fetch user data when the component mounts
    }
  }, []);

  const renderContent = () => {
    if (!userData) {
      return <p>Loading user data...</p>; 
    }


    switch (activeOption) {
      case "Profile Settings":
        return (
          <div class="profile-settings-container">
          <div>
          <div class="input-group">
            <label for="displayName">Display Name</label>
            <input 
            type="text" 
            id="displayName" 
            placeholder="Enter your display name"
            value={newDisplayname || userData.name} />
          </div>


          <div class="input-group">
            <label for="username">Username</label>
            <input 
            type="text" 
            id="username" 
            placeholder="Enter your username"
            readOnly
            
            value={userData.username} />
          </div>

          <div class="input-group">
            <label for="aboutMe">About Me</label>
            <textarea
            type="text" 
            id="aboutMe" 
            placeholder="Tell us about yourself"
            value={newAboutme || userData.aboutMe}
            className="bio-textarea" />
          </div>
          </div>

          <div>
          <div class="profile-preview">
    <div class="preview-header">
      <h3>PREVIEW</h3>
    </div>
    <div class="preview-content">
    <div className="preview-banner">
              <img
                src="https://via.placeholder.com/800x200"
                alt="Profile Banner"
                className="banner-image"
              />
            </div>
      <div class="preview-info">
      <div class="preview-avatar-container">
        <img src="https://via.placeholder.com/80" alt="Profile Avatar" />
      </div>
      <div>
        <h3 class="preview-display-name">{userData.name||"Loading..."}</h3>
        <p class="preview-username">@{userData.username||"loading..."}</p>
        </div>
      </div>
      <div class="preview-aboutme">
      <h3 class="about-me-title">About Me</h3>
      <p class="about-me">{userData.aboutMe || "You haven't added any information about yourself yet."}</p>
      </div>

    </div>
  </div>
        </div>

        </div>
        )
      case "Security":
        return (
          <div className="security-tab">
            {/* Profile Info Container */}
            <div className="profile-info-container">
              <div className="info-item">
                <div style={{display:'flex', flexDirection:'column'}}>
                <span className="info-title">Display Name:</span>
                <span>{userData.name || "N/A"}</span>
                </div>
                <button className="edit-button" onClick={() => {
                  setActiveOption("Profile Settings");
                }}>Edit</button>
              </div>
              <div className="info-item">
              <div style={{display:'flex', flexDirection:'column'}}>
                <span className="info-title">Username:</span>
                <span>@{userData.username || "N/A"}</span>
                </div>
                <button className="edit-button" onClick={() => {
                  setNewUsername(userData.username || "");
                  setIsChangingUsername(true)}}>Edit</button>
              </div>
              <div className="info-item">
              <div style={{display:'flex', flexDirection:'column'}}>
                <span className="info-title">Email Address:</span>
                <span>{userData.email|| "N/A"}</span>
                </div>
                {auth.currentUser?.emailVerified ? (
                <div className="verified-status">
                  <FaCheckCircle style={{ color: "green", marginRight: "5px" }} />
                  <span>Verified</span>
                </div>
              ) : (
                <button className="verify-button" onClick={() => setIsModalOpen(true)}>
                  Verify
                </button>
              )}
              </div>
              <div className="info-item">
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span className="info-title">Phone Number:</span>
                <span>{userData.phone || "You haven't added a phone number yet."}</span>
              </div>
              {userData.phone ? (
                <button className="change-button">Change Number</button>
              ) : (
                <button className="change-button">Add Number</button>
              )}
            </div>
            </div>

            {/* Password Authentication Container */}
            <div className="password-auth-container">
              <h3 className="container-title">Password</h3>
              <button className="change-password-button">Change Password</button>
            </div>

            {/* Account Removal Container */}
            <div className="account-removal-container">
              <h3 className="container-title">Account Removal</h3>
              <div style={{display:'flex',}}>
              <button className="disable-account-button">Disable Account</button>
              <button className="delete-account-button">Delete Account</button>
              </div>
            </div>
          </div>
        );
      case "Devices":
        return <p>View and manage your connected devices.</p>;
      case "Appearance":
        return <p>Customize the app's theme and layout.</p>;
      case "Notifications":
        return <p>Adjust notification preferences.</p>;
      case "Language":
        return <p>Change the app's language settings.</p>;
      case "Logout":
        return (
          <div>
            <p>Are you sure you want to log out?</p>
            <button onClick={() => alert("Logging out...")}>Log Out</button>
          </div>
        );
      default:
        return <p>Select a setting to view details.</p>;
    }
  };

  return (
    <div className="settings-page">
      {/* Sidebar */}
      <div className="settings-sidebar">
        {Object.keys(settingsOptions).map((category) => (
          <div key={category} className="settings-category">
            <h3 className="category-title">{category}</h3>
            <ul className="options-list">
              {settingsOptions[category].map((option) => (
                <li
                  key={option}
                  className={`option-item ${
                    activeOption === option ? "selected" : ""
                  }`}
                  onClick={() => {
                    if (option === "Logout") {
                      setIsLoggingOut(true); // Open logout confirmation modal
                    } else {
                      setActiveOption(option);
                    }
                  }}
                >
                   {option === "Logout" ? (
        <>
        <div style={{display:'flex',alignItems:'center'}}>
          {option}
          <FaSignOutAlt style={{ marginRight: '10px', margin:'10px' }} />
          </div>
          
        </>
      ) : (
        option
      )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="settings-content">
        <h2>{activeOption}</h2>
        <div className="content-body">{renderContent()}</div>
      </div>

      {isModalOpen &&(
         <div className="modal-overlay">
         <div className="modal-content">
           <div className="modal-header">
             <h3>Verify Email Address</h3>
             <button className="close-button" onClick={() => setIsModalOpen(false)}>×</button>
           </div>
           <div className="modal-body">
             <p>We'll need to verify your email address {userData.email}.</p>
           </div>
           <div className="modal-footer">
             <button className="cancel-button" onClick={() => setIsModalOpen(false)}>Cancel</button>
             <button className="send-verification-button" onClick={handleSendVerification}>Send Verification Code</button>
           </div>
         </div>
       </div>
      )}

      {isLoggingOut && (
        <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Logout</h3>
          </div>
          <div className="modal-body">
          <h3>Are you sure you want to logout?</h3>
          </div>
          <div className="modal-footer">
            <button className="cancel-button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
      )}

      {isChangingUsername && (
         <div className="modal-overlay">
         <div className="modal-content">
           <div className="modal-header">
             <h3>Change your username</h3>
             <button className="close-button" onClick={() => setIsChangingUsername(false)}>×</button>
           </div>
           <div className="modal-body">
          <div style={{display:'flex', flexDirection:'column',textAlign:'left', marginBottom:'10px'}}>
            <label>Username:</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter new username"
            />
          </div>
          <div style={{display:'flex', flexDirection:'column',textAlign:'left'}}>
            <label>Current password:</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
            />
          </div>
        </div>

           <div className="modal-footer">
             <button className="cancel-button" onClick={() => setIsChangingUsername(false)}>Cancel</button>
             <button className="done-button" onClick={handleSaveUsername}>Done</button>
           </div>
         </div>
       </div>
      )}
    </div>
  );
};

export default SettingsPage;
