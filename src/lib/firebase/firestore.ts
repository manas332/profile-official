import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "./config";
import { User } from "@/types/auth";

const USERS_COLLECTION = "users";
const OTP_COLLECTION = "otp_codes";

export async function createUser(userData: User): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userData.id);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error("Error creating user in Firestore:", error);
    if (error.code === "failed-precondition" || error.message?.includes("offline")) {
      throw new Error("Firestore is not enabled. Please enable it in Firebase Console: https://console.firebase.google.com/project/_/firestore");
    }
    throw error;
  }
}

export async function getUser(userId: string): Promise<User | null> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as User;
    }
    return null;
  } catch (error: any) {
    console.error("Error getting user from Firestore:", error);
    // If Firestore is not enabled, return null (user doesn't exist)
    if (error.code === "failed-precondition" || error.message?.includes("offline")) {
      console.error("⚠️ Firestore may not be enabled. Please enable it in Firebase Console.");
      return null;
    }
    throw error;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as User;
  }
  return null;
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function saveOTP(
  email: string,
  otp: string,
  expiresAt: Date,
  purpose: "signup" | "login"
): Promise<void> {
  try {
    const otpRef = doc(db, OTP_COLLECTION, email);
    await setDoc(otpRef, {
      otp,
      expiresAt,
      purpose,
      createdAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error("Error saving OTP:", error);
    if (error.code === "failed-precondition" || error.message?.includes("offline")) {
      throw new Error("Firestore is not enabled. Please enable it in Firebase Console.");
    }
    throw error;
  }
}

export async function verifyOTP(
  email: string,
  otp: string
): Promise<{ valid: boolean; purpose?: "signup" | "login" }> {
  try {
    const otpRef = doc(db, OTP_COLLECTION, email);
    const otpSnap = await getDoc(otpRef);
    
    if (!otpSnap.exists()) {
      console.error("OTP not found for email:", email);
      return { valid: false };
    }
    
    const data = otpSnap.data();
    const expiresAt = data.expiresAt?.toDate();
    
    if (!expiresAt || expiresAt < new Date()) {
      console.error("OTP expired for email:", email);
      return { valid: false };
    }
    
    if (data.otp !== otp) {
      console.error("OTP mismatch for email:", email);
      return { valid: false };
    }
    
    return { valid: true, purpose: data.purpose };
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    if (error.code === "failed-precondition" || error.message?.includes("offline")) {
      throw new Error("Firestore is not enabled. Please enable it in Firebase Console.");
    }
    throw error;
  }
}

export async function deleteOTP(email: string): Promise<void> {
  const otpRef = doc(db, OTP_COLLECTION, email);
  await setDoc(otpRef, {}, { merge: false });
}
