import { db } from "./firebaseConfig";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  orderBy,
  limit,
  deleteDoc,
  getDocs
} from "firebase/firestore";

export const addNotification = async (toUid, fromName, type, message) => {
  try {
    await addDoc(collection(db, "notifications"), {
      toUid,
      fromName,
      type, // 'message', 'memory', 'date', etc.
      message,
      read: false,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.error("Error adding notification:", err);
  }
};

export const subscribeToNotifications = (uid, callback) => {
  const q = query(
    collection(db, "notifications"),
    where("toUid", "==", uid),
    limit(50)
  );
  return onSnapshot(q, (snaps) => {
    const data = snaps.docs.map(d => ({ id: d.id, ...d.data() }));
    // Client-side sort to avoid composite index requirement
    data.sort((a, b) => {
      const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
      const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
      return timeB - timeA;
    });
    callback(data.slice(0, 20));
  });
};

export const clearNotifications = async (uid) => {
  const q = query(collection(db, "notifications"), where("toUid", "==", uid));
  const snaps = await getDocs(q);
  snaps.forEach(async (d) => {
    await deleteDoc(d.ref);
  });
};
