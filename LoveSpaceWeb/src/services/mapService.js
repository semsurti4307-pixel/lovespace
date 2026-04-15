import { db } from "./firebaseConfig";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";

export const addMapMemory = async (uid1, uid2, location) => {
  const coupleId = [uid1, uid2].sort().join("_");
  await addDoc(collection(db, "chats", coupleId, "locations"), {
    ...location,
    timestamp: serverTimestamp()
  });
};

export const subscribeToMapMemories = (uid1, uid2, callback) => {
  const coupleId = [uid1, uid2].sort().join("_");
  const q = query(
    collection(db, "chats", coupleId, "locations"),
    orderBy("timestamp", "desc")
  );
  return onSnapshot(q, (snaps) => {
    callback(snaps.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};
