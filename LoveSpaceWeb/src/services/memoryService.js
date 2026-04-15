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

// Shared Memories Collection
export const addMemory = async (uid1, uid2, data) => {
  const chatId = [uid1, uid2].sort().join("_");
  await addDoc(collection(db, "chats", chatId, "memories"), {
    ...data,
    timestamp: serverTimestamp()
  });

  // Track who is the partner
  const partnerUid = data.authorUid === uid1 ? uid2 : uid1;
  await addNotification(partnerUid, data.authorName || "Partner", "memory", "Shared a new memory: " + data.caption);
};

// Listen for Memories
export const subscribeToMemories = (uid1, uid2, callback) => {
  const chatId = [uid1, uid2].sort().join("_");
  const q = query(
    collection(db, "chats", chatId, "memories"),
    orderBy("timestamp", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
};

// Upload to Cloudinary (Unsigned)
export const uploadToCloudinary = async (file) => {
  const cloudName = "dnxrw4vxa"; 
  const uploadPreset = "lovespace_preset"; 
  
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || "Cloudinary Upload Failed");
    }

    const data = await res.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary Error Log:", error);
    alert("Cloudinary Error: " + error.message);
    return null;
  }
};

// Delete Memory
export const deleteMemory = async (uid1, uid2, memoryId) => {
  const chatId = [uid1, uid2].sort().join("_");
  await deleteDoc(doc(db, "chats", chatId, "memories", memoryId));
};
