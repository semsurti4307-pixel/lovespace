import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";

// Listen to auth state changes
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Helper to generate a random 6-char code
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Sign Up
export const signUp = async (email, password, name, partnerCode, gender) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name
    await updateProfile(user, { displayName: name });

    const myCode = generateCode();
    let pairedWith = null;

    // Create user profile in Firestore
    const userRef = doc(db, "users", user.uid);
    const userData = {
      uid: user.uid,
      name,
      email,
      gender: gender || "male",
      myCode, // This is the code others use to link with me
      partnerCode: partnerCode?.toUpperCase() || null,
      pairedWith: null,
      togetherSince: new Date().toISOString().split('T')[0], // Default to today
      mood: "🥰",
      createdAt: new Date().toISOString()
    };

    await setDoc(userRef, userData);

    // If a partner code was provided, try to link
    if (partnerCode) {
      const q = query(collection(db, "users"), where("myCode", "==", partnerCode.toUpperCase()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const partnerDoc = querySnapshot.docs[0];
        const partnerData = partnerDoc.data();
        
        if (!partnerData.pairedWith) {
          // Both users are free, let's link them
          await updateDoc(userRef, { pairedWith: partnerDoc.id });
          await updateDoc(partnerDoc.ref, { pairedWith: user.uid });
        }
      }
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Link Partner by Code (Post-signup)
export const linkPartner = async (myUid, partnerCode) => {
  try {
    const q = query(collection(db, "users"), where("myCode", "==", partnerCode.toUpperCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return { success: false, error: "Code not found!" };
    
    const partnerDoc = querySnapshot.docs[0];
    const partnerData = partnerDoc.data();
    
    if (partnerData.pairedWith) return { success: false, error: "Partner already paired!" };
    if (partnerDoc.id === myUid) return { success: false, error: "You cannot pair with yourself!" };

    await updateDoc(doc(db, "users", myUid), { pairedWith: partnerDoc.id });
    await updateDoc(partnerDoc.ref, { pairedWith: myUid });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Login
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Logout
export const logout = async () => {
  try {
    if (auth.currentUser) {
      await updateDoc(doc(db, "users", auth.currentUser.uid), { isOnline: false, lastSeen: new Date().toISOString() });
    }
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const setUserStatus = async (uid, isOnline) => {
  try {
    await updateDoc(doc(db, "users", uid), { 
      isOnline, 
      lastSeen: new Date().toISOString() 
    });
  } catch (err) {
    console.error("Error setting user status:", err);
  }
};

export const unlinkPartner = async (uid, partnerUid) => {
  try {
    await updateDoc(doc(db, "users", uid), { pairedWith: null });
    await updateDoc(doc(db, "users", partnerUid), { pairedWith: null });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// Reset Password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
