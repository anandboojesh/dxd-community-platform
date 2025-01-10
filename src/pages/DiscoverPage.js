import React, { useState, useEffect } from "react";
import "../styles/components/DiscoverPage.css";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const DiscoverPage = () => {
  const [activeTab, setActiveTab] = useState("Home");
  const [activeSidebar, setActiveSidebar] = useState("Home");
  const [communities, setCommunities] = useState([]);

  const navigate = useNavigate();

  // Fetch communities from Firestore
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const communitiesCollection = collection(db, "communities");
        const snapshot = await getDocs(communitiesCollection);
        const fetchedCommunities = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCommunities(fetchedCommunities);
      } catch (error) {
        console.error("Error fetching communities:", error);
      }
    };

    fetchCommunities();
  }, []);

  const handleTabClick = (tab) => setActiveTab(tab);
  const handleSidebarClick = (item) => setActiveSidebar(item);

  return (
    <div className="discover-page">
      
      {/* Main Content */}
      <div className="main-content">
        {/* Banner */}
        <div className="banner">
          <h1>Find Your Community</h1>
          <p>Explore public communities from education, student hubs, and more.</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {["Home", "Education", "Student Hubs", "Science and Tech"].map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Featured Servers */}
        <div className="featured-section">
          <h2>Featured communities</h2>
          <div className="server-grid">
            {communities.map((community) => (
              <div className="server-card" key={community.id}  onClick={() => navigate(`/community/${community.communityId}`)}>
                <img
                  src={community.imgSrc || "https://via.placeholder.com/150"}
                  alt={community.communityName}
                />
                <p>{community.communityName}</p>
              </div>
            ))}
          </div>
          <div style={{padding:'40px'}}/>
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;
