import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/components/CommunityPage.css";
import { auth, db, } from "../services/firebase";
import { doc, getDoc, collection, getDocs, serverTimestamp, setDoc, addDoc, updateDoc, arrayUnion, deleteDoc, writeBatch, where, query, onSnapshot } from "firebase/firestore";
import { FaBell, FaCalendarAlt, FaDownload, FaEdit, FaEllipsisV, FaPaperPlane, FaTrash, FaUsers, } from "react-icons/fa";
import { ref, } from "firebase/database";
import { CloudinaryContext, Image, Video, Transformation } from 'cloudinary-react';
import jsPDF from "jspdf";
import { gapi } from "gapi-script";
import Calendar from "react-calendar/dist/cjs/Calendar.js";
import ReactDatePicker from "react-datepicker";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,CategoryScale,LinearScale,BarElement,Title,Tooltip,Legend,ArcElement,PointElement,LineElement, // Import LineElement
} from "chart.js";

ChartJS.register(
  CategoryScale,LinearScale,BarElement,Title,Tooltip,Legend,ArcElement,PointElement,LineElement // Register LineElement for the Line chart
);

const meeting_thumbnail = require('./assets/meeting_thumbnail.jpg');

const LoadingSpinner = () => (
  <div className="spinner-container">
    <div className="spinner"></div>
  </div>
);

const CommunityPage = () => {
  const { communityId } = useParams(); // Get community ID from URL
  const [activeSection, setActiveSection] = useState("Rules");
  const [isAdmin, setIsAdmin] = useState(false); // Track if the user is an admin
  const  [AdminID, setAdminID] = useState("");
  const [isMember, setIsMember] = useState(false);
  const [communityName, setCommunityName] = useState(""); // State to store the community name
  const [rules, setRules] = useState([]); // State to store community rules
  const [rulesLoaded, setRulesLoaded] = useState(false); // Track if rules are loaded
  const [newRule, setNewRule] = useState(""); // For adding new rules
  const [editingRule, setEditingRule] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [taskPoints, setTaskPoints] = useState(0)
  const [submissionType, setSubmissionType] = useState("link");
  const [submissionValue, setSubmissionValue] = useState("");
  const [file, setFile] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false); // State for assignment modal
  const [assignmentLink, setAssignmentLink] = useState(""); // State for assignment link
  const [submissions, setSubmissions] = useState([]); // State to store submissions
  const [submissionsLoaded, setSubmissionsLoaded] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]); // State to store leaderboard data
  const [loading, setLoading] = useState(false);  // State to track loading status
  const [errorMessage, setErrorMessage] = useState(null);
  const [showResubmitModal, setShowResubmitModal] = useState(false); // Modal state
  const [selectedSubmission, setSelectedSubmission] = useState(null); // Selected submission for resubmit
  const [newAssignmentLink, setNewAssignmentLink] = useState(""); // New link for resubmission
  const [editingFeedbackId, setEditingFeedbackId] = useState(null); // ID of the submission being edited
  const [newFeedback, setNewFeedback] = useState(""); // New feedback text
  const [announcements, setAnnouncements] = useState([]); // Store announcements
  const [newAnnouncement, setNewAnnouncement] = useState(""); // Store input text
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseLink, setCourseLink] = useState("");
  const [courseFile, setCourseFile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [events, setEvents] = useState([]);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("webinar");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showCustomEventType, setShowCustomEventType] = useState(false);
  const [customEventType, setCustomEventType] = useState("");
  const [lastRegistrationDate, setLastRegistrationDate] = useState("");
  const [rewards, setRewards] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingEventId, setEditingEventId] = useState(null);
  const [CourseCategory, setCourseCategory] = useState("AI"); // Default category
  const [searchCourse, setSearchCourse] = useState("");
const [filterCourseCategory, setFilterCourseCategory] = useState("All"); // Default filter
  const [ShowRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null); // Track the selected event ID
  const [searchUser, setSearchUser] = useState("");
  const [totalMembers, setTotalMembers] = useState(0);
const [activeMembers, setActiveMembers] = useState(0);
const [newMembers, setNewMembers] = useState(0);
const [engagementRate, setEngagementRate] = useState(0);
const [contentPerformance, setContentPerformance] = useState({
  announcements: 0,
  tasksCompleted: 0,
  eventParticipation: 0,
});
const [coursePerformance, setCoursePerformance] = useState([]);
const [eventAnalytics, setEventAnalytics] = useState({
  totalEvents: 0,
  totalRegistrations: 0,
  avgParticipation: 0,
});
const [taskAnalytics, setTaskAnalytics] = useState({
  totalTasks: 0,
  tasksCompleted: 0,
  completionRate: 0,
  totalSubmissions: 0,
  totalPoints: 0,
  totalPointsEarned: 0,
});
const [showMoreOptions, setShowMoreOptions] = useState(false);

const toggleMoreOptions = () => setShowMoreOptions((prev) => !prev);



const handleDeleteCommunity = () => {
  if (window.confirm("Are you sure you want to delete this community?")) {
    alert("Community deleted!");
  }
};

const handleLeaveCommunity = () => {
  alert("Left the community!");
};

const handleManageCommunity = () => {
  alert("Navigating to manage community page...");
  navigate(`/community/${communityId}/manage`);
};


const [selectedAnalytics, setSelectedAnalytics] = useState("Member Engagement");

const handleAnalyticsChange = (event) => {
  setSelectedAnalytics(event.target.value);
};

const [isReportModalOpen, setIsReportModalOpen] = useState(false);
const [selectedIssue, setSelectedIssue] = useState("");
const [issueDescription, setIssueDescription] = useState("");

const handleReportCommunity = () => setIsReportModalOpen(true);
const handleCloseReportModal = () => {
  setIsReportModalOpen(false);
  setSelectedIssue("");
  setIssueDescription("");
};

const handleSubmitReport = async () => {
  if (!selectedIssue || !issueDescription.trim()) {
    alert("Please select an issue and provide a detailed description.");
    return;
  }

  try {
    const userId = auth.currentUser?.uid; // Get the current user ID
    if (!userId) {
      alert("You must be logged in to submit a report.");
      return;
    }

    const reportId = `report-${Date.now()}-${Math.floor(Math.random() * 10000)}`; // Generate unique report ID
    const timestamp = serverTimestamp(); // Get the current timestamp

    const reportData = {
      reportId,
      issue: selectedIssue,
      description: issueDescription.trim(),
      communityId,
      communityName,
      adminId: AdminID,
      timestamp,
      userId,
    };

    // Add the report to the "community-reports" collection
    await addDoc(collection(db, "community-reports"), reportData);

    alert("Report submitted successfully!");
    handleCloseReportModal(); // Close the modal
  } catch (error) {
    console.error("Error submitting report:", error);
    alert("Failed to submit the report. Please try again.");
  }
};







