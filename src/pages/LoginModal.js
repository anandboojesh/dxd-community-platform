import React, { useState, } from "react";
import { auth, db } from "../services/firebase";
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
  Link,
  Container,
} from "@mui/material";
import { FaGoogle, FaApple } from "react-icons/fa";
import { MdPhoneIphone } from "react-icons/md"; 
import { useNavigate } from "react-router-dom";
import Lottie from 'lottie-react';
import loadingAnimation from './assets/loader.json'; 
import "../styles/components/LoginPage.css";
import { addDoc, collection, doc, serverTimestamp, setDoc, updateDoc, getDoc, getDocs, query, where } from "firebase/firestore";
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const updateProfileStatus = async (uid) => {
    setIsLoading(true)
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
    }finally{
      setIsLoading(false)
    }
  };
  

  const handleGoBack = () => {
    navigate(-1); // Navigates to the previous page in the history stack
  };
  

  
    const handleGoogleSignUpOrLogin = async () => {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
    
        // Check if the user already exists in the database
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
    
        if (querySnapshot.empty) {
          // Create a new user if they don't exist
          await setDoc(doc(usersRef, user.uid), {
            name: user.displayName || "No name",
            email: user.email,
            username: user.email.split('@')[0],
            dateOfBirth: "",
            signUpDate: serverTimestamp(),
            role: "Member",
            uid: user.uid,
            userScore: 0,
          });
        }
    
        // Log the user in and update profile status
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
    
        navigate("/profile");
      } catch (err) {
        setError(err.message);
        alert(err)
      }finally{
        setIsLoading(false);
      }
    };

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
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

    } catch (err) {
      setError(err.message);
    }finally{
      setIsLoading(false);
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
    } catch (err) {
      setError(err.message);
    }
  };


  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };


  return (
    <div className="main-modal-overlay">
      {isLoading && (
      <div className="loading-overlay">
        <Lottie animationData={loadingAnimation} loop autoplay />
      </div>
    )}
      <div className="main-modal-content">
           
      <div>
          <div className='main-login-container'>
                <h2 className='main-login-title'>Log In</h2>
                <div className="loading-container">
         
              </div>

                <button onClick={handleGoogleSignUpOrLogin} className="main-login-auth-button">
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
              <button  className="main-login-close-modal-btn" onClick={handleGoBack}>
                Close
              </button>
              <div className="lottie-container">
          </div>
            </div>
        
          </div>
  );
};

export default LoginPage;
