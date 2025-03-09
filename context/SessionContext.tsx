import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";

const SessionContext = createContext<{
  session: Session | null;
  setSession: (session: Session | null) => void;
  refreshSession: () => Promise<void>;
  profile: any | null; // Store onboarding status
  setProfile: (profile: any | null) => void;
  loadingProfile: boolean; // Track profile loading state
}>({
  session: null,
  setSession: () => {},
  refreshSession: async () => {},
  profile: null,
  setProfile: () => {},
  loadingProfile: true,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    // Load initial session
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) {
        setLoadingProfile(false);
        setProfile(null);
        return;
      }

      try {
        setLoadingProfile(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .maybeSingle(); // ✅ Use maybeSingle() to avoid throwing an error when no row exists

        if (error) {
          console.error("SessionContext: Error fetching profile:", error);
          setProfile(null);
        } else if (!data) {
          // ✅ No profile found, treat as a new user who needs onboarding
          console.log(
            "SessionContext: No profile found for user, assuming new user."
          );
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error(
          "SessionContext: Unexpected error fetching profile:",
          err
        );
        setProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [session]);

  // refresh session and update global state
  async function refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    if (!error) {
      setSession(data.session);
    }
  }

  return (
    <SessionContext.Provider
      value={{
        session,
        setSession,
        refreshSession,
        profile,
        setProfile,
        loadingProfile,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
