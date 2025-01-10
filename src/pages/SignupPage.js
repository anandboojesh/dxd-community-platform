import React, { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import "../styles/components/SignupPage.css";
import { collection, getDocs, query, where, setDoc, doc, serverTimestamp } from "firebase/firestore";

// Helper functions for validation
const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);
const validatePassword = (password) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@#$%^&+=!]{8,}$/.test(password);


const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [Phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [suggestedUsernames, setSuggestedUsernames] = useState([]);
  const [date, setDate] = useState("01");
  const [month, setMonth] = useState("01");
  const [year, setYear] = useState("2000");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Function to suggest usernames based on display name
  const generateUsernameSuggestions = (name) => {
    const suggestions = [];
    if (name) {
      suggestions.push(name.toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 1000));
      suggestions.push(name.toLowerCase().slice(0, 5) + Math.floor(Math.random() * 10000));
      suggestions.push(name.toLowerCase().replace(/\s+/g, "_") + "_user");
      setSuggestedUsernames(suggestions);
    } else {
      setSuggestedUsernames([]);
    }
  };

  useEffect(() => {
    generateUsernameSuggestions(name);
  }, [name]);

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        await setDoc(doc(usersRef, user.uid), {
          name: user.displayName || "No name",
          email: user.email,
          username: user.email.split('@')[0],
          dateOfBirth: "",
          signUpDate: serverTimestamp(),
          role: "Member",
          uid: user.uid
        });
      }
  
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Validation: Check for empty fields
    if (!name || !email || !Phone || !password || !confirmPassword || !username) {
      setError("All fields are required.");
      return;
    }

    // Additional validation checks
    if (!validateEmail(email)) {
      setError("Invalid email format.");
      return;
    }

    if (!validatePhone(Phone)) {
      setError("Phone number must be 10 digits.");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters long and contain a letter and a number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const usersRef = collection(db, "users");
      await setDoc(doc(usersRef, user.uid), {
        name,
        email,
        username,
        dateOfBirth: `${year}-${month}-${date}`,
        signUpDate: serverTimestamp(),
        role: "Member",
        Phone,
        uid: user.uid,
      });
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    }
  };

  const checkUsernameAvailability = async (username) => {
    if (!username) return;

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError(null); // No user found, username is available
      } else {
        setError("Username is already taken");
      }
    } catch (err) {
      console.error("Error checking username availability:", err);
      setError("An error occurred while checking the username");
    }
  };

  useEffect(() => {
    if (username) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(username);
      }, 500); // Debounce
      return () => clearTimeout(timeoutId);
    }
  }, [username]);

  return (
    <div className="signup-container">
      <div className="signup-content">
        <h2>Sign Up</h2>

        <button onClick={handleGoogleSignUp} className="auth-button google">
          <FaGoogle size={20} /> Sign Up with Google
        </button>
        <div className="divider">
          <span>OR</span>
        </div>

        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSignUp}>
          <div className="signup-input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="signup-input-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="text"
              id="phone"
              value={Phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="signup-input-group">
            <label htmlFor="name">Display Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="signup-input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              list="username-suggestions"
              required
            />
            <datalist id="username-suggestions">
              {suggestedUsernames.map((suggestion, index) => (
                <option key={index} value={suggestion} />
              ))}
            </datalist>
          </div>

          <div className="signup-input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="signup-input-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="dob-group">
            <label htmlFor="date-of-birth">Date of Birth</label>
            <div className="dob-selectors">
              <select value={date} onChange={(e) => setDate(e.target.value)} required>
                {[...Array(31).keys()].map(i => (
                  <option key={i} value={String(i + 1).padStart(2, "0")}>{i + 1}</option>
                ))}
              </select>
              <select value={month} onChange={(e) => setMonth(e.target.value)} required>
                {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select value={year} onChange={(e) => setYear(e.target.value)} required>
                {[...Array(100).keys()].map(i => (
                  <option key={i} value={String(2025 - i)}>{2025 - i}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="submit-button">
            Sign Up
          </button>
        </form>

        <div className="footer-links">
          <p>Already have an account? <a href="/login">Log In</a></p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
