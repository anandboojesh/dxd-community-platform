import React, { useEffect, useState } from "react";
import "../styles/components/ProfilePage.css";
import { auth, db } from "../services/firebase";
import { doc, getDoc, collection, getDocs, updateDoc, addDoc, serverTimestamp, setDoc, where, query, orderBy, onSnapshot } from "firebase/firestore";
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

const Achievement_Badges = [
  // Streak Badges
  {
    badgeId: "STREAK_1",
    name: "First Step",
    category: "streak",
    milestone: 1,
    milestoneDescription: "Achieved a 1-day streak",
    icon: require('./assets/badges/First Step Badge.png'),
    description: "Achieved a 1-day login streak."
  },
  {
    badgeId: "STREAK_2",
    name: "Consistency Champ",
    category: "streak",
    milestone: 5,
    milestoneDescription: "Achieved a 5-day streak",
    icon: require('./assets/badges/Consistency Champ Badge.png'),
    description: "Achieved a 5-day login streak."
  },
  {
    badgeId: "STREAK_3",
    name: "Steadfast User",
    category: "streak",
    milestone: 15,
    milestoneDescription: "Achieved a 15-day streak",
    icon: require('./assets/badges/Steadfast User Badge.png'),
    description: "Achieved a 15-day login streak."
  },
  {
    badgeId: "STREAK_4",
    name: "Trailblazer",
    category: "streak",
    milestone: 30,
    milestoneDescription: "Achieved a 30-day streak",
    icon: require('./assets/badges/Trailblazer Badge.png'),
    description: "Achieved a 30-day login streak."
  },
  {
    badgeId: "STREAK_5",
    name: "Marathoner",
    category: "streak",
    milestone: 90,
    milestoneDescription: "Achieved a 90-day streak",
    icon: require('./assets/badges/Marathoner Badge.png'),
    description: "Achieved a 90-day login streak."
  },
  {
    badgeId: "STREAK_6",
    name: "Legendary Streaker",
    category: "streak",
    milestone: 365,
    milestoneDescription: "Achieved a 365-day streak",
    icon: require('./assets/badges/Legendary Streaker Badge.png'),
    description: "Achieved a 365-day login streak."
  },

  // Leadership Badges
  {
    badgeId: "LEADERSHIP_1",
    name: "Aspiring Leader",
    category: "leadership",
    milestone: 1,
    milestoneDescription: "Created 1 community",
    icon: require('./assets/badges/Aspiring Leader Badge.png'),
    description: "Created your first community."
  },
  {
    badgeId: "LEADERSHIP_2",
    name: "Community Architect",
    category: "leadership",
    milestone: 5,
    milestoneDescription: "Created 5 communities",
    icon: require('./assets/badges/Community Architect Badge.png'),
    description: "Created 5 communities."
  },
  {
    badgeId: "LEADERSHIP_3",
    name: "Network Builder",
    category: "leadership",
    milestone: 10,
    milestoneDescription: "Created 10 communities",
    icon: require('./assets/badges/Network Builder Badge.png'),
    description: "Created 10 communities."
  },
  {
    badgeId: "LEADERSHIP_4",
    name: "Visionary Leader",
    category: "leadership",
    milestone: 25,
    milestoneDescription: "Created 25 communities",
    icon: require('./assets/badges/Visionary Leader Badge.png'),
    description: "Created 25 communities."
  },
  {
    badgeId: "LEADERSHIP_5",
    name: "Community Hero",
    category: "leadership",
    milestone: 50,
    milestoneDescription: "Created 50 communities",
    icon: require('./assets/badges/Community Hero Badge.png'),
    description: "Created 50 communities."
  },
  {
    badgeId: "LEADERSHIP_6",
    name: "Global Influencer",
    category: "leadership",
    milestone: 100,
    milestoneDescription: "Created 100 communities",
    icon: require('./assets/badges/Global Influencer Badge.png'),
    description: "Created 100 communities."
  },

  // Special Combined Milestones
  {
    badgeId: "SPECIAL_1",
    name: "Pioneer",
    category: "special",
    milestoneDescription: "30-day streak and 5 communities",
    icon: require('./assets/badges/Pioneer Badge.png'),
    description: "Achieved a 30-day streak and created 5 communities."
  },
  {
    badgeId: "SPECIAL_2",
    name: "Mastermind",
    category: "special",
    milestoneDescription: "90-day streak and 10 communities",
    icon: require('./assets/badges/Mastermind Badge.png'),
    description: "Achieved a 90-day streak and created 10 communities."
  },
  {
    badgeId: "SPECIAL_3",
    name: "Ultimate Leader",
    category: "special",
    milestoneDescription: "365-day streak and 25 communities",
    icon: require('./assets/badges/Ultimate Leader Badge.png'),
    description: "Achieved a 365-day streak and created 25 communities."
  }
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
  const [achievements, setAchievements] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
const [selectedBadge, setSelectedBadge] = useState(null);



useEffect(() => {
  const fetchBadgesRealtime = () => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Query to listen to badge updates in real time
        const badgesQuery = query(
          collection(db, "user-badges"),
          where("userId", "==", user.uid)
        );

        // Set up a Firestore real-time listener
        const unsubscribe = onSnapshot(badgesQuery, (snapshot) => {
          const updatedBadges = snapshot.docs.map((doc) => doc.data());
          setUserBadges(updatedBadges); // Update state with the latest badges
        });

        return unsubscribe; // Return unsubscribe for cleanup
      }
    } catch (error) {
      console.error("Error setting up real-time listener for badges:", error);
      alert(error)
    }
  };

  const unsubscribe = fetchBadgesRealtime();

  return () => {
    if (unsubscribe) {
      unsubscribe(); // Clean up the listener when the component unmounts
    }
  };
}, []);


