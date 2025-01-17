import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { FaUserShield, FaUser, FaUsers, FaCog, FaTrash, FaBell, FaEllipsisV } from "react-icons/fa";
import "../styles/components/MyCommunities.css";
import { useNavigate } from "react-router-dom";

const MyCommunities = () => {
  const [communities, setCommunities] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setCurrentUser(user);
        const communitiesRef = collection(db, "communities");

        // Fetch communities where the user is the admin
        const adminQuery = query(communitiesRef, where("adminId", "==", user.uid));
        const adminSnapshot = await getDocs(adminQuery);
        const adminCommunities = adminSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch communities where the user is a member
        const memberQuery = query(communitiesRef, where("member", "array-contains", user.uid));
        const memberSnapshot = await getDocs(memberQuery);
        const memberCommunities = memberSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Combine the two lists and remove duplicates
        const combinedCommunities = [
          ...adminCommunities,
          ...memberCommunities.filter(
            (memberCommunity) =>
              !adminCommunities.some((adminCommunity) => adminCommunity.id === memberCommunity.id)
          ),
        ];

        setCommunities(combinedCommunities);
      }
    };

    fetchUserData();
  }, []);

  const handleEditCommunity = (communityId) => {
    navigate(`/community/${communityId}/edit`);
  };

  const handleDeleteCommunity = async (communityId) => {
    if (window.confirm("Are you sure you want to delete this community?")) {
      // Call the Firebase delete function here
      console.log("Deleting community:", communityId);
      // Add delete logic here
    }
  };

  const handleManageMembers = (communityId) => {
    navigate(`/community/${communityId}/members`);
  };

  return (
    <div className="communities-container">
        <nav className="community-navbar" >
                <div className="community-navbar-left">
                <h1 style={{marginTop:'10px'}}>My Communities</h1>
                </div>
                <div className="community-navbar-right">
                  <FaBell className="navbar-icon" title="Announcements" />
                  <FaEllipsisV className="navbar-icon" title="More Options" />
                </div>
              </nav>
      <div className="my-communities-main-content">
          
     
        <div className="grid-container">
          {communities.map((community) => (
            <div className="community-card" key={community.id} onClick={() => navigate(`/community/${community.communityId}`)}>
                <div style={{justifyContent:'flex-end', display:'flex', flexDirection:'row'}}>
                {community.adminId === currentUser?.uid && (
                    <>
                    <FaCog style={{marginRight:'10px'}} size={20} onClick={() => navigate(`/community/${community.communityId}/manage`)}/>
                    <FaTrash size={20}  onClick={(e) => { e.stopPropagation(); handleDeleteCommunity(community.id); }}/>
                    </>)}
                </div>
              <img
                src={community.profilePhoto || "default_photo_url"}
                alt={`${community.communityName} logo`}
                className="community-photo"
              />
              <h2>{community.communityName}</h2>
              <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
                <FaUsers size={20} /> 
                <p style={{margin:'10px', textAlign:'center', fontWeight:'bold', color:'#fff'}}>{community.member?.length || 0}  Members</p>
              </div>
              <p>{community.communityDescription}</p>
             
              {community.adminId === currentUser?.uid ? (
                <>
                  <span className="badge admin-badge">
                    <FaUserShield /> Admin
                  </span>
                </>
              ) : (
                <span className="badge member-badge">
                  <FaUser /> Member
                </span>
              )}
            </div>
          ))}
          <div style={{ padding: "40px" }} />
        </div>
      </div>
    </div>
  );
};

export default MyCommunities;
