import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import "../styles/components/viewCommunityPage.css";

const ViewCommunity = () => {
  const { communityId } = useParams();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [courses, setCourses] = useState([]);

  const navigate = useNavigate();

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

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const eventsQuery = query(
          collection(db, "community-events"),
          where("communityId", "==", communityId)
        );
        const querySnapshot = await getDocs(eventsQuery);
        const eventsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsList);
      } catch (error) {
        console.error("Error fetching events data:", error);
        alert(error);
      }
      setLoading(false);
    };

    const checkAuth = () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/');
      }
    };

    const fetchCourses = async () => {
      setLoading(true);
      try {
        const coursesQuery = query(
          collection(db, "community-courses"),
          where("communityId", "==", communityId)
        );
        const querySnapshot = await getDocs(coursesQuery);
        const coursesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(coursesList);
      } catch (error) {
        console.error("Error fetching courses data:", error);
        alert(error);
      }
      setLoading(false);
    };

    checkAuth();
    fetchCommunity();
    fetchCourses();
    fetchEvents();
  }, [communityId, navigate]);

  if (loading) return <div className="loading">Loading...</div>;

  if (!community) return <div className="community-not-found">Community not found</div>;

  return (
    <div className="view-community-page">
      {/* Banner Section */}
      <div className="view-community-banner">
        <div className="view-community-banner-content">
          <img
            src={community.profilePhoto || "/default-profile.jpg"}
            alt="Community Profile"
            className="view-community-banner-image"
          />
          <div className="view-community-info">
            <h1 className="view-community-name">{community.communityName}</h1>
            <p className="view-community-member-count">{community.member?.length || 0} Members</p>
            <button className="view-community-join-btn">Join Now</button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="view-community-about">
        <h2>About This Community</h2>
        <p>{community.communityDescription || "No description available for this community."}</p>
      </div>

      {/* Events Section */}
      <div className="view-community-events">
        <h2>Upcoming Events</h2>
        {events.length > 0 ? (
          <div className="view-community-event-grid">
            {events.slice(0, 4).map((event) => (
              <div className="view-community-event-card" key={event.id}>
                <h3 className="view-community-event-title">{event.title}</h3>
                <p className="view-community-event-type">{event.type}</p>
                <p className="view-community-event-date">
                  <strong>Date:</strong>{" "}
                  {new Date(event.startDate.seconds * 1000).toLocaleDateString()} -{" "}
                  {new Date(event.endDate.seconds * 1000).toLocaleDateString()}
                </p>
                <p className="view-community-event-timings">
                  <strong>Timings:</strong>{" "}
                  {new Date(event.startTime.seconds * 1000).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(event.endTime.seconds * 1000).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>No upcoming events for this community.</p>
        )}
        {events.length > 4 && (
          <div className="view-community-view-all-container">
            <button
              className="view-community-view-all-button"
              onClick={() => navigate(`/community/${communityId}/events`)}
            >
              View All Events
            </button>
          </div>
        )}

    

      </div>
          {/* Courses Section */}
<div className="view-community-courses">
  <h2>Available Courses</h2>
  {courses.length > 0 ? (
    <div className="view-community-course-grid">
      {courses.map((course) => (
        <div className="view-community-course-card" key={course.id}>
          <h3 className="view-community-course-title">{course.title}</h3>
          <p className="view-community-course-category">
            <strong>Category:</strong> {course.category}
          </p>
          <p className="view-community-course-description">
            {course.description.length > 200
              ? `${course.description.substring(0, 200)}...`
              : course.description}
          </p>
          <a
            href={course.link}
            target="_blank"
            rel="noopener noreferrer"
            className="view-community-course-link"
          >
            Watch Now
          </a>
        </div>
      ))}
    </div>
  ) : (
    <p>No courses available for this community.</p>
  )}
</div>
      <div style={{padding:'40px'}}/>
    </div>
  );
};

export default ViewCommunity;
