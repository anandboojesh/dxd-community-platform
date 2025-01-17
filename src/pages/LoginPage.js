import React, { useState } from "react";
import { auth, db } from "../services/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { FaGoogle, FaApple } from "react-icons/fa";
import { MdPhoneIphone } from "react-icons/md"; 
import { useNavigate } from "react-router-dom";
import "../styles/components/LoginPage.css";
import { addDoc, collection, doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const updateProfileStatus = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid); // Reference to the user's document
      await updateDoc(userDocRef, { profileStatus: "online" }); // Update the profileStatus
    } catch (err) {
      console.error("Error updating profile status:", err);
      alert("Error while updating status")
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

      navigate("/profile");
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
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    }
  };



  return (
    <div className="login-modal">
      <div className="login-content">
        <h2>Log In</h2>

        <button onClick={handleGoogleLogin} className="auth-button google">
        <FaGoogle size={20} />  Continue with Google <p></p>
        </button>

        <div className="divider">
          <span>OR</span>
        </div>

        {error && <p className="error">{error}</p>}
        <form onSubmit={handleEmailPasswordLogin}>
          <div className="login-input-group">
            <label htmlFor="email">Email or Username</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Log In
          </button>
        </form>

        <div className="footer-links">
          <a href="/forgot-password" className="forgot-password">
            Forgot Password?
          </a>
          <p>
            New to the platform? <a href="/signup">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
