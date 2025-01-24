import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import "../styles/components/viewCommunityPage.css";

const ViewCommunity = () => {
  const { communityId } = useParams(); // Get communityId from URL
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook to navigate to homepage if not authenticated

  useEffect(() => {
    const fetchCommunity = async () => {
      setLoading(true);
      try {
        const communityDoc = await getDoc(doc(db, "communities", communityId));
        if (communityDoc.exists()) {
          setCommunity(communityDoc.data());
        } else {
          console.error("Community not found!");
        }
      } catch (error) {
        console.error("Error fetching community data:", error);
        alert(error);
      }
      setLoading(false);
    };

    const checkAuth = () => {
      // Check if the user is authenticated
      const user = auth.currentUser;
      if (!user) {
        // Redirect to homepage if not authenticated
        navigate('/');
      }
    };

    checkAuth(); // Check authentication on component mount
    fetchCommunity(); // Fetch community data

  }, [communityId, navigate]);

  if (loading) return <div>Loading...</div>;

  if (!community) return <div>Community not found</div>;

  return (
    <div className="view-community-page">
      {/* Top Banner Section */}
      <div
        className="view-community-community-banner"
        style={{
          backgroundImage: `url(${community.banner || require('../pages/assets/default-community-banner.jpeg')})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="view-community-community-header">
          <img
            src={community.profilePhoto || "/default-profile.jpg"}
            alt="view-community-Community Profile"
            className="view-community-community-profile-photo"
          />
          <div className="view-community-community-info">
            <h1 className="view-community-community-name">{community.communityName}</h1>
            <p className="view-community-community-members">
              {community.member?.length || 0} members
            </p>
            <button className="view-community-join-button">Join Now</button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="view-community-about-section">
        <h2>About the Community</h2>
        <p>{community.communityDescription}</p>
      </div>
    </div>
  );
};

export default ViewCommunity;
