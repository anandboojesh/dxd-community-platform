import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import "../styles/components/CoursePage.css"

const CoursePage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState("Overview");
    const [course, setCourse] = useState(null);  // State to hold the course data
    const [loading, setLoading] = useState(true); // State to track loading status

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                // Reference to the course document in Firestore
                const courseRef = doc(db, "community-courses", courseId);
                const docSnap = await getDoc(courseRef);

                if (docSnap.exists()) {
                    setCourse(docSnap.data()); // Set course data in state
                } else {
                    console.log("No such course!");
                }
            } catch (error) {
                console.error("Error fetching course data: ", error);
            } finally {
                setLoading(false);  // Set loading to false once data is fetched
            }
        };

        fetchCourseData();
    }, [courseId]);

    const renderPlayer = (link) => {
        if (link.includes("youtube.com") || link.includes("youtu.be")) {
            const embedLink = link.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/");
            return <iframe src={embedLink} width="100%" height="400px" frameBorder="0" allowFullScreen></iframe>;
        } else if (link.includes("zoom.us")) {
            const meetingID = link.split("/j/")[1]?.split("?")[0];
            return <iframe src={`https://zoom.us/wc/${meetingID}/join`} width="100%" height="600px" frameBorder="0"></iframe>;
        }else if (link.includes("meet.google.com")) {
            // Embed Google Meet
            const meetLink = link.startsWith("https://") ? link : `https://${link}`;
            return (
                <iframe
                    src={meetLink}
                    width="100%"
                    height="400px"
                    frameBorder="0"
                    allow="camera; microphone"
                ></iframe>
            );
        } else {
            return <p>Unsupported video or meeting link.</p>;
        }
    };
    
    if (loading) {
        return <div className="loading-message">Loading...</div>;  // Display loading message while data is being fetched
    }

    if (!course) {
        return <div className="error-message">Course not found.</div>;  // Display message if no course data found
    }

    return (
        <div className="course-page-container">
      
            <div className="course-page-content">
            <div className="course-page-header-">
                <button className="go-back-button" onClick={() => navigate(-1)}>Go Back</button>
                <h2 className="course-title">{course.title}</h2>
                <p></p>
            </div>
            <div className="course-page-course-player">
                {renderPlayer(course.link)}  {/* Render the course video link */}
            </div>
            <div className="course-page-course-tabs">
                <button
                    className={`course-page-tab-button ${activeTab === "Overview" ? "active" : ""}`}
                    onClick={() => setActiveTab("Overview")}
                >
                    Overview
                </button>
                <button
                    className={`course-page-tab-button ${activeTab === "Notes" ? "active" : ""}`}
                    onClick={() => setActiveTab("Notes")}
                >
                    Notes
                </button>
                <button
                    className={`course-page-tab-button ${activeTab === "Materials" ? "active" : ""}`}
                    onClick={() => setActiveTab("Materials")}
                >
                    Materials
                </button>
            </div>
            <div className="course-page-tab-content-classname">
                {/* Render the content of the selected tab */}
                {activeTab === "Overview" && <p className="course-page-course-description">{course.description}</p>}
                {/* Add other tab content as needed */}
            </div>
            </div>
        </div>
    );
};

export default CoursePage;
