import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/components/CommunityPage.css";
import { auth, db, } from "../services/firebase";
import { doc, getDoc, collection, getDocs, serverTimestamp, setDoc, addDoc, updateDoc, arrayUnion, deleteDoc } from "firebase/firestore";
import { FaBell, FaDownload, FaEdit, FaEllipsisV, FaTrash, FaUsers, } from "react-icons/fa";
import { ref, } from "firebase/database";
import { CloudinaryContext, Image, Video, Transformation } from 'cloudinary-react';
import jsPDF from "jspdf";

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
        timestamp: serverTimestamp(),  // Automatically add timestamp
        communityId,
        communityName,
        adminId: AdminID,  // Set the admin ID as the current user ID
        points:taskPoints
      };
  
      // Reference to the tasks collection in the specific community
      const tasksCollectionRef = collection(db, "community-tasks", communityId, "tasks");
      const newTaskDocRef = await addDoc(tasksCollectionRef, taskData);
  
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
  
      // Reference to the specific submission
      const submissionRef = doc(db, "community-assignment-submission", submissionId);
  
      // Update the status and feedback in Firestore
      await updateDoc(submissionRef, {
        assignmentStatus: newStatus,
        adminFeedback: submission.feedbackText?.trim()
      });
  
      // Update the local state
      setSubmissions((prevSubmissions) =>
        prevSubmissions.map((submission) =>
          submission.id === submissionId
            ? { ...submission, assignmentStatus: newStatus, adminFeedback: submission.feedbackText?.trim() }
            : submission
        )
      );
  
      alert(`Assignment status updated to "${newStatus}"`);
    } catch (error) {
      console.error("Error updating assignment status:", error);
      alert("Failed to update status.");
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

  const handleSaveFeedback = async (submissionId) => {
    try {
      const submission = submissions.find((sub) => sub.id === submissionId);
  
      // Reference to the specific submission
      const submissionRef = doc(db, "community-assignment-submission", submissionId);
  
      // Update Firestore
      await updateDoc(submissionRef, {
        adminFeedback: submission.feedbackText?.trim(),
      });
  
      // Update local state
      setSubmissions((prevSubmissions) =>
        prevSubmissions.map((submission) =>
          submission.id === submissionId
            ? {
                ...submission,
                adminFeedback: submission.feedbackText?.trim(),
                isEditingFeedback: false,
              }
            : submission
        )
      );
  
      alert("Feedback saved successfully!");
    } catch (error) {
      console.error("Error saving feedback:", error);
      alert("Failed to save feedback.");
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
        points: selectedTask.points,
        deadline: selectedTask.taskDeadline
      };
  
      const assignmentCollectionRef = collection(
        db,
        "community-assignment-submission"
      );
      await addDoc(assignmentCollectionRef, assignmentData);
  
      alert("Assignment submitted successfully!");
      setAssignmentLink(""); // Reset the input field
      setShowAssignmentModal(false);
      setSelectedTask(null); // Clear the selected task
  
      // Optionally update the local submissions state
      setSubmissions((prevSubmissions) => [...prevSubmissions, assignmentData]);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      alert("Failed to submit assignment.");
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
                        name: userData.name || "Anonymous"  // Default to "Anonymous" if name is missing
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
    "Courses",
    "Leaderboard",
    ...(isAdmin ? ["Submissions","Manage"] : []),
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
      <aside className="sidebar">
        <h2>{communityName || "Community Sidebar"}</h2>
 
        {sidebarOptions.map((option) => (
          <div
            key={option}
            className={`sidebar-item ${activeSection === option ? "active" : ""}`}
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
        <div
          className="members-icon-container"
          onClick={() => setShowMembers(!showMembers)}
        >
          <FaUsers className="navbar-icon" title="Community Members" />
        </div>
        
      </>
    )}
          <FaBell className="navbar-icon" title="Announcements" />
          <FaEllipsisV className="navbar-icon" title="More Options" />
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
        <button onClick={handleAddOrUpdateRule}>
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

        {activeSection === "Announcements" && <p>Here are the announcements.</p>}
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

        {activeSection === "Courses" && <p>Here are the courses.</p>}
        {activeSection === "Leaderboard" && <p>Check out the leaderboard.</p>}
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
                <p style={{fontSize:'13px'}}>
                      <strong>Admin Feedback:</strong> {submission.adminFeedback}{" "}
                    </p>
                  {submission.adminFeedback ? (
                    null
                  ) : (
                    <>
                      <textarea
                        className="feedback-textarea"
                        placeholder="Enter feedback for this submission"
                        value={submission.feedbackText ?? submission.adminFeedback ?? ""}
                        onChange={(e) => handleFeedbackChange(submission.id, e.target.value)}
                      ></textarea>
                    </>
                  )}
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
                  <p><strong>Submitted On:</strong> {new Date(submission.timestamp?.seconds * 1000).toLocaleString()}</p>
                  <p ><strong>status:</strong> {submission.assignmentStatus}</p>
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
                    <button className="re-submit-button">Re Submit</button>
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
                <span className="member-name">{member.name}</span>
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


    </div>
  );
};

export default CommunityPage;