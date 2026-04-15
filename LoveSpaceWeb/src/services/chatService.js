import { db } from "./firebaseConfig";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  deleteDoc
} from "firebase/firestore";

import { addNotification } from "./notificationService";

// Get Chat ID (sorted string of both UIDs)
const getChatId = (uid1, uid2) => {
  return [uid1, uid2].sort().join("_");
};

// Send Message
export const sendMessage = async (myUid, partnerUid, text, myName) => {
  if (!text.trim() || !partnerUid) return;
  
  const chatId = getChatId(myUid, partnerUid);
  await addDoc(collection(db, "chats", chatId, "messages"), {
    senderId: myUid,
    text,
    timestamp: serverTimestamp()
  });

  // Trigger Notification
  await addNotification(partnerUid, myName || "Partner", "message", text);
};

// Listen to Messages
export const subscribeToMessages = (myUid, partnerUid, callback) => {
  if (!partnerUid) return () => {};
  
  const chatId = getChatId(myUid, partnerUid);
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("timestamp", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(msgs);
  });
};

// Delete Message
export const deleteMessage = async (myUid, partnerUid, msgId) => {
  if (!partnerUid || !msgId) return;
  const chatId = getChatId(myUid, partnerUid);
  await deleteDoc(doc(db, "chats", chatId, "messages", msgId));
};
