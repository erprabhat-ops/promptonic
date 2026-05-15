import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";

export const fsGet = async (key) => {
  try {
    const s = await getDoc(doc(db, "store", key));
    return s.exists() ? s.data().value : null;
  } catch (e) {
    console.warn("fsGet failed:", key, e?.message);
    return null;
  }
};

export const fsSet = async (key, value) => {
  try {
    await setDoc(doc(db, "store", key), { value });
  } catch (e) {
    console.warn("fsSet failed:", key, e?.message);
  }
};
