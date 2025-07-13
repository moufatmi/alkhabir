import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { User } from "firebase/auth";

export function useUserRole(user: User | null) {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getDoc(doc(db, "users", user.uid)).then((docSnap) => {
      if (docSnap.exists()) {
        const role = docSnap.data().role || "client";
        console.log("Fetched role for user", user.uid, ":", role);
        setRole(role);
      } else {
        console.log("No Firestore doc for user", user.uid, "- defaulting to client");
        setRole("client");
      }
      setLoading(false);
    });
  }, [user]);

  return { role, loading };
}
