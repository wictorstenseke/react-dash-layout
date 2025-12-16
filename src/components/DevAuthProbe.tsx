import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { listGroups } from "@/features/groups/groupsRepo";

/**
 * Development-only component for testing Firebase Auth and Firestore
 * Logs auth state changes and tests Firestore read operations
 */
export function DevAuthProbe() {
  const { user, loading } = useAuth();
  const [groupsCount, setGroupsCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      console.log("🔐 Auth state: No user signed in");
      setGroupsCount(null);
      setError(null);
      return;
    }

    console.log("🔐 Auth state changed:", {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
    });

    // Test Firestore read when user is authenticated
    async function testFirestoreRead() {
      if (!user) return;

      try {
        const groups = await listGroups(user.uid);
        setGroupsCount(groups.length);
        setError(null);
        console.log("📦 Firestore test: Successfully read groups", {
          count: groups.length,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("📦 Firestore test: Failed to read groups", err);
      }
    }

    testFirestoreRead();
  }, [user]);

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        padding: "12px 16px",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        color: "#fff",
        borderRadius: "8px",
        fontSize: "12px",
        fontFamily: "monospace",
        maxWidth: "300px",
        zIndex: 9999,
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
        🔧 Dev Auth Probe
      </div>
      {loading ? (
        <div>Loading auth state...</div>
      ) : user ? (
        <>
          <div style={{ marginBottom: "4px" }}>
            ✅ User: {user.email || user.uid.substring(0, 8)}
          </div>
          <div style={{ marginBottom: "4px" }}>
            📊 Groups:{" "}
            {groupsCount !== null
              ? groupsCount
              : error
                ? "❌ Error"
                : "Loading..."}
          </div>
          {error && (
            <div style={{ color: "#ff6b6b", fontSize: "11px" }}>{error}</div>
          )}
        </>
      ) : (
        <div>❌ No user signed in</div>
      )}
    </div>
  );
}
