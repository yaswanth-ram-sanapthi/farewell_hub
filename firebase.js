import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "farewell-hub.firebaseapp.com",
  projectId: "farewell-hub",
  storageBucket: "farewell-hub.firebasestorage.app",
  messagingSenderId: "133986400489",
  appId: "1:133986400489:web:7dd1537b112419e3375878"
};

const app = initializeApp(firebaseConfig);

export { app };