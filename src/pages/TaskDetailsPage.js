import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import "../styles/components/TaskDetailsPage.css";
import { FaArrowLeft, FaArrowRight, FaBackward, FaBell, FaEllipsisV, FaUsers } from "react-icons/fa";

const TaskDetailsPage = () => {
  const { communityId, taskId } = useParams();
  const [task, setTask] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");

  const navigate = useNavigate()

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const taskRef = doc(db, "community-tasks", communityId, "tasks", taskId);
        const taskDoc = await getDoc(taskRef);

        if (taskDoc.exists()) {
          setTask(taskDoc.data());
        } else {
          console.log("Task not found");
        }
      } catch (error) {
        console.error("Error fetching task details:", error);
      }
    };

    fetchTaskDetails();
  }, [communityId, taskId]);

  if (!task) return <p>Loading task details...</p>;

  return (
    <div className="task-details-page">
        <nav className="task-details-navbar">
            
           
               
                    <FaArrowLeft onClick={() => navigate(-1)} />
               
                <h3 style={{margin:'10px'}}>{task.taskTitle}</h3>
                <p></p>
           
        </nav>
        <div className="task-details-content">
       <div className="task-details-container">
      <h1>{task.taskTitle}</h1>
      <p><strong>Description:</strong> {task.taskDescription}</p>
      <p><strong>Notes:</strong> {task.taskNotes}</p>
      <p><strong>Deadline:</strong> {task.taskDeadline}</p>
      <p><strong>Created on:</strong> {new Date(task.timestamp?.seconds * 1000).toLocaleString()}</p>
      </div> 
      </div>
    </div>
  );
};

export default TaskDetailsPage;
