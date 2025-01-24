import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/components/AdminProfilePage.css";
import { db, auth } from "../services/firebase";
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { FaTimes, FaUserAlt, FaEdit, FaTrashAlt, FaSearch, FaCog, FaStopCircle, FaBan } from "react-icons/fa";

import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Paper,
  Select,
  MenuItem,
  Avatar,
} from "@mui/material";

const defaultProfile = require('./assets/default_profile_avatar.jpg');

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

const AdminProfilePage = () => {
  const [activeSidebar, setActiveSidebar] = useState("Profile");
  const [userInfo, setUserInfo] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAvatarGridVisible, setIsAvatarGridVisible] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserPreviewModalOpen, setIsUserPreviewModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [suspendDuration, setSuspendDuration] = useState("");
  
   // Open the Suspend Modal
   const openSuspendModal = () => setIsSuspendModalOpen(true);

   // Close the Suspend Modal
   const closeSuspendModal = () => setIsSuspendModalOpen(false);

  const navigate = useNavigate();

  // Fetch user info from Firestore
  const fetchUserInfo = async (uid) => {
    try {
      const userDocRef = doc(db, "users",uid); // Use dynamic UID
      const docSnapshot = await getDoc(userDocRef);
      if (docSnapshot.exists()) {
        setUserInfo(docSnapshot.data());
      } else {
        console.error("No user data found");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };


  const handleConfirmSuspend = async () => {
    if (!suspendDuration) {
      alert("Please select a suspension duration.");
      return;
    }

    try {
      const now = new Date();
      const durationMapping = {
        "1 day": 1,
        "3 days": 3,
        "1 week": 7,
        "1 month": 30,
        "3 months": 90,
        "6 months": 180,
        "1 year": 365,
      };
      const suspensionEndDate = new Date(
        now.getTime() + durationMapping[suspendDuration] * 24 * 60 * 60 * 1000
      );

      await Promise.all(
        selectedUsers.map(async (userId) => {
          const userRef = doc(db, "users", userId);
          await updateDoc(userRef, {
            accountStatus: "Suspended",
            suspendDuration,
            suspensionEndDate: suspensionEndDate.toISOString(),
          });
        })
      );

      fetchUsers(); // Refresh user list
      closeSuspendModal(); // Close modal
      alert("Users suspended successfully!");
    } catch (error) {
      console.error("Error suspending users:", error);
      alert("There was an error suspending the users.");
    }
  };


   // Fetch all users (for user management)
   const fetchUsers = async () => {
    const usersCollectionRef = collection(db, "users");
    const q = query(usersCollectionRef, where("role", "==", "Member"));
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id, // Ensure we are getting the user ID correctly
    }));
    setUsersList(users);
  };
  

  useEffect(() => {
    fetchUsers();
  }, []);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsOnline(true);
        fetchUserInfo(user.uid); // Pass UID to fetch user info
      } else {
        setIsOnline(false);
        setUserInfo(null); // Clear user info if logged out
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSidebarClick = (section) => {
    if (section === "Admin Settings") {
      navigate("/setting");
    }
    else {
      // If a different tab is clicked, update active tab
      setActiveSidebar(section);
    }
  };

  const handleAvatarSelect = async (avatar) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { avatar });
        setSelectedAvatar(avatar);
        setIsAvatarGridVisible(false);
        setIsModalOpen(false);
        alert("Avatar updated successfully!");
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
      alert("There was an error updating your avatar. Please try again.");
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleRoleChange = async (userId, newRole) => {
    console.log("Changing role for user:", userId, "to", newRole); // Log userId and newRole
    if (!userId || !newRole) {
      console.error("Invalid user ID or new role");
      return; // Exit early if userId or newRole is invalid
    }
  
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      fetchUsers(); // Refresh the user list after updating
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleEditIconClick = async (userId) => {
    try {
      // Fetch user details by userId
      const userRef = doc(db, "users", userId);
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        setSelectedUser(userSnapshot.data()); // Set the user data to the state
        setIsUserPreviewModalOpen(true); // Open the modal
      } else {
        console.error("User not found");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };
  
  
  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId); // Remove user if already selected
      } else {
        return [...prev, userId]; // Add user to the selected list
      }
    });
  };

  const getSelectedUserNames = () => {
    return selectedUsers
      .map((userId) => {
        const user = usersList.find((u) => u.id === userId);
        return user ? user.name : "Unknown User";
      })
      .join(", ");
  };
  

  const handleSuspendUsers = async () => {
    try {
      await Promise.all(selectedUsers.map(async (userId) => {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { accountStatus: "Suspended" });
      }));
      fetchUsers();
      alert("Users suspended successfully!");
    } catch (error) {
      console.error("Error suspending users:", error);
      alert("There was an error suspending the users.");
    }
  };

  const handleBlockUsers = async () => {
    try {
      await Promise.all(selectedUsers.map(async (userId) => {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { accountStatus: "Blocked" });
      }));
      fetchUsers();
      alert("Users blocked successfully!");
    } catch (error) {
      console.error("Error blocking users:", error);
      alert("There was an error blocking the users.");
    }
  };

  const handleDeleteUser = async (userId) => {
    // Deleting user logic here (soft delete or fully delete based on requirements)
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { deleted: true });
    fetchUsers(); // Refresh the user list
  };

  const filteredUsers = usersList.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  


  return (
    <div className="admin-page">
      {/* Sidebar */}
      <div className="admin-sidebar">
        {["Profile", "Users", "Communities", "Reports", "Admin Settings"].map(
          (item) => (
            <div
              key={item}
              className={`sidebar-item ${
                activeSidebar === item ? "active" : ""
              }`}
              onClick={() => handleSidebarClick(item)}
            >
              {item}
            </div>
          )
        )}
      </div>

      {/* Main Content */}
      <div className="admin-content">
        <div className="admin-page-body">
          {activeSidebar === "Profile" && userInfo && (
            <div className="admin-profile-page">
              <div className="admin-profile-banner">
                <img
                  src="https://via.placeholder.com/800x200"
                  alt="Profile Banner"
                  className="banner-image"
                />
              </div>
              <div className="admin-profile-info">
                <div
                  className="admin-profile-pic-container"
                  onClick={() => setIsModalOpen(true)}
                >
                  <img
                    src={selectedAvatar || userInfo.avatar || "https://via.placeholder.com/150"}
                    alt="Profile Pic"
                    className="profile-pic"
                  />
                </div>
                <div className="admin-profile-details">
                  <h1 className="admin-profile-name">{userInfo.name}</h1>
                  <p className="admin-profile-username">
                    @{userInfo.username}
                  </p>

                  {/* Role Badge */}
                  <div className="role-badge-container">
                    <span className="role-badge">{userInfo.role}</span>
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
                <button
                  className="admin-edit-profile-button"
                  onClick={() => navigate("/setting")}
                >
                  Edit Profile
                </button>
              </div>
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
{activeSidebar === "Users" && (
  <Box
    sx={{
      background: "linear-gradient(135deg, #2f3136, #3a3f44)",
      minHeight: "100vh",
      p: 4,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      color: "#eceff4",
    }}
  >
    {/* Header */}
    <Typography
      variant="h3"
      sx={{
        fontWeight: "bold",
        color: "#d8dee9",
        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.6)",
      }}
    >
      User Management
    </Typography>

    {/* Search Bar */}
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        borderRadius: "20px",
        padding: "12px 24px",
        width: "100%",
        maxWidth: "800px",
        boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.5)",
      }}
    >
      <TextField
        fullWidth
        placeholder="Search users..."
        variant="standard"
        value={searchQuery}
        onChange={handleSearchChange}
        InputProps={{
          disableUnderline: true,
          style: { color: "#eceff4" },
        }}
        sx={{
          "& input": {
            color: "#d8dee9",
          },
        }}
      />
      <IconButton
        sx={{
          color: "#d8dee9",
          fontSize: "24px",
        }}
      >
        <FaSearch />
      </IconButton>
    </Box>

    {/* Actions */}
    {selectedUsers.length > 0 && (
      <Box display="flex" gap={2}>
        <Button
          variant="contained"
          sx={{
            background: "linear-gradient(135deg, #f0932b, #e84118)",
            color: "#ffffff",
            px: 4,
            fontWeight: "bold",
            borderRadius: "30px",
            transition: "background 0.3s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #e84118, #c23616)",
            },
          }}
          startIcon={<FaStopCircle />}
          onClick={openSuspendModal}
        >
          Suspend
        </Button>
        <Button
          variant="contained"
          sx={{
            background: "linear-gradient(135deg, #c23616, #e84118)",
            color: "#ffffff",
            px: 4,
            fontWeight: "bold",
            borderRadius: "30px",
            transition: "background 0.3s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #e84118, #e74c3c)",
            },
          }}
          startIcon={<FaBan />}
          onClick={handleBlockUsers}
        >
          Block
        </Button>
      </Box>
    )}

    {/* User Table */}
    <TableContainer
      component={Paper}
      sx={{
        background: "linear-gradient(135deg, #2f3136, #3a3f44)",
        backdropFilter: "blur(15px)",
        borderRadius: "20px",
        width: "100%",
        maxWidth: "1200px",
        boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.6)",
      }}
    >
      <Table>
        <TableHead>
          <TableRow
            sx={{
              background: "rgba(255, 255, 255, 0.1)",
              "& th": {
                color: "#eceff4",
                fontWeight: "bold",
              },
            }}
          >
            <TableCell padding="checkbox">
              <Checkbox sx={{ color: "#d8dee9" }} />
            </TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Username</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Account Status</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow
              key={user.id}
              sx={{
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleSelectUser(user.id)}
                  sx={{ color: "#eceff4" }}
                />
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    sx={{
                      width: 40,
                      height: 40,
                      border: "2px solid #d8dee9",
                    }}
                  />
                  <Typography>{user.name}</Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ color: "#d8dee9" }}>@{user.username}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  size="small"
                  sx={{
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "#eceff4",
                    borderRadius: "8px",
                    "& .MuiSelect-icon": {
                      color: "#eceff4",
                    },
                  }}
                >
                  <MenuItem value="Member">Member</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                </Select>
              </TableCell>
              <TableCell>
                <Typography
                  sx={{
                    color:
                      user.profileStatus === "online"
                        ? "#1abc9c"
                        : "#e74c3c",
                    fontWeight: "bold",
                  }}
                >
                  {user.profileStatus || "Offline"}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  sx={{
                    color:
                      user.accountStatus === "Active"
                        ? "#27ae60"
                        : user.accountStatus === "Blocked"
                        ? "#e74c3c"
                        : "#f39c12",
                    fontWeight: "bold",
                  }}
                >
                  {user.accountStatus}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Tooltip title="Edit">
                  <IconButton
                    sx={{ color: "#5a9df2" }}
                    onClick={() => handleEditIconClick(user.id)}
                  >
                    <FaCog />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton sx={{ color: "#e74c3c" }}>
                    <FaTrashAlt />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <div style={{ padding: "40px" }} />
  </Box>
)}

        </div>
      </div>

      {/* Modal for Avatar Selection */}
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
                <div
                  className="option"
                  onClick={() => setIsAvatarGridVisible(true)}
                >
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


