import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate, Link, useLocation } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignupPage';
import DiscoverPage from './pages/DiscoverPage';
import { FaUser, FaUsers, FaTrophy, FaCompass } from "react-icons/fa";
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import CommunityPage from './pages/CommunityPage';
import TaskDetailsPage from './pages/TaskDetailsPage';
import CommunityManagementPage from './pages/CommunityManagementPage';
import { auth, db } from "./services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item">
          <Link
            to="/profile"
            className={`navbar-link ${isActive("/profile") ? "active" : ""}`}
          >
            <FaUser className="icon" size={20} />
            Profile
          </Link>
        </li>
        <li className="navbar-item">
          <Link
            to="/setting"
            className={`navbar-link ${isActive("/communities") ? "active" : ""}`}
          >
            <FaUsers className="icon" size={30} />
            Communities
          </Link>
        </li>
        <li className="navbar-item">
          <Link
            to="/leaderboard"
            className={`navbar-link ${isActive("/leaderboard") ? "active" : ""}`}
          >
            <FaTrophy className="icon" size={30} />
            Leaderboard
          </Link>
        </li>
        <li className="navbar-item">
          <Link
            to="/discover"
            className={`navbar-link ${isActive("/discover") ? "active" : ""}`}
          >
            <FaCompass className="icon" size={30} />
            Discover
          </Link>
        </li>
      </ul>
    </nav>
  );
};

function App() {
  const [userRole, setUserRole] = useState(null); // Store user role state

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid); // Get user data from Firestore
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role); // Assuming role is stored as 'role'
        }
      }
    };

    fetchUserRole();
  }, []);

  

  return (
    <Router>
      {userRole === "Member" && location.pathname !== "/login" && location.pathname !== "/signup" && (
        <Navbar /> // Display Navbar if user is a member and not on login/signup page
      )}
      <div className="app-content">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/setting' element={<SettingsPage />} />
          <Route path="/community/:communityId" element={<CommunityPage />} />
          <Route path="/community/:communityId/tasks/:taskId" element={<TaskDetailsPage />} />
          <Route path="/community/:communityId/manage" element={<CommunityManagementPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
