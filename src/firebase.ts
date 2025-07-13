   // src/firebase.ts
   import { initializeApp } from "firebase/app";
   import { getAuth } from "firebase/auth";
   import { getFirestore } from "firebase/firestore";

   const firebaseConfig = {
     apiKey: "AIzaSyAxQkV5lKuC_VHazuCLxiUzxhh0VpcZUd0",
     authDomain: "alkhabir-36099.firebaseapp.com",
     projectId: "alkhabir-36099",
     storageBucket: "alkhabir-36099.firebasestorage.app",
     messagingSenderId: "326122190172",
     appId: "1:326122190172:web:86ead99c5ef2ab0cbc7d99",
     measurementId: "G-DYCV987BE0"
   };

   const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const db = getFirestore(app);