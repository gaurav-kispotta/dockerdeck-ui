import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import App from './App.tsx'
import 'antd/dist/reset.css'
import './index.css'

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDqam6NKgdk6q_ES5PqHb_wovTH4wr7vsE",
  authDomain: "docker-deck.firebaseapp.com",
  projectId: "docker-deck",
  storageBucket: "docker-deck.firebasestorage.app",
  messagingSenderId: "282733946087",
  appId: "1:282733946087:web:31d4a5b5fda4e375266e42",
  measurementId: "G-3M0RTM3BBS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
analytics.app.automaticDataCollectionEnabled = true;

// Import analytics utilities
import { logAppInitialization, startMemoryMonitoring } from './utils/analytics';

logEvent(analytics, 'browser_device', {
  "browser_agent": navigator.userAgent
});

// Delay app initialization logging to ensure Firebase is fully ready
setTimeout(() => {
  logAppInitialization();
  // Start periodic memory monitoring (every 50 minutes)
  startMemoryMonitoring(50 * 60 * 1000); // 50 minutes in milliseconds
}, 1000);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
