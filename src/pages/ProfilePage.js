import React, { useEffect, useState } from "react";
import "../styles/components/ProfilePage.css";
import { auth, db } from "../services/firebase";
import { doc, getDoc, collection, getDocs, updateDoc, addDoc, serverTimestamp, setDoc, where, query, orderBy } from "firebase/firestore";
import { FaChevronDown, FaChevronUp, FaTimes, FaUpload, FaUserAlt } from "react-icons/fa";
import { AiOutlineArrowRight } from 'react-icons/ai';
import { useNavigate } from "react-router-dom";
import { gapi } from "gapi-script";
const avatars = [
  require("./assets/avatar1.png"),
  require("./assets/avatar2.png"),
  require("./assets/avatar3.png"),
  require("./assets/avatar4.png"),
  require("./assets/avatar5.png"),
  require("./assets/avatar6.png"),
  require("./assets/avatar7.png"),
  require("./assets/avatar8.png"),
  require("./assets/avatar9.png"),
  require("./assets/avatar10.png"),
  require("./assets/avatar11.png"),
  require("./assets/avatar12.png"),
  require("./assets/avatar13.png"),
  require("./assets/avatar14.png"),
  require("./assets/avatar15.png"),
  require("./assets/avatar16.png"),
  require("./assets/avatar17.png"),
  require("./assets/avatar18.png"),
  require("./assets/avatar19.png"),
  require("./assets/avatar20.png"),
];



const uploadPhoto = require('./assets/upload_photo.jpg')