const handleBadgeClick = (badge) => {
  setSelectedBadge(badge);
  setIsBadgeModalOpen(true);
};

const closeBadgeModal = () => {
  setIsBadgeModalOpen(false);
  setSelectedBadge(null);
};

  const updateBadgeForAchievement = async (userId, category, milestone) => {
    try {
      // Find the badge in the local Achievement_Badges array
      const badge = Achievement_Badges.find(
        (b) => b.category === category && b.milestone === milestone
      );
  
      if (badge) {
        // Check if the badge already exists for the user in the 'user-badges' collection
        const userBadgeQuery = query(
          collection(db, "user-badges"),
          where("userId", "==", userId),
          where("badgeId", "==", badge.badgeId)
        );
  
        const userBadgeSnapshot = await getDocs(userBadgeQuery);
  
        if (userBadgeSnapshot.empty) {
          // Add the new badge to the user's 'user-badges' collection
          const userBadgeData = {
            userId,
            badgeId: badge.badgeId, // Correctly use the local badge details
            name: badge.name,
            category: badge.category,
            milestone: badge.milestone,
            iconUrl: badge.icon,
            timestamp: serverTimestamp(),
          };
  
          await addDoc(collection(db, "user-badges"), userBadgeData);
  
          console.log(`Badge "${badge.name}" added for milestone: ${milestone}`);
          alert(`Congratulations! You've earned the "${badge.name}" badge!`);
        } else {
          console.log(`Badge "${badge.name}" already exists for the user.`);
        }
      } else {
        console.warn(
          `No badge found in Achievement_Badges for category: ${category} and milestone: ${milestone}`
        );
      }
    } catch (error) {
      console.error("Error updating badge for achievement:", error);
      alert(error.message);
    }
  };
  
  
  

  const createCommunityAchievement = async (userId) => {
    try {
      // Query to find communities where the user is an admin
      const communitiesQuery = query(
        collection(db, "communities"),
        where("adminId", "==", userId)
      );
  
      const querySnapshot = await getDocs(communitiesQuery);
      const adminCommunitiesCount = querySnapshot.docs.length;
  
      // Define leadership achievement milestones
      const milestones = [1, 5, 10, 25, 50, 100];
      let message;
  
      if (milestones.includes(adminCommunitiesCount)) {
        // Custom messages for each milestone
        if (adminCommunitiesCount === 1) {
          message = `Congratulations! You've created your first community. Welcome to leadership!`;
        } else if (adminCommunitiesCount === 5) {
          message = `Fantastic! You've created 5 communities. A true leader in action!`;
        } else if (adminCommunitiesCount === 10) {
          message = `Outstanding! You've created 10 communities. You're shaping a vibrant network of communities!`;
        } else if (adminCommunitiesCount === 25) {
          message = `Incredible! You've created 25 communities. Your influence is growing stronger!`;
        } else if (adminCommunitiesCount === 50) {
          message = `Amazing! You've created 50 communities. You're a Community Hero!`;
        } else if (adminCommunitiesCount === 100) {
          message = `Legendary! You've created 100 communities. You're a Global Influencer! Keep inspiring!`;
        }

        const milestone = adminCommunitiesCount;
        
        await updateBadgeForAchievement(userId, "leadership", milestone);
  
        // Query to check if the achievement already exists
        const achievementsQuery = query(
          collection(db, "user-achievements"),
          where("userId", "==", userId),
          where("category", "==", "leadership"),
          where("metadata.communityCount", "==", adminCommunitiesCount)
        );
  
        const achievementsSnapshot = await getDocs(achievementsQuery);
  
        // If the achievement doesn't already exist, create it
        if (achievementsSnapshot.empty) {
          const achievementData = {
            achievementId: `ACH-${Date.now()}`, // Unique ID
            userId,
            category: "leadership",
            message,
            metadata: {
              communityCount: adminCommunitiesCount,
            },
            timestamp: serverTimestamp(),
          };
  
          await addDoc(collection(db, "user-achievements"), achievementData);
          console.log("Leadership achievement created:", achievementData);
          alert(message); // Notify the user
        } else {
          console.log(`Leadership achievement for ${adminCommunitiesCount} communities already exists.`);
        }
      }
    } catch (error) {
      console.error("Error checking leadership achievements:", error);
    }
  };



  const createAchievement = async (userId, category, message, streakDays) => {
    try {
      // Query to check if the achievement already exists
      const achievementsQuery = query(
        collection(db, "user-achievements"),
        where("userId", "==", userId),
        where("category", "==", category),
        where("streakDays", "==", streakDays) // Match the specific streak milestone
      );
  
      const querySnapshot = await getDocs(achievementsQuery);
  
      if (!querySnapshot.empty) {
        console.log(`Achievement for ${streakDays}-day streak already exists.`);
        return; // Achievement already exists; no need to create another
      }
  
      // If no achievement exists, create a new one
      const achievementData = {
        achievementId: `ACH-${Date.now()}`, // Unique ID
        userId,
        category,
        message,
        streakDays,
        timestamp: serverTimestamp(),
        metadata: {
          extraInfo: "Achievement unlocked",
        },
      };
  
      await addDoc(collection(db, "user-achievements"), achievementData);
      console.log("Achievement created successfully:", achievementData);
      alert(message); // Notify the user
    } catch (error) {
      console.error("Error creating achievement:", error);
    }
  };

  
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

          await createCommunityAchievement(user.uid);
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
          currentStreak: userData.currentStreak || 0,
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
  
  const incrementStreak = async () => {
    const user = auth.currentUser;
  
    if (!user) return;
  
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
  
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const today = new Date().setHours(0, 0, 0, 0);
      const lastActivityDate = userData.lastActivityDate?.toDate().setHours(0, 0, 0, 0);
  
      let newStreak = userData.currentStreak || 0;
  
      if (lastActivityDate === today - 86400000) {
        newStreak++; // Increment streak
      } else if (lastActivityDate !== today) {
        newStreak = 1; // Reset streak if not continuous
      }
  
      await updateDoc(userRef, {
        currentStreak: newStreak,
        lastActivityDate: new Date(),
      });
  
      // Check for milestone and create achievement
      const milestones = [1, 5, 15, 30, 90, 365];
      if (milestones.includes(newStreak)) {
        const message = `Congratulations! You've unlocked a ${newStreak}-day streak achievement!`;
        await createAchievement(user.uid, "streak", message, newStreak);
        const milestone = newStreak;
        await updateBadgeForAchievement(user.uid, "streak", milestone);
      }
  
      console.log(`Streak updated: ${newStreak}`);
    }
  };
  
  

  useEffect(() => {
    if (isOnline) incrementStreak();
  }, [isOnline]);

  useEffect(() => {
    const fetchAchievementsRealtime = () => {
      try {
        const user = auth.currentUser;
        if (user) {
          // Query to listen for real-time updates to achievements
          const achievementsQuery = query(
            collection(db, "user-achievements"),
            where("userId", "==", user.uid)
          );
  
          // Set up a Firestore real-time listener
          const unsubscribe = onSnapshot(achievementsQuery, (snapshot) => {
            const fetchedAchievements = snapshot.docs.map((doc) => doc.data());
            setAchievements(fetchedAchievements); // Update state with real-time data
          });
  
          return unsubscribe; // Return the unsubscribe function for cleanup
        }
      } catch (error) {
        console.error("Error setting up real-time listener for achievements:", error);
      }
    };
  
    const unsubscribe = fetchAchievementsRealtime();
  
    return () => {
      if (unsubscribe) {
        unsubscribe(); // Clean up the listener when the component unmounts
      }
    };
  }, []);
  
  


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
      <div className="profile-page-sidebar">
        {["Profile", "Activity","Community","Achivements","Settings"].map((item) => (
          <div key={item} className="profile-page-sidebar-section">
             <div
              className={`profile-page-sidebar-item ${activeSidebar === item ? "active" : ""}`}
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
        <div style={{padding:'40px'}}/>
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
{activeSidebar === "Achivements" && (
  <div className="achievement-section">
    <h2>Achievements</h2>
    {achievements.length > 0 ? (
      achievements.map((achievement) => {
        // Find the badge corresponding to the achievement
        const badge = Achievement_Badges.find(
          (b) =>
            b.category === achievement.category &&
            (b.milestone === achievement.metadata?.communityCount ||
              b.milestone === achievement.streakDays)
        );

        return (
          <div key={achievement.achievementId} className="achievement-card">

              {badge && (
                <div >
                <img
                  src={badge.icon}
                  title={badge.name}
                  alt={badge.name}
                  className="badge-icon"
                  style={{ width: "50px", height: "50px"}}
                  onClick={() => handleBadgeClick(badge)}
                />
                </div>
              )}
              <p>{achievement.message}</p>
        
           
            <span>
              {new Date(achievement.timestamp.seconds * 1000).toLocaleDateString()}
            </span>
          </div>
        );
      })
    ) : (
      <p>No achievements yet. Keep working to unlock new milestones!</p>
    )}
  </div>
)}


        {activeSidebar === "Profile" && (
          <div className="profile-page">
            <div className="profile-banner">
              <img
                src={require('./assets/default-community-banner.jpeg')}
                alt="Profile Banner"
                className="banner-image"
              />
            </div>
            <div className="profile-info">
              <div className="profile-pic-container"  onClick={() => setIsModalOpen(true)}>
                <img
                   src={selectedAvatar|| auth.currentUser?.photoURL || "https://via.placeholder.com/150"}
                  alt="Profile Pic"
                  className="profile-pic"
                />
              </div>
              <div className="profile-details">
                <div style={{display:'flex',}}>
                <h1 className="profile-name">{userData.displayName} </h1>
                <div className="profile-status" style={{marginLeft:'20px'}}>
                  <span
                    className={`status-dot ${isOnline ? "online" : "offline"}`}
                  ></span>
                  <span className="status-text">
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
                </div>
                <p className="profile-username">@{userData.username}</p>
                <div style={{display:'flex', justifyContent:'space-between', flexDirection:'column'}}>
                <div className="profile-score">
                  <span className="score-label">Score:</span>
                  <span className="score-value">{userData.score}</span>
                </div>

                <div className="streak-section">
                  <h2> Streak</h2>
                  <p>{userData.currentStreak} day(s)</p>

                </div>

                <div className="badges-section">
  <div className="badges-grid">
    {userBadges.length > 0 ? (
      userBadges.map((badge) => (
        <div key={badge.badgeId} className="badge-item">
          <img
            src={badge.iconUrl} // Badge icon from Firestore
            alt={badge.name}
            className="badge-icon"
            title={badge.name}
          />
        </div>
      ))
    ) : (
      ""
    )}
  </div>
  </div>
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
        <span className="community-name" style={{color:'#000'}}>{community.name}</span>
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


{isBadgeModalOpen && selectedBadge && (
  <div className="modal-overlay">
    <div className="modal-container">
      <div className="modal-header">
        <h3>{selectedBadge.name}</h3>
        <button className="close-button" onClick={closeBadgeModal}>
          <FaTimes />
        </button>
      </div>
      <div className="modal-body">
        <img
          src={selectedBadge.icon}
          alt={selectedBadge.name}
          className="badge-modal-icon"
        />
        <p>{selectedBadge.description}</p>
        {selectedBadge.milestoneDescription && (
          <p><strong>Milestone:</strong> {selectedBadge.milestoneDescription}</p>
        )}
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default ProfilePage;