useEffect(() => {
  if (activeSection === "Analytics") {
    const fetchMemberEngagement = async () => {
      try {
        const communityRef = doc(db, "communities", communityId);
        const communityDoc = await getDoc(communityRef);

        if (communityDoc.exists()) {
          const members = communityDoc.data().member || [];
          setTotalMembers(members.length);

          // Fetch last active timestamps and calculate active members
          const activeMemberPromises = members.map(async (memberId) => {
            const userRef = doc(db, "users", memberId);
            const userDoc = await getDoc(userRef);
            const lastActive = userDoc.data()?.lastActive?.toDate() || new Date(0);

            // Consider a member active if they've been online in the past 7 days
            return (new Date() - lastActive) / (1000 * 60 * 60 * 24) <= 7;
          });

          const activeStatus = await Promise.all(activeMemberPromises);
          setActiveMembers(activeStatus.filter(Boolean).length);

          // Fetch new members (joined in the last 30 days)
          const newMemberCount = members.filter((memberId) => {
            const joinedDate = userDoc.data()?.joinedDate?.toDate() || new Date(0);
            return (new Date() - joinedDate) / (1000 * 60 * 60 * 24) <= 30;
          }).length;
          setNewMembers(newMemberCount);

          // Calculate engagement rate
          const rate = ((activeStatus.filter(Boolean).length / members.length) * 100).toFixed(2);
          setEngagementRate(rate);
        }
      } catch (error) {
        console.error("Error fetching member engagement data:", error);
      }
    };

    const fetchContentPerformance = async () => {
      try {
        // Fetch announcements count
        const announcementsRef = collection(db, "community-announcement");
        const announcementsQuery = query(
          announcementsRef,
          where("communityId", "==", communityId)
        );
        const announcementsSnapshot = await getDocs(announcementsQuery);
        const announcementsCount = announcementsSnapshot.size;

        // Fetch completed tasks count
        const tasksRef = collection(db, "community-assignment-submission");
        const tasksQuery = query(
          tasksRef,
          where("communityId", "==", communityId),
          where("assignmentStatus", "==", "Complete")
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        const tasksCompletedCount = tasksSnapshot.size;

        // Fetch event participation count
        const eventsRef = collection(db, "community-events");
        const eventsQuery = query(eventsRef, where("communityId", "==", communityId));
        const eventsSnapshot = await getDocs(eventsQuery);

        let eventParticipationCount = 0;
        eventsSnapshot.docs.forEach((doc) => {
          eventParticipationCount += doc.data()?.subscribers?.length || 0;
        });

        // Update state
        setContentPerformance({
          announcements: announcementsCount,
          tasksCompleted: tasksCompletedCount,
          eventParticipation: eventParticipationCount,
        });

        
      } catch (error) {
        console.error("Error fetching content performance data:", error);
      }
    };

    const fetchCoursePerformance = async () => {
      try {
        const coursesRef = collection(db, "community-courses");
        const q = query(coursesRef, where("communityId", "==", communityId));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const performanceData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              title: data.title || "Unnamed Course",
              enrollments: data.enrollments || 0,
              completionRate: data.completionRate || 0, // Example field
            };
          });

          setCoursePerformance(performanceData);
        }
      } catch (error) {
        console.error("Error fetching course performance data:", error);
      }
    };

    const fetchEventAnalytics = async () => {
      try {
        const eventsRef = collection(db, "community-events");
        const eventsQuery = query(eventsRef, where("communityId", "==", communityId));
        const eventsSnapshot = await getDocs(eventsQuery);

        let totalEventsCount = 0;
        let totalRegistrationsCount = 0;

        eventsSnapshot.docs.forEach((doc) => {
          totalEventsCount += 1;
          totalRegistrationsCount += doc.data()?.subscribers?.length || 0;
        });

        const avgParticipationRate =
          totalEventsCount > 0 ? (totalRegistrationsCount / totalEventsCount).toFixed(2) : 0;

        // Update state
        setEventAnalytics({
          totalEvents: totalEventsCount,
          totalRegistrations: totalRegistrationsCount,
          avgParticipation: avgParticipationRate,
        });
      } catch (error) {
        console.error("Error fetching event analytics data:", error);
      }
    };

    const fetchTaskAnalytics = async () => {
      try {
        const tasksRef = collection(db, "community-tasks", communityId, "tasks");
        const tasksSnapshot = await getDocs(tasksRef);
    
        let totalTasksCount = 0;
        let tasksCompletedCount = 0;
        let totalSubmissionsCount = 0;
        let totalPoints = 0;
        let totalPointsEarned = 0;
    
        // Fetch tasks
        tasksSnapshot.docs.forEach((doc) => {
          totalTasksCount += 1;
        });
    
        // Fetch submissions and points from community-assignment-submission
        const submissionsRef = collection(db, "community-assignment-submission");
        const submissionsSnapshot = await getDocs(submissionsRef);
    
        submissionsSnapshot.docs.forEach((doc) => {
          const submissionData = doc.data();
    
          // Check if the submission is related to the current communityId
          if (submissionData?.communityId === communityId) {
            totalSubmissionsCount += 1;
            
            // Only count completed assignments
            if (submissionData?.assignmentStatus === "Complete") {
              tasksCompletedCount += 1;
            }
    
            totalPoints += parseInt(submissionData?.points || 0);
            totalPointsEarned += parseInt(submissionData?.rewardEarned || 0);
          }
        });
    
        // Calculate completion rate
        const completionRate =
          totalTasksCount > 0 ? ((tasksCompletedCount / totalTasksCount) * 100).toFixed(2) : 0;
    
        // Update state with all analytics
        setTaskAnalytics({
          totalTasks: totalTasksCount,
          tasksCompleted: tasksCompletedCount,
          completionRate,
          totalSubmissions: totalSubmissionsCount,
          totalPoints,
          totalPointsEarned,
        });
      } catch (error) {
        console.error("Error fetching task analytics data:", error);
      }
    };
    
    fetchTaskAnalytics();    
    fetchEventAnalytics();
    fetchCoursePerformance();
    fetchContentPerformance();
    fetchMemberEngagement();
  }
}, [activeSection, communityId]);

  const handlePromote = async (userId) => {
    try {
      // Update the "Moderators" field in the Firestore community document
      await updateDoc(doc(db, "communities", communityId), {
        Moderators: arrayUnion(userId),
      });
      alert("Member promoted to moderator.");
    } catch (error) {
      console.error("Error promoting member to moderator:", error);
      alert("Failed to promote the member.");
    }
  };
  
  const handleKick = async (userId) => {
    try {
      await updateDoc(doc(db, "communities", communityId), {
        member: arrayRemove(userId),
      });
      setMembers((prev) => prev.filter((member) => member.uid !== userId));
      alert("Member kicked from the community.");
    } catch (error) {
      console.error("Error kicking member:", error);
      alert("Failed to kick the member.");
    }
  };
  
  const handleBan = async (userId) => {
    try {
      await updateDoc(doc(db, "communities", communityId), {
        member: arrayRemove(userId),
        blockedUsers: arrayUnion(userId),
      });
      setMembers((prev) => prev.filter((member) => member.uid !== userId));
      alert("Member banned and added to blocked users.");
    } catch (error) {
      console.error("Error banning member:", error);
      alert("Failed to ban the member.");
    }
  };
  


const filteredCourses = courses.filter((course) => {
  const matchesSearch = course.title
    .toLowerCase()
    .includes(searchCourse.toLowerCase());
  const matchesCategory =
    filterCourseCategory === "All" || course.category === filterCourseCategory;
  return matchesSearch && matchesCategory;
});


const Course_Categories = [
  "AI", 
  "Robotics", 
  "Digital Marketing", 
  "Web Development", 
  "Data Science", 
  "Business", 
  "Finance", 
  "Graphic Design", 
  "Photography", 
  "Health & Fitness", 
  "Music", 
  "Personal Development", 
  "Teaching & Academics"
];


  const CLIENT_ID = "960353326099-8cjg184n3dpruud1r3ju66h2p3au7qat.apps.googleusercontent.com";
const API_KEY = "AIzaSyCAu251nw4im3YJZLyJUgJmZAF7jTICSh0";
const SCOPES = "https://www.googleapis.com/auth/drive.file";


const handleRegisterEvent = async (eventId, communityId, communityName, adminId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert("You must be logged in to register for this event.");
      return;
    }

    // Get form data
    const name = document.getElementById("full-name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const zip = document.getElementById("zipcode").value;

    // Validate inputs
    if (!name || !email || !phone || !address || !city || !state || !zip) {
      alert("Please fill in all fields.");
      return;
    }

    // Update community-events collection
    const eventRef = doc(db, "community-events", eventId);
    await updateDoc(eventRef, {
      subscribers: arrayUnion(userId), // Add userId to the subscribers array
    });

    // Add to event-registrations collection
    const registrationData = {
      userId,
      name,
      email,
      phone,
      address,
      city,
      state,
      zip,
      eventId,
      communityId,
      communityName,
      adminId,
      timestamp: serverTimestamp(),
    };
    await addDoc(collection(db, "event-registrations"), registrationData);

    alert("Successfully registered for the event!");
    setShowRegistrationModal(false); // Close modal
  } catch (error) {
    console.error("Error registering for event:", error);
    alert("Failed to register. Please try again.");
  }
};



useEffect(() => {
  if (activeSection === "Events") {
    const fetchEvents = async () => {
      try {
        const eventsRef = collection(db, "community-events");
        const q = query(eventsRef, where("communityId", "==", communityId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedEvents = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setEvents(fetchedEvents);
        });
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }
}, [activeSection, communityId]);

const handleEditEvent = (event) => {
  setEditingEventId(event.id); // Set the event ID to be edited
  setEventTitle(event.title);
  setEventDescription(event.description);
  setEventType(event.type);
  setStartDate(event.startDate?.toDate().toISOString().split("T")[0] || "");
  setEndDate(event.endDate?.toDate().toISOString().split("T")[0] || "");
  setStartTime(
    event.startTime?.toDate().toISOString().split("T")[1]?.substring(0, 5) || ""
  );
  setEndTime(
    event.endTime?.toDate().toISOString().split("T")[1]?.substring(0, 5) || ""
  );
  setLastRegistrationDate(
    event.lastRegistrationDate?.toDate().toISOString().split("T")[0] || ""
  );
  setShowAddEventModal(true); // Open modal for editing
};

const handleAddEvent = async () => {
  if (!eventTitle || !eventDescription || !startDate || !lastRegistrationDate) {
    alert("Please fill in all required fields.");
    return;
  }

  try {
    const eventData = {
      title: eventTitle,
      description: eventDescription,
      type: eventType === "custom" ? customEventType : eventType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      // Parse local times correctly
      startTime: startTime
        ? new Date(`${startDate}T${startTime}:00`)
        : null, // Ensure date + time is combined
      endTime: endTime
        ? new Date(`${endDate || startDate}T${endTime}:00`)
        : null,
      lastRegistrationDate: new Date(lastRegistrationDate),
      rewards,
      communityId,
      timestamp: serverTimestamp(),
      communityName,
      AdminID,
    };

    if (editingEventId) {
      // Update existing event
      const eventDocRef = doc(db, "community-events", editingEventId);
      await updateDoc(eventDocRef, eventData);

      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === editingEventId ? { ...event, ...eventData } : event
        )
      );
      alert("Event updated successfully!");
    } else {
      // Add a new event
      const newEventDocRef = await addDoc(collection(db, "community-events"), eventData);

      setEvents((prevEvents) => [
        ...prevEvents,
        { id: newEventDocRef.id, ...eventData },
      ]);

      alert("Event created successfully!");
    }

    // Reset the form
    setEventTitle("");
    setEventDescription("");
    setEventType("");
    setCustomEventType("");
    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setLastRegistrationDate("");
    setRewards("");
    setEditingEventId(null); // Clear editing mode
    setShowAddEventModal(false); // Close modal
  } catch (error) {
    console.error("Error adding/updating event:", error);
    alert("Failed to add/update event. Please try again.");
  }
};



const handleCloseAddEventModal = () => {
  setEventTitle("");
  setEventDescription("");
  setEventType("");
  setCustomEventType("");
  setStartDate("");
  setEndDate("");
  setStartTime("");
  setEndTime("");
  setLastRegistrationDate("");
  setRewards("");
  setEditingEventId(null); // Clear editing mode
  setShowAddEventModal(false);
};



const handleDeleteEvent = async (eventId) => {
  if (window.confirm("Are you sure you want to delete this event?")) {
    try {
      await deleteDoc(doc(db, "community-events", eventId));
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
      alert("Event deleted successfully!");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete the event. Please try again.");
    }
  }
};

const renderVideoPlayer = (link, courseId) => {
  if (!link) return null;

  if (link.includes("youtube.com") || link.includes("youtu.be")) {
    const embedLink = link.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/");
    return (
      <div>
        <img
          src={getYouTubeThumbnail(link)}
          alt="YouTube Thumbnail"
          style={{ width: "100%", maxWidth: "480px", borderRadius: "10px", cursor: "pointer" }}
         
        />
         <div style={{alignItems:'center', display:'flex', flexDirection:'column', marginTop:'10px'}}>
        <button style={{display: "inline-block",
                    padding: "10px 20px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    borderRadius: "5px",
                    textDecoration: "none",}}
                    onClick={() => navigate(`/course/${courseId}`)}
                    >watch course</button>
                    </div>
      </div>
    );
  } else if (link.includes("zoom.us")) {
    const meetingID = link.split("/j/")[1]?.split("?")[0];
    const embedLink = `https://zoom.us/wc/${meetingID}/join`;
    return (
      <div>
        <img
          src={meeting_thumbnail}
          alt="Join Zoom Meeting"
          style={{ width: "100%", maxWidth: "300px", borderRadius: "10px", cursor: "pointer" }}
        />
        <div style={{alignItems:'center', display:'flex', flexDirection:'column'}}>
        <p style={{ marginBottom:'10px' }}>
          Click to join the zoom meeting
        </p>
        <button style={{display: "inline-block",
                    padding: "10px 20px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    borderRadius: "5px",
                    textDecoration: "none",}}
                    onClick={() => navigate(`/course/${courseId}`)}
                    >Join Meeting</button>
                    </div>
      </div>
    );
  } else if (link.includes("meet.google.com")) {
    // Show a button to join the Google Meet
    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            <img
                src={meeting_thumbnail}
                alt="Google Meet"
                style={{ width: "100%", maxWidth: "300px", borderRadius: "10px", cursor: "pointer" }}
            />
            <p style={{ marginBottom: "10px" }}>Click below to join the Google Meet:</p>
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: "inline-block",
                    padding: "10px 20px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    borderRadius: "5px",
                    textDecoration: "none",
                }}
            >
                Join Meeting
            </a>
        </div>
    );
} else {
    return <p>Unsupported video link</p>;
  }
};




