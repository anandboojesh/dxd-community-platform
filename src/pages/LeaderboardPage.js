import React, { useState, useEffect } from "react";
import { db, auth } from "../services/firebase";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import "../styles/components/Leaderboard.css";

const Leaderboard = ({ currentUserId }) => {
  const [users, setUsers] = useState([]);
  const [submissionsCount, setSubmissionsCount] = useState({});
  const [loading, setLoading] = useState(true);
  const [userCommunities, setUserCommunities] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // For search functionality
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const [usersPerPage] = useState(10); 

  // Fetch current user's role
  const fetchCurrentUserRole = async () => {
    try {
      const currentUserRef = doc(db, "users", auth.currentUser?.uid);
      const userDoc = await getDoc(currentUserRef);

      if (userDoc.exists()) {
        setCurrentUserRole(userDoc.data().role);
      } else {
        console.error("Current user not found in the users collection.");
      }
    } catch (error) {
      console.error("Error fetching current user role: ", error);
      alert(error);
    }
  };

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("accountStatus", "==", "Active"));
      const querySnapshot = await getDocs(q);

      const userList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sortedUsers = userList.sort((a, b) => b.userScore - a.userScore);

      setUsers(sortedUsers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching leaderboard data: ", error);
      setLoading(false);
    }
  };

  // Fetch submissions count for users
  const fetchSubmissionsCount = async () => {
    try {
      const submissionsRef = collection(db, "community-assignment-submission");
      const querySnapshot = await getDocs(submissionsRef);

      let submissionsCountObj = {};

      querySnapshot.forEach((doc) => {
        const memberId = doc.data().memberId;
        submissionsCountObj[memberId] = (submissionsCountObj[memberId] || 0) + 1;
      });

      setSubmissionsCount(submissionsCountObj);
    } catch (error) {
      console.error("Error fetching submissions count: ", error);
    }
  };

  // Fetch user communities
  const fetchUserCommunities = async (userId) => {
    try {
      const communitiesRef = collection(db, "communities");
      const querySnapshot = await getDocs(communitiesRef);

      const userCommunitiesList = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (community) =>
            community.adminId === userId || community.member?.includes(userId)
        );

      setUserCommunities(userCommunitiesList);
    } catch (error) {
      console.error("Error fetching user communities: ", error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchCurrentUserRole();
    fetchLeaderboard();
    fetchSubmissionsCount();
    
    // Fetch communities for the current logged-in user
    fetchUserCommunities(auth.currentUser?.uid);
  }, []);

  // Re-fetch communities when a selected user changes
  useEffect(() => {
    if (selectedUser) {
      fetchUserCommunities(selectedUser.id);
    }
  }, [selectedUser]);

  const filteredUsers = users.filter((user) => submissionsCount[user.id] > 0);

  const currentUser = users.find((user) => user.id === auth.currentUser?.uid);

  const currentUserRank =
    filteredUsers.findIndex((user) => user.id === auth.currentUser?.uid) + 1;

    const filteredUser = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const usersToDisplay = selectedUser ? [selectedUser] : filteredUsers;
    
      // Pagination logic
      const indexOfLastUser = currentPage * usersPerPage;
      const indexOfFirstUser = indexOfLastUser - usersPerPage;
      const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    
      // Change page
      const paginate = (pageNumber) => setCurrentPage(pageNumber);
    
      const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    

    const handleRowClick = (user) => {
        if (currentUserRole === "Admin") {
          // Toggle the selected user display
          if (selectedUser?.id === user.id) {
            setSelectedUser(""); // Deselect user
          } else {
            setSelectedUser(user); // Select new user
          }
        }
      };
      

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "50px", background:'#fff5f0', marginTop:'90px' }}>
      <div className="community-platform-leaderboard-container">
        <h1>Leaderboard</h1>
        <input
              type="text"
              placeholder="Search by name or username"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
        <div className="leaderboard-and-profile">
          <div className="leaderboard">
            {loading ? (
              <p>Loading...</p>
            ) : filteredUser.length > 0 ? (
              <table className="community-platform-leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Score</th>
                    <th>Submissions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={user.id === currentUserId ? "current-user" : ""}
                      onClick={() => handleRowClick(user)}
                    >
                      <td>{index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.username}</td>
                      <td>{user.userScore}</td>
                      <td>{submissionsCount[user.id] || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No active users found with submissions!</p>
            )}
          </div>
        </div>

         {/* Pagination Controls */}
         <div className="pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      <div className="profile-card">
  {selectedUser ? (
    <div>
      <div className="current-user-profile-info">
        {selectedUser.avatar && (
          <img
            src={selectedUser.avatar}
            alt="Avatar"
            style={{ width: "50px", height: "50px" }}
          />
        )}
        <div>
          <h2>{selectedUser.name}</h2>
          <p>@{selectedUser.username}</p>
        </div>
        <div>
          <div className="badges">
            <span className="badge total-score">
              Score: {selectedUser.userScore || 0}
            </span>
          </div>
        </div>
      </div>
      {submissionsCount[selectedUser.id] > 0 ? (
        <div className="submissions">
          <p>Submissions: {submissionsCount[selectedUser.id] || 0}</p>
        </div>
      ) : null}

      <div className="communities">
        <h3 style={{ marginBottom: "10px" }}>Communities:</h3>
        {userCommunities.length > 0 ? (
          <ul>
            {userCommunities.map((community) => (
              <div
                key={community.id}
                style={{
                  backgroundColor: "#000",
                  borderRadius: "10px",
                  padding: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {community.communityName} (
                {community.adminId === selectedUser.id ? "Admin" : "Member"})
                <div>
                  <button
                    style={{
                      fontSize: "12px",
                      marginLeft: "10px",
                      padding: "8px",
                    }}
                  >
                    Check assignment's
                  </button>
                </div>
              </div>
            ))}
          </ul>
        ) : (
          <p>You're not part of any communities.</p>
        )}
      </div>
    </div>
  ) : currentUser ? (
    <>
      <div
        className="current-user-profile-info"
        style={{ marginBottom: "10px" }}
      >
        {currentUser.avatar && (
          <img
            src={currentUser.avatar}
            alt="Avatar"
            style={{ width: "50px", height: "50px" }}
          />
        )}
        <div>
          <h2>{currentUser.name}</h2>
          <p>@{currentUser.username}</p>
        </div>
        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          {currentUserRank > 0 && (
            <div className="rank-badge">#{currentUserRank}</div>
          )}
          <div className="badges">
            <span className="badge total-score">
              Score: {currentUser.userScore || 0}
            </span>
          </div>
        </div>
      </div>
      {submissionsCount[currentUser.id] > 0 ? (
        <div className="submissions">
          <p>Submissions: {submissionsCount[currentUser.id] || 0}</p>
        </div>
      ) : (
        <div>
          <p>You haven't completed any assignments yet!</p>
        </div>
      )}
      
      <div className="communities">
        <h3 style={{ marginBottom: "10px" }}>Communities:</h3>
        {userCommunities.length > 0 ? (
          <ul>
            {userCommunities.map((community) => (
              <div
                key={community.id}
                style={{
                  backgroundColor: "#feb47b",
                  borderRadius: "10px",
                  padding: "5px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom:'10px'
                }}
              >
                {community.communityName} (
                {community.adminId === currentUser.id ? "Admin" : "Member"})
                <div>
                  <button
                    style={{
                      fontSize: "12px",
                      marginLeft: "10px",
                      padding: "8px",
                      backgroundColor:"#ff6347"
                    }}
                  >
                    Check assignment's
                  </button>
                </div>
              </div>
            ))}
          </ul>
        ) : (
          <p>You're not part of any communities.</p>
        )}
      </div>
    </>
  ) : null}
</div>

    </div>
  );
};

export default Leaderboard;
