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
import { onAuthStateChanged } from 'firebase/auth';
import ActivityPage from './pages/activity';
import AdminProfilePage from './pages/AdminProfilePage';
import MyCommunities from './pages/myCommuities';
import Communities from './pages/communityList';
import Leaderboard from './pages/LeaderboardPage';

const Navbar = ({userRole}) => {
  const Location = useLocation();
  const isActive = (path) => Location.pathname === path;

  return (
    <nav className="navbar">
      <ul className="navbar-list">

      {userRole === "Admin" && (
        <>
         <li className="navbar-item">
          <Link
            to="/adminprofile"
            className={`navbar-link ${isActive("/adminprofile") ? "active" : ""}`}
          >
            <FaUser className="icon" size={20} />
            Profile
          </Link>
        </li>
        <li className="navbar-item">
          <Link
            to="/communities"
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
        </>
      )}

        {userRole === "Member" && (
          <>
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
            to="/MyCommunities"
            className={`navbar-link ${isActive("/MyCommunities") ? "active" : ""}`}
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
        </>
        ) }

        {!userRole && (
         null
        )}
      </ul>
    </nav>
  );
};

function App() {
  const [userRole, setUserRole] = useState(null); // Store user role state
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            console.error("No user document found!");
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );

  
  

  return (
    <Router>
     
        <Navbar userRole={userRole} /> 
      
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
          <Route path='activity' element={<ActivityPage/>}/>
          <Route path='MyCommunities' element={<MyCommunities/>} />
          <Route path='/leaderboard' element={<Leaderboard/>}/>

          {userRole === "Admin" && (
            <>
              <Route path='/adminProfile' element={<AdminProfilePage/>}/>
              <Route path='/communities' element={<Communities/>}/>
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
