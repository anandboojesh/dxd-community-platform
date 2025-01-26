import React, { useState, useEffect } from "react";
import "../styles/components/DiscoverLightThemed.css";
import { db, auth } from "../services/firebase";
import { collection, doc, getDoc, getDocs, query } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaCog, FaLayerGroup, FaMapMarkerAlt, FaPersonBooth } from "react-icons/fa";

const LoadingSpinner = () => (
  <div className="spinner-container">
    <div className="spinner"></div>
  </div>
);


const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};



const DiscoverPage = () => {
  const [activeTab, setActiveTab] = useState("Home");
  const [communities, setCommunities] = useState([]);
  const [events, setEvents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [userDetails, setUserDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [hide, setHide] = useState("");

  // Filter communities based on the search query
const filteredCommunities = communities.filter((community) =>
  community.communityName.toLowerCase().includes(searchQuery.toLowerCase())
);

const filteredCourses = courses.filter((course) =>
  course.title.toLowerCase().includes(courseSearchQuery.toLowerCase())
);

const filteredEvents = events.filter((event) =>
  event.title.toLowerCase().includes(eventSearchQuery.toLowerCase())
);

  const currentUserUID = auth.currentUser?.uid;

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!currentUserUID) return; // Skip if no user is logged in

      try {
        const userDocRef = doc(db, "users", currentUserUID);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserDetails(userDoc.data());
        } else {
          console.error("User not found in Firestore");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [currentUserUID]);

  const navigate = useNavigate();
  const itemsPerPage = 4;

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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching communities:", error);
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);




  const fetchEvents = async () => {
    try {
      const eventsCollection = collection(db, "community-events");
      const eventsQuery = query(
        eventsCollection, 
      );
      const snapshot = await getDocs(eventsQuery);
      const fetchedEvents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(fetchedEvents);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      alert(error)
      setLoading(false);
    }
  };

  useEffect (() => {
    fetchEvents()
  })


  const fetchCourses = async () => {
    try {
      const snapshot = await getDocs(collection(db, "community-courses"));
      const fetchedCourses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCourses(fetchedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect (() => {
    fetchCourses()
  })

  const totalPages = Math.ceil(communities.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const displayedCommunities = communities.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handleCommunityClick = (communityId) => {
    navigate(`/viewCommunity/${communityId}`);
  };


  return (
    <div  className={`discover-page ${currentUserUID ? "authenticated" : ""}`}>
      {hide && (
      <div className="discover-sidebar">
        <ul>
          {currentUserUID ? (
            <>
              <li onClick={() => navigate("/profile")}>Profile</li>
              <li onClick={() => navigate("/my-communities")}>My Communities</li>
              <li onClick={() => navigate("/leaderboard")}>Leaderboard</li>
            </>
          ) : (
            <>
              <li onClick={() => navigate("/login")}>Login</li>
              <li onClick={() => navigate("/signup")}>Sign Up</li>
            </>
          )}
        </ul>

        {userDetails && (
          <div className="discover-profile-details">
            <img
              className="discover-profile-avatar"
              src={userDetails.avatar|| auth.currentUser?.photoURL || "https://via.placeholder.com/50"}
              alt="User Avatar"
            />
            <div className="discover-profile-text">
              <p className="discover-profile-name">{userDetails.name || "Unknown User"}</p>
              <p className="discover-profile-username">@{userDetails.username || "unknown"}</p>
            </div>
            <FaCog />
          </div>
          
        )}
      </div>)}

      {/* Main Content */}
      <div className="discover-main-content">
        {/* Banner */}
        <div className="discover-banner">
          <h1>Find Your Community</h1>
          <p>Explore public communities from education, student hubs, and more.</p>
        </div>

        {/* Tabs */}
        <div className="discover-tabs">
          {["Home", "Communities", "Events", "Courses"].map((tab) => (
            <button
              key={tab}
              className={`discover-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

{activeTab === "Communities" && (
  <div className="discover-communities-tab">
    <div className="discover-search-bar">
      <input
        type="text"
        placeholder="Search communities..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="discover-search-input"
      />
    </div>
    {loading ? (
      <LoadingSpinner />
    ) : (
      <div className="discover-communities-grid">
        {filteredCommunities.map((community) => (
          <div
            className="discover-community-card"
            key={community.id}
            onClick={() =>
              currentUserUID
                ?  handleCommunityClick(community.communityId)
                : navigate("/login")
            }
          >
            <img
              src={community.profilePhoto || "https://via.placeholder.com/150"}
              alt={community.communityName}
              className="discover-community-image"
            />
            <p className="discover-community-name">{community.communityName}</p>
          </div>
        ))}
      </div>
    )}

  </div>
)}

{activeTab === "Courses" && (
          <div className="discover-courses-tab">
            <div className="discover-search-bar">
              <input
                type="text"
                placeholder="Search courses..."
                value={courseSearchQuery}
                onChange={(e) => setCourseSearchQuery(e.target.value)} // Update courseSearchQuery state
                className="discover-search-input"
              />
            </div>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="discover-course-grid">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="discover-course-card"
                    onClick={() =>
                      currentUserUID
                        ? navigate(`/course/${course.id}`)
                        : navigate("/login")
                    }
                  >
                    <div className="discover-course-card-header">
                      <h3>{course.title}</h3>
                    </div>
                    {course.category && (
                      <span className="discover-course-type">{course.category}</span>
                    )}
                    <div className="discover-course-card-details">
                      {/* Optionally display other course details here */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


{activeTab === "Events" && (
  <div className="discover-events-tab">
    <div className="discover-search-bar">
      <input
        type="text"
        placeholder="Search events..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="discover-search-input"
      />
    </div>
    {loading ? (
      <LoadingSpinner />
    ) : (
      <div className="discover-events-grid">
        {filteredEvents
          .filter((event) =>
            event.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 16) // limit to 16 events for 4x4 grid
          .map((event) => (
            <div
              key={event.id}
              className="discover-event-card"
              onClick={() =>
                currentUserUID
                  ? navigate(`/event/${event.id}`)
                  : navigate("/login")
              }
            >
              <div className="discover-event-card-header">
                <h3>{event.title}</h3>
                <span className="discover-event-type">{event.type}</span>
              </div>
              <div className="discover-event-card-details">
                <div className="discover-event-detail">
                  <FaCalendarAlt className="event-icon" color="#ffff" />
                  <span style={{ color: "#000" }}>{formatDate(event.startDate)}</span>
                </div>
                <div className="discover-event-detail">
                  <FaClock className="event-icon" color="#ffff" />
                  <span style={{ color: "#000" }}>
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </span>
                </div>
                <div className="discover-event-detail">
                  <FaLayerGroup className="event-icon" color="#ffff" />
                  <span style={{ color: "#000" }}>{event.communityName}</span>
                </div>
              </div>
            </div>
          ))}
      </div>
    )}
  </div>
)}


        
        {activeTab === "Home" && (
          <>
            {/* Featured Communities Section remains the same */}
            <div className="featured-section">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2>Featured communities</h2>
                <p className="discover-view-all"  onClick={() => setActiveTab("Communities")} >View all</p>
              </div>
              {loading ? (
                <LoadingSpinner />
              ) : (
                <div style={{ display: "flex", padding: "20px" }}>
                  <div className="server-grid">
                    {displayedCommunities.map((community) => (
                      <div
                        className="server-card"
                        key={community.id}
                        onClick={() =>
                          currentUserUID 
                            ? navigate(`/community/${community.communityId}`)
                            : navigate("/login")
                        }
                      >
                        <img
                          src={
                            community.profilePhoto ||
                            "https://via.placeholder.com/150"
                          }
                          alt={community.communityName}
                        />
                        <p>{community.communityName}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* New Events for You Section */}
            <div className="discover-events-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px" }}>
                <h2>Events for You</h2>
                <p onClick={() => setActiveTab("Events")} style={{cursor: "pointer"}} className="discover-view-all">View all</p>
              </div>
              {loading ? (
                <LoadingSpinner />
              ) : (
                <div className="discover-events-grid">
                  {events.map((event) => (
                    <div 
                      key={event.id} 
                      className="discover-event-card"
                      onClick={() => 
                        currentUserUID 
                          ? navigate(`/event/${event.id}`)
                          : navigate("/login")
                      }
                    >
                      <div className="discover-event-card-header">
                        <h3>{event.title}</h3>
                        <span className="discover-event-type">{event.type}</span>
                      </div>
                      <div className="discover-event-card-details">
                        <div className="discover-event-detail">
                          <FaCalendarAlt className="event-icon" color="#ffff"/>
                          <span style={{color:'#000',}}>{formatDate(event.startDate)}</span>
                        </div>
                        <div className="discover-event-detail">
                          <FaClock className="event-icon" color="#ffff"/>
                          <span style={{color:'#000',}}>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                        </div>
                        <div className="discover-event-detail">
                          <FaLayerGroup className="event-icon" color="#ffff" />
                          <span style={{color:'#000'}}>{event.communityName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
            </div>

            <div className="discover-course-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px" }}>
                <h2>Courses for You</h2>
                <p onClick={() => setActiveTab("Courses")} style={{cursor: "pointer"}} className="discover-view-all" >View all</p>
              </div>
              {loading ? (
                <LoadingSpinner />
              ) : (
                <div className="discover-course-grid">
                  {courses.map((course) => (
                    <div 
                      key={course.id} 
                      className="discover-course-card"
                      onClick={() => 
                        currentUserUID 
                          ? navigate(`/event/${course.id}`)
                          : navigate("/login")
                      }
                    >
                      <div className="discover-course-card-header">
                        <h3>{course.title}</h3>
                      </div>
                      {course.category && (
                      <span className="discover-course-type">{course.category}</span>)}
                      <div className="discover-course-card-details">
                        
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
            </div>
          </>
        )}
        <div style={{ padding: "40px" }} />
      </div>
    </div>
  );
};

export default DiscoverPage;