const LoadingSpinner = () => (
  <div className="spinner-container">
    <div className="spinner"></div>
  </div>
);

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    displayName: "Loading...",
    username: "Loading...",
    aboutMe: "",
    signUpDate:"",
  });

  const [activeSidebar, setActiveSidebar] = useState("Profile");
  const [userCommunities, setUserCommunities] = useState([]);
  const [showCommunityOptions, setShowCommunityOptions] = useState(false);
  const [isOnline, setIsOnline] = useState(false); // New state to track online status
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState(userData.aboutMe || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAvatarGridVisible, setIsAvatarGridVisible] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  const [communityName, setCommunityName] = useState("");
  const [communityProfilePic, setCommunityProfilePic] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('login');  // Default active tab
  const [loading, setLoading] = useState(true);
  const [entranceCode, setEntranceCode] = useState("");
  const [communityProfilePhoto, setCommunityProfilePhoto] = useState("");

  
  const initGoogleDrive = () => {
    gapi.load("client:auth2", async () => {
      try {
        await gapi.client.init({
          apiKey: "AIzaSyCAu251nw4im3YJZLyJUgJmZAF7jTICSh0",
          clientId: "960353326099-8cjg184n3dpruud1r3ju66h2p3au7qat.apps.googleusercontent.com",
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
          scope: "https://www.googleapis.com/auth/drive.file",
        });
        console.log("Google API initialized successfully.");
      } catch (error) {
        console.error("Error initializing Google API:", error);
      }
    });
  };
  
  
  useEffect(() => {
    initGoogleDrive();
  }, []);
  

  const imageUrl = 'https://drive.google.com/uc?export=view&id=1IbGgbFTEPc-g3Ac7cOZ65DOcHRWA5FO4';
  
  const uploadFileToGoogleDrive = async (file) => {
    const FOLDER_ID = "1gp8Cde1IGuRL-UUGS1GScYObLLO8qHkw";
  
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }
  
      const token = authInstance.currentUser.get().getAuthResponse().access_token;
  
      const metadata = {
        name: file.name,
        mimeType: file.type,
        parents: [FOLDER_ID],
      };
  
      const formData = new FormData();
      formData.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], { type: "application/json" })
      );
      formData.append("file", file);
  
      const response = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: new Headers({ Authorization: `Bearer ${token}` }),
          body: formData,
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Upload failed: ${errorData.error.message}`);
      }
  
      const data = await response.json();
      console.log("File uploaded successfully:", data);
      return data.id;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };
  

  const fetchLogs = async (activityType) => {
    setLoading(true);
    try {
      const formattedActivityType = activityType.charAt(0).toUpperCase() + activityType.slice(1); // Match Firestore field case
      const user = auth.currentUser;
      // Ensure the user is authenticated before fetching logs
      if (user) {
        const logsQuery = query(
          collection(db, "activity_logs"),
          where("action", "==", formattedActivityType),
          where("userId", "==", user.uid) // Filter logs by the current user’s ID
        );
        const querySnapshot = await getDocs(logsQuery);
        const fetchedLogs = querySnapshot.docs.map(doc => doc.data());

        console.log("Fetched Logs:", fetchedLogs); // Debugging logs
        setLogs(fetchedLogs);
      }
    } catch (error) {
      console.error(`Error fetching logs for ${activityType}:`, error);
      alert(error)
    } finally {
      setLoading(false);
    }
  };
  
  
  useEffect(() => {
    fetchLogs(activeTab); // Fetch logs for the active tab
  }, [activeTab]);
  
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  


 
  const openCommunityModal = () => setShowCommunityModal(true);
  const closeCommunityModal = () => setShowCommunityModal(false);

  const openCreateCommunityModal = () => {
    setShowCreateCommunityModal(true);
  };

  const closeCreateCommunityModal = () => {
    setShowCreateCommunityModal(false);
  };


    
    const handleCreateCommunity = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const uniqueCommunityId = `COMM-${Date.now()}`;
          const code = Math.random().toString(36).substr(2, 8);
          let fileUrl = null;
    
          // Upload the profile picture to Google Drive if selected
          if (communityProfilePic) {
            const fileId = await uploadFileToGoogleDrive(communityProfilePic); // Upload file
            fileUrl = `https://drive.google.com/uc?id=${fileId}`; // Construct URL
          }
    
          // Community data to save in Firestore
          const communityData = {
            name: communityName,
            createdTime: serverTimestamp(),
            adminId: user.uid,
            adminEmail: user.email,
            communityId: uniqueCommunityId,
            adminName: user.displayName || "Admin",
            profilePhoto: fileUrl || uploadPhoto, // Use uploaded photo or default
            communityName,
            visibility: "public",
            communityEntranceCode: code,
            status:"Active"
          };
    
          // Save to Firestore
          await setDoc(doc(db, "communities", uniqueCommunityId), communityData);
    
          alert("Community created successfully!");
        } else {
          alert("User not authenticated. Please log in.");
        }
      } catch (error) {
        console.error("Error creating community:", error);
        alert("Failed to create community. Please try again.");
      } finally {
        closeCreateCommunityModal();
      }
    };
    
    

  const navigate = useNavigate();

  const handleSaveBio = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { aboutMe: bio });
        setUserData((prevData) => ({ ...prevData, aboutMe: bio }));
        setIsEditingBio(false);
        alert("Bio updated successfully!");
      }
    } catch (error) {
      console.error("Error updating bio:", error);
    }
  };


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsOnline(true); // Set user status to online if authenticated
        fetchUserData(user.uid);
      } else {
        setIsOnline(false); // Set status to offline when not authenticated
      }
    });

    return () => unsubscribe();
  }, []);


  const fetchUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
  
        // Convert the Firebase Timestamp to a readable date
        let formattedSignUpDate = "Not available";
        if (userData.signUpDate) {
          const date = userData.signUpDate.toDate(); // Firebase Timestamp to JavaScript Date
          formattedSignUpDate = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        }
  
        setUserData({
          displayName: userData.name || "No Name",
          username: userData.username || "No Username",
          aboutMe: userData.aboutMe || "",
          signUpDate: formattedSignUpDate,
          score: userData.userScore || 0,
        });

        const communitiesQuery = collection(db, "communities");
        const communitySnapshot = await getDocs(communitiesQuery);
  
        const userCommunitiesList = communitySnapshot.docs
          .filter((doc) => {
            const community = doc.data();
            return (
              community.adminId === uid || // User is admin
              (community.member && community.member.includes(uid)) // User is a member
            );
          })
          .map((doc) => doc.data());
  
        setUserCommunities(userCommunitiesList);


        setSelectedAvatar(userData.avatar || "");
      } else {
        console.error("No user data found!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  

  

  const handleSidebarClick = (item) => {
    if (item === "Community") {
      // Only toggle the community options, don't change the active tab
      setShowCommunityOptions((prev) => !prev);
    } else if (item === "Settings") {
      navigate("/setting");
    }
    else {
      // If a different tab is clicked, update active tab
      setActiveSidebar(item);
    }
  };

  const handleAvatarSelect = async (avatar) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { avatar: avatar });
        setSelectedAvatar(avatar);
        setIsAvatarGridVisible(false);
        setIsModalOpen(false);
        alert("Avatar updated successfully!");
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };

  return (
    <div className="user-page">
      {/* Sidebar */}
      <div className="sidebar">
        {["Profile", "Activity","Community","Settings"].map((item) => (
          <div key={item} className="sidebar-section">
             <div
              className={`sidebar-item ${activeSidebar === item ? "active" : ""}`}
              onClick={() => handleSidebarClick(item)}
            >
              {item}
              {/* Arrow Icon */}
              {item === "Community" && (
                <span className="arrow-icon">
                  {showCommunityOptions ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              )}
            </div>


            {/* Community Options */}
            {item === "Community" && showCommunityOptions && (
              <div className="community-options">
                <button className="create-community-button" onClick={openCommunityModal}>
                  <span className="plus-icon">+</span> Create Community
                </button>
                <div className="community-list">
                {userCommunities.length > 0 ? (
                  userCommunities.map((community) => (
                    <div key={community.communityId} className="community-item" onClick={() => navigate(`/community/${community.communityId}`)}>
                       <img
                        src={community.profilePhoto || "https://via.placeholder.com/50"}
                        alt={community.name}
                        className="community-icon"
                      />
                      <p>{community.name}</p>
                    </div>
                  ))
                ) : (
                  <p>No communities found.</p>
                )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="main-content">
      {activeSidebar === "Activity" && (
  <div className="activity-logs">
    {/* Tab Buttons */}
    <div className="tabs">
      {["login", "logout", "task", "submission", "status"].map((tab) => (
        <button
          key={tab}
          className={`tab-button ${activeTab === tab ? 'active' : ''}`}
          onClick={() => handleTabClick(tab)}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>

    {/* Loading Indicator */}
    {loading && <div className="loading-indicator">Loading...</div>}

    {/* Logs Table */}
    <div className="log-table-container">
  {logs.length > 0 ? (
    <table className="log-table">
      <thead>
        <tr>
          {activeTab === "submission" && (
            <>
              <th>Community Name</th>
              <th>Community ID</th>
              <th>Message</th>
              <th>Timestamp</th>
            </>
          )}

{activeTab === "task" && (
            <>
              <th>Community Name</th>
              <th>Community ID</th>
              <th>Message</th>
              <th>Timestamp</th>
            </>
          )}
          {activeTab === "status" && (
            <>
              <th>Community Name</th>
              <th>Community ID</th>
              <th>Message</th>
              <th>Timestamp</th>
            </>
          )} 
           {activeTab === "login" &&(
            <>
              <th>Action</th>
              <th>Message</th>
              <th>IP</th>
              <th>Timestamp</th>
            </>
          )}

          {activeTab === "logout" &&(
            <>
              <th>Action</th>
              <th>Message</th>
              <th>IP</th>
              <th>Timestamp</th>
            </>
          )}
        </tr>
      </thead>
      <tbody>
        {logs.map((log, index) => (
          <tr key={index} className="log-row">
            {activeTab === "submission" && (
              <>
                <td>{log.communityName || "N/A"}</td>
                <td>{log.communityId || "N/A"}</td>
                <td>{log.message || "N/A"}</td>
                <td>{log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleString() : "N/A"}</td>
              </>
            )}

            {activeTab === "task" && (
              <>
                <td>{log.communityName || "N/A"}</td>
                <td>{log.communityId || "N/A"}</td>
                <td>{log.message || "N/A"}</td>
                <td>{log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleString() : "N/A"}</td>
              </>
            )}

            {activeTab === "status" && (
              <>
                <td>{log.communityName || "N/A"}</td>
                <td>{log.communityId || "N/A"}</td>
                <td>{log.message || "N/A"}</td>
                <td>{log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleString() : "N/A"}</td>
              </>
            )}
            
            {activeTab === "login" &&(
              <>
                <td>{log.action}</td>
                <td>{log.message}</td>
                <td>{log.ip}</td>
                <td>{log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleString() : "N/A"}</td>
              </>
            )}

            {activeTab === "logout" &&(
              <>
                <td>{log.action}</td>
                <td>{log.message}</td>
                <td>{log.ip}</td>
                <td>{log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleString() : "N/A"}</td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <div className="no-logs">
      <p>No logs available for this action.</p>
    </div>
  )}
</div>

  </div>
)}


        {activeSidebar === "Profile" && (
          <div className="profile-page">
            <div className="profile-banner">
              <img
                src="https://via.placeholder.com/800x200"
                alt="Profile Banner"
                className="banner-image"
              />
            </div>
            <div className="profile-info">
              <div className="profile-pic-container"  onClick={() => setIsModalOpen(true)}>
                <img
                   src={selectedAvatar || "https://via.placeholder.com/150"}
                  alt="Profile Pic"
                  className="profile-pic"
                />
              </div>
              <div className="profile-details">
                <h1 className="profile-name">{userData.displayName}</h1>
                <p className="profile-username">@{userData.username}</p>
                <div className="profile-score">
                  <span className="score-label">Score:</span>
                  <span className="score-value">{userData.score}</span>
                </div>
                {/* Profile Status */}
                <div className="profile-status">
                  <span
                    className={`status-dot ${isOnline ? "online" : "offline"}`}
                  ></span>
                  <span className="status-text">
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
              <button className="edit-profile-button" onClick={() => navigate("/setting")}>Edit Profile</button>
            </div>
            <div className="profile-informattions">
              <h2>About Me</h2>
              {isEditingBio ? (
          <div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Enter your bio..."
              className="bio-textarea"
            />
            <button onClick={handleSaveBio} className="save-button">Save</button>
            <button onClick={() => setIsEditingBio(false)} className="cancel-button">Cancel</button>
          </div>
              ) : (
                <div>
                  {userData.aboutMe ? (
                    <p>{userData.aboutMe}</p>
                  ) : (
                    <p>You haven't added any information about yourself yet.</p>
                  )}
                  <button onClick={() => setIsEditingBio(true)} className="add-about-me-button">
                    {userData.aboutMe ? "Edit Bio" : "Add Bio"}
                  </button>

                     {/* Joined Communities Section */}
                     <div className="joined-communities">
  <h2>Joined Communities</h2>
  {userCommunities.length > 0 ? (
    userCommunities.map((community) => (
      <a
        key={community.communityId}
        href={`/community/${community.communityId}`}
        className="community-link"
      >
        <img
          src={
            community.profilePhoto
              ? community.profilePhoto // Use the saved Google Drive URL
              : "https://via.placeholder.com/50" // Default image
          }
          alt={community.name}
          className="community-icon"
        />
        <span className="community-name">{community.name}</span>
      </a>
    ))
  ) : (
    <p>No communities found.</p>
  )}
</div>

                </div>
              )}

              {/* Member Since Section */}
  <div className="member-since-section">
    <h2>Member Since</h2>
    <p>{userData.signUpDate || "Not available"}</p>
  </div>
              </div>
                <div style={{padding:'40px'}}></div>
                
              </div>
            )}

          </div>
 {/* Modal */}
 {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Select an Image</h3>
              <button
                className="close-button"
                onClick={() => setIsModalOpen(false)}
              >
                <FaTimes />
              </button>
            </div>
            {!isAvatarGridVisible ? (
              <div className="options-container">
                <div className="option" onClick={() => console.log("Upload Image")}>
                  <div className="icon-container">
                    <FaUpload />
                  </div>
                  <p>Upload Image</p>
                </div>
                <div className="option" onClick={() => setIsAvatarGridVisible(true)}>
                  <div className="icon-container">
                    <FaUserAlt />
                  </div>
                  <p>Choose Avatar</p>
                </div>
              </div>
            ) : (
              <div className="avatar-grid">
                {avatars.map((avatar, index) => (
                  <img
                    key={index}
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                    className="avatar-image"
                    onClick={() => handleAvatarSelect(avatar)}
                  />
                ))}
              </div>
            )}

            
          </div>

          
        </div>
      )}

      {showCommunityModal && (
      <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <h2>Create your community</h2>
          <button className="close-button" onClick={closeCommunityModal}><FaTimes/></button>
        </div>
        <div className="divider"/>
        {/* Container */}
        <div className="community-content">
          <div className="community-option" onClick={openCreateCommunityModal}>
            <span>Create my own</span>
            <span className="arrow-icon"><AiOutlineArrowRight/></span>
          </div>
        </div>
        <div className="divider"/>


        {/* Footer */}
        <div className="community-footer">
          <p>Already have an invite?</p>
          <button className="join-button">Join a community</button>
        </div>
      </div>
    </div>
      )}

{showCreateCommunityModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Create your own community</h2>
              <button className="close-button" onClick={closeCreateCommunityModal}>
                <FaTimes />
              </button>
            </div>
            <div className="create-community-content">
            <div className="create-community-profile-pic-container">
  <img
    src={communityProfilePic || uploadPhoto}
    alt="Community Profile"
    className="create-community-profile-pic"
    title="Community profile picture"
  />
 <input
  type="file"
  accept="image/*"
  className="image-upload-input"
  onChange={(e) => {
    const file = e.target.files[0];
    if (file) {
      setCommunityProfilePic(file); // Set the selected file in state
    }
  }}
/>

</div>

              <div className="create-community-input-group">
                <label htmlFor="communityName">Community Name</label>
                <input
                  id="communityName"
                  type="text"
                  value={communityName}
                  onChange={(e) => setCommunityName(e.target.value)}
                  placeholder="Enter community name"
                />
              </div>
              <button onClick={handleCreateCommunity} className="create-community-button">
                Create Community
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;