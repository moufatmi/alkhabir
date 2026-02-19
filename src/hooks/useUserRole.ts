import { useEffect, useState } from "react";
import { User } from "../services/auth";

export function useUserRole(user: User | null) {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // TODO: Fetch role from user preferences or database
        // For now, hardcode admin check or default to client
        if (user.email === 'moussab@alkhabir.com') { // Example admin email
          setRole("admin");
        } else {
          setRole("client");
        }
      } catch (error) {
        console.error("Failed to fetch role", error);
        setRole("client");
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return { role, loading };
}
