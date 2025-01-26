import React, { useState, useEffect, useRef } from "react";
import "../styles/components/SettingsPage.css";
import { auth, db } from "../services/firebase";
import { doc, getDoc, collection, getDocs, updateDoc, addDoc,serverTimestamp, setDoc } from "firebase/firestore";
import {  sendEmailVerification, EmailAuthProvider, EmailAuthCredential, reauthenticateWithCredential } from "firebase/auth";
import { FaCheckCircle, FaSignOutAlt,} from "react-icons/fa";
import {
  Box,
  TextField,
  Typography,
  Avatar,
  Button,
  Paper,
  Grid,
  Divider,
} from "@mui/material";
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
  

  const themes = [
    {
      name: "Warm Gradient",
      variables: {
        "--primary-color": "#ff7e5f",
        "--secondary-color": "#feb47b",
        "--text-color": "#2d2d2d",
        "--background-color": "#fff5f0",
        "--hover-color": "#ff6347",
      },
    },
    {
      name: "Cool Gradient",
      variables: {
        "--primary-color": "#6a11cb",
        "--secondary-color": "#2575fc",
        "--text-color": "#333333",
        "--background-color": "#f5faff",
        "--hover-color": "#1e90ff",
      },
    },
    {
      name: "Neutral Gray",
      variables: {
        "--primary-color": "#a8a8a8",
        "--secondary-color": "#d3d3d3",
        "--text-color": "#333333",
        "--background-color": "#f8f8f8",
        "--hover-color": "#888888",
      },
    },
    {
      name: "Forest Calm",
      variables: {
        "--primary-color": "#3c6e47", // Forest Green
        "--secondary-color": "#9caf88", // Soft Olive
        "--text-color": "#333333",
        "--background-color": "#2a4d34", // Dark Green Background
        "--hover-color": "#66c281", // Light Green Hover
      },
    },
    {
      name: "Ocean Breeze",
      variables: {
        "--primary-color": "#0077be", // Ocean Blue
        "--secondary-color": "#96d1f1", // Sky Blue
        "--text-color": "#333333",
        "--background-color": "#e0f7fa", // Light Cyan
        "--hover-color": "#005f99", // Deep Ocean Hover
      },
    },
    {
      name: "Desert Sand",
      variables: {
        "--primary-color": "#c19a6b", // Sand Brown
        "--secondary-color": "#d2b48c", // Tan
        "--text-color": "#5a4c42", // Earthy Text
        "--background-color": "#f5deb3", // Wheat Background
        "--hover-color": "#8b4513", // Saddle Brown Hover
      },
    },
    {
      name: "Candy Pop",
      variables: {
        "--primary-color": "#ff6ec7", // Candy Pink
        "--secondary-color": "#ffccf9", // Soft Pink
        "--text-color": "#ff6eb4", // White Text
        "--background-color": "#ffe4f3", // Light Pink Background
        "--hover-color": "#ff1493", // Neon Pink Hover
      },
    },
    {
      name: "Monochrome",
      variables: {
        "--primary-color": "#1e1e1e", // Rich black
        "--secondary-color": "#dcdcdc", // Light gray
        "--text-color": "#333333", // Dark gray
        "--background-color": "#f8f8f8", // Off white
        "--hover-color": "#444444", // Charcoal gray
      },
    },
    {
      name: "Deep Blue Night",
      variables: {
        "--primary-color": "#0a192f", // Deep navy blue
        "--secondary-color": "#112240", // Slightly lighter navy
   "--text-color": "#b0bec5", // Soft pale blue for readability
        "--background-color": "#0b1e33", // Very dark blue-gray
        "--hover-color": "#1c3b57", // Muted steel blue for interaction
      },
    },
        
  ];
  
  
  const AppearanceTab = () => {
    // Apply theme and save it to localStorage
    const applyTheme = (variables) => {
      const root = document.documentElement;
      Object.keys(variables).forEach((key) => {
        root.style.setProperty(key, variables[key]);
      });
  
      // Save the theme to localStorage
      localStorage.setItem("selectedTheme", JSON.stringify(variables));
    };
  
    // Load the saved theme on page load
    useEffect(() => {
      const savedTheme = localStorage.getItem("selectedTheme");
      if (savedTheme) {
        const variables = JSON.parse(savedTheme);
        applyTheme(variables);
      }
    }, []);
  
    return (
      <div className="appearance-tab">
        <h2 className="appearance-title">Customize Your Theme</h2>
        <p className="appearance-subtitle">
          Select a theme to personalize the look and feel of your application.
        </p>
        <div className="theme-card-container">
          {themes.map((theme, index) => (
            <div
              key={index}
              className="theme-card"
              onClick={() => applyTheme(theme.variables)}
            >
              <div
                className="theme-preview"
                style={{
                  background: `linear-gradient(135deg, ${theme.variables["--primary-color"]}, ${theme.variables["--secondary-color"]})`,
                }}
              />
              <div className="theme-details">
                <h4 className="theme-name">{theme.name}</h4>
                <button className="apply-button">Apply</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  


  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      // Update the user's profile status to offline in Firestore
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, { profileStatus: "offline" });
      }
  
        const loginTimestamp = new Date();
           await setDoc(doc(collection(db, "activity_logs"), user.uid + "_" + loginTimestamp.getTime()), {
             userId: user.uid,
             email: user.email,
             action: "Logout",
             message: `Logged out from "${window.location.hostname}" on ${loginTimestamp.toISOString()}`,
             timestamp: loginTimestamp,
             ip: window.location.hostname,
           });
      // Sign out the user from Firebase Authentication
      await auth.signOut();
  
      // Redirect to the login page
      navigate("/");
  
      setIsLoggingOut(true);
    } catch (error) {
      console.error("Error logging out: ", error);
      alert(error);
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
          <div style={{width:'100%'}}>
          <div class="profile-settings-input-group">
            <label className="profile-settings-label" for="displayName">Display Name</label>
            <input 
            type="text" 
            id="displayName" 
            placeholder="Enter your display name"
            value={newDisplayname || userData.name}
            className="profile-settings-input" />
          </div>


          <div class="profile-settings-input-group">
            <label className="profile-settings-label" for="username">Username</label>
            <input 
            type="text" 
            id="username" 
            placeholder="Enter your username"
            readOnly
            className="profile-settings-input"
            value={userData.username} />
          </div>

          <div class="profile-settings-input-group">
            <label className="profile-settings-label" for="aboutMe">About Me</label>
            <textarea
            type="text" 
            id="aboutMe" 
            placeholder="Tell us about yourself"
            value={newAboutme || userData.aboutMe}
            className="profile-setting-bio-textarea" />
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
        <img src={userData.avatar|| auth.currentUser?.photoURL||"https://via.placeholder.com/80"} alt="Profile Avatar" />
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
        return <AppearanceTab/>;
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
        <h2 className="settings-content-title">{activeOption}</h2>
        <div className="content-body">{renderContent()}</div>
        <div style={{padding:'40px'}}/>
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
        <div className="logout-modal-overlay">
        <div className="logout-modal-content">
          <div className="logout-modal-header">
            <h3>Logout</h3>
          </div>
          <div className="logout-modal-body">
          <h3>Are you sure you want to logout?</h3>
          </div>
          <div className="logout-modal-footer">
            <button className="logout-cancel-button" onClick={() => setIsLoggingOut(false)}>
              Cancel
            </button>
            <button className="settings-logout-button" onClick={handleLogout}>
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
