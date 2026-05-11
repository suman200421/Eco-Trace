// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "oauth-project-2f99f.firebaseapp.com",
//   projectId: "oauth-project-2f99f",
//   storageBucket: "oauth-project-2f99f.appspot.com",
//   messagingSenderId: "548863333139",
//   appId: "YOUR_APP_ID",
// };

// const app = initializeApp(firebaseConfig);

// export const auth = getAuth(app);

/*------------------------------------------------------------------------------------*/

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBq1klPuRHlqARVPzikzynEXfumeaac7Hk",
  authDomain: "oauth-project-2f99f.firebaseapp.com",
  projectId: "oauth-project-2f99f",
  storageBucket: "oauth-project-2f99f.firebasestorage.app",
  messagingSenderId: "548863333139",
  appId: "1:548863333139:web:14fba40716ca0f2e5e00e6",
  measurementId: "G-T1P34HQZQE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);