{isUserPreviewModalOpen && selectedUser && (
  <div className="user-preview-modal">
    <div className="user-preview-modal-overlay">
      <div className="user-preview-modal-container">
        <div className="user-preview-modal-header">
          <h3>User Details</h3>
          <button
            className="user-preview-modal-close-button"
            onClick={() => setIsUserPreviewModalOpen(false)} // Close the modal
          >
            <FaTimes />
          </button>
        </div>

        <div className="user-preview-modal-body">
          <div className="user-preview-profile-info">
            {/* Profile Picture */}
            <div className="user-preview-profile-pic-container">
              <img
                src={selectedUser.avatar || defaultProfile}
                alt="Profile Pic"
                className="user-preview-profile-pic"
              />
          
              <div style={{display:'flex',flexDirection:'column', justifyContent:'center'}}>
               <p className="user-preview-user-name">{selectedUser.name}</p>
               <p className="user-preview-user-username">@{selectedUser.username}</p>
               <p className="user-preview-user-status">
             
              </p>
               </div>
            </div>

            {/* User Details */}
            <div className="user-preview-user-details">
             
              <p className="user-preview-user-email"><strong>Email:</strong>{selectedUser.email}</p>
              <p className="user-preview-user-about"><strong>Bio:</strong>{selectedUser.aboutMe}</p>
              <p className="user-preview-user-birthday">
                <strong>Birthdate:</strong> {selectedUser.dateOfBirth}
              </p>
              <p className="user-preview-user-role">
                <strong>Role:</strong> {selectedUser.role}
              </p>
              <p className="user-preview-user-status">
                <strong>Status:</strong> <span className={`user-management-status-dot ${selectedUser.profileStatus === "online" ? "online" : "offline"}`}></span>

<span className="user-management-status-text" >
  {selectedUser.profileStatus}
</span>
              </p>
              <p className="user-preview-user-signup">
  <strong>Sign-up Date:</strong> 
  {selectedUser.signUpDate ? selectedUser.signUpDate.toDate().toLocaleString() : "N/A"}
</p>
              <p className="user-preview-user-score">
                <strong>User Score:</strong> {selectedUser.userScore}
              </p>
            </div>
          </div>
        </div>

        <div className="user-preview-modal-footer">
          <button
            className="user-preview-close-button"
            onClick={() => setIsUserPreviewModalOpen(false)} // Close modal
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{isSuspendModalOpen && (
        <div className="suspend-modal-overlay">
          <div className="suspend-modal-container">
            <h3>Suspend the following users: <strong>{getSelectedUserNames()}</strong></h3>
            <select
              value={suspendDuration}
              onChange={(e) => setSuspendDuration(e.target.value)}
            >
              <option value="">Select Duration</option>
              <option value="1 day">1 Day</option>
              <option value="3 days">3 Days</option>
              <option value="1 week">1 Week</option>
              <option value="1 month">1 Month</option>
              <option value="3 months">3 Months</option>
              <option value="6 months">6 Months</option>
              <option value="1 year">1 Year</option>
              <option value="Permanent">Block Permanently</option>
            </select>
            <div className="suspend-modal-actions">
              <button className="suspend-modal-suspend-btn" onClick={handleConfirmSuspend}>Suspend</button>
              <button className="suspend-modal-cancel-btn" onClick={closeSuspendModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    

    </div>
  );
};

export default AdminProfilePage;
