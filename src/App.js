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
} from 'react-icons/fa';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import CommunityPage from './pages/CommunityPage';
import TaskDetailsPage from './pages/TaskDetailsPage';
import CommunityManagementPage from './pages/CommunityManagementPage';
import { auth, db } from './services/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, getDocs,  } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import ActivityPage from './pages/activity';
import AdminProfilePage from './pages/AdminProfilePage';
import MyCommunities from './pages/myCommuities';
import Communities from './pages/communityList';
import Leaderboard from './pages/LeaderboardPage';
import ViewCommunity from './pages/ViewCommunity';
import CoursePage from './pages/CoursePage';
import SearchResults from "./pages/SearchResults";

const MainNavbar = ({ onSignOut, handleSignOut, toggleModal }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState("");

  const navigate = useNavigate();

  
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
            />
            <span>
              Hi, {userData.username || userData.name || user.displayName || 'User'}
            </span>
            <button onClick={onSignOut} className="sign-out-btn">
              Sign Out
            </button>
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
                className={`navbar-link ${isActive('/adminprofile') ? 'active' : ''}`}
              >
                <FaUser className="icon" size={20} />
                Profile
              </Link>
            </li>
            <li className="navbar-item">
              <Link
                to="/communities"
                className={`navbar-link ${isActive('/communities') ? 'active' : ''}`}
              >
                <FaUsers className="icon" size={30} />
                Communities
              </Link>
            </li>

            <li className="sub-navbar-item">
              <Link
                to="/leaderboard"
                className={`navbar-link ${isActive('/leaderboard') ? 'active' : ''}`}
              >
                <FaTrophy className="icon" size={30} />
                Leaderboard
              </Link>
            </li>
            <li className="sub-navbar-item">
              <Link
                to="/discover"
                className={`navbar-link ${isActive('/discover') ? 'active' : ''}`}
              >
                <FaCompass className="icon" size={30} />
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
                className={`navbar-link ${isActive('/profile') ? 'active' : ''}`}
              >
        
                Profile
              </Link>
            </li>
        

            <li className="sub-navbar-item">
              <Link
                to="/leaderboard"
                className={`navbar-link ${isActive('/leaderboard') ? 'active' : ''}`}
              >
            
                Leaderboard
              </Link>
            </li>
            <li className="sub-navbar-item">
              <Link
                to="/discover"
                className={`navbar-link ${isActive('/discover') ? 'active' : ''}`}
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
              </>
            )}

<Route path="/search-results" element={<SearchResults />} />
          </Routes>
        </div>
        {isModalOpen && (
          <div className="main-modal-overlay">
            <div className="main-modal-content">
            <div>
      <div className='main-login-container'>
        <h2 className='main-login-title'>Log In</h2>

        <button onClick={handleGoogleLogin} className="main-login-auth-button">
        <FaGoogle size={20} />  Continue with Google <p></p>
        </button>

        <Box display="flex" alignItems="center" my={2}>
        <Divider sx={{ flexGrow: 1, bgcolor: "#444" }} />
        <Typography variant="body2" sx={{ color: "#aaa", mx: 2 }}>
          OR
        </Typography>
        <Divider sx={{ flexGrow: 1, bgcolor: "#444" }} />
      </Box>

        {error && <p className="error">{error}</p>}
        <form onSubmit={handleEmailPasswordLogin}>
          <div className="main-login-input-group">
            <label className='main-login-label' htmlFor="email">Email or Username</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='main-login-input'
            />
          </div>
          <div className="main-login-input-group">
            <label className='main-login-label' htmlFor="password">Password</label>
            <input
             className='main-login-input'
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="main-login-button">
            Log In
          </button>
        </form>

        <div className="main-login-footer-links">
          <a href="/forgot-password" className="main-login-forgot-password">
            Forgot Password?
          </a>
          <p>
            New to the platform? <a href="/signup">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
              <button onClick={toggleModal} className="main-login-close-modal-btn">
                Close
              </button>
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