const getYouTubeThumbnail = (url) => {
  try {
    // Extract the YouTube Video ID
    const videoID = url.includes("v=")
      ? url.split("v=")[1]?.split("&")[0]
      : url.includes("youtu.be/")
      ? url.split("youtu.be/")[1]?.split("?")[0]
      : null;

    // Return the thumbnail URL or a fallback image
    return videoID
      ? `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`
      : "https://via.placeholder.com/480x360?text=Thumbnail+Unavailable";
  } catch (error) {
    console.error("Error generating YouTube thumbnail:", error);
    alert(error)
    // Fallback thumbnail if URL parsing fails
    return "https://via.placeholder.com/480x360?text=Thumbnail+Unavailable";
  }
};


const initGoogleDrive = () => {
  gapi.load("client:auth2", async () => {
    try {
      await gapi.client.init({
        apiKey: "AIzaSyCAu251nw4im3YJZLyJUgJmZAF7jTICSh0",
        clientId: "664226390519-5mva9decdm9tin40vqbbr2ne598rne4c.apps.googleusercontent.com",
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





  useEffect(() => {
    const coursesCollection = collection(db, "community-courses");
    const q = query(coursesCollection, where("communityId", "==", communityId)); // Filter by communityId
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const coursesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        showFullDescription: false,
      }));
      setCourses(coursesList);
    }, (error) => {
      console.error("Error fetching courses:", error);
    });


   
  
    
  
    // Clean up listener on component unmount
    return () => unsubscribe();
  }, []);
  


  const toggleDescription = (id) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === id
          ? { ...course, showFullDescription: !course.showFullDescription }
          : course
      )
    );
  };

  const handleEditCourse = (course) => {
    setEditingCourseId(course.id); // Track the course ID being edited
    setCourseTitle(course.title);
    setCourseDescription(course.description);
    setCourseLink(course.link);
    setCourseFile(null); // Leave this empty or handle separately for file updates
    setShowAddCourseModal(true); // Open the modal
  };
  

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await deleteDoc(doc(db, "community-courses", courseId));
        setCourses((prevCourses) => prevCourses.filter((course) => course.id !== courseId));
        alert("Course deleted successfully!");
      } catch (error) {
        console.error("Error deleting course:", error);
        alert("Failed to delete the course. Please try again.");
      }
    }
  };
  
  

  const handleOpenAddCourseModal = () => setShowAddCourseModal(true);
  const handleCloseAddCourseModal = () => {
    setShowAddCourseModal(false);
    setCourseTitle("");
    setCourseDescription("");
    setCourseLink("");
    setCourseFile(null);
    setEditingCourseId(null); // Clear editing state
  };
  
  const handleAddCourseSubmit = async () => {
    if (!courseTitle || !courseDescription) {
      alert("Please fill in the course title and description.");
      return;
    }
  
    try {
      let fileURL = null;
      let fileName = null;
      let fileDownload = null;
  
      if (courseFile) {
        const fileId = await uploadFileToGoogleDrive(courseFile);
        fileURL = `https://drive.google.com/file/d/${fileId}/view`;
        fileDownload = `https://drive.usercontent.google.com/u/0/uc?id=${fileId}&export=download`;
        fileName = courseFile.name; // Extract the file name
      }
  
      const courseData = {
        title: courseTitle.trim(),
        description: courseDescription.trim(),
        category:CourseCategory, 
        link: courseLink ? courseLink.trim() : null,
        fileURL,
        fileName,
        fileDownload,
        timestamp: serverTimestamp(),
        communityId,
        communityName,
        AdminID
      };
  
      if (editingCourseId) {
        // Update existing course
        const courseDocRef = doc(db, "community-courses", editingCourseId);
        await updateDoc(courseDocRef, courseData);
  
        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course.id === editingCourseId ? { ...course, ...courseData } : course
          )
        );
        alert("Course updated successfully!");
      } else {
        // Add a new course
        const courseId = `course-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const courseDocRef = doc(db, "community-courses", courseId);
        await setDoc(courseDocRef, courseData);
  
        setCourses((prevCourses) => [...prevCourses, { id: courseId, ...courseData }]);
        alert("Course added successfully!");
      }
  
      handleCloseAddCourseModal();
      setEditingCourseId(null);
    } catch (error) {
      console.error("Error submitting course:", error);
      alert(error);
    }
  };
  






  useEffect(() => {
    if (activeSection !== "Announcements") return;
  
    const fetchAnnouncements = () => {
      try {
        const announcementsRef = collection(db, "community-announcement");
        const q = query(
          announcementsRef,
          where("communityId", "==", communityId),
        );
  
        // Set up Firestore listener
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const fetchedAnnouncements = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setAnnouncements(fetchedAnnouncements);
          },
          (error) => {
            console.error("Error listening to announcements:", error);
          }
        );
  
        // Return cleanup function to unsubscribe
        return unsubscribe;
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };
  
    const unsubscribe = fetchAnnouncements();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [communityId, activeSection]);

  
  const handlePostAnnouncement = async () => {
    if (!newAnnouncement.trim()) {
      alert("Announcement cannot be empty.");
      return;
    }
  
    try {
      const announcementData = {
        announcement: newAnnouncement.trim(),
        timestamp: serverTimestamp(),
        communityId,
        adminId: auth.currentUser?.uid,
        communityName,
      };
  
      // Add to Firestore
      await addDoc(collection(db, "community-announcement"), announcementData);
  
      // Update local state
      setAnnouncements((prev) => [
        { ...announcementData, timestamp: new Date() },
        ...prev,
      ]);
  
      setNewAnnouncement(""); // Clear input
    } catch (error) {
      console.error("Error posting announcement:", error);
      alert("Failed to post the announcement. Please try again.");
    }
  };
  


  const handleEditFeedback = (submission) => {
    setEditingFeedbackId(submission.id); // Set the ID of the submission being edited
    setNewFeedback(submission.adminFeedback || ""); // Prefill with existing feedback
  };
  

  const handleOpenResubmitModal = (submission) => {
    setSelectedSubmission(submission);
    setNewAssignmentLink(submission.assignmentLink || ""); // Prefill with the current link
    setShowResubmitModal(true);
  };
  

  const handleResubmitAssignment = async () => {
    if (!newAssignmentLink.trim()) {
      alert("Please provide a valid assignment link.");
      return;
    }
  
    try {
      // Reference to the specific submission document
      const submissionRef = doc(db, "community-assignment-submission", selectedSubmission.id);
  
      // Update Firestore
      await updateDoc(submissionRef, {
        assignmentLink: newAssignmentLink.trim(),
        assignmentStatus: "Resubmitted for Review",
        timestamp: serverTimestamp(),
      });
  
      // Update local state
      setSubmissions((prevSubmissions) =>
        prevSubmissions.map((submission) =>
          submission.id === selectedSubmission.id
            ? {
                ...submission,
                assignmentLink: newAssignmentLink.trim(),
                assignmentStatus: "Resubmitted for Review",
              }
            : submission
        )
      );
  
      alert("Your assignment has been resubmitted for review!");
      setShowResubmitModal(false);
      setSelectedSubmission(null);
      setNewAssignmentLink("");
    } catch (error) {
      console.error("Error resubmitting assignment:", error);
      alert("Failed to resubmit the assignment. Please try again.");
    }
  };
  

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true); // Start loading spinner
        const submissionsCollectionRef = collection(db, "community-assignment-submission");
        const submissionsSnapshot = await getDocs(submissionsCollectionRef);

        if (submissionsSnapshot.empty) {
          setLoading(false);  // No data, stop spinner
          return;
        }

        const aggregatedScores = submissionsSnapshot.docs
          .filter((doc) => doc.data().communityId === communityId)
          .reduce((scores, doc) => {
            const { memberId, rewardEarned } = doc.data();
            const score = isNaN(parseInt(rewardEarned, 10)) ? 0 : parseInt(rewardEarned, 10);
            scores[memberId] = (scores[memberId] || 0) + score;
            return scores;
          }, {});

        const leaderboard = Object.entries(aggregatedScores)
          .map(([memberId, totalScore]) => ({ memberId, totalScore }))
          .sort((a, b) => b.totalScore - a.totalScore);

        setLeaderboard(leaderboard);
        updateLeaderboardInFirestore(leaderboard);

        setLoading(false);  // Stop loading spinner
      } catch (error) {
        setErrorMessage("Failed to fetch leaderboard. Please try again.");
        console.error("Error fetching leaderboard:", error);
        setLoading(false);  // Stop loading spinner in case of error
      }
    };

    if (activeSection === "Leaderboard") {
      fetchLeaderboard();
    }
  }, [communityId, activeSection]);

  const updateLeaderboardInFirestore = (leaderboard) => {
    const batch = writeBatch(db);
    leaderboard.forEach(({ memberId, totalScore }) => {
      const userRef = doc(db, "users", memberId);
      batch.update(userRef, { userScore: totalScore });
    });
    batch.commit().catch((error) => {
      console.error("Error updating user scores:", error);
    });
  };
  

  const handleShowAssignmentModal = (task) => {
    setSelectedTask(task); // Store the selected task
    setShowAssignmentModal(true);
  };

const handleCloseAssignmentModal = () => {
  setShowAssignmentModal(false);
  setAssignmentLink("");
};
  

const downloadFeedbackAsPDF = (feedback) => {
  const doc = new jsPDF();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text("Admin Feedback", 20, 20);
  doc.setFontSize(12);
  doc.text(feedback || "No feedback provided.", 20, 40);

  doc.save("admin-feedback.pdf");
};

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksCollectionRef = collection(db, "community-tasks", communityId, "tasks");
        const tasksSnapshot = await getDocs(tasksCollectionRef);
  
        if (!tasksSnapshot.empty) {
          const fetchedTasks = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setTasks(fetchedTasks);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
  
    if (activeSection === "Tasks") {
      fetchTasks();
    }
  }, [communityId, activeSection]);

  const handleAddTask = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setEditModal(false);
    setShowModal(false)
    setTaskTitle("");
    setTaskDescription("");
    setTaskNotes("");
    setTaskPoints("")
    setTaskDeadline("");
  };

  const handleEditTask = (task) => {
    setTaskTitle(task.taskTitle);
    setTaskDescription(task.taskDescription);
    setTaskNotes(task.taskNotes);
    setTaskDeadline(task.taskDeadline);
    setEditModal(true);
    setTaskPoints(task.points)
    setEditingRule(task.id); // Set the editing mode
  };

  const handleUpdateTask = async () => {
    try {
      // Make sure the editingRule exists (i.e., you're editing a task)
      if (!editingRule) {
        alert("No task selected for editing.");
        return;
      }
  
      // Prepare the updated task data
      const taskData = {
        taskTitle,
        taskDescription,
        taskNotes,
        taskDeadline,
        timestamp: serverTimestamp(),
        communityId,
        communityName,
        adminId: AdminID,
        points: taskPoints,
      };
  
      // Update the task in Firestore
      const taskDocRef = doc(db, "community-tasks", communityId, "tasks", editingRule);
      await updateDoc(taskDocRef, taskData); // Update existing task
  
      // Update the local state as well
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === editingRule ? { ...task, ...taskData } : task))
      );
  
      // Reset editing mode
      setEditingRule(null);
  
      // Success alert and close the modal
      alert("Task updated successfully!");
      handleModalClose();
    } catch (error) {
      console.error("Error updating task:", error);
      alert(error);
    }
  };
  
  
  
  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const taskDocRef = doc(db, "community-tasks", communityId, "tasks", taskId);
        await deleteDoc(taskDocRef);
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        alert("Task deleted successfully!");
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete task.");
      }
    }
  };
  

  const handleSubmitTask = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        alert("You must be logged in to submit a task.");
        return;
      }
  
      const taskNum = Math.floor(10000 + Math.random() * 90000); // Generates a 5-digit number
      const taskId = `task-${taskNum}`;
  
      const taskData = {
        taskId,
        taskTitle,
        taskDescription,
        taskNotes,
        taskDeadline,
        timestamp: serverTimestamp(), // Automatically add timestamp
        communityId,
        communityName,
        adminId: AdminID, // Set the admin ID as the current user ID
        points: taskPoints,
      };
  
      // Reference to the tasks collection in the specific community
      const tasksCollectionRef = collection(db, "community-tasks", communityId, "tasks");
      const newTaskDocRef = await addDoc(tasksCollectionRef, taskData);
  
      // Log activity for each member
      const communityRef = doc(db, "communities", communityId);
      const communityDoc = await getDoc(communityRef);
  
      if (communityDoc.exists()) {
        const { member = [] } = communityDoc.data(); // Assuming `member` contains user IDs
        const loginTimestamp = new Date();
  
        const batch = writeBatch(db); // Use batch to write logs atomically
  
        member.forEach((memberId) => {
          const logRef = doc(collection(db, "activity_logs"), `${memberId}_${loginTimestamp.getTime()}`);
          batch.set(logRef, {
            action: "Task",
            message: `Task '${taskTitle}' created for the community.`,
            communityId,
            communityName,
            adminId: AdminID,
            userId: memberId,
            timestamp: serverTimestamp(),
            ip: window.location.hostname,
          });
        });
  
        await batch.commit();
      }
  
      // Optionally, you can fetch the newly created task to update the state
      const newTask = { id: newTaskDocRef.id, ...taskData };
      setTasks((prevTasks) => [...prevTasks, newTask]);
  
      // Success alert and close the modal
      alert("Task added successfully!");
      handleModalClose();
    } catch (error) {
      console.error("Error submitting task:", error);
      alert("Failed to add task.");
    }
  };
  

  const handleUpdateStatus = async (submissionId, newStatus) => {
    try {
      const submission = submissions.find((sub) => sub.id === submissionId);
      const userId = submission.memberId; // Get the userId from the submission
  
      // Reference to the specific submission in the community-assignment-submission collection
      const submissionRef = doc(db, "community-assignment-submission", submissionId);
  
      // Reference to the user document in the "users" collection
      const userRef = doc(db, "users", userId);
  
      // Check if points are available for the submission
      const taskPoints = submission.points || 0;
  
      // Start a batch operation to ensure atomicity
      const batch = writeBatch(db);
      
  
      // Update the assignment status, feedback, and rewardEarned in the community-assignment-submission collection
      batch.update(submissionRef, {
        assignmentStatus: newStatus,
        adminFeedback: submission.feedbackText?.trim() || submission.adminFeedback,
        rewardEarned: taskPoints // Add rewardEarned field with task points
      });
  
      // Add task points to the user's score in the users collection
      const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentUserScore = parseInt(userData.userScore, 10) || 0; // Convert to integer
    }
  
      // Commit the batch
      await batch.commit();

      const loginTimestamp = new Date();
     await setDoc(doc(collection(db, "activity_logs"), userId + "_" + loginTimestamp.getTime()), {
      userId: userId,
      action: "Status",
      message: `Admin updated the status of submission '${submission.assignmentName}' to '${newStatus}'`,
      communityId,
      communityName,
      timestamp: loginTimestamp,
      ip: window.location.hostname,
     })
  
      // Update the local state to reflect the changes
      setSubmissions((prevSubmissions) =>
        prevSubmissions.map((submission) =>
          submission.id === submissionId
            ? { ...submission, assignmentStatus: newStatus, adminFeedback: submission.feedbackText?.trim() || submission.adminFeedback, rewardEarned: taskPoints }
            : submission
        )
      );
  
      alert(`Assignment status updated to "${newStatus}" and task score added to user score.`);
    } catch (error) {
      console.error("Error updating assignment status:", error);
      alert("Failed to update status and user score.");
    }
  };
  
  
  
  const handleToggleFeedbackEdit = (submissionId, isEditing) => {
    setSubmissions((prevSubmissions) =>
      prevSubmissions.map((submission) =>
        submission.id === submissionId
          ? { ...submission, isEditingFeedback: isEditing }
          : submission
      )
    );
  };
  
  const handleFeedbackChange = (submissionId, feedbackText) => {
    setSubmissions((prevSubmissions) =>
      prevSubmissions.map((submission) =>
        submission.id === submissionId
          ? { ...submission, feedbackText }
          : submission
      )
    );
  };

  const handleSaveFeedback = async () => {
    if (!newFeedback.trim()) {
      alert("Feedback cannot be empty.");
      return;
    }
  
    try {
      // Reference to the specific submission document
      const submissionRef = doc(db, "community-assignment-submission", editingFeedbackId);
  
      // Update Firestore
      await updateDoc(submissionRef, {
        adminFeedback: newFeedback.trim(),
      });
  
      // Update local state
      setSubmissions((prevSubmissions) =>
        prevSubmissions.map((submission) =>
          submission.id === editingFeedbackId
            ? { ...submission, adminFeedback: newFeedback.trim() }
            : submission
        )
      );
  
      alert("Feedback updated successfully!");
      setEditingFeedbackId(null);
      setNewFeedback("");
    } catch (error) {
      console.error("Error updating feedback:", error);
      alert("Failed to update feedback. Please try again.");
    }
  };
  
  
  
  
  
  const handleSubmitAssignment = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        alert("You must be logged in to submit an assignment.");
        return;
      }
  
      if (!selectedTask) {
        alert("No task selected for submission.");
        return;
      }
  
      // Generate a unique submission ID
      const submissionNum = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
      const submissionId = `submission-${submissionNum}`;
  
      // Ensure points is a valid number
      const points = selectedTask.points !== undefined && selectedTask.points !== null ? selectedTask.points : 0; // Default to 0 if points is not defined
  
      const assignmentData = {
        submissionId, // Add the generated submission ID
        assignmentLink,
        assignmentName: selectedTask.taskTitle || "Untitled Task", // Use the selected task title
        taskId: selectedTask.taskId || selectedTask.id, // Use the selected task ID
        memberId: userId,
        communityId,
        communityName,
        adminId: AdminID,
        timestamp: serverTimestamp(),
        assignmentStatus: "Submitted for review",
        points, // Ensure this is a valid number
        deadline: selectedTask.taskDeadline
      };

      const loginTimestamp = new Date();
         await setDoc(doc(collection(db, "activity_logs"), userId + "_" + loginTimestamp.getTime()), {
          action: "submission",
          message: `You have submitted '${selectedTask.taskTitle}' for review at ${new Date().toLocaleString()}`,
          timestamp: serverTimestamp(),
          userId: userId,
          communityId,
          communityName,
          adminId: AdminID,
         })
  
  
      const assignmentCollectionRef = collection(db, "community-assignment-submission");
      await addDoc(assignmentCollectionRef, assignmentData);
  
      alert("Assignment submitted successfully!");
      setAssignmentLink(""); // Reset the input field
      setShowAssignmentModal(false);
      setSelectedTask(null); // Clear the selected task


  
      // Optionally update the local submissions state
      setSubmissions((prevSubmissions) => [...prevSubmissions, assignmentData]);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      alert(error);
    }
  };
  
  
  


  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        console.log("Current User ID:", userId);

        if (!userId) {
          console.warn("User not logged in.");
          return;
        }

        console.log("Community ID from URL:", communityId);

        const communityRef = doc(db, "communities", communityId);
        const communityDoc = await getDoc(communityRef);

        if (communityDoc.exists()) {
          const communityData = communityDoc.data();
          console.log("Community Data:", communityData);
          setAdminID(communityData.adminId)
          setCommunityName(communityData.communityName || "Unnamed Community");

          if (communityData.adminId === userId) {
            console.log("User is an admin.");
            setIsAdmin(true);
          } else if (communityData.member?.includes(userId)) {
            setIsMember(true);
          } else {
            console.log("User is not an admin.");
          }
        } else {
          console.warn("Community document not found.");
        }
      } catch (error) {
        console.error("Error fetching community data:", error);
      }
    };

    const fetchCommunityRules = async () => {
        try {
          const rulesCollectionRef = collection(db, "community-rules", communityId, "rules");
          const rulesSnapshot = await getDocs(rulesCollectionRef);
  
          if (!rulesSnapshot.empty) {
            const fetchedRules = rulesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setRules(fetchedRules);
          }
        } catch (error) {
          console.error("Error fetching community rules:", error);
        } finally {
          setRulesLoaded(true);
        }
      };


      const fetchCommunityMembers = async () => {
        const communityRef = doc(db, "communities", communityId);
        const communityDoc = await getDoc(communityRef);
    
        if (communityDoc.exists()) {
            const communityData = communityDoc.data();
            const memberIds = communityData.member || [];  // Assuming `member` is an array of user IDs
            
            const memberNames = [];
            
            // Fetch user data (name) for each member ID
            for (const uid of memberIds) {
                const userRef = doc(db, "users", uid);
                const userDoc = await getDoc(userRef);
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    memberNames.push({
                        uid: uid,
                        name: userData.name || "Anonymous",  // Default to "Anonymous" if name is missing
                        status: userData.profileStatus
                    });
                }
            }
    
            setMembers(memberNames);  // Update state with user names
        } else {
            console.warn("Community document not found.");
        }
    };

    fetchCommunityMembers();
    fetchCommunityData();
    fetchCommunityRules();
  }, [communityId]);

  const handleAddOrUpdateRule = async () => {
    try {
      const ruleData = {
        content: newRule,
        timestamp: serverTimestamp(),
        communityId,
        communityName,
        adminId: auth.currentUser?.uid,
        adminEmail: auth.currentUser?.email,
      };

      if (editingRule) {
        // Update existing rule
        const ruleDocRef = doc(db, "community-rules", communityId, "rules", editingRule.id);
        await setDoc(ruleDocRef, ruleData);
        setRules((prevRules) =>
          prevRules.map((rule) => (rule.id === editingRule.id ? { ...rule, ...ruleData } : rule))
        );
      } else {
        // Add new rule
        const rulesCollectionRef = collection(db, "community-rules", communityId, "rules");
        const newRuleDoc = await addDoc(rulesCollectionRef, ruleData);
        setRules((prevRules) => [...prevRules, { id: newRuleDoc.id, ...ruleData }]);
      }

      setNewRule("");
      setEditingRule(null);
    } catch (error) {
      console.error("Error adding or updating rule:", error);
      alert(error)
    }
  };

  const handleEditRule = (rule) => {
    if (isEditing) {
      // If already editing, close edit mode
      setIsEditing(false);
      setEditingRule(null);
      setNewRule("");
    } else {
      // Otherwise, enter edit mode
      setIsEditing(true);
      setEditingRule(rule);
      setNewRule(rule.content);
    }
  };

  const handleJoinCommunity = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        alert("You must be logged in to join this community.");
        return;
      }

      const communityRef = doc(db, "communities", communityId);
      await updateDoc(communityRef, {
        member: arrayUnion(userId),
      });

      setIsMember(true);
      alert("You have successfully joined the community!");
    } catch (error) {
      console.error("Error joining community:", error);
      alert("Failed to join the community.");
    }
  };

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const submissionsCollectionRef = collection(db, "community-assignment-submission");
        const submissionsSnapshot = await getDocs(submissionsCollectionRef);
  
        if (!submissionsSnapshot.empty) {
          const fetchedSubmissions = submissionsSnapshot.docs
            .filter((doc) => doc.data().communityId === communityId)
            .map((doc) => ({ id: doc.id, ...doc.data() }));
          setSubmissions(fetchedSubmissions);
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setSubmissionsLoaded(true);
      }
    };
  
    if (activeSection === "Submissions" || activeSection === "My Submissions") {
      fetchSubmissions();
    }
  }, [communityId, activeSection]);
  
  

  const sidebarOptions = [
    "Rules",
    "Announcements",
    "Tasks",
    "Events",
    "Courses",
    "Leaderboard",
    ...(isAdmin ? ["User Management","Submissions","Analytics","Manage"] : []),
    ...(isMember ? ["My Submissions"]:[])
  ];


  return (
  
    <div className="community-page"> 
    {!isAdmin && !isMember && (
        <div className="join-message-container">
            <h5 className="join-community-message">You're currently in preview mode. Join this community to collaborate, learn, and showcase your skills!</h5>
            <button className="join-btn" onClick={handleJoinCommunity}>
              Join {communityName}
            </button>
            </div>
          )}
          <div style={{display:'flex'}}>
      <aside className="community-sidebar">
        <h2>{communityName || "Community Sidebar"}</h2>
 
        {sidebarOptions.map((option) => (
          <div
            key={option}
            className={`community-sidebar-item ${activeSection === option ? "active" : ""}`}
            onClick={() => {
              if (option === "Manage") {
                navigate(`/community/${communityId}/manage`);
              } else {
                setActiveSection(option);
              }
            }}
          >
            {option}
          </div>
        ))}
        <div style={{padding:'40px'}}/>
      </aside>

      <main className="content">
      <nav className="community-navbar">
        <div className="community-navbar-left">
          <h3>{activeSection}</h3>
        </div>
        <div className="community-navbar-right">
        {isAdmin && (
      <>
        {activeSection === "Tasks" && (
          <button
            className="add-task-button"
            onClick={handleAddTask}
          >
            Add Task
          </button>
        )}

        {isAdmin && activeSection === "Events" && (
          <button
            className="add-event-button"
            onClick={() => setShowAddEventModal(true)}
          >
            Add Event
          </button>
        )}

        {isAdmin && activeSection === "Analytics" && (
          <div className="analytics-selector">
          <select
            id="analytics-type"
            value={selectedAnalytics}
            onChange={handleAnalyticsChange}
            className="analytics-selector-dropdown"
          >
            <option className="analytics-selector-option" value="Member Engagement">Member Engagement</option>
            <option className="analytics-selector-option" value="Course Performance">Course Performance</option>
            <option className="analytics-selector-option" value="Content Performance">Content Performance</option>
            <option className="analytics-selector-option" value="Event Analytics">Event Analytics</option>
            <option className="analytics-selector-option" value="Task Analytics">Task Analytics</option>
          </select>
        </div>
        )}


        {activeSection === "Courses" && (
          <button 
          className="add-course-button"
          onClick={handleOpenAddCourseModal}
          >Add Course</button>
        )}
        <div
          className="members-icon-container"
          onClick={() => setShowMembers(!showMembers)}
        >
          <FaUsers className="navbar-icon" title="Community Members" />
        </div>
        
      </>
    )}

    
          <FaBell className="navbar-icon" title="Announcements" />
          <div className="more-options-container">
  <FaEllipsisV
    className="navbar-icon"
    title="More Options"
    onClick={toggleMoreOptions}
  />
  {showMoreOptions && (
    <div className="more-options-dropdown">
      {isAdmin ? (
        <>
          <div onClick={handleManageCommunity} className="dropdown-option">
            Manage Community
          </div>
          <div onClick={handleDeleteCommunity} className="dropdown-option">
            Delete Community
          </div>
        </>
      ) : isMember ? (
        <>
          <div onClick={handleReportCommunity} className="dropdown-option">
            Report Community
          </div>
          <div onClick={handleLeaveCommunity} className="dropdown-option">
            Leave Community
          </div>
        </>
      ) : (
        <>
          <div onClick={handleJoinCommunity} className="dropdown-option">
            Join Community
          </div>
          <div onClick={handleReportCommunity} className="dropdown-option">
            Report Community
          </div>
        </>
      )}
    </div>
  )}
</div>
        </div>
      </nav>
<div style={{display:'flex',justifyContent:'center'}}>
      {activeSection === "Rules" && (
  <div className="rules-section">
    <h2>Welcome to {communityName}</h2>
    <div className="rules-container">
      {rulesLoaded ? (
        rules.length > 0 ? (
          <ul>
            {rules.map((rule) => (
              <li key={rule.id}>
                {rule.content}
                {isAdmin && <button onClick={() => handleEditRule(rule)}>Edit</button>}
              </li>
            ))}
          </ul>
        ) : (
          <p>Rules not declared yet.</p>
        )
      ) : (
        <p>Loading rules...</p>
      )}
    </div>
    
    {/* Show Add Rule form only if no rule is declared */}
    {isAdmin && rules.length === 0 && (
      <div className="add-rule-form">
        <textarea
          placeholder="Enter rule content..."
          value={newRule}
          onChange={(e) => setNewRule(e.target.value)}
        ></textarea>
        <button onClick={handleAddOrUpdateRule} className="rules-section-button">
          {editingRule ? "Update Rule" : "Add Rule"}
        </button>
      </div>
    )}

    {/* Always show Update Rule option if editingRule is true */}
    {isAdmin && editingRule && (
      <div className="add-rule-form">
        <textarea
          placeholder="Enter rule content..."
          value={newRule}
          onChange={(e) => setNewRule(e.target.value)}
        ></textarea>
        <button onClick={handleAddOrUpdateRule}>
          Update Rule
        </button>
      </div>
    )}

    <div style={{padding:'40px'}}/>
  </div>
)}

{activeSection === "Announcements" && (
  <div className="announcements-section">
    <h2>Announcements</h2>
    
    <div className="announcement-list">
    {announcements.length > 0 ? (
  announcements.map((announcement) => {
    const date = announcement.timestamp?.toDate(); // Convert Firebase Timestamp to JS Date
    return (
      <div key={announcement.id} className="announcement-card">
        <p className="announcement-content">{announcement.announcement}</p>
        <span className="announcement-meta">
          Posted by {announcement.adminId === auth.currentUser?.uid ? "You" : "Admin"}
          &nbsp;on {date ? date.toLocaleDateString() : "Unknown"}
        </span>
      </div>
    );
  })
) : (
  <p>No announcements yet.</p>
)}

    </div>
    
    {isAdmin && (
      <div className="announcement-input-container">
        <input
          type="text"
          value={newAnnouncement}
          onChange={(e) => setNewAnnouncement(e.target.value)}
          placeholder="Write an announcement..."
          className="announcement-input"
        />
        <button onClick={handlePostAnnouncement} className="announcement-share-button">
          <FaPaperPlane/>
        </button>
      </div>
    )}

<div style={{padding:'40px'}}/>
  </div>
  
)}

        {activeSection === "Tasks" && (
      <div className="tasks-section">

        <div className="tasks-grid">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div key={task.id} className="task-card">
                <div className="task-card-header">
                <h3>{task.taskTitle || "Untitled Task"}</h3>
                {isAdmin && (
                    <div className="task-actions">
                    <FaEdit
                        className="edit-icon"
                        title="Edit Task"
                        onClick={() => handleEditTask(task)}
                      />
                      <FaTrash
                        className="delete-icon"
                        title="Delete Task"
                        onClick={() => handleDeleteTask(task.id)}
                      />
                    </div>
                  )}
                  </div>
                  
                <p>
                  {task.showFullDescription
                    ? task.taskDescription
                    : `${task.taskDescription.slice(0, 100)}...`}
                  {task.taskDescription.length > 10 && (
                    <span
                      className="read-more"
                      onClick={() => navigate(`/community/${communityId}/tasks/${task.id}`)}
                    >
                      {task.showFullDescription ? " Show Less" : " Read More"}
                    </span>
                  )}
                </p>
                <p><strong>Score:</strong> {task.points}</p>
                <p><strong>Deadline:</strong> {task.taskDeadline}</p>

                {isMember && (
                  <div className="submit-assignment-btn-container">
              <button
                className="submit-assignment-btn"
                onClick={() => handleShowAssignmentModal(task)}
              >
                Submit Assignment
              </button>
              </div>
            )}
              </div>
            ))
          ) : (
            <p>No tasks assigned yet.</p>
          )}
          
        </div>
        <div style={{ padding: "40px" }} />
      </div>
        )}

{activeSection === "Events" && (
  <div className="events-section">
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
      <input
        type="text"
        placeholder="Search events..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="events-search-bar"
      />
    <div className="calendar-input-container">
    <input
    type="date"
    value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""}
    onChange={(e) => setSelectedDate(new Date(e.target.value))}
    className="calendar-input-native"
  />
      </div>
    </div>

    <div className="events-grid">
  {events
    .filter((event) => {
      const matchesSearch = event.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        event.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

          const matchesDate =
          !selectedDate ||
          (event.date &&
            event.date.seconds &&
            new Date(event.date.seconds * 1000).toDateString() ===
              selectedDate.toDateString());
        

      return matchesSearch && matchesDate;
    })
    .slice(0, 16) // Limit to 16 events for 4x4 grid
    .map((event) => {
      // Calculate remaining days for registration
      const now = new Date();
      const lastRegistrationDate = new Date(event.lastRegistrationDate.seconds * 1000);
      const daysRemaining = Math.ceil((lastRegistrationDate - now) / (1000 * 60 * 60 * 24));

      return (
        <div key={event.id} className="event-card">
           {isAdmin && (
            <div className="event-actions" style={{ display: "flex", justifyContent: "space-between" }}>
              <FaEdit
                className="edit-icon"
                title="Edit Event"
                style={{ cursor: "pointer", color: "#007bff", fontSize: "20px" }}
                onClick={() => handleEditEvent(event)}
              />
              <FaTrash
                className="delete-icon"
                title="Delete Event"
                style={{ cursor: "pointer", color: "red", fontSize: "20px", marginLeft:'10px' }}
                onClick={() => handleDeleteEvent(event.id)}
              />
            </div>
          )}
          <div className="events-header" style={{padding:'10px'}}>
          <h3 style={{fontSize:"14px", textAlign:'center'}}>{event.title}</h3>
          </div>
          <p>{event.description.slice(0, 100)}...</p>
          <p>
  <strong>Date:</strong>{" "}
  {event.startDate?.seconds &&
  event.endDate?.seconds &&
  event.startDate.seconds === event.endDate.seconds
    ? // Display only startDate if both are the same
      `${new Date(event.startDate.seconds * 1000).toLocaleDateString()}`
    : // Otherwise, display both startDate and endDate
      `${
        event.startDate?.seconds
          ? new Date(event.startDate.seconds * 1000).toLocaleDateString()
          : "N/A"
      } - ${
        event.endDate?.seconds
          ? new Date(event.endDate.seconds * 1000).toLocaleDateString()
          : "N/A"
      }`}
</p>

<p>
  <strong>Timings:</strong>{" "}
  {event.startTime?.seconds
    ? new Date(event.startTime.seconds * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A"}{" "}
  -{" "}
  {event.endTime?.seconds
    ? new Date(event.endTime.seconds * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A"}
</p>




          <p>
            <strong>Type:</strong> {event.type}
          </p>
          {daysRemaining > 0 && (
            <p className="registration-message" style={{color:'green', fontSize:'13px', marginBottom:'10px'}}>
              Registration closes in {daysRemaining} day{daysRemaining > 1 ? "s" : ""}.
            </p>
          )}
          {daysRemaining <= 0 && (
            <p className="registration-message" style={{ color: "red" }}>
              Registration is closed.
            </p>
          )}
          <div style={{alignItems:'center'}}>
          <button className="event-section-register-button"  onClick={() => { setSelectedEventId(event.id); setShowRegistrationModal(true); }}>
            Register Event
          </button>
          </div>
        </div>
      );
    })}
</div>

  </div>
)}



        {activeSection === "Courses" && (
          <div className="community-course-section">
          <div className="community-courses-controls">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchCourse}
            onChange={(e) => setSearchCourse(e.target.value)}
            className="courses-search-input"
          />
    
          <select
            value={filterCourseCategory}
            onChange={(e) => setFilterCourseCategory(e.target.value)}
            className="courses-filter-select"
          >
            <option value="All" className="courses-filter-select-options">All Categories</option>
            {Course_Categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <div className="course-card" key={course.id} onClick={() => navigate(`/course/${course.id}`)}>
              <div className="course-card-content">
                <div style={{display:'flex', justifyContent:'space-between'}}>
              
                <h3 className="course-card-title">{course.title}</h3>

                {isAdmin && (
              <div className="course-actions">
                <FaEdit
                  className="edit-icon"
                  title="Edit Course"
                  onClick={() => handleEditCourse(course)}
                />
                <FaTrash
                  className="delete-icon"
                  title="Delete Course"
                  onClick={() => handleDeleteCourse(course.id)}
                />
              </div>
            )}
                </div>
                
                {renderVideoPlayer(course.link)}

              </div>
            </div>
          ))}
        </div>
        <div style={{padding:'40px'}}/>
        </div>
      )}
        {activeSection === "Leaderboard" && (
  <div className="leaderboard-section">
  <h2 className="community-leaderboard-title">Leaderboard</h2>
  {loading ? (
    <LoadingSpinner />  // Display spinner when loading
  ) : errorMessage ? (
    <div className="error-message">{errorMessage}</div>
  ) : leaderboard.length > 0 ? (
    <div className="leaderboard-table-container">
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Member</th>
            <th>Total Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => {
            const memberName = members.find((member) => member.uid === entry.memberId)?.name || "Unknown";
            const isCurrentUser = entry.memberId === auth.currentUser?.uid;
            return (
              <tr key={entry.memberId} className="leaderboard-row">
                <td className="rank">{index + 1}</td>
                <td className="member-name">
                  {memberName} {isCurrentUser && <span style={{ color: "#f1c40f" }}>(You)</span>}
                </td>
                <td className="total-score">{entry.totalScore || 0} points</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ) : (
    <p>No submissions yet.</p>
  )}
</div>
)}
{activeSection === "Analytics" && isAdmin && (
  <div className="analytics-section">
    {selectedAnalytics === "Member Engagement" && (
       <div className="member-engagement">
       <h2>Member Engagement</h2>
       <div className="analytics-grid">
         <div className="analytics-card">
           <h3>Total Members</h3>
           <p>{totalMembers}</p>
         </div>
         <div className="analytics-card">
           <h3>Active Members (Last 7 days)</h3>
           <p>{activeMembers}</p>
         </div>
         <div className="analytics-card">
           <h3>New Members (Last 30 days)</h3>
           <p>{newMembers}</p>
         </div>
         <div className="analytics-card">
           <h3>Engagement Rate</h3>
           <p>{engagementRate}%</p>
         </div>
       </div>
     </div>
   )}
    
    {selectedAnalytics === "Course Performance" && (
      <div className="course-performance">
        <h2>Course Performance</h2>
        <div className="analytics-grid">
          {coursePerformance.length > 0 ? (
            coursePerformance.map((course, index) => (
              <div key={index} className="analytics-card">
                <h3>{course.title}</h3>
                <p>Enrollments: {course.enrollments}</p>
                <p>Completion Rate: {course.completionRate}%</p>
              </div>
            ))
          ) : (
            <p>No course performance data available.</p>
          )}
        </div>
      </div>
    )}

{selectedAnalytics === "Content Performance" && (
      <div className="content-performance">
        <h2>Content Performance</h2>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Announcements</h3>
            <p>{contentPerformance.announcements}</p>
          </div>
          <div className="analytics-card">
            <h3>Tasks Completed</h3>
            <p>{contentPerformance.tasksCompleted}</p>
          </div>
          <div className="analytics-card">
            <h3>Event Participation</h3>
            <p>{contentPerformance.eventParticipation}</p>
          </div>
        </div>
      </div>
    )}

    {selectedAnalytics === "Event Analytics" && (
      <div className="event-analytics">
        <h2>Event Analytics</h2>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Total Events</h3>
            <p>{eventAnalytics.totalEvents}</p>
          </div>
          <div className="analytics-card">
            <h3>Total Registrations</h3>
            <p>{eventAnalytics.totalRegistrations}</p>
          </div>
          <div className="analytics-card">
            <h3>Average Participation</h3>
            <p>{eventAnalytics.avgParticipation}</p>
          </div>
        </div>
      </div>
    )}

{selectedAnalytics === "Task Analytics" && (
      <div className="task-analytics">
        <h2 style={{ marginTop: "40px" }}>Task Analytics</h2>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Total Tasks</h3>
            <p>{taskAnalytics.totalTasks}</p>
          </div>
          <div className="analytics-card">
            <h3>Tasks Completed</h3>
            <p>{taskAnalytics.tasksCompleted}</p>
          </div>
          <div className="analytics-card">
            <h3>Completion Rate</h3>
            <p>{taskAnalytics.completionRate}%</p>
          </div>
          <div className="analytics-card">
            <h3>Total Submissions</h3>
            <p>{taskAnalytics.totalSubmissions}</p>
          </div>
          <div className="analytics-card">
            <h3>Total Points</h3>
            <p>{taskAnalytics.totalPoints}</p>
          </div>
          <div className="analytics-card">
            <h3>Total Points Earned</h3>
            <p>{taskAnalytics.totalPointsEarned}</p>
          </div>
        </div>
      </div>
    )}

 
  <div style={{padding:'40px'}}/>
  </div>
)}

{activeSection === "User Management" && isAdmin && (
  <div className="community-user-management-section">
    <h2>Community Members</h2>
    <input
      type="text"
      placeholder="Search members..."
      value={searchUser}
      onChange={(e) => setSearchUser(e.target.value)}
      className="community-user-search-input"
    />
    <ul className="community-member-list">
      {members
        .filter((member) =>
          member.name.toLowerCase().includes(searchUser.toLowerCase())
        )
        .map((member) => (
          <li key={member.uid} className="community-member-item">
            <span>{member.name}</span>
            <div style={{display:'flex', alignItems:'center'}}>
            <span className={`status-dot ${member.status === "online" ? "online" : "offline"}`}></span>
            <p>{member.status}</p>
            </div>
            <button
              className="community-promote-button"
              onClick={() => handlePromote(member.uid)}
            >
              Promote
            </button>
            <div className="community-more-options">
              <FaEllipsisV />
              <div className="community-options-dropdown">
                <button onClick={() => handleKick(member.uid)}>Kick</button>
                <button onClick={() => handleBan(member.uid)}>Ban</button>
              </div>
            </div>
          </li>
        ))}
    </ul>
  </div>
)}


        {activeSection === "Manage" && isAdmin && <p>Manage community settings here.</p>}
        {activeSection === "Submissions" && isAdmin && (
  <div className="assignment-submissions-section">
    {submissionsLoaded ? (
      submissions.length > 0 ? (
        <div className="assignment-submissions-gird">
          {submissions.map((submission) => (
            <div key={submission.id} className="assignment-submissions-card">
              <div className="assignment-submissions-header">
                <h2>{submission.assignmentName}</h2>
              </div>
              <div className="assignment-submissions-content">
                <p style={{fontSize:'13px'}}><strong>Member Name:</strong> {members.find(member => member.uid === submission.memberId)?.name || "Unknown"}</p>
                <p style={{fontSize:'13px'}}><strong>Member ID:</strong> {submission.memberId}</p>
                <p style={{fontSize:'13px'}}><strong>Link:</strong> <a href={submission.assignmentLink} target="_blank" rel="noopener noreferrer">{submission.assignmentLink}</a></p>
                <p style={{fontSize:'13px'}}><strong>Task Deadline:</strong> {new Date(submission.deadline).toLocaleDateString()}</p>
                <p style={{fontSize:'13px'}}><strong>Submitted On:</strong> {new Date(submission.timestamp?.seconds * 1000).toLocaleString()}</p>
                <p style={{fontSize:'13px'}}><strong>Status:</strong> {submission.assignmentStatus}</p>
                <p style={{fontSize:'13px'}}><strong>Task Score:</strong> {submission.points} points</p>
                <div className="feedback-section">
  <p style={{ fontSize: '13px' }}>
    <strong>Admin Feedback:</strong>
    {editingFeedbackId === submission.id ? (
      <>
        <textarea
          className="feedback-textarea"
          value={newFeedback}
          onChange={(e) => setNewFeedback(e.target.value)}
          placeholder="Enter your feedback here"
        ></textarea>
        <button className="save-feedback-btn" onClick={handleSaveFeedback}>
          Save
        </button>
        <button
          className="cancel-feedback-btn"
          onClick={() => {
            setEditingFeedbackId(null);
            setNewFeedback("");
          }}
        >
          Cancel
        </button>
      </>
    ) : (
      <>
        {submission.adminFeedback || "No feedback provided."}
        <button
          className="edit-admin-feedback-btn"
          onClick={() => handleEditFeedback(submission)}
        >
          Edit
        </button>
      </>
    )}
  </p>
</div>



                <div className="admin-actions">
                {submission.assignmentStatus !== "Complete" && submission.assignmentStatus !== "Rejected" && (
                  <>
                <button className="status-button complete"
                    onClick={() => {
                      if (!submission.adminFeedback?.trim() && !submission.feedbackText?.trim()) {
                        alert("Please provide feedback before marking this submission as Complete.");
                        return;
                      }
                      handleUpdateStatus(submission.id, "Complete");
                    }}
                  >
                    Mark as Complete
                  </button>
                  <button
                    className="status-button reject"
                    onClick={() => {
                      if (!submission.adminFeedback?.trim() && !submission.feedbackText?.trim()) {
                        alert("Please provide feedback before rejecting this submission.");
                        return;
                      }
                      handleUpdateStatus(submission.id, "Rejected");
                    }}
                  >
                    Reject Submission
                  </button>
        </>
                )}

                </div>

              </div>
              
            </div>
          ))}
          
        </div>
      ) : (
        <p>No submissions yet.</p>
      )
    ) : (
      <p>Loading submissions...</p>
    )}
      <div style={{padding:'40px'}}/>
  </div>
)}

        {activeSection === "My Submissions" && isMember && (
 <div className="my-submissions-section">
  <h2>My Submissions</h2>
  {submissionsLoaded ? (
      submissions.filter((sub) => sub.memberId === auth.currentUser?.uid).length > 0 ? (
        <div className="my-submissions-grid">
          {submissions
            .filter((sub) => sub.memberId === auth.currentUser?.uid)
            .map((submission) => (
              <div key={submission.id} className="my-submission-card">
                <div className="my-submission-card-header">
                  <h3 className="my-submission-card-title">{submission.assignmentName}</h3>
                </div>
                <div className="my-submission-card-content">
                  <p><strong>Link:</strong> <a href={submission.assignmentLink} target="_blank" rel="noopener noreferrer" style={{fontSize:'13px'}}>{submission.assignmentLink}</a></p>
                  <p ><strong>Task  ID:</strong> {submission.taskId}</p>
                  <p><strong>Submitted On:</strong> {new Date(submission.timestamp?.seconds * 1000).toLocaleString()}</p>
                  <p ><strong>status:</strong> {submission.assignmentStatus}</p>
                  {submission.rewardEarned && (
                    <p ><strong>Reward:</strong><span style={{color:'green',fontWeight:'bold'}}>{submission.rewardEarned} points</span> </p>
                  )}
                  {submission.adminFeedback ? (<>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor:'#ccc',padding:'10px', borderRadius:'10px', marginBottom:'10px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 'bold', textAlign:'center',  }}>Admin Feedback</p>
                  <button
                    className="download-pdf-btn"
                    onClick={() => downloadFeedbackAsPDF(submission.adminFeedback)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#007bff',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <FaDownload style={{ marginRight: '5px' }} /> 
                  </button>
                </div>
                </>):(null)}
                </div>
                {submission.assignmentStatus === "Rejected" && (
                  <>
                  <div>
                    <button className="re-submit-button"  onClick={() => handleOpenResubmitModal(submission)}>Re Submit</button>
                  </div>
                  </>
                )}
              </div>
            ))}
        </div>
      ) : (
        <p>You have not submitted any assignments yet.</p>
      )
    ) : (
      <p>Loading your submissions...</p>
    )}

 </div>
)}



        {showMembers && (
            <div className="members-list">
              <h3>Community Members</h3>
              {members.length > 0 ? (
    <ul>
        {members.map((member) => (
            <li key={member.uid}>
                <span className="member-name">{member.name} </span> 
                <span className={`status-dot ${member.status === "online" ? "online" : "offline"}`}></span>

                  <span className="status-text">
                    {member.status}
                  </span>
            </li>
        ))}
    </ul>
) : (
    <p>No members in this community yet.</p>
)}
            </div>
          )}
        </div>
      </main>
      </div>
      {showModal && (
        <div className="task-modal-overlay">
          <div className="task-modal-content">
            <div className="task-modal-header">
              <h2>Add Task</h2>
            </div>
            <div className="task-modal-body">
              <label htmlFor="task-title">Task Title</label>
              <input
                id="task-title"
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Enter task title"
              />

              <label htmlFor="task-description">Task Description</label>
              <textarea
                id="task-description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Enter task description"
              />

              <label htmlFor="task-notes">Notes (optional)</label>
              <input
                id="task-notes"
                type="text"
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                placeholder="Add any additional notes"
              />

              <label htmlFor="task-points">Points</label>
              <input
                id="task-points"
                value={taskPoints}
                onChange={(e) => setTaskPoints(e.target.value)}
                type="number"
                
              />


              <label htmlFor="task-deadline">Set Deadline</label>
              <input
                id="task-deadline"
                type="date"
                value={taskDeadline}
                onChange={(e) => setTaskDeadline(e.target.value)}
              />
            </div>
            <div className="task-modal-footer">
              <button className="task-submit-button" onClick={handleSubmitTask}>
                Submit Task
              </button>
              <button className="task-cancel-button" onClick={handleModalClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editModal && (
         <div className="task-modal-overlay">
         <div className="task-modal-content">
           <div className="task-modal-header">
             <h2>Edit Task</h2>
           </div>
           <div className="task-modal-body">
             <label htmlFor="task-title">Task Title</label>
             <input
               id="task-title"
               type="text"
               value={taskTitle}
               onChange={(e) => setTaskTitle(e.target.value)}
               placeholder="Enter task title"
             />

             <label htmlFor="task-description">Task Description</label>
             <textarea
               id="task-description"
               value={taskDescription}
               onChange={(e) => setTaskDescription(e.target.value)}
               placeholder="Enter task description"
             />

             <label htmlFor="task-notes">Notes (optional)</label>
             <input
               id="task-notes"
               type="text"
               value={taskNotes}
               onChange={(e) => setTaskNotes(e.target.value)}
               placeholder="Add any additional notes"
             />

             <label htmlFor="task-points">Points</label>
             <input
               id="task-points"
               value={taskPoints}
               onChange={(e) => setTaskPoints(e.target.value)}
               type="number"
               
             />


             <label htmlFor="task-deadline">Set Deadline</label>
             <input
               id="task-deadline"
               type="date"
               value={taskDeadline}
               onChange={(e) => setTaskDeadline(e.target.value)}
             />
           </div>
           <div className="task-modal-footer">
             <button className="task-submit-button" onClick={handleUpdateTask}>
               Update Task
             </button>
             <button className="task-cancel-button" onClick={handleModalClose}>
               Cancel
             </button>
           </div>
         </div>
       </div>
      )}

{showAddCourseModal && (
  <div className="course-modal-overlay">
    <div className="course-modal-content">
    <div className="course-modal-header">
      <h2 className="course-modal-title">{editingCourseId ? "Edit Course" : "Add Course"}</h2>
    </div>
      <div className="course-modal-body">
        <label className="course-modal-label" htmlFor="course-title">Title</label>
        <input
          id="course-title"
          type="text"
          value={courseTitle}
          onChange={(e) => setCourseTitle(e.target.value)}
          placeholder="Enter course title"
          className="course-modal-input"
        />

        <label className="course-modal-label" htmlFor="course-description">Course Description</label>
        <textarea
          id="course-description"
          value={courseDescription}
          onChange={(e) => setCourseDescription(e.target.value)}
          placeholder="Enter course description"
          className="course-modal-textarea"
        />

<label className="course-modal-label" htmlFor="course-category">Category</label>
        <select
          id="course-category"
          value={CourseCategory}
          onChange={(e) => setCourseCategory(e.target.value)}
          className="course-modal-select"
        >
          {Course_Categories.map((cat) => (
            <option key={cat} value={cat} className="course-select-option">
              {cat}
            </option>
          ))}
        </select>

        <label className="course-modal-label" htmlFor="course-link">Links</label>
        <input
          id="course-link"
          type="text"
          value={courseLink}
          onChange={(e) => setCourseLink(e.target.value)}
          placeholder="Enter course link"
          className="course-modal-input"
        />

        <label className="course-modal-label" htmlFor="course-file">Add File</label>
        <input
          id="course-file"
          type="file"
          onChange={(e) => setCourseFile(e.target.files[0])}
          className="course-modal-input"
        />
      </div>
      <div className="task-modal-footer">
        <button className="task-submit-button" onClick={handleAddCourseSubmit}>
          Submit
        </button>
        <button className="task-cancel-button" onClick={handleCloseAddCourseModal}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


{showResubmitModal && (
  <div className="task-modal-overlay">
    <div className="task-modal-content">
      <div className="task-modal-header">
        <h2>Re-Submit Assignment</h2>
      </div>
      <div className="task-modal-body">
        <label htmlFor="new-assignment-link">New Assignment Link</label>
        <input
          id="new-assignment-link"
          type="text"
          value={newAssignmentLink}
          onChange={(e) => setNewAssignmentLink(e.target.value)}
          placeholder="Enter new assignment link"
        />
      </div>
      <div className="task-modal-footer">
        <button className="task-submit-button" onClick={handleResubmitAssignment}>
          Submit
        </button>
        <button className="task-cancel-button" onClick={() => setShowResubmitModal(false)}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


{showAssignmentModal && (
  <div className="task-modal-overlay">
    <div className="task-modal-content">
      <div className="task-modal-header">
        <h2>Submit Assignment</h2>
      </div>
      <div className="task-modal-body">
        <label htmlFor="assignment-link">Assignment Link</label>
        <input
          id="assignment-link"
          type="text"
          value={assignmentLink}
          onChange={(e) => setAssignmentLink(e.target.value)}
          placeholder="Enter assignment link"
        />
      </div>
      <div className="task-modal-footer">
        <button className="task-submit-button" onClick={handleSubmitAssignment}>
          Submit
        </button>
        <button className="task-cancel-button" onClick={handleCloseAssignmentModal}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{showAddEventModal && (
  <div className="event-modal-overlay">
    <div className="event-modal-content">
      {/* Dynamic title */}
      <h2 className="event-modal-header-title">
        {editingEventId ? "Edit Event" : "Add Event"}
      </h2>
      
      {/* Event Title */}
      <label className="event-modal-label">Event Title</label>
      <input
        type="text"
        value={eventTitle}
        onChange={(e) => setEventTitle(e.target.value)}
        placeholder="Enter event title"
        className="event-modal-input"
      />

      {/* Event Description */}
      <label className="event-modal-label">Event Description</label>
      <textarea
        value={eventDescription}
        onChange={(e) => setEventDescription(e.target.value)}
        placeholder="Enter event description"
        className="event-modal-textarea"
      ></textarea>



      {/* Event Type */}
      <label className="event-modal-label">Event Type</label>
      <select
        value={eventType}
        onChange={(e) => {
          setEventType(e.target.value);
          if (e.target.value === "custom") {
            setShowCustomEventType(true);
          } else {
            setShowCustomEventType(false);
            setCustomEventType("");
          }
        }}
        className="event-modal-select"
      >
        <option value="webinar" className="event-modal-option">Webinar</option>
        <option value="workshops" className="event-modal-option">Workshops</option>
        <option value="hackathon" className="event-modal-option">Hackathon</option>
        <option value="conferences" className="event-modal-option">Conferences</option>
        <option value="custom" className="event-modal-option">Custom</option>
      </select>

      {/* Custom Event Type */}
      {showCustomEventType && (
        <div className="event-modal-custom-event">
          <label className="event-modal-label">Custom Event Type</label>
          <input
            type="text"
            value={customEventType}
            onChange={(e) => setCustomEventType(e.target.value)}
            placeholder="Enter custom event type"
            className="event-modal-input"
          />
        </div>
      )}

      {/* Start Date */}
      <label className="event-modal-label">Start Date</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="event-modal-input"
      />

      {/* End Date */}
      <label className="event-modal-label">End Date</label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="event-modal-input"
      />

      {/* Start Time */}
      <label className="event-modal-label">Start Time</label>
      <input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className="event-modal-input"
      />

      {/* End Time */}
      <label className="event-modal-label">End Time</label>
      <input
        type="time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className="event-modal-input"
      />

      {/* Last Registration Date */}
      <label className="event-modal-label">Last Registration Date</label>
      <input
        type="date"
        value={lastRegistrationDate}
        onChange={(e) => setLastRegistrationDate(e.target.value)}
        className="event-modal-input"
      />

      {/* Rewards */}
      <label className="event-modal-label">Rewards</label>
      <textarea
        value={rewards}
        onChange={(e) => setRewards(e.target.value)}
        placeholder="Enter rewards for the event"
        className="event-modal-textarea"
      ></textarea>

      {/* Buttons */}
      <div className="event-modal-footer">
        {/* Dynamic button text */}
        <button
          onClick={handleAddEvent}
          className="event-modal-submit-btn"
        >
          {editingEventId ? "Update Event" : "Create Event"}
        </button>
        <button
          onClick={handleCloseAddEventModal}
          className="event-modal-cancel-btn"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


{ShowRegistrationModal && (

<div className="event-registration-modal-overlay">
<div className="event-registration-modal-content">
  <div className="event-registration-modal-header">
  <h2 className="event-registration-modal-title">Register for Event</h2>
  <button onClick={() => setShowRegistrationModal(false)}>Cancel</button>
  </div>
  <label className="event-registration-modal-label">Full Name</label>
  <input className="event-registration-modal-input" type="text" id="full-name" placeholder="Enter your full name" />
  <label className="event-registration-modal-label">Email Address</label>
  <input className="event-registration-modal-input" type="email" id="email" placeholder="Enter your email" />
  <label className="event-registration-modal-label">Phone Number</label>
  <input className="event-registration-modal-input" type="text" id="phone" placeholder="Enter your phone number" />
  <label className="event-registration-modal-label">Address</label>
  <textarea className="event-registration-modal-textarea" id="address" placeholder="Enter your address"></textarea>
  <div className="row">
    <input className="event-registration-modal-input" type="text" id="city" placeholder="City" />
    <input className="event-registration-modal-input" type="text" id="state" placeholder="State" />
    <input className="event-registration-modal-input" type="text" id="zipcode" placeholder="ZIP Code" />
  </div>
  <button className="event-registration-modal-register-btn"  onClick={() => handleRegisterEvent(selectedEventId, communityId, communityName, AdminID)}>
    Register
  </button>
 
</div>
</div>
)}


{isReportModalOpen && (
  <div className="community-report-modal-overlay" onClick={handleCloseReportModal}>
    <div
      className="community-report-modal-content"
      onClick={(e) => e.stopPropagation()} // Prevent closing the modal when clicking inside
    >
      {/* Modal Header */}
      <h2 className="community-report-modal-title">Submit a Report</h2>
      <p className="community-report-modal-description">Help us improve the community by reporting any issues you encounter.</p>

      {/* Issue Type Dropdown */}
      <div className="community-report-modal-section">
        <label htmlFor="issue-type" className="modal-label">Select an Issue:</label>
        <select
          id="issue-type"
          value={selectedIssue}
          onChange={(e) => setSelectedIssue(e.target.value)}
          className="community-report-modal-select"
        >
          <option className="community-report-modal-select-option" value="" disabled>
            Choose an issue
          </option>
          <option value="Inappropriate Content">Inappropriate Content</option>
          <option value="Harassment or Bullying">Harassment or Bullying</option>
          <option value="Spam or Scams">Spam or Scams</option>
          <option value="Hate Speech or Symbols">Hate Speech or Symbols</option>
          <option value="Misinformation">Misinformation</option>
          <option value="Privacy Concerns">Privacy Concerns</option>
          <option value="Copyright Infringement">Copyright Infringement</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Issue Description */}
      <div className="community-report-modal-section">
        <label htmlFor="issue-description" className="community-report-modal-label">Describe the Issue:</label>
        <textarea
          id="issue-description"
          value={issueDescription}
          onChange={(e) => setIssueDescription(e.target.value)}
          className="community-report-modal-textarea"
          placeholder="Provide a detailed description of the issue..."
        ></textarea>
      </div>

      {/* Action Buttons */}
      <div className="community-report-modal-actions">
        <button className="community-report-modal-cancel-button" onClick={handleCloseReportModal}>
          Cancel
        </button>
        <button className="community-report-modal-submit-button" onClick={handleSubmitReport}>
          Submit Report
        </button>
      </div>
    </div>
  </div>
)}




    </div>
  );
};

export default CommunityPage;