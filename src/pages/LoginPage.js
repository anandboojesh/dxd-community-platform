import React, { useState } from "react";
import { auth } from "../services/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { FaGoogle, FaApple } from "react-icons/fa";
import { MdPhoneIphone } from "react-icons/md"; 
import { useNavigate } from "react-router-dom";
import "../styles/components/LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
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
          <button type="submit" className="submit-button">
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
