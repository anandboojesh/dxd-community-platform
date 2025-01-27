import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  Box,
  Typography,
  Button,
  TextField,
  Divider,
  Container,
  debounce,
} from "@mui/material";
import LoginPage from './pages/LoginModal';
import SignUpPage from './pages/SignupPage';
import DiscoverPage from './pages/DiscoverPage';
import {
  FaUser,
  FaUsers,
  FaTrophy,
  FaCompass,
  FaSearch,
  FaGoogle,
  FaBug,
} from 'react-icons/fa';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import CommunityPage from './pages/CommunityPage';
import TaskDetailsPage from './pages/TaskDetailsPage';
import CommunityManagementPage from './pages/CommunityManagementPage';
import { auth, db } from './services/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, getDocs,  } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import ActivityPage from './pages/activity';
import AdminProfilePage from './pages/AdminProfilePage';
import MyCommunities from './pages/myCommuities';
import Communities from './pages/communityList';
import Leaderboard from './pages/LeaderboardPage';
import ViewCommunity from './pages/ViewCommunity';
import CoursePage from './pages/CoursePage';
import SearchResults from "./pages/SearchResults";
import ReportsPage from './pages/reportsPanel';
import { BugReport } from '@mui/icons-material';

const MainNavbar = ({ onSignOut, handleSignOut, toggleModal }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState("");

  const navigate = useNavigate();

  const handleProfilePicClick = (e) => {
    e.stopPropagation(); // Prevent the event from propagating and closing the modal
    toggleModal(); // Toggle the modal state
  };
  
  
  const [searchResults, setSearchResults] = useState({
    communities: [],
    events: [],
    courses: [],
  });
  

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        try {
          const userDocRef = doc(db, 'users', authUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = debounce(async (query) => {
    if (!query.trim()) {
      setSearchResults({ communities: [], events: [], courses: [] }); // Clear results if query is empty
      navigate("/"); // Navigate to the home page or a default route
      return;
    }
  
    try {
      const communitiesQuery = await getDocs(collection(db, "communities"));
      const eventsQuery = await getDocs(collection(db, "community-events"));
      const coursesQuery = await getDocs(collection(db, "community-courses"));
  
      const communities = communitiesQuery.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (community) =>
            community.name && community.name.toLowerCase().includes(query.toLowerCase())
        );
  
      const events = eventsQuery.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (event) =>
            event.title && event.title.toLowerCase().includes(query.toLowerCase())
        );
  
      const courses = coursesQuery.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (course) =>
            course.name && course.name.toLowerCase().includes(query.toLowerCase())
        );
  
      const results = { communities, events, courses };
  
      // Navigate to search results page with results
      navigate("/search-results", { state: { results, query } });
    } catch (error) {
      console.error("Error performing search:", error);
      alert(error);
    }
  }, 300);
  
  

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      handleSearch(query); // Trigger live search
    } else {
      // Clear search results if input is empty
      setSearchResults({ communities: [], events: [], courses: [] });
    }
  };
  
  const handleSearchBarClick = () => {
    navigate('/search-results'); // Navigate to the search results page
  };

  return (
    <div className="main-navbar">
      <div className="navbar-left">
        <h1 className='site-logo'>Community Platform</h1>
      </div>
      <div className="navbar-center">
      <input
          type="text"
          placeholder="Search for communities, events, courses..."
          value={searchQuery}
          onChange={handleInputChange}
          onClick={handleSearchBarClick}
          className="main-navbar-search-input"
        />
      </div>
      <div className="navbar-right">
      {user && userData ? (
          <div className="main-navbar-user-info">
            <img
              src={userData.avatar || user.photoURL || require('./pages/assets/default_profile_avatar.jpg')}
              alt="Avatar"
              className="avatar"
              onClick={handleProfilePicClick}
            />
            <span>
              Hi, {userData.name || userData.username || user.displayName || 'User'}
            </span>
          </div>
        ) : (
          <button className="sign-in-btn" onClick={() => navigate("/login")}>
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};

const Navbar = ({ user, userRole }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  // Don't render Navbar if no user is authenticated
  if (!user) return null;

  return (
    <nav className="sub-navbar">
      <ul className="sub-navbar-list">
        {userRole === 'Admin' && (
          <div className='sub-navbar-left'>
          <>
            <li className="sub-navbar-item">
              <Link
                to="/adminprofile"
                className={`sub-navbar-link ${isActive('/adminprofile') ? 'active' : ''}`}
              >
          
                Profile
              </Link>
            </li>
            <li className="navbar-item">
              <Link
                to="/communities"
                className={`sub-navbar-link ${isActive('/communities') ? 'active' : ''}`}
              >
            
                Communities
              </Link>
            </li>

            <li className="sub-navbar-item">
              <Link
                to="/leaderboard"
                className={`sub-navbar-link ${isActive('/leaderboard') ? 'active' : ''}`}
              >
          
                Leaderboard
              </Link>
            </li>
            <li className="sub-navbar-item">
              <Link
                to="/discover"
                className={`sub-navbar-link ${isActive('/discover') ? 'active' : ''}`}
              >
             
                Discover
              </Link>
            </li>
          </>
          </div>
        )}

        {userRole === 'Member' && (
          <div className='sub-navbar-left'>
          <>
            <li className="sub-navbar-item">
              <Link
                to="/profile"
                className={`sub-navbar-link ${isActive('/profile') ? 'active' : ''}`}
              >
        
                Profile
              </Link>
            </li>
        

            <li className="sub-navbar-item">
              <Link
                to="/leaderboard"
                className={`sub-navbar-link ${isActive('/leaderboard') ? 'active' : ''}`}
              >
            
                Leaderboard
              </Link>
            </li>
            <li className="sub-navbar-item">
              <Link
                to="/discover"
                className={`sub-navbar-link ${isActive('/discover') ? 'active' : ''}`}
              >
                Discover
              </Link>
            </li>
          </>
          </div>
        )}
      </ul>
    </nav>
  );
};



function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
   const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [userProfilePic, setUserProfilePic] = useState("");
  const [name, setName] = useState("");
  const modalRef = useRef(null);
    const [bugCategory, setBugCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [expectedBehavior, setExpectedBehavior] = useState("");
  const [actualBehavior, setActualBehavior] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [isBugReport, setIsBugReport] = useState(false);

  const toggleBugReport = () => {
    setIsBugReport(false);
    setIsBugReport(true)
  }

  const closeBugReport = () => {
    setIsBugReport(false)
  }
  
  const handleSubmit = () => {
    // Form submission logic here
    console.log({
      bugCategory,
      severity,
      description,
      steps,
      expectedBehavior,
      actualBehavior,
      screenshot
    });

  };


  useEffect(() => {
    // Show splash screen for 3 seconds before loading the app
    const splashTimeout = setTimeout(() => {
      setShowSplashScreen(false);
    }, 5000);

    return () => clearTimeout(splashTimeout); // Cleanup timeout
  }, []);


  const toggleModal = () => setIsModalOpen(!isModalOpen);


  const applyTheme = (variables) => {
    const root = document.documentElement;
    Object.keys(variables).forEach((key) => {
      root.style.setProperty(key, variables[key]);
    });
  };

  // Load saved theme from localStorage on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme) {
      const variables = JSON.parse(savedTheme);
      applyTheme(variables);
    }
  }, []); // Runs only once on app load
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
            setUserProfilePic(userDoc.data().avatar);
            setName(userDoc.data().name);
          } else {
            console.error('No user document found!');
          }
        } catch (err) {
          console.error('Error fetching user role:', err);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const AppContent = () => {
    const navigate = useNavigate();

    useEffect(() => {
      const handleEscapeKey = (e) => {
        if (e.key === 'Escape') {
          setIsModalOpen(false); // Close the modal if Escape is pressed
        }
      };
    
      // Add event listener when the component mounts
      window.addEventListener('keydown', handleEscapeKey);
    
      // Clean up event listener when the component unmounts
      return () => {
        window.removeEventListener('keydown', handleEscapeKey);
      };
    }, []); // Empty dependency array means this will run once when the component mounts
    

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
          setIsModalOpen(false); // Close the modal if click is outside
        }
      };
    
      // Add event listener when the component mounts
      window.addEventListener('click', handleClickOutside);
    
      // Clean up event listener when the component unmounts
      return () => {
        window.removeEventListener('click', handleClickOutside);
      };
    }, []);
    
    
  const updateProfileStatus = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid); // Reference to the user's document
      const userDoc = await getDoc(userDocRef); // Fetch user data
      const userData = userDoc.data();
  
      if (userData) {
        const role = userData.role; // Access the user's role
        if (role === "Admin" || role === "Member") {
          // Update the profileStatus
          await updateDoc(userDocRef, { profileStatus: "online" });
  
          // Navigate based on the user's role
          if (role === "Admin") {
            navigate("/adminprofile");
          } else if (role === "Member") {
            navigate("/profile");
          }
        } else {
          throw new Error("Access denied: Unauthorized role.");
        }
      } else {
        throw new Error("No user data found.");
      }
    } catch (err) {
      console.error("Error updating profile status:", err);
      setError(err.message || "An error occurred.");
    }
  };
  

  const handleAccounSettingClick = () => {
    setIsModalOpen(false);
    navigate('/setting')
  }

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password); // Define userCredential
    const user = userCredential.user; // Access the user object

    const loginTimestamp = new Date();
    await setDoc(doc(collection(db, "activity_logs"), user.uid + "_" + loginTimestamp.getTime()), {
      userId: user.uid,
      email: user.email,
      action: "Login",
      message: `Logged in from "${window.location.hostname}" on ${loginTimestamp.toISOString()}`,
      timestamp: loginTimestamp,
      ip: window.location.hostname,
    });

    // Update profileStatus
    await updateProfileStatus(user.uid);
    setIsModalOpen(false);

    } catch (err) {
      setError(err.message);
    }
  };

  const handlenavigateProfile = () => {
    setIsModalOpen(false);
    navigate('/profile')
  }

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider); // Define userCredential
    const user = userCredential.user; // Access the user object

    const loginTimestamp = new Date();
    await setDoc(doc(collection(db, "activity_logs"), user.uid + "_" + loginTimestamp.getTime()), {
      userId: user.uid,
      email: user.email,
      action: "Login",
      message: `Logged in from "${window.location.hostname}" on ${loginTimestamp.toISOString()}`,
      timestamp: loginTimestamp,
      ip: window.location.hostname,
    });

    // Update profileStatus
    await updateProfileStatus(user.uid);
    setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

    const handleLogout = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          await updateDoc(userDocRef, { profileStatus: "offline" });
    
          const loginTimestamp = new Date();
          await setDoc(doc(collection(db, "activity_logs"), user.uid + "_" + loginTimestamp.getTime()), {
            userId: user.uid,
            email: user.email,
            action: "Logout",
            message: `Logged out from "${window.location.hostname}" on ${loginTimestamp.toISOString()}`,
            timestamp: loginTimestamp,
            ip: window.location.hostname,
          });
        }
    
        await auth.signOut();
        setIsModalOpen(false);
        navigate("/");
      } catch (error) {
        console.error("Error logging out: ", error);
        alert(error);
      }
    };

    if (loading)
      return (
        <div>
          <p>Loading...</p>
        </div>
      );

    return (
      <>
        {user && <Navbar user={user} userRole={userRole} />}
        <MainNavbar user={user} onSignOut={handleLogout} toggleModal = {toggleModal}/>
        <div className="app-content">
          <Routes>

            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<DiscoverPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/discover" element={<DiscoverPage toggleModal={toggleModal} />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/setting" element={<SettingsPage />} />
            <Route path="/community/:communityId" element={<CommunityPage />} />
            <Route path="/viewCommunity/:communityId" element={<ViewCommunity/>}/>
            <Route path="/course/:courseId" element={<CoursePage  />} />

           
            <Route
              path="/community/:communityId/tasks/:taskId"
              element={<TaskDetailsPage />}
            />
            <Route
              path="/community/:communityId/manage"
              element={<CommunityManagementPage />}
            />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/MyCommunities" element={<MyCommunities />} />
            <Route path="/leaderboard" element={<Leaderboard />} />

            {userRole === 'Admin' && (
              <>
                <Route path="/adminProfile" element={<AdminProfilePage />} />
                <Route path="/communities" element={<Communities />} />
                <Route path='/report' element={<ReportsPage/>} />
              </>
            )}

<Route path="/search-results" element={<SearchResults />} />
          </Routes>
        </div>
        {isModalOpen && (
          <div className='main-sidebar-container'>
          <div className="main-sidebar" ref={modalRef}>
            <div className='main-sidebar-header'>
              <h2>Hey, {name|| "loading..."}</h2>
              <img src={userProfilePic || auth.currentUser?.photoURL||""} alt='Profile pic'/>
              
            </div>
          <ul className="main-sidebar-options">
            <li className='main-sidebar-item' onClick={handlenavigateProfile}>Profile</li>
            <li className='main-sidebar-item'>Notifications</li>
            <li className='main-sidebar-item'>Registered Events</li>
            <li className='main-sidebar-item' onClick={toggleBugReport}>Report Bug</li>
            <li className='main-sidebar-item' onClick={handleAccounSettingClick}> Accounts & Settings</li>
            
          </ul>

          <div className='main-sidebar-footer'>
            <button className='main-sidebar-logout-btn' onClick={handleLogout}>Logout</button>
          </div>
        </div>
        </div>
        )}

        {isBugReport && (
           <div className={`bug-report-modal ${isBugReport ? 'open' : ''}`} onClick={closeBugReport}>
           <div className="bug-report-content" onClick={(e) => e.stopPropagation()}>
             <div className="bug-report-header">
               <FaBug />
               <h2>Report a Bug</h2>
             </div>
     
             <div className="bug-report-body">
               <div className="bug-report-form-group">
                 <label className='bug-report-label'>Bug Category</label>
                 <select
                 className='bug-report-select'
                   value={bugCategory}
                   onChange={(e) => setBugCategory(e.target.value)}
                   required
                 >
                   <option className='bug-report-select-option' value="UI">UI</option>
                   <option className='bug-report-select-option' value="Performance">Performance</option>
                   <option className='bug-report-select-option' value="Functionality">Functionality</option>
                   <option className='bug-report-select-option' value="Security">Security</option>
                   <option className='bug-report-select-option' value="Network/Connectivity">Network/Connectivity</option>
                   <option className='bug-report-select-option' value="Compatibility">Compatibility</option>
                   <option className='bug-report-select-option' value="Crashes/Errors">Crashes/Errors</option>
                   <option className='bug-report-select-option' value="Localization/Internationalization">Localization</option>
                   <option className='bug-report-select-option' value="Accessibility">Accessibility</option>
                   <option className='bug-report-select-option' value="Notifications">Notifications</option>
                   <option className='bug-report-select-option' value="Data Integrity">Data Integrity</option>
                   <option className='bug-report-select-option' value="User Permissions">User Permissions</option>
                   <option className='bug-report-select-option' value="Others">Others</option>
                 </select>
               </div>
     
               <div className="bug-report-form-group">
                 <label className='bug-report-label'>Severity</label>
                 <select
                   value={severity}
                   onChange={(e) => setSeverity(e.target.value)}
                   required
                   className='bug-report-select'
                 >
                   <option className='bug-report-select-option' value="Critical">Critical</option>
                   <option className='bug-report-select-option' value="High">High</option>
                   <option className='bug-report-select-option' value="Medium">Medium</option>
                   <option className='bug-report-select-option' value="Low">Low</option>
                   <option className='bug-report-select-option' value="Trivial">Trivial</option>
                   <option className='bug-report-select-option' value="Enhancement">Enhancement</option>
                 </select>
               </div>
     
               <div className="bug-report-form-group">
                 <label className='bug-report-label'>Bug Description</label>
                 <textarea
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   required
                   placeholder="Describe the issue in detail..."
                   className='bug-report-textarea'
                 />
               </div>
     
               <div className="bug-report-form-group">
                 <label className='bug-report-label'>Steps to Reproduce</label>
                 <textarea
                 className='bug-report-textarea'
                   value={steps}
                   onChange={(e) => setSteps(e.target.value)}
                   placeholder="Provide steps to reproduce the bug..."
                 />
               </div>
     
               <div className="bug-report-form-group">
                 <label className='bug-report-label'>Expected Behavior</label>
                 <textarea
                 className='bug-report-textarea'
                   value={expectedBehavior}
                   onChange={(e) => setExpectedBehavior(e.target.value)}
                   placeholder="What should have happened?"
                 />
               </div>
     
               <div className="bug-report-form-group">
                 <label className='bug-report-label'>Actual Behavior</label>
                 <textarea
                 className='bug-report-textarea'
                   value={actualBehavior}
                   onChange={(e) => setActualBehavior(e.target.value)}
                   placeholder="What actually happened?"
                 />
               </div>
     
               <div className="bug-report-form-group">
                 <label className='bug-report-label'>Attach Screenshot (optional)</label>
                 <input
                 className='bug-report-file'
                   type="file"
                   accept="image/*"
                   onChange={(e) => setScreenshot(e.target.files[0])}
                 />
               </div>
             </div>
     
             <div className="bug-report-footer">
               <button className='bug-report-submit-btn' onClick={handleSubmit}>Submit Report</button>
               <button className='bug-report-cancel-btn' onClick={closeBugReport}>Cancel</button>
             </div>
           </div>
         </div>
        )}
      </>
    );
  };

  return (
    <Router>
      {showSplashScreen ? (
      <div class="splash-screen">
      <div class="splash-content">
        <img src={require('./pages/assets/logo.png')} alt="Logo" class="splash-logo" />
        <h1 class="splash-title">Community Platform</h1>
        <p class="splash-subtitle">Connecting People, Empowering Communities</p>
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
    
     
      ) : (
        <AppContent />
      )}
    </Router>
  );
}

export default App;