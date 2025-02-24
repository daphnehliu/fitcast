import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";

const SessionContext = createContext<{
  session: Session | null;
  setSession: (session: Session | null) => void;
  refreshSession: () => Promise<void>;
}>({
  session: null,
  setSession: () => {},
  refreshSession: async () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

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

  // refresh session and update global state
  async function refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    if (!error) {
      setSession(data.session);
    }
  }

  return (
    <SessionContext.Provider value={{ session, setSession, refreshSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
