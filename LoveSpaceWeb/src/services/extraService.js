import { db } from "./firebaseConfig";
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  serverTimestamp,
  updateDoc,
  doc,
  deleteDoc,
  setDoc
} from "firebase/firestore";

const getCoupleId = (uid1, uid2) => [uid1, uid2].sort().join("_");

// --- DATES / BUCKET LIST ---
export const addDateIdea = async (uid1, uid2, text) => {
  const coupleId = getCoupleId(uid1, uid2);
  await addDoc(collection(db, "chats", coupleId, "dates"), {
    text,
    completed: false,
    timestamp: serverTimestamp()
  });
};

export const subscribeToDates = (uid1, uid2, callback) => {
  const coupleId = getCoupleId(uid1, uid2);
  const q = query(collection(db, "chats", coupleId, "dates"));
  return onSnapshot(q, (snaps) => {
    callback(snaps.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

export const toggleDateStatus = async (uid1, uid2, dateId, currentStatus) => {
  const coupleId = getCoupleId(uid1, uid2);
  await updateDoc(doc(db, "chats", coupleId, "dates", dateId), {
    completed: !currentStatus
  });
};

// --- TIME CAPSULE ---
export const addCapsule = async (uid1, uid2, data) => {
  const coupleId = getCoupleId(uid1, uid2);
  await addDoc(collection(db, "chats", coupleId, "capsules"), {
    ...data,
    timestamp: serverTimestamp()
  });
};

export const subscribeToCapsules = (uid1, uid2, callback) => {
  const coupleId = getCoupleId(uid1, uid2);
  const q = query(collection(db, "chats", coupleId, "capsules"));
  return onSnapshot(q, (snaps) => {
    callback(snaps.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

// --- GAMES (DARE WHEEL & QUIZ) ---
export const syncGameAction = async (uid1, uid2, actionType, data) => {
  const coupleId = getCoupleId(uid1, uid2);
  await setDoc(doc(db, "chats", coupleId, "gameState", actionType), {
    ...data,
    timestamp: serverTimestamp()
  });
};

export const subscribeToGameState = (uid1, uid2, callback) => {
  const coupleId = getCoupleId(uid1, uid2);
  return onSnapshot(collection(db, "chats", coupleId, "gameState"), (snaps) => {
    const state = {};
    snaps.forEach(d => { state[d.id] = d.data(); });
    callback(state);
  });
};
