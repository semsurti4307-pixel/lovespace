import { db } from "./firebaseConfig";
import { doc, onSnapshot, updateDoc, setDoc, deleteDoc, serverTimestamp, collection, addDoc, getDocs } from "firebase/firestore";

export const subscribeToHeartSync = (coupleId, callback) => {
  const syncRef = doc(db, "chats", coupleId, "sync", "heart");
  return onSnapshot(syncRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    } else {
      // Initialize if not exists
      setDoc(syncRef, { status: "idle", timestamp: serverTimestamp() });
    }
  });
};

export const updateHeartTouch = async (coupleId, uid, isTouching) => {
  const syncRef = doc(db, "chats", coupleId, "sync", "heart");
  await updateDoc(syncRef, {
    [uid]: isTouching,
    timestamp: serverTimestamp()
  });
};
export const subscribeToTogetherMode = (coupleId, callback) => {
  const modeRef = doc(db, "chats", coupleId, "sync", "together");
  return onSnapshot(modeRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    } else {
      setDoc(modeRef, { mode: "hub", state: {}, lastAction: null, timestamp: serverTimestamp() });
    }
  });
};

export const updateTogetherState = async (coupleId, data) => {
  const modeRef = doc(db, "chats", coupleId, "sync", "together");
  await setDoc(modeRef, { 
    ...data, 
    timestamp: serverTimestamp() 
  }, { merge: true });
};

/* ─── WebRTC Video Call Signaling via Firebase ─── */
export const subscribeToCallSignal = (coupleId, callback) => {
  const callRef = doc(db, "chats", coupleId, "sync", "videocall");
  return onSnapshot(callRef, (snap) => {
    if (snap.exists()) callback(snap.data());
  });
};

export const sendCallSignal = async (coupleId, data) => {
  const callRef = doc(db, "chats", coupleId, "sync", "videocall");
  await setDoc(callRef, { ...data, timestamp: serverTimestamp() }, { merge: true });
};

export const clearCallSignal = async (coupleId) => {
  const callRef = doc(db, "chats", coupleId, "sync", "videocall");
  try { await deleteDoc(callRef); } catch(e) { console.log("clear call:", e); }
};

export const addIceCandidate = async (coupleId, uid, candidate) => {
  const iceRef = collection(db, "chats", coupleId, "sync", "videocall", `ice_${uid}`);
  await addDoc(iceRef, { candidate: candidate.toJSON(), timestamp: serverTimestamp() });
};

export const subscribeToIceCandidates = (coupleId, partnerUid, callback) => {
  const iceRef = collection(db, "chats", coupleId, "sync", "videocall", `ice_${partnerUid}`);
  return onSnapshot(iceRef, (snap) => {
    snap.docChanges().forEach(change => {
      if (change.type === "added") {
        callback(change.doc.data().candidate);
      }
    });
  });
};
