import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCxaN6XhO6wU2bZQ1JBSR3Ad6sn-umT5lM",
    authDomain: "dxd-community-platform.firebaseapp.com",
    projectId: "dxd-community-platform",
    storageBucket: "dxd-community-platform.firebasestorage.app",
    messagingSenderId: "463283648311",
    appId: "1:463283648311:web:cf1bed8e2f1059bcd1ccb2",
    measurementId: "G-39GK5JZ982"
  };

